import { test, expect } from '@playwright/test';

/**
 * Testes E2E - Fluxo de Pessoas
 */
test.describe('Fluxo de Pessoas', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('deve navegar para página de pessoas', async ({ page }) => {
    // Verificar navegação
    expect(page.url()).toContain('127.0.0.1:5174');
  });

  test('deve criar uma nova pessoa maior de idade', async ({ page }) => {
    // Navegar para formulário
    await page.click('button:has-text("Nova Pessoa")');
    
    // Preencher formulário
    await page.fill('input[name="nome"]', `Pessoa Teste ${Date.now()}`);
    await page.fill('input[name="dataNascimento"]', '1999-05-15');
    await page.fill('input[name="cpf"]', '12345678901');
    
    // Submeter
    await page.click('button:has-text("Salvar")');
    
    // Verificar sucesso
    await expect(page.locator('text=Pessoa criada com sucesso')).toBeVisible();
  });

  test('deve listar pessoas criadas', async ({ page }) => {
    // Verificar se há lista de pessoas
    const tabela = page.locator('table');
    await expect(tabela).toBeVisible();
    
    // Verificar se há pelo menos uma pessoa
    const linhas = page.locator('table tbody tr');
    expect(await linhas.count()).toBeGreaterThan(0);
  });

  test('deve editar uma pessoa', async ({ page }) => {
    const primeiraLinha = page.locator('table tbody tr').first();
    await primeiraLinha.locator('button:has-text("Editar")').click();
    
    // Modificar nome
    const nomeInput = page.locator('input[name="nome"]');
    await nomeInput.clear();
    await nomeInput.fill(`Pessoa Editada ${Date.now()}`);
    
    // Salvar
    await page.click('button:has-text("Salvar")');
    
    // Verificar sucesso
    await expect(page.locator('text=Pessoa atualizada com sucesso')).toBeVisible();
  });

  test('deve excluir uma pessoa', async ({ page }) => {
    const primeiraLinha = page.locator('table tbody tr').first();
    await primeiraLinha.locator('button:has-text("Excluir")').click();
    
    await page.click('button:has-text("Confirmar")');
    
    await expect(page.locator('text=Pessoa removida com sucesso')).toBeVisible();
  });
});

/**
 * Testes E2E - Regra de Negócio: Menor de Idade Não Pode Ter Receita
 */
test.describe('Menor de Idade Não Pode Ter Receita', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Aguarda o app carregar e fecha overlay de erro se existir
    await page.waitForTimeout(1000);
    const errorOverlay = page.locator('.vite-error-overlay');
    if (await errorOverlay.isVisible().catch(() => false)) {
      await page.keyboard.press('Escape');
    }
    
    // Aguarda elementos da aplicação
    await page.waitForSelector('button:has-text("Nova Pessoa")', { timeout: 10000 });
  });

  test('deve rejeitar criação de receita para menor de idade', async ({ page }) => {
    await page.click('a:has-text("Transações")');
    await page.click('button:has-text("Nova Transação")');

    await page.selectOption('select[name="pessoaId"]', '2');
    await page.selectOption('select[name="tipo"]', 'Receita');
    await page.fill('input[name="valor"]', '100');
    await page.fill('input[name="descricao"]', 'Teste receita menor');

    await page.click('button:has-text("Salvar Transação")');

    await expect(page.locator('text=Menor de idade não pode ter receitas')).toBeVisible();
  });

  test('deve permitir despesa para menor de idade', async ({ page }) => {
    // Navegar para transações
    await page.click('a:has-text("Transações")');
    
    // Criar uma nova transação
    await page.click('button:has-text("Nova Transação")');
    
    // Selecionar pessoa menor de idade
    await page.selectOption('select[name="pessoaId"]', '2');
    
    // Criar despesa
    await page.selectOption('select[name="tipo"]', 'Despesa');
    await page.selectOption('select[name="categoriaId"]', '2');
    
    // Preencher valores
    await page.fill('input[name="valor"]', '50');
    await page.fill('input[name="descricao"]', 'Mesada');
    
    // Submeter
    await page.click('button:has-text("Salvar Transação")');
    
    // Verificar sucesso
    await expect(page.locator('text=Transação criada com sucesso')).toBeVisible();
  });

  test('deve permitir receita para maior de idade', async ({ page }) => {
    // Navegar para transações
    await page.click('a:has-text("Transações")');
    
    // Criar uma nova transação
    await page.click('button:has-text("Nova Transação")');
    
    // Selecionar pessoa maior de idade
    await page.selectOption('select[name="pessoaId"]', '1');
    
    // Criar receita
    await page.selectOption('select[name="tipo"]', 'Receita');
    
    // Preencher valores
    await page.fill('input[name="valor"]', '1000');
    await page.fill('input[name="descricao"]', 'Salário');
    
    // Submeter
    await page.click('button:has-text("Salvar Transação")');
    
    // Verificar sucesso
    await expect(page.locator('text=Transação criada com sucesso')).toBeVisible();
  });
});

