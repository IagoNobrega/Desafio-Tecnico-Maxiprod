# ✨ Boas Práticas de Testes - Maxiprod

Guia de padrões, convenções e melhores práticas para escrever testes de qualidade.

---

## 🎯 Princípios Fundamentais

### 1. Testes Devem Ser SMART

```
S - Specific      (Específico, teste uma coisa)
M - Meaningful    (Significativo, testa regra de negócio)
A - Automated     (Automatizado, sem intervenção manual)
R - Reliable      (Confiável, resultado sempre igual)
T - Timely        (Oportuno, executa rápido)
```

### 2. Um Assert por Teste (Idealmente)

```csharp
// ❌ Múltiplos asserts (difícil de debugar)
[Fact]
public void TestMultiplos()
{
    var resultado = MinhaFuncao();
    resultado.IsValid.Should().BeTrue();
    resultado.Value.Should().Be(100);
    resultado.Message.Should().Contain("sucesso");
}

// ✅ Um assert (claro)
[Fact]
public void IsShouldValidateInput()
{
    var resultado = MinhaFuncao();
    resultado.IsValid.Should().BeTrue();
}

[Fact]
public void ShouldReturnCorrectValue()
{
    var resultado = MinhaFuncao();
    resultado.Value.Should().Be(100);
}
```

### 3. Nomes Descritivos (Given-When-Then)

```csharp
// ❌ Ruim
[Fact]
public void Test1() { }

// ✅ Bom: {MethodUnderTest}_{Scenario}_{ExpectedResult}
[Fact]
public void ValidarReceita_PessoaMenor18Anos_DeveRetornarFalse() { }

// ✅ Alternativo: Given_When_Then
[Fact]
public void GivenPessoaComIdade17_WhenValidandoReceita_ThenDeveRetornarFalso() { }
```

### 4. Arrange-Act-Assert Explícito

```csharp
[Fact]
public void Exemplo()
{
    // === ARRANGE ===
    var pessoa = new Pessoa { DataNascimento = DateTime.Now.AddYears(-17) };
    var validador = new ValidadorReceita();
    
    // === ACT ===
    var resultado = validador.CanHaveReceita(pessoa);
    
    // === ASSERT ===
    resultado.Should().BeFalse();
}
```

### 5. DRY (Don't Repeat Yourself) com Fixtures

```csharp
// ❌ Repetição
[Fact]
public void Test1()
{
    var pessoa = new Pessoa { Id = 1, Nome = "João" };
    // ...
}

[Fact]
public void Test2()
{
    var pessoa = new Pessoa { Id = 1, Nome = "João" };
    // ...
}

// ✅ Fixture reutilizável
public class PessoaFixture
{
    public Pessoa CriarPessoaAdulta() => new Pessoa 
    { 
        Id = 1, 
        Nome = "João",
        DataNascimento = DateTime.Now.AddYears(-25)
    };
}

public class MinhasTestesSemRepeticao
{
    private readonly PessoaFixture _fixture = new();
    
    [Fact]
    public void Test1()
    {
        var pessoa = _fixture.CriarPessoaAdulta();
        // ...
    }
}
```

---

## 🎓 Padrões por Tipo de Teste

### Unit Tests

```csharp
[Fact]
[Category("Unit")]
public void PessoaMaiorOu18Anos_PodemTeReceita()
{
    // Arrange
    var idades = new[] { 18, 19, 25, 50, 100 };
    
    // Act & Assert
    foreach (var idade in idades)
    {
        var resultado = ValidarReceita(idade);
        resultado.Should().BeTrue($"Pessoa com {idade} anos deve poder ter receita");
    }
}

[Theory]
[InlineData(18, true)]
[InlineData(17, false)]
[InlineData(10, false)]
[Category("Unit")]
public void ValidarReceita_VariasIdades(int idade, bool esperado)
{
    var resultado = ValidarReceita(idade);
    resultado.Should().Be(esperado);
}
```

