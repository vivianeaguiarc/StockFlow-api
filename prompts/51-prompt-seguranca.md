Você é um engenheiro backend sênior especialista em Node.js, TypeScript, Express, Prisma ORM, PostgreSQL, segurança de APIs REST, OWASP Top 10, JWT, RBAC, LGPD, Docker, CI/CD e hardening de aplicações em produção.

Implemente a Tarefa 51 no projeto StockFlow-api: adicionar melhorias avançadas de segurança na API.

Contexto:
O projeto já possui:

- Express + TypeScript
- Prisma ORM + PostgreSQL
- JWT + RBAC
- Refresh Token + Logout
- Audit Logs
- Soft Delete
- Paginação e filtros
- Docker
- GitHub Actions
- Observabilidade
- Redis Cache
- Swagger/OpenAPI profissional
- Arquitetura mais limpa por módulos

Requisitos:

1. Instalar e configurar Helmet:
   - Aplicar headers de segurança.
   - Ajustar CSP apenas se não quebrar Swagger.

2. Revisar CORS:
   - Permitir origins por variável de ambiente.
   - Bloquear origins desconhecidas em produção.
   - Manter desenvolvimento funcional.

3. Implementar sanitização de entrada:
   - Prevenir payloads maliciosos.
   - Evitar strings perigosas em campos textuais.
   - Não quebrar validações existentes.

4. Garantir limite de payload:
   - express.json({ limit: "1mb" })
   - express.urlencoded({ extended: true, limit: "1mb" })

5. Melhorar tratamento de erros:
   - Não expor stack trace em produção.
   - Padronizar respostas de erro.
   - Manter requestId na resposta de erro.

6. Revisar Rate Limit:
   - Aplicar limites mais rígidos em login e refresh token.
   - Manter limite global para demais rotas.
   - Usar Redis como store, se já estiver configurado.

7. Adicionar proteção contra brute force em autenticação:
   - Limitar tentativas de login por IP/email.
   - Retornar erro genérico para credenciais inválidas.

8. Revisar JWT:
   - Garantir secrets obrigatórios.
   - Garantir expiração curta para accessToken.
   - Não aceitar tokens sem algoritmo esperado.

9. Revisar Refresh Token:
   - Manter token salvo apenas como hash.
   - Revogar token no logout.
   - Não vazar detalhes em caso de token inválido.

10. Atualizar Swagger:

- Documentar 429 Too Many Requests.
- Documentar erros padronizados.

11. Criar testes para:

- headers de segurança existem.
- CORS bloqueia origin inválida em produção.
- payload acima do limite retorna erro.
- login rate limit funciona.
- erro em produção não expõe stack trace.
- token inválido retorna resposta segura.

12. Atualizar README:

- seção Segurança
- Helmet
- CORS
- Rate Limit
- JWT
- Refresh Token
- LGPD/Soft Delete

13. Executar:

- npm run lint
- npm run test
- npm run build

14. Não reescrever a arquitetura inteira.
