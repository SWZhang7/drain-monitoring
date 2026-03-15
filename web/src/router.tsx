import { createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router'
import { Toaster } from 'sonner'
import Nav from './components/Nav'
import Footer from './components/Footer'
import Home from './pages/Home'
import DrainMap from './pages/DrainMap'
import Admin from './pages/Admin'

function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
      <Toaster richColors position="bottom-right" />
    </div>
  )
}

const rootRoute = createRootRoute({ component: RootLayout })

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
})

const drainMapRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/map',
  component: DrainMap,
})

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: Admin,
})

const routeTree = rootRoute.addChildren([homeRoute, drainMapRoute, adminRoute])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
