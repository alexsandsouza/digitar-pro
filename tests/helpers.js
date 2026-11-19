'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { JSDOM, VirtualConsole } = require('jsdom');

const htmlPath = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const openApps = [];

function createApp(options = {}) {
  let now = options.now ?? 1_000_000;
  const consoleErrors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', (error) => consoleErrors.push(error.message));
  virtualConsole.on('error', (...args) => consoleErrors.push(args.join(' ')));

  const dom = new JSDOM(html, {
    url: 'http://localhost/',
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    virtualConsole,
    beforeParse(window) {
      window.Date.now = () => now;
      window.setInterval = () => 0;
      window.clearInterval = () => {};
      window.confirm = () => options.confirm ?? true;
      if (options.progress !== undefined) {
        const raw = typeof options.progress === 'string'
          ? options.progress
          : JSON.stringify(options.progress);
        window.localStorage.setItem('ad-typing-mvp-v1', raw);
      }
      if (options.mode) {
        window.localStorage.setItem('digitar-pro-typing-mode', options.mode);
      }
      if (options.lesson !== undefined) {
        window.localStorage.setItem('digitar-pro-current-lesson', String(options.lesson));
      }
    },
  });

  openApps.push(dom);
  const { window } = dom;
  const doc = window.document;
  const textarea = () => doc.getElementById('typing');

  const api = {
    dom,
    window,
    doc,
    consoleErrors,
    get: (id) => doc.getElementById(id),
    text: (id) => doc.getElementById(id).textContent,
    advanceTime(ms) {
      now += ms;
    },
    now() {
      return now;
    },
    expected() {
      return doc.getElementById('prompt').textContent;
    },
    type(value) {
      const input = textarea();
      input.value = value;
      input.dispatchEvent(new window.Event('input', { bubbles: true }));
    },
    enter(target = textarea(), init = {}) {
      const event = new window.KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true,
        ...init,
      });
      target.dispatchEvent(event);
      return event;
    },
    escape(target = doc) {
      const event = new window.KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      });
      target.dispatchEvent(event);
      return event;
    },
    tab(shiftKey = false, target = doc.activeElement || doc.body) {
      const event = new window.KeyboardEvent('keydown', {
        key: 'Tab',
        shiftKey,
        bubbles: true,
        cancelable: true,
      });
      target.dispatchEvent(event);
      return event;
    },
    clickId(id) {
      doc.getElementById(id).click();
    },
    clickSelector(selector) {
      const element = doc.querySelector(selector);
      if (!element) throw new Error(`Elemento não encontrado: ${selector}`);
      element.click();
      return element;
    },
    selectMode(mode) {
      this.clickSelector(`input[name="typingMode"][value="${mode}"]`);
    },
    activeLessonIndex() {
      const active = doc.querySelector('.lesson.active');
      return active ? Number(active.dataset.i) : -1;
    },
    lessonTitle() {
      return doc.getElementById('lessonTitle').textContent;
    },
    completedLabel() {
      return doc.getElementById('completedLabel').textContent;
    },
    storedRaw() {
      return window.localStorage.getItem('ad-typing-mvp-v1');
    },
    stored() {
      return JSON.parse(window.localStorage.getItem('ad-typing-mvp-v1') || 'null');
    },
    summaryOpen() {
      return !doc.getElementById('moduleSummary').hidden;
    },
    completeCurrent({ elapsedMs = 30_000, wrong = false } = {}) {
      const expected = this.expected();
      const first = expected.slice(0, 1);
      this.type(first);
      this.advanceTime(elapsedMs);
      const typed = wrong
        ? (expected[0] === '#' ? '?' : '#') + expected.slice(1)
        : expected;
      this.type(typed);
      return { expected, typed, elapsedMs };
    },
    close() {
      window.close();
    },
  };

  return api;
}

function closeAll() {
  while (openApps.length) {
    const dom = openApps.pop();
    try {
      dom.window.close();
    } catch {
      // jsdom pode já ter sido fechado pelo próprio teste.
    }
  }
}

function dispatchRequest(handler, path, options = {}) {
  const { Readable } = require('node:stream');
  return new Promise((resolve, reject) => {
    const method = options.method || 'GET';
    const body = options.body;
    const headers = {};
    if (options.headers) {
      for (const [k, v] of Object.entries(options.headers)) {
        headers[k.toLowerCase()] = v;
      }
    }

    const req = new Readable({
      read() {
        if (body) {
          this.push(typeof body === 'string' ? body : JSON.stringify(body));
        }
        this.push(null);
      },
    });
    req.method = method;
    req.url = path;
    req.headers = headers;

    let statusCode = 200;
    const resHeaders = {};
    const chunks = [];

    const res = {
      writeHead(code, hdrs = {}) {
        statusCode = code;
        for (const [k, v] of Object.entries(hdrs)) {
          resHeaders[k.toLowerCase()] = v;
        }
        return this;
      },
      setHeader(k, v) {
        resHeaders[k.toLowerCase()] = v;
      },
      getHeader(k) {
        return resHeaders[k.toLowerCase()];
      },
      end(chunk) {
        if (chunk) chunks.push(Buffer.from(chunk));
        const textBody = Buffer.concat(chunks).toString('utf8');
        resolve({
          status: statusCode,
          headers: {
            get(name) {
              return resHeaders[name.toLowerCase()] || null;
            },
          },
          async json() {
            return JSON.parse(textBody);
          },
          async text() {
            return textBody;
          },
        });
      },
    };

    handler(req, res).catch(reject);
  });
}

function startTestServer(store) {
  const { createAppHandler } = require('../server/app');
  const handler = createAppHandler({ store });
  const baseUrl = `http://local-test-${Math.random().toString(36).slice(2)}`;
  const prevFetch = globalThis.fetch;

  globalThis.fetch = async (input, init = {}) => {
    const urlStr = typeof input === 'string' ? input : input.url;
    if (urlStr.startsWith(baseUrl)) {
      const parsed = new URL(urlStr);
      return dispatchRequest(handler, parsed.pathname + parsed.search, init);
    }
    return prevFetch(input, init);
  };

  return {
    baseUrl,
    close: async () => {
      globalThis.fetch = prevFetch;
    },
  };
}

module.exports = { createApp, closeAll, startTestServer, dispatchRequest, html, htmlPath };