/**
 * Testes E2E - Regra de Negócio: Categoria por Finalidade
 */
test.describe('Categoria por Finalidade', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('deve rejeitar categoria Receita em transação de Despesa', async ({ page }) => {
    // Navegar para transações
    await page.click('a:has-text("Transações")');
    
    // Criar nova transação
    await page.click('button:has-text("Nova Transação")');
    
    // Tentar criar despesa
    await page.selectOption('select[name="tipo"]', 'Despesa');
    
    // Selecionar categoria Receita (que não deve estar disponível, mas vamos tentar)
    await page.selectOption('select[name="categoriaId"]', '1');
    
    // Preencher valores
    await page.fill('input[name="valor"]', '100');
    await page.fill('input[name="descricao"]', 'Teste despesa');
    
    // Submeter
    await page.click('button:has-text("Salvar Transação")');
    
    // Verificar erro
    await expect(page.locator('text=Categoria incompatível com tipo de transação')).toBeVisible();
  });

  test('deve permitir categoria Ambas em qualquer tipo', async ({ page }) => {
    // Navegar para transações
    await page.click('a:has-text("Transações")');
    
    // Criar duas transações com categoria Ambas
    for (const tipo of ['Receita', 'Despesa']) {
      await page.click('button:has-text("Nova Transação")');
      
      // Selecionar categoria Ambas
      await page.selectOption('select[name="categoriaId"]', '4');
      
      // Selecionar tipo
      await page.selectOption('select[name="tipo"]', tipo);
      
      // Preencher valores
      await page.fill('input[name="valor"]', '50');
      await page.fill('input[name="descricao"]', `Teste ${tipo}`);
      
      // Submeter
      await page.click('button:has-text("Salvar Transação")');
      
      // Verificar sucesso
      await expect(page.locator('text=Transação criada com sucesso')).toBeVisible();
    }
  });
});

/**
 * Testes E2E - Exclusão em Cascata
 */
test.describe('Exclusão em Cascata', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('deve remover transações ao excluir pessoa', async ({ page }) => {
    // Navegar e selecionar a pessoa com transações existentes
    const pessoaComTransacoes = page.locator('tr[data-test="pessoa-row"][data-pessoa-id="2"]');
    await expect(pessoaComTransacoes).toHaveCount(1);

    // Verificar que ela possui transações
    const numeroTransacoes = await pessoaComTransacoes.locator('[data-test="transacoes-count"]').textContent();
    expect(Number(numeroTransacoes)).toBeGreaterThan(0);

    // Excluir pessoa
    await pessoaComTransacoes.locator('button:has-text("Excluir")').click();
    await expect(page.locator('button[data-test="confirm-delete"]')).toBeVisible();
    await page.click('button[data-test="confirm-delete"]');

    // Verificar sucesso
    await expect(page.locator('text=Pessoa removida com sucesso')).toBeVisible();
    await expect(page.locator('tr[data-test="pessoa-row"][data-pessoa-id="2"]')).toHaveCount(0);

    // Garantir que as transações do usuário foram removidas usando a navegação interna do app
    await page.click('a:has-text("Transações")');
    await expect(page.locator('button:has-text("Nova Transação")')).toBeVisible();
    const transacoesPessoa = page.locator('tr[data-test="transacao-row"][data-pessoa-id="2"]');
    expect(await transacoesPessoa.count()).toBe(0);
  });
});
