import { Link } from '@tanstack/react-router'

function Nav() {
    return (
        <>
            <nav className="flex gap-3 justify-between items-center py-4 px-8">
                <h2 style={{ fontFamily: 'var(--logo)' }} className="font-black text-2xl">FloodWatch</h2>
                <ul className='flex gap-5' style={{ fontFamily: 'var(--nav)' }}>
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/map">Map</Link></li>
                </ul>
            </nav>

            <hr className='border border-[#ebebeb] rounded-full' />

        </>
    )
}

export default Nav
