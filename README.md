# Sistema de Reservas — TDD

Projeto didático em TypeScript que aplica TDD a um domínio simplificado de reservas de propriedades. A solução reúne regras de negócio, serviços de aplicação, persistência com TypeORM e testes de controllers Express.

## Funcionalidades

- Cadastro de usuários e propriedades.
- Criação de reservas por período.
- Validação da capacidade máxima de hóspedes.
- Bloqueio de reservas em períodos sobrepostos.
- Cálculo do valor total pelo número de noites.
- Desconto de 10% em estadias de sete noites ou mais.
- Cancelamento de reservas com regras de reembolso.
- Persistência por repositórios fake ou TypeORM.

## Regras de cancelamento

O valor mantido na reserva após o cancelamento depende da antecedência em relação ao check-in:

| Antecedência | Regra | Valor restante |
| --- | --- | --- |
| Mais de 7 dias | Reembolso integral | 0% do total |
| De 1 a 7 dias | Reembolso parcial | 50% do total |
| Menos de 1 dia | Sem reembolso | 100% do total |

Uma reserva cancelada deixa de bloquear o período da propriedade e não pode ser cancelada novamente.

## Tecnologias

- Node.js 22
- TypeScript 5
- Jest e ts-jest
- Express e Supertest
- TypeORM
- SQLite em memória nos testes de integração

## Estrutura do projeto

```text
src/
├── domain/
│   ├── cancelation/       # Estratégias e fábrica de regras de reembolso
│   ├── entities/          # Booking, Property e User
│   ├── repositories/      # Contratos dos repositórios
│   └── value_objects/     # DateRange
├── application/
│   ├── dtos/              # Dados de entrada dos casos de uso
│   ├── errors/            # Erros da aplicação
│   └── services/          # Serviços de reserva, propriedade e usuário
└── infrastructure/
    ├── persistence/       # Entidades e mapeadores TypeORM
    ├── repositories/      # Implementações fake e TypeORM
    └── web/               # Controllers Express e testes E2E
```

## Pré-requisitos

- Node.js `>=22 <23`
- npm (o projeto declara a versão `11.17.0`)

Confirme as versões instaladas:

```bash
node --version
npm --version
```

## Instalação

Na raiz do projeto, instale exatamente as dependências registradas no `package-lock.json`:

```bash
npm ci
```

## Execução

### Executar todos os testes

```bash
npm test
```

### Executar um arquivo específico

```bash
npm test -- src/domain/entities/booking.test.ts
```

### Executar em modo de observação

```bash
npm test -- --watch
```

### Gerar relatório de cobertura

```bash
npm test -- --coverage
```

O relatório HTML será criado em `coverage/lcov-report/index.html`.

### Validar os tipos

Código de produção:

```bash
npm run typecheck
```

Testes:

```bash
npm run typecheck:test
```

## Scripts disponíveis

| Comando | Descrição |
| --- | --- |
| `npm test` | Executa as suítes Jest |
| `npm run typecheck` | Valida os tipos do código-fonte sem gerar arquivos |
| `npm run typecheck:test` | Valida os tipos dos arquivos de teste |

## Estratégia de testes

O projeto possui testes em diferentes níveis:

- **Unidade:** entidades, value objects e regras de reembolso.
- **Serviço:** casos de uso com repositórios fake.
- **Persistência:** repositórios e mapeadores TypeORM com SQLite em memória.
- **E2E dos controllers:** rotas Express exercitadas com Supertest e banco em memória.

Cada suíte cria seus próprios recursos de teste; não é necessário instalar ou configurar um banco de dados externo.

## Endpoints exercitados nos testes E2E

| Método | Rota | Ação |
| --- | --- | --- |
| `POST` | `/users` | Cria um usuário |
| `POST` | `/properties` | Cria uma propriedade |
| `POST` | `/bookings` | Cria uma reserva |
| `POST` | `/bookings/:id/cancel` | Cancela uma reserva |

Exemplo de corpo para criação de reserva:

```json
{
  "propertyId": "1",
  "guestId": "1",
  "startDate": "2026-10-10",
  "endDate": "2026-10-15",
  "guestCount": 2
}
```

> Atualmente, o repositório não possui um arquivo de inicialização com `app.listen`. As rotas são montadas dentro dos testes E2E e executadas pelo Supertest. Portanto, a forma suportada de executar o projeto neste estágio é por meio dos testes e das verificações de tipos descritas acima.
