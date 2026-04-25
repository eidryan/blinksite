"use client"

import { useState, useMemo } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { KpiCard } from "@/components/condominio/kpi-card"
import { SectionCard } from "@/components/condominio/section-card"
import {
  META,
  MESES,
  CATEGORIAS,
  CATEGORIA_BY_ID,
  TRANSACOES,
  calcularResumosMensais,
  custoMedioMensal,
  mesesDeCobertura,
} from "@/lib/data/condominio"

const fmt = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })

const fmtFull = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 })

// ============================================================================
// TERMÔMETRO DOS 8 MESES
// ============================================================================

function TermometroMeses() {
  const resumos = calcularResumosMensais()
  const colorByStatus: Record<string, string> = {
    verde: "bg-green-500",
    amarelo: "bg-yellow-500",
    vermelho: "bg-red-500",
  }
  const labelByStatus: Record<string, string> = {
    verde: "Sobra ≥ meta",
    amarelo: "Sobra abaixo da meta",
    vermelho: "Déficit",
  }

  return (
    <SectionCard title="Termômetro dos 8 meses" subtitle="Resultado de cada mês (receita − despesa)">
      <div className="grid grid-cols-8 gap-1.5">
        {resumos.map((r) => (
          <div key={r.mes} className="group relative">
            <div
              className={`h-12 rounded ${colorByStatus[r.status]} flex items-center justify-center text-white text-xs font-bold transition-transform hover:scale-105 cursor-default`}
              title={`${r.mes}: ${labelByStatus[r.status]} (${fmt(r.resultado)})`}
            >
              {r.mes.split("/")[0]}
            </div>
            <div className="text-[10px] text-center text-gray-500 dark:text-neutral-500 mt-1 font-mono">
              {r.resultado >= 0 ? "+" : ""}
              {fmt(r.resultado)}
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-3 text-[10px] text-gray-500 dark:text-neutral-500 pt-1">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-green-500" /> Sobra ≥ R$1.572
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-yellow-500" /> Sobra &lt; meta
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-red-500" /> Déficit
        </span>
      </div>
    </SectionCard>
  )
}

// ============================================================================
// STACKED PRINCIPAL R$4.200 COM DRILL-DOWN
// ============================================================================

type DrillLevel = "overview" | "fixo_mensal" | "fixo_recorrente" | "variavel"

const SEGMENT_COLORS = {
  fixo_mensal: "#64748b",       // slate-500 — visível em dark e light
  fixo_recorrente: "#94a3b8",   // slate-400
  variavel: "#f97316",          // laranja Blink
  reserva: "#3b82f6",           // azul
  sobra: "#22c55e",             // verde
  deficit: "#ef4444",           // vermelho
} as const

function StackedDrilldown() {
  const [level, setLevel] = useState<DrillLevel>("overview")
  const resumos = calcularResumosMensais()

  // Construção dos dados conforme o nível
  const data = useMemo(() => {
    if (level === "overview") {
      return resumos.map((r) => {
        const fixoMensal = TRANSACOES.filter(
          (t) => t.mes === r.mes && CATEGORIA_BY_ID[t.categoriaId]?.tipo === "fixo_mensal",
        ).reduce((s, t) => s + t.valor, 0)
        const fixoRec = TRANSACOES.filter(
          (t) => t.mes === r.mes && CATEGORIA_BY_ID[t.categoriaId]?.tipo === "fixo_recorrente",
        ).reduce((s, t) => s + t.valor, 0)
        const variavel = TRANSACOES.filter(
          (t) => t.mes === r.mes && CATEGORIA_BY_ID[t.categoriaId]?.tipo === "variavel",
        ).reduce((s, t) => s + t.valor, 0)
        const reserva = r.reservaAlocada
        const sobra = Math.max(0, r.resultado - reserva)
        const deficit = r.resultado < 0 ? Math.abs(r.resultado) : 0
        return {
          mes: r.mes,
          fixoMensal,
          fixoRec,
          variavel,
          reserva,
          sobra,
          deficit,
        }
      })
    }
    // Drill: mostra cada categoria do tipo selecionado, como sub-stack
    const cats = CATEGORIAS.filter((c) => c.tipo === level)
    return resumos.map((r) => {
      const row: Record<string, string | number> = { mes: r.mes }
      for (const c of cats) {
        const val = TRANSACOES.filter((t) => t.mes === r.mes && t.categoriaId === c.id).reduce(
          (s, t) => s + t.valor,
          0,
        )
        row[c.id] = val
      }
      return row
    })
  }, [level, resumos])

  const handleClick = (segmentKey: string) => {
    if (level !== "overview") return
    if (segmentKey === "fixoMensal") setLevel("fixo_mensal")
    else if (segmentKey === "fixoRec") setLevel("fixo_recorrente")
    else if (segmentKey === "variavel") setLevel("variavel")
  }

  const titleByLevel: Record<DrillLevel, string> = {
    overview: "Para onde vão os R$ 4.200 todo mês",
    fixo_mensal: "Detalhamento — Custos Fixos Mensais",
    fixo_recorrente: "Detalhamento — Custos Fixos Recorrentes",
    variavel: "Detalhamento — Custos Variáveis",
  }

  const subtitleByLevel: Record<DrillLevel, string> = {
    overview: "Receita: R$ 4.200/mês (6 unidades). Clique em um segmento para detalhar.",
    fixo_mensal: "Categorias presentes em todos os meses",
    fixo_recorrente: "Categorias previsíveis mas não mensais",
    variavel: "Eventuais e não-recorrentes",
  }

  return (
    <SectionCard
      title={titleByLevel[level]}
      subtitle={subtitleByLevel[level]}
      action={
        level !== "overview" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLevel("overview")}
            className="text-orange-500 hover:text-orange-600 -mt-1"
          >
            <ArrowLeft className="w-3 h-3 mr-1" />
            Voltar
          </Button>
        )
      }
    >
      <div className="h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,120,120,0.18)" vertical={false} />
            <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "currentColor" }} stroke="rgba(120,120,120,0.4)" />
            <YAxis
              tick={{ fontSize: 11, fill: "currentColor" }}
              stroke="rgba(120,120,120,0.4)"
              tickFormatter={(v) => `R$${(v / 1000).toFixed(1)}k`}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(20,20,20,0.95)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 6,
                fontSize: 12,
                color: "white",
              }}
              labelStyle={{ color: "#f97316", fontWeight: 600 }}
              itemStyle={{ color: "white" }}
              formatter={(v: number, name) => [fmtFull(v), name as string]}
              cursor={{ fill: "rgba(249,115,22,0.06)" }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} iconSize={10} iconType="square" />
            {level === "overview" ? (
              <>
                <Bar
                  dataKey="fixoMensal"
                  name="Fixo Mensal"
                  stackId="a"
                  fill={SEGMENT_COLORS.fixo_mensal}
                  cursor="pointer"
                  onClick={() => handleClick("fixoMensal")}
                />
                <Bar
                  dataKey="fixoRec"
                  name="Fixo Recorrente"
                  stackId="a"
                  fill={SEGMENT_COLORS.fixo_recorrente}
                  cursor="pointer"
                  onClick={() => handleClick("fixoRec")}
                />
                <Bar
                  dataKey="variavel"
                  name="Variável"
                  stackId="a"
                  fill={SEGMENT_COLORS.variavel}
                  cursor="pointer"
                  onClick={() => handleClick("variavel")}
                />
                <Bar dataKey="reserva" name="Reserva" stackId="a" fill={SEGMENT_COLORS.reserva} />
                <Bar dataKey="sobra" name="Sobra" stackId="a" fill={SEGMENT_COLORS.sobra} />
                <Bar dataKey="deficit" name="Déficit" stackId="a" fill={SEGMENT_COLORS.deficit} />
              </>
            ) : (
              CATEGORIAS.filter((c) => c.tipo === level).map((c) => (
                <Bar key={c.id} dataKey={c.id} name={c.nome} stackId="a" fill={c.cor} />
              ))
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
      {level === "overview" && (
        <p className="text-[11px] text-gray-400 dark:text-neutral-600 italic">
          Dica: clique em "Fixo Mensal", "Fixo Recorrente" ou "Variável" para detalhar.
        </p>
      )}
    </SectionCard>
  )
}

