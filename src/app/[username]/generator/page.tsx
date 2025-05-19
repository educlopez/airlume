import type { Metadata } from "next"
import { currentUser } from "@clerk/nextjs/server"

import GeneratorForm from "./Form"

export const metadata: Metadata = {
  title: "Generator",
}
export default async function GeneratorPage() {
  const user = await currentUser()
  return <GeneratorForm userId={user?.id ?? ""} />
}
