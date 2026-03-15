import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'

function Nav() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <nav className="flex gap-3 justify-between items-center py-4 px-8">
        <Link to="/"><h2 style={{ fontFamily: 'var(--logo)' }} className="font-black text-2xl hover:text-alt-accent transition-colors">FloodWatch</h2></Link>

        {/* Desktop */}
        <div className="flex items-center gap-5 max-[500px]:hidden">
          <ul className='flex gap-5' style={{ fontFamily: 'var(--nav)' }}>
            <li><Link className="hover:text-alt-accent transition-colors" to="/">Home</Link></li>
            <li><Link className="hover:text-alt-accent transition-colors" to="/map">Map</Link></li>
          </ul>
          <Button className="rounded-full bg-text text-white hover:bg-alt-accent transition-colors cursor-pointer">Login</Button>
        </div>

        {/* Hamburger */}
        <button className="hidden max-[500px]:block" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="hidden max-[500px]:flex flex-col items-center gap-4 px-8 py-4 border-t border-[#ebebeb]">
          <Link className="hover:text-alt-accent transition-colors" to="/" onClick={() => setOpen(false)}>Home</Link>
          <Link className="hover:text-alt-accent transition-colors" to="/map" onClick={() => setOpen(false)}>Map</Link>
          <Button className="rounded-full bg-text text-white hover:bg-alt-accent transition-colors cursor-pointer w-fit">Login</Button>
        </div>
      )}

      <hr className='border border-[#ebebeb] rounded-full m-0' />
    </>
  )
}

export default Nav
