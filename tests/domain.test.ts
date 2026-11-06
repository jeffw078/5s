import { test } from 'node:test';
import assert from 'node:assert/strict';
import { previousMonth, calculateScores, canEdit, assertTransition, scoreLabel } from '../lib/domain';

test('mês anterior cruza janeiro e não escolhe último mês disponível', () => {
  assert.equal(previousMonth('2026-01'), '2025-12');
  assert.equal(previousMonth('2026-03'), '2026-02');
  assert.throws(() => previousMonth('2026-13'));
});
test('média global dá peso igual a cada senso e preserva ausência', () => {
  const result=calculateScores([{sense:1,score:100},{sense:1,score:50},{sense:2,score:25},{sense:3,score:100},{sense:4,score:100},{sense:5,score:100}]);
  assert.equal(result.senses[1],75);
  assert.equal(result.overall,80);
  assert.equal(calculateScores([{sense:1,score:0}]).overall,null);
  assert.equal(calculateScores([{sense:1,score:0}]).senses[1],0);
  assert.equal(scoreLabel(null),'Sem avaliação');
});
test('apenas auditor designado ou master altera rascunho; finalizadas são imutáveis', () => {
  const a={auditor_id:'a',status:'IN_PROGRESS',source:'LIVE'};
  assert.equal(canEdit({id:'a',role:'AUDITOR'},a),true);
  assert.equal(canEdit({id:'b',role:'AUDITOR'},a),false);
  assert.equal(canEdit({id:'b',role:'ADMIN'},a),false);
  assert.equal(canEdit({id:'b',role:'MASTER'},a),true);
  assert.equal(canEdit({id:'a',role:'MASTER'},{...a,status:'FINALIZED'}),false);
});
test('revisão exige gestor independente e devolução justificada', () => {
  assert.throws(()=>assertTransition('REVIEW','FINALIZED',{id:'a',role:'ADMIN'},'a'));
  assert.throws(()=>assertTransition('REVIEW','IN_PROGRESS',{id:'b',role:'ADMIN'},'a',''));
  assert.doesNotThrow(()=>assertTransition('REVIEW','IN_PROGRESS',{id:'b',role:'ADMIN'},'a','Rever evidências'));
  assert.throws(()=>assertTransition('FINALIZED','IN_PROGRESS',{id:'b',role:'MASTER'},'a'));
});
