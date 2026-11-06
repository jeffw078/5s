import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildAnswerPayload,mergeEvidenceRefresh,shouldConfirmNavigation } from '../lib/audit-draft';
test('atualizar foto não adota revisão de respostas de outra sessão',()=>{
  const local={audit:{id:'a',revision:2,status:'IN_PROGRESS'},evidence:[]};
  const remote={audit:{id:'a',revision:3,status:'IN_PROGRESS'},evidence:[{id:'foto'}]};
  const merged=mergeEvidenceRefresh(local,remote);assert.equal(merged.audit.revision,2);assert.equal(merged.evidence[0].id,'foto');
});
test('rascunho preserva comentário de pergunta sem nota e ignora pergunta vazia',()=>{
  assert.deepEqual(buildAnswerPayload({s1q1:{score:null,note:'Verificar identificação'},s1q2:{score:null,note:''},s1q3:{score:0,note:''}}),[
    {questionId:'s1q1',score:null,note:'Verificar identificação'},{questionId:'s1q3',score:0,note:''}
  ]);
});
test('guarda de saída cobre links internos da barra lateral e senha',()=>{
  for(const href of ['/auditorias','/trocar-senha','/'])assert.equal(shouldConfirmNavigation(true,href,'https://example.test/auditorias/a'),true);
  assert.equal(shouldConfirmNavigation(false,'/auditorias','https://example.test/auditorias/a'),false);
  assert.equal(shouldConfirmNavigation(true,'#foto','https://example.test/auditorias/a'),false);
});
