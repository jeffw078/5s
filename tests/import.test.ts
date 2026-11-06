import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseHistory } from '../lib/history-import';
const header='Data da auditoria\tMês Auditoria\tAno Auditoria\tSenso\tPontuação\tSetor\tUnidade\tAuditor\n';
const row='21/01/2025\tJANEIRO\t#VALOR!\tSeiri – Senso de utilização.\t67\tPátio\tProdução Rio Natal\tJoice';
test('infere ano de data válida com aviso e remove duplicidade idêntica',()=>{
  const p=parseHistory(header+row+'\n'+row);
  assert.equal(p.rows.length,1); assert.equal(p.duplicates.length,1);
  assert.equal(p.rows[0].date,'2025-01-21'); assert.ok(p.warnings.some(x=>x.code==='YEAR_INFERRED'));
});
test('conflito remove ambas as versões e não escolhe silenciosamente uma nota',()=>{
  const p=parseHistory(header+row+'\n'+row.replace('\t67\t','\t75\t'));
  assert.equal(p.rows.length,0); assert.ok(p.errors.some(x=>x.code==='CONFLICT'));
});
test('rejeita data inexistente, mês divergente e pontuação fora de faixa',()=>{
  for(const r of [row.replace('21/01/2025','31/02/2025'),row.replace('JANEIRO','MARÇO'),row.replace('\t67\t','\t101\t')]) {
    const p=parseHistory(header+r); assert.equal(p.rows.length,0);assert.ok(p.errors.length>0);
  }
});
test('lê CSV com aspas, ponto e vírgula e decimal brasileiro',()=>{
  const p=parseHistory('data;mes;ano;senso;pontuacao;setor;unidade;auditor\n21/01/2025;JANEIRO;2025;Seiri;"67,5";"Sala; A";Administrativo;Joice');
  assert.equal(p.rows[0].score,67.5);assert.equal(p.rows[0].sector,'Sala; A');
});
test('histórico real é totalmente contabilizado e jamais inventa respostas por pergunta',()=>{
  const p=parseHistory(readFileSync('data/historico-original.tsv','utf8'));
  assert.equal(p.total,2037);assert.ok(p.rows.length>1800);
  assert.ok(p.duplicates.length>0);assert.ok(p.warnings.length>0);
  assert.equal(p.rows.some(r=>'question' in r),false);
});
test('auditores distintos entre sensos da mesma auditoria são separados para correção',()=>{
  const p=parseHistory(header+row+'\n'+row.replace('Seiri','Seiton').replace('Joice','Outra Pessoa'));
  assert.equal(p.rows.length,0);assert.equal(p.errors.filter(e=>e.code==='AUDITOR_CONFLICT').length,2);
});
