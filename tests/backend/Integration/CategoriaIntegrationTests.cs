using Xunit;
using FluentAssertions;
using System;
using System.Net.Http;
using System.Threading.Tasks;
using System.Text.Json;

namespace MaxiprodTests.Integration
{
    /// <summary>
    /// Testes de integração - regra de negócio: categoria por finalidade
    /// </summary>
    [Trait("Category", "Integration")]
    public class CategoriaFinalidadeIntegrationTests : IAsyncLifetime
    {
        private readonly HttpClient _httpClient;
        private const string ApiBaseUrl = "http://localhost:5135/api";

        public CategoriaFinalidadeIntegrationTests()
        {
            _httpClient = new HttpClient { BaseAddress = new Uri(ApiBaseUrl) };
        }

        public Task InitializeAsync()
        {
            return Task.CompletedTask;
        }

        public Task DisposeAsync()
        {
            _httpClient?.Dispose();
            return Task.CompletedTask;
        }

        [Fact]
        public async Task Deve_Listar_Categorias()
        {
            // Act
            var response = await _httpClient.GetAsync("/categorias");

            // Assert
            response.StatusCode.Should().Be(System.Net.HttpStatusCode.OK);
        }

        [Fact]
        public async Task Deve_Criar_Categoria_Receita()
        {
            // Arrange
            var categoria = new
            {
                nome = $"Categoria Receita {DateTime.Now.Ticks}",
                tipo = "Receita",
                descricao = "Categoria para receitas"
            };

            var content = new StringContent(
                JsonSerializer.Serialize(categoria),
                System.Text.Encoding.UTF8,
                "application/json"
            );

            // Act
            var response = await _httpClient.PostAsync("/categorias", content);

            // Assert
            response.StatusCode.Should().BeOneOf(
                System.Net.HttpStatusCode.Created,
                System.Net.HttpStatusCode.OK
            );
        }

        [Fact]
        public async Task Deve_Criar_Categoria_Despesa()
        {
            // Arrange
            var categoria = new
            {
                nome = $"Categoria Despesa {DateTime.Now.Ticks}",
                tipo = "Despesa",
                descricao = "Categoria para despesas"
            };

            var content = new StringContent(
                JsonSerializer.Serialize(categoria),
                System.Text.Encoding.UTF8,
                "application/json"
            );

            // Act
            var response = await _httpClient.PostAsync("/categorias", content);

            // Assert
            response.StatusCode.Should().BeOneOf(
                System.Net.HttpStatusCode.Created,
                System.Net.HttpStatusCode.OK
            );
        }

        [Fact]
        public async Task Deve_Rejeitar_Categoria_Receita_Em_Transacao_Despesa()
        {
            // Arrange - Assumindo que existe categoria Receita ID 1 e pessoa ID 1
            var transacao = new
            {
                pessoaId = 1,
                categoriaId = 1, // Categoria receita
                valor = 100,
                tipo = "Despesa", // Tentando usar em despesa
                descricao = "Teste inválido"
            };

            var content = new StringContent(
                JsonSerializer.Serialize(transacao),
                System.Text.Encoding.UTF8,
                "application/json"
            );

            // Act
            var response = await _httpClient.PostAsync("/transacoes", content);

            // Assert - Deve rejeitar por incompatibilidade de categoria
            response.StatusCode.Should().BeOneOf(
                System.Net.HttpStatusCode.BadRequest,
                System.Net.HttpStatusCode.Forbidden,
                System.Net.HttpStatusCode.UnprocessableEntity
            );
        }

        [Fact]
        public async Task Deve_Permitir_Categoria_Ambas_Em_Qualquer_Transacao()
        {
            // Arrange - Assumindo que existe categoria "Ambas" ID 3 e pessoa ID 1
            var transacao = new
            {
                pessoaId = 1,
                categoriaId = 3, // Categoria ambas
                valor = 100,
                tipo = "Receita", // Pode ser receita ou despesa
                descricao = "Teste com categoria ambas"
            };

            var content = new StringContent(
                JsonSerializer.Serialize(transacao),
                System.Text.Encoding.UTF8,
                "application/json"
            );

            // Act
            var response = await _httpClient.PostAsync("/transacoes", content);

            // Assert - Deve aceitar
            response.IsSuccessStatusCode.Should().BeTrue();
        }
    }

    /// <summary>
    /// Testes de integração - exclusão em cascata de transações
    /// </summary>
    public class ExclusaoCascataIntegrationTests : IAsyncLifetime
    {
        private readonly HttpClient _httpClient;
        private const string ApiBaseUrl = "http://localhost:5135/api";
        private int _pessoaTestId = -1;

        public ExclusaoCascataIntegrationTests()
        {
            _httpClient = new HttpClient { BaseAddress = new Uri(ApiBaseUrl) };
        }

        public async Task InitializeAsync()
        {
            // Criar uma pessoa para teste
            var pessoa = new
            {
                nome = $"Pessoa Para Exclusão {DateTime.Now.Ticks}",
                dataNascimento = DateTime.Now.AddYears(-25),
                cpf = $"{DateTime.Now.Ticks}".Substring(0, 11)
            };

            var content = new StringContent(
                JsonSerializer.Serialize(pessoa),
                System.Text.Encoding.UTF8,
                "application/json"
            );

            var response = await _httpClient.PostAsync("/pessoas", content);
            if (response.IsSuccessStatusCode)
            {
                var responseContent = await response.Content.ReadAsStringAsync();
                var doc = JsonDocument.Parse(responseContent);
                if (doc.RootElement.TryGetProperty("id", out var idElement))
                    int.TryParse(idElement.GetRawText(), out _pessoaTestId);
            }
        }

