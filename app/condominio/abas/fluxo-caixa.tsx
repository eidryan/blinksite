"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { SectionCard } from "@/components/condominio/section-card"
import {
  META,
  calcularResumosMensais,
  custoMedioMensal,
  custoMedioPorEra,
} from "@/lib/data/condominio"

const fmt = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })
const fmtFull = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 })

const TOOLTIP_STYLE = {
  background: "rgba(20,20,20,0.95)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 6,
  fontSize: 12,
  color: "white",
}
const TOOLTIP_ITEM_STYLE = { color: "white" }

// ============================================================================
// LINHA: EVOLUÇÃO DO SALDO
// ============================================================================

function LinhaSaldo() {
  const resumos = calcularResumosMensais()
  const data = resumos.map((r) => ({
    mes: r.mes,
    saldo: r.saldoFinal,
    despesa: r.despesa,
  }))

  return (
    <SectionCard
      title="Evolução do saldo mês a mês"
      subtitle="Saldo de fechamento e despesa de cada mês"
    >
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,120,120,0.18)" vertical={false} />
            <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "currentColor" }} stroke="rgba(120,120,120,0.4)" />
            <YAxis
              tick={{ fontSize: 11, fill: "currentColor" }}
              stroke="rgba(120,120,120,0.4)"
              tickFormatter={(v) => `R$${(v / 1000).toFixed(1)}k`}
            />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              labelStyle={{ color: "#f97316", fontWeight: 600 }}
              formatter={(v: number, name) => [fmtFull(v), name as string]}
              itemStyle={TOOLTIP_ITEM_STYLE}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} iconSize={10} />
            <Bar dataKey="despesa" name="Despesa do mês" fill="#ef4444" opacity={0.6} barSize={20} />
            <Line
              type="monotone"
              dataKey="saldo"
              name="Saldo de fechamento"
              stroke="#f97316"
              strokeWidth={2.5}
              dot={{ fill: "#f97316", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  )
}

// ============================================================================
// WATERFALL: ENTRADA − SAÍDA POR MÊS
// ============================================================================

function WaterfallMensal() {
  const resumos = calcularResumosMensais()
  const data = resumos.map((r) => ({
    mes: r.mes,
    receita: r.receita,
    despesa: -r.despesa, // negativo
    resultado: r.resultado,
  }))

  return (
    <SectionCard
      title="Entradas vs Saídas por mês"
      subtitle="Receita acima do zero, despesa abaixo. Linha laranja = resultado líquido."
    >
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 0 }} stackOffset="sign">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,120,120,0.18)" vertical={false} />
            <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "currentColor" }} stroke="rgba(120,120,120,0.4)" />
            <YAxis
              tick={{ fontSize: 11, fill: "currentColor" }}
              stroke="rgba(120,120,120,0.4)"
              tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
            />
            <ReferenceLine y={0} stroke="rgba(120,120,120,0.5)" />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              labelStyle={{ color: "#f97316", fontWeight: 600 }}
              formatter={(v: number, name) => [fmtFull(Math.abs(v)), name as string]}
              itemStyle={TOOLTIP_ITEM_STYLE}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} iconSize={10} />
            <Bar dataKey="receita" name="Receita" fill="#22c55e" />
            <Bar dataKey="despesa" name="Despesa" fill="#ef4444" />
            <Line
              type="monotone"
              dataKey="resultado"
              name="Resultado"
              stroke="#f97316"
              strokeWidth={2.5}
              dot={{ fill: "#f97316", r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  )
}

// ============================================================================
// PREVISTO VS REALIZADO
// ============================================================================

function PrevistoRealizado() {
  const resumos = calcularResumosMensais()
  const custoMedio = custoMedioMensal()
  const data = resumos.map((r) => ({
    mes: r.mes,
    receita: r.receita,
    custoMedio: custoMedio,
    realizado: r.despesa,
  }))

  return (
    <SectionCard
      title="Previsto vs Realizado"
      subtitle={`Despesa de cada mês comparada à receita (R$ 4.200) e ao custo médio (${fmt(custoMedio)})`}
    >
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,120,120,0.18)" vertical={false} />
            <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "currentColor" }} stroke="rgba(120,120,120,0.4)" />
            <YAxis
              tick={{ fontSize: 11, fill: "currentColor" }}
              stroke="rgba(120,120,120,0.4)"
              tickFormatter={(v) => `R$${(v / 1000).toFixed(1)}k`}
            />
            <ReferenceLine y={4200} stroke="#22c55e" strokeDasharray="4 4" label={{ value: "Receita 4.200", position: "right", fill: "#22c55e", fontSize: 10 }} />
            <ReferenceLine y={custoMedio} stroke="#a3a3a3" strokeDasharray="4 4" label={{ value: `Média ${fmt(custoMedio)}`, position: "right", fill: "#a3a3a3", fontSize: 10 }} />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              labelStyle={{ color: "#f97316", fontWeight: 600 }}
              formatter={(v: number) => [fmtFull(v), "Despesa realizada"]}
              itemStyle={TOOLTIP_ITEM_STYLE}
            />
            <Bar dataKey="realizado" name="Despesa realizada">
              {data.map((d, i) => (
                <Cell
                  key={i}
                  fill={d.realizado > d.receita ? "#ef4444" : d.realizado > custoMedio ? "#f97316" : "#22c55e"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex gap-3 text-[10px] text-gray-500 dark:text-neutral-500 pt-1">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-green-500" /> Abaixo da média
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-orange-500" /> Acima da média
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-red-500" /> Acima da receita
        </span>
      </div>
    </SectionCard>
  )
}

// ============================================================================
// COMPARATIVO DE ERAS: 2020 vs 2024-25 vs Ago/25-Mar/26
// ============================================================================

function ComparativoEras() {
  const data = custoMedioPorEra().map((e) => ({
    era: e.era,
    media: Math.round(e.media),
    n: e.n,
  }))

  return (
    <SectionCard
      title="Custo médio mensal — comparativo histórico"
      subtitle="Média de despesa por mês em cada janela de dados"
    >
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 10, right: 60, bottom: 0, left: 80 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,120,120,0.18)" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: "currentColor" }}
              stroke="rgba(120,120,120,0.4)"
              tickFormatter={(v) => `R$${(v / 1000).toFixed(1)}k`}
            />
            <YAxis
              type="category"
              dataKey="era"
              tick={{ fontSize: 11, fill: "currentColor" }}
              stroke="rgba(120,120,120,0.4)"
              width={75}
            />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              labelStyle={{ color: "#f97316", fontWeight: 600 }}
              formatter={(v: number, _, props) => [`${fmt(v)} (n=${(props.payload as { n: number }).n} meses)`, "Custo médio"]}
              itemStyle={TOOLTIP_ITEM_STYLE}
            />
            <Bar dataKey="media" name="Custo médio">
              {data.map((d, i) => {
                const colors = ["#a78bfa", "#3b82f6", "#f97316"]
                return <Cell key={i} fill={colors[i % colors.length]} />
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[11px] text-gray-400 dark:text-neutral-600 italic">
        Períodos: 2020 (Mai–Jul, manuscritos), 2024-25 (Set–Jan, manuscritos), Ago/25–Mar/26 (matriz Blink).
      </p>
    </SectionCard>
  )
}

// ============================================================================
// EXPORT — ABA COMPLETA
// ============================================================================

export default function FluxoCaixa() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <LinhaSaldo />
      <WaterfallMensal />
      <PrevistoRealizado />
      <ComparativoEras />
    </div>
  )
}
