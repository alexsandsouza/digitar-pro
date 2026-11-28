'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp, closeAll } = require('./helpers');

test.afterEach(closeAll);

const record = (wpm, accuracy, seconds = 20) => ({
  wpm,
  accuracy,
  last: { wpm, accuracy, seconds },
});

function dashboard(app) {
  return {
    lessons: app.text('dashLessons'),
    best: app.text('dashBest'),
    accuracy: app.text('dashAccuracy'),
    awards: app.text('dashAwards'),
  };
}

test('dashboard vazio não inventa valores', () => {
  const app = createApp();

  assert.deepEqual(dashboard(app), {
    lessons: '0 / 120',
    best: '0 PPM',
    accuracy: '—',
    awards: '0 / 24',
  });
});

test('dashboard deriva lições, recorde e média apenas de registros válidos', () => {
  const app = createApp({ progress: {
    0: record(40, 98),
    1: record(50, 100),
    4: { wpm: 60, accuracy: 90 },
  } });

  assert.deepEqual(dashboard(app), {
    lessons: '3 / 120',
    best: '60 PPM',
    accuracy: '99%',
    awards: '0 / 24',
  });
});

test('dashboard conta módulo completo uma única vez', () => {
  const app = createApp({ progress: {
    0: record(40, 98), 1: record(42, 100), 2: record(44, 96), 3: record(42, 98), 4: record(42, 98),
  } });

  assert.deepEqual(dashboard(app), {
    lessons: '5 / 120',
    best: '44 PPM',
    accuracy: '98%',
    awards: '1 / 24',
  });
});

test('dashboard atualiza após concluir uma lição', () => {
  const app = createApp();

  app.completeCurrent();
  const stored = app.stored()['0'];

  assert.equal(app.text('dashLessons'), '1 / 120');
  assert.equal(app.text('dashBest'), `${stored.wpm} PPM`);
  assert.equal(app.text('dashAccuracy'), `${stored.accuracy}%`);
});

test('recorde do dashboard usa o melhor wpm, não o último', () => {
  const app = createApp({ progress: {
    0: { wpm: 50, accuracy: 90, last: { wpm: 10, accuracy: 90, seconds: 5 } },
  } });

  assert.equal(app.text('dashBest'), '50 PPM');
});

test('rótulo da precisão média descreve a média por lição', () => {
  const app = createApp();
  const meta = app.get('dashAccuracy').closest('.dashboard-tile').querySelector('.tile-meta');

  assert.equal(meta.textContent, 'Média por lição');
});

test('JSON válido com string não marca lições como concluídas', () => {
  const app = createApp({ progress: '"abcdefghijkl"' });

  assert.equal(app.completedLabel(), '0 / 120');
  assert.equal(app.doc.querySelectorAll('.lesson.done').length, 0);
  assert.deepEqual(dashboard(app), {
    lessons: '0 / 120',
    best: '0 PPM',
    accuracy: '—',
    awards: '0 / 24',
  });
});

test('registro com números inválidos não derruba nem inventa dashboard', () => {
  const app = createApp({ progress: {
    0: { wpm: 'x', accuracy: 'y', last: { wpm: 'x', accuracy: 'y', seconds: 'z' } },
  } });

  assert.equal(app.completedLabel(), '1 / 120');
  assert.deepEqual(dashboard(app), {
    lessons: '1 / 120',
    best: '0 PPM',
    accuracy: '—',
    awards: '0 / 24',
  });
  assert.deepEqual(app.consoleErrors, []);
});
