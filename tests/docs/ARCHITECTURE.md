# 🏗️ Arquitetura de Testes - Maxiprod

Documento técnico descrevendo a estratégia, organização e fluxo de testes do projeto Maxiprod.

---

## 📐 Visão Geral da Estratégia

A estratégia de testes segue o modelo de **Pirâmide de Testes**, onde:

```
           E2E (5-10%)
          /           \
       Integração    Integração
       (20-30%)      (20-30%)
        /               \
    Unit Tests (65-75%)
```

### Princípios Adotados

1. **Teste Primero (TDD-ish)** - Testes guiam a compreensão de requisitos
2. **Isolamento** - Cada teste é independente
3. **Clareza** - Nomes descritivos, código legível
4. **Foco em Regras** - Testar negócio, não implementação
5. **Manutenibilidade** - Fácil atualizar quando regra muda

---

## 🎯 Regras de Negócio & Estratégia de Teste

### Regra 1: Menor Não Pode Ter Receita

**Estratégia:**

```
┌─────────────────────────────────────┐
│ REGRA: Idade < 18 → Sem Receita    │
└─────────────────────────────────────┘
         ↓
    ┌─────────────────────┐
    │  Unit Tests        │ ← Lógica pura
    │  (5 testes)        │   Rápido, isolado
    └────────┬────────────┘
             ↓
    ┌─────────────────────┐
    │  Integration Tests  │ ← API real
    │  (2 testes)        │   Valida endpoint
    └────────┬────────────┘
             ↓
    ┌─────────────────────┐
    │  E2E Tests         │ ← User flow
    │  (1 teste)         │   UI completa
    └─────────────────────┘
```

**Cobertura:**
- ✅ Maior ≥ 18: pode receita
- ❌ Menor < 18: sem receita
- ✅ Qualquer idade: pode despesa
- 🔄 Edge cases: 18 exato, 17, 10

**Arquivos:**
- Backend: `tests/backend/Unit/MenorIdadeNaoTemReceitaTests.cs`
- Backend: `tests/backend/Integration/ApiIntegrationTests.cs`
- Frontend: `tests/frontend/src/tests/unit/rules.test.ts`
- Frontend: `tests/frontend/src/tests/e2e/app.spec.ts`

---

### Regra 2: Categoria Respeita Finalidade

**Estratégia:**

```
┌──────────────────────────────────────┐
│ Categorias: Receita, Despesa, Ambas │
│ Validação: Tipo TX = Tipo Categoria │
└──────────────────────────────────────┘
         ↓
    ┌─────────────────────┐
    │  Unit Tests        │ ← Matriz de validação
    │  (5 testes)        │   Todos os matches
    └────────┬────────────┘
             ↓
    ┌─────────────────────┐
    │  Integration Tests  │ ← HTTP requests
    │  (3 testes)        │   Rejeitar invalid
    └────────┬────────────┘
             ↓
    ┌─────────────────────┐
    │  E2E Tests         │ ← UI validation
    │  (2 testes)        │   Dropdown behavior
    └─────────────────────┘
```

**Matriz de Testes:**
|Categoria|Receita TX|Despesa TX|
|---------|----------|----------|
|Receita|✅|❌|
|Despesa|❌|✅|
|Ambas|✅|✅|

---

### Regra 3: Exclusão em Cascata

**Estratégia:**

```
┌────────────────────────────────────┐
│ Delete Pessoa → Delete Transações  │
│ Atomic: Tudo ou Nada               │
└────────────────────────────────────┘
         ↓
    ┌──────────────────────┐
    │  Unit Tests         │ ← Lógica de remoção
    │  (4 testes)         │   Sem BD
    └────────┬─────────────┘
             ↓
    ┌──────────────────────┐
    │  Integration Tests   │ ← Com BD real
    │  (2 testes)         │   Validar cascata
    └────────┬─────────────┘
             ↓
    ┌──────────────────────┐
    │  E2E Tests          │ ← User deleta pessoa
    │  (1 teste)          │   UI atualiza
    └──────────────────────┘
```

