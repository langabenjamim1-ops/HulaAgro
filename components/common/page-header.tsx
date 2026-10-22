import { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  icon?: string
  badge?: string
  children?: ReactNode
}

function PageHeaderComponent({ title, description, icon, badge, children }: PageHeaderProps) {
  return (
    <div className="mb-5 min-w-0">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          {icon && <span className="text-3xl">{icon}</span>}
          <div>
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-[#283106] sm:text-3xl">{title}</h1>
              {badge && (
                <span className="rounded-full bg-[#E8EED8] px-2.5 py-1 text-xs font-semibold text-[#53602E]">
                  {badge}
                </span>
              )}
            </div>
            {description && <p className="max-w-2xl text-sm leading-5 text-[#727964]">{description}</p>}
          </div>
        </div>
      </div>
      {children}
    </div>
  )
}

export { PageHeaderComponent as PageHeader }
export default PageHeaderComponent
