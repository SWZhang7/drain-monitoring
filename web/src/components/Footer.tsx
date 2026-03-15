import jamaicaFlag from '../assets/jamaica-flag-icon.webp'

function Footer() {
  return (
    <footer className="flex justify-between items-center gap-3 px-8 py-5 mt-10 border-t border-[#ebebeb]">
      <span className="flex items-center gap-2 text-sm text-text/60">
        <img src={jamaicaFlag} alt="Jamaica flag" className="w-5 h-5 object-cover rounded-sm" />
        Product of Jamaica
      </span>
      <span className="text-sm text-text/60">© {new Date().getFullYear()} FloodWatch. All rights reserved.</span>
    </footer>
  )
}

export default Footer
