# Auditoria 5S SteelMast

Implementar os requisitos explicitamente autorizados em 06/11/2026 e recuperar as telas Fusion e o histórico original. Stack escolhida pelo usuário: Next.js / Vercel / Neon PostgreSQL. Novo checkout isolado, sem código anterior recuperado.

## Abordagem

Aplicação única com App Router, TypeScript e SQL parametrizado. Banco em schema exclusivo `sm5s`, migrações aditivas; transações para gravação, revisão e importação. Alternativas descartadas: site estático não oferece persistência/controle de acesso; Workers/D1 não atendem a plataforma escolhida. Fotos em bytea no Neon, compactadas no cliente e recodificadas no servidor, evitando dependência extra de armazenamento.

## Regras

- Master gerencia usuários, senhas, cadastros, importações e acesso completo. Admin acompanha indicadores, planeja, revisa, devolve e finaliza. Auditor executa somente auditorias atribuídas a ele.
- Senhas com scrypt e salt, sessão opaca aleatória com hash no banco, cookie HttpOnly/SameSite/Secure. Senha temporária expira em 72 horas; troca obrigatória impede qualquer acesso a dados. Redefinição desativa sessões. Nenhuma credencial integra o repositório/pacote.
- Planejada → Em andamento → Em revisão → Finalizada; devolução para Em andamento com justificativa. Revisão por usuário diferente do auditor; finalizadas e históricas são imutáveis.
- 23 perguntas, notas de 0 a 100 em passos de 25 (decisão de implementação; dropdown das imagens não revela todas as opções). Média por senso; nota global média dos cinco sensos. Comparação apenas com o mês calendário anterior e mesmo setor/unidade, usando a última finalizada daquele mês; ausência permanece sem dado. Histórico contém apenas médias por senso e nunca preenche perguntas artificialmente.
- Original recebido: 2.037 linhas TSV, janeiro/2025 a junho/2026. Importador CSV/TSV com prévia, validação, duplicidades idênticas ignoradas e conflitos bloqueados; ano `#VALOR!` é inferido de data válida com aviso explícito; mês/ano divergentes são erros. Grafias de setores preservadas com avisos, sem fusão automática. Importação transacional repetível, sem sobrescrever avaliações.
- Fotos até 3 por senso; upload individual compactado até 450 KiB, lado máximo 1.400px, metadados removidos. Só arquivo recodificado é persistido; leitura autenticada.
- Interface em português, paleta oficial #95c11f / #0d0d0d, logo oficial. Layout de tablet e desktop com navegação móvel e controles acessíveis.

## Validação e entrega

Testes de regras, importador com arquivo real, autorização, senha, histórico anterior, imagem e integração PostgreSQL via PGlite. Teste de fluxo HTTP e telas com Playwright, build de produção e varredura de segredos. Entregar ZIP reproduzível, migrations, relatório de importação e README para Vercel. Publicação externa não foi solicitada, apenas preparação.
