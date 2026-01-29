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
import { conductorSchema, type ConductorFormValues } from "@/lib/validations/conductor";
import type { Equipo } from "@/types/maestros";

interface CreateConductorFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateConductorForm({ onSuccess, onCancel }: CreateConductorFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loadingEquipos, setLoadingEquipos] = useState(true);

  const form = useForm<ConductorFormValues>({
    resolver: zodResolver(conductorSchema),
    defaultValues: {
      nombre: "",
      apellido: "",
      dni: "",
      licenciaVencimiento: "",
      equipoId: undefined,
    },
  });

  // Cargar equipos disponibles
  useEffect(() => {
    const fetchEquipos = async () => {
      try {
        const data = await maestrosService.getEquipos();
        setEquipos(data);
      } catch (error) {
        toast.error("Error al cargar los equipos");
        console.error(error);
      } finally {
        setLoadingEquipos(false);
      }
    };
    fetchEquipos();
  }, []);

  async function onSubmit(data: ConductorFormValues) {
    try {
      setIsSubmitting(true);
      await maestrosService.createConductor(data);
      toast.success("Conductor creado exitosamente");
      onSuccess();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Error al crear el conductor";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Carlos" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="apellido"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apellido</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Rodríguez" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="dni"
          render={({ field }) => (
            <FormItem>
              <FormLabel>DNI</FormLabel>
              <FormControl>
                <Input placeholder="12345678" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="licenciaVencimiento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha de Vencimiento de Licencia</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="equipoId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Equipo de Trabajo</FormLabel>
              <Select 
                onValueChange={(value) =>
                  field.onChange(value === "none" ? undefined : parseInt(value))
                }
                value={field.value?.toString() ?? "none"}
                disabled={loadingEquipos}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingEquipos ? "Cargando equipos..." : "Selecciona un equipo"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Sin equipo</SelectItem>
                  {equipos.map((equipo) => (
                    <SelectItem key={equipo.id} value={equipo.id.toString()}>
                      {equipo.nombre} - {equipo.supervisorNombreCompleto}
                    </SelectItem>
                  ))}
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
          <Button type="submit" disabled={isSubmitting} className="min-w-30">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando
              </>
            ) : (
              "Crear Conductor"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
