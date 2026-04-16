import { test, expect } from '@playwright/test';

/**
 * Testes E2E - Regras de Negócio
 */
test.describe('Regras de Negócio', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Maxiprod - Sistema de Gestão')).toBeVisible();
  });

  test('deve rejeitar criação de receita para menor de idade', async ({ page }) => {
    await test.step('Navegar para transações', async () => {
      await page.getByTestId('nav-transacoes').click();
    });
    
    await test.step('Clicar em Nova Transação', async () => {
      await page.getByTestId('btn-nova-transacao').click();
    });
    
    await test.step('Preencher transação inválida', async () => {
      await page.selectOption('select[name="pessoaId"]', '2');
      await page.selectOption('select[name="tipo"]', 'Receita');
      await page.fill('input[name="valor"]', '100');
      await page.fill('input[name="descricao"]', 'Teste receita menor');
    });
    
    await test.step('Tentar salvar', async () => {
      await page.getByTestId('btn-salvar-transacao').click();
    });
    
    await expect(page.locator('text=Menor de idade não pode ter receitas')).toBeVisible();
  });

  test('deve rejeitar categoria Receita em transação de Despesa', async ({ page }) => {
    await test.step('Navegar para transações', async () => {
      await page.getByTestId('nav-transacoes').click();
    });
    
    await test.step('Clicar em Nova Transação', async () => {
      await page.getByTestId('btn-nova-transacao').click();
    });
    
    await test.step('Tentar criar despesa com categoria Receita', async () => {
      await page.selectOption('select[name="tipo"]', 'Despesa');
      await page.selectOption('select[name="categoriaId"]', '1');
      await page.fill('input[name="valor"]', '100');
      await page.fill('input[name="descricao"]', 'Teste despesa');
    });
    
    await test.step('Salvar transação', async () => {
      await page.getByTestId('btn-salvar-transacao').click();
    });
    
    // Verificar erro
    await expect(page.locator('text=Categoria incompatível com tipo de transação')).toBeVisible();
  });

  test('deve permitir categoria Ambas em qualquer tipo', async ({ page }) => {
    // Navegar para transações
    await page.getByTestId('nav-transacoes').click();
    
    // Criar duas transações com categoria Ambas
    for (const tipo of ['Receita', 'Despesa']) {
      await test.step(`Criar transação ${tipo} com categoria Ambas`, async () => {
        await page.getByTestId('btn-nova-transacao').click();
        
        await page.selectOption('select[name="categoriaId"]', '4');
        await page.selectOption('select[name="tipo"]', tipo);
        await page.fill('input[name="valor"]', '50');
        await page.fill('input[name="descricao"]', `Teste ${tipo}`);
        
        await page.getByTestId('btn-salvar-transacao').click();
        
        // Verificar sucesso
        await expect(page.locator('text=Transação criada com sucesso')).toBeVisible();
      });
    }
  });

  test('deve remover transações ao excluir pessoa', async ({ page }) => {
    // Navegar e selecionar a pessoa com transações existentes
    const pessoaComTransacoes = page.locator('[data-testid="pessoa-row"][data-pessoa-id="2"]');
    await expect(pessoaComTransacoes).toHaveCount(1);

    // Verificar que ela possui transações
    const numeroTransacoes = await pessoaComTransacoes.locator('[data-testid="transacoes-count"]').textContent();
    expect(Number(numeroTransacoes)).toBeGreaterThan(0);

    await test.step('Excluir pessoa', async () => {
      await pessoaComTransacoes.locator('[data-testid="btn-excluir"]').click();
      await expect(page.locator('[data-testid="confirm-delete"]')).toBeVisible();
      await page.locator('[data-testid="confirm-delete"]').click();
    });

    // Verificar sucesso
    await expect(page.locator('text=Pessoa removida com sucesso')).toBeVisible();
    await expect(page.locator('[data-testid="pessoa-row"][data-pessoa-id="2"]')).toHaveCount(0);

    // Garantir que as transações do usuário foram removidas
    await page.getByTestId('nav-transacoes').click();
    await expect(page.getByTestId('btn-nova-transacao')).toBeVisible();
    const transacoesPessoa = page.locator('[data-testid="transacao-row"][data-pessoa-id="2"]');
    expect(await transacoesPessoa.count()).toBe(0);
  });
});