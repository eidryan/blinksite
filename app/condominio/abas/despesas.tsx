"use client"

import {
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { SectionCard } from "@/components/condominio/section-card"
import {
  CATEGORIAS,
  CATEGORIA_BY_ID,
  MESES,
  TRANSACOES,
  custoMedioMensal,
  totalPorCategoria,
  totalPorFornecedor,
  totalPorTipo,
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
// DONUT — % POR CATEGORIA
// ============================================================================

function DonutCategorias() {
  const data = totalPorCategoria()
  const total = data.reduce((s, d) => s + d.total, 0)

  return (
    <SectionCard title="% por categoria" subtitle={`Total no período: ${fmt(total)}`}>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="nome"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={95}
              paddingAngle={1}
              labelLine={false}
              label={({ percent }: { percent?: number }) => ((percent ?? 0) > 0.05 ? `${Math.round((percent ?? 0) * 100)}%` : "")}
            >
              {data.map((d, i) => (
                <Cell key={i} fill={d.cor} stroke="rgba(0,0,0,0.2)" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              itemStyle={TOOLTIP_ITEM_STYLE}
              formatter={(v: number, name) => [`${fmtFull(v)} (${((v / total) * 100).toFixed(1)}%)`, name as string]}
            />
            <Legend
              wrapperStyle={{ fontSize: 10 }}
              iconSize={8}
              layout="vertical"
              align="right"
              verticalAlign="middle"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  )
}

// ============================================================================
// DONUT — FIXO vs RECORRENTE vs VARIÁVEL
// ============================================================================

function DonutFixoVariavel() {
  const data = totalPorTipo().map((t) => ({
    rotulo: t.rotulo,
    total: t.total,
  }))
  const total = data.reduce((s, d) => s + d.total, 0)
  const colors = ["#1f2937", "#6b7280", "#f97316"]

  return (
    <SectionCard
      title="Fixo vs Recorrente vs Variável"
      subtitle="Quanto da despesa é engessado vs eventual"
    >
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="rotulo"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={100}
              paddingAngle={2}
              label={({ percent }: { percent?: number }) => `${Math.round((percent ?? 0) * 100)}%`}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={colors[i]} stroke="rgba(0,0,0,0.2)" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              itemStyle={TOOLTIP_ITEM_STYLE}
              formatter={(v: number, name) => [`${fmtFull(v)} (${((v / total) * 100).toFixed(1)}%)`, name as string]}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} iconSize={10} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  )
}

// ============================================================================
// TOP 10 FORNECEDORES (BARRAS HORIZONTAIS)
// ============================================================================

function TopFornecedores() {
  const data = totalPorFornecedor().slice(0, 10)

  return (
    <SectionCard
      title="Top 10 fornecedores"
      subtitle="Total pago no período Ago/25–Mar/26"
    >
      <div className="h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 40, bottom: 0, left: 110 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,120,120,0.18)" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: "currentColor" }}
              stroke="rgba(120,120,120,0.4)"
              tickFormatter={(v) => `R$${(v / 1000).toFixed(1)}k`}
            />
            <YAxis
              type="category"
              dataKey="fornecedor"
              tick={{ fontSize: 11, fill: "currentColor" }}
              stroke="rgba(120,120,120,0.4)"
              width={105}
            />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              itemStyle={TOOLTIP_ITEM_STYLE}
              formatter={(v: number, _, props) => [
                `${fmtFull(v)} em ${(props.payload as { ocorrencias: number }).ocorrencias} ocorrência(s)`,
                "Total",
              ]}
            />
            <Bar dataKey="total" fill="#f97316" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  )
}

// ============================================================================
// HEATMAP TEMPORAL — CATEGORIA × MÊS
// ============================================================================

function HeatmapTemporal() {
  // Para cada categoria, valor de cada mês
  const matrix = CATEGORIAS.map((c) => {
    const valores = MESES.map((m) => {
      const sum = TRANSACOES.filter((t) => t.mes === m && t.categoriaId === c.id).reduce(
        (s, t) => s + t.valor,
        0,
      )
      return { mes: m, valor: sum }
    })
    const max = Math.max(...valores.map((v) => v.valor))
    return { categoria: c, valores, max }
  })

  // Maior valor global pra normalização
  const maxGlobal = Math.max(...matrix.flatMap((m) => m.valores.map((v) => v.valor)))

  const intensidade = (v: number) => {
    if (v === 0) return 0
    return v / maxGlobal
  }

  return (
    <SectionCard
      title="Distribuição temporal por categoria"
      subtitle="Quanto cada categoria consumiu em cada mês — quanto mais escuro, maior o gasto"
      className="lg:col-span-2"
    >
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* header com meses */}
          <div className="grid" style={{ gridTemplateColumns: "180px repeat(8, 1fr)" }}>
            <div></div>
            {MESES.map((m) => (
              <div key={m} className="text-[10px] text-center text-gray-500 dark:text-neutral-500 pb-1">
                {m}
              </div>
            ))}
          </div>
          {/* linhas */}
          {matrix.map(({ categoria, valores }) => (
            <div
              key={categoria.id}
              className="grid items-center"
              style={{ gridTemplateColumns: "180px repeat(8, 1fr)" }}
            >
              <div className="text-[11px] text-gray-700 dark:text-neutral-300 pr-2 truncate flex items-center gap-1.5">
                <span
                  className="inline-block w-2 h-2 rounded-sm shrink-0"
                  style={{ background: categoria.cor }}
                />
                {categoria.nome}
              </div>
              {valores.map((v, i) => {
                const I = intensidade(v.valor)
                return (
                  <div key={i} className="p-0.5">
                    <div
                      className="aspect-square rounded flex items-center justify-center text-[9px] font-mono transition-all hover:ring-2 hover:ring-orange-500"
                      style={{
                        background: v.valor === 0 ? "rgba(120,120,120,0.05)" : `rgba(249,115,22,${0.15 + I * 0.85})`,
                        color: I > 0.5 ? "white" : "rgb(75, 85, 99)",
                      }}
                      title={`${categoria.nome} em ${v.mes}: ${fmtFull(v.valor)}`}
                    >
                      {v.valor > 0 ? `${(v.valor / 1000).toFixed(v.valor > 999 ? 1 : 2)}k` : ""}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  )
}

// ============================================================================
// DETECTOR DE OUTLIERS
// ============================================================================

function OutliersDespesa() {
  // Para cada categoria, calcula a média dos meses em que apareceu
  // e identifica meses onde o gasto foi > 150% da média da categoria
  const data: { mes: string; categoria: string; valor: number; media: number; razao: number; cor: string }[] = []

  for (const cat of CATEGORIAS) {
    const ocorrencias = TRANSACOES.filter((t) => t.categoriaId === cat.id)
    if (ocorrencias.length < 2) continue
    const media = ocorrencias.reduce((s, t) => s + t.valor, 0) / ocorrencias.length
    for (const t of ocorrencias) {
      if (t.valor > media * 1.5) {
        data.push({
          mes: t.mes,
          categoria: cat.nome,
          valor: t.valor,
          media,
          razao: t.valor / media,
          cor: cat.cor,
        })
      }
    }
  }

  data.sort((a, b) => b.razao - a.razao)
  const top = data.slice(0, 8)

  if (top.length === 0) {
    return (
      <SectionCard title="Despesas atípicas (outliers)" subtitle="Lançamentos > 150% da média da categoria">
        <p className="text-sm text-gray-500 dark:text-neutral-500 py-8 text-center">
          Nenhum outlier identificado.
        </p>
      </SectionCard>
    )
  }

  return (
    <SectionCard
      title="Despesas atípicas (outliers)"
      subtitle="Lançamentos que excederam 150% da média da própria categoria"
    >
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={top}
            layout="vertical"
            margin={{ top: 5, right: 60, bottom: 0, left: 140 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,120,120,0.18)" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: "currentColor" }}
              stroke="rgba(120,120,120,0.4)"
              tickFormatter={(v) => `R$${(v / 1000).toFixed(1)}k`}
            />
            <YAxis
              type="category"
              dataKey={(d: { mes: string; categoria: string }) => `${d.categoria} · ${d.mes}`}
              tick={{ fontSize: 10, fill: "currentColor" }}
              stroke="rgba(120,120,120,0.4)"
              width={140}
            />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              itemStyle={TOOLTIP_ITEM_STYLE}
              formatter={(v: number, _, props) => {
                const p = props.payload as { media: number; razao: number }
                return [
                  `${fmtFull(v)} — ${p.razao.toFixed(1)}× a média (${fmt(p.media)})`,
                  "Valor do lançamento",
                ]
              }}
            />
            <Bar dataKey="valor">
              {top.map((d, i) => (
                <Cell key={i} fill={d.razao > 3 ? "#dc2626" : d.razao > 2 ? "#f97316" : "#facc15"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex gap-3 text-[10px] text-gray-500 dark:text-neutral-500 pt-1">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-yellow-400" /> 1.5–2× média
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-orange-500" /> 2–3× média
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-red-600" /> &gt; 3× média
        </span>
      </div>
    </SectionCard>
  )
}

// ============================================================================
// EXPORT — ABA COMPLETA
// ============================================================================

export default function Despesas() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <DonutCategorias />
      <DonutFixoVariavel />
      <TopFornecedores />
      <OutliersDespesa />
      <HeatmapTemporal />
    </div>
  )
}
