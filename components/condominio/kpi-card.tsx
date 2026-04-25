"use client"

import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingDown, TrendingUp, Minus } from "lucide-react"

type Trend = "up" | "down" | "flat"

export type KpiCardProps = {
  label: string
  value: string                   // formatted (R$ 2.357 etc)
  sublabel?: string               // subtitle ("livre + reserva")
  spark?: { x: string; y: number }[] // sparkline data
  delta?: { trend: Trend; text: string } // "+12% vs início"
  accent?: string                 // hex color for sparkline (default orange)
}

const fmt = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })

export function KpiCard({ label, value, sublabel, spark, delta, accent = "#f97316" }: KpiCardProps) {
  const TrendIcon = delta?.trend === "up" ? TrendingUp : delta?.trend === "down" ? TrendingDown : Minus
  const trendColor =
    delta?.trend === "up"
      ? "text-green-600 dark:text-green-400"
      : delta?.trend === "down"
        ? "text-red-600 dark:text-red-400"
        : "text-gray-500 dark:text-neutral-400"

  return (
    <Card className="bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800">
      <CardContent className="p-4 space-y-2">
        <div className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-neutral-500 font-medium">
          {label}
        </div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white font-mono">{value}</div>
        {sublabel && (
          <div className="text-xs text-gray-400 dark:text-neutral-500">{sublabel}</div>
        )}

        {spark && spark.length > 1 && (
          <div className="h-10 -mx-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spark} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={accent} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={accent} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="y"
                  stroke={accent}
                  strokeWidth={1.5}
                  fill={`url(#grad-${label})`}
                  dot={false}
                  isAnimationActive={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(20,20,20,0.92)",
                    border: "none",
                    borderRadius: 4,
                    color: "white",
                    fontSize: 11,
                    padding: "4px 8px",
                  }}
                  labelStyle={{ color: "#a3a3a3" }}
                  formatter={(v: number) => [fmt(v), ""]}
                  separator=""
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {delta && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
            <TrendIcon className="w-3 h-3" />
            <span>{delta.text}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
