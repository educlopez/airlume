"use client"

import { ReactNode } from "react"

function getGradientClass(hour: number) {
  if (hour < 12) return "dashboard-gradient-morning"
  if (hour < 18) return "dashboard-gradient-afternoon"
  return "dashboard-gradient-evening"
}

export function DashboardHeaderGradient({
  children,
  fakeHour,
}: {
  children: ReactNode
  fakeHour?: number
}) {
  const hour = typeof fakeHour === "number" ? fakeHour : new Date().getHours()
  const gradient = getGradientClass(hour)
  return (
    <div
      className={`flex flex-col rounded-xl ${gradient} p-8 md:flex-row md:items-center md:justify-between`}
    >
      {children}
    </div>
  )
}
