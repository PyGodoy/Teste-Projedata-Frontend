// Products.test.tsx - Suite Completa de Testes Avançados
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Products from "../components/Products";
import axios from "axios";
import { vi } from "vitest";

vi.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock window.confirm
const mockConfirm = vi.fn();
window.confirm = mockConfirm;

describe("Products Component - Suite Completa", () => {
  const mockProducts = [
    { id: 1, name: "PC Gamer", price: 100, quantity: 2 },
    { id: 2, name: "Notebook", price: 200, quantity: 5 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockConfirm.mockReturnValue(true);
  });

  describe("Renderização Inicial e Carregamento", () => {
    it("renderiza título do componente", async () => {
      mockedAxios.get.mockResolvedValue({ data: [] });

      render(<Products />);

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: /products/i })).toBeInTheDocument();
      });
    });

    it("faz requisição GET ao montar componente", async () => {
      mockedAxios.get.mockResolvedValue({ data: mockProducts });

      render(<Products />);

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledTimes(1);
        expect(mockedAxios.get).toHaveBeenCalledWith("http://localhost:8080/products");
      });
    });

    it("exibe estado de loading durante carregamento", async () => {
      mockedAxios.get.mockImplementation(() => new Promise(() => {}));

      render(<Products />);

      expect(screen.getByText(/loading\.\.\./i)).toBeInTheDocument();
    });

    it("renderiza formulário vazio inicialmente", async () => {
      mockedAxios.get.mockResolvedValue({ data: [] });

      render(<Products />);

      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText("Product Name");
        const priceInput = screen.getByPlaceholderText("Price (ex: 99.90)");
        const quantityInput = screen.getByPlaceholderText("Quantity (ex: 10)");

        expect(nameInput).toHaveDisplayValue("");
        expect(priceInput).toHaveDisplayValue("");
        expect(quantityInput).toHaveDisplayValue("");
      });
    });

    it("renderiza botão Add inicialmente", async () => {
      mockedAxios.get.mockResolvedValue({ data: [] });

      render(<Products />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument();
      });
    });
  });

  describe("Exibição de Produtos", () => {
    it("renderiza lista de produtos da API", async () => {
      mockedAxios.get.mockResolvedValue({ data: mockProducts });

      render(<Products />);

      await waitFor(() => {
        expect(screen.getByText("PC Gamer")).toBeInTheDocument();
        expect(screen.getByText("Notebook")).toBeInTheDocument();
      });
    });

    it("exibe todos os detalhes dos produtos na tabela", async () => {
      mockedAxios.get.mockResolvedValue({ data: mockProducts });

      render(<Products />);

      await waitFor(() => {
        const rows = screen.getAllByRole("row");
        
        expect(within(rows[1]).getByText("1")).toBeInTheDocument();
        expect(within(rows[1]).getByText("PC Gamer")).toBeInTheDocument();
        expect(within(rows[1]).getByText(/\$?\s*100\.00/)).toBeInTheDocument();
        expect(within(rows[1]).getByText("2")).toBeInTheDocument();

        expect(within(rows[2]).getByText("2")).toBeInTheDocument();
        expect(within(rows[2]).getByText("Notebook")).toBeInTheDocument();
        expect(within(rows[2]).getByText(/\$?\s*200\.00/)).toBeInTheDocument();
        expect(within(rows[2]).getByText("5")).toBeInTheDocument();
      });
    });

    it("renderiza cabeçalhos corretos da tabela", async () => {
      mockedAxios.get.mockResolvedValue({ data: mockProducts });

      render(<Products />);

      await waitFor(() => {
        const headers = screen.getAllByRole("columnheader");
        expect(headers[0]).toHaveTextContent("ID");
        expect(headers[1]).toHaveTextContent("Name");
        expect(headers[2]).toHaveTextContent("Price");
        expect(headers[3]).toHaveTextContent("Quantity");
        expect(headers[4]).toHaveTextContent("Actions");
      });
    });

    it("exibe botões Edit e Delete para cada produto", async () => {
      mockedAxios.get.mockResolvedValue({ data: mockProducts });

      render(<Products />);

      await waitFor(() => {
        const editButtons = screen.getAllByRole("button", { name: /edit/i });
        const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
        
        expect(editButtons).toHaveLength(2);
        expect(deleteButtons).toHaveLength(2);
      });
    });

    it("não exibe produtos quando lista está vazia", async () => {
      mockedAxios.get.mockResolvedValue({ data: [] });

      render(<Products />);

      await waitFor(() => {
        const rows = screen.getAllByRole("row");
        expect(rows).toHaveLength(1);
      });
    });

    it("remove loading após carregar produtos", async () => {
      mockedAxios.get.mockResolvedValue({ data: mockProducts });

      render(<Products />);

      await waitFor(() => {
        expect(screen.queryByText(/loading\.\.\./i)).not.toBeInTheDocument();
      });
    });
  });

  describe("Criar Novo Produto", () => {
    it("cria produto ao submeter formulário", async () => {
      const user = userEvent.setup();

      mockedAxios.get.mockResolvedValue({ data: [] });
      mockedAxios.post.mockResolvedValue({ data: mockProducts[0] });

      render(<Products />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText("Product Name")).toBeInTheDocument();
      });

      const nameInput = screen.getByPlaceholderText("Product Name");
      const priceInput = screen.getByPlaceholderText("Price (ex: 99.90)");
      const quantityInput = screen.getByPlaceholderText("Quantity (ex: 10)");
      const addButton = screen.getByRole("button", { name: /add/i });

      await user.type(nameInput, "Mouse Gamer");
      await user.clear(priceInput);
      await user.type(priceInput, "50");
      await user.clear(quantityInput);
      await user.type(quantityInput, "10");
      await user.click(addButton);

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledTimes(1);
        expect(mockedAxios.post).toHaveBeenCalledWith(
          "http://localhost:8080/products",
          {
            name: "Mouse Gamer",
            price: 50,
            quantity: 10,
          }
        );
      });
    });

    it("recarrega lista após criar produto", async () => {
      const user = userEvent.setup();

      let callCount = 0;
      mockedAxios.get.mockImplementation(() => {
        callCount++;
        return Promise.resolve({ 
          data: callCount === 1 ? [] : mockProducts 
        });
      });

      mockedAxios.post.mockResolvedValue({ data: mockProducts[0] });

      render(<Products />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText("Product Name")).toBeInTheDocument();
      });

      const nameInput = screen.getByPlaceholderText("Product Name");
      const priceInput = screen.getByPlaceholderText("Price (ex: 99.90)");
      const quantityInput = screen.getByPlaceholderText("Quantity (ex: 10)");
      const addButton = screen.getByRole("button", { name: /add/i });

      await user.type(nameInput, "Test Product");
      await user.clear(priceInput);
      await user.type(priceInput, "100");
      await user.clear(quantityInput);
      await user.type(quantityInput, "5");
      await user.click(addButton);

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledTimes(2);
      });
    });

    it("reseta formulário após criar produto com sucesso", async () => {
      const user = userEvent.setup();

      mockedAxios.get.mockResolvedValue({ data: [] });
      mockedAxios.post.mockResolvedValue({ data: mockProducts[0] });

      render(<Products />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText("Product Name")).toBeInTheDocument();
      });

      const nameInput = screen.getByPlaceholderText("Product Name");
      const priceInput = screen.getByPlaceholderText("Price (ex: 99.90)");
      const quantityInput = screen.getByPlaceholderText("Quantity (ex: 10)");
      const addButton = screen.getByRole("button", { name: /add/i });

      await user.type(nameInput, "Test");
      await user.clear(priceInput);
      await user.type(priceInput, "50");
      await user.clear(quantityInput);
      await user.type(quantityInput, "5");
      await user.click(addButton);

      await waitFor(() => {
        expect(nameInput).toHaveDisplayValue("");
        expect(priceInput).toHaveDisplayValue("");
        expect(quantityInput).toHaveDisplayValue("");
      });
    });

    it("campos são obrigatórios", async () => {
      mockedAxios.get.mockResolvedValue({ data: [] });

      render(<Products />);

      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText("Product Name");
        const priceInput = screen.getByPlaceholderText("Price (ex: 99.90)");
        const quantityInput = screen.getByPlaceholderText("Quantity (ex: 10)");

        expect(nameInput).toBeRequired();
        expect(priceInput).toBeRequired();
        expect(quantityInput).toBeRequired();
      });
    });
  });

  describe("Editar Produto", () => {
    it("preenche formulário ao clicar em Edit", async () => {
      const user = userEvent.setup();

      mockedAxios.get.mockResolvedValue({ data: mockProducts });

      render(<Products />);

      await waitFor(() => {
        expect(screen.getByText("PC Gamer")).toBeInTheDocument();
      });

      const editButtons = screen.getAllByRole("button", { name: /edit/i });
      await user.click(editButtons[0]);

      const nameInput = screen.getByPlaceholderText("Product Name");
      const priceInput = screen.getByPlaceholderText("Price (ex: 99.90)");
      const quantityInput = screen.getByPlaceholderText("Quantity (ex: 10)");

      expect(nameInput).toHaveValue("PC Gamer");
      expect(priceInput).toHaveValue(100);
      expect(quantityInput).toHaveValue(2);
    });

    it("altera botão de Add para Update ao editar", async () => {
      const user = userEvent.setup();

      mockedAxios.get.mockResolvedValue({ data: mockProducts });

      render(<Products />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument();
      });

      const editButtons = screen.getAllByRole("button", { name: /edit/i });
      await user.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /update/i })).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /^add$/i })).not.toBeInTheDocument();
      });
    });

    it("exibe botão Cancel ao editar", async () => {
      const user = userEvent.setup();

      mockedAxios.get.mockResolvedValue({ data: mockProducts });

      render(<Products />);

      await waitFor(() => {
        expect(screen.getByText("PC Gamer")).toBeInTheDocument();
      });

      expect(screen.queryByRole("button", { name: /cancel/i })).not.toBeInTheDocument();

      const editButtons = screen.getAllByRole("button", { name: /edit/i });
      await user.click(editButtons[0]);

      expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    });

    it("faz PUT ao submeter edição", async () => {
      const user = userEvent.setup();

      mockedAxios.get.mockResolvedValue({ data: mockProducts });
      mockedAxios.put.mockResolvedValue({ data: { ...mockProducts[0], price: 150 } });

      render(<Products />);

      await waitFor(() => {
        expect(screen.getByText("PC Gamer")).toBeInTheDocument();
      });

      const editButtons = screen.getAllByRole("button", { name: /edit/i });
      await user.click(editButtons[0]);

      const priceInput = screen.getByPlaceholderText("Price (ex: 99.90)");
      await user.clear(priceInput);
      await user.type(priceInput, "150");

      const updateButton = screen.getByRole("button", { name: /update/i });
      await user.click(updateButton);

      await waitFor(() => {
        expect(mockedAxios.put).toHaveBeenCalledTimes(1);
        expect(mockedAxios.put).toHaveBeenCalledWith(
          "http://localhost:8080/products/1",
          {
            name: "PC Gamer",
            price: 150,
            quantity: 2,
          }
        );
      });
    });

    it("cancela edição ao clicar em Cancel", async () => {
      const user = userEvent.setup();

      mockedAxios.get.mockResolvedValue({ data: mockProducts });

      render(<Products />);

      await waitFor(() => {
        expect(screen.getByText("PC Gamer")).toBeInTheDocument();
      });

      const editButtons = screen.getAllByRole("button", { name: /edit/i });
      await user.click(editButtons[0]);

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      await user.click(cancelButton);

      const nameInput = screen.getByPlaceholderText("Product Name");
      const priceInput = screen.getByPlaceholderText("Price (ex: 99.90)");
      const quantityInput = screen.getByPlaceholderText("Quantity (ex: 10)");

      expect(nameInput).toHaveDisplayValue("");
      expect(priceInput).toHaveDisplayValue("");
      expect(quantityInput).toHaveDisplayValue("");

      expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /cancel/i })).not.toBeInTheDocument();
    });

    it("permite editar múltiplos campos", async () => {
      const user = userEvent.setup();

      mockedAxios.get.mockResolvedValue({ data: mockProducts });
      mockedAxios.put.mockResolvedValue({ data: {} });

      render(<Products />);

      await waitFor(() => {
        expect(screen.getByText("PC Gamer")).toBeInTheDocument();
      });

      const editButtons = screen.getAllByRole("button", { name: /edit/i });
      await user.click(editButtons[0]);

      const nameInput = screen.getByPlaceholderText("Product Name");
      const priceInput = screen.getByPlaceholderText("Price (ex: 99.90)");
      const quantityInput = screen.getByPlaceholderText("Quantity (ex: 10)");

      await user.clear(nameInput);
      await user.type(nameInput, "PC Gamer Pro");
      await user.clear(priceInput);
      await user.type(priceInput, "200");
      await user.clear(quantityInput);
      await user.type(quantityInput, "5");

      const updateButton = screen.getByRole("button", { name: /update/i });
      await user.click(updateButton);

      await waitFor(() => {
        expect(mockedAxios.put).toHaveBeenCalledWith(
          "http://localhost:8080/products/1",
          {
            name: "PC Gamer Pro",
            price: 200,
            quantity: 5,
          }
        );
      });
    });
  });

  describe("Deletar Produto", () => {
    it("exibe confirmação ao clicar em Delete", async () => {
      const user = userEvent.setup();

      mockedAxios.get.mockResolvedValue({ data: mockProducts });

      render(<Products />);

      await waitFor(() => {
        expect(screen.getByText("PC Gamer")).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
      await user.click(deleteButtons[0]);

      expect(mockConfirm).toHaveBeenCalledWith("Are you sure you want to delete this product?");
    });

    it("faz DELETE quando confirmado", async () => {
      const user = userEvent.setup();

      mockConfirm.mockReturnValue(true);
      mockedAxios.get.mockResolvedValue({ data: mockProducts });
      mockedAxios.delete.mockResolvedValue({ data: {} });

      render(<Products />);

      await waitFor(() => {
        expect(screen.getByText("PC Gamer")).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
        expect(mockedAxios.delete).toHaveBeenCalledWith("http://localhost:8080/products/1");
      });
    });

    it("NÃO deleta quando cancelado", async () => {
      const user = userEvent.setup();

      mockConfirm.mockReturnValue(false);
      mockedAxios.get.mockResolvedValue({ data: mockProducts });

      render(<Products />);

      await waitFor(() => {
        expect(screen.getByText("PC Gamer")).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
      await user.click(deleteButtons[0]);

      expect(mockedAxios.delete).not.toHaveBeenCalled();
    });

    it("recarrega lista após deletar", async () => {
      const user = userEvent.setup();

      mockConfirm.mockReturnValue(true);
      mockedAxios.get.mockResolvedValue({ data: mockProducts });
      mockedAxios.delete.mockResolvedValue({ data: {} });

      render(<Products />);

      await waitFor(() => {
        expect(screen.getByText("PC Gamer")).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe("Tratamento de Erros", () => {
    it("exibe mensagem de erro ao falhar carregamento", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      mockedAxios.get.mockRejectedValue(new Error("Network Error"));

      render(<Products />);

      await waitFor(() => {
        expect(screen.getByText(/failed to fetch products/i)).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });

    it("aplica estilo vermelho à mensagem de erro", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      mockedAxios.get.mockRejectedValue(new Error("Error"));

      render(<Products />);

      await waitFor(() => {
        const errorElement = screen.getByText(/failed to fetch products/i);
        expect(errorElement).toHaveStyle({ color: "rgb(255, 0, 0)" });
      });

      consoleSpy.mockRestore();
    });

    it("exibe erro ao falhar criação de produto", async () => {
      const user = userEvent.setup();
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      mockedAxios.get.mockResolvedValue({ data: [] });
      mockedAxios.post.mockRejectedValue(new Error("Failed to create"));

      render(<Products />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText("Product Name")).toBeInTheDocument();
      });

      const nameInput = screen.getByPlaceholderText("Product Name");
      const priceInput = screen.getByPlaceholderText("Price (ex: 99.90)");
      const quantityInput = screen.getByPlaceholderText("Quantity (ex: 10)");
      const addButton = screen.getByRole("button", { name: /add/i });

      await user.type(nameInput, "Test");
      await user.clear(priceInput);
      await user.type(priceInput, "100");
      await user.clear(quantityInput);
      await user.type(quantityInput, "5");
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to save product/i)).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });

    it("exibe erro ao falhar deleção de produto", async () => {
      const user = userEvent.setup();
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      mockConfirm.mockReturnValue(true);
      mockedAxios.get.mockResolvedValue({ data: mockProducts });
      mockedAxios.delete.mockRejectedValue(new Error("Failed to delete"));

      render(<Products />);

      await waitFor(() => {
        expect(screen.getByText("PC Gamer")).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/failed to delete product/i)).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });
  });

  describe("Integração e Casos de Borda", () => {
    it("lida com preços decimais", async () => {
      const user = userEvent.setup();

      mockedAxios.get.mockResolvedValue({ data: [] });
      mockedAxios.post.mockResolvedValue({ data: {} });

      render(<Products />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText("Product Name")).toBeInTheDocument();
      });

      const nameInput = screen.getByPlaceholderText("Product Name");
      const priceInput = screen.getByPlaceholderText("Price (ex: 99.90)");
      const quantityInput = screen.getByPlaceholderText("Quantity (ex: 10)");
      const addButton = screen.getByRole("button", { name: /add/i });

      await user.type(nameInput, "Product");
      await user.clear(priceInput);
      await user.type(priceInput, "99.99");
      await user.clear(quantityInput);
      await user.type(quantityInput, "1");
      await user.click(addButton);

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          "http://localhost:8080/products",
          expect.objectContaining({
            price: 99.99,
          })
        );
      });
    });

    it("lida com nomes de produtos longos", async () => {
      const longName = "A".repeat(100);
      const products = [{ id: 1, name: longName, price: 100, quantity: 1 }];

      mockedAxios.get.mockResolvedValue({ data: products });

      render(<Products />);

      await waitFor(() => {
        expect(screen.getByText(longName)).toBeInTheDocument();
      });
    });

    it("valida que quantidade deve ser positiva", async () => {
      const user = userEvent.setup();

      mockedAxios.get.mockResolvedValue({ data: [] });
      mockedAxios.post.mockResolvedValue({ data: {} });

      render(<Products />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText("Product Name")).toBeInTheDocument();
      });

      const nameInput = screen.getByPlaceholderText("Product Name");
      const priceInput = screen.getByPlaceholderText("Price (ex: 99.90)");
      const quantityInput = screen.getByPlaceholderText("Quantity (ex: 10)");
      const addButton = screen.getByRole("button", { name: /add/i });

      await user.type(nameInput, "Product");
      await user.clear(priceInput);
      await user.type(priceInput, "50");
      
      // Remove o atributo min para permitir valores negativos no teste
      quantityInput.removeAttribute('min');
      await user.clear(quantityInput);
      await user.type(quantityInput, "-5");
      
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText(/Quantity must be a positive number/i)).toBeInTheDocument();
      });
      
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    it("permite quantidade mínima 1", async () => {
      const user = userEvent.setup();

      mockedAxios.get.mockResolvedValue({ data: [] });
      mockedAxios.post.mockResolvedValue({ data: {} });

      render(<Products />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText("Product Name")).toBeInTheDocument();
      });

      const nameInput = screen.getByPlaceholderText("Product Name");
      const priceInput = screen.getByPlaceholderText("Price (ex: 99.90)");
      const quantityInput = screen.getByPlaceholderText("Quantity (ex: 10)");
      const addButton = screen.getByRole("button", { name: /add/i });

      await user.type(nameInput, "Product");
      await user.clear(priceInput);
      await user.type(priceInput, "50");
      await user.clear(quantityInput);
      await user.type(quantityInput, "1");
      await user.click(addButton);

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          "http://localhost:8080/products",
          expect.objectContaining({
            quantity: 1,
          })
        );
      });
    });
  });
});