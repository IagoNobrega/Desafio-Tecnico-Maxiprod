import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Testes Unitários - Validação de Idade
 * Regra: Menor de idade não pode ter receitas
 */
describe('Validação de Idade para Receitas', () => {
  
  // Mock das funções de validação
  const calcularIdade = (dataNascimento: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - dataNascimento.getFullYear();
    const monthDiff = today.getMonth() - dataNascimento.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dataNascimento.getDate())) {
      age--;
    }
    
    return age;
  };

  const podeTeReceita = (idade: number): boolean => {
    return idade >= 18;
  };

  const podeterDespesa = (idade: number): boolean => {
    return true; // Sem restrição
  };

  it('deve permitir receita para pessoa maior de 18 anos', () => {
    const dataNascimento = new Date();
    dataNascimento.setFullYear(dataNascimento.getFullYear() - 25);
    
    const idade = calcularIdade(dataNascimento);
    const podeReceita = podeTeReceita(idade);
    
    expect(podeReceita).toBe(true);
  });

  it('deve permitir receita para pessoa com exatamente 18 anos', () => {
    const dataNascimento = new Date();
    dataNascimento.setFullYear(dataNascimento.getFullYear() - 18);
    
    const idade = calcularIdade(dataNascimento);
    const podeReceita = podeTeReceita(idade);
    
    expect(podeReceita).toBe(true);
  });

  it('deve rejeitar receita para menor de idade', () => {
    const dataNascimento = new Date();
    dataNascimento.setFullYear(dataNascimento.getFullYear() - 17);
    
    const idade = calcularIdade(dataNascimento);
    const podeReceita = podeTeReceita(idade);
    
    expect(podeReceita).toBe(false);
  });

  it('deve rejeitar receita para criança', () => {
    const dataNascimento = new Date();
    dataNascimento.setFullYear(dataNascimento.getFullYear() - 10);
    
    const idade = calcularIdade(dataNascimento);
    const podeReceita = podeTeReceita(idade);
    
    expect(podeReceita).toBe(false);
  });

  it('deve permitir despesa para menor de idade', () => {
    const dataNascimento = new Date();
    dataNascimento.setFullYear(dataNascimento.getFullYear() - 10);
    
    const idade = calcularIdade(dataNascimento);
    const podeDespesa = podeterDespesa(idade);
    
    expect(podeDespesa).toBe(true);
  });
});

/**
 * Testes Unitários - Validação de Categorias
 */
describe('Validação de Categorias por Tipo', () => {
  
  type TipoCategoria = 'Receita' | 'Despesa' | 'Ambas';
  
  interface Categoria {
    id: number;
    nome: string;
    tipo: TipoCategoria;
  }

  const validarUsoCategoria = (categoria: Categoria, tipoTransacao: 'Receita' | 'Despesa'): boolean => {
    if (categoria.tipo === 'Ambas') return true;
    return categoria.tipo === tipoTransacao;
  };

  it('deve permitir categoria Receita em transação de receita', () => {
    const categoria: Categoria = { id: 1, nome: 'Salário', tipo: 'Receita' };
    const ehValida = validarUsoCategoria(categoria, 'Receita');
    expect(ehValida).toBe(true);
  });

  it('deve rejeitar categoria Receita em transação de despesa', () => {
    const categoria: Categoria = { id: 1, nome: 'Salário', tipo: 'Receita' };
    const ehValida = validarUsoCategoria(categoria, 'Despesa');
    expect(ehValida).toBe(false);
  });

  it('deve permitir categoria Despesa em transação de despesa', () => {
    const categoria: Categoria = { id: 2, nome: 'Alimentação', tipo: 'Despesa' };
    const ehValida = validarUsoCategoria(categoria, 'Despesa');
    expect(ehValida).toBe(true);
  });

  it('deve rejeitar categoria Despesa em transação de receita', () => {
    const categoria: Categoria = { id: 2, nome: 'Alimentação', tipo: 'Despesa' };
    const ehValida = validarUsoCategoria(categoria, 'Receita');
    expect(ehValida).toBe(false);
  });

  it('deve permitir categoria Ambas em qualquer tipo de transação', () => {
    const categoria: Categoria = { id: 3, nome: 'Transferência', tipo: 'Ambas' };
    expect(validarUsoCategoria(categoria, 'Receita')).toBe(true);
    expect(validarUsoCategoria(categoria, 'Despesa')).toBe(true);
  });
});

/**
 * Testes Unitários - Exclusão em Cascata
 */
describe('Lógica de Exclusão em Cascata', () => {
  
  interface Transacao {
    id: number;
    pessoaId: number;
    valor: number;
  }

  let transacoes: Transacao[] = [];

  beforeEach(() => {
    transacoes = [
      { id: 1, pessoaId: 1, valor: 100 },
      { id: 2, pessoaId: 1, valor: 50 },
      { id: 3, pessoaId: 1, valor: 75 },
      { id: 4, pessoaId: 2, valor: 200 },
    ];
  });

  it('deve remover todas as transações de uma pessoa', () => {
    const pessoaIdParaRemover = 1;
    const transacoesAntes = transacoes.filter(t => t.pessoaId === pessoaIdParaRemover).length;
    
    expect(transacoesAntes).toBe(3);

    transacoes = transacoes.filter(t => t.pessoaId !== pessoaIdParaRemover);

    const transacoesDepois = transacoes.filter(t => t.pessoaId === pessoaIdParaRemover).length;
    expect(transacoesDepois).toBe(0);
  });

  it('não deve remover transações de outras pessoas', () => {
    const pessoaIdParaRemover = 1;
    const transacoesPessoa2Antes = transacoes.filter(t => t.pessoaId === 2).length;

    transacoes = transacoes.filter(t => t.pessoaId !== pessoaIdParaRemover);

    const transacoesPessoa2Depois = transacoes.filter(t => t.pessoaId === 2).length;
    expect(transacoesPessoa2Depois).toBe(transacoesPessoa2Antes);
  });

  it('deve remover exatamente N transações quando pessoa com N transações é deletada', () => {
    const pessoaIdParaRemover = 1;
    const numeroTransacoesRemover = transacoes.filter(t => t.pessoaId === pessoaIdParaRemover).length;
    const totalAntes = transacoes.length;

    transacoes = transacoes.filter(t => t.pessoaId !== pessoaIdParaRemover);

    const totalDepois = transacoes.length;
    expect(totalDepois).toBe(totalAntes - numeroTransacoesRemover);
  });
});
