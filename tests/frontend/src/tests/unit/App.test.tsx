import { render, screen, fireEvent } from '@testing-library/react';
import App from '../../App.tsx';

describe('App - Pessoas', () => {

  test('deve renderizar lista de pessoas', () => {
    render(<App />);

    expect(screen.getByText(/João Silva/)).toBeInTheDocument();
    expect(screen.getByText(/Maria Santos/)).toBeInTheDocument();
  });

  test('deve criar nova pessoa', () => {
    render(<App />);

    fireEvent.click(screen.getByText('Nova Pessoa'));

    const nomeInput = screen.getByLabelText('Nome:') as HTMLInputElement;
    const dataInput = screen.getByLabelText('Data de Nascimento:') as HTMLInputElement;
    const cpfInput = screen.getByLabelText('CPF:') as HTMLInputElement;

    fireEvent.change(nomeInput, { target: { value: 'Teste Pessoa' } });
    fireEvent.change(dataInput, { target: { value: '1990-01-01' } });
    fireEvent.change(cpfInput, { target: { value: '99999999999' } });

    fireEvent.click(screen.getByText('Salvar'));

    expect(screen.getByText('Pessoa criada com sucesso')).toBeInTheDocument();
    expect(screen.getByText(/Teste Pessoa/)).toBeInTheDocument();
  });

});