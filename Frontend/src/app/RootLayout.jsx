// src/app/RootLayout.jsx
import React, { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../feature/auth/hooks/useauth'

const RootLayout = () => {
  const auth = useAuth() // ✅ This will now work!

  useEffect(() => {
    auth.handleGetme()
  }, [])

  return (
    <>
      {/* Outlet renders the current child route (Dashboard, Login, etc.) */}
      <Outlet />
    </>
  )
}

export default RootLayout