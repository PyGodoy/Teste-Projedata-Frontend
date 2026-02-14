import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Production from "../components/Production";
import axios from "axios";
import { vi } from "vitest";
const API_URL = import.meta.env.VITE_API_URL;

vi.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Production Component - Suite Completa", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Renderização Inicial e Loading", () => {
    it("exibe estado de loading ao carregar dados", () => {
      mockedAxios.get.mockImplementation(() => new Promise(() => {}));

      render(<Production />);

      expect(screen.getByText(/loading\.\.\./i)).toBeInTheDocument();
    });

    it("faz requisição GET para a API ao montar o componente", () => {
      const data = {
        products: [],
        totalValue: 0,
      };

      mockedAxios.get.mockResolvedValue({ data });

      render(<Production />);

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(`${API_URL}/production`);
    });
  });

  describe("Exibição de Dados com Sucesso", () => {
    it("exibe lista de produtos e valor total quando API retorna dados", async () => {
      const data = {
        products: [
          { name: "PC Gamer", quantity: 2, price: 100 },
          { name: "Notebook", quantity: 5, price: 200 },
        ],
        totalValue: 1200,
      };

      mockedAxios.get.mockResolvedValue({ data });

      render(<Production />);

      await waitFor(() => {
        expect(screen.queryByText(/loading\.\.\./i)).not.toBeInTheDocument();
      });

      expect(screen.getByText(/PC Gamer/i)).toBeInTheDocument();
      expect(screen.getByText(/Notebook/i)).toBeInTheDocument();

      const rows = screen.getAllByRole("row");
      expect(within(rows[1]).getByText("2")).toBeInTheDocument();
      expect(within(rows[2]).getByText("5")).toBeInTheDocument();

      expect(screen.getByText(/100\.00/i)).toBeInTheDocument();
      const pricesWithoutTotal = screen.getAllByText(/200\.00/i);
      expect(pricesWithoutTotal.length).toBeGreaterThan(0);

      // Verifica valor total
      expect(screen.getByText(/Total Value: \$1200\.00/i)).toBeInTheDocument();
    });

    it("exibe produto único corretamente", async () => {
      const data = {
        products: [{ name: "Mouse Gamer", quantity: 10, price: 50.99 }],
        totalValue: 509.90,
      };

      mockedAxios.get.mockResolvedValue({ data });

      render(<Production />);

      await waitFor(() => {
        expect(screen.getByText(/Mouse Gamer/i)).toBeInTheDocument();
      });

      expect(screen.getByText("10")).toBeInTheDocument();
      expect(screen.getByText(/50\.99/i)).toBeInTheDocument();
      expect(screen.getByText(/Total Value: \$509\.90/i)).toBeInTheDocument();
    });

    it("formata preços com 2 casas decimais corretamente", async () => {
      const data = {
        products: [
          { name: "Product A", quantity: 1, price: 10 },
          { name: "Product B", quantity: 1, price: 10.5 },
          { name: "Product C", quantity: 1, price: 10.99 },
        ],
        totalValue: 31.49,
      };

      mockedAxios.get.mockResolvedValue({ data });

      render(<Production />);

      await waitFor(() => {
        expect(screen.getByText(/10\.00/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/10\.50/i)).toBeInTheDocument();
      expect(screen.getByText(/10\.99/i)).toBeInTheDocument();
      expect(screen.getByText(/\$31\.49/i)).toBeInTheDocument();
    });
  });

  describe("Estado Vazio", () => {
    it("exibe mensagem quando não há produtos disponíveis para produção", async () => {
      const data = {
        products: [],
        totalValue: 0,
      };

      mockedAxios.get.mockResolvedValue({ data });

      render(<Production />);

      await waitFor(() => {
        expect(
          screen.getByText(/No products can be produced with current raw materials/i)
        ).toBeInTheDocument();
      });

      expect(screen.queryByRole("table")).not.toBeInTheDocument();
      expect(screen.queryByText(/Total Value/i)).not.toBeInTheDocument();
    });
  });

  describe("Tratamento de Erros", () => {
    it("exibe mensagem de erro quando a API falha", async () => {
      const errorMessage = "Network Error";
      mockedAxios.get.mockRejectedValue(new Error(errorMessage));

      render(<Production />);

      await waitFor(() => {
        expect(screen.getByText(/Failed to fetch production data/i)).toBeInTheDocument();
      });

      expect(screen.queryByText(/loading\.\.\./i)).not.toBeInTheDocument();

      expect(screen.queryByRole("table")).not.toBeInTheDocument();
    });

    it("aplica estilo vermelho à mensagem de erro", async () => {
      mockedAxios.get.mockRejectedValue(new Error("Error"));

      render(<Production />);

      await waitFor(() => {
        const errorElement = screen.getByText(/Failed to fetch production data/i);
        expect(errorElement).toHaveStyle({ color: "rgb(255, 0, 0)" });
      });
    });

    it("exibe erro com status 404", async () => {
      mockedAxios.get.mockRejectedValue({
        response: { status: 404, data: "Not Found" },
      });

      render(<Production />);

      await waitFor(() => {
        expect(screen.getByText(/Failed to fetch production data/i)).toBeInTheDocument();
      });
    });

    it("exibe erro com status 500", async () => {
      mockedAxios.get.mockRejectedValue({
        response: { status: 500, data: "Internal Server Error" },
      });

      render(<Production />);

      await waitFor(() => {
        expect(screen.getByText(/Failed to fetch production data/i)).toBeInTheDocument();
      });
    });
  });

  describe("Botão Refresh Production", () => {
    it("renderiza o botão Refresh Production", async () => {
      const data = {
        products: [],
        totalValue: 0,
      };

      mockedAxios.get.mockResolvedValue({ data });

      render(<Production />);

      const refreshButton = screen.getByRole("button", { name: /Refresh Production/i });
      expect(refreshButton).toBeInTheDocument();
    });

    it("recarrega dados quando o botão Refresh é clicado", async () => {
      const user = userEvent.setup();

      const initialData = {
        products: [{ name: "PC Gamer", quantity: 2, price: 100 }],
        totalValue: 200,
      };

      const refreshedData = {
        products: [
          { name: "PC Gamer", quantity: 3, price: 100 },
          { name: "Notebook", quantity: 1, price: 500 },
        ],
        totalValue: 800,
      };

      mockedAxios.get
        .mockResolvedValueOnce({ data: initialData })
        .mockResolvedValueOnce({ data: refreshedData });

      render(<Production />);

      await waitFor(() => {
        expect(screen.getByText(/PC Gamer/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/Total Value: \$200\.00/i)).toBeInTheDocument();

      const refreshButton = screen.getByRole("button", { name: /Refresh Production/i });
      await user.click(refreshButton);

      expect(mockedAxios.get).toHaveBeenCalledTimes(2);

      await waitFor(() => {
        expect(screen.getByText(/Notebook/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/Total Value: \$800\.00/i)).toBeInTheDocument();
    });

    it("exibe loading ao clicar em Refresh", async () => {
      const user = userEvent.setup();

      const data = {
        products: [{ name: "PC Gamer", quantity: 2, price: 100 }],
        totalValue: 200,
      };

      // Primeira carga resolve rapidamente
      mockedAxios.get.mockResolvedValueOnce({ data });

      // Segunda carga (refresh) demora
      mockedAxios.get.mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(() => resolve({ data }), 100))
      );

      render(<Production />);

      // Aguarda primeira carga
      await waitFor(() => {
        expect(screen.getByText(/PC Gamer/i)).toBeInTheDocument();
      });

      // Clica em refresh
      const refreshButton = screen.getByRole("button", { name: /Refresh Production/i });
      await user.click(refreshButton);

      // Deve mostrar loading
      expect(screen.getByText(/loading\.\.\./i)).toBeInTheDocument();
    });

    it("limpa erro anterior ao fazer refresh com sucesso", async () => {
      const user = userEvent.setup();

      const data = {
        products: [{ name: "PC Gamer", quantity: 2, price: 100 }],
        totalValue: 200,
      };

      // Primeira carga falha
      mockedAxios.get.mockRejectedValueOnce(new Error("Error"));

      // Segunda carga (refresh) funciona
      mockedAxios.get.mockResolvedValueOnce({ data });

      render(<Production />);

      // Aguarda erro aparecer
      await waitFor(() => {
        expect(screen.getByText(/Failed to fetch production data/i)).toBeInTheDocument();
      });

      // Clica em refresh
      const refreshButton = screen.getByRole("button", { name: /Refresh Production/i });
      await user.click(refreshButton);

      // Erro deve sumir e dados devem aparecer
      await waitFor(() => {
        expect(screen.queryByText(/Failed to fetch production data/i)).not.toBeInTheDocument();
      });

      expect(screen.getByText(/PC Gamer/i)).toBeInTheDocument();
    });

    it("atualiza para estado vazio ao fazer refresh que retorna lista vazia", async () => {
      const user = userEvent.setup();

      const initialData = {
        products: [{ name: "PC Gamer", quantity: 2, price: 100 }],
        totalValue: 200,
      };

      const emptyData = {
        products: [],
        totalValue: 0,
      };

      mockedAxios.get
        .mockResolvedValueOnce({ data: initialData })
        .mockResolvedValueOnce({ data: emptyData });

      render(<Production />);

      // Aguarda dados iniciais
      await waitFor(() => {
        expect(screen.getByText(/PC Gamer/i)).toBeInTheDocument();
      });

      // Refresh
      const refreshButton = screen.getByRole("button", { name: /Refresh Production/i });
      await user.click(refreshButton);

      // Deve mostrar mensagem de vazio
      await waitFor(() => {
        expect(
          screen.getByText(/No products can be produced with current raw materials/i)
        ).toBeInTheDocument();
      });

      expect(screen.queryByText(/PC Gamer/i)).not.toBeInTheDocument();
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
    });
  });

  describe("Estrutura da Tabela", () => {
    it("renderiza cabeçalhos corretos da tabela", async () => {
      const data = {
        products: [{ name: "PC Gamer", quantity: 2, price: 100 }],
        totalValue: 200,
      };

      mockedAxios.get.mockResolvedValue({ data });

      render(<Production />);

      await waitFor(() => {
        // Busca pelos column headers da tabela
        const headers = screen.getAllByRole("columnheader");
        expect(headers[0]).toHaveTextContent("Product");
        expect(headers[1]).toHaveTextContent("Quantity");
        expect(headers[2]).toHaveTextContent("Price per unit");
      });
    });

    it("renderiza número correto de linhas na tabela", async () => {
      const data = {
        products: [
          { name: "Product 1", quantity: 1, price: 10 },
          { name: "Product 2", quantity: 2, price: 20 },
          { name: "Product 3", quantity: 3, price: 30 },
        ],
        totalValue: 140,
      };

      mockedAxios.get.mockResolvedValue({ data });

      render(<Production />);

      await waitFor(() => {
        const rows = screen.getAllByRole("row");
        // 1 header + 3 produtos = 4 linhas
        expect(rows).toHaveLength(4);
      });
    });
  });

  describe("Integração e Casos de Borda", () => {
    it("lida com produto de preço zero", async () => {
      const data = {
        products: [{ name: "Free Product", quantity: 10, price: 0 }],
        totalValue: 0,
      };

      mockedAxios.get.mockResolvedValue({ data });

      render(<Production />);

      await waitFor(() => {
        expect(screen.getByText(/Free Product/i)).toBeInTheDocument();
      });

      // $0.00 aparece tanto no preço quanto no total
      const zeroValues = screen.getAllByText(/0\.00/i);
      expect(zeroValues.length).toBeGreaterThan(0);
    });

    it("lida com valores decimais complexos", async () => {
      const data = {
        products: [
          { name: "Product", quantity: 3, price: 33.33333 },
        ],
        totalValue: 99.99999,
      };

      mockedAxios.get.mockResolvedValue({ data });

      render(<Production />);

      await waitFor(() => {
        expect(screen.getByText(/33\.33/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/\$100\.00/i)).toBeInTheDocument();
    });

    it("lida com nomes de produtos com caracteres especiais", async () => {
      const data = {
        products: [
          { name: "PC Gamer™ & Notebook® (Pro)", quantity: 1, price: 1000 },
        ],
        totalValue: 1000,
      };

      mockedAxios.get.mockResolvedValue({ data });

      render(<Production />);

      await waitFor(() => {
        expect(screen.getByText(/PC Gamer™ & Notebook® \(Pro\)/i)).toBeInTheDocument();
      });
    });

    it("não exibe tabela quando há erro", async () => {
      mockedAxios.get.mockRejectedValue(new Error("Error"));

      render(<Production />);

      await waitFor(() => {
        expect(screen.getByText(/Failed to fetch production data/i)).toBeInTheDocument();
      });

      expect(screen.queryByRole("table")).not.toBeInTheDocument();
      expect(screen.queryByText(/Total Value/i)).not.toBeInTheDocument();
    });

    it("não exibe mensagem de vazio quando há produtos", async () => {
      const data = {
        products: [{ name: "PC Gamer", quantity: 2, price: 100 }],
        totalValue: 200,
      };

      mockedAxios.get.mockResolvedValue({ data });

      render(<Production />);

      await waitFor(() => {
        expect(screen.getByText(/PC Gamer/i)).toBeInTheDocument();
      });

      expect(
        screen.queryByText(/No products can be produced with current raw materials/i)
      ).not.toBeInTheDocument();
    });
  });
});