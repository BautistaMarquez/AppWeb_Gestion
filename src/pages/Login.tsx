import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { useAuth } from "@/hooks/useAuth"
import type { LoginRequestDTO } from "@/types/auth"

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"

// Esquema de validación con Zod
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El email es obligatorio")
    .email("Ingresa un email válido"),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onSubmit",
  })

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true)
    try {
      // Adaptamos el tipo local al DTO esperado por el backend
      const payload: LoginRequestDTO = {
        email: values.email,
        password: values.password,
      }
      await login(payload)
      // La navegación y los toasts los maneja el hook useAuth
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo / Identidad visual */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-100 text-xl font-bold shadow-md">
            BE
          </div>
          <p className="mt-3 text-sm text-slate-300 tracking-wide">
            Beverage ERP · Logística de Bebidas
          </p>
        </div>

        <Card className="border-slate-700 bg-slate-900/60 shadow-xl backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl text-slate-50">
              Iniciar sesión
            </CardTitle>
            <CardDescription className="text-slate-300">
              Accede al panel de control logístico con tus credenciales.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
                noValidate
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-100">
                        Email corporativo
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="usuario@empresa.com"
                          autoComplete="email"
                          disabled={isLoading}
                          className="bg-slate-900/80 border-slate-700 text-slate-50 placeholder:text-slate-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-100">
                        Contraseña
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          autoComplete="current-password"
                          disabled={isLoading}
                          className="bg-slate-900/80 border-slate-700 text-slate-50 placeholder:text-slate-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Iniciando sesión..." : "Entrar al sistema"}
                </Button>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="flex flex-col items-center gap-1 text-xs text-slate-500">
            <span>Beverage ERP · v2026</span>
            <span>Entorno seguro de gestión logística</span>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

