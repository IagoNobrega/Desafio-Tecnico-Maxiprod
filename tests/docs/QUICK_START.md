# 🚀 Quick Start - Seu Primeiro Teste

Guia prático passo-a-passo para começar a rodar testes em 5 minutos.

---

## ✅ Pré-requisitos (Verificar)

```bash
# .NET 8.0+
dotnet --version

# Node.js 18+
node --version
npm --version
```

Se faltar algo:
- **.NET**: Download em https://dotnet.microsoft.com/download
- **Node.js**: Download em https://nodejs.org/

---

## 🏃 Começar a Rodar Testes Agora

### 1️⃣ Backend - Testes Unitários (.NET)

**Tempo:** ~1 minuto

```bash
cd tests/backend
dotnet test
```

**O que esperar:**
```
✅ 24 testes passaram (aprox.)
❌ Alguns testes podem falhar (veja docs/BUGS.md)
⏱️  ~500ms de execução
```

### 2️⃣ Frontend - Testes Unitários (TypeScript)

**Tempo:** ~2 minutos

```bash
cd tests/frontend
npm install
npm run test:run
```

**O que esperar:**
```
✅ 15 testes passaram
⏱️  ~300ms de execução
```

### 3️⃣ Frontend - Testes E2E (Playwright)

**Tempo:** ~5 minutos (primeira vez instala browsers)

```bash
cd tests/frontend
npm run e2e
```

**O que esperar:**
```
✅ ~5 testes rodam no navegador
🎬 Screenshots (se falhar) em playwright-report/
⏱️  ~15 minutos (primeira execução pode ser lenta)
```

---

## 🎯 Testes Específicos

### Testar Apenas "Menor de Idade"

```bash
# Backend
cd tests/backend
dotnet test --filter "Name~MenorIdade"

# Frontend
cd tests/frontend
npm run test -- rules.test.ts
```

### Testar Apenas "Categorias"

```bash
# Backend
cd tests/backend
dotnet test --filter "Name~Categoria"
```

### Testar Apenas "Exclusão"

```bash
# Backend
cd tests/backend
dotnet test --filter "Name~Exclusao"
```

---

## 📊 Visualizar Resultados

### Modo Watch (Automático ao Salvar)

```bash
cd tests/frontend
npm run test -- --watch
```

Salve um arquivo e veja os testes rodarem automaticamente!

### UI Interativa (Vitest)

```bash
cd tests/frontend
npm run test:ui
```

Abre no navegador em `127.0.0.1:51204`

### Relatório Playwright

```bash
cd tests/frontend
npm run e2e:report
```

---

## 🐛 Se Algo Falhar

### Backend não roda

```bash
# Limpar cache
cd tests/backend
rm -r bin obj
dotnet restore
dotnet build
```

### Frontend não roda

```bash
# Limpar cache
cd tests/frontend
rm -rf node_modules package-lock.json
npm install
```

### Playwright com erro

```bash
cd tests/frontend
npx playwright install --with-deps
```

---

## 📚 Próximos Passos

1. **Leia a documentação:**
   - [README.md](../README.md) - Visão geral completa
   - [docs/BUGS.md](../docs/BUGS.md) - Bugs encontrados
   - [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) - Estrutura profunda

2. **Explore os testes:**
   - `backend/Unit/MenorIdadeNaoTemReceitaTests.cs`
   - `frontend/src/tests/unit/rules.test.ts`
   - `frontend/src/tests/e2e/app.spec.ts`

3. **Escreva seu próprio teste:**
   ```csharp
   // backend/Unit/MeuPrimeiroTeste.cs
   [Fact]
   public void MeuPrimeiroTeste()
   {
       var resultado = 2 + 2;
       resultado.Should().Be(4);
   }
   ```

---

## 💡 Dicas Rápidas

| Ação | Comando |
|------|---------|
| **Rodar todos** | `cd tests && dotnet test && cd frontend && npm run test:run` |
| **Verbose** | `dotnet test --verbosity detailed` |
| **Parar no 1º erro** | `dotnet test --no-build` |
| **Copiar teste E2E** | Copie de `frontend/src/tests/e2e/app.spec.ts` |
| **Debug** | `npm run test -- --inspect-brk` |
| **Limpar** | `rm -rf bin obj node_modules` |

---

## ✨ Estrutura de Arquivos

```
tests/
├── backend/
│   ├── Unit/                    ← Testes rápidos
│   ├── Integration/             ← Testes com API
│   └── MaxiprodTests.csproj
│
├── frontend/
│   ├── src/tests/unit/          ← Testes rápidos
│   ├── src/tests/e2e/           ← Testes no navegador
│   └── package.json
│
└── README.md                    ← Leia primeiro!
```

---

## 🎓 Conceitos Básicos

### Pirâmide de Testes

```
        E2E (Lento)
       Integração (Médio)
        Unit (Rápido)
```

- **Unit**: 60-70% (rápido, muitos)
- **Integration**: 20-30% (médio, alguns)
- **E2E**: 5-10% (lento, poucos)

### As 3 Regras de Negócio Testadas

1. ❌ **Menor não pode ter receita** (< 18 anos)
2. 📂 **Categoria respeita tipo** (Receita/Despesa/Ambas)
3. 🗑️ **Deletar pessoa remove transações** (em cascata)

---

## 🤔 FAQ

**P: Quanto tempo leva para rodar tudo?**  
R: ~2 minutos (.NET) + ~5 minutos (Frontend) = ~7 minutos total

**P: Por que alguns testes estão comentados?**  
R: Requerem API/Frontend rodando em localhost

**P: Posso rodar apenas unit tests?**  
R: Sim! Use `dotnet test --filter Category=Unit`

**P: Como adiciono um novo teste?**  
R: Copie um teste existente, mude o nome e a lógica

---

## 🆘 Precisa de Ajuda?

1. Verifique [BUGS.md](../docs/BUGS.md)
2. Leia [README.md](../README.md) completo
3. Consulte [BEST_PRACTICES.md](../docs/BEST_PRACTICES.md)
4. Veja [ARCHITECTURE.md](../docs/ARCHITECTURE.md)

---

**Boa sorte! 🍀**

Depois de rodar os testes, leia a documentação para entender como tudo funciona.
