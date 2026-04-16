import { Page } from '@playwright/test';

export async function criarPessoa(page: Page, dados: { nome: string; dataNascimento: string; cpf: string }) {
  await page.getByTestId('btn-nova-pessoa').click();
  await page.fill('input[name="nome"]', dados.nome);
  await page.fill('input[name="dataNascimento"]', dados.dataNascimento);
  await page.fill('input[name="cpf"]', dados.cpf);
  await page.getByTestId('btn-salvar').click();
  await page.locator('text=Pessoa criada com sucesso').waitFor();
}

export async function criarTransacao(page: Page, dados: { pessoaId: string; tipo: 'Receita' | 'Despesa'; categoriaId: string; valor: number; descricao: string }) {
  await page.getByTestId('nav-transacoes').click();
  await page.getByTestId('btn-nova-transacao').click();
  await page.selectOption('select[name="pessoaId"]', dados.pessoaId);
  await page.selectOption('select[name="tipo"]', dados.tipo);
  await page.selectOption('select[name="categoriaId"]', dados.categoriaId);
  await page.fill('input[name="valor"]', dados.valor.toString());
  await page.fill('input[name="descricao"]', dados.descricao);
  await page.getByTestId('btn-salvar-transacao').click();
  await page.locator('text=Transação criada com sucesso').waitFor();
}

export async function resetarDados(page: Page) {
  // Implementar reset se necessário, por exemplo, recarregar a página ou usar API
  await page.reload();
}