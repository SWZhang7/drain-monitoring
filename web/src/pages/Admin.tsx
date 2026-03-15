import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useQuery } from "@tanstack/react-query"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Eye, EyeOff, Loader2, Flag, Moon, Sun } from "lucide-react"
import { Map, MapControls, useMap } from "@/components/ui/map"
import { DrainMarker } from "@/components/DrainMarker"
import { signIn, completeNewPassword } from "@/lib/auth"
import { useAuth } from "@/lib/authContext"
import { fetchAdminDrains, type DrainPrivate } from "@/lib/api"
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

const JAMAICA = { center: [-77.3, 18.15] as [number, number], zoom: 8.6 }

function CenterJamaica() {
  const { map } = useMap()
  return (
    <button
      onClick={() => map?.flyTo({ center: JAMAICA.center, zoom: JAMAICA.zoom, duration: 1000 })}
      aria-label="Center on Jamaica"
      className="absolute top-2 left-2 z-10 flex items-center justify-center size-8 rounded-md border border-white/20 bg-[#1a1a1a] text-white shadow-sm hover:bg-accent hover:text-text hover:border-transparent transition-colors"
    >
      <Flag className="size-4" />
    </button>
  )
}

function MapLoader() {
  const { isLoaded } = useMap()
  if (isLoaded) return null
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
      <Loader2 className="size-6 animate-spin text-text/60" />
    </div>
  )
}

function AdminDashboard() {
  const { token } = useAuth()
  const [theme, setTheme] = useState<"light" | "dark">("dark")
  const [selectedDrain, setSelectedDrain] = useState<DrainPrivate | null>(null)

  const { data: drains = [] } = useQuery({
    queryKey: ["admin-drains"],
    queryFn: () => fetchAdminDrains(token!),
    enabled: !!token,
  })

  return (
    <div className="w-full p-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-5xl font-bold tracking-tighter">Admin</h1>
          <p className="text-text/60 mt-1">Manage drains and monitor activity.</p>
        </div>
        <Button
          size="icon"
          variant="outline"
          className="rounded-full hover:cursor-pointer"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle map theme"
        >
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>
      </div>

      <Card className="relative w-full h-[600px] p-0 overflow-hidden">
        <Map theme={theme} center={JAMAICA.center} zoom={JAMAICA.zoom}>
          <MapLoader />
          <CenterJamaica />
          {drains.map((drain) => (
            <DrainMarker
              key={drain.D_Id}
              id={drain.D_Id}
              name={drain.publicName}
              latitude={drain.latitude}
              longitude={drain.longitude}
              onClick={() => setSelectedDrain(drain)}
            />
          ))}
          <MapControls showCompass />
        </Map>

        {/* Slide-in sidebar overlay */}
        <div
          className={`absolute top-0 right-0 h-full w-72 bg-background/95 backdrop-blur-sm border-l border-border shadow-xl flex flex-col p-5 overflow-y-auto transition-transform duration-300 ease-in-out z-20 ${
            selectedDrain ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {selectedDrain && (
            <>
              <div className="flex items-start justify-between mb-1">
                <h2 className="text-base font-bold leading-tight">{selectedDrain.publicName}</h2>
                <button
                  onClick={() => setSelectedDrain(null)}
                  className="text-text/40 hover:text-text transition-colors ml-2 shrink-0 text-lg leading-none"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              <p className="text-xs text-text/50 font-mono mb-4">{selectedDrain.privateName ?? "—"}</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <span className="text-text/60">Operator</span><span className="truncate">{selectedDrain.operatorEmail ?? "—"}</span>
                <span className="text-text/60">Height</span><span>{selectedDrain.height}cm</span>
                <span className="text-text/60">Sentiment</span><span>{selectedDrain.sentimentScore ?? "—"} / 10</span>
                <span className="text-text/60">Reports</span><span>{selectedDrain.reportCount}</span>
                <span className="text-text/60">Alerted</span><span>{selectedDrain.alreadyAlerted ? "Yes" : "No"}</span>
              </div>
            </>
          )}
        </div>
      </Card>
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
