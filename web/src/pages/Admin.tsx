import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Eye, EyeOff, Loader2, Flag, Moon, Sun, X, Pencil, Trash2, Plus } from "lucide-react"
import { Map, MapControls, useMap } from "@/components/ui/map"
import { DrainMarker } from "@/components/DrainMarker"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { signIn, completeNewPassword } from "@/lib/auth"
import { useAuth } from "@/lib/authContext"
import {
  fetchAdminDrains, fetchDrainMessages, resetDrainSentiment, assignOperatorToDrain,
  fetchOperators, createOperator, updateOperator, deleteOperator,
  type DrainPrivate, type DrainMessage, type Operator,
} from "@/lib/api"
import { toast } from "sonner"
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

const CO2_MAX = 5000 // ppm — OSHA dangerous threshold

function SensorGauge({ label, value, max, unit, thresholds }: {
  label: string
  value: number | null
  max: number
  unit: string
  thresholds: { warn: number; danger: number }
}) {
  const pct = value != null ? Math.min(100, (value / max) * 100) : null
  const color = pct == null ? "bg-muted" :
    pct >= thresholds.danger ? "bg-red-500" :
    pct >= thresholds.warn ? "bg-amber-400" :
    "bg-green-500"

  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-text/50">{label}</span>
        <span className="font-mono">{value != null ? `${value}${unit}` : "—"}</span>
      </div>
      <div className="h-4 w-full rounded-full bg-muted overflow-hidden">
        {pct != null && <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />}
      </div>
    </div>
  )
}

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

const operatorSchema = z.object({
  email: z.string().email("Valid email required"),
  name: z.string().min(1, "Required"),
  description: z.string().min(1, "Required"),
})
type OperatorForm = z.infer<typeof operatorSchema>

