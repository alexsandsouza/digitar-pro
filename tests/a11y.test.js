'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp, closeAll, html } = require('./helpers');

test.afterEach(closeAll);

function openModuleSummary(app) {
  for (const index of [0, 1, 2]) {
    app.clickSelector(`.lesson[data-i="${index}"]`);
    app.completeCurrent({ elapsedMs: 20_000 });
  }
  assert.equal(app.summaryOpen(), true);
}

test('modal tem semântica de diálogo e rótulos', () => {
  const app = createApp();
  const dialog = app.get('moduleSummary');

  assert.equal(dialog.getAttribute('role'), 'dialog');
  assert.equal(dialog.getAttribute('aria-modal'), 'true');
  assert.equal(dialog.getAttribute('aria-labelledby'), 'summaryTitle');
  assert.equal(app.doc.querySelector('label[for="typing"]').textContent, 'DIGITE O TEXTO ACIMA');
  assert.equal(app.get('message').getAttribute('aria-live'), 'polite');
});

test('Escape fecha o resumo, restaura foco e não avança', () => {
  const app = createApp();
  openModuleSummary(app);

  const event = app.escape(app.doc);

  assert.equal(event.defaultPrevented, true);
  assert.equal(app.summaryOpen(), false);
  assert.equal(app.activeLessonIndex(), 2);
  assert.equal(app.doc.activeElement.id, 'nextLesson');
  assert.equal(app.doc.querySelector('.wrap').hasAttribute('inert'), false);
  assert.equal(app.doc.body.classList.contains('modal-open'), false);

  app.enter(app.get('typing'));
  assert.equal(app.activeLessonIndex(), 3);
});

test('fundo fica inert enquanto o resumo está aberto', () => {
  const app = createApp();
  openModuleSummary(app);

  assert.equal(app.doc.querySelector('.wrap').hasAttribute('inert'), true);
  assert.equal(app.doc.body.classList.contains('modal-open'), true);
});

test('Tab circula apenas entre os botões do resumo', () => {
  const app = createApp();
  openModuleSummary(app);

  assert.equal(app.doc.activeElement.id, 'continueModule');

  const forward = app.tab(false, app.doc.activeElement);
  assert.equal(forward.defaultPrevented, true);
  assert.equal(app.doc.activeElement.id, 'repeatModule');

  const backward = app.tab(true, app.doc.activeElement);
  assert.equal(backward.defaultPrevented, true);
  assert.equal(app.doc.activeElement.id, 'continueModule');
});

test('Tab a partir de fora do cartão entra no primeiro controle do resumo', () => {
  const app = createApp();
  openModuleSummary(app);
  app.doc.body.focus();

  const event = app.tab(false, app.doc.body);

  assert.equal(event.defaultPrevented, true);
  assert.equal(app.doc.activeElement.id, 'repeatModule');
});

test('Tab fora do modal não é interceptado', () => {
  const app = createApp();
  const event = app.tab(false, app.get('typing'));

  assert.equal(event.defaultPrevented, false);
  assert.equal(app.summaryOpen(), false);
});

test('Continuar remove inert e avança uma única lição', () => {
  const app = createApp();
  openModuleSummary(app);

  app.clickId('continueModule');

  assert.equal(app.summaryOpen(), false);
  assert.equal(app.activeLessonIndex(), 3);
  assert.equal(app.doc.querySelector('.wrap').hasAttribute('inert'), false);
  assert.equal(app.doc.body.classList.contains('modal-open'), false);
});

test('CSS cobre foco visível e movimento reduzido', () => {
  assert.match(html, /:focus-visible/);
  assert.match(html, /prefers-reduced-motion:reduce/);
  assert.match(html, /body\.modal-open\{overflow:hidden\}/);
});
