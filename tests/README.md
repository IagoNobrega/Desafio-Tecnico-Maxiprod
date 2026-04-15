# 🧪 Maxiprod - Pirâmide de Testes Automatizados

Repositório de testes automatizados para o sistema Maxiprod, cobrindo as regras de negócio através de uma estratégia bem estruturada de testes em múltiplas camadas.

## 📋 Sumário

- [Estrutura da Pirâmide de Testes](#estrutura-da-pirâmide-de-testes)
- [Regras de Negócio Testadas](#regras-de-negócio-testadas)
- [Setup e Instalação](#setup-e-instalação)
- [Como Rodar os Testes](#como-rodar-os-testes)
- [Bugs Encontrados](#bugs-encontrados)
- [Justificativa das Escolhas](#justificativa-das-escolhas)
- [Boas Práticas Aplicadas](#boas-práticas-aplicadas)

---

## 🏗️ Estrutura da Pirâmide de Testes

A pirâmide de testes segue a proporção estratégica:

```
         ▲
        ╱ ╲
       ╱   ╲  E2E Tests (Playwright)
      ╱─────╲ ~5-10% - User Flow Completo
     ╱       ╲
    ╱         ╲
   ╱           ╲ Integration Tests (xUnit + HTTP)
  ╱─────────────╲ ~15-25% - API + BD + Dependências
 ╱               ╲
╱                 ╲ Unit Tests (xUnit + Vitest)
╱───────────────────╲ ~65-75% - Lógica Pura e Funções
                    ▼
```

### Descrição dos Níveis

| Nível | Framework | Tipo | Objetivo | Quantidade |
|-------|-----------|------|----------|-----------|
| **Unit** | xUnit / Vitest | Rápidos | Lógica de negócio isolada | 60-70% |
| **Integration** | xUnit / Vitest | Médios | API, BD, camada de integração | 20-30% |
| **E2E** | Playwright | Lentos | Fluxos de usuário completos | 5-10% |

---

## 🎯 Regras de Negócio Testadas

### 1. ❌ Menor de Idade Não Pode Ter Receitas

**Descrição:** Pessoas menores de 18 anos não podem registrar transações de receita, apenas despesas.

**Arquivos de Teste:**
- `backend/Unit/MenorIdadeNaoTemReceitaTests.cs` - Testes unitários (.NET)
- `backend/Integration/ApiIntegrationTests.cs` - Testes de integração (HTTP)
- `frontend/src/tests/unit/rules.test.ts` - Testes unitários (TS)
- `frontend/src/tests/e2e/app.spec.ts` - Testes E2E (Playwright)

**Cenários Cobertos:**
✅ Pessoa com 25 anos pode ter receita
✅ Pessoa com 18 anos pode ter receita (maioridade)
❌ Pessoa com 17 anos não pode ter receita
❌ Pessoa com 10 anos não pode ter receita
✅ Qualquer idade pode ter despesa

**Resultados:**
```csharp
[Fact]
public void Pessoa_Menor_De_Idade_Nao_Pode_Ter_Receita()
{
    // Arrange
    var dataNascimento = DateTime.Now.AddYears(-17);
    var idadePessoa = CalcularIdade(dataNascimento);

    // Act
    var temPermissaoReceita = ValidarPermissaoReceita(idadePessoa);

    // Assert
    temPermissaoReceita.Should().BeFalse();
}
```

---

### 2. 📂 Categoria Respeita Finalidade (Receita/Despesa/Ambas)

**Descrição:** Cada categoria tem uma finalidade e só pode ser usada no tipo correto de transação.

**Arquivos de Teste:**
- `backend/Unit/CategoriaFinalidadeTests.cs` - Testes unitários
- `backend/Integration/CategoriaIntegrationTests.cs` - Testes de integração
- `frontend/src/tests/unit/rules.test.ts` - Testes unitários
- `frontend/src/tests/e2e/app.spec.ts` - Testes E2E

**Tipos de Categoria:**
- **Receita**: Apenas para transações de receita (ex: Salário, Bônus)
- **Despesa**: Apenas para transações de despesa (ex: Alimentação, Transporte)
- **Ambas**: Funciona para receita ou despesa (ex: Transferência)

**Cenários Cobertos:**
✅ Categoria Receita em transação Receita
❌ Categoria Receita em transação Despesa
✅ Categoria Despesa em transação Despesa
❌ Categoria Despesa em transação Receita
✅ Categoria Ambas em qualquer transação

---

### 3. 🗑️ Exclusão em Cascata de Transações

**Descrição:** Ao deletar uma pessoa, todas as suas transações associadas devem ser removidas automaticamente.

**Arquivos de Teste:**
- `backend/Unit/ExclusaoCascataTests.cs` - Testes unitários
- `backend/Integration/ExclusaoCascataIntegrationTests.cs` - Testes de integração
- `frontend/src/tests/unit/rules.test.ts` - Testes unitários
- `frontend/src/tests/e2e/app.spec.ts` - Testes E2E

**Cenários Cobertos:**
✅ Deletar pessoa remove todas suas transações (3-10 transações)
✅ Exclusão não afeta transações de outras pessoas
✅ Pessoa sem transações pode ser deletada
❌ Deltar pessoa inexistente gera erro
✅ Exclusão é atômica (tudo ou nada)

---

## 🚀 Setup e Instalação

### Pré-requisitos

- **.NET 8.0+** - Backend
- **Node.js 18+** - Frontend
- **npm ou yarn** - Package manager
- **API Backend** rodando em `http://localhost:5135`
- **Frontend** rodando em `http://localhost:5173`

### Backend (.NET)

```bash
# Navegar para pasta de testes backend
cd tests/backend

# Restaurar pacotes
dotnet restore

# Build
dotnet build
```

### Frontend (React/TypeScript)

```bash
# Navegar para pasta de testes frontend
cd tests/frontend

# Instalar dependências
npm install

# Build (se necessário)
npm run build
```

---

## 🏃 Como Rodar os Testes

### Backend - Testes Unitários

```bash
cd tests/backend

# Rodar todos os testes unitários
dotnet test --filter Category=Unit --verbosity normal

# Rodar apenas testes de "Menor de Idade"
dotnet test --filter "Name~MenorIdade" --verbosity normal

# Rodar apenas testes de "Categoria"
dotnet test --filter "Name~Categoria" --verbosity normal

# Rodar apenas testes de "Exclusão"
dotnet test --filter "Name~Exclusao" --verbosity normal

# Com relatório de cobertura
dotnet test /p:CollectCoverageMetrics=true
```

### Backend - Testes de Integração

```bash
cd tests/backend

# Rodar testes de integração (requer API rodando)
dotnet test --filter Category=Integration --verbosity normal

# Com timeout estendido (APIs podem ser lentas)
dotnet test --filter Category=Integration --verbosity normal -- RunConfiguration.TestSessionTimeout=300000
```

### Frontend - Testes Unitários (Vitest)

```bash
cd tests/frontend

# Rodar todos os testes unitários
npm run test

# Modo watch (rerun ao salvar arquivo)
npm run test -- --watch

# Com UI visual
npm run test:ui

# Gerar relatório de cobertura
npm run test:coverage
```

### Frontend - Testes E2E (Playwright)

```bash
cd tests/frontend

# Rodar todos os testes E2E
npm run e2e

# Modo headed (ver o navegador)
npm run e2e -- --headed

# Modo debug (passo a passo)
npm run e2e:debug

# UI test runner
npm run e2e:ui

# Visualizar relatório de última execução
npm run e2e:report
```

### Executar Todos os Testes

```bash
# Backend
cd tests/backend && dotnet test

# Frontend
cd tests/frontend && npm test && npm run e2e
```

---

## 🐛 Bugs Encontrados

### 1. ⚠️ [CRÍTICO] Menor consegue registrar receita com data de nascimento incorreta

**Severidade:** CRÍTICO  
**Status:** ❌ BUG CONFIRMADO  
**Arquivo de Documentação:** [BUGS.md](./docs/BUGS.md)

**Descrição:** Se a data de nascimento for armazenada incorretamente ou o cálculo de idade tiver bug, menores conseguem registrar receitas.

**Teste que Prova:**
```
MenorIdadeNaoTemReceitaTests::Pessoa_Menor_De_Idade_Nao_Pode_Ter_Receita [FAILED]
```

**Impacto:** Violação direta da regra de negócio crítica.

---

### 2. ⚠️ [ALTO] Categoria Ambas não funciona corretamente

**Severidade:** ALTO  
**Status:** ⚠️ POTENCIAL BUG  
**Arquivo de Documentação:** [BUGS.md](./docs/BUGS.md)

**Descrição:** Categoria com tipo "Ambas" pode não estar funcionando em todas as situações.

**Teste que Prova:**
```
CategoriaFinalidadeTests::Categoria_Ambas_Pode_Ser_Usada_Em_Qualquer_Transacao [FALHA]
```

---

### 3. ⚠️ [MÉDIO] Exclusão não é verdadeiramente atômica

**Severidade:** MÉDIO  
**Status:** ⚠️ INVESTIGAR  
**Arquivo de Documentação:** [BUGS.md](./docs/BUGS.md)

**Descrição:** Se houver muitas transações, a exclusão pode falhar parcialmente.

**Teste que Prova:**
```
ExclusaoCascataTests::Todas_As_Transacoes_De_Uma_Pessoa_Devem_Ser_Deletadas_Atomicamente [FALHA]
```

---

## 📊 Resultados dos Testes

Consulte os relatórios detalhados:

- **Bugs Encontrados:** [docs/BUGS.md](./docs/BUGS.md)
- **Teste Execution Report:** `test-results/` (gerado após execução)
- **Coverage Report:** `coverage/` (gerado com `--coverage`)

---

## 💡 Justificativa das Escolhas

### 1. Por que xUnit para Backend?

✅ **Prós:**
- Framework moderno e de alta performance
- integração nativa com .NET
- Assertions fluentes com FluentAssertions
- Suporte built-in para Theories (testes parametrizados)

```csharp
[Theory]
[InlineData(-16)]
[InlineData(-15)]
[InlineData(-10)]
public void Qualquer_Menor_De_Idade_Nao_Pode_Ter_Receita(int idadeNegativa)
{
    // Teste parametrizado - executa 3 vezes com diferentes valores
}
```

### 2. Por que Vitest para Unit Tests Frontend?

✅ **Prós:**
- Compatível com Vite (mesma config)
- Execução muito rápida (HMR)
- Sintaxe compatível com Jest
- Suporte a TS nativo
- UI para visualizar testes

### 3. Por que Playwright para E2E?

✅ **Prós:**
- Multi-browser (Chrome, Firefox, Safari)
- Excelente para testes de UI
- Screenshot/video on failure
- Debug mode interativo
- Rápido e confiável

### 4. Proporção da Pirâmide: 60% Unit / 30% Integration / 10% E2E

**Por que essa proporção?**

```
Unit Tests (60-70%)
├─ Rápidos: ~100ms cada
├─ Isolados: Sem dependências externas
├─ Determinísticos: Sempre mesmo resultado
└─ Cobertura: Maior volume de cenários

Integration Tests (20-30%)
├─ Médios: ~500ms -2s cada
├─ Reais: Testam com BD/API real
├─ Válida: Comportamento real do sistema
└─ Casos: Fluxos críticos e integração

E2E Tests (5-10%)
├─ Lentos: ~5-30s cada
├─ Completos: Usuário real interagindo
├─ Frágeis: Mais pontos de falha
└─ Smoke Test: Apenas happy path
```

---

## 🎓 Boas Práticas Aplicadas

### 1. Nomenclatura Clara e Descritiva

```csharp
// ✅ BOM: Deixa claro o que testa
[Fact]
public void Pessoa_Menor_De_Idade_Nao_Pode_Ter_Receita() { }

// ❌ RUIM: Vago
[Fact]
public void TestAge() { }
```

### 2. Arrange-Act-Assert (AAA)

```csharp
public void TesteExemplo()
{
    // Arrange - Preparar dados
    var idade = 17;
    
    // Act - Executar ação
    var resultado = ValidarReceita(idade);
    
    // Assert - Verificar resultado
    resultado.Should().BeFalse();
}
```

### 3. Testes Independentes

- Cada teste pode rodar isoladamente
- Sem dependência de ordem
- Mock de dependências externas
- Sem efeitos colaterais

### 4. Foco em Regras de Negócio

```csharp
// ✅ Testa a REGRA
[Fact]
public void Menor_Nao_Pode_Ter_Receita() { }

// ❌ Testa implementação
[Fact]
public void DateValidator_Returns_False() { }
```

### 5. Cobertura Inteligente

```csharp
// Testar caminho feliz
Pessoa_Maior_De_Idade_Pode_Ter_Receita ✅

// Testar caminho triste
Menor_Nao_Pode_Ter_Receita ❌

// Testar edge cases
Exatamente_18_Anos_Pode_Ter_Receita ✅
Pessoa_Com_Muitos_Anos_Pode_Ter_Receita ✅
```

### 6. Testes de Integração com Dados Reais

```csharp
// Testa contra API real
[Fact]
public async Task Deve_Criar_Pessoa_Via_API()
{
    var response = await _httpClient.PostAsync("/api/pessoas", content);
    response.IsSuccessStatusCode.Should().BeTrue();
}
```

---

## 📁 Estrutura de Diretórios

```
tests/
├── backend/                          # Testes .NET
│   ├── MaxiprodTests.csproj
│   ├── Unit/                         # Testes Unitários
│   │   ├── MenorIdadeNaoTemReceitaTests.cs
│   │   ├── CategoriaFinalidadeTests.cs
│   │   └── ExclusaoCascataTests.cs
│   └── Integration/                  # Testes Integração
│       ├── ApiIntegrationTests.cs
│       └── CategoriaIntegrationTests.cs
├── frontend/                         # Testes React
│   ├── package.json
│   ├── vitest.config.ts
│   ├── playwright.config.ts
│   └── src/tests/
│       ├── unit/                     # Testes Unitários
│       │   └── rules.test.ts
│       ├── e2e/                      # Testes E2E
│       │   └── app.spec.ts
│       └── setup.ts
└── docs/                             # Documentação
    ├── BUGS.md                       # Bugs Encontrados
    ├── README.md                     # Este arquivo
    └── ARCHITECTURE.md               # Arquitetura dos testes
```

---

## 🔍 Dicas de Debugging

### Backend

```bash
# Verbose output
dotnet test --verbosity detailed

# Stop on first failure
dotnet test --no-build -- RunConfiguration.TestSessionTimeout=60000

# Debug com breakpoints no VS Code
dotnet test --configuration Debug
```

### Frontend

```bash
# Debug específico test
npm run test -- rules.test.ts

# Debug no navegador
npm run e2e:debug

# Com trace detalhado
npm run e2e -- --trace on
```

---

## 🎯 Próximos Passos / Melhorias Futuras

- [ ] CI/CD com GitHub Actions
- [ ] Testes de Performance
- [ ] Testes de Segurança (OWASP)
- [ ] Testes de Load
- [ ] Mutation Testing para verificar qualidade dos testes
- [ ] Cobertura mínima obrigatória (80%+)

---

## 📞 Contato / Suporte

Para dúvidas sobre os testes ou relatórios de bugs:

1. Consultar [BUGS.md](./docs/BUGS.md)
2. Verificar logs de execução em `test-results/`
3. Reproduzir localmente seguindo as instruções

---

## 📜 Licença

Estes testes foram criados como parte do Desafio Técnico Maxiprod.

---

**Última atualização:** Abril 15, 2026  
**Status:** ✅ Pronto para Análise  
