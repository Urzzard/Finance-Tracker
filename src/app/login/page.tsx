import { login, signup } from './actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function LoginPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
          <CardDescription>
            Ingresa tu correo para acceder a tu Finance Tracker.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" name="email" placeholder="m@ejemplo.com" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" name="password" required />
            </div>
            
            {/* Usamos formAction para que funcione con Server Actions (lo veremos luego) */}
            <div className="flex flex-col gap-2">
                {/* Botón Principal: Login */}
                <Button formAction={login} className="w-full">
                  Iniciar Sesión
                </Button>
                
                {/* Botón Secundario: Registrarse */}
                <Button formAction={signup} variant="outline" className="w-full">
                  Registrarse
                </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}