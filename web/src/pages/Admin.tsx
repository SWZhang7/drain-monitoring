import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"
import { signIn, completeNewPassword } from "@/lib/auth"
import { useAuth } from "@/lib/authContext"
import type { CognitoUser } from "amazon-cognito-identity-js"

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
})

const newPasswordSchema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
})

type LoginData = z.infer<typeof loginSchema>
type NewPasswordData = z.infer<typeof newPasswordSchema>

function LoginWall() {
  const { refresh } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [pendingUser, setPendingUser] = useState<CognitoUser | null>(null)

  const loginForm = useForm<LoginData>({ resolver: zodResolver(loginSchema) })
  const newPasswordForm = useForm<NewPasswordData>({ resolver: zodResolver(newPasswordSchema) })

  const onLogin = async (data: LoginData) => {
    setError(null)
    try {
      const result = await signIn(data.email, data.password)
      if (result.type === "newPasswordRequired") {
        setPendingUser(result.user)
      } else {
        refresh()
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed")
    }
  }

  const onNewPassword = async (data: NewPasswordData) => {
    if (!pendingUser) return
    setError(null)
    try {
      await completeNewPassword(pendingUser, data.newPassword)
      refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to set password")
    }
  }

  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  if (pendingUser) {
    return (
      <div className="flex items-center justify-center mt-10 px-3 h-full">
        <div className="w-full max-w-sm flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter">Set a new password</h1>
            <p className="text-text/60 mt-1 text-sm">Your temporary password has expired. Please set a permanent one.</p>
          </div>
          <form onSubmit={newPasswordForm.handleSubmit(onNewPassword)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="newPassword">New password</Label>
              <div className="relative">
                <Input id="newPassword" type={showNewPassword ? "text" : "password"} placeholder="••••••••" {...newPasswordForm.register("newPassword")} />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(v => !v)}
                  className="absolute right-7 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-text transition-colors"
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {newPasswordForm.formState.errors.newPassword && (
                <p className="text-xs text-red-500">{newPasswordForm.formState.errors.newPassword.message}</p>
              )}
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <Button
              type="submit"
              disabled={newPasswordForm.formState.isSubmitting}
              className="rounded-full bg-text text-white hover:bg-alt-accent transition-colors cursor-pointer"
            >
              {newPasswordForm.formState.isSubmitting ? "Saving..." : "Set password"}
            </Button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center mt-10 px-3 h-full">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter">Admin</h1>
          <p className="text-text/60 mt-1 text-sm">Sign in to access the admin dashboard.</p>
        </div>
        <form onSubmit={loginForm.handleSubmit(onLogin)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" {...loginForm.register("email")} />
            {loginForm.formState.errors.email && <p className="text-xs text-red-500">{loginForm.formState.errors.email.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" {...loginForm.register("password")} />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-7 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-text transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {loginForm.formState.errors.password && <p className="text-xs text-red-500">{loginForm.formState.errors.password.message}</p>}
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <Button
            type="submit"
            disabled={loginForm.formState.isSubmitting}
            className="rounded-full bg-text text-white hover:bg-alt-accent transition-colors cursor-pointer"
          >
            {loginForm.formState.isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  )
}

function AdminDashboard() {
  return (
    <div className="w-full p-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-5xl font-bold tracking-tighter">Admin</h1>
          <p className="text-text/60 mt-1">Manage drains and monitor activity.</p>
        </div>
      </div>
      {/* Dashboard content goes here */}
      <p className="text-text/60 text-sm">Dashboard coming soon.</p>
    </div>
  )
}

export default function Admin() {
  return <AdminInner />
}

function AdminInner() {
  const { token } = useAuth()
  return token ? <AdminDashboard /> : <LoginWall />
}
