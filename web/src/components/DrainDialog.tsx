import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState, useEffect } from "react"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

const API = import.meta.env.VITE_API_URL ?? ""

const reportSchema = z.object({
  name: z.string().optional(),
  description: z.string().min(10, "Please describe the problem in more detail"),
})

const volunteerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  contact: z.string().email("Enter a valid email"),
  availability: z.string().optional(),
})

type ReportForm = z.infer<typeof reportSchema>
type VolunteerForm = z.infer<typeof volunteerSchema>

function ReportForm({ drainId }: { drainId: string }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ReportForm>({
    resolver: zodResolver(reportSchema),
  })

  const mutation = useMutation({
    mutationFn: async (data: ReportForm) => {
      const res = await fetch(`${API}/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, D_Id: drainId }),
      })
      if (!res.ok) throw new Error("Failed to submit report")
      return res.json()
    },
  })

  const onSubmit = (data: ReportForm) => {
    toast.promise(mutation.mutateAsync(data), {
      loading: "Submitting your report...",
      success: () => { reset(); return "Report submitted. Your councillor has been notified." },
      error: "Something went wrong. Please try again.",
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="r-name">Name <span className="text-xs text-muted-foreground">(Optional)</span></Label>
        <Input id="r-name" placeholder="Your name" {...register("name")} />
        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="r-desc">Problem Description</Label>
        <textarea
          id="r-desc"
          placeholder="Describe the issue"
          rows={4}
          {...register("description")}
          className="border-input bg-background placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px] resize-none"
        />
        {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
      </div>
      <Button
        type="submit"
        disabled={mutation.isPending}
        className="rounded-full bg-text text-white hover:bg-alt-accent transition-colors cursor-pointer"
      >
        Submit Report
      </Button>
    </form>
  )
}

function VolunteerForm({ drainId }: { drainId: string }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<VolunteerForm>({
    resolver: zodResolver(volunteerSchema),
  })

  const mutation = useMutation({
    mutationFn: async (data: VolunteerForm) => {
      const res = await fetch(`${API}/volunteers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, D_Id: drainId }),
      })
      if (!res.ok) throw new Error("Failed to sign up")
      return res.json()
    },
  })

  const onSubmit = (data: VolunteerForm) => {
    toast.promise(mutation.mutateAsync(data), {
      loading: "Signing you up...",
      success: () => { reset(); return "You're signed up. We'll connect you with the right person." },
      error: "Something went wrong. Please try again.",
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="v-name">Name</Label>
        <Input id="v-name" placeholder="Your name" {...register("name")} />
        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="v-contact">Email</Label>
        <Input id="v-contact" placeholder="you@example.com" {...register("contact")} />
        {errors.contact && <p className="text-xs text-red-500">{errors.contact.message}</p>}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="v-avail">Availability <span className="text-xs text-muted-foreground">(Optional)</span></Label>
        <Input id="v-avail" placeholder="e.g. Weekends, mornings" {...register("availability")} />
        {errors.availability && <p className="text-xs text-red-500">{errors.availability.message}</p>}
      </div>
      <Button
        type="submit"
        disabled={mutation.isPending}
        className="rounded-full bg-text text-white hover:bg-alt-accent transition-colors cursor-pointer"
      >
        Volunteer
      </Button>
    </form>
  )
}

type DrainDialogProps = {
  open: boolean
  onClose: () => void
  drainName: string
  drainId?: string
}

type DrainStatusValue = "online" | "offline"

function StatusBadge({ drainId }: { drainId: string }) {
  const [status, setStatus] = useState<DrainStatusValue>("offline")

  useEffect(() => {
    const ws = new WebSocket(`wss://your-api/drains/${drainId}/status`)
    ws.onmessage = (e) => setStatus(JSON.parse(e.data).status)
    return () => ws.close()
  }, [drainId])

  const isOnline = status === "online"
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold font-mono tracking-wide ${isOnline ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
      <span className={`size-1.5 rounded-full ${isOnline ? "bg-green-500" : "bg-red-500"}`} />
      {isOnline ? "Online" : "Offline"}
    </span>
  )
}

export function DrainDialog({ open, onClose, drainName, drainId }: DrainDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md pt-10 [&>button]:text-red-500 [&>button]:hover:text-red-700 [&>button]:cursor-pointer">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5">
            {drainName}
            {drainId && <StatusBadge drainId={drainId} />}
          </DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="report" className="w-full flex flex-col">
          <TabsList className="w-full!">
            <TabsTrigger value="report" className="flex-1 cursor-pointer">Report Problem</TabsTrigger>
            <TabsTrigger value="volunteer" className="flex-1 cursor-pointer">Volunteer</TabsTrigger>
          </TabsList>
          <TabsContent value="report">
            <p className="text-sm text-muted-foreground mt-3 mb-1">Spotted an issue? Let your local councillor know directly.</p>
            <ReportForm drainId={drainId ?? ""} />
          </TabsContent>
          <TabsContent value="volunteer">
            <p className="text-sm text-muted-foreground mt-3 mb-1">Want to help fix it? Sign up and we'll connect you with the right person.</p>
            <VolunteerForm drainId={drainId ?? ""} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
