"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeToggle } from "@/components/theme-toggle"
import { BlinkLogo } from "@/components/condominio/blink-logo"
import VisaoGeral from "./abas/visao-geral"
import FluxoCaixa from "./abas/fluxo-caixa"
import Despesas from "./abas/despesas"
import ManutencaoReserva from "./abas/manutencao-reserva"
import { META } from "@/lib/data/condominio"

export default function CondominioPage() {
  const [tab, setTab] = useState("visao-geral")

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <BlinkLogo height={32} />
            <div className="hidden sm:block w-px h-8 bg-gray-200 dark:bg-neutral-700" />
            <div className="hidden sm:block">
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                {META.condominio}
              </div>
              <div className="text-[11px] text-gray-500 dark:text-neutral-500 font-mono">
                {META.periodoInicio} — {META.periodoFim} · {META.unidades} unidades · Análise Financeira
              </div>
            </div>
          </div>

          <ThemeToggle />
        </div>
      </header>

      {/* Tabs + content */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4">
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 p-1 h-auto w-full sm:w-auto inline-flex flex-wrap gap-1">
            <TabsTrigger
              value="visao-geral"
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-white text-xs sm:text-sm px-3 py-1.5"
            >
              Visão Geral
            </TabsTrigger>
            <TabsTrigger
              value="fluxo-caixa"
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-white text-xs sm:text-sm px-3 py-1.5"
            >
              Fluxo de Caixa
            </TabsTrigger>
            <TabsTrigger
              value="despesas"
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-white text-xs sm:text-sm px-3 py-1.5"
            >
              Despesas
            </TabsTrigger>
            <TabsTrigger
              value="manutencao"
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-white text-xs sm:text-sm px-3 py-1.5"
            >
              Manutenção & Reserva
            </TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <TabsContent value="visao-geral" className="mt-0">
              <VisaoGeral />
            </TabsContent>
            <TabsContent value="fluxo-caixa" className="mt-0">
              <FluxoCaixa />
            </TabsContent>
            <TabsContent value="despesas" className="mt-0">
              <Despesas />
            </TabsContent>
            <TabsContent value="manutencao" className="mt-0">
              <ManutencaoReserva />
            </TabsContent>
          </div>
        </Tabs>
      </main>

      <footer className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 text-[10px] text-gray-400 dark:text-neutral-600 font-mono">
        Dados consolidados a partir das entregas v2 da Blink · Matriz de rastreabilidade · Mapa de riscos · Manuscritos transcritos
      </footer>
    </div>
  )
}