// ============================================================================
// EXPORT — ABA COMPLETA
// ============================================================================

export default function VisaoGeral() {
  const resumos = calcularResumosMensais()
  const ultimo = resumos[resumos.length - 1]
  const primeiro = resumos[0]
  const cobertura = mesesDeCobertura()
  const custoMedio = custoMedioMensal()

  // Sparklines
  const sparkSaldo = resumos.map((r) => ({ x: r.mes, y: r.saldoFinal }))
  const sparkLivre = resumos.map((r) => ({ x: r.mes, y: r.caixaLivre }))
  const sparkReserva = resumos.map((r) => {
    let acum = 0
    return { x: r.mes, y: 0 } // placeholder; recalculado abaixo
  })
  // Recalcula reserva acumulada
  let acumReserva = 0
  const sparkReservaAcum = resumos.map((r) => {
    acumReserva += r.reservaAlocada
    return { x: r.mes, y: acumReserva }
  })
  const sparkCobertura = resumos.map((r) => ({
    x: r.mes,
    y: r.saldoFinal / custoMedio,
  }))

  // Deltas
  const deltaSaldo = ((ultimo.saldoFinal - primeiro.saldoInicial) / Math.max(1, primeiro.saldoInicial)) * 100
  const deltaLivre = ultimo.caixaLivre - primeiro.caixaLivre

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          label="Saldo Total"
          value={fmt(ultimo.saldoFinal)}
          sublabel="Livre + reserva alocada"
          spark={sparkSaldo}
          delta={{
            trend: deltaSaldo > 0 ? "up" : deltaSaldo < 0 ? "down" : "flat",
            text: `${deltaSaldo > 0 ? "+" : ""}${deltaSaldo.toFixed(1)}% vs Ago/25`,
          }}
          accent="#f97316"
        />
        <KpiCard
          label="Caixa Livre"
          value={fmt(ultimo.caixaLivre)}
          sublabel="Disponível para operação"
          spark={sparkLivre}
          delta={{
            trend: deltaLivre > 0 ? "up" : deltaLivre < 0 ? "down" : "flat",
            text: `${deltaLivre > 0 ? "+" : ""}${fmt(deltaLivre)} no período`,
          }}
          accent="#22c55e"
        />
        <KpiCard
          label="Reserva Acumulada"
          value={fmt(acumReserva)}
          sublabel={`Meta: R$ ${META.metaReservaMensal.toLocaleString("pt-BR")}/mês`}
          spark={sparkReservaAcum}
          delta={{
            trend: acumReserva >= META.metaReservaMensal * MESES.length ? "up" : "down",
            text: `${((acumReserva / (META.metaReservaMensal * MESES.length)) * 100).toFixed(0)}% da meta`,
          }}
          accent="#3b82f6"
        />
        <KpiCard
          label="Resistência"
          value={`${cobertura.toFixed(1)} meses`}
          sublabel="Saldo / custo médio mensal"
          spark={sparkCobertura}
          delta={{
            trend: cobertura > 1 ? "up" : "down",
            text: `Custo médio: ${fmt(custoMedio)}`,
          }}
          accent="#a78bfa"
        />
      </div>

      {/* Termômetro */}
      <TermometroMeses />

      {/* Stacked principal */}
      <StackedDrilldown />
    </div>
  )
}
