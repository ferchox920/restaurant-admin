import { act, fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { CloseTableOrderDialog } from "./close-table-order-dialog";

it("keeps confirmation open on uncertain delivery and blocks repeated submit before rerender", async () => {
  let reject!: (error: Error) => void;
  const onClose = vi.fn(
    () =>
      new Promise<void>((_, rejectTask) => {
        reject = rejectTask;
      })
  );
  render(
    <CloseTableOrderDialog itemsCount={1} paymentBanks={[]} onClose={onClose} />
  );
  fireEvent.click(screen.getByRole("button", { name: "Cerrar orden" }));
  const dialog = await screen.findByRole("dialog");
  const form = dialog.querySelector("form")!;
  await act(async () => {
    fireEvent.submit(form);
    fireEvent.submit(form);
  });
  expect(onClose).toHaveBeenCalledOnce();
  await act(async () => reject(new TypeError("lost response")));
  expect(screen.getByRole("dialog")).toBeVisible();
  expect(
    screen.getAllByRole("button", { name: "Cerrar orden" }).at(-1)
  ).toBeEnabled();
});
