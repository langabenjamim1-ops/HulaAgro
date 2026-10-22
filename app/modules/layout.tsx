import type { ReactNode } from 'react'
import { ModuleShell } from '@/components/modules/module-shell'

export default function ModulesLayout({ children }: { children: ReactNode }) {
  return <ModuleShell>{children}</ModuleShell>
}
