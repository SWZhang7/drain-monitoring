import { Button } from "@/components/ui/button"
import { Link } from "@tanstack/react-router"
import { Megaphone } from "lucide-react"

function Home() {
  return <div className="w-full p-7">
    <section className="flex flex-col items-center justify-center">
      <h1 className="text-center text-5xl font-bold max-w-[350px] tracking-tighter">
        Blocked drain? Let us know
      </h1>

      <p className="mt-6 max-w-[400px] text-center">Blocked drains can cause flooding, damage roads, and disrupt your street. Report it today and let the NWA handle the rest.</p>

      <Link to="/map">
        <Button size={"xl"} className="mt-6 py-4  bg-text rounded-full text-white hover:cursor-pointer">
          <Megaphone className="mr-2 h-4 w-4" />
          Report a Blocked Drain
        </Button>
      </Link>

      <div className="mt-8 flex gap-2 relative">
        <div className="bg-accent w-64 h-96 relative top-[-10rem] rounded-2xl">
        </div>
        <div className="bg-accent w-64 h-64 relative rounded-2xl">
        </div>
        <div className="bg-accent w-64 h-64 relative rounded-2xl">
        </div>
        <div className="bg-accent w-64 h-64 relative rounded-2xl">
        </div>
        <div className="bg-accent w-64 h-96 relative top-[-10rem] rounded-2xl">
        </div>
      </div>
    </section>

    <section>

    </section>
  </div>
}

export default Home
