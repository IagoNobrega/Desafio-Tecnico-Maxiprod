# Frontend - Maxiprod Sistema de Gestão

## Descrição

Este é o frontend do sistema Maxiprod, uma aplicação React para gestão de pessoas e transações financeiras com regras de negócio específicas.

## Funcionalidades

- **Gestão de Pessoas**: Cadastro, edição e exclusão de pessoas com validação de CPF e idade
- **Gestão de Transações**: Criação de receitas e despesas com validações de negócio
- **Regras de Negócio**:
  - Menores de idade não podem ter receitas
  - Categorias devem ser compatíveis com o tipo de transação
  - Exclusão em cascata de transações ao remover pessoa

## Tecnologias Utilizadas

- **React 18** com TypeScript
- **Vite** para build e desenvolvimento
- **Playwright** para testes E2E
- **CSS Modules** para estilização

## Como Rodar o Projeto

### Pré-requisitos

- Node.js 18+
- npm ou yarn

### Instalação

```bash
# Instalar dependências
npm install

# Rodar em modo desenvolvimento
npm run dev

# A aplicação estará disponível em http://127.0.0.1:5174
```

### Testes

```bash
# Rodar todos os testes E2E
npm run test

# Rodar testes em modo watch
npm run test:watch

# Rodar testes com UI
npm run test:ui

# Gerar relatório de cobertura
npm run test:coverage
```

### Estrutura de Testes

```
tests/
  e2e/
    pessoas.spec.ts          # Testes de CRUD de pessoas
    transacoes.spec.ts       # Testes de criação de transações
    regras-negocio.spec.ts   # Testes de validações de negócio
  fixtures/
    data.ts                  # Dados de teste
  utils/
    helpers.ts               # Funções auxiliares para testes
```

## Decisões de Arquitetura

### Por que React + TypeScript?

- **Type Safety**: Previne bugs em runtime com tipagem estática
- **Developer Experience**: Melhor autocomplete e refatoração
- **Manutenibilidade**: Código mais legível e confiável

### Por que Vite?

- **Build Rápido**: Hot reload instantâneo durante desenvolvimento
- **ESM nativo**: Suporte moderno a módulos ES
- **Configuração mínima**: Funciona out-of-the-box

### Estratégia de Testes

- **Testes E2E com Playwright**: Testa a aplicação de ponta a ponta como usuário real
- **data-testid**: Selectors estáveis para testes, evitando quebras por mudanças visuais
- **test.step**: Melhor debug e organização dos testes
- **Fixtures**: Dados de teste reutilizáveis

## Validações Implementadas

1. **Pessoa**:
   - Nome obrigatório
   - Data de nascimento válida
   - CPF obrigatório (formato básico)

2. **Transação**:
   - Pessoa deve existir
   - Valor deve ser positivo
   - Descrição obrigatória
   - Validações de negócio específicas

## Contribuição

1. Siga os padrões de código estabelecidos
2. Adicione testes para novas funcionalidades
3. Use data-testid em novos elementos interativos
4. Mantenha a cobertura de testes acima de 80%

## CI/CD

Os testes são executados automaticamente no GitHub Actions em cada push/PR.

## Troubleshooting

### Testes falhando

- Verifique se a aplicação está rodando na porta 5174
- Use `npm run test:ui` para debug visual
- Verifique se os data-testid estão corretos no código

### Performance

- Use React DevTools para identificar bottlenecks
- Evite re-renders desnecessários com useMemo/useCallback