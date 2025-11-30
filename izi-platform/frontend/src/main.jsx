import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App, { ProtectedRoute, PublicRoute, AdminRoute } from './App.jsx'
import './index.css'

// Pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import MyCoursesPage from './pages/MyCoursesPage'
import CoursePage from './pages/CoursePage'
import NotFoundPage from './pages/NotFoundPage'
import CreateCoursePage from './pages/CreateCoursePage'

// Create router with future flag to opt into v7 relative splat behavior
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'login', element: <PublicRoute><LoginPage /></PublicRoute> },
      { path: 'registrar', element: <PublicRoute><RegisterPage /></PublicRoute> },
      { path: 'cursos', element: <ProtectedRoute><MyCoursesPage /></ProtectedRoute> },
      { path: 'curso/:courseId', element: <ProtectedRoute><CoursePage /></ProtectedRoute> },
      { path: 'admin/cursos/novo', element: <AdminRoute><CreateCoursePage /></AdminRoute> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
], {
  // Opt into the v7-relative-splat-path behavior to silence the warning and
  // keep forward compatibility with React Router v7.
  future: { v7_relativeSplatPath: true },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)