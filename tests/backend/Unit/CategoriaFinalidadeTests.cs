using Xunit;
using FluentAssertions;
using System;

namespace MaxiprodTests.Unit.Rules
{
    /// <summary>
    /// Testes unitários para a regra de negócio:
    /// "Categoria só pode ser usada conforme sua finalidade (receita/despesa/ambas)"
    /// </summary>
    [Trait("Category", "Unit")]
    public class CategoriaFinalidadeTests
    {
        public enum TipoCategoria
        {
            Receita,
            Despesa,
            Ambas
        }

        [Fact]
        public void Categoria_Receita_Pode_Ser_Usada_Em_Transacao_Receita()
        {
            // Arrange
            var categoria = new { Tipo = TipoCategoria.Receita, Nome = "Salário" };
            var tipoTransacao = "Receita";

            // Act
            var ehValida = ValidarUsoCategoria(categoria, tipoTransacao);

            // Assert
            ehValida.Should().BeTrue("categoria de receita deve ser usada em transações de receita");
        }

        [Fact]
        public void Categoria_Receita_Nao_Pode_Ser_Usada_Em_Transacao_Despesa()
        {
            // Arrange
            var categoria = new { Tipo = TipoCategoria.Receita, Nome = "Salário" };
            var tipoTransacao = "Despesa";

            // Act
            var ehValida = ValidarUsoCategoria(categoria, tipoTransacao);

            // Assert
            ehValida.Should().BeFalse("categoria de receita não deve ser usada em transações de despesa");
        }

        [Fact]
        public void Categoria_Despesa_Pode_Ser_Usada_Em_Transacao_Despesa()
        {
            // Arrange
            var categoria = new { Tipo = TipoCategoria.Despesa, Nome = "Alimentação" };
            var tipoTransacao = "Despesa";

            // Act
            var ehValida = ValidarUsoCategoria(categoria, tipoTransacao);

            // Assert
            ehValida.Should().BeTrue("categoria de despesa deve ser usada em transações de despesa");
        }

        [Fact]
        public void Categoria_Despesa_Nao_Pode_Ser_Usada_Em_Transacao_Receita()
        {
            // Arrange
            var categoria = new { Tipo = TipoCategoria.Despesa, Nome = "Alimentação" };
            var tipoTransacao = "Receita";

            // Act
            var ehValida = ValidarUsoCategoria(categoria, tipoTransacao);

            // Assert
            ehValida.Should().BeFalse("categoria de despesa não deve ser usada em transações de receita");
        }

        [Theory]
        [InlineData("Receita")]
        [InlineData("Despesa")]
        public void Categoria_Ambas_Pode_Ser_Usada_Em_Qualquer_Transacao(string tipoTransacao)
        {
            // Arrange
            var categoria = new { Tipo = TipoCategoria.Ambas, Nome = "Transferência" };

            // Act
            var ehValida = ValidarUsoCategoria(categoria, tipoTransacao);

            // Assert
            ehValida.Should().BeTrue($"categoria 'ambas' deve funcionar com transação de {tipoTransacao}");
        }

        [Fact]
        public void Categoria_Deve_Ter_Tipo_Valido()
        {
            // Arrange
            var categoria = new { Tipo = TipoCategoria.Ambas, Nome = "Categoria Válida" };

            // Act
            var ehValida = ValidarCategoriaExiste(categoria);

            // Assert
            ehValida.Should().BeTrue("categoria deve existir no sistema");
        }

        [Fact]
        public void Categoria_Nula_Nao_Deve_Ser_Aceita()
        {
            // Arrange
            object categoria = null;

            // Act & Assert
            var exception = Record.Exception(() => ValidarUsoCategoria(categoria, "Receita"));
            exception.Should().NotBeNull("categoria nula deve gerar exceção");
        }

        // Métodos auxiliares (simulam lógica da aplicação)
        private bool ValidarUsoCategoria(dynamic categoria, string tipoTransacao)
        {
            if (categoria == null)
                throw new ArgumentNullException(nameof(categoria), "Categoria não pode ser nula");

            var tipoCategoria = (TipoCategoria)categoria.Tipo;

            return tipoCategoria switch
            {
                TipoCategoria.Receita => tipoTransacao == "Receita",
                TipoCategoria.Despesa => tipoTransacao == "Despesa",
                TipoCategoria.Ambas => true,
                _ => false
            };
        }

        private bool ValidarCategoriaExiste(dynamic categoria)
        {
            return categoria != null && !string.IsNullOrEmpty(categoria.Nome);
        }
    }
}
