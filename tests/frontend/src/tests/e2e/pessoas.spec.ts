import { test, expect } from '@playwright/test';

/**
 * Testes E2E - Fluxo de Pessoas
 */
test.describe('Fluxo de Pessoas', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Garantir que a página carregou
    await expect(page.getByText('Maxiprod - Sistema de Gestão')).toBeVisible();
  });

  test('deve navegar para página de pessoas', async ({ page }) => {
    // Verificar navegação
    expect(page.url()).toContain('127.0.0.1:5174');
  });

  test('deve criar uma nova pessoa maior de idade', async ({ page }) => {
    await test.step('Clicar em Nova Pessoa', async () => {
      await page.getByTestId('btn-nova-pessoa').click();
    });
    
    await test.step('Preencher formulário', async () => {
      await page.fill('input[name="nome"]', `Pessoa Teste ${Date.now()}`);
      await page.fill('input[name="dataNascimento"]', '1999-05-15');
      await page.fill('input[name="cpf"]', '12345678901');
    });
    
    await test.step('Submeter formulário', async () => {
      await page.getByTestId('btn-salvar').click();
    });
    
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
    await test.step('Clicar em Editar', async () => {
      await primeiraLinha.getByTestId('btn-editar').click();
    });
    
    await test.step('Modificar nome', async () => {
      const nomeInput = page.locator('input[name="nome"]');
      await nomeInput.clear();
      await nomeInput.fill(`Pessoa Editada ${Date.now()}`);
    });
    
    await test.step('Salvar edição', async () => {
      await page.getByTestId('btn-salvar').click();
    });
    
    // Verificar sucesso
    await expect(page.locator('text=Pessoa atualizada com sucesso')).toBeVisible();
  });

  test('deve excluir uma pessoa', async ({ page }) => {
    const primeiraLinha = page.locator('table tbody tr').first();
    await test.step('Clicar em Excluir', async () => {
      await primeiraLinha.getByTestId('btn-excluir').click();
    });
    
    await test.step('Confirmar exclusão', async () => {
      await page.getByTestId('confirm-delete').click();
    });
    
    await expect(page.locator('text=Pessoa removida com sucesso')).toBeVisible();
  });
});