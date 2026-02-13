import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProductRawMaterials from "../components/ProductRawMaterials";
import axios from "axios";
import { vi } from "vitest";

vi.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock do window.confirm
const mockConfirm = vi.fn();
window.confirm = mockConfirm;

describe("ProductRawMaterials Component - Suite Completa", () => {
  // Mock data comum
  const mockProducts = [
    { id: 1, name: "PC Gamer", price: 100 },
    { id: 2, name: "Notebook", price: 200 },
  ];

  const mockRawMaterials = [
    { id: 1, name: "CPU", stockQuantity: 10 },
    { id: 2, name: "RAM", stockQuantity: 20 },
  ];

  const mockAssociations = [
    {
      id: 1,
      product: { id: 1, name: "PC Gamer", price: 100 },
      rawMaterial: { id: 1, name: "CPU", stockQuantity: 10 },
      quantityRequired: 2,
    },
  ];

  // Helper para buscar selects (já que não têm accessible name)
  const getProductSelect = () => screen.getAllByRole("combobox")[0];
  const getMaterialSelect = () => screen.getAllByRole("combobox")[1];

  beforeEach(() => {
    vi.clearAllMocks();
    mockConfirm.mockReturnValue(true);
    
    // Mock padrão para todas as chamadas GET
    mockedAxios.get.mockImplementation((url) => {
        if (url.includes("products")) {
        return Promise.resolve({ data: mockProducts });
        }
        if (url.includes("raw-materials")) {
        return Promise.resolve({ data: mockRawMaterials });
        }
        if (url.includes("product-materials")) {
        return Promise.resolve({ data: [] });
        }
        return Promise.resolve({ data: [] });
    });
    
    // Mocks padrão para outros métodos
    mockedAxios.post.mockResolvedValue({ data: {} });
    mockedAxios.put.mockResolvedValue({ data: {} });
    mockedAxios.delete.mockResolvedValue({ data: {} });
    });

  describe("Renderização Inicial e Carregamento de Dados", () => {
    it("faz 3 requisições GET ao montar o componente", async () => {
      mockedAxios.get.mockImplementation((url) => {
        if (url.includes("products")) {
          return Promise.resolve({ data: mockProducts });
        }
        if (url.includes("raw-materials")) {
          return Promise.resolve({ data: mockRawMaterials });
        }
        return Promise.resolve({ data: mockAssociations });
      });

      render(<ProductRawMaterials />);

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledTimes(3);
      });

      expect(mockedAxios.get).toHaveBeenCalledWith("http://localhost:8080/products");
      expect(mockedAxios.get).toHaveBeenCalledWith("http://localhost:8080/raw-materials");
      expect(mockedAxios.get).toHaveBeenCalledWith("http://localhost:8080/product-materials");
    });

    it("renderiza título correto", async () => {
      render(<ProductRawMaterials />);
      
      await waitFor(() => {
        expect(screen.getByText("Associate Raw Materials to Products")).toBeInTheDocument();
      });
    });

    it("renderiza formulário com campos vazios inicialmente", async () => {
      render(<ProductRawMaterials />);

      await waitFor(() => {
        const productSelect = getProductSelect();
        const materialSelect = getMaterialSelect();
        const quantityInput = screen.getByPlaceholderText("Quantity Required (ex: 5)");

        expect(productSelect).toHaveValue("");
        expect(materialSelect).toHaveValue("");
        expect(quantityInput).toHaveValue(null); // Input number com valor vazio retorna null
      });
    });

    it("popula dropdown de produtos com dados da API", async () => {
      mockedAxios.get.mockImplementation((url) => {
        if (url.includes("products")) return Promise.resolve({ data: mockProducts });
        return Promise.resolve({ data: [] });
      });

      render(<ProductRawMaterials />);

      await waitFor(() => {
        const productSelect = getProductSelect();
        const options = within(productSelect).getAllByRole("option");
        
        expect(options).toHaveLength(3);
        expect(options[1]).toHaveTextContent("PC Gamer ($100)");
        expect(options[2]).toHaveTextContent("Notebook ($200)");
      });
    });

    it("popula dropdown de matérias-primas com dados da API", async () => {
      mockedAxios.get.mockImplementation((url) => {
        if (url.includes("raw-materials")) return Promise.resolve({ data: mockRawMaterials });
        return Promise.resolve({ data: [] });
      });

      render(<ProductRawMaterials />);

      await waitFor(() => {
        const materialSelect = getMaterialSelect();
        const options = within(materialSelect).getAllByRole("option");
        
        expect(options).toHaveLength(3);
        expect(options[1]).toHaveTextContent("CPU - Stock: 10");
        expect(options[2]).toHaveTextContent("RAM - Stock: 20");
      });
    });
  });

    describe("Exibição de Associações", () => {
        it("renderiza lista de associações existentes", async () => {
            mockedAxios.get.mockImplementation((url) => {
            if (url.includes("product-materials")) {
                return Promise.resolve({ data: mockAssociations });
            }
            if (url.includes("products")) {
                return Promise.resolve({ data: mockProducts });
            }
            if (url.includes("raw-materials")) {
                return Promise.resolve({ data: mockRawMaterials });
            }
            return Promise.resolve({ data: [] });
            });

            render(<ProductRawMaterials />);

            // Verificar que existe um item na lista
            await waitFor(() => {
            const listItems = screen.getAllByRole('listitem');
            expect(listItems).toHaveLength(1);
            });

            // Verificar conteúdo do primeiro item da lista
            const listItem = screen.getAllByRole('listitem')[0];
            expect(listItem).toHaveTextContent('PC Gamer');
            expect(listItem).toHaveTextContent('CPU');
            expect(listItem).toHaveTextContent('2');
        });

        it("renderiza múltiplas associações corretamente", async () => {
            const multipleAssociations = [
            {
                id: 1,
                product: { id: 1, name: "PC Gamer", price: 100 },
                rawMaterial: { id: 1, name: "CPU", stockQuantity: 10 },
                quantityRequired: 2,
            },
            {
                id: 2,
                product: { id: 2, name: "Notebook", price: 200 },
                rawMaterial: { id: 2, name: "RAM", stockQuantity: 20 },
                quantityRequired: 4,
            },
            ];

            mockedAxios.get.mockImplementation((url) => {
            if (url.includes("product-materials")) {
                return Promise.resolve({ data: multipleAssociations });
            }
            if (url.includes("products")) {
                return Promise.resolve({ data: mockProducts });
            }
            if (url.includes("raw-materials")) {
                return Promise.resolve({ data: mockRawMaterials });
            }
            return Promise.resolve({ data: [] });
            });

            render(<ProductRawMaterials />);

            // Verificar que existem dois itens na lista
            await waitFor(() => {
            const listItems = screen.getAllByRole('listitem');
            expect(listItems).toHaveLength(2);
            });

            // Verificar conteúdo específico dentro dos itens da lista
            const listItems = screen.getAllByRole('listitem');
            
            expect(listItems[0]).toHaveTextContent('PC Gamer');
            expect(listItems[0]).toHaveTextContent('CPU');
            expect(listItems[0]).toHaveTextContent('2');
            
            expect(listItems[1]).toHaveTextContent('Notebook');
            expect(listItems[1]).toHaveTextContent('RAM');
            expect(listItems[1]).toHaveTextContent('4');
        });

        it("exibe botões Edit e Delete para cada associação", async () => {
            mockedAxios.get.mockImplementation((url) => {
            if (url.includes("product-materials")) {
                return Promise.resolve({ data: mockAssociations });
            }
            if (url.includes("products")) {
                return Promise.resolve({ data: mockProducts });
            }
            if (url.includes("raw-materials")) {
                return Promise.resolve({ data: mockRawMaterials });
            }
            return Promise.resolve({ data: [] });
            });

            render(<ProductRawMaterials />);

            await waitFor(() => {
            // Verificar que os botões existem dentro dos itens da lista
            const listItems = screen.getAllByRole('listitem');
            expect(listItems).toHaveLength(1);
            
            const editButton = within(listItems[0]).getByRole('button', { name: /edit/i });
            const deleteButton = within(listItems[0]).getByRole('button', { name: /delete/i });
            
            expect(editButton).toBeInTheDocument();
            expect(deleteButton).toBeInTheDocument();
            });
        });

        it("exibe mensagem quando não há associações", async () => {
            mockedAxios.get.mockImplementation((url) => {
                if (url.includes("product-materials")) {
                return Promise.resolve({ data: [] }); // Sem associações
                }
                if (url.includes("products")) {
                return Promise.resolve({ data: mockProducts });
                }
                if (url.includes("raw-materials")) {
                return Promise.resolve({ data: mockRawMaterials });
                }
                return Promise.resolve({ data: [] });
            });

            render(<ProductRawMaterials />);

            await waitFor(() => {
                // Verificar que não há itens de associação (com botões)
                const associationItems = screen.queryAllByRole('listitem').filter(
                item => !item.textContent?.includes('No associations found')
                );
                expect(associationItems).toHaveLength(0);
                
                // Verificar que a mensagem aparece
                expect(screen.getByText(/No associations found/i)).toBeInTheDocument();
            });
        });
    });

  describe("Criar Nova Associação", () => {
    it("adiciona nova associação ao submeter formulário", async () => {
      const user = userEvent.setup();

      mockedAxios.get.mockImplementation((url) => {
        if (url.includes("products")) return Promise.resolve({ data: mockProducts });
        if (url.includes("raw-materials")) return Promise.resolve({ data: mockRawMaterials });
        return Promise.resolve({ data: [] });
      });

      render(<ProductRawMaterials />);

      await waitFor(() => {
        const productSelect = getProductSelect();
        const options = within(productSelect).getAllByRole("option");
        expect(options.length).toBeGreaterThan(1);
      });

      const productSelect = getProductSelect();
      const materialSelect = getMaterialSelect();
      const quantityInput = screen.getByPlaceholderText("Quantity Required (ex: 5)");
      const submitButton = screen.getByRole("button", { name: /add/i });

      await user.selectOptions(productSelect, "1");
      await user.selectOptions(materialSelect, "1");
      await user.type(quantityInput, "5");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledTimes(1);
        expect(mockedAxios.post).toHaveBeenCalledWith(
          "http://localhost:8080/product-materials",
          {
            productId: 1,
            rawMaterialId: 1,
            quantityRequired: 5,
          }
        );
      });
    });

    it("reseta formulário após criar associação com sucesso", async () => {
      const user = userEvent.setup();

      mockedAxios.get.mockImplementation((url) => {
        if (url.includes("products")) return Promise.resolve({ data: mockProducts });
        if (url.includes("raw-materials")) return Promise.resolve({ data: mockRawMaterials });
        return Promise.resolve({ data: [] });
      });

      mockedAxios.post.mockResolvedValue({ data: mockAssociations[0] });

      render(<ProductRawMaterials />);

      await waitFor(() => {
        const productSelect = getProductSelect();
        const options = within(productSelect).getAllByRole("option");
        expect(options.length).toBeGreaterThan(1);
      });

      const productSelect = getProductSelect();
      const materialSelect = getMaterialSelect();
      const quantityInput = screen.getByPlaceholderText("Quantity Required (ex: 5)");
      const submitButton = screen.getByRole("button", { name: /add/i });

      await user.selectOptions(productSelect, "1");
      await user.selectOptions(materialSelect, "1");
      await user.type(quantityInput, "5");
      await user.click(submitButton);

      await waitFor(() => {
        expect(getProductSelect()).toHaveValue("");
        expect(getMaterialSelect()).toHaveValue("");
        expect(quantityInput).toHaveValue(null);
      });
    });

    it("não submete quando quantidade é 0 ou negativa", async () => {
      const user = userEvent.setup();

      mockedAxios.get.mockImplementation((url) => {
        if (url.includes("products")) return Promise.resolve({ data: mockProducts });
        if (url.includes("raw-materials")) return Promise.resolve({ data: mockRawMaterials });
        return Promise.resolve({ data: [] });
      });

      render(<ProductRawMaterials />);

      await waitFor(() => {
        const productSelect = getProductSelect();
        const options = within(productSelect).getAllByRole("option");
        expect(options.length).toBeGreaterThan(1);
      });

      const productSelect = getProductSelect();
      const materialSelect = getMaterialSelect();
      const quantityInput = screen.getByPlaceholderText("Quantity Required (ex: 5)");
      const submitButton = screen.getByRole("button", { name: /add/i });

      await user.selectOptions(productSelect, "1");
      await user.selectOptions(materialSelect, "1");
      await user.clear(quantityInput);
      await user.type(quantityInput, "0");
      await user.click(submitButton);

      expect(mockedAxios.post).not.toHaveBeenCalled();
    });
  });

  describe("Editar Associação", () => {
    it("preenche formulário ao clicar em Edit", async () => {
      const user = userEvent.setup();

      mockedAxios.get.mockImplementation((url) => {
        if (url.includes("products")) return Promise.resolve({ data: mockProducts });
        if (url.includes("raw-materials")) return Promise.resolve({ data: mockRawMaterials });
        if (url.includes("product-materials")) {
          return Promise.resolve({ data: mockAssociations });
        }
        return Promise.resolve({ data: [] });
      });

      render(<ProductRawMaterials />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
      });

      const editButton = screen.getByRole("button", { name: /edit/i });
      await user.click(editButton);

      const productSelect = getProductSelect();
      const materialSelect = getMaterialSelect();
      const quantityInput = screen.getByPlaceholderText("Quantity Required (ex: 5)");

      expect(productSelect).toHaveValue("1");
      expect(materialSelect).toHaveValue("1");
      expect(quantityInput).toHaveValue(2);
    });

    it("altera botão de Add para Update ao editar", async () => {
      const user = userEvent.setup();

      mockedAxios.get.mockImplementation((url) => {
        if (url.includes("products")) return Promise.resolve({ data: mockProducts });
        if (url.includes("raw-materials")) return Promise.resolve({ data: mockRawMaterials });
        if (url.includes("product-materials")) {
          return Promise.resolve({ data: mockAssociations });
        }
        return Promise.resolve({ data: [] });
      });

      render(<ProductRawMaterials />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
      });

      const editButton = screen.getByRole("button", { name: /edit/i });
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /update/i })).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /^add$/i })).not.toBeInTheDocument();
      });
    });

    it("faz PUT ao submeter edição", async () => {
      const user = userEvent.setup();

      mockedAxios.get.mockImplementation((url) => {
        if (url.includes("products")) return Promise.resolve({ data: mockProducts });
        if (url.includes("raw-materials")) return Promise.resolve({ data: mockRawMaterials });
        if (url.includes("product-materials")) {
          return Promise.resolve({ data: mockAssociations });
        }
        return Promise.resolve({ data: [] });
      });

      render(<ProductRawMaterials />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
      });

      const editButton = screen.getByRole("button", { name: /edit/i });
      await user.click(editButton);

      const quantityInput = screen.getByPlaceholderText("Quantity Required (ex: 5)");
      await user.clear(quantityInput);
      await user.type(quantityInput, "10");

      const updateButton = screen.getByRole("button", { name: /update/i });
      await user.click(updateButton);

      await waitFor(() => {
        expect(mockedAxios.put).toHaveBeenCalledTimes(1);
        expect(mockedAxios.put).toHaveBeenCalledWith(
          "http://localhost:8080/product-materials/1",
          {
            productId: 1,
            rawMaterialId: 1,
            quantityRequired: 10,
          }
        );
      });
    });

    it("cancela edição ao clicar em Cancel", async () => {
      const user = userEvent.setup();

      mockedAxios.get.mockImplementation((url) => {
        if (url.includes("products")) return Promise.resolve({ data: mockProducts });
        if (url.includes("raw-materials")) return Promise.resolve({ data: mockRawMaterials });
        if (url.includes("product-materials")) {
          return Promise.resolve({ data: mockAssociations });
        }
        return Promise.resolve({ data: [] });
      });

      render(<ProductRawMaterials />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
      });

      const editButton = screen.getByRole("button", { name: /edit/i });
      await user.click(editButton);

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      await user.click(cancelButton);

      await waitFor(() => {
        const productSelect = getProductSelect();
        const materialSelect = getMaterialSelect();
        const quantityInput = screen.getByPlaceholderText("Quantity Required (ex: 5)");

        expect(productSelect).toHaveValue("");
        expect(materialSelect).toHaveValue("");
        expect(quantityInput).toHaveValue(null);
      });

      expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /cancel/i })).not.toBeInTheDocument();
    });
  });

  describe("Deletar Associação", () => {
    it("faz DELETE ao clicar em Delete e confirmar", async () => {
      const user = userEvent.setup();
      mockConfirm.mockReturnValueOnce(true); // Confirmar a deleção

      mockedAxios.get.mockImplementation((url) => {
        if (url.includes("products")) return Promise.resolve({ data: mockProducts });
        if (url.includes("raw-materials")) return Promise.resolve({ data: mockRawMaterials });
        if (url.includes("product-materials")) {
          return Promise.resolve({ data: mockAssociations });
        }
        return Promise.resolve({ data: [] });
      });

      render(<ProductRawMaterials />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole("button", { name: /delete/i });
      await user.click(deleteButton);

      expect(mockConfirm).toHaveBeenCalledWith("Are you sure you want to delete this association?");

      await waitFor(() => {
        expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
        expect(mockedAxios.delete).toHaveBeenCalledWith(
          "http://localhost:8080/product-materials/1"
        );
      });
    });

    it("não faz DELETE quando usuário cancela a confirmação", async () => {
      const user = userEvent.setup();
      mockConfirm.mockReturnValueOnce(false); // Cancelar a deleção

      mockedAxios.get.mockImplementation((url) => {
        if (url.includes("products")) return Promise.resolve({ data: mockProducts });
        if (url.includes("raw-materials")) return Promise.resolve({ data: mockRawMaterials });
        if (url.includes("product-materials")) {
          return Promise.resolve({ data: mockAssociations });
        }
        return Promise.resolve({ data: [] });
      });

      render(<ProductRawMaterials />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole("button", { name: /delete/i });
      await user.click(deleteButton);

      expect(mockConfirm).toHaveBeenCalledWith("Are you sure you want to delete this association?");
      expect(mockedAxios.delete).not.toHaveBeenCalled();
    });
  });

  describe("Tratamento de Erros", () => {
    it("lida com erro ao carregar produtos", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      mockedAxios.get.mockImplementation((url) => {
        if (url.includes("products")) {
          return Promise.reject(new Error("Failed to load products"));
        }
        return Promise.resolve({ data: [] });
      });

      render(<ProductRawMaterials />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });

    it("exibe erro ao criar associação com falha", async () => {
      const user = userEvent.setup();
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      mockedAxios.get.mockImplementation((url) => {
        if (url.includes("products")) return Promise.resolve({ data: mockProducts });
        if (url.includes("raw-materials")) return Promise.resolve({ data: mockRawMaterials });
        return Promise.resolve({ data: [] });
      });

      mockedAxios.post.mockRejectedValue(new Error("Failed to create"));

      render(<ProductRawMaterials />);

      await waitFor(() => {
        const productSelect = getProductSelect();
        const options = within(productSelect).getAllByRole("option");
        expect(options.length).toBeGreaterThan(1);
      });

      const productSelect = getProductSelect();
      const materialSelect = getMaterialSelect();
      const quantityInput = screen.getByPlaceholderText("Quantity Required (ex: 5)");
      const submitButton = screen.getByRole("button", { name: /add/i });

      await user.selectOptions(productSelect, "1");
      await user.selectOptions(materialSelect, "1");
      await user.type(quantityInput, "5");
      await user.click(submitButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });
  });

  describe("Campos do Formulário", () => {
    it("campos de select são obrigatórios", async () => {
      render(<ProductRawMaterials />);

      await waitFor(() => {
        const productSelect = getProductSelect();
        const materialSelect = getMaterialSelect();

        expect(productSelect).toBeRequired();
        expect(materialSelect).toBeRequired();
      });
    });

    it("campo de quantidade é obrigatório e tem mínimo de 1", async () => {
      render(<ProductRawMaterials />);

      await waitFor(() => {
        const quantityInput = screen.getByPlaceholderText("Quantity Required (ex: 5)");

        expect(quantityInput).toBeRequired();
        expect(quantityInput).toHaveAttribute("min", "1");
        expect(quantityInput).toHaveAttribute("type", "number");
      });
    });
  });
});