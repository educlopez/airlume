import { Suspense } from "react"
import type { Metadata } from "next"
import { auth } from "@clerk/nextjs/server"

import GeneratorForm from "./Form"

export const metadata: Metadata = {
  title: "Generator",
}

// Generate static params for build-time validation (required by Cache Components)
// This route is dynamic, but we provide a dummy entry for build validation
export function generateStaticParams() {
  return [{ username: "dummy" }]
}

// Loading fallback component
function GeneratorLoading() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
    </div>
  )
}

// Extracted async component for data fetching (wrapped in Suspense)
async function GeneratorContent() {
  const { userId } = await auth()
  return <GeneratorForm userId={userId ?? ""} />
}

export default function GeneratorPage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  return (
    <Suspense fallback={<GeneratorLoading />}>
      <GeneratorContent />
    </Suspense>
  )
}
