import { createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router'
import { Toaster } from 'sonner'
import Nav from './components/Nav'
import Footer from './components/Footer'
import Home from './pages/Home'
import DrainMap from './pages/DrainMap'

function RootLayout() {
  return (
    <div>
      <Nav />
      <Outlet />
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

const routeTree = rootRoute.addChildren([homeRoute, drainMapRoute])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
