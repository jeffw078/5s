# Auditoria 5S Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aplicação de auditorias funcional e pronta para Vercel/Neon.

**Architecture:** Next.js App Router com API autenticada e autorização por recurso, SQL transacional e schema exclusivo sm5s. Domínio puro para cálculo/histórico/importação; UI responsiva e testes com banco PostgreSQL embutido.

**Tech Stack:** Next.js 16, React 19, TypeScript, pg, sharp, Zod, Playwright, PGlite.

**Spec:** docs/superpowers/specs/2026-11-06-auditoria-5s-design.md

## Global Constraints

Next.js / Vercel / Neon PostgreSQL; credenciais fora do repositório; três perfis; troca inicial; histórico real; perguntas não inventadas a partir das médias históricas; fotos recodificadas.

## Review Focus

- Importações repetidas ou concorrentes nunca sobrescrevem dados; conflitos abortam transação.
- Auditor não acessa recurso alheio, mesmo por API ou arquivo.
- Troca de senha e desativação revogam sessões, inclusive concorrentes.
- Virada de ano/mês e histórico parcial preservam ausência de pontuação.
- Edição concorrente/revisão final não perde respostas nem permite gravação posterior.

### Task 1: Domínio e ingestão

Files: lib/domain.ts, lib/history-import.ts, lib/questions.ts, tests/domain.test.ts, tests/import.test.ts.
Interfaces: previousMonth(period), calculateScores(answers), canEdit(user,audit), parseHistory(text).
- [x] Testar primeiro virada de ano, médias, faltantes e permissões; verificar falha e implementar.
- [x] Testar importação real, duplicidades, CSV com aspas, conflitos e inconsistências; implementar parser/relatório.

### Task 2: Persistência e segurança

Files: migrations/001_initial.sql, lib/db.ts, lib/security.ts, lib/service.ts, lib/auth.ts, scripts/{migrate,bootstrap,import-history}.ts, tests/security.test.ts, tests/integration.test.ts.
Interfaces: SqlDatabase.query/transaction, Service CRUD/fluxo/histórico/importação.
- [x] Escrever testes de senha e integração; verificar falha e implementar migrations/serviço.
- [ ] Inspecionar banco recebido sem modificá-lo; executar migração aditiva, bootstrap e importação validada quando conexão funcionar.

### Task 3: Interface e API

Files: app/login, app/trocar-senha, app/(workspace), app/api, components/*, app/globals.css.
- [x] Implementar páginas de login, dashboard, auditorias, formulário, revisão, importação, cadastros e usuários; handlers verificam autenticação/origem/permissão.
- [ ] Verificar ponta a ponta primeiro acesso, auditor → revisão → finalização, filtros e importação, desktop/tablet.

### Task 4: Publicação e entrega

Files: README.md, docs/VALIDACAO.md, scripts/check-secrets.mjs, .github/workflows/ci.yml.
- [x] Executar typecheck, testes, build e varredura de segredos. Revisar recursos por perfil e acesso a anexos.
- [ ] Gerar ZIP sem .env, credenciais, caches, banco de teste e node_modules; salvar entrega com instruções precisas de publicação.

## Estado da entrega

Implementação concluída e revisão independente com cinco correções verificadas. 24 testes automatizados aprovados, incluindo importação real de 1.925 notas em 391 auditorias. Build de produção e varredura de segredos aprovados. Conexão direta com Neon bloqueada por resolução DNS; nenhuma migração/importação no banco remoto. Suíte Playwright preparada; QA visual integral pendente devido à política do navegador do ambiente. Código e instruções entregues em ZIP para publicação na Vercel.