### Integration Tests

```csharp
[Fact]
[Category("Integration")]
public async Task Deve_Criar_Pessoa_Via_API_E_Validar_Banco()
{
    // Arrange
    var novasPessoa = new CreatePessoaDto 
    { 
        Nome = "Maria Silva",
        DataNascimento = DateTime.Now.AddYears(-25)
    };

    // Act
    var response = await _httpClient.PostAsJsonAsync("/api/pessoas", novasPessoa);
    var pessoaCriada = await response.Content.ReadFromJsonAsync<PessoaDto>();

    // Assert
    response.IsSuccessStatusCode.Should().BeTrue();
    pessoaCriada.Nome.Should().Be("Maria Silva");
    
    // Validar que foi salvo no banco
    var pessoaDoBanco = await _repository.GetById(pessoaCriada.Id);
    pessoaDoBanco.Should().NotBeNull();
}
```

### E2E Tests (Playwright)

```typescript
test("User flow: create person and add transaction", async ({ page }) => {
    // Navigate
    await page.goto('/');
    
    // Create person
    await page.click('button:has-text("Nova Pessoa")');
    await page.fill('input[placeholder="Nome"]', 'João Silva');
    await page.fill('input[type="date"]', '1999-05-15');
    await page.click('button:has-text("Salvar")');
    
    // Verify
    await expect(page.locator('text=Pessoa criada com sucesso')).toBeVisible();
    
    // Add transaction
    await page.click('a:has-text("Transações")');
    await page.click('button:has-text("Nova Transação")');
    await page.selectOption('select[name="pessoaId"]', { label: 'João Silva' });
    await page.selectOption('select[name="tipo"]', 'Receita');
    await page.fill('input[name="valor"]', '1000');
    await page.click('button:has-text("Salvar")');
    
    // Verify transaction
    await expect(page.locator('text=Transação criada com sucesso')).toBeVisible();
});
```

---

## 🧹 Limpeza & Teardown

### Backend

```csharp
public class MeuTesteComLimpeza : IDisposable
{
    private readonly DbContext _context;
    
    public MeuTesteComLimpeza()
    {
        // Setup
        _context = new DbContext();
    }
    
    [Fact]
    public void MeuTeste()
    {
        // Test
    }
    
    public void Dispose()
    {
        // Teardown - sempre executado
        _context?.Dispose();
    }
}
```

### Frontend (Vitest)

```typescript
import { beforeEach, afterEach } from 'vitest';

describe('Meus testes', () => {
    beforeEach(() => {
        // Setup antes de cada teste
        localStorage.clear();
    });

    afterEach(() => {
        // Teardown após cada teste
        // cleanup() é automático com @testing-library/react
    });

    it('test', () => {
        // test
    });
});
```

---

## 🔍 Técnicas de Assertion Avançadas

### FluentAssertions (.NET)

```csharp
// String
resultado.Should().Be("esperado");
resultado.Should().Contain("substring");
resultado.Should().StartWith("pre");
resultado.Should().Match("*padrão*");

// Números
resultado.Should().Be(5);
resultado.Should().BeGreaterThan(3);
resultado.Should().BeBetween(0, 10);

// Collections
lista.Should().HaveCount(3);
lista.Should().Contain(x => x.Id == 1);
lista.Should().AllSatisfy(x => x.IsActive);

// Objetos
pessoa.Should().BeEquivalentTo(pessoaEsperada);
pessoa.Should().HaveProperty(x => x.Nome);

// Exceções
action.Should().Throw<ArgumentException>()
    .WithMessage("*error*");
```

### Testing Library (React)

