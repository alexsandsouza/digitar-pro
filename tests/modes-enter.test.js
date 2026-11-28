'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp, closeAll } = require('./helpers');

test.afterEach(closeAll);

function openLesson(app, index) {
  const m=Math.floor(index/30)+1; const level=Math.ceil(m/4); const ls=app.get("levelSelect"); if(Number(ls.value)!==level){ls.value=String(level);ls.dispatchEvent(new app.window.Event("change"));} const ms=app.get("moduleSelect");if(Number(ms.value)!==m){ms.value=String(m);ms.dispatchEvent(new app.window.Event("change"));} app.clickSelector(`.lesson[data-i="${index}"]`);
}

function completeLesson(app, index, options) {
  openLesson(app, index);
  return app.completeCurrent(options);
}

test('Treinamento só conclui ao atingir o comprimento esperado', () => {
  const app = createApp();
  const expected = app.expected();

  app.type(expected.slice(0, -1));
  assert.equal(app.get('typing').disabled, false);
  assert.equal(app.stored(), null);

  app.type(expected);
  assert.equal(app.get('typing').disabled, true);
  assert.equal(app.stored()['0'].accuracy, 100);
});

test('Treinamento com erro conclui e registra precisão real e PPM', () => {
  const app = createApp();
  const expected = app.expected();
  app.type(expected.slice(0, 1));
  app.advanceTime(60_000);
  const wrong = '#' + expected.slice(1);

  app.type(wrong);

  const record = app.stored()['0'];
  const expectedAccuracy = Math.round(((expected.length - 1) / expected.length) * 100);
  const expectedWpm = Math.round((expected.length - 1) / 5);
  assert.equal(app.get('typing').disabled, true);
  assert.equal(record.accuracy, expectedAccuracy);
  assert.equal(record.last.accuracy, expectedAccuracy);
  assert.equal(record.last.wpm, expectedWpm);
  assert.equal(record.last.seconds, 60);
  assert.equal(app.get('accuracy').textContent, `${expectedAccuracy}%`);
  assert.equal(app.get('wpm').textContent.trim(), `${expectedWpm} PPM`);
  assert.match(app.get('message').textContent, /1 erro\(s\)/);
});

test('PPM mostrado ao concluir permanece o valor gravado se o relógio andar', () => {
  const app = createApp();
  const expected = app.expected();
  app.type(expected.slice(0, 1));
  const start = app.now();
  let reads = 0;
  app.window.Date.now = () => {
    reads += 1;
    if (reads < 3) return start + 60_000;
    return start + 120_000;
  };

  app.type(expected);

  const saved = app.stored()['0'].last.wpm;
  assert.equal(saved, Math.round((expected.length / 5) / (60 / 60)));
  assert.equal(app.get('wpm').textContent.trim(), `${saved} PPM`);
  assert.match(app.get('message').textContent, new RegExp(`${saved} PPM`));
});

test('texto maior que o esperado é truncado e conclui', () => {
  const app = createApp();
  const expected = app.expected();

  app.type(`${expected} texto extra`);

  assert.equal(app.get('typing').value, expected);
  assert.equal(app.get('typing').disabled, true);
});

test('Enter prematuro não avança e previne quebra de linha', () => {
  const app = createApp();
  const expected = app.expected();
  app.type(expected.slice(0, 5));

  const event = app.enter();

  assert.equal(event.defaultPrevented, true);
  assert.equal(app.activeLessonIndex(), 0);
  assert.equal(app.get('typing').value, expected.slice(0, 5));
  assert.equal(app.get('typing').value.includes('\n'), false);
  assert.equal(app.completedLabel(), '0 / 720');
});

test('Enter após conclusão avança exatamente uma lição e repetição é ignorada', () => {
  const app = createApp();
  app.completeCurrent();

  const repeated = app.enter(app.get('typing'), { repeat: true });
  assert.equal(repeated.defaultPrevented, false);
  assert.equal(app.activeLessonIndex(), 0);

  app.enter();
  assert.equal(app.activeLessonIndex(), 1);
  assert.equal(app.completedLabel(), '1 / 720');

  app.enter();
  assert.equal(app.activeLessonIndex(), 1);
});

test('Enter com modificador não avança', () => {
  const app = createApp();
  app.completeCurrent();

  app.enter(app.get('typing'), { ctrlKey: true });
  app.enter(app.get('typing'), { altKey: true });

  assert.equal(app.activeLessonIndex(), 0);
});

test('Precisão bloqueia até correção exata e Enter avisa no fim com erro', () => {
  const app = createApp();
  app.selectMode('precision');
  const expected = app.expected();
  const wrong = '#' + expected.slice(1);

  app.type(wrong);

  assert.equal(app.get('typing').disabled, false);
  assert.equal(app.stored(), null);
  assert.equal(app.get('message').className, 'message warning');
  assert.match(app.get('message').textContent, /há erros/i);

  const event = app.enter();
  assert.equal(event.defaultPrevented, true);
  assert.match(app.get('message').textContent, /Ainda há erros/);
  assert.equal(app.activeLessonIndex(), 0);

  app.type(expected);
  assert.equal(app.get('typing').disabled, true);
  assert.equal(app.stored()['0'].accuracy, 100);

  app.enter();
  assert.equal(app.activeLessonIndex(), 1);
});

