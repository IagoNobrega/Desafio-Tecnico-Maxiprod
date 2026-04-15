using Xunit;
using FluentAssertions;
using System;

namespace MaxiprodTests.Unit.Rules
{
    /// <summary>
    /// Testes unitários para a regra de negócio:
    /// "Menor de idade não pode ter receitas"
    /// </summary>
    [Trait("Category", "Unit")]
    public class MenorIdadeNaoTemReceitaTests
    {
        [Fact]
        public void Pessoa_Maior_De_Idade_Pode_Ter_Receita()
        {
            // Arrange
            var dataNascimento = DateTime.Now.AddYears(-25); // 25 anos
            var idadePessoa = CalcularIdade(dataNascimento);

            // Act
            var temPermissaoReceita = ValidarPermissaoReceita(idadePessoa);

            // Assert
            temPermissaoReceita.Should().BeTrue("pessoas maiores de idade podem ter receitas");
        }

        [Fact]
        public void Pessoa_Com_18_Anos_Pode_Ter_Receita()
        {
            // Arrange
            var dataNascimento = DateTime.Now.AddYears(-18);
            var idadePessoa = CalcularIdade(dataNascimento);

            // Act
            var temPermissaoReceita = ValidarPermissaoReceita(idadePessoa);

            // Assert
            temPermissaoReceita.Should().BeTrue("pessoa com 18 anos é maior de idade");
        }

        [Fact]
        public void Pessoa_Menor_De_Idade_Nao_Pode_Ter_Receita()
        {
            // Arrange
            var dataNascimento = DateTime.Now.AddYears(-17); // 17 anos
            var idadePessoa = CalcularIdade(dataNascimento);

            // Act
            var temPermissaoReceita = ValidarPermissaoReceita(idadePessoa);

            // Assert
            temPermissaoReceita.Should().BeFalse("menores de idade não podem ter receitas");
        }

        [Theory]
        [InlineData(-16)]
        [InlineData(-15)]
        [InlineData(-10)]
        public void Qualquer_Menor_De_Idade_Nao_Pode_Ter_Receita(int idadeNegativa)
        {
            // Arrange
            var dataNascimento = DateTime.Now.AddYears(idadeNegativa);
            var idadePessoa = CalcularIdade(dataNascimento);

            // Act
            var temPermissaoReceita = ValidarPermissaoReceita(idadePessoa);

            // Assert
            temPermissaoReceita.Should().BeFalse($"menores de {18 + idadeNegativa} anos não podem ter receitas");
        }

        [Fact]
        public void Pessoa_Menor_De_Idade_Pode_Ter_Despesa()
        {
            // Arrange
            var dataNascimento = DateTime.Now.AddYears(-10); // 10 anos
            var idadePessoa = CalcularIdade(dataNascimento);

            // Act
            var temPermissaoDespesa = ValidarPermissaoDespesa(idadePessoa);

            // Assert
            temPermissaoDespesa.Should().BeTrue("menores de idade podem ter despesas");
        }

        // Métodos auxiliares (simulam lógica da aplicação)
        private int CalcularIdade(DateTime dataNascimento)
        {
            var hoje = DateTime.Now;
            var idade = hoje.Year - dataNascimento.Year;
            
            if (dataNascimento.Date > hoje.AddYears(-idade))
                idade--;

            return idade;
        }

        private bool ValidarPermissaoReceita(int idade)
        {
            return idade >= 18;
        }

        private bool ValidarPermissaoDespesa(int idade)
        {
            return true; // A regra não restringe despesas por idade
        }
    }
}
