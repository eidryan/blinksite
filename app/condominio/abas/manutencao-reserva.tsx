"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { SectionCard } from "@/components/condominio/section-card"
import {
  META,
  RISCOS,
  reservaAcumuladaIdealVsReal,
  reservaPorCriticidade,
  calcularResumosMensais,
  type Criticidade,
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

const COR_CRITICIDADE: Record<Criticidade, string> = {
  Baixa: "#22c55e",
  Media: "#facc15",
  Alta: "#f97316",
  Critica: "#dc2626",
}

// ============================================================================
// BULLET CHART — RESERVA ATUAL vs META
// ============================================================================

function BulletReserva() {
  const resumos = calcularResumosMensais()
  const acumulado = resumos.reduce((s, r) => s + r.reservaAlocada, 0)
  const meta = META.metaReservaMensal * resumos.length
  const pct = (acumulado / meta) * 100
  const mediaMensalReservada = acumulado / resumos.length

  return (
    <SectionCard
      title="Reserva atual vs meta acumulada"
      subtitle={`Meta: ${fmt(META.metaReservaMensal)}/mês × ${resumos.length} meses = ${fmt(meta)}`}
    >
      <div className="space-y-4 py-2">
        {/* Bullet horizontal */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500 dark:text-neutral-500">Acumulado</span>
            <span className="font-mono font-bold text-gray-900 dark:text-white">{fmt(acumulado)}</span>
          </div>
          <div className="relative h-8 rounded-lg overflow-hidden bg-gray-100 dark:bg-neutral-800">
            {/* zonas de referência */}
            <div className="absolute inset-y-0 left-0 w-1/3 bg-red-500/15" />
            <div className="absolute inset-y-0 left-1/3 w-1/3 bg-yellow-500/15" />
            <div className="absolute inset-y-0 left-2/3 w-1/3 bg-green-500/15" />
            {/* barra de valor */}
            <div
              className="absolute inset-y-2 left-0 rounded bg-orange-500 transition-all"
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
            {/* marcador de meta */}
            <div className="absolute inset-y-0 right-0 w-0.5 bg-gray-900 dark:bg-white" />
          </div>
          <div className="flex justify-between text-[10px] text-gray-400 dark:text-neutral-600">
            <span>0</span>
            <span>{fmt(meta / 3)}</span>
            <span>{fmt((2 * meta) / 3)}</span>
            <span className="font-bold">{fmt(meta)} (meta)</span>
          </div>
        </div>

        {/* Métricas auxiliares */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="border-l-2 border-orange-500 pl-3">
            <div className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-neutral-500">
              Cobertura
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white font-mono">{pct.toFixed(0)}%</div>
          </div>
          <div className="border-l-2 border-blue-500 pl-3">
            <div className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-neutral-500">
              Média/mês
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white font-mono">{fmt(mediaMensalReservada)}</div>
          </div>
          <div className="border-l-2 border-red-500 pl-3">
            <div className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-neutral-500">
              Déficit
            </div>
            <div className="text-xl font-bold text-red-600 dark:text-red-400 font-mono">
              {fmt(Math.max(0, meta - acumulado))}
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  )
}

// ============================================================================
// TIMELINE GANTT — 36 MESES DE MANUTENÇÕES
// ============================================================================

function TimelineManutencoes() {
  const HORIZONTE_MESES = 36

  // Para cada risco, calcula em quais meses haverá ocorrência (assumindo que
  // o ciclo começa "agora" — mês 0 = Abr/26)
  const ocorrenciasPorRisco = RISCOS.map((r) => {
    const freqMatch = r.frequencia.match(/(\d+)\s*ano/)
    const freqAnos = freqMatch ? parseInt(freqMatch[1]) : 0
    const freqMeses = freqAnos * 12
    const ocorrencias: number[] = []
    if (r.frequencia === "Contínua") {
      // contínua: marca todos os meses com baixa intensidade
      for (let m = 0; m < HORIZONTE_MESES; m++) ocorrencias.push(m)
    } else if (freqMeses > 0) {
      for (let m = freqMeses; m <= HORIZONTE_MESES; m += freqMeses) ocorrencias.push(m)
    }
    return { risco: r, ocorrencias, freqMeses }
  })

  // Labels de mês para o eixo
  const labels: string[] = []
  const baseDate = new Date(2026, 3, 1) // Abr/26
  for (let m = 0; m <= HORIZONTE_MESES; m += 6) {
    const d = new Date(baseDate)
    d.setMonth(d.getMonth() + m)
    labels.push(
      d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }).replace(".", ""),
    )
  }

  return (
    <SectionCard
      title="Calendário de manutenções (36 meses)"
      subtitle="Quando cada categoria do mapa de risco vai precisar de obra/serviço — bola colorida pela criticidade, tamanho pelo custo"
      className="lg:col-span-2"
    >
      <div className="overflow-x-auto">
        <div className="min-w-[700px] space-y-1">
          {/* eixo de tempo */}
          <div className="grid items-end" style={{ gridTemplateColumns: "180px 1fr" }}>
            <div></div>
            <div className="grid grid-cols-6 text-[10px] text-gray-500 dark:text-neutral-500">
              {labels.slice(0, 6).map((l, i) => (
                <div key={i} className="text-left">
                  {l}
                </div>
              ))}
            </div>
          </div>

          {ocorrenciasPorRisco.map(({ risco, ocorrencias }) => {
            const cor = COR_CRITICIDADE[risco.criticidade]
            // tamanho de bola normalizado (4px–24px)
            const maxCusto = 35000
            const sizePx = Math.max(8, Math.min(24, (risco.custoEstimado / maxCusto) * 24))

            return (
              <div
                key={risco.categoria}
                className="grid items-center hover:bg-gray-50 dark:hover:bg-neutral-800/50 rounded transition-colors"
                style={{ gridTemplateColumns: "180px 1fr" }}
              >
                <div className="text-[11px] text-gray-700 dark:text-neutral-300 truncate pr-2 flex items-center gap-1.5">
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: cor }}
                  />
                  <span className="truncate" title={risco.categoria}>{risco.categoria}</span>
                </div>
                <div className="relative h-7 bg-gray-100 dark:bg-neutral-900 rounded overflow-hidden">
                  {/* linhas verticais a cada 12 meses */}
                  {[12, 24, 36].map((m) => (
                    <div
                      key={m}
                      className="absolute top-0 bottom-0 w-px bg-gray-300 dark:bg-neutral-700"
                      style={{ left: `${(m / HORIZONTE_MESES) * 100}%` }}
                    />
                  ))}
                  {/* ocorrências */}
                  {risco.frequencia === "Contínua" ? (
                    <div
                      className="absolute inset-y-2 left-0 right-0 rounded opacity-40"
                      style={{ background: cor }}
                      title={`${risco.categoria} — contínua, ${fmt(risco.custoEstimado)} estimado`}
                    />
                  ) : (
                    ocorrencias.map((m, i) => (
                      <div
                        key={i}
                        className="absolute top-1/2 -translate-y-1/2 rounded-full transition-transform hover:scale-150 cursor-default"
                        style={{
                          left: `calc(${(m / HORIZONTE_MESES) * 100}% - ${sizePx / 2}px)`,
                          width: sizePx,
                          height: sizePx,
                          background: cor,
                          border: "1.5px solid white",
                        }}
                        title={`${risco.categoria} em mês ${m} (~${Math.floor(m / 12)}a${m % 12}m): ${fmt(risco.custoEstimado)}`}
                      />
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* legenda */}
      <div className="flex flex-wrap gap-3 text-[10px] text-gray-500 dark:text-neutral-500 pt-2 border-t border-gray-200 dark:border-neutral-800">
        {(Object.keys(COR_CRITICIDADE) as Criticidade[]).map((c) => (
          <span key={c} className="flex items-center gap-1">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: COR_CRITICIDADE[c] }}
            />
            {c}
          </span>
        ))}
        <span className="ml-auto italic">Tamanho da bola = custo estimado</span>
      </div>
    </SectionCard>
  )
}

// ============================================================================
// BARRAS — 14 RISCOS vs MENSAL AMORTIZADO
// ============================================================================

function BarrasRiscos() {
  const data = [...RISCOS]
    .sort((a, b) => b.mensalAmortizado - a.mensalAmortizado)
    .map((r) => ({
      categoria: r.categoria.length > 28 ? r.categoria.slice(0, 26) + "…" : r.categoria,
      categoriaFull: r.categoria,
      mensal: r.mensalAmortizado,
      custo: r.custoEstimado,
      criticidade: r.criticidade,
    }))

  return (
    <SectionCard
      title="Reserva mensal exigida por categoria de risco"
      subtitle={`Soma das 14 categorias = ${fmt(META.metaReservaMensal)}/mês`}
    >
      <div className="h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 60, bottom: 0, left: 150 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,120,120,0.18)" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: "currentColor" }}
              stroke="rgba(120,120,120,0.4)"
              tickFormatter={(v) => `R$${v}`}
            />
            <YAxis
              type="category"
              dataKey="categoria"
              tick={{ fontSize: 10, fill: "currentColor" }}
              stroke="rgba(120,120,120,0.4)"
              width={150}
            />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              itemStyle={TOOLTIP_ITEM_STYLE}
              formatter={(v: number, _, props) => {
                const p = props.payload as { custo: number; criticidade: string; categoriaFull: string }
                return [
                  `${fmt(v)}/mês · custo total ${fmt(p.custo)} · criticidade ${p.criticidade}`,
                  p.categoriaFull,
                ]
              }}
            />
            <Bar dataKey="mensal">
              {data.map((d, i) => (
                <Cell key={i} fill={COR_CRITICIDADE[d.criticidade as Criticidade]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  )
}

// ============================================================================
// ÁREA — ACUMULAÇÃO IDEAL vs REAL DE RESERVA
// ============================================================================

function AreaAcumulacao() {
  const data = reservaAcumuladaIdealVsReal()

  return (
    <SectionCard
      title="Acumulação de reserva — real vs ideal"
      subtitle={`Ideal: ${fmt(META.metaReservaMensal)}/mês acumulado linearmente`}
    >
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="grad-ideal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="grad-real" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
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
            />
            <Legend wrapperStyle={{ fontSize: 11 }} iconSize={10} />
            <Area
              type="monotone"
              dataKey="ideal"
              name="Ideal"
              stroke="#3b82f6"
              fill="url(#grad-ideal)"
              strokeWidth={2}
              strokeDasharray="4 4"
            />
            <Area
              type="monotone"
              dataKey="real"
              name="Real"
              stroke="#f97316"
              fill="url(#grad-real)"
              strokeWidth={2.5}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  )
}

// ============================================================================
// STACKED — RESERVA POR CRITICIDADE
// ============================================================================

function StackedCriticidade() {
  const data = reservaPorCriticidade()
  const total = data.reduce((s, d) => s + d.total, 0)

  return (
    <SectionCard
      title="Composição da reserva mensal por criticidade"
      subtitle="Onde a meta de R$ 1.572/mês está alocada"
    >
      <div className="space-y-3 py-3">
        <div className="h-10 rounded-lg overflow-hidden flex">
          {data.map((d) => {
            const w = (d.total / total) * 100
            return (
              <div
                key={d.criticidade}
                className="flex items-center justify-center text-[10px] text-white font-bold transition-all hover:brightness-110"
                style={{
                  width: `${w}%`,
                  background: COR_CRITICIDADE[d.criticidade],
                }}
                title={`${d.criticidade}: ${fmt(d.total)} (${w.toFixed(1)}%)`}
              >
                {w > 8 ? `${w.toFixed(0)}%` : ""}
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {data.map((d) => (
            <div
              key={d.criticidade}
              className="p-2 rounded border border-gray-200 dark:border-neutral-800"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: COR_CRITICIDADE[d.criticidade] }}
                />
                <span className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-neutral-500">
                  {d.criticidade}
                </span>
              </div>
              <div className="text-base font-bold text-gray-900 dark:text-white font-mono">
                {fmt(d.total)}
              </div>
              <div className="text-[10px] text-gray-400 dark:text-neutral-600">
                {((d.total / total) * 100).toFixed(1)}% da meta
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  )
}

// ============================================================================
// EXPORT — ABA COMPLETA
// ============================================================================

export default function ManutencaoReserva() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <BulletReserva />
      <StackedCriticidade />
      <BarrasRiscos />
      <AreaAcumulacao />
      <TimelineManutencoes />
    </div>
  )
}
