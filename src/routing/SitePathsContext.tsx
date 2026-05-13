import { createContext, useContext, type ReactNode } from 'react'

type SitePathsValue = {
  /** Ej. `/es` (sin barra final). */
  basePath: string
}

const SitePathsContext = createContext<SitePathsValue | null>(null)

export function SitePathsProvider({
  basePath,
  children,
}: {
  basePath: string
  children: ReactNode
}) {
  return (
    <SitePathsContext.Provider value={{ basePath }}>{children}</SitePathsContext.Provider>
  )
}

export function useSitePaths(): SitePathsValue {
  const ctx = useContext(SitePathsContext)
  if (!ctx) throw new Error('useSitePaths must be used within SitePathsProvider')
  return ctx
}
