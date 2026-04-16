import { test, expect } from '@playwright/test';

/**
 * Testes E2E - Transações
 */
test.describe('Transações', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Maxiprod - Sistema de Gestão')).toBeVisible();
  });

  test('deve permitir receita para maior de idade', async ({ page }) => {
    await test.step('Navegar para transações', async () => {
      await page.getByTestId('nav-transacoes').click();
    });
    
    await test.step('Clicar em Nova Transação', async () => {
      await page.getByTestId('btn-nova-transacao').click();
    });
    
    await test.step('Selecionar pessoa maior de idade', async () => {
      await page.selectOption('select[name="pessoaId"]', '1');
    });
    
    await test.step('Criar receita', async () => {
      await page.selectOption('select[name="tipo"]', 'Receita');
      await page.fill('input[name="valor"]', '1000');
      await page.fill('input[name="descricao"]', 'Salário');
    });
    
    await test.step('Salvar transação', async () => {
      await page.getByTestId('btn-salvar-transacao').click();
    });
    
    // Verificar sucesso
    await expect(page.locator('text=Transação criada com sucesso')).toBeVisible();
  });

  test('deve permitir despesa para menor de idade', async ({ page }) => {
    await test.step('Navegar para transações', async () => {
      await page.getByTestId('nav-transacoes').click();
    });
    
    await test.step('Clicar em Nova Transação', async () => {
      await page.getByTestId('btn-nova-transacao').click();
    });
    
    await test.step('Selecionar pessoa menor de idade', async () => {
      await page.selectOption('select[name="pessoaId"]', '2');
    });
    
    await test.step('Criar despesa', async () => {
      await page.selectOption('select[name="tipo"]', 'Despesa');
      await page.selectOption('select[name="categoriaId"]', '2');
      await page.fill('input[name="valor"]', '50');
      await page.fill('input[name="descricao"]', 'Mesada');
    });
    
    await test.step('Salvar transação', async () => {
      await page.getByTestId('btn-salvar-transacao').click();
    });
    
    // Verificar sucesso
    await expect(page.locator('text=Transação criada com sucesso')).toBeVisible();
  });
});