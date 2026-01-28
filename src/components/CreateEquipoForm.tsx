import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { maestrosService } from "@/api/services/maestroService";
import { equipoSchema, type EquipoFormValues } from "@/lib/validations/equipo";
import type { Usuario } from "@/types/auth";

interface CreateEquipoFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateEquipoForm({ onSuccess, onCancel }: CreateEquipoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [supervisores, setSupervisores] = useState<Usuario[]>([]);
  const [loadingSupervisores, setLoadingSupervisores] = useState(true);

  const form = useForm<EquipoFormValues>({
    resolver: zodResolver(equipoSchema),
    defaultValues: {
      nombre: "",
      supervisorId: undefined,
    },
  });

  // Cargar supervisores disponibles
  useEffect(() => {
    const fetchSupervisores = async () => {
      try {
        const data = await maestrosService.getSupervisores();
        setSupervisores(data);
      } catch (error) {
        toast.error("Error al cargar los supervisores");
        console.error(error);
      } finally {
        setLoadingSupervisores(false);
      }
    };
    fetchSupervisores();
  }, []);

  async function onSubmit(data: EquipoFormValues) {
    try {
      setIsSubmitting(true);
      await maestrosService.createEquipo(data);
      toast.success("Equipo creado exitosamente");
      onSuccess();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Error al crear el equipo";
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
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Equipo</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Equipo Norte" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="supervisorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Supervisor a Cargo</FormLabel>
              <Select 
                onValueChange={(value) => field.onChange(parseInt(value))} 
                value={field.value?.toString()}
                disabled={loadingSupervisores}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingSupervisores ? "Cargando supervisores..." : "Selecciona un supervisor"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {supervisores.length === 0 ? (
                    <div className="p-2 text-sm text-slate-500">
                      No hay supervisores disponibles
                    </div>
                  ) : (
                    supervisores.map((supervisor) => (
                      <SelectItem key={supervisor.id} value={supervisor.id.toString()}>
                        {supervisor.nombre} {supervisor.apellido} - {supervisor.rol}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting || loadingSupervisores} className="min-w-30">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando
              </>
            ) : (
              "Crear Equipo"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
