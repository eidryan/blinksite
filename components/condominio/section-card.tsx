"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ReactNode } from "react"

export function SectionCard({
  title,
  subtitle,
  action,
  children,
  className = "",
}: {
  title: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <Card className={`bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 ${className}`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wide">{title}</h3>
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-neutral-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          {action}
        </div>
        {children}
      </CardContent>
    </Card>
  )
}
