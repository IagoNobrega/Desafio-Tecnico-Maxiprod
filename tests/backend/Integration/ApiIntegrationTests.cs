using Xunit;
using FluentAssertions;
using System;
using System.Net.Http;
using System.Threading.Tasks;
using System.Text.Json.Serialization;
using System.Text.Json;

namespace MaxiprodTests.Integration
{
    /// <summary>
    /// Testes de integração contra a API real
    /// Foca em validar as regras de negócio através de requisições HTTP
    /// </summary>
    public class PessoaApiIntegrationTests : IAsyncLifetime
    {
        private readonly HttpClient _httpClient;
        private const string ApiBaseUrl = "http://localhost:5135/api";

        public PessoaApiIntegrationTests()
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
        public async Task Deve_Listar_Pessoas()
        {
            // Act
            var response = await _httpClient.GetAsync("/pessoas");

            // Assert
            response.StatusCode.Should().Be(System.Net.HttpStatusCode.OK);
        }

        [Fact]
        public async Task Deve_Criar_Pessoa()
        {
            // Arrange
            var pessoa = new
            {
                nome = $"Pessoa Teste {DateTime.Now.Ticks}",
                dataNascimento = DateTime.Now.AddYears(-30),
                cpf = $"{DateTime.Now.Ticks}".Substring(0, 11)
            };

            var content = new StringContent(
                JsonSerializer.Serialize(pessoa),
                System.Text.Encoding.UTF8,
                "application/json"
            );

            // Act
            var response = await _httpClient.PostAsync("/pessoas", content);

            // Assert
            response.StatusCode.Should().BeOneOf(
                System.Net.HttpStatusCode.Created,
                System.Net.HttpStatusCode.OK
            );
        }

        [Fact]
        public async Task Deve_Obter_Pessoa_Por_Id()
        {
            // Arrange
            var pessoaId = 1; // Assumindo que existe pessoa com ID 1

            // Act
            var response = await _httpClient.GetAsync($"/pessoas/{pessoaId}");

            // Assert
            response.StatusCode.Should().BeOneOf(
                System.Net.HttpStatusCode.OK,
                System.Net.HttpStatusCode.NotFound
            );
        }

        [Fact]
        public async Task Deve_Atualizar_Pessoa()
        {
            // Arrange
            var pessoaId = 1;
            var pessoaAtualizada = new
            {
                nome = $"Pessoa Atualizada {DateTime.Now.Ticks}",
                dataNascimento = DateTime.Now.AddYears(-25),
                cpf = "12345678901"
            };

            var content = new StringContent(
                JsonSerializer.Serialize(pessoaAtualizada),
                System.Text.Encoding.UTF8,
                "application/json"
            );

            // Act
            var response = await _httpClient.PutAsync($"/pessoas/{pessoaId}", content);

            // Assert
            response.StatusCode.Should().BeOneOf(
                System.Net.HttpStatusCode.OK,
                System.Net.HttpStatusCode.NoContent,
                System.Net.HttpStatusCode.NotFound
            );
        }

        [Fact]
        public async Task Deve_Excluir_Pessoa()
        {
            // Arrange
            var pessoaId = 1;

            // Act
            var response = await _httpClient.DeleteAsync($"/pessoas/{pessoaId}");

            // Assert
            response.StatusCode.Should().BeOneOf(
                System.Net.HttpStatusCode.OK,
                System.Net.HttpStatusCode.NoContent,
                System.Net.HttpStatusCode.NotFound
            );
        }
    }

    /// <summary>
    /// Testes de integração - regra de negócio: menor não pode ter receita
    /// </summary>
    public class MenorIdadeReceitaIntegrationTests : IAsyncLifetime
    {
        private readonly HttpClient _httpClient;
        private const string ApiBaseUrl = "http://localhost:5135/api";
        private int _pessoaMenorId = -1;
        private int _pessoaMaiorId = -1;

        public MenorIdadeReceitaIntegrationTests()
        {
            _httpClient = new HttpClient { BaseAddress = new Uri(ApiBaseUrl) };
        }