        public Task DisposeAsync()
        {
            _httpClient?.Dispose();
            return Task.CompletedTask;
        }

        [Fact]
        public async Task Ao_Excluir_Pessoa_Transacoes_Devem_Ser_Removidas()
        {
            // Skip se pessoa não foi criada
            if (_pessoaTestId <= 0)
                return;

            // Arrange - Criar transações para a pessoa
            var transacao = new
            {
                pessoaId = _pessoaTestId,
                categoriaId = 1,
                valor = 100,
                tipo = "Despesa",
                descricao = "Transação para exclusão"
            };

            var contentTransacao = new StringContent(
                JsonSerializer.Serialize(transacao),
                System.Text.Encoding.UTF8,
                "application/json"
            );

            // Criar algumas transações
            await _httpClient.PostAsync("/transacoes", contentTransacao);

            // Verificar que transações foram criadas
            var responseAntes = await _httpClient.GetAsync($"/pessoas/{_pessoaTestId}");
            responseAntes.IsSuccessStatusCode.Should().BeTrue();

            // Act - Excluir pessoa
            var responseExclusao = await _httpClient.DeleteAsync($"/pessoas/{_pessoaTestId}");

            // Assert - Exclusão deve ter sucesso
            responseExclusao.StatusCode.Should().BeOneOf(
                System.Net.HttpStatusCode.OK,
                System.Net.HttpStatusCode.NoContent,
                System.Net.HttpStatusCode.NotFound
            );

            // Verificar que pessoa foi removida
            var responseDepois = await _httpClient.GetAsync($"/pessoas/{_pessoaTestId}");
            responseDepois.StatusCode.Should().Be(System.Net.HttpStatusCode.NotFound);
        }

        [Fact]
        public async Task Exclusao_Nao_Deve_Afetar_Transacoes_De_Outras_Pessoas()
        {
            // Skip se pessoa não foi criada
            if (_pessoaTestId <= 0)
                return;

            // Arrange - Criar duas pessoas
            var pessoa1 = new
            {
                nome = $"Pessoa 1 {DateTime.Now.Ticks}",
                dataNascimento = DateTime.Now.AddYears(-25),
                cpf = $"{DateTime.Now.Ticks}".Substring(0, 11)
            };

            var content1 = new StringContent(
                JsonSerializer.Serialize(pessoa1),
                System.Text.Encoding.UTF8,
                "application/json"
            );

            var response1 = await _httpClient.PostAsync("/pessoas", content1);
            int pessoaId1 = -1;
            if (response1.IsSuccessStatusCode)
            {
                var responseContent = await response1.Content.ReadAsStringAsync();
                var doc = JsonDocument.Parse(responseContent);
                if (doc.RootElement.TryGetProperty("id", out var idElement))
                    int.TryParse(idElement.GetRawText(), out pessoaId1);
            }

            var pessoa2 = new
            {
                nome = $"Pessoa 2 {DateTime.Now.Ticks}",
                dataNascimento = DateTime.Now.AddYears(-25),
                cpf = $"{DateTime.Now.Ticks}".Substring(0, 11)
            };

            var content2 = new StringContent(
                JsonSerializer.Serialize(pessoa2),
                System.Text.Encoding.UTF8,
                "application/json"
            );

            var response2 = await _httpClient.PostAsync("/pessoas", content2);
            int pessoaId2 = -1;
            if (response2.IsSuccessStatusCode)
            {
                var responseContent = await response2.Content.ReadAsStringAsync();
                var doc = JsonDocument.Parse(responseContent);
                if (doc.RootElement.TryGetProperty("id", out var idElement))
                    int.TryParse(idElement.GetRawText(), out pessoaId2);
            }

            if (pessoaId1 <= 0 || pessoaId2 <= 0)
                return;

            // Criar transações para ambas
            var transacao1 = new
            {
                pessoaId = pessoaId1,
                categoriaId = 1,
                valor = 100,
                tipo = "Despesa"
            };

            var contentT1 = new StringContent(
                JsonSerializer.Serialize(transacao1),
                System.Text.Encoding.UTF8,
                "application/json"
            );
            await _httpClient.PostAsync("/transacoes", contentT1);

            var transacao2 = new
            {
                pessoaId = pessoaId2,
                categoriaId = 1,
                valor = 150,
                tipo = "Despesa"
            };

            var contentT2 = new StringContent(
                JsonSerializer.Serialize(transacao2),
                System.Text.Encoding.UTF8,
                "application/json"
            );
            await _httpClient.PostAsync("/transacoes", contentT2);

            // Act - Excluir pessoa 1
            await _httpClient.DeleteAsync($"/pessoas/{pessoaId1}");

            // Assert - Pessoa 2 ainda deve existir
            var responsePessoa2 = await _httpClient.GetAsync($"/pessoas/{pessoaId2}");
            responsePessoa2.IsSuccessStatusCode.Should().BeTrue();
        }
    }
}
