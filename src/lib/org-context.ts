import { AsyncLocalStorage } from "async_hooks"
import type { OrgRole } from "@prisma/client"

export interface OrgContext {
  orgId: string
  userId: string
  role: OrgRole
}

export const orgStorage = new AsyncLocalStorage<OrgContext>()

export function getOrgContext(): OrgContext | undefined {
  return orgStorage.getStore()
}
