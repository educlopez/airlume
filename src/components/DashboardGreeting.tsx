"use client"

import { useUser } from "@clerk/nextjs"

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  return "Good evening"
}

export function DashboardGreeting() {
  const { user, isLoaded } = useUser()
  if (!isLoaded)
    return <div className="mb-2 text-3xl font-bold">Loading...</div>
  if (!user) return <div className="mb-2 text-3xl font-bold">Welcome!</div>
  const userName = user.fullName || user.username || user.firstName || "User"
  return (
    <h1 className="mb-2 text-3xl font-bold">
      {getGreeting()}, {userName}!
    </h1>
  )
}
