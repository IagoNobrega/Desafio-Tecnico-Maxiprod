export interface Pessoa {
  id: number;
  nome: string;
  dataNascimento: string; // YYYY-MM-DD
}

export interface Categoria {
  id: number;
  nome: string;
  tipo: 'Receita' | 'Despesa' | 'Ambas';
}

export interface Transacao {
  id: number;
  pessoaId: number;
  categoriaId: number;
  tipo: 'Receita' | 'Despesa';
  valor: number;
  descricao: string;
}