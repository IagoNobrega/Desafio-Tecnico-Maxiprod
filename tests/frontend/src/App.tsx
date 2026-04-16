import React, { useEffect, useState } from 'react';
import type { Pessoa, Categoria, Transacao } from './types';
import { calcularIdade } from './utils';

const getCurrentPath = (): string => window.location.pathname || '/';

const App: React.FC = () => {
  const [route, setRoute] = useState(getCurrentPath());
  const [pessoas, setPessoas] = useState<Pessoa[]>([
    { id: 1, nome: 'João Silva (Adulto)', dataNascimento: '1990-01-01', cpf: '11122233344' },
    { id: 2, nome: 'Maria Santos (Menor)', dataNascimento: '2010-05-15', cpf: '22233344455' },
    { id: 3, nome: 'Pedro Costa (Jovem)', dataNascimento: '2007-03-20', cpf: '33344455566' },
  ]);

  const [categorias] = useState<Categoria[]>([
    { id: 1, nome: 'Salário', tipo: 'Receita' },
    { id: 2, nome: 'Alimentação', tipo: 'Despesa' },
    { id: 3, nome: 'Transporte', tipo: 'Despesa' },
    { id: 4, nome: 'Transferência', tipo: 'Ambas' },
  ]);

  const [transacoes, setTransacoes] = useState<Transacao[]>([
    { id: 1, pessoaId: 1, categoriaId: 1, tipo: 'Receita', valor: 3000, descricao: 'Salário mensal' },
    { id: 2, pessoaId: 1, categoriaId: 2, tipo: 'Despesa', valor: 500, descricao: 'Compras' },
    { id: 3, pessoaId: 2, categoriaId: 2, tipo: 'Despesa', valor: 200, descricao: 'Lanche' },
  ]);

  const [selectedPessoa, setSelectedPessoa] = useState<Pessoa | null>(null);
  const [showPessoaForm, setShowPessoaForm] = useState(false);
  const [showTransacaoForm, setShowTransacaoForm] = useState(false);
  const [editingPessoa, setEditingPessoa] = useState<Pessoa | null>(null);
  const [pessoaToDelete, setPessoaToDelete] = useState<Pessoa | null>(null);
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [transacaoForm, setTransacaoForm] = useState({
    pessoaId: 1,
    tipo: 'Receita' as 'Receita' | 'Despesa',
    categoriaId: 1,
    valor: 0,
    descricao: '',
  });

  useEffect(() => {
    const syncPath = () => setRoute(getCurrentPath());
    window.addEventListener('popstate', syncPath);
    return () => window.removeEventListener('popstate', syncPath);
  }, []);

  useEffect(() => {
    if (!pessoas.some(p => p.id === transacaoForm.pessoaId)) {
      setTransacaoForm(prev => ({ ...prev, pessoaId: pessoas[0]?.id ?? 0 }));
    }
  }, [pessoas, transacaoForm.pessoaId]);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setRoute(path);
    setMessage('');
    setSelectedPessoa(null);
  };

  const handleSalvarPessoa = (formData: FormData) => {
    const nome = (formData.get('nome') as string).trim();
    const dataNascimento = formData.get('dataNascimento') as string;
    const cpf = (formData.get('cpf') as string).trim();

    if (!nome || !dataNascimento || !cpf) {
      setMessageType('error');
      setMessage('Preencha todos os campos da pessoa.');
      return;
    }

    if (editingPessoa) {
      setPessoas(prev => prev.map(p => p.id === editingPessoa.id ? { ...p, nome, dataNascimento, cpf } : p));
      setMessageType('success');
      setMessage('Pessoa atualizada com sucesso');
      setEditingPessoa(null);
    } else {
      const novaPessoa: Pessoa = {
        id: Math.max(0, ...pessoas.map(p => p.id)) + 1,
        nome,
        dataNascimento,
        cpf,
      };
      setPessoas(prev => [...prev, novaPessoa]);
      setMessageType('success');
      setMessage('Pessoa criada com sucesso');
    }

    setShowPessoaForm(false);
  };

  const handleExcluirPessoa = () => {
    if (!pessoaToDelete) return;
    setTransacoes(prev => prev.filter(t => t.pessoaId !== pessoaToDelete.id));
    setPessoas(prev => prev.filter(p => p.id !== pessoaToDelete.id));
    setMessageType('success');
    setMessage('Pessoa removida com sucesso');
    if (selectedPessoa?.id === pessoaToDelete.id) setSelectedPessoa(null);
    setPessoaToDelete(null);
  };

  const validarTransacao = (pessoaId: number, categoriaId: number, tipo: 'Receita' | 'Despesa') => {
    const pessoa = pessoas.find(p => p.id === pessoaId);
    const categoria = categorias.find(c => c.id === categoriaId);
    if (!pessoa || !categoria) {
      return { valid: false, error: 'Pessoa ou categoria inválida.' };
    }

    if (tipo === 'Receita' && calcularIdade(pessoa.dataNascimento) < 18) {
      return { valid: false, error: 'Menor de idade não pode ter receitas' };
    }

    if (categoria.tipo === 'Receita' && tipo === 'Despesa') {
      return { valid: false, error: 'Categoria incompatível com tipo de transação' };
    }
    if (categoria.tipo === 'Despesa' && tipo === 'Receita') {
      return { valid: false, error: 'Categoria incompatível com tipo de transação' };
    }

    return { valid: true };
  };

  const handleSalvarTransacao = (formData: FormData) => {
    const pessoaId = Number(formData.get('pessoaId'));
    const categoriaId = Number(formData.get('categoriaId'));
    const tipo = formData.get('tipo') as 'Receita' | 'Despesa';
    const valor = Number(formData.get('valor'));
    const descricao = (formData.get('descricao') as string).trim();

    const validation = validarTransacao(pessoaId, categoriaId, tipo);
    if (!validation.valid) {
      setMessageType('error');
      setMessage(validation.error ?? 'Erro ao criar transação');
      return;
    }

    if (!descricao || valor <= 0) {
      setMessageType('error');
      setMessage('Preencha todos os campos da transação.');
      return;
    }

    const novaTransacao: Transacao = {
      id: Math.max(0, ...transacoes.map(t => t.id)) + 1,
      pessoaId,
      categoriaId,
      tipo,
      valor,
      descricao,
    };
    setTransacoes(prev => [...prev, novaTransacao]);
    setMessageType('success');
    setMessage('Transação criada com sucesso');
    setShowTransacaoForm(false);
    setTransacaoForm(prev => ({ ...prev, valor: 0, descricao: '' }));
  };

  const pessoasComTransacoes = pessoas.map(pessoa => ({
    ...pessoa,
    totalTransacoes: transacoes.filter(t => t.pessoaId === pessoa.id).length,
  }));

  const currentTransacoes = transacoes.map(transacao => ({
    ...transacao,
    pessoa: pessoas.find(p => p.id === transacao.pessoaId),
    categoria: categorias.find(c => c.id === transacao.categoriaId),
  }));

  const categoriaOptions = categorias;

  const renderNav = () => (
    <nav style={{ marginBottom: '20px' }}>
      <a href="/" onClick={e => { e.preventDefault(); navigate('/'); }} data-testid="nav-pessoas">Pessoas</a>
      {' | '}
      <a href="/transacoes" onClick={e => { e.preventDefault(); navigate('/transacoes'); }} data-testid="nav-transacoes">Transações</a>
    </nav>
  );

  const renderMessage = () => {
    if (!message) return null;
    return (
      <div style={{ marginBottom: '16px', color: messageType === 'error' ? '#c62828' : '#2e7d32' }}>
        {message}
      </div>
    );
  };

  const renderPessoas = () => (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <button onClick={() => { setShowPessoaForm(true); setEditingPessoa(null); }} data-testid="btn-nova-pessoa">Nova Pessoa</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Idade</th>
            <th>CPF</th>
            <th>Transações</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {pessoasComTransacoes.map(pessoa => (
            <tr key={pessoa.id} onClick={() => setSelectedPessoa(pessoa)} data-testid="pessoa-row" data-pessoa-id={pessoa.id}>
              <td>{pessoa.id}</td>
              <td>{pessoa.nome}</td>
              <td>{calcularIdade(pessoa.dataNascimento)}</td>
              <td>{pessoa.cpf}</td>
              <td data-testid="transacoes-count">{pessoa.totalTransacoes}</td>
              <td>
                <button onClick={e => { e.stopPropagation(); setEditingPessoa(pessoa); setShowPessoaForm(true); }} data-testid="btn-editar">Editar</button>
                <button onClick={e => { e.stopPropagation(); setPessoaToDelete(pessoa); }} data-testid="btn-excluir">Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderTransacoes = () => (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <button onClick={() => setShowTransacaoForm(true)} data-testid="btn-nova-transacao">Nova Transação</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Pessoa</th>
            <th>Categoria</th>
            <th>Tipo</th>
            <th>Valor</th>
            <th>Descrição</th>
          </tr>
        </thead>
        <tbody>
          {currentTransacoes.map(transacao => (
            <tr key={transacao.id} data-testid="transacao-row" data-pessoa-id={transacao.pessoaId}>
              <td>{transacao.id}</td>
              <td>{transacao.pessoa?.nome}</td>
              <td>{transacao.categoria?.nome}</td>
              <td>{transacao.tipo}</td>
              <td>{transacao.valor}</td>
              <td>{transacao.descricao}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div style={{ padding: '20px' }}>
      <h1>Maxiprod - Sistema de Gestão</h1>
      {renderNav()}
      {renderMessage()}
      {route === '/transacoes' ? renderTransacoes() : renderPessoas()}
      {showPessoaForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <form onSubmit={e => { e.preventDefault(); handleSalvarPessoa(new FormData(e.currentTarget)); }} style={{ background: 'white', padding: '20px', borderRadius: '8px', minWidth: '320px' }}>
            <h3>{editingPessoa ? 'Editar Pessoa' : 'Nova Pessoa'}</h3>
            <div>
              <label htmlFor="nome">Nome:</label>
              <input id="nome" name="nome" type="text" defaultValue={editingPessoa?.nome ?? ''} required />
            </div>
            <div>
              <label htmlFor="dataNascimento">Data de Nascimento:</label>
              <input id="dataNascimento" name="dataNascimento" type="date" defaultValue={editingPessoa?.dataNascimento ?? ''} required />
            </div>
            <div>
              <label htmlFor="cpf">CPF:</label>
              <input id="cpf" name="cpf" type="text" defaultValue={editingPessoa?.cpf ?? ''} required />
            </div>
            <button type="submit" data-testid="btn-salvar">Salvar</button>
            <button type="button" onClick={() => { setShowPessoaForm(false); setEditingPessoa(null); }} data-testid="btn-cancelar">Cancelar</button>
          </form>
        </div>
      )}
      {showTransacaoForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <form onSubmit={e => { e.preventDefault(); handleSalvarTransacao(new FormData(e.currentTarget)); }} style={{ background: 'white', padding: '20px', borderRadius: '8px', minWidth: '320px' }}>
            <h3>Nova Transação</h3>
            <div>
              <label htmlFor="pessoaId">Pessoa:</label>
              <select id="pessoaId" name="pessoaId" value={transacaoForm.pessoaId} onChange={e => setTransacaoForm(prev => ({ ...prev, pessoaId: Number(e.target.value) }))} required>
                {pessoas.map(p => (
                  <option key={p.id} value={p.id}>{`${p.nome} (${calcularIdade(p.dataNascimento)} anos)`}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="tipo">Tipo:</label>
              <select id="tipo" name="tipo" value={transacaoForm.tipo} onChange={e => setTransacaoForm(prev => ({ ...prev, tipo: e.target.value as 'Receita' | 'Despesa' }))}>
                <option value="Receita">Receita</option>
                <option value="Despesa">Despesa</option>
              </select>
            </div>
            <div>
              <label htmlFor="categoriaId">Categoria:</label>
              <select id="categoriaId" name="categoriaId" value={transacaoForm.categoriaId} onChange={e => setTransacaoForm(prev => ({ ...prev, categoriaId: Number(e.target.value) }))} required>
                {categoriaOptions.map(c => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Valor:</label>
              <input name="valor" type="number" step="0.01" value={transacaoForm.valor} onChange={e => setTransacaoForm(prev => ({ ...prev, valor: Number(e.target.value) }))} required />
            </div>
            <div>
              <label>Descrição:</label>
              <input name="descricao" type="text" value={transacaoForm.descricao} onChange={e => setTransacaoForm(prev => ({ ...prev, descricao: e.target.value }))} required />
            </div>
            <button type="submit" data-testid="btn-salvar-transacao">Salvar Transação</button>
            <button type="button" onClick={() => setShowTransacaoForm(false)} data-testid="btn-cancelar-transacao">Cancelar</button>
          </form>
        </div>
      )}
      {pessoaToDelete && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', minWidth: '320px' }}>
            <h3>Confirmar Exclusão</h3>
            <p>Deseja excluir {pessoaToDelete.nome}? Todas as transações serão removidas.</p>
            <button data-testid="confirm-delete" onClick={handleExcluirPessoa}>Confirmar</button>
            <button onClick={() => setPessoaToDelete(null)} data-testid="btn-cancelar-delete">Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
