import { currentUser } from "@clerk/nextjs/server"

import GeneratorForm from "./Form"

export default async function GeneratorPage() {
  const user = await currentUser()
  return <GeneratorForm userId={user?.id ?? ""} />
}
