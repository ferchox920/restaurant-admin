import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/common/status-badge";
import { formatDateTime } from "@/lib/formatters";
import { CategoryActions } from "@/features/categories/components/category-actions";
import type { Category } from "@/features/categories/types/category.types";

type CategoryTableProps = {
  categories: Category[];
  canMutate: boolean;
  onEdit: (category: Category) => void;
  onDeactivate: (category: Category) => Promise<void> | void;
  onReactivate: (category: Category) => Promise<void> | void;
  pendingCategoryId?: string | null;
  pendingAction?: "deactivate" | "reactivate" | null;
};

export function CategoryTable({
  categories,
  canMutate,
  onEdit,
  onDeactivate,
  onReactivate,
  pendingCategoryId,
  pendingAction,
}: CategoryTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Descripcion</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Actualizado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {categories.map((category) => (
          <TableRow
            key={category.id}
            className={!category.active ? "bg-muted/30 text-muted-foreground" : ""}
          >
            <TableCell className="font-medium text-foreground">
              {category.name}
            </TableCell>
            <TableCell className="max-w-md whitespace-normal">
              {category.description || "Sin descripcion"}
            </TableCell>
            <TableCell>
              <StatusBadge status={category.active ? "active" : "inactive"} />
            </TableCell>
            <TableCell>{formatDateTime(category.updatedAt)}</TableCell>
            <TableCell>
              <CategoryActions
                category={category}
                canMutate={canMutate}
                onEdit={onEdit}
                onDeactivate={onDeactivate}
                onReactivate={onReactivate}
                isDeactivatePending={
                  pendingCategoryId === category.id &&
                  pendingAction === "deactivate"
                }
                isReactivatePending={
                  pendingCategoryId === category.id &&
                  pendingAction === "reactivate"
                }
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