function OperatorsTab() {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  const [editTarget, setEditTarget] = useState<Operator | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Operator | null>(null)

  const { data: operators = [], isLoading } = useQuery({
    queryKey: ["operators"],
    queryFn: () => fetchOperators(token!),
    enabled: !!token,
  })

  const createForm = useForm<OperatorForm>({ resolver: zodResolver(operatorSchema) })
  const editForm = useForm<Omit<OperatorForm, "email">>({
    resolver: zodResolver(operatorSchema.omit({ email: true })),
  })

  const createMutation = useMutation({
    mutationFn: (data: OperatorForm) => createOperator(token!, data),
    onSuccess: () => {
      toast.success("Operator created")
      setShowCreate(false)
      createForm.reset()
      queryClient.invalidateQueries({ queryKey: ["operators"] })
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to create operator"),
  })

  const updateMutation = useMutation({
    mutationFn: (data: Omit<OperatorForm, "email">) => updateOperator(token!, editTarget!.attributes.email!, data),
    onSuccess: () => {
      toast.success("Operator updated")
      setEditTarget(null)
      queryClient.invalidateQueries({ queryKey: ["operators"] })
    },
    onError: () => toast.error("Failed to update operator"),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteOperator(token!, deleteTarget!.attributes.email!),
    onSuccess: () => {
      toast.success("Operator deleted")
      setDeleteTarget(null)
      queryClient.invalidateQueries({ queryKey: ["operators"] })
    },
    onError: () => toast.error("Failed to delete operator"),
  })

  const openEdit = (op: Operator) => {
    editForm.reset({
      name: op.attributes.name ?? "",
      description: op.attributes["custom:description"] ?? "",
    })
    setEditTarget(op)
  }

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="size-5 animate-spin text-text/40" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-text/60 text-sm">{operators.length} operator{operators.length !== 1 ? "s" : ""}</p>
        <Button size="sm" className="bg-text text-white hover:bg-alt-accent cursor-pointer gap-1.5" onClick={() => setShowCreate(true)}>
          <Plus className="size-3.5" /> Add operator
        </Button>
      </div>

      {/* Table header */}
      {operators.length > 0 && (
        <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 px-4 pb-2 text-xs text-text/40 font-medium uppercase tracking-wide">
          <span>Name</span>
          <span>Email</span>
          <span>Description</span>
          <span />
        </div>
      )}

      <div className="flex flex-col gap-1">
        {operators.map((op) => (
          <Card key={op.username} className="px-4 py-3 grid grid-cols-[1fr_1fr_1fr_auto] gap-5 items-center">
            <p className="text-sm font-medium truncate">{op.attributes.name ?? "—"}</p>
            <p className="text-sm text-text/60 truncate">{op.attributes.email}</p>
            <p className="text-sm text-text/60 truncate">{op.attributes["custom:description"] ?? "—"}</p>
            <div className="flex gap-2">
                <button onClick={() => openEdit(op)} className="text-text/40 hover:text-text transition-colors cursor-pointer" aria-label="Edit"><Pencil className="size-4" /></button>
                <button onClick={() => setDeleteTarget(op)} className="text-text/40 hover:text-red-500 transition-colors cursor-pointer" aria-label="Delete"><Trash2 className="size-4" /></button>
              </div>
          </Card>
        ))}
        {operators.length === 0 && <p className="text-sm text-text/40 text-center py-10">No operators yet.</p>}
      </div>

      {/* Create dialog */}
      <Dialog open={showCreate} onOpenChange={(o) => { setShowCreate(o); if (!o) createForm.reset() }}>
        <DialogContent className="max-w-sm [&>button]:cursor-pointer [&>button]:hover:text-red-500">
          <DialogHeader><DialogTitle>Add operator</DialogTitle></DialogHeader>
          <form onSubmit={createForm.handleSubmit((d) => createMutation.mutate(d))} className="flex flex-col gap-3 mt-2">
            <div className="flex flex-col gap-1.5">
              <Label>Name</Label>
              <Input placeholder="Jane Doe" {...createForm.register("name")} />
              {createForm.formState.errors.name && <p className="text-xs text-red-500">{createForm.formState.errors.name.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Email</Label>
              <Input placeholder="operator@example.com" {...createForm.register("email")} />
              {createForm.formState.errors.email && <p className="text-xs text-red-500">{createForm.formState.errors.email.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Description</Label>
              <Input placeholder="e.g. Kingston North district operator" {...createForm.register("description")} />
              {createForm.formState.errors.description && <p className="text-xs text-red-500">{createForm.formState.errors.description.message}</p>}
            </div>
            <div className="flex gap-2 justify-end mt-1">
              <Button type="button" variant="outline" size="sm" className="cursor-pointer" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button type="submit" size="sm" className="bg-text text-white hover:bg-alt-accent cursor-pointer" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editTarget} onOpenChange={(o) => { if (!o) setEditTarget(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Edit operator</DialogTitle></DialogHeader>
          <form onSubmit={editForm.handleSubmit((d) => updateMutation.mutate(d))} className="flex flex-col gap-3 mt-2">
            <div className="flex flex-col gap-1.5">
              <Label>Name</Label>
              <Input {...editForm.register("name")} />
              {editForm.formState.errors.name && <p className="text-xs text-red-500">{editForm.formState.errors.name.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Description</Label>
              <Input {...editForm.register("description")} />
              {editForm.formState.errors.description && <p className="text-xs text-red-500">{editForm.formState.errors.description.message}</p>}
            </div>
            <div className="flex gap-2 justify-end mt-1">
              <Button type="button" variant="outline" size="sm" className="cursor-pointer" onClick={() => setEditTarget(null)}>Cancel</Button>
              <Button type="submit" size="sm" className="bg-text text-white hover:bg-alt-accent cursor-pointer" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete operator?</DialogTitle></DialogHeader>
          <p className="text-sm text-text/60">This will permanently remove <span className="font-semibold text-text">{deleteTarget?.attributes.email}</span> from the system.</p>
          <div className="flex gap-2 justify-end mt-2">
            <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button size="sm" className="bg-red-600 text-white hover:bg-red-700 cursor-pointer" disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate()}>
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function AdminDashboard() {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  const [theme, setTheme] = useState<"light" | "dark">("dark")
  const [selectedDrain, setSelectedDrain] = useState<DrainPrivate | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)

  const { data: drains = [] } = useQuery({
    queryKey: ["admin-drains"],
    queryFn: () => fetchAdminDrains(token!),
    enabled: !!token,
  })

  const { data: messages = [] } = useQuery<DrainMessage[]>({
    queryKey: ["drain-messages", selectedDrain?.D_Id],
    queryFn: () => fetchDrainMessages(token!, selectedDrain!.D_Id),
    enabled: !!token && !!selectedDrain,
  })

  const resetMutation = useMutation({
    mutationFn: () => resetDrainSentiment(token!, selectedDrain!.D_Id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["admin-drains"] })
      const previous = queryClient.getQueryData<DrainPrivate[]>(["admin-drains"])
      queryClient.setQueryData<DrainPrivate[]>(["admin-drains"], (old) =>
        old?.map((d) => d.D_Id === selectedDrain!.D_Id ? { ...d, sentimentScore: 10 } : d)
      )
      // Keep selectedDrain in sync too
      setSelectedDrain((prev) => prev ? { ...prev, sentimentScore: 10 } : prev)
      return { previous }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["admin-drains"], ctx.previous)
      toast.error("Failed to reset sentiment")
    },
    onSuccess: () => {
      toast.success("Sentiment reset to 10")
      setConfirmReset(false)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["admin-drains"] }),
  })

  const assignMutation = useMutation({
    mutationFn: (operatorEmail: string | null) => assignOperatorToDrain(token!, selectedDrain!.D_Id, operatorEmail),
    onMutate: async (operatorEmail) => {
      await queryClient.cancelQueries({ queryKey: ["admin-drains"] })
      const previous = queryClient.getQueryData<DrainPrivate[]>(["admin-drains"])
      queryClient.setQueryData<DrainPrivate[]>(["admin-drains"], (old) =>
        old?.map((d) => d.D_Id === selectedDrain!.D_Id ? { ...d, operatorEmail } : d)
      )
      setSelectedDrain((prev) => prev ? { ...prev, operatorEmail } : prev)
      return { previous }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["admin-drains"], ctx.previous)
      toast.error("Failed to assign operator")
    },
    onSuccess: () => toast.success("Operator assigned"),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["admin-drains"] }),
  })

  const { data: operators = [] } = useQuery({
    queryKey: ["operators"],
    queryFn: () => fetchOperators(token!),
    enabled: !!token,
  })

  return (
    <div className="w-full p-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-5xl font-bold tracking-tighter">Admin</h1>
          <p className="text-text/60 mt-1">Manage roadside drains and monitor live activity.</p>
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

      <Tabs defaultValue="metrics" className="flex flex-col gap-4">
        <TabsList className="h-auto py-1.5">
          <TabsTrigger value="metrics" className="cursor-pointer py-1.5 data-active:bg-text data-active:!text-white">Live Metrics</TabsTrigger>
          <TabsTrigger value="operators" className="cursor-pointer py-1.5 data-active:bg-text data-active:!text-white">Operators</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics">
          <div className="flex gap-4 items-stretch">
            <Card className="flex-1 h-[600px] p-0 overflow-hidden min-w-0">
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
            </Card>

            {selectedDrain && (
              <Card className="w-72 h-[600px] flex flex-col overflow-hidden shrink-0">
                <div className="flex items-start justify-between p-5 pb-3 shrink-0 border-b border-border">
                  <div>
                    <h2 className="text-base font-bold leading-tight">{selectedDrain.publicName}</h2>
                    <p className="text-xs text-text/50 font-mono mt-0.5">{selectedDrain.privateName ?? "—"}</p>
                  </div>
                  <button
                    onClick={() => setSelectedDrain(null)}
                    className="text-text/40 hover:cursor-pointer hover:text-red-500 transition-colors ml-2 shrink-0 text-lg leading-none"
                    aria-label="Close"
                  >
                    <X />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
                  <div className="flex flex-col gap-3">
                    <SensorGauge label="Water level" value={selectedDrain.fillPercent ?? null} max={100} unit="%" thresholds={{ warn: 60, danger: 80 }} />
                    <SensorGauge label="CO₂" value={selectedDrain.co2Ppm ?? null} max={CO2_MAX} unit="ppm" thresholds={{ warn: 50, danger: 80 }} />
                  </div>

                  <div className="flex flex-col gap-3 text-sm">
                    <div>
                      <p className="text-text/50 text-xs mb-1">Operator</p>
                      <Select
                        value={selectedDrain.operatorEmail ?? ""}
                        onValueChange={(val: string) => assignMutation.mutate(val || null)}
                        disabled={assignMutation.isPending}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="— Unassigned —" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">— Unassigned —</SelectItem>
                          {operators.map((op) => (
                            <SelectItem key={op.username} value={op.attributes.email ?? ""}>
                              {op.attributes.name ?? op.attributes.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div><p className="text-text/50 text-xs">Height</p><p>{selectedDrain.height != null ? `${selectedDrain.height}cm` : "—"}</p></div>
                    <div><p className="text-text/50 text-xs">Sentiment</p><p>{selectedDrain.sentimentScore ?? "—"} / 10</p></div>
                    <div><p className="text-text/50 text-xs">Lifetime Reports</p><p>{selectedDrain.reportCount}</p></div>
                    <div><p className="text-text/50 text-xs">Alerted</p><p>{selectedDrain.alreadyAlerted ? "Yes" : "No"}</p></div>
                  </div>

                  <Button variant="outline" size="sm" className="text-xs cursor-pointer w-full" onClick={() => setConfirmReset(true)}>
                    Reset Sentiment
                  </Button>

                  {messages.length > 0 && (
                    <div>
                      <p className="text-xs text-text/50 mb-2">Reports</p>
                      <div className="flex flex-col gap-2">
                        {messages.map((msg) => (
                          <div key={msg.Event_Key} className="rounded-md border border-border p-2.5 text-xs">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">{msg.name}</span>
                              <span className="text-text/40">{new Date(msg.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-text/70 leading-relaxed">{msg.message}</p>
                            {msg.sentiment && (
                              <span className={`mt-1.5 inline-block text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                                msg.sentiment === "POSITIVE" ? "bg-green-100 text-green-700" :
                                msg.sentiment === "NEGATIVE" ? "bg-red-100 text-red-600" :
                                "bg-muted text-text/50"
                              }`}>{msg.sentiment.toLowerCase()}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="operators">
          <OperatorsTab />
        </TabsContent>
      </Tabs>

      <Dialog open={confirmReset} onOpenChange={setConfirmReset}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Reset sentiment score?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-text/60">This will reset the sentiment score for <span className="font-semibold text-text">{selectedDrain?.publicName}</span> back to 10. Continue only if the citizens' concerns about the drain have been investigated.</p>
          <div className="flex gap-2 justify-end mt-2">
            <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => setConfirmReset(false)}>Cancel</Button>
            <Button
              size="sm"
              className="bg-text text-white hover:bg-alt-accent cursor-pointer"
              disabled={resetMutation.isPending}
              onClick={() => resetMutation.mutate()}
            >
              {resetMutation.isPending ? "Resetting..." : "Confirm"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
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
