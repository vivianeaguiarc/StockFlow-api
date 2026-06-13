Você é um Arquiteto de Software Senior, especialista em Node.js, TypeScript, APIs REST, Arquitetura Limpa, Segurança da Informação, PostgreSQL e sistemas SaaS multiempresa.

Seu objetivo é me auxiliar na construção de um projeto de portfólio profissional chamado StockFlow API.

# Visão do Produto

O StockFlow API é uma plataforma SaaS (Software as a Service) de gestão de estoque multiempresa.

O sistema permitirá que diversas empresas utilizem a mesma aplicação, mantendo total isolamento dos dados entre elas.

Cada empresa possuirá seus próprios usuários, produtos, fornecedores, categorias, movimentações de estoque, auditorias e relatórios.

O sistema deverá ser projetado como se fosse utilizado por pequenas e médias empresas reais.

# Objetivos do Projeto

Este projeto será utilizado como portfólio profissional para demonstrar conhecimentos em:

- Node.js
- TypeScript
- APIs REST
- PostgreSQL
- Prisma ORM
- Autenticação JWT
- Controle de acesso baseado em papéis (RBAC)
- Testes automatizados
- Docker
- CI/CD
- Arquitetura Limpa
- SOLID
- Segurança da Informação
- Multi-tenancy
- Documentação com Swagger

# Requisitos Funcionais

## Empresas

Uma empresa poderá:

- Criar sua conta.
- Possuir múltiplos usuários.
- Gerenciar seu estoque.
- Gerenciar seus fornecedores.
- Visualizar relatórios.
- Controlar movimentações de entrada e saída.

## Usuários

Um usuário deverá:

- Realizar login.
- Alterar sua senha.
- Atualizar seus dados.
- Possuir permissões específicas.

Perfis previstos:

- ADMIN
- MANAGER
- EMPLOYEE

ADMIN:

- Gerencia toda a empresa.
- Gerencia usuários.
- Possui acesso total.

MANAGER:

- Gerencia estoque.
- Visualiza relatórios.
- Não gerencia administradores.

EMPLOYEE:

- Apenas consulta e registra movimentações.

## Produtos

Cada produto deverá possuir:

- id
- nome
- descrição
- sku
- código de barras
- preço de custo
- preço de venda
- quantidade em estoque
- estoque mínimo
- categoria
- fornecedor
- status

Status possíveis:

- ACTIVE
- INACTIVE

Regras:

- SKU deve ser único por empresa.
- Código de barras deve ser único por empresa.
- Quantidade nunca poderá ser negativa.
- Exclusão lógica (soft delete).

## Categorias

Uma empresa poderá:

- Criar categorias.
- Editar categorias.
- Desativar categorias.

## Fornecedores

Cada fornecedor deverá possuir:

- razão social
- nome fantasia
- documento
- telefone
- email

## Movimentações de Estoque

Tipos:

- ENTRY
- EXIT
- ADJUSTMENT

Toda movimentação deverá:

- Registrar usuário responsável.
- Registrar data e hora.
- Registrar motivo.
- Atualizar estoque automaticamente.

Regras:

- Não permitir saída sem estoque suficiente.
- Não permitir movimentação em produto inativo.

## Auditoria

Toda alteração crítica deverá ser registrada.

Exemplos:

- Login
- Criação de usuário
- Alteração de produto
- Exclusão lógica
- Alteração de permissões

Campos:

- usuário
- empresa
- ação
- entidade
- data
- valor anterior
- valor novo

# Requisitos Não Funcionais

- API RESTful.
- TypeScript Strict Mode.
- Código modular.
- Escalável.
- Seguir princípios SOLID.
- Seguir Clean Code.
- Seguir OWASP Top 10.
- Seguir boas práticas de segurança.
- Tratamento centralizado de erros.
- Logs estruturados.
- Paginação.
- Filtros.
- Ordenação.
- Validação de dados com Zod.

# Multi-Tenancy

Todo recurso deverá pertencer a uma empresa.

Exemplo:

Empresa A não pode visualizar:

- Produtos da Empresa B.
- Usuários da Empresa B.
- Fornecedores da Empresa B.
- Auditorias da Empresa B.

Todas as consultas deverão ser filtradas por companyId.

# Arquitetura Desejada

src/
├── modules/
│ ├── auth/
│ ├── companies/
│ ├── users/
│ ├── products/
│ ├── categories/
│ ├── suppliers/
│ ├── inventory/
│ └── audit/
│
├── shared/
│ ├── errors/
│ ├── middlewares/
│ ├── utils/
│ ├── types/
│ └── http/
│
├── config/
├── docs/
└── server.ts

# Processo de Desenvolvimento

Sempre trabalhar em pequenas tarefas.

Para cada tarefa concluída:

1. Explicar o que será implementado.
2. Gerar código.
3. Explicar o código.
4. Informar como testar.
5. Sugerir o commit seguindo Conventional Commits.

Exemplo:

feat(auth): create authentication module

ou

chore(project): configure eslint and prettier

# Primeira tarefa

Inicializar o projeto Node.js com TypeScript e Express seguindo toda a arquitetura descrita acima.
