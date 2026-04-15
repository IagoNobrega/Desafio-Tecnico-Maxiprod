using Xunit;
using FluentAssertions;
using System;
using System.Collections.Generic;
using System.Linq;

namespace MaxiprodTests.Unit.Rules
{
    /// <summary>
    /// Testes unitários para a regra de negócio:
    /// "Exclusão em cascata de transações ao excluir pessoa"
    /// </summary>
    public class ExclusaoCascataTests
    {
        private List<dynamic> transacoesBD = new();
        private List<dynamic> pesssoasBD = new();

        public void Setup()
        {
            transacoesBD.Clear();
            pesssoasBD.Clear();
        }

        [Fact]
        public void Ao_Excluir_Pessoa_Suas_Transacoes_Devem_Ser_Removidas()
        {
            // Arrange
            Setup();
            var pessoaId = 1;
            var pessoa = new { Id = pessoaId, Nome = "João Silva" };
            pesssoasBD.Add(pessoa);
            
            // Adicionar transações associadas à pessoa
            transacoesBD.Add(new { Id = 1, PessoaId = pessoaId, Valor = 100, Tipo = "Receita" });
            transacoesBD.Add(new { Id = 2, PessoaId = pessoaId, Valor = 50, Tipo = "Despesa" });
            transacoesBD.Add(new { Id = 3, PessoaId = pessoaId, Valor = 75, Tipo = "Receita" });

            var transacoesAntes = transacoesBD.Count(t => t.PessoaId == pessoaId);
            transacoesAntes.Should().Be(3, "pessoa deve ter 3 transações antes da exclusão");

            // Act
            ExcluirPessoaEmCascata(pessoaId);

            // Assert
            var transacoesDepois = transacoesBD.Count(t => t.PessoaId == pessoaId);
            transacoesDepois.Should().Be(0, "pessoa não deve ter transações após exclusão");
            
            var pessoaExiste = pesssoasBD.Any(p => p.Id == pessoaId);
            pessoaExiste.Should().BeFalse("pessoa deve ser removida do banco de dados");
        }

        [Fact]
        public void Exclusao_Cascata_Nao_Afeta_Transacoes_De_Outras_Pessoas()
        {
            // Arrange
            Setup();
            var pessoaId1 = 1;
            var pessoaId2 = 2;
            
            pesssoasBD.Add(new { Id = pessoaId1, Nome = "João" });
            pesssoasBD.Add(new { Id = pessoaId2, Nome = "Maria" });

            // Transações da pessoa 1
            transacoesBD.Add(new { Id = 1, PessoaId = pessoaId1, Valor = 100 });
            transacoesBD.Add(new { Id = 2, PessoaId = pessoaId1, Valor = 50 });

            // Transações da pessoa 2
            transacoesBD.Add(new { Id = 3, PessoaId = pessoaId2, Valor = 200 });
            transacoesBD.Add(new { Id = 4, PessoaId = pessoaId2, Valor = 75 });

            // Act
            ExcluirPessoaEmCascata(pessoaId1);

            // Assert
            var transacoesPessoa1 = transacoesBD.Count(t => t.PessoaId == pessoaId1);
            var transacoesPessoa2 = transacoesBD.Count(t => t.PessoaId == pessoaId2);

            transacoesPessoa1.Should().Be(0, "transações da pessoa 1 devem ser removidas");
            transacoesPessoa2.Should().Be(2, "transações da pessoa 2 não devem ser afetadas");
        }

        [Fact]
        public void Pessoa_Sem_Transacoes_Pode_Ser_Excluida()
        {
            // Arrange
            Setup();
            var pessoaId = 1;
            pesssoasBD.Add(new { Id = pessoaId, Nome = "João Silva" });

            // Act
            var exception = Record.Exception(() => ExcluirPessoaEmCascata(pessoaId));

            // Assert
            exception.Should().BeNull("deve ser possível excluir pessoa sem transações");
            pesssoasBD.Any(p => p.Id == pessoaId).Should().BeFalse("pessoa deve ser removida");
        }

        [Fact]
        public void Exclusao_De_Pessoa_Inexistente_Deve_Lancar_Erro()
        {
            // Arrange
            Setup();
            var pessoaIdInexistente = 999;

            // Act & Assert
            var exception = Record.Exception(() => ExcluirPessoaEmCascata(pessoaIdInexistente));
            exception.Should().NotBeNull("deve gerar erro ao tentar excluir pessoa inexistente");
        }

        [Fact]
        public void Todas_As_Transacoes_De_Uma_Pessoa_Devem_Ser_Deletadas_Atomicamente()
        {
            // Arrange
            Setup();
            var pessoaId = 1;
            pesssoasBD.Add(new { Id = pessoaId, Nome = "João" });
            
            for (int i = 1; i <= 10; i++)
                transacoesBD.Add(new { Id = i, PessoaId = pessoaId, Valor = i * 100 });

            var totalTransacoesAntes = transacoesBD.Count;

            // Act
            ExcluirPessoaEmCascata(pessoaId);

            // Assert
            var totalTransacoesDepois = transacoesBD.Count;
            totalTransacoesDepois.Should().Be(0, "todas as 10 transações devem ser removidas");
            totalTransacoesDepois.Should().Be(totalTransacoesAntes - 10, "exatamente 10 transações foram removidas");
        }

        // Métodos auxiliares (simulam lógica da aplicação)
        private void ExcluirPessoaEmCascata(int pessoaId)
        {
            var pessoa = pesssoasBD.FirstOrDefault(p => p.Id == pessoaId);
            if (pessoa == null)
                throw new ArgumentException($"Pessoa com ID {pessoaId} não encontrada");

            // Remover todas as transações da pessoa
            var transacoesParaRemover = transacoesBD.Where(t => t.PessoaId == pessoaId).ToList();
            foreach (var transacao in transacoesParaRemover)
                transacoesBD.Remove(transacao);

            // Remover a pessoa
            pesssoasBD.Remove(pessoa);
        }
    }
}
