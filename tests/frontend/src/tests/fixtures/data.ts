export const pessoasFixtures = {
  maiorIdade: {
    nome: 'João Silva (Adulto)',
    dataNascimento: '1990-01-01',
    cpf: '11122233344'
  },
  menorIdade: {
    nome: 'Maria Santos (Menor)',
    dataNascimento: '2010-05-15',
    cpf: '22233344455'
  }
};

export const transacoesFixtures = {
  receita: {
    tipo: 'Receita' as const,
    categoriaId: '1', // Salário
    valor: 3000,
    descricao: 'Salário mensal'
  },
  despesa: {
    tipo: 'Despesa' as const,
    categoriaId: '2', // Alimentação
    valor: 500,
    descricao: 'Compras'
  }
};