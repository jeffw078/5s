import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword, validatePassword, tokenHash } from '../lib/security';
test('scrypt usa salt único, verifica senha e rejeita hash malformado',async()=>{
  const a=await hashPassword('Senha-de-teste-123!');const b=await hashPassword('Senha-de-teste-123!');
  assert.notEqual(a,b);assert.equal(await verifyPassword('Senha-de-teste-123!',a),true);
  assert.equal(await verifyPassword('Senha-errada-123!',a),false);
  assert.equal(await verifyPassword('qualquer','bad:hash'),false);
});
test('senha obrigatória longa e token persistido somente como hash',()=>{
  assert.throws(()=>validatePassword('123'));
  assert.doesNotThrow(()=>validatePassword('NovaSenhaForte123!'));
  assert.notEqual(tokenHash('token'), 'token'); assert.equal(tokenHash('token').length,64);
});
