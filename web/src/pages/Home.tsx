import { Button } from "@/components/ui/button"
import { Link } from "@tanstack/react-router"
import { Megaphone, MapPin, HandHelping, Activity } from "lucide-react"

function Home() {
  return <div className="w-full p-7">
    <section className="flex flex-col items-center justify-center">
      <h1 className="text-center text-5xl font-bold max-w-[350px] tracking-tighter">
        Blocked drain? Let us know
      </h1>

      <p className="mt-6 max-w-[400px] text-center">Blocked drains can cause flooding, damage roads, and disrupt your street. Report it today and let the NWA handle the rest.</p>

      <Link to="/map">
        <Button size={"xl"} className="mt-6 py-4 bg-text rounded-full text-white hover:bg-alt-accent hover:text-text hover:cursor-pointer transition-colors">
          <Megaphone className="mr-2 h-4 w-4" />
          Report a Blocked Drain
        </Button>
      </Link>

      <div className="mt-8 flex items-center gap-2 relative">
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

    <section className="px-40 max-[700px]:px-[15px]">
      <h1 className="text-5xl font-bold max-w-[500px] tracking-tighter">
        Why is FloodWatch Important?
      </h1>

      <p className="mt-6">
        Jamaica loses billions to flooding every year. A single tropical storm can cause hundreds of millions of dollars in damage, and blocked drains and waterways often make the problem worse.

        With Floodwatch, you have a direct line to the NWA and your local government. Report blocked drains, flooding, or drainage issues in your area so we can better help prevent problems before they escalate.
      </p>

    </section>

    <section className="mt-14 px-40 max-[700px]:px-[15px]">
      <h1 className="text-5xl font-bold max-w-[500px] tracking-tighter">
        Features.
      </h1>

      <div className="flex flex-wrap gap-4 mt-6 max-[1200px]:flex-col">
        <div className="relative flex-1 bg-accent rounded-xl p-6 overflow-hidden">
          <MapPin className="absolute bottom-4 right-4 size-16 text-[#cbc241] z-0" />
          <div className="relative z-10">
            <h3 className="font-semibold text-lg mb-2 text-text">Reporting</h3>
            <p className="text-sm text-text/70">See a problem drain? Find it on the map, report it and it goes straight to your local councillor. They'll see it, take ownership, and you'll know your concern has been heard.</p>
          </div>
        </div>
        <div className="relative flex-1 bg-accent rounded-xl p-6 overflow-hidden">
          <HandHelping className="absolute bottom-4 right-4 size-16 text-[#cbc241] z-0" />
          <div className="relative z-10">
            <h3 className="font-semibold text-lg mb-2 text-text">Volunteering</h3>
            <p className="text-sm text-text/70">Want to do more than report? Volunteer to fix a drain and get connected directly with the councillor managing that issue. Coordinate, act, and make a real difference in your community.</p>
          </div>
        </div>
        <div className="relative flex-1 bg-accent rounded-xl p-6 overflow-hidden">
          <Activity className="absolute bottom-4 right-4 size-16 text-[#cbc241] z-0" />
          <div className="relative z-10">
            <h3 className="font-semibold text-lg mb-2 text-text">Live Monitoring</h3>
            <p className="text-sm text-text/70">We're on it too. FloodWatch actively monitors drains in real-time, detecting potential blockages before they become major problems. We see the health of your street's drains at a glance, and our team acts fast to prevent flooding.</p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-center items-center gap-4">
        <Link to="/map">
          <Button size="xl" className="py-4 rounded-full bg-text text-white hover:bg-alt-accent hover:text-white transition-colors cursor-pointer">
            <MapPin className="mr-2 h-4 w-4" />
            View the Drain Map
          </Button>
        </Link>
      </div>

    </section>
  </div>
}

export default Home
