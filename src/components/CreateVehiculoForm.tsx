import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Loader2 } from "lucide-react";
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
import { vehiculoSchema, type VehiculoFormValues } from "@/lib/validations/vehiculo";

interface CreateVehiculoFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateVehiculoForm({ onSuccess, onCancel }: CreateVehiculoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<VehiculoFormValues>({
    resolver: zodResolver(vehiculoSchema),
    defaultValues: {
      patente: "",
      modelo: "",
    },
  });

  async function onSubmit(data: VehiculoFormValues) {
    try {
      setIsSubmitting(true);
      await maestrosService.createVehiculo(data);
      toast.success("Vehículo creado exitosamente");
      onSuccess();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Error al crear el vehículo";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="patente"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Patente</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ej: ABC123" 
                  {...field}
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="modelo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Modelo</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Ford F-100" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
              "Crear Vehículo"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