```typescript
import { render, screen, within } from '@testing-library/react';

// Queries
screen.getByRole('button', { name: /submit/i });
screen.getByPlaceholderText('Enter name');
screen.getByDisplayValue('current');

// Assertions
expect(element).toBeInTheDocument();
expect(element).toBeVisible();
expect(element).toHaveClass('active');
expect(element).toHaveAttribute('disabled');

// Async
await screen.findByText('Loaded');
await waitFor(() => expect(element).toBeInTheDocument());
```

---

## 🚀 Performance & Otimização

### Paralelização

```csharp
// xUnit: paralelo por default, configure se necessário
// Desabilitar paralelismo para testes que compartilham estado
[Collection("Database collection")]
public class MeuTesteComEstadoCompartilhado { }
```

### Mocking vs Real

```csharp
// ❌ Não fazer - testa implementação, não comportamento
[Fact]
public void TestsImplementationDetail()
{
    var mock = new Mock<IService>();
    mock.Verify(x => x.Method(), Times.Once);
}

// ✅ Fazer - testa comportamento
[Fact]
public void ShouldCallServiceWhenNeeded()
{
    var mock = new Mock<IService>();
    mock.Setup(x => x.GetData()).Returns("data");
    
    var resultado = new MyClass(mock.Object).DoSomething();
    
    resultado.Should().Contain("data");
}
```

---

## 🐛 Debugging de Testes Falhando

### Backend

```bash
# Parar no primeiro erro
dotnet test --no-build --logger "console;verbosity=detailed"

# Debug em VS Code
dotnet test --configuration Debug

# Log detalhado
dotnet test --verbosity diagnostic
```

### Frontend

```bash
# Modo watch
npm run test -- --watch

# Debug específico
npm run test -- rules.test.ts --watch

# Playwright debug
npm run e2e:debug

# Screenshot on failure
npm run e2e -- --screenshot on
```

---

## 📋 Checklist de Qualidade

Antes de fazer commit:

- [ ] Teste tem nome descritivo
- [ ] Segue padrão AAA (Arrange-Act-Assert)
- [ ] Foca em uma coisa (Single Responsibility)
- [ ] Sem hardcoding de dados (use fixtures)
- [ ] Sem sleeps/timeouts (exceto E2E com necessidade)
- [ ] Setup/teardown correto
- [ ] Independente de outros testes
- [ ] Passa 100% das vezes
- [ ] Comentado se necessário
- [ ] Documentação atualizada

---

## 🔗 Padrões de Dados

### Factories

```csharp
public class PessoaFactory
{
    private int _id = 1;
    
    public Pessoa CriarPessoaAdulta(string nome = "João")
        => new()
        {
            Id = _id++,
            Nome = nome,
            DataNascimento = DateTime.Now.AddYears(-25),
            CPF = "12345678901"
        };
    
    public Pessoa CriarPessoaMenor(string nome = "Maria")
        => new()
        {
            Id = _id++,
            Nome = nome,
            DataNascimento = DateTime.Now.AddYears(-15),
            CPF = "98765432109"
        };
}
```

### Builders

```csharp
public class PessoaBuilder
{
    private readonly Pessoa _pessoa = new();
    
    public PessoaBuilder ComNome(string nome)
    {
        _pessoa.Nome = nome;
        return this;
    }
    
    public PessoaBuilder ComIdade(int anos)
    {
        _pessoa.DataNascimento = DateTime.Now.AddYears(-anos);
        return this;
    }
    
    public Pessoa Build() => _pessoa;
}

// Uso
var pessoa = new PessoaBuilder()
    .ComNome("João")
    .ComIdade(25)
    .Build();
```

---

## 📚 Ressources Adicionais

- **xUnit Documentation**: https://xunit.net/docs/getting-started/netcore
- **FluentAssertions**: https://fluentassertions.com/
- **Vitest**: https://vitest.dev/
- **Playwright**: https://playwright.dev/docs/intro
- **Testing Library Best Practices**: https://testing-library.com/docs/queries/about

---

**Última atualização:** Abril 14, 2026  
**Versão:** 1.0  
**Status:** ✅ Completo