test('trocar de modo reinicia a tentativa sem apagar histórico', () => {
  const app = createApp({ progress: {
    0: { wpm: 40, accuracy: 98, last: { wpm: 40, accuracy: 98, seconds: 20 } },
  } });
  app.type('asdf');

  app.selectMode('precision');

  assert.equal(app.get('typing').value, '');
  assert.equal(app.activeLessonIndex(), 0);
  assert.equal(app.window.localStorage.getItem('digitar-pro-typing-mode'), 'precision');
  assert.equal(app.stored()['0'].wpm, 40);
  assert.equal(app.get('modeDescription').textContent.startsWith('Precisão:'), true);
});

test('preferência de modo é restaurada ao carregar', () => {
  const app = createApp({ mode: 'precision' });

  assert.equal(app.doc.querySelector('input[value="precision"]').checked, true);
  assert.equal(app.get('modeDescription').textContent.startsWith('Precisão:'), true);
});

test('reiniciar limpa a tentativa e mantém o histórico', () => {
  const app = createApp();
  app.completeCurrent();
  const before = app.stored();

  app.clickId('restart');

  assert.equal(app.get('typing').value, '');
  assert.equal(app.get('typing').disabled, false);
  assert.deepEqual(app.stored(), before);
});

test('botão Próxima lição permite pular sem conclusão (comportamento existente)', () => {
  const app = createApp();
  app.type('asdf');

  app.clickId('nextLesson');

  assert.equal(app.activeLessonIndex(), 1);
  assert.equal(app.stored(), null);
  assert.equal(app.completedLabel(), '0 / 720');
});

test('selecionar lição na trilha troca a lição e preserva registros', () => {
  const app = createApp();
  app.completeCurrent();

  openLesson(app, 5);

  assert.equal(app.activeLessonIndex(), 5);
  assert.equal(app.get('typing').value, '');
  assert.equal(app.stored()['0'].accuracy, 100);
  assert.equal(app.lessonTitle(), 'Ergonomia e posição · Repetição 1');
});

test('resumo do módulo em ordem exibe conquista e Enter avança uma vez', () => {
  const app = createApp();
  for(let i=0;i<30;i++) completeLesson(app,i);

  assert.equal(app.summaryOpen(), true);
  assert.equal(app.text('summaryTitle'), 'Parabéns!');
  assert.match(app.text('achievementName'), /Ergonomia e posição/);
  assert.equal(app.doc.activeElement.id, 'continueModule');

  const stored = app.stored();
  const last = Array.from({length:30},(_,i)=>i).map((i) => stored[i].last);
  const avgWpm = Math.round(last.reduce((sum, r) => sum + r.wpm, 0) / 30);
  const avgAccuracy = Math.round(last.reduce((sum, r) => sum + r.accuracy, 0) / 30);
  assert.equal(app.text('summaryWpm'), String(avgWpm));
  assert.equal(app.text('summaryAccuracy'), `${avgAccuracy}%`);
  assert.equal(app.text('summaryTime'), '15min 00s');

  app.enter(app.doc);

  assert.equal(app.summaryOpen(), false);
  assert.equal(app.activeLessonIndex(), 30);
});

test('concluir a última lição sem as demais não abre o resumo', () => {
  const app = createApp();
  completeLesson(app, 29);

  assert.equal(app.summaryOpen(), false);
  assert.match(app.get('message').textContent, /Complete as outras lições/);
});

test('fórmulas de precisão, PPM e duração usam relógio controlado', () => {
  const app = createApp();
  const expected = app.expected();
  app.type(expected.slice(0, 1));
  app.advanceTime(60_000);
  app.type('#' + expected.slice(1));

  const record = app.stored()['0'];
  assert.equal(record.last.seconds, 60);
  assert.equal(record.last.wpm, Math.round((expected.length - 1) / 5));
  assert.equal(record.last.accuracy, Math.round(((expected.length - 1) / expected.length) * 100));
  assert.equal(app.get('elapsed').textContent, '60s');
});

test('estado inicial não usa métricas inventadas', () => {
  const app = createApp();

  assert.equal(app.get('wpm').textContent.trim(), '0 PPM');
  assert.equal(app.get('accuracy').textContent, '100%');
  assert.equal(app.get('elapsed').textContent, '0s');
  assert.equal(app.get('best').textContent, '—');
});

test('resumo abre quando o módulo fica completo fora de ordem', () => {
  const record = (wpm, accuracy) => ({ wpm, accuracy, last: { wpm, accuracy, seconds: 20 } });
  const app = createApp({ progress: Object.fromEntries(Array.from({length:29},(_,i)=>[i+1,record(42,100)])) });

  completeLesson(app, 0);

  assert.equal(app.completedLabel(), '30 / 720');
  assert.equal(app.summaryOpen(), true);
  assert.match(app.text('achievementName'), /Ergonomia e posição/);
});

test('repetir lição de módulo já concluído não reabre o resumo', () => {
  const record = (wpm, accuracy) => ({ wpm, accuracy, last: { wpm, accuracy, seconds: 20 } });
  const app = createApp({ progress: {
    ...Object.fromEntries(Array.from({length:30},(_,i)=>[i,record(40,98)])),
  } });

  completeLesson(app, 0);

  assert.equal(app.summaryOpen(), false);
});