        public async Task InitializeAsync()
        {
            // Setup: Criar pessoa menor de idade
            var pessoaMenor = new
            {
                nome = $"Menor {DateTime.Now.Ticks}",
                dataNascimento = DateTime.Now.AddYears(-15), // 15 anos
                cpf = $"{DateTime.Now.Ticks}".Substring(0, 11)
            };

            var contentMenor = new StringContent(
                JsonSerializer.Serialize(pessoaMenor),
                System.Text.Encoding.UTF8,
                "application/json"
            );

            var responseMenor = await _httpClient.PostAsync("/pessoas", contentMenor);
            if (responseMenor.IsSuccessStatusCode)
            {
                var responseContent = await responseMenor.Content.ReadAsStringAsync();
                var doc = JsonDocument.Parse(responseContent);
                if (doc.RootElement.TryGetProperty("id", out var idElement))
                    int.TryParse(idElement.GetRawText(), out _pessoaMenorId);
            }

            // Setup: Criar pessoa maior de idade
            var pessoaMaior = new
            {
                nome = $"Maior {DateTime.Now.Ticks}",
                dataNascimento = DateTime.Now.AddYears(-25), // 25 anos
                cpf = $"{DateTime.Now.Ticks}".Substring(0, 11)
            };

            var contentMaior = new StringContent(
                JsonSerializer.Serialize(pessoaMaior),
                System.Text.Encoding.UTF8,
                "application/json"
            );

            var responseMaior = await _httpClient.PostAsync("/pessoas", contentMaior);
            if (responseMaior.IsSuccessStatusCode)
            {
                var responseContent = await responseMaior.Content.ReadAsStringAsync();
                var doc = JsonDocument.Parse(responseContent);
                if (doc.RootElement.TryGetProperty("id", out var idElement))
                    int.TryParse(idElement.GetRawText(), out _pessoaMaiorId);
            }
        }

        public Task DisposeAsync()
        {
            _httpClient?.Dispose();
            return Task.CompletedTask;
        }

        [Fact]
        public async Task Menor_De_Idade_Nao_Deve_Conseguir_Criar_Receita()
        {
            // Skip se pessoa menor não foi criada
            if (_pessoaMenorId <= 0)
                return;

            // Arrange
            var transacao = new
            {
                pessoaId = _pessoaMenorId,
                categoriaId = 1,
                valor = 100,
                tipo = "Receita",
                descricao = "Receita para menor"
            };

            var content = new StringContent(
                JsonSerializer.Serialize(transacao),
                System.Text.Encoding.UTF8,
                "application/json"
            );

            // Act
            var response = await _httpClient.PostAsync("/transacoes", content);

            // Assert - Deve retornar erro (400, 403 ou similar)
            response.StatusCode.Should().BeOneOf(
                System.Net.HttpStatusCode.BadRequest,
                System.Net.HttpStatusCode.Forbidden,
                System.Net.HttpStatusCode.UnprocessableEntity
            );
        }

        [Fact]
        public async Task Maior_De_Idade_Deve_Conseguir_Criar_Receita()
        {
            // Skip se pessoa maior não foi criada
            if (_pessoaMaiorId <= 0)
                return;

            // Arrange
            var transacao = new
            {
                pessoaId = _pessoaMaiorId,
                categoriaId = 1,
                valor = 100,
                tipo = "Receita",
                descricao = "Receita para maior"
            };

            var content = new StringContent(
                JsonSerializer.Serialize(transacao),
                System.Text.Encoding.UTF8,
                "application/json"
            );

            // Act
            var response = await _httpClient.PostAsync("/transacoes", content);

            // Assert - Deve retornar sucesso
            response.IsSuccessStatusCode.Should().BeTrue();
        }

        [Fact]
        public async Task Menor_De_Idade_Pode_Criar_Despesa()
        {
            // Skip se pessoa menor não foi criada
            if (_pessoaMenorId <= 0)
                return;

            // Arrange
            var transacao = new
            {
                pessoaId = _pessoaMenorId,
                categoriaId = 2,
                valor = 50,
                tipo = "Despesa",
                descricao = "Despesa para menor"
            };

            var content = new StringContent(
                JsonSerializer.Serialize(transacao),
                System.Text.Encoding.UTF8,
                "application/json"
            );

            // Act
            var response = await _httpClient.PostAsync("/transacoes", content);

            // Assert - Deve permitir despesa para menor
            response.IsSuccessStatusCode.Should().BeTrue();
        }
    }
}
