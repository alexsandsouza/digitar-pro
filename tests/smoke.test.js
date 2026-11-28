'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp, closeAll } = require('./helpers');

test.afterEach(closeAll);

test('carrega o app real e a lição inicial', () => {
  const app = createApp();
  assert.equal(app.lessonTitle(), 'Ergonomia e posição · Introdução guiada');
  assert.equal(app.completedLabel(), '0 / 120');
  assert.equal(app.doc.querySelectorAll('.lesson').length, 5);
  assert.equal(app.get('accuracy').textContent, '100%');
  assert.equal(app.get('wpm').textContent.trim(), '0 PPM');
  assert.ok(app.expected().length > 0);
  assert.deepEqual(app.consoleErrors, []);
});
