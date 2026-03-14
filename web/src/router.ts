import { createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router'
import Nav from './components/Nav'
import Home from './pages/Home'
import DrainMap from './pages/DrainMap'
import { createElement } from 'react'

const rootRoute = createRootRoute({
  component: () => createElement('div', null, createElement(Nav), createElement(Outlet)),
})

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
