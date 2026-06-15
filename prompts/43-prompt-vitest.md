Você é um desenvolvedor backend profissional especialista em Node.js, TypeScript, Express, Prisma ORM, PostgreSQL, JWT, segurança de APIs REST, arquitetura em camadas, testes automatizados com Vitest e boas práticas de qualidade de código.

Implemente a Tarefa 44 no projeto StockFlow-api: aumentar a cobertura de testes automatizados da API.

Contexto:
O projeto já possui autenticação JWT, RBAC, endpoint /auth/me, soft delete, paginação, filtros, logs de auditoria, refresh token e logout.

Requisitos:

1. Criar ou complementar testes com Vitest para os principais fluxos da API.

2. Cobrir Auth:
   - login com credenciais válidas
   - login com credenciais inválidas
   - geração de accessToken
   - geração de refreshToken
   - refresh token válido
   - refresh token expirado ou revogado
   - logout

3. Cobrir Users:
   - criação de usuário
   - listagem paginada
   - filtros por name, email e role
   - busca por id
   - atualização de usuário
   - soft delete
   - não retornar usuários com deletedAt preenchido

4. Cobrir RBAC:
   - ADMIN acessa rotas protegidas
   - USER não acessa rotas administrativas
   - token ausente retorna 401
   - token inválido retorna 401
   - role sem permissão retorna 403

5. Cobrir Audit Logs:
   - login registra log
   - criação de usuário registra log
   - atualização registra log
   - soft delete registra log
   - falha no log não quebra a operação principal

6. Criar mocks/factories quando necessário:
   - userFactory
   - tokenFactory
   - prisma mocks, se o projeto já usar mock
   - ou usar banco de teste, se esse for o padrão atual

7. Garantir isolamento entre testes:
   - limpar dados antes/depois dos testes
   - não depender de ordem de execução
   - evitar dados fixos conflitantes

8. Se ainda não existir, configurar scripts no package.json:
   - test
   - test:watch
   - test:coverage

9. A meta mínima deve ser:
   - 80% de cobertura nos services e middlewares principais

10. Não reescrever a arquitetura inteira.
    Manter o padrão atual do projeto.

11. Executar:

- npm run test
- npm run test:coverage
- npm run lint
- npm run build

12. Corrigir todos os erros encontrados sem reduzir segurança, tipagem ou qualidade.
