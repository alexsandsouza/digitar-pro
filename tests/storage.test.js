'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp, closeAll, html } = require('./helpers');

test.afterEach(closeAll);

const legacyRecord = { wpm: 47, accuracy: 98, last: { wpm: 47, accuracy: 98, seconds: 24.4 } };

test('fixture legada é carregada e exibida sem perda', () => {
  const app = createApp({ progress: { 0: legacyRecord } });

  assert.equal(app.completedLabel(), '1 / 12');
  assert.equal(app.doc.querySelector('.lesson[data-i="0"]').classList.contains('done'), true);
  assert.equal(app.get('best').textContent, '47 PPM');

  app.clickSelector('.lesson[data-i="0"]');
  assert.equal(app.lessonTitle(), 'Teclas de referência');
  assert.equal(app.get('best').textContent, '47 PPM');
  assert.deepEqual(app.stored(), { 0: legacyRecord });
});

test('registro sem last conta como concluído mas não inventa médias', () => {
  const app = createApp({ progress: { 4: { wpm: 35, accuracy: 90 } } });

  assert.equal(app.completedLabel(), '1 / 12');
  assert.equal(app.doc.querySelector('.lesson[data-i="4"]').classList.contains('done'), true);
  app.clickSelector('.lesson[data-i="4"]');
  assert.equal(app.get('best').textContent, '35 PPM');
  assert.equal(app.summaryOpen(), false);
});

test('JSON corrompido não derruba o app nem sobrescreve o valor lido', () => {
  const app = createApp({ progress: '{broken' });

  assert.equal(app.completedLabel(), '0 / 12');
  assert.equal(app.lessonTitle(), 'Teclas de referência');
  assert.equal(app.storedRaw(), '{broken');
  assert.deepEqual(app.consoleErrors, []);
});

test('JSON válido com array vazio não vira progresso', () => {
  const app = createApp({ progress: '[]' });

  assert.equal(app.completedLabel(), '0 / 12');
  assert.equal(app.lessonTitle(), 'Teclas de referência');
});

test('JSON válido com null não vira progresso', () => {
  const app = createApp({ progress: 'null' });

  assert.equal(app.completedLabel(), '0 / 12');
  assert.equal(app.lessonTitle(), 'Teclas de referência');
});

test('resultado concluído sobrevive a uma nova carga', () => {
  const first = createApp();
  first.completeCurrent();
  const stored = first.stored();

  const second = createApp({ progress: stored });

  assert.equal(second.completedLabel(), '1 / 12');
  assert.equal(second.get('best').textContent, `${stored['0'].wpm} PPM`);
  assert.deepEqual(second.stored(), stored);
});

test('chaves e formato do storage são preservados', () => {
  assert.match(html, /const storageKey='ad-typing-mvp-v1'/);
  assert.match(html, /const modeKey='digitar-pro-typing-mode'/);
  assert.match(html, /progress\[current\]=\{wpm:/);
  assert.match(html, /last:\{wpm:/);
});

test('preferência de modo é persistida sem alterar resultados', () => {
  const app = createApp({ progress: { 0: legacyRecord } });

  app.selectMode('precision');

  assert.equal(app.window.localStorage.getItem('digitar-pro-typing-mode'), 'precision');
  assert.deepEqual(app.stored(), { 0: legacyRecord });
});

test('limpar progresso com confirmação apaga registros e preferência fica intacta', () => {
  const app = createApp({ progress: { 0: legacyRecord }, mode: 'precision' });

  app.clickId('clearProgress');

  assert.equal(app.completedLabel(), '0 / 12');
  assert.deepEqual(app.stored(), {});
  assert.equal(app.window.localStorage.getItem('digitar-pro-typing-mode'), 'precision');
});

test('limpar progresso cancelado não apaga registros', () => {
  const app = createApp({ progress: { 0: legacyRecord }, confirm: false });

  app.clickId('clearProgress');

  assert.equal(app.completedLabel(), '1 / 12');
  assert.deepEqual(app.stored(), { 0: legacyRecord });
});
