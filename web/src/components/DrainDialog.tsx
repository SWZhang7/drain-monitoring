import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

const reportSchema = z.object({
  name: z.string().optional(),
  description: z.string().min(10, "Please describe the problem in more detail"),
})

const volunteerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  contact: z.string().email("Enter a valid email"),
  availability: z.string().min(1, "Please provide your availability"),
})

type ReportForm = z.infer<typeof reportSchema>
type VolunteerForm = z.infer<typeof volunteerSchema>

function ReportForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<ReportForm>({
    resolver: zodResolver(reportSchema),
  })
  const onSubmit = (data: ReportForm) => console.log("Report:", data)

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
      <Button type="submit" className="rounded-full bg-text text-white hover:bg-alt-accent transition-colors cursor-pointer">Submit Report</Button>
    </form>
  )
}

function VolunteerForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<VolunteerForm>({
    resolver: zodResolver(volunteerSchema),
  })
  const onSubmit = (data: VolunteerForm) => console.log("Volunteer:", data)

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
        <Label htmlFor="v-avail">Availability</Label>
        <Input id="v-avail" placeholder="e.g. Weekends, mornings" {...register("availability")} />
        {errors.availability && <p className="text-xs text-red-500">{errors.availability.message}</p>}
      </div>
      <Button type="submit" className="rounded-full bg-text text-white hover:bg-alt-accent transition-colors cursor-pointer">Volunteer</Button>
    </form>
  )
}

type DrainDialogProps = {
  open: boolean
  onClose: () => void
  drainName: string
}

export function DrainDialog({ open, onClose, drainName }: DrainDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md pt-10 [&>button]:text-red-500 [&>button]:hover:text-red-700 [&>button]:cursor-pointer">
        <DialogHeader>
          <DialogTitle>{drainName}</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="report" className="w-full flex flex-col">
          <TabsList className="w-full!">
            <TabsTrigger value="report" className="flex-1 cursor-pointer">Report Problem</TabsTrigger>
            <TabsTrigger value="volunteer" className="flex-1 cursor-pointer">Volunteer</TabsTrigger>
          </TabsList>
          <TabsContent value="report">
            <p className="text-sm text-muted-foreground mt-3 mb-1">Spotted an issue? Let your local councillor know directly.</p>
            <ReportForm />
          </TabsContent>
          <TabsContent value="volunteer">
            <p className="text-sm text-muted-foreground mt-3 mb-1">Want to help fix it? Sign up and we'll connect you with the right person.</p>
            <VolunteerForm />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
