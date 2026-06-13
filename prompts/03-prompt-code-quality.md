Você é um Tech Lead Backend Senior especialista em Node.js, TypeScript, Express, qualidade de código, Git Hooks, Clean Code e padronização de projetos profissionais.

Estou construindo uma API chamada StockFlow API, uma API SaaS multiempresa de gestão de estoque para portfólio profissional.

Nesta tarefa, quero configurar toda a qualidade de código do projeto antes de iniciar os módulos da API.

Stack atual do projeto:

- Node.js
- TypeScript
- Express
- pnpm
- ES Modules
- API REST
- Arquitetura modular

Objetivo da tarefa:

Configurar ferramentas de qualidade de código para garantir padronização, organização dos imports, formatação automática, validação de commits e execução de checks antes dos commits.

Ferramentas obrigatórias:

- ESLint
- Prettier
- eslint-config-prettier
- eslint-plugin-simple-import-sort
- Husky
- lint-staged
- commitlint
- @commitlint/config-conventional

Atenção:
Quando eu disser "git-coomit-msg-lint", considere que quero configurar o commitlint com padrão Conventional Commits.

Regras obrigatórias:

1. Usar ESLint com configuração compatível com TypeScript.
2. Usar Prettier para formatação.
3. Usar eslint-config-prettier para evitar conflito entre ESLint e Prettier.
4. Usar eslint-plugin-simple-import-sort para ordenar imports automaticamente.
5. Usar Husky para Git Hooks.
6. Usar lint-staged para rodar lint e format apenas nos arquivos staged.
7. Usar commitlint para validar mensagens de commit.
8. Seguir Conventional Commits.
9. Configurar hook de pre-commit.
10. Configurar hook de commit-msg.
11. Garantir compatibilidade com pnpm.
12. Não remover código existente sem necessidade.
13. Não alterar regra de negócio da API.
14. Não instalar dependências desnecessárias.
15. Explicar cada alteração feita.

Instale as dependências de desenvolvimento necessárias.

Configure os arquivos:

- eslint.config.js
- .prettierrc
- .prettierignore
- commitlint.config.js
- .husky/pre-commit
- .husky/commit-msg
- package.json

No package.json, configure os scripts:

- lint
- lint:fix
- format
- format:check
- typecheck
- prepare

Scripts esperados:

pnpm lint
pnpm lint:fix
pnpm format
pnpm format:check
pnpm typecheck

Configuração esperada do lint-staged:

Para arquivos TypeScript:

- rodar eslint --fix
- rodar prettier --write

Para arquivos JSON, Markdown, YAML e outros arquivos de configuração:

- rodar prettier --write

Regras desejadas do ESLint:

- Ativar parser TypeScript.
- Ativar plugin TypeScript.
- Ativar simple-import-sort.
- Ordenar imports automaticamente.
- Bloquear variáveis não utilizadas, exceto quando começarem com underline.
- Evitar console.log em código de produção, mas permitir console.warn e console.error.
- Preferir const quando possível.
- Permitir async/await.
- Evitar regras excessivamente rígidas neste início do projeto.

Configuração esperada do Prettier:

- singleQuote: true
- semi: false
- trailingComma: all
- printWidth: 100
- tabWidth: 2
- endOfLine: lf

Configuração esperada do commitlint:

Permitir tipos:

- feat
- fix
- docs
- style
- refactor
- test
- chore
- ci
- build
- perf
- revert

Exemplos de commits válidos:

chore: configure code quality tools
feat(auth): create login endpoint
fix(products): prevent negative stock
test(users): add user creation tests
docs(readme): update project setup

Critérios de aceitação:

1. pnpm lint deve rodar sem erros.
2. pnpm lint:fix deve corrigir problemas possíveis.
3. pnpm format deve formatar o projeto.
4. pnpm format:check deve validar formatação.
5. pnpm typecheck deve validar TypeScript.
6. O hook de pre-commit deve rodar lint-staged.
7. O hook de commit-msg deve validar Conventional Commits.
8. Um commit com mensagem inválida deve ser bloqueado.
9. Um commit como "chore: configure code quality tools" deve passar.

Entrega esperada:

1. Liste todos os comandos que serão executados.
2. Mostre o conteúdo final de cada arquivo de configuração.
3. Explique brevemente para que serve cada ferramenta.
4. Explique como testar se a configuração funcionou.
5. Ao final, sugira o commit:

git add .
git commit -m "chore: configure code quality tools"

Antes de alterar os arquivos, analise o projeto atual e preserve a estrutura existente.
