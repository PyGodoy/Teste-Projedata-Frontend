import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RawMaterials from "../components/RawMaterials";
import axios from "axios";
import { vi } from "vitest";

vi.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock do window.confirm
const originalConfirm = window.confirm;

describe("RawMaterials Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset do mock do confirm antes de cada teste
    window.confirm = vi.fn(() => true);
  });

  afterEach(() => {
    // Restaurar confirm original
    window.confirm = originalConfirm;
  });

  describe("Renderização Básica", () => {
    it("renders raw materials list from API", async () => {
      const materials = [
        { id: 1, name: "CPU", stockQuantity: 10 },
        { id: 2, name: "RAM", stockQuantity: 20 },
      ];

      mockedAxios.get.mockResolvedValue({ data: materials });

      render(<RawMaterials />);

      await waitFor(() => {
        expect(screen.getByText(/CPU/i)).toBeInTheDocument();
        expect(screen.getByText(/RAM/i)).toBeInTheDocument();
      });
    });

    it("exibe o título do componente", async () => {
      mockedAxios.get.mockResolvedValue({ data: [] });
      render(<RawMaterials />);

      // Aguardar a renderização completa
      await waitFor(() => {
        expect(screen.getByRole("heading", { name: /raw materials/i })).toBeInTheDocument();
      });
    });

    it("renderiza mensagem de lista vazia quando não há dados", async () => {
      mockedAxios.get.mockResolvedValue({ data: [] });

      render(<RawMaterials />);

      await waitFor(() => {
        expect(screen.getByText(/No raw materials found. Create one above./i)).toBeInTheDocument();
        // A mensagem é um <li>, então a lista tem 1 filho
        const list = screen.getByRole("list");
        expect(list.children).toHaveLength(1);
      });
    });

    it("exibe múltiplos materiais corretamente", async () => {
      const materials = [
        { id: 1, name: "CPU", stockQuantity: 10 },
        { id: 2, name: "GPU", stockQuantity: 15 },
        { id: 3, name: "RAM", stockQuantity: 20 },
      ];

      mockedAxios.get.mockResolvedValue({ data: materials });

      render(<RawMaterials />);

      await waitFor(() => {
        expect(screen.getAllByRole("listitem")).toHaveLength(3);
      });
    });
  });

  describe("Tratamento de Erros", () => {
    it("trata erro de rede graciosamente", async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      mockedAxios.get.mockRejectedValue(new Error("Network Error"));

      render(<RawMaterials />);

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalled();
        expect(screen.getByText(/Failed to fetch raw materials/i)).toBeInTheDocument();
      });
      
      consoleErrorSpy.mockRestore();
    });

    it("trata resposta vazia da API com mensagem apropriada", async () => {
      mockedAxios.get.mockResolvedValue({ data: [] });

      render(<RawMaterials />);

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalled();
        expect(screen.getByText(/No raw materials found. Create one above./i)).toBeInTheDocument();
      });
    });
  });

  describe("Interações do Usuário", () => {
    it("possui formulário para adicionar material", async () => {
      mockedAxios.get.mockResolvedValue({ data: [] });

      render(<RawMaterials />);

      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText(/Material Name/i);
        const quantityInput = screen.getByPlaceholderText(/Stock Quantity/i);
        const addButton = screen.getByRole("button", { name: /add/i });

        expect(nameInput).toBeInTheDocument();
        expect(quantityInput).toBeInTheDocument();
        expect(addButton).toBeInTheDocument();
      });
    });

    it("permite preencher o formulário de adição", async () => {
      mockedAxios.get.mockResolvedValue({ data: [] });

      const user = userEvent.setup();
      render(<RawMaterials />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Material Name/i)).toBeInTheDocument();
      });

      const nameInput = screen.getByPlaceholderText(/Material Name/i);
      const quantityInput = screen.getByPlaceholderText(/Stock Quantity/i);

      await user.type(nameInput, "GPU");
      await user.clear(quantityInput);
      await user.type(quantityInput, "25");

      expect(nameInput).toHaveValue("GPU");
      expect(quantityInput).toHaveValue(25);
    });

    it("envia requisição POST ao adicionar material", async () => {
      const initialMaterials = [{ id: 1, name: "CPU", stockQuantity: 10 }];
      const newMaterial = { id: 2, name: "GPU", stockQuantity: 25 };

      mockedAxios.get.mockResolvedValue({ data: initialMaterials });
      mockedAxios.post.mockResolvedValue({ data: newMaterial });

      const user = userEvent.setup();
      render(<RawMaterials />);

      await waitFor(() => {
        expect(screen.getByText(/CPU/i)).toBeInTheDocument();
      });

      const nameInput = screen.getByPlaceholderText(/Material Name/i);
      const quantityInput = screen.getByPlaceholderText(/Stock Quantity/i);
      const addButton = screen.getByRole("button", { name: /add/i });

      await user.type(nameInput, "GPU");
      await user.clear(quantityInput);
      await user.type(quantityInput, "25");
      await user.click(addButton);

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          expect.stringContaining("raw-materials"),
          expect.objectContaining({
            name: "GPU",
            stockQuantity: 25,
          })
        );
      });
    });

    it("possui botões de editar e deletar para cada material", async () => {
      const materials = [
        { id: 1, name: "CPU", stockQuantity: 10 },
        { id: 2, name: "RAM", stockQuantity: 20 },
      ];

      mockedAxios.get.mockResolvedValue({ data: materials });

      render(<RawMaterials />);

      await waitFor(() => {
        const editButtons = screen.getAllByRole("button", { name: /edit/i });
        const deleteButtons = screen.getAllByRole("button", { name: /delete/i });

        expect(editButtons).toHaveLength(2);
        expect(deleteButtons).toHaveLength(2);
      });
    });

    it("altera o formulário para modo de edição ao clicar em Edit", async () => {
      const materials = [{ id: 1, name: "CPU", stockQuantity: 10 }];

      mockedAxios.get.mockResolvedValue({ data: materials });

      const user = userEvent.setup();
      render(<RawMaterials />);

      await waitFor(() => {
        expect(screen.getByText(/CPU/i)).toBeInTheDocument();
      });

      const editButton = screen.getByRole("button", { name: /edit/i });
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /update/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
      });
    });

    it("carrega dados do material no formulário ao editar", async () => {
      const materials = [{ id: 1, name: "CPU", stockQuantity: 10 }];

      mockedAxios.get.mockResolvedValue({ data: materials });

      const user = userEvent.setup();
      render(<RawMaterials />);

      await waitFor(() => {
        expect(screen.getByText(/CPU/i)).toBeInTheDocument();
      });

      const editButton = screen.getByRole("button", { name: /edit/i });
      await user.click(editButton);

      const nameInput = screen.getByPlaceholderText(/Material Name/i);
      expect(nameInput).toHaveValue("CPU");
    });

    it("envia requisição DELETE ao deletar material", async () => {
      const materials = [
        { id: 1, name: "CPU", stockQuantity: 10 },
        { id: 2, name: "RAM", stockQuantity: 20 },
      ];

      mockedAxios.get.mockResolvedValue({ data: materials });
      mockedAxios.delete.mockResolvedValue({ data: { success: true } });

      const user = userEvent.setup();
      render(<RawMaterials />);

      await waitFor(() => {
        expect(screen.getByText(/CPU/i)).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(mockedAxios.delete).toHaveBeenCalledWith(
          expect.stringContaining("/raw-materials/1")
        );
      });
    });

    it("não envia DELETE quando usuário cancela", async () => {
      // Mock do confirm para retornar false (cancelar)
      window.confirm = vi.fn(() => false);
      
      const materials = [{ id: 1, name: "CPU", stockQuantity: 10 }];

      mockedAxios.get.mockResolvedValue({ data: materials });
      mockedAxios.delete.mockResolvedValue({ data: { success: true } });

      const user = userEvent.setup();
      render(<RawMaterials />);

      await waitFor(() => {
        expect(screen.getByText(/CPU/i)).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole("button", { name: /delete/i });
      await user.click(deleteButton);

      // O confirm deve ser chamado
      expect(window.confirm).toHaveBeenCalled();
      // O delete NÃO deve ser chamado
      expect(mockedAxios.delete).not.toHaveBeenCalled();
    });
  });

  describe("Estrutura de Dados", () => {
    it("exibe quantidade corretamente formatada", async () => {
      const materials = [{ id: 1, name: "CPU", stockQuantity: 10 }];

      mockedAxios.get.mockResolvedValue({ data: materials });

      render(<RawMaterials />);

      await waitFor(() => {
        expect(screen.getByText(/Quantity: 10/i)).toBeInTheDocument();
      });
    });

    it("mantém a ordem dos materiais retornados pela API", async () => {
      const materials = [
        { id: 3, name: "GPU", stockQuantity: 15 },
        { id: 1, name: "CPU", stockQuantity: 10 },
        { id: 2, name: "RAM", stockQuantity: 20 },
      ];

      mockedAxios.get.mockResolvedValue({ data: materials });

      render(<RawMaterials />);

      await waitFor(() => {
        const items = screen.getAllByRole("listitem");
        expect(items[0]).toHaveTextContent("GPU");
        expect(items[1]).toHaveTextContent("CPU");
        expect(items[2]).toHaveTextContent("RAM");
      });
    });

    it("exibe mensagem de erro quando API falha", async () => {
      mockedAxios.get.mockRejectedValue(new Error("Failed to fetch"));

      render(<RawMaterials />);

      await waitFor(() => {
        expect(screen.getByText(/Failed to fetch raw materials/i)).toBeInTheDocument();
      });
    });
  });

  describe("Integração com API", () => {
    it("faz GET request ao montar componente", async () => {
      mockedAxios.get.mockResolvedValue({ data: [] });

      render(<RawMaterials />);

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      });
    });

    it("usa endpoint correto para listar materiais", async () => {
      mockedAxios.get.mockResolvedValue({ data: [] });

      render(<RawMaterials />);

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith(
          expect.stringContaining("raw-materials")
        );
      });
    });

    it("recarrega dados após adicionar material", async () => {
      const initialData = [{ id: 1, name: "CPU", stockQuantity: 10 }];
      const updatedData = [
        { id: 1, name: "CPU", stockQuantity: 10 },
        { id: 2, name: "GPU", stockQuantity: 25 },
      ];

      mockedAxios.get
        .mockResolvedValueOnce({ data: initialData })
        .mockResolvedValueOnce({ data: updatedData });
      
      mockedAxios.post.mockResolvedValue({ data: { id: 2, name: "GPU", stockQuantity: 25 } });

      const user = userEvent.setup();
      render(<RawMaterials />);

      await waitFor(() => {
        expect(screen.getByText(/CPU/i)).toBeInTheDocument();
      });

      const nameInput = screen.getByPlaceholderText(/Material Name/i);
      const quantityInput = screen.getByPlaceholderText(/Stock Quantity/i);
      const addButton = screen.getByRole("button", { name: /add/i });

      await user.type(nameInput, "GPU");
      await user.clear(quantityInput);
      await user.type(quantityInput, "25");
      await user.click(addButton);

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe("Validações de Formulário", () => {
    it("campos de input possuem atributos corretos", async () => {
      mockedAxios.get.mockResolvedValue({ data: [] });

      render(<RawMaterials />);

      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText(/Material Name/i);
        const quantityInput = screen.getByPlaceholderText(/Stock Quantity/i);

        expect(nameInput).toHaveAttribute("type", "text");
        expect(quantityInput).toHaveAttribute("type", "number");
        expect(nameInput).toHaveAttribute("required");
        expect(quantityInput).toHaveAttribute("required");
        expect(quantityInput).toHaveAttribute("min", "1");
      });
    });

    it("quantidade inicia vazia (sem valor padrão)", async () => {
      mockedAxios.get.mockResolvedValue({ data: [] });

      render(<RawMaterials />);

      await waitFor(() => {
        const quantityInput = screen.getByPlaceholderText(/Stock Quantity/i);
        expect(quantityInput).toHaveValue(null);
      });
    });
  });

  describe("Estado do Componente", () => {
    it("limpa formulário após adicionar material", async () => {
      mockedAxios.get.mockResolvedValue({ data: [] });
      mockedAxios.post.mockResolvedValue({ data: { id: 1, name: "GPU", stockQuantity: 25 } });

      const user = userEvent.setup();
      render(<RawMaterials />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Material Name/i)).toBeInTheDocument();
      });

      const nameInput = screen.getByPlaceholderText(/Material Name/i);
      const quantityInput = screen.getByPlaceholderText(/Stock Quantity/i);
      const addButton = screen.getByRole("button", { name: /add/i });

      await user.type(nameInput, "GPU");
      await user.clear(quantityInput);
      await user.type(quantityInput, "25");
      await user.click(addButton);

      await waitFor(() => {
        expect(nameInput).toHaveValue("");
        expect(quantityInput).toHaveValue(null);
      });
    });

    it("botão Cancel restaura formulário ao modo de adição", async () => {
      const materials = [{ id: 1, name: "CPU", stockQuantity: 10 }];

      mockedAxios.get.mockResolvedValue({ data: materials });

      const user = userEvent.setup();
      render(<RawMaterials />);

      await waitFor(() => {
        expect(screen.getByText(/CPU/i)).toBeInTheDocument();
      });

      // Entra em modo de edição
      const editButton = screen.getByRole("button", { name: /edit/i });
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /update/i })).toBeInTheDocument();
      });

      // Clica em Cancel
      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument();
        const nameInput = screen.getByPlaceholderText(/Material Name/i);
        expect(nameInput).toHaveValue("");
      });
    });
  });

  describe("Renderização de Lista", () => {
    it("cada item da lista possui botões de ação", async () => {
      const materials = [
        { id: 1, name: "CPU", stockQuantity: 10 },
        { id: 2, name: "RAM", stockQuantity: 20 },
        { id: 3, name: "GPU", stockQuantity: 15 },
      ];

      mockedAxios.get.mockResolvedValue({ data: materials });

      render(<RawMaterials />);

      await waitFor(() => {
        const listItems = screen.getAllByRole("listitem");
        expect(listItems).toHaveLength(3);
        expect(screen.getAllByRole("button", { name: /edit/i })).toHaveLength(3);
        expect(screen.getAllByRole("button", { name: /delete/i })).toHaveLength(3);
      });
    });

    it("exibe nome e quantidade de cada material", async () => {
      const materials = [
        { id: 1, name: "CPU Intel i9", stockQuantity: 10 },
        { id: 2, name: "RAM DDR4 16GB", stockQuantity: 25 },
      ];

      mockedAxios.get.mockResolvedValue({ data: materials });

      render(<RawMaterials />);

      await waitFor(() => {
        expect(screen.getByText(/CPU Intel i9/i)).toBeInTheDocument();
        expect(screen.getByText(/RAM DDR4 16GB/i)).toBeInTheDocument();
        expect(screen.getByText(/Quantity: 10/i)).toBeInTheDocument();
        expect(screen.getByText(/Quantity: 25/i)).toBeInTheDocument();
      });
    });
  });
});