**Cenários:**
- ✅ Pessoa com 3: todas saem
- ✅ Pessoa com 10: todas saem
- ✅ Outra pessoa não afeta
- ✅ Sem transações: pode delete
- ❌ Inexistente: erro

---

## 📂 Estrutura de Pastas

```
tests/
├── backend/                          # .NET / xUnit
│   ├── MaxiprodTests.csproj
│   ├── Fixture/                      # Dados de teste reutilizáveis
│   │   └── PessoaFixture.cs
│   ├── Unit/                         # 60-70% dos testes
│   │   ├── MenorIdadeNaoTemReceitaTests.cs
│   │   ├── CategoriaFinalidadeTests.cs
│   │   └── ExclusaoCascataTests.cs
│   ├── Integration/                  # 20-30% dos testes
│   │   ├── ApiIntegrationTests.cs
│   │   ├── CategoriaIntegrationTests.cs
│   │   └── DatabaseTests.cs
│   └── Mocks/                        # Mocks & Stubs
│       └── HttpClientMock.cs
│
├── frontend/                         # React / TypeScript
│   ├── package.json
│   ├── vitest.config.ts
│   ├── playwright.config.ts
│   ├── src/tests/
│   │   ├── setup.ts                  # Configuração global
│   │   ├── unit/                     # 60-70% dos testes
│   │   │   └── rules.test.ts
│   │   ├── e2e/                      # 5-10% dos testes
│   │   │   └── app.spec.ts
│   │   └── fixtures/                 # Dados de teste
│   │       └── pessoa-data.ts
│   └── test-results/                 # Gerado após execução
│       ├── index.html
│       └── traces/
│
└── docs/                             # Documentação
    ├── README.md                     # Como rodar testes
    ├── BUGS.md                       # Bugs encontrados
    ├── ARCHITECTURE.md               # Este arquivo
    ├── TEST_PYRAMID.md               # Detalhes pirâmide
    └── BEST_PRACTICES.md             # Padrões & convenções
```

---

## 🔄 Fluxo de Execução dos Testes

### Local (Desenvolvimento)

```
Developer escreve código
  ↓
npm run test              (Vitest - rápido, watch mode)
  ├─ Errors? → Fix
  └─ OK? → Próximo
  ↓
dotnet test               (.NET - testes unitários)
  ├─ Errors? → Fix
  └─ OK? → Próximo
  ↓
npm run e2e               (Playwright - E2E)
  ├─ Flaky? → Investigate/Fix
  └─ OK? → Commit
  ↓
git push
```

### CI/CD (GitHub Actions)

```
Push → GitHub
  ↓
CI Pipeline
  ├─ dotnet restore
  ├─ dotnet build
  ├─ dotnet test
  │   └─ Unit + Integration
  │
  ├─ npm install (frontend)
  ├─ npm run test
  │   └─ Unit tests
  │
  ├─ npm run e2e
  │   └─ E2E tests
  │       └─ (só em main branch)
  │
  ├─ Coverage report
  ├─ Upload results
  └─ Notify team
```

---

## 🧪 Padrões de Teste

### Unit Test Pattern

```csharp
[Fact]  // xUnit
public void Descricao_Clara_Do_Teste()
{
    // ARRANGE - Preparar cenário
    var entrada = CriarEntradaTeste();
    
    // ACT - Executar ação
    var resultado = ClasseObjetoDeAssertivas.DistribuicaoTeste(entrada);
    
    // ASSERT - Verificar resultado
    resultado.Should().BeExpectedValue();
}
```

### Integration Test Pattern

```csharp
[Fact]
public async Task Descricao_Do_Fluxo_Integrado()
{
    // ARRANGE
    using var httpClient = new HttpClient { BaseAddress = new Uri(ApiBaseUrl) };
    var dados = CriarDadosDeTeste();
    
    // ACT
    var response = await httpClient.PostAsync("/api/endpoint", content);
    
    // ASSERT
    response.IsSuccessStatusCode.Should().BeTrue();
}
```

