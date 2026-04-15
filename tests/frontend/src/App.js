"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var getCurrentPath = function () { return window.location.pathname || '/'; };
var App = function () {
    var _a, _b, _c;
    var _d = (0, react_1.useState)(getCurrentPath()), route = _d[0], setRoute = _d[1];
    var _e = (0, react_1.useState)([
        { id: 1, nome: 'João Silva (Adulto)', dataNascimento: '1990-01-01', cpf: '11122233344' },
        { id: 2, nome: 'Maria Santos (Menor)', dataNascimento: '2010-05-15', cpf: '22233344455' },
        { id: 3, nome: 'Pedro Costa (Jovem)', dataNascimento: '2007-03-20', cpf: '33344455566' },
    ]), pessoas = _e[0], setPessoas = _e[1];
    var categorias = (0, react_1.useState)([
        { id: 1, nome: 'Salário', tipo: 'Receita' },
        { id: 2, nome: 'Alimentação', tipo: 'Despesa' },
        { id: 3, nome: 'Transporte', tipo: 'Despesa' },
        { id: 4, nome: 'Transferência', tipo: 'Ambas' },
    ])[0];
    var _f = (0, react_1.useState)([
        { id: 1, pessoaId: 1, categoriaId: 1, tipo: 'Receita', valor: 3000, descricao: 'Salário mensal' },
        { id: 2, pessoaId: 1, categoriaId: 2, tipo: 'Despesa', valor: 500, descricao: 'Compras' },
        { id: 3, pessoaId: 2, categoriaId: 2, tipo: 'Despesa', valor: 200, descricao: 'Lanche' },
    ]), transacoes = _f[0], setTransacoes = _f[1];
    var _g = (0, react_1.useState)(null), selectedPessoa = _g[0], setSelectedPessoa = _g[1];
    var _h = (0, react_1.useState)(false), showPessoaForm = _h[0], setShowPessoaForm = _h[1];
    var _j = (0, react_1.useState)(false), showTransacaoForm = _j[0], setShowTransacaoForm = _j[1];
    var _k = (0, react_1.useState)(null), editingPessoa = _k[0], setEditingPessoa = _k[1];
    var _l = (0, react_1.useState)(null), pessoaToDelete = _l[0], setPessoaToDelete = _l[1];
    var _m = (0, react_1.useState)(''), message = _m[0], setMessage = _m[1];
    var _o = (0, react_1.useState)('success'), messageType = _o[0], setMessageType = _o[1];
    var _p = (0, react_1.useState)({
        pessoaId: 1,
        tipo: 'Receita',
        categoriaId: 1,
        valor: 0,
        descricao: '',
    }), transacaoForm = _p[0], setTransacaoForm = _p[1];
    (0, react_1.useEffect)(function () {
        var syncPath = function () { return setRoute(getCurrentPath()); };
        window.addEventListener('popstate', syncPath);
        return function () { return window.removeEventListener('popstate', syncPath); };
    }, []);
    (0, react_1.useEffect)(function () {
        if (!pessoas.some(function (p) { return p.id === transacaoForm.pessoaId; })) {
            setTransacaoForm(function (prev) { var _a, _b; return (__assign(__assign({}, prev), { pessoaId: (_b = (_a = pessoas[0]) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : 0 })); });
        }
    }, [pessoas, transacaoForm.pessoaId]);
    var navigate = function (path) {
        window.history.pushState({}, '', path);
        setRoute(path);
        setMessage('');
        setSelectedPessoa(null);
    };
    var calcularIdade = function (dataNascimento) {
        var hoje = new Date();
        var nascimento = new Date(dataNascimento);
        var idade = hoje.getFullYear() - nascimento.getFullYear();
        var mes = hoje.getMonth() - nascimento.getMonth();
        if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
            idade--;
        }
        return idade;
    };
    var handleSalvarPessoa = function (formData) {
        var nome = formData.get('nome').trim();
        var dataNascimento = formData.get('dataNascimento');
        var cpf = formData.get('cpf').trim();
        if (!nome || !dataNascimento || !cpf) {
            setMessageType('error');
            setMessage('Preencha todos os campos da pessoa.');
            return;
        }
        if (editingPessoa) {
            setPessoas(function (prev) { return prev.map(function (p) { return p.id === editingPessoa.id ? __assign(__assign({}, p), { nome: nome, dataNascimento: dataNascimento, cpf: cpf }) : p; }); });
            setMessageType('success');
            setMessage('Pessoa atualizada com sucesso');
            setEditingPessoa(null);
        }
        else {
            var novaPessoa_1 = {
                id: Math.max.apply(Math, __spreadArray([0], pessoas.map(function (p) { return p.id; }), false)) + 1,
                nome: nome,
                dataNascimento: dataNascimento,
                cpf: cpf,
            };
            setPessoas(function (prev) { return __spreadArray(__spreadArray([], prev, true), [novaPessoa_1], false); });
            setMessageType('success');
            setMessage('Pessoa criada com sucesso');
        }
        setShowPessoaForm(false);
    };
    var handleExcluirPessoa = function () {
        if (!pessoaToDelete)
            return;
        setTransacoes(function (prev) { return prev.filter(function (t) { return t.pessoaId !== pessoaToDelete.id; }); });
        setPessoas(function (prev) { return prev.filter(function (p) { return p.id !== pessoaToDelete.id; }); });
        setMessageType('success');
        setMessage('Pessoa removida com sucesso');
        if ((selectedPessoa === null || selectedPessoa === void 0 ? void 0 : selectedPessoa.id) === pessoaToDelete.id)
            setSelectedPessoa(null);
        setPessoaToDelete(null);
    };
    var validarTransacao = function (pessoaId, categoriaId, tipo) {
        var pessoa = pessoas.find(function (p) { return p.id === pessoaId; });
        var categoria = categorias.find(function (c) { return c.id === categoriaId; });
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
    var handleSalvarTransacao = function (formData) {
        var _a;
        var pessoaId = Number(formData.get('pessoaId'));
        var categoriaId = Number(formData.get('categoriaId'));
        var tipo = formData.get('tipo');
        var valor = Number(formData.get('valor'));
        var descricao = formData.get('descricao').trim();
        var validation = validarTransacao(pessoaId, categoriaId, tipo);
        if (!validation.valid) {
            setMessageType('error');
            setMessage((_a = validation.error) !== null && _a !== void 0 ? _a : 'Erro ao criar transação');
            return;
        }
        if (!descricao || valor <= 0) {
            setMessageType('error');
            setMessage('Preencha todos os campos da transação.');
            return;
        }
        var novaTransacao = {
            id: Math.max.apply(Math, __spreadArray([0], transacoes.map(function (t) { return t.id; }), false)) + 1,
            pessoaId: pessoaId,
            categoriaId: categoriaId,
            tipo: tipo,
            valor: valor,
            descricao: descricao,
        };
        setTransacoes(function (prev) { return __spreadArray(__spreadArray([], prev, true), [novaTransacao], false); });
        setMessageType('success');
        setMessage('Transação criada com sucesso');
        setShowTransacaoForm(false);
        setTransacaoForm(function (prev) { return (__assign(__assign({}, prev), { valor: 0, descricao: '' })); });
    };
    var pessoasComTransacoes = pessoas.map(function (pessoa) { return (__assign(__assign({}, pessoa), { totalTransacoes: transacoes.filter(function (t) { return t.pessoaId === pessoa.id; }).length })); });
    var currentTransacoes = transacoes.map(function (transacao) { return (__assign(__assign({}, transacao), { pessoa: pessoas.find(function (p) { return p.id === transacao.pessoaId; }), categoria: categorias.find(function (c) { return c.id === transacao.categoriaId; }) })); });
    var categoriaOptions = categorias.filter(function (c) { return c.tipo === 'Ambas' || c.tipo === transacaoForm.tipo; });
    (0, react_1.useEffect)(function () {
        if (!categoriaOptions.some(function (c) { return c.id === transacaoForm.categoriaId; })) {
            setTransacaoForm(function (prev) { var _a, _b; return (__assign(__assign({}, prev), { categoriaId: (_b = (_a = categoriaOptions[0]) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : prev.categoriaId })); });
        }
    }, [categoriaOptions, transacaoForm.categoriaId]);
    var renderNav = function () { return (<nav style={{ marginBottom: '20px' }}>
      <a href="/" onClick={function (e) { e.preventDefault(); navigate('/'); }}>Pessoas</a>
      {' | '}
      <a href="/transacoes" onClick={function (e) { e.preventDefault(); navigate('/transacoes'); }}>Transações</a>
    </nav>); };
    var renderMessage = function () {
        if (!message)
            return null;
        return (<div style={{ marginBottom: '16px', color: messageType === 'error' ? '#c62828' : '#2e7d32' }}>
        {message}
      </div>);
    };
    var renderPessoas = function () { return (<div>
      <div style={{ marginBottom: '16px' }}>
        <button onClick={function () { setShowPessoaForm(true); setEditingPessoa(null); }}>Nova Pessoa</button>
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
          {pessoasComTransacoes.map(function (pessoa) { return (<tr key={pessoa.id} onClick={function () { return setSelectedPessoa(pessoa); }} data-pessoa-id={pessoa.id}>
              <td>{pessoa.id}</td>
              <td>{pessoa.nome}</td>
              <td>{calcularIdade(pessoa.dataNascimento)}</td>
              <td>{pessoa.cpf}</td>
              <td>{pessoa.totalTransacoes}</td>
              <td>
                <button onClick={function (e) { e.stopPropagation(); setEditingPessoa(pessoa); setShowPessoaForm(true); }}>Editar</button>
                <button onClick={function (e) { e.stopPropagation(); setPessoaToDelete(pessoa); }}>Excluir</button>
              </td>
            </tr>); })}
        </tbody>
      </table>
    </div>); };
    var renderTransacoes = function () { return (<div>
      <div style={{ marginBottom: '16px' }}>
        <button onClick={function () { return setShowTransacaoForm(true); }}>Nova Transação</button>
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
          {currentTransacoes.map(function (transacao) {
            var _a, _b;
            return (<tr key={transacao.id} data-pessoaId={transacao.pessoaId}>
              <td>{transacao.id}</td>
              <td>{(_a = transacao.pessoa) === null || _a === void 0 ? void 0 : _a.nome}</td>
              <td>{(_b = transacao.categoria) === null || _b === void 0 ? void 0 : _b.nome}</td>
              <td>{transacao.tipo}</td>
              <td>{transacao.valor}</td>
              <td>{transacao.descricao}</td>
            </tr>);
        })}
        </tbody>
      </table>
    </div>); };
    return (<div style={{ padding: '20px' }}>
      <h1>Maxiprod - Sistema de Gestão</h1>
      {renderNav()}
      {renderMessage()}
      {route === '/transacoes' ? renderTransacoes() : renderPessoas()}
      {showPessoaForm && (<div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <form onSubmit={function (e) { e.preventDefault(); handleSalvarPessoa(new FormData(e.currentTarget)); }} style={{ background: 'white', padding: '20px', borderRadius: '8px', minWidth: '320px' }}>
            <h3>{editingPessoa ? 'Editar Pessoa' : 'Nova Pessoa'}</h3>
            <div>
              <label>Nome:</label>
              <input name="nome" type="text" defaultValue={(_a = editingPessoa === null || editingPessoa === void 0 ? void 0 : editingPessoa.nome) !== null && _a !== void 0 ? _a : ''} required/>
            </div>
            <div>
              <label>Data de Nascimento:</label>
              <input name="dataNascimento" type="date" defaultValue={(_b = editingPessoa === null || editingPessoa === void 0 ? void 0 : editingPessoa.dataNascimento) !== null && _b !== void 0 ? _b : ''} required/>
            </div>
            <div>
              <label>CPF:</label>
              <input name="cpf" type="text" defaultValue={(_c = editingPessoa === null || editingPessoa === void 0 ? void 0 : editingPessoa.cpf) !== null && _c !== void 0 ? _c : ''} required/>
            </div>
            <button type="submit">Salvar</button>
            <button type="button" onClick={function () { setShowPessoaForm(false); setEditingPessoa(null); }}>Cancelar</button>
          </form>
        </div>)}
      {showTransacaoForm && (<div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <form onSubmit={function (e) { e.preventDefault(); handleSalvarTransacao(new FormData(e.currentTarget)); }} style={{ background: 'white', padding: '20px', borderRadius: '8px', minWidth: '320px' }}>
            <h3>Nova Transação</h3>
            <div>
              <label>Pessoa:</label>
              <select name="pessoaId" value={transacaoForm.pessoaId} onChange={function (e) { return setTransacaoForm(function (prev) { return (__assign(__assign({}, prev), { pessoaId: Number(e.target.value) })); }); }} required>
                {pessoas.map(function (p) { return (<option key={p.id} value={p.id}>{"".concat(p.nome, " (").concat(calcularIdade(p.dataNascimento), " anos)")}</option>); })}
              </select>
            </div>
            <div>
              <label>Tipo:</label>
              <select name="tipo" value={transacaoForm.tipo} onChange={function (e) { return setTransacaoForm(function (prev) { return (__assign(__assign({}, prev), { tipo: e.target.value })); }); }}>
                <option value="Receita">Receita</option>
                <option value="Despesa">Despesa</option>
              </select>
            </div>
            <div>
              <label>Categoria:</label>
              <select name="categoriaId" value={transacaoForm.categoriaId} onChange={function (e) { return setTransacaoForm(function (prev) { return (__assign(__assign({}, prev), { categoriaId: Number(e.target.value) })); }); }} required>
                {categoriaOptions.map(function (c) { return (<option key={c.id} value={c.id}>{c.nome}</option>); })}
              </select>
            </div>
            <div>
              <label>Valor:</label>
              <input name="valor" type="number" step="0.01" value={transacaoForm.valor} onChange={function (e) { return setTransacaoForm(function (prev) { return (__assign(__assign({}, prev), { valor: Number(e.target.value) })); }); }} required/>
            </div>
            <div>
              <label>Descrição:</label>
              <input name="descricao" type="text" value={transacaoForm.descricao} onChange={function (e) { return setTransacaoForm(function (prev) { return (__assign(__assign({}, prev), { descricao: e.target.value })); }); }} required/>
            </div>
            <button type="submit">Salvar</button>
            <button type="button" onClick={function () { return setShowTransacaoForm(false); }}>Cancelar</button>
          </form>
        </div>)}
      {pessoaToDelete && (<div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', minWidth: '320px' }}>
            <h3>Confirmar Exclusão</h3>
            <p>Deseja excluir {pessoaToDelete.nome}? Todas as transações serão removidas.</p>
            <button onClick={handleExcluirPessoa}>Confirmar</button>
            <button onClick={function () { return setPessoaToDelete(null); }}>Cancelar</button>
          </div>
        </div>)}
    </div>);
};
exports.default = App;
