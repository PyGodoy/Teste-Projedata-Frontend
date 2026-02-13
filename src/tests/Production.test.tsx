import { render, screen, waitFor } from "@testing-library/react";
import Production from "../components/Production";
import axios from "axios";
import { vi } from "vitest";

vi.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Production Component", () => {
  it("displays products and total value from API", async () => {
    const data = {
      products: [{ name: "PC Gamer", quantity: 2, price: 100 }],
      totalValue: 200,
    };

    mockedAxios.get.mockResolvedValue({ data });

    render(<Production />);

    await waitFor(() => {
      expect(screen.getByText(/PC Gamer/i)).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
      // Busca o valor formatado como aparece no DOM
      expect(screen.getByText(/100\.00/i)).toBeInTheDocument();
      expect(screen.getByText(/Total Value:/i)).toBeInTheDocument();
      expect(screen.getByText(/200\.00/i)).toBeInTheDocument();
    });
  });
});