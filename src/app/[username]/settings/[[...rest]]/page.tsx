import { Suspense } from "react"

import SettingsPageClient from "./SettingsPageClient"

// Generate static params for build-time validation (required by Cache Components)
// This route is dynamic, but we provide a dummy entry for build validation
export function generateStaticParams() {
  return [{ username: "dummy", rest: [] }]
}

// Server component wrapper to provide generateStaticParams
export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading settings...</div>}>
      <SettingsPageClient />
    </Suspense>
  )
}
