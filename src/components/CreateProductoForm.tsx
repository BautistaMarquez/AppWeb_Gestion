import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { maestrosService } from "@/api/services/maestroService";
import { productoSchema, type ProductoFormValues } from "@/lib/validations/producto";

interface CreateProductoFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateProductoForm({ onSuccess, onCancel }: CreateProductoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProductoFormValues>({
    resolver: zodResolver(productoSchema),
    defaultValues: {
      nombre: "",
      precios: [{ etiqueta: "", valor: undefined as any }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "precios",
  });

  async function onSubmit(data: ProductoFormValues) {
    try {
      setIsSubmitting(true);
      // Transformar valores numéricos a BigDecimal compatible
      const payload = {
        nombre: data.nombre,
        precios: data.precios.map(p => ({
          etiqueta: p.etiqueta,
          valor: p.valor,
        })),
      };
      await maestrosService.createProducto(payload);
      toast.success("Producto creado exitosamente");
      onSuccess();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Error al crear el producto";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Nombre del Producto */}
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Producto</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Camiseta Blanca Premium" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Precios Iniciales */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-base font-semibold text-slate-900">Precios Iniciales</label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ etiqueta: "", valor: undefined as any })}
              className="gap-2"
            >
              <Plus className="h-4 w-4" /> Agregar Precio
            </Button>
          </div>

          <div className="space-y-3 rounded-lg border border-slate-200 p-4 bg-slate-50">
            {fields.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay precios agregados
              </p>
            ) : (
              fields.map((field, index) => (
                <div key={field.id} className="flex gap-3 items-end">
                  <FormField
                    control={form.control}
                    name={`precios.${index}.etiqueta`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel className="text-xs">Etiqueta</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ej: Mayorista"
                            {...field}
                            className="h-9"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`precios.${index}.valor`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel className="text-xs">Valor ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            className="h-9"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    className="h-9 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting} className="min-w-30">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando
              </>
            ) : (
              "Crear Producto"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
