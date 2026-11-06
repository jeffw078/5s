# Validação da entrega — 06/11/2026

## Evidências executadas

- `npm test`: 24 testes aprovados, zero falhas.
- `npm run typecheck`: aprovado.
- `npm run build`: build Next.js de produção aprovado, sem depender de credenciais.
- `npm run check:secrets`: aprovado; tokens Neon e URLs privadas não integram o código.
- `npm audit --omit=dev --audit-level=high`: zero vulnerabilidades após atualizar Sharp e csv-parse.
- Arquivo histórico real: 2.037 linhas; 1.925 notas válidas; 22 duplicidades idênticas; 90 linhas com conflito; quatro avisos.
- Importação real em PostgreSQL de testes: 1.925 notas em 391 auditorias, com repetição idempotente.
- Revisão independente: cinco achados tratados com testes de regressão.

## Cobertura dos testes

1. Mês anterior na virada do ano e rejeição de período inválido.
2. Médias por senso, peso igual entre sensos, nota zero e ausência de média completa.
3. Edição restrita ao responsável/Master e imutabilidade após finalização.
4. Revisão independente e devolução com justificativa.
5. Revisão de respostas preservada quando fotos são atualizadas.
6. Comentários de perguntas sem nota preservados no rascunho.
7. Guarda de navegação de links internos do formulário.
8. Compactação, limites de dimensões/tamanho e remoção de EXIF.
9. Rejeição de arquivo adulterado ou excessivo.
10. Inferência de ano com aviso e remoção de duplicidade idêntica.
11. Conflitos sem escolher arbitrariamente uma versão.
12. Data inexistente, mês divergente e nota fora da faixa.
13. CSV com aspas, ponto e vírgula e decimal brasileiro.
14. Contabilização do histórico real, sem fabricar respostas individuais.
15. Conflitos de autoria entre sensos da mesma auditoria.
16. Fluxo completo com versão concorrente, envio, devolução e finalização.
17. Importação idempotente, bloqueio de conflito e comparação anterior exata.
18. Troca de senha, expiração temporária, redefinição e desativação.
19. Requisições previamente autenticadas após revogação.
20. Persistência de observações sem permitir envio de avaliação incompleta.
21. Importação em lote e indicadores com os dados reais.
22. Autoria, limite por senso e bloqueio de anexos após envio.
23. Hashes individuais de senha e rejeição de senha/hash incorretos.
24. Política de senha e hash de tokens de sessão.

## Limites verificados

- O host Neon fornecido não pôde ser resolvido pela conexão direta deste ambiente (`EAI_AGAIN`). Nenhuma migração ou importação foi aplicada ao Neon real.
- A navegação de QA foi interrompida pela política do navegador do ambiente. Login e estrutura inicial do painel foram observados. Não há aprovação visual integral do formulário/dashboard autenticado em desktop/tablet.
- A suíte Playwright e o workflow de CI estão presentes para executar essa homologação; os resultados deles não foram presumidos.
- Publicação na Vercel não realizada; o pedido foi preparar o projeto. Faltam configurar o ambiente da conta, aplicar as migrações, criar o Master e importar as notas válidas no banco de destino.

## Decisões de implementação

- Notas novas em passos de 25; as telas recebidas mostram exemplos de 0/75/100, mas não todas as opções do dropdown. Se a escala interna for outra, ajuste `SCORE_OPTIONS`, validação e constraint SQL juntos.
- A média geral tem peso igual entre os cinco sensos, coerente com a nota geral mostrada nas telas de referência.
- Grafias semelhantes de setores são preservadas separadamente. Consolidá-las exige decidir se representam o mesmo setor.
- Fotos compactadas são gravadas em bytea no Neon; o volume de uso pode justificar armazenamento de objetos privado futuramente.
- A listagem, o dashboard e a exportação têm limite de 1.500 auditorias por consulta. O histórico recebido forma 391; use filtros de período para volumes maiores. Uma evolução de escala deve paginar a listagem e calcular os indicadores integralmente no SQL.
- Acesso de notas anteriores de outro auditor é permitido apenas como contexto do mesmo setor para executar a avaliação atribuída.
- Finalizadas são imutáveis pelo formulário. Uma importação pode complementar um histórico parcial com notas ausentes, mantendo intactas as já existentes.

## Revisão independente e correções

| Achado | Correção | Verificação |
| --- | --- | --- |
| Atualização de foto adotava revisão concorrente mantendo respostas antigas | Mantém revisão associada ao rascunho local | `tests/draft.test.ts` e conflito de revisão na integração |
| Sensos da mesma auditoria podiam ter autores divergentes | Validação por auditoria inteira e conferência da autoria persistida | `tests/import.test.ts` e rollback de importação |
| Requisição já autenticada podia gravar após revogação | Revalidação de versão/sessão sob bloqueio compartilhado da linha do usuário, coordenado com redefinição/desativação | `tests/integration.test.ts` |
| Links internos descartavam rascunhos | Guarda de navegação compartilhada e confirmação de saída, inclusive logout | `tests/draft.test.ts` |
| Comentário sem nota era descartado | Payload e banco aceitam rascunho sem nota; envio conta somente respostas pontuadas | `tests/draft.test.ts`, `tests/integration.test.ts`, migração 002 |