### E2E Test Pattern (Playwright)

```typescript
test("Scenario description in user language", async ({ page }) => {
    // Navigate
    await page.goto('/');
    
    // Interact
    await page.click('button:has-text("Create")');
    await page.fill('input[name="name"]', 'Test');
    
    // Verify
    await expect(page.locator('text=Success')).toBeVisible();
});
```

---

## 📊 Métricas & Monitoramento

### Cobertura de Testes

```
├─ Line Coverage: 75% → Target: 80%
├─ Branch Coverage: 70% → Target: 75%
├─ Function Coverage: 80% → Target: 85%
└─ Statement Coverage: 75% → Target: 80%
```

### Tempo de Execução

| Tipo | Tempo | Crítico? |
|------|-------|----------|
| Unit (.NET) | ~500ms | ❌ Rápido |
| Unit (Frontend) | ~300ms | ❌ Rápido |
| Integration | ~30s | ⚠️ Médio |
| E2E | ~15min | ⚠️ Longo |
| TOTAL CI | ~16min | ❌ Aceitável |

### Tendências Desejáveis

- ✅ Testes passam 100%
- ✅ Cobertura crescente
- ✅ Tempo estável ou melhorando
- ✅ Novos bugs encontrados → Novos testes

---

## 🛠️ Tecnologias Utilizadas

### Backend

```
.NET 8.0              Framework principal
xUnit                 Test framework
FluentAssertions      Assertions fluentes
Moq                   Mocking
RestSharp             HTTP requests
```

### Frontend

```
React 18              UI framework
TypeScript            Linguagem tipada
Vitest                Test runner (baseado em Vite)
Playwright            E2E testing
@testing-library/react Component testing
```

### CI/CD

```
GitHub Actions        Automação
YAML Workflow         Pipeline definition
```

---

## 🔐 Segurança dos Testes

### Dados Sensíveis

```
❌ NUNCA:
- Hardcoded senhas
- Dados reais de produção
- CPF/Email de verdade

✅ SEMPRE:
- Fixture data (faker)
- Mocks de serviços
- Dados aleatórios
```

### Isolamento

```
✅ Testes isolados
├─ Sem ordem de execução
├─ Limpeza após cada test
├─ Mock de dependências externas
└─ Sem efeitos colaterais
```

---

## 📝 Guideline de Nomenclatura

### Variáveis

```csharp
// ❌ Ruim
var x = 17;
var res = CalcIdade(x);

// ✅ Bom
var idadeEmAnos = 17;
var permitidoTeReceita = ValidarPermissaoReceita(idadeEmAnos);
```

### Métodos de Teste

```
{MethodUnderTest}_{Scenario}_{ExpectedBehavior}

Exemplo:
ValidarPermissaoReceita_PessoaMenorDe18_DeveRetornarFalse
CriarTransacao_CategoriaIncompativel_DeveRejeitarComErro
DeletePessoa_ComTransacoes_DeveRemocrEmCascata
```

---

## 🐛 Debugging de Testes

### Backend

```bash
# Modo verbose
dotnet test --verbosity detailed

# Parar no primeiro erro
dotnet test --no-build

# Debug no VS Code
dotnet test --configuration Debug
```

### Frontend (Vitest)

```bash
# Watch mode
npm run test -- --watch

# UI visual
npm run test:ui

# Specific file
npm run test -- rules.test.ts
```

### E2E (Playwright)

```bash
# Debug interativo
npm run e2e:debug

# Headed (ver navegador)
npm run e2e -- --headed

# Slow motion
npm run e2e -- --headed --workers=1
```

---

## 📚 Referências

- **Pirâmide de Testes:** https://martinfowler.com/bliki/TestPyramid.html
- **xUnit Docs:** https://xunit.net/
- **Vitest:** https://vitest.dev/
- **Playwright:** https://playwright.dev/
- **Testing Library:** https://testing-library.com/

---

**Última atualização:** Abril 14, 2026  
**Versão:** 1.0  
**Status:** ✅ Completo  
