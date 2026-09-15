/* eslint-disable react-refresh/only-export-components -- route config intentionally
   pairs lazy() page components with the non-component `router` export; this file
   isn't a Fast Refresh boundary. */
import { lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import Layout from './components/layout/Layout'

// Route-level code splitting — each page (and the registry it pulls in)
// only loads when its route is visited, instead of all bundling into
// the initial chunk. Layout wraps <Outlet /> in the Suspense boundary.
const Home              = lazy(() => import('./pages/Home'))
const DSAIndex          = lazy(() => import('./pages/DSAIndex'))
const AlgorithmPage     = lazy(() => import('./pages/AlgorithmPage'))
const PatternPage       = lazy(() => import('./pages/PatternPage'))
const SystemDesignIndex = lazy(() => import('./pages/SystemDesignIndex'))
const SystemDesignPage  = lazy(() => import('./pages/SystemDesignPage'))
const OODIndex           = lazy(() => import('./pages/OODIndex'))
const OODPage            = lazy(() => import('./pages/OODPage'))
const AIIndex            = lazy(() => import('./pages/AIIndex'))
const AIPage             = lazy(() => import('./pages/AIPage'))

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true,                element: <Home /> },
      { path: 'algorithms',         element: <DSAIndex /> },
      { path: 'algorithms/:id',     element: <AlgorithmPage /> },
      { path: 'patterns',           element: <DSAIndex /> },
      { path: 'patterns/:id',       element: <PatternPage /> },
      { path: 'system-design',      element: <SystemDesignIndex /> },
      { path: 'system-design/:id',  element: <SystemDesignPage /> },
      { path: 'ood',                element: <OODIndex /> },
      { path: 'ood/:id',            element: <OODPage /> },
      { path: 'ai',                 element: <AIIndex /> },
      { path: 'ai/:id',             element: <AIPage /> },
    ],
  },
])
