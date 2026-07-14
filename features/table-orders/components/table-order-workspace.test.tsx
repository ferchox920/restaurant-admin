import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TableOrderWorkspace } from "@/features/table-orders/components/table-order-workspace";
import type { PaymentBank } from "@/features/payment-banks/types/payment-bank.types";
import type { SaleProductOption } from "@/features/sales/types/sale-ticket.types";
import type { TableOrder } from "@/features/table-orders/types/table-order.types";

vi.mock("@/features/table-orders/components/close-table-order-dialog", () => ({
  CloseTableOrderDialog: () => <div>Cerrar orden</div>,
}));

vi.mock("@/features/table-orders/components/cancel-table-order-dialog", () => ({
  CancelTableOrderDialog: () => <div>Cancelar orden</div>,
}));

const products: SaleProductOption[] = [
  {
    id: "product-coffee",
    name: "Cafe doble",
    sku: "CAF-01",
    description: "Cafe espresso",
    categoryId: "category-drinks",
    categoryName: "Bebidas",
    unit: "UNIT",
    stockManagementType: "FINISHED_PRODUCT",
    active: true,
  },
  {
    id: "product-cake",
    name: "Torta de chocolate",
    sku: "TOR-01",
    description: "Porcion individual",
    categoryId: "category-desserts",
    categoryName: "Postres",
    unit: "PORTION",
    stockManagementType: "NON_STOCKED",
    active: true,
  },
];

const paymentBanks: PaymentBank[] = [];

function buildOrder(quantity = "2"): TableOrder {
  return {
    id: "order-1",
    restaurantTableId: "table-1",
    tableCode: "M01",
    tableName: "Mesa 1",
    tableArea: "Local",
    saleTicketId: "ticket-1",
    status: "OPEN",
    openedById: "user-1",
    cancelledById: null,
    closedById: null,
    notes: null,
    cancelReason: null,
    openedAt: "2026-07-10T12:00:00.000Z",
    cancelledAt: null,
    closedAt: null,
    createdAt: "2026-07-10T12:00:00.000Z",
    updatedAt: "2026-07-10T12:00:00.000Z",
    saleTicket: {
      id: "ticket-1",
      status: "DRAFT",
      salesChannelId: "channel-1",
      subtotal: "1200",
      total: "1200",
      items: [
        {
          id: "item-coffee",
          ticketId: "ticket-1",
          productId: "product-coffee",
          productNameSnapshot: "Cafe doble",
          productSkuSnapshot: "CAF-01",
          productUnitSnapshot: "UNIT",
          quantity,
          unitPriceSnapshot: "600",
          unitCostSnapshot: "250",
          subtotal: String(600 * Number(quantity)),
        },
      ],
    },
  };
}

function renderWorkspace(order = buildOrder()) {
  const handlers = {
    onAddItem: vi.fn(),
    onUpdateItem: vi.fn(),
    onRemoveItem: vi.fn(),
    onCancel: vi.fn(),
    onClose: vi.fn(),
  };

  render(
    <TableOrderWorkspace
      order={order}
      products={products}
      isProductsLoading={false}
      isAddingItem={false}
      isUpdatingItem={false}
      isRemovingItem={false}
      paymentBanks={paymentBanks}
      isPaymentBanksLoading={false}
      isCancelPending={false}
      isClosePending={false}
      {...handlers}
    />
  );

  return handlers;
}

afterEach(() => {
  cleanup();
});

describe("TableOrderWorkspace", () => {
  it("filters the product grid by category and search", () => {
    renderWorkspace();
    const catalog = screen.getByRole("region", {
      name: "Catálogo de productos",
    });

    fireEvent.click(screen.getByRole("button", { name: "Postres" }));

    expect(within(catalog).getByText("Torta de chocolate")).toBeInTheDocument();
    expect(within(catalog).queryByText("Cafe doble")).not.toBeInTheDocument();

    fireEvent.change(within(catalog).getByLabelText("Buscar productos"), {
      target: { value: "sin coincidencias" },
    });

    expect(screen.getByText("Sin resultados")).toBeInTheDocument();
  });

  it("adds a new product and increases an existing item", async () => {
    const handlers = renderWorkspace();
    const catalog = screen.getByRole("region", {
      name: "Catálogo de productos",
    });
    const cakeCardButton = within(catalog)
      .getByText("Torta de chocolate")
      .closest("button");

    expect(cakeCardButton).not.toBeNull();
    fireEvent.click(cakeCardButton!);
    fireEvent.click(
      within(catalog).getByRole("button", { name: "Sumar Cafe doble" }),
    );

    await waitFor(() => {
      expect(handlers.onAddItem).toHaveBeenCalledWith({
        productId: "product-cake",
        quantity: "1",
      });
      expect(handlers.onUpdateItem).toHaveBeenCalledWith("item-coffee", {
        quantity: "3",
      });
    });
  });

  it("decreases the existing item and removes it when it reaches zero", async () => {
    const updateHandlers = renderWorkspace(buildOrder("2"));
    const catalog = screen.getByRole("region", {
      name: "Catálogo de productos",
    });

    fireEvent.click(
      within(catalog).getByRole("button", { name: "Restar Cafe doble" }),
    );

    await waitFor(() => {
      expect(updateHandlers.onUpdateItem).toHaveBeenCalledWith("item-coffee", {
        quantity: "1",
      });
    });

    cleanup();
    const removeHandlers = renderWorkspace(buildOrder("1"));
    const nextCatalog = screen.getByRole("region", {
      name: "Catálogo de productos",
    });

    fireEvent.click(
      within(nextCatalog).getByRole("button", { name: "Restar Cafe doble" }),
    );

    await waitFor(() => {
      expect(removeHandlers.onRemoveItem).toHaveBeenCalledWith("item-coffee");
    });
  });

  it("switches from the catalog to the order panel", () => {
    renderWorkspace();

    const catalogToggle = screen.getByRole("button", {
      name: /seleccionar productos/i,
    });
    const orderToggle = screen.getByRole("button", {
      name: /consumos de la mesa/i,
    });

    fireEvent.click(orderToggle);

    expect(screen.getAllByText("Subtotal")).toHaveLength(2);
    expect(screen.getByText("Cerrar orden")).toBeInTheDocument();
    expect(catalogToggle).toHaveAttribute("aria-expanded", "false");
    expect(orderToggle).toHaveAttribute("aria-expanded", "true");
  });
});
