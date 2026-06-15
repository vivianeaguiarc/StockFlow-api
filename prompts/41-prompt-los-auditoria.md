Implemente a Tarefa 42 no projeto StockFlow-api: adicionar logs de auditoria para ações importantes da API.

Requisitos:

1. Atualizar o schema do Prisma criando o model AuditLog:

model AuditLog {
id String @id @default(uuid())
userId String?
action String
entity String
entityId String?
metadata Json?
ipAddress String?
userAgent String?
createdAt DateTime @default(now())

user User? @relation(fields: [userId], references: [id])
}

2. Se necessário, adicionar no model User:

auditLogs AuditLog[]

3. Criar migration:

npx prisma migrate dev --name add-audit-logs

4. Criar um serviço de auditoria, por exemplo:
   src/modules/audit/audit-log.service.ts

5. Esse serviço deve ter um método para registrar logs com:
   - userId
   - action
   - entity
   - entityId
   - metadata
   - ipAddress
   - userAgent

6. Registrar logs nas ações:
   - LOGIN
   - CREATE_USER
   - UPDATE_USER
   - DELETE_USER

7. Capturar ipAddress e userAgent a partir do request quando possível.

8. O log de auditoria nunca deve quebrar a operação principal.
   - Se falhar ao salvar o log, apenas registrar warning no logger.

9. Atualizar Swagger apenas se algum endpoint de consulta de logs for criado.
   - Não criar endpoint público de auditoria agora, a menos que o projeto já tenha padrão para isso.

10. Criar testes para validar:

- criação de log no login
- criação de log ao criar usuário
- criação de log ao atualizar usuário
- criação de log ao deletar usuário
- falha no log não quebra a operação principal

11. Executar:

- npx prisma generate
- npm run lint
- npm run build
