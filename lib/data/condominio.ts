// ============================================================================
// CONDOMÍNIO SANTOS MOREIRA — Base de dados tipada para o dashboard
// ----------------------------------------------------------------------------
// Fontes:
//   - entrega_executada_v2/docs/17_MATRIZ_DE_RASTREABILIDADE.csv
//   - entrega_executada_v2/docs/16_BASE_DE_FORNECEDORES.csv
//   - entrega_executada_v2/docs/18_MAPA_DE_RISCOS_EXTRAIDO.csv
//   - fotos_manuscritos/manuscritos_transcricao.csv
//
// Período principal: Ago/2025 → Mar/2026 (8 meses)
// Período comparativo histórico: Mai-Jul/2020 e Set/2024-Jan/2025
//
// Premissas:
//   - 6 unidades × R$700/mês = R$4.200 receita mensal (sem dados reais
//     de inadimplência — assumimos pleno recebimento)
//   - Saldo inicial Ago/25 = R$1.500 (estimado a partir do briefing)
//   - Meta de reserva = R$1.572/mês (do mapa de riscos)
// ============================================================================

// ----------------------------------------------------------------------------
// TIPOS
// ----------------------------------------------------------------------------

export type CategoriaTipo = "fixo_mensal" | "fixo_recorrente" | "variavel"

export type Categoria = {
  id: string
  nome: string
  tipo: CategoriaTipo
  cor: string
}

export type Fornecedor = {
  nome: string
  totalObservado: number
  ocorrencias: number
  perfil: "Recorrente" | "Ocasional"
}

export type Transacao = {
  id: string
  mes: string // "Ago/25"
  mesIdx: number // 0–7
  categoriaId: string
  fornecedor: string
  valor: number
  statusComprovante: "validado" | "pendente"
}

export type ResumoMensal = {
  mes: string
  mesIdx: number
  receita: number
  despesa: number
  saldoInicial: number
  saldoFinal: number
  reservaAlocada: number
  caixaLivre: number
  resultado: number // receita - despesa
  status: "verde" | "amarelo" | "vermelho"
}

export type RiscoManutencao = {
  categoria: string
  exemplos: string
  frequencia: string
  custoEstimado: number
  mensalAmortizado: number
  criticidade: "Baixa" | "Media" | "Alta" | "Critica"
}

export type Criticidade = "Baixa" | "Media" | "Alta" | "Critica"

export type ManuscritoHistorico = {
  periodo: string
  era: "2020" | "2024-2025"
  saldoInicial: number
  totalDebito: number
  totalCredito: number
  saldoFinal: number
  confianca: "alta" | "media" | "baixa"
}

export type Unidade = {
  id: string // "101", "102", "201", etc
  nome: string
  // dados de pagamento ainda não disponíveis — placeholder
  statusPagamento: "em_dia" | "atrasado" | "sem_dado"
}

// ----------------------------------------------------------------------------
// METADADOS
// ----------------------------------------------------------------------------

export const META = {
  condominio: "Edifício Santos Moreira",
  unidades: 6,
  contribuicaoMensal: 700,
  receitaMensal: 4200,
  saldoInicialAgo25: 1500,
  metaReservaMensal: 1572,
  periodoInicio: "Ago/2025",
  periodoFim: "Mar/2026",
} as const

// ----------------------------------------------------------------------------
// CATEGORIAS (com cores da paleta Blink — laranja como acento)
// ----------------------------------------------------------------------------

export const CATEGORIAS: Categoria[] = [
  { id: "agua", nome: "Água", tipo: "fixo_mensal", cor: "#3b82f6" },
  { id: "luz", nome: "Luz", tipo: "fixo_mensal", cor: "#facc15" },
  { id: "contadora", nome: "Contadora", tipo: "fixo_mensal", cor: "#a78bfa" },
  { id: "servicos_jd", nome: "Serviços (João/Douglas)", tipo: "fixo_mensal", cor: "#22c55e" },
  { id: "interfone", nome: "Interfone", tipo: "fixo_mensal", cor: "#06b6d4" },
  { id: "seguro", nome: "Seguro do Prédio", tipo: "fixo_recorrente", cor: "#8b5cf6" },
  { id: "material", nome: "Material / Limpeza", tipo: "fixo_recorrente", cor: "#10b981" },
  { id: "dedetizacao", nome: "Dedetização", tipo: "variavel", cor: "#f97316" },
  { id: "vistogas", nome: "Vistoria de Gás", tipo: "variavel", cor: "#ef4444" },
  { id: "chaveiro", nome: "Chaveiro", tipo: "variavel", cor: "#64748b" },
  { id: "cameras", nome: "Câmeras", tipo: "variavel", cor: "#ec4899" },
  { id: "eletrico", nome: "Serviços Elétricos", tipo: "variavel", cor: "#eab308" },
  { id: "joao_acumulado", nome: "João — Acumulados", tipo: "variavel", cor: "#84cc16" },
  { id: "blink", nome: "Apoio Administrativo (Blink)", tipo: "variavel", cor: "#f59e0b" },
]

// ----------------------------------------------------------------------------
// FORNECEDORES (do CSV 16)
// ----------------------------------------------------------------------------

export const FORNECEDORES: Fornecedor[] = [
  { nome: "Aguas do Rio", totalObservado: 10008.7, ocorrencias: 6, perfil: "Recorrente" },
  { nome: "Joao/Douglas", totalObservado: 8222.0, ocorrencias: 8, perfil: "Recorrente" },
  { nome: "Contadora", totalObservado: 1440.0, ocorrencias: 8, perfil: "Recorrente" },
  { nome: "Bradesco", totalObservado: 1232.67, ocorrencias: 5, perfil: "Recorrente" },
  { nome: "Joao", totalObservado: 1285.0, ocorrencias: 2, perfil: "Ocasional" },
  { nome: "Bio Control", totalObservado: 1750.0, ocorrencias: 2, perfil: "Ocasional" },
  { nome: "Servicos eletricos", totalObservado: 895.39, ocorrencias: 2, perfil: "Ocasional" },
  { nome: "Blink", totalObservado: 864.67, ocorrencias: 1, perfil: "Ocasional" },
  { nome: "Light", totalObservado: 818.29, ocorrencias: 6, perfil: "Recorrente" },
  { nome: "Interfone / operadora", totalObservado: 672.93, ocorrencias: 7, perfil: "Recorrente" },
  { nome: "Material / limpeza", totalObservado: 653.56, ocorrencias: 5, perfil: "Recorrente" },
  { nome: "Fornecedor cameras", totalObservado: 432.45, ocorrencias: 1, perfil: "Ocasional" },
  { nome: "Vistogas", totalObservado: 350.0, ocorrencias: 1, perfil: "Ocasional" },
  { nome: "Chaveiro", totalObservado: 165.7, ocorrencias: 1, perfil: "Ocasional" },
]

// ----------------------------------------------------------------------------
// TRANSAÇÕES (matriz de rastreabilidade — 55 lançamentos)
// ----------------------------------------------------------------------------

export const MESES = [
  "Ago/25", "Set/25", "Out/25", "Nov/25", "Dez/25", "Jan/26", "Fev/26", "Mar/26",
] as const

export type Mes = typeof MESES[number]

const t = (
  id: string,
  mes: Mes,
  categoriaId: string,
  fornecedor: string,
  valor: number,
  statusComprovante: "validado" | "pendente" = "pendente",
): Transacao => ({
  id,
  mes,
  mesIdx: MESES.indexOf(mes),
  categoriaId,
  fornecedor,
  valor,
  statusComprovante,
})

export const TRANSACOES: Transacao[] = [
  // AGO/25
  t("TR-0001", "Ago/25", "agua", "Aguas do Rio", 1078.47),
  t("TR-0002", "Ago/25", "contadora", "Contadora", 180.0),
  t("TR-0003", "Ago/25", "dedetizacao", "Bio Control", 500.0),
  t("TR-0004", "Ago/25", "interfone", "Interfone / operadora", 81.0),
  t("TR-0005", "Ago/25", "luz", "Light", 114.0),
  t("TR-0006", "Ago/25", "material", "Material / limpeza", 49.0),
  t("TR-0007", "Ago/25", "servicos_jd", "Joao/Douglas", 965.0),

  // SET/25
  t("TR-0008", "Set/25", "agua", "Aguas do Rio", 1078.47),
  t("TR-0009", "Set/25", "contadora", "Contadora", 180.0),
  t("TR-0010", "Set/25", "interfone", "Interfone / operadora", 80.0),
  t("TR-0011", "Set/25", "luz", "Light", 120.65),
  t("TR-0012", "Set/25", "material", "Material / limpeza", 72.48),
  t("TR-0013", "Set/25", "seguro", "Bradesco", 246.52),
  t("TR-0014", "Set/25", "servicos_jd", "Joao/Douglas", 963.0),
  t("TR-0015", "Set/25", "vistogas", "Vistogas", 350.0),

  // OUT/25
  t("TR-0016", "Out/25", "agua", "Aguas do Rio", 1078.47),
  t("TR-0017", "Out/25", "contadora", "Contadora", 180.0),
  t("TR-0018", "Out/25", "interfone", "Interfone / operadora", 80.0),
  t("TR-0019", "Out/25", "luz", "Light", 119.34),
  t("TR-0020", "Out/25", "servicos_jd", "Joao/Douglas", 963.0),
  t("TR-0021", "Out/25", "eletrico", "Servicos eletricos", 140.0),

  // NOV/25
  t("TR-0022", "Nov/25", "agua", "Aguas do Rio", 1078.47),
  t("TR-0023", "Nov/25", "contadora", "Contadora", 180.0),
  t("TR-0024", "Nov/25", "luz", "Light", 116.35),
  t("TR-0025", "Nov/25", "seguro", "Bradesco", 246.52),
  t("TR-0026", "Nov/25", "servicos_jd", "Joao/Douglas", 963.0),

  // DEZ/25
  t("TR-0027", "Dez/25", "agua", "Aguas do Rio", 1078.47),
  t("TR-0028", "Dez/25", "chaveiro", "Chaveiro", 165.7),
  t("TR-0029", "Dez/25", "contadora", "Contadora", 180.0),
  t("TR-0030", "Dez/25", "dedetizacao", "Bio Control", 1250.0),
  t("TR-0031", "Dez/25", "interfone", "Interfone / operadora", 188.81),
  t("TR-0032", "Dez/25", "joao_acumulado", "Joao", 800.0),
  t("TR-0033", "Dez/25", "luz", "Light", 113.97),
  t("TR-0034", "Dez/25", "material", "Material / limpeza", 211.2),
  t("TR-0035", "Dez/25", "seguro", "Bradesco", 245.84),
  t("TR-0036", "Dez/25", "servicos_jd", "Joao/Douglas", 963.0),

  // JAN/26
  t("TR-0037", "Jan/26", "contadora", "Contadora", 180.0),
  t("TR-0038", "Jan/26", "interfone", "Interfone / operadora", 80.0),
  t("TR-0039", "Jan/26", "joao_acumulado", "Joao", 485.0),
  t("TR-0040", "Jan/26", "luz", "Light", 233.98),
  t("TR-0041", "Jan/26", "material", "Material / limpeza", 260.46),
  t("TR-0042", "Jan/26", "seguro", "Bradesco", 245.64),
  t("TR-0043", "Jan/26", "servicos_jd", "Joao/Douglas", 980.0),

  // FEV/26
  t("TR-0044", "Fev/26", "agua", "Aguas do Rio", 4616.35), // 4 faturas antecipadas
  t("TR-0045", "Fev/26", "contadora", "Contadora", 180.0),
  t("TR-0046", "Fev/26", "interfone", "Interfone / operadora", 83.12),
  t("TR-0047", "Fev/26", "seguro", "Bradesco", 248.15),
  t("TR-0048", "Fev/26", "servicos_jd", "Joao/Douglas", 1455.0),

  // MAR/26
  t("TR-0049", "Mar/26", "blink", "Blink", 864.67),
  t("TR-0050", "Mar/26", "cameras", "Fornecedor cameras", 432.45),
  t("TR-0051", "Mar/26", "contadora", "Contadora", 180.0),
  t("TR-0052", "Mar/26", "interfone", "Interfone / operadora", 80.0),
  t("TR-0053", "Mar/26", "material", "Material / limpeza", 60.42),
  t("TR-0054", "Mar/26", "servicos_jd", "Joao/Douglas", 970.0),
  t("TR-0055", "Mar/26", "eletrico", "Servicos eletricos", 755.39),
]

// ----------------------------------------------------------------------------
// MAPA DE RISCOS (CSV 18)
// ----------------------------------------------------------------------------

export const RISCOS: RiscoManutencao[] = [
  { categoria: "Poda de árvores", exemplos: "Áreas comuns", frequencia: "1 ano", custoEstimado: 1000, mensalAmortizado: 83, criticidade: "Baixa" },
  { categoria: "Limpeza caixa d'água", exemplos: "Obrigatório por lei (5.591)", frequencia: "1 ano", custoEstimado: 500, mensalAmortizado: 42, criticidade: "Media" },
  { categoria: "Limpeza calhas e rufos", exemplos: "Prevenção infiltração", frequencia: "1 ano", custoEstimado: 650, mensalAmortizado: 54, criticidade: "Media" },
  { categoria: "Pintura áreas comuns", exemplos: "Escadas, hall, garagem", frequencia: "3 anos", custoEstimado: 8000, mensalAmortizado: 222, criticidade: "Media" },
  { categoria: "Revisão SPDA / para-raios", exemplos: "ABNT NBR 5419", frequencia: "3 anos", custoEstimado: 2250, mensalAmortizado: 63, criticidade: "Alta" },
  { categoria: "Pintura de fachada", exemplos: "Inclui andaime", frequencia: "5 anos", custoEstimado: 20000, mensalAmortizado: 333, criticidade: "Alta" },
  { categoria: "Impermeabilização laje/telhado", exemplos: "Evita infiltração estrutural", frequencia: "7 anos", custoEstimado: 16000, mensalAmortizado: 190, criticidade: "Alta" },
  { categoria: "Câmeras / interfone", exemplos: "Substituição equipamentos", frequencia: "8 anos", custoEstimado: 4500, mensalAmortizado: 47, criticidade: "Baixa" },
  { categoria: "Bomba d'água", exemplos: "Substituição motobomba", frequencia: "10 anos", custoEstimado: 3500, mensalAmortizado: 29, criticidade: "Media" },
  { categoria: "Portão eletrônico", exemplos: "Motor, trilho, automação", frequencia: "12 anos", custoEstimado: 7500, mensalAmortizado: 52, criticidade: "Media" },
  { categoria: "Reforma sistema elétrico", exemplos: "Quadros, fiação, disjuntores", frequencia: "10 anos", custoEstimado: 15000, mensalAmortizado: 125, criticidade: "Alta" },
  { categoria: "Reforma hidráulica", exemplos: "Tubulação, registros, esgoto", frequencia: "10 anos", custoEstimado: 22500, mensalAmortizado: 188, criticidade: "Alta" },
  { categoria: "Retrofit de fachada", exemplos: "Risco de queda de revestimento", frequencia: "15 anos", custoEstimado: 35000, mensalAmortizado: 194, criticidade: "Critica" },
  { categoria: "Reserva emergencial estrutural", exemplos: "Obras não previstas", frequencia: "Contínua", custoEstimado: 30000, mensalAmortizado: 150, criticidade: "Critica" },
]

// ----------------------------------------------------------------------------
// HISTÓRICO MANUSCRITOS (Era 2020 e Era 2024-2025)
// ----------------------------------------------------------------------------

export const MANUSCRITOS: ManuscritoHistorico[] = [
  { periodo: "Mai/2020", era: "2020", saldoInicial: 17082.69, totalDebito: 3360.08, totalCredito: 3051.24, saldoFinal: 16773.85, confianca: "media" },
  { periodo: "Jun/2020", era: "2020", saldoInicial: 16773.85, totalDebito: 3159.49, totalCredito: 3033.54, saldoFinal: 16647.9, confianca: "media" },
  { periodo: "Jul/2020", era: "2020", saldoInicial: 16647.9, totalDebito: 4728.03, totalCredito: 3083.29, saldoFinal: 15002.95, confianca: "baixa" },
  { periodo: "Set/2024", era: "2024-2025", saldoInicial: 1081.13, totalDebito: 6430.47, totalCredito: 7750.0, saldoFinal: 2400.66, confianca: "alta" },
  { periodo: "Out/2024", era: "2024-2025", saldoInicial: 2400.66, totalDebito: 5535.2, totalCredito: 4200.0, saldoFinal: 1065.46, confianca: "media" },
  { periodo: "Nov/2024", era: "2024-2025", saldoInicial: 1065.46, totalDebito: 4691.2, totalCredito: 4200.0, saldoFinal: 574.26, confianca: "alta" },
  { periodo: "Dez/2024", era: "2024-2025", saldoInicial: 574.26, totalDebito: 5623.73, totalCredito: 5180.0, saldoFinal: 130.53, confianca: "alta" },
  { periodo: "Jan/2025", era: "2024-2025", saldoInicial: 130.53, totalDebito: 2666.35, totalCredito: 4200.0, saldoFinal: 1664.18, confianca: "alta" },
]

// ----------------------------------------------------------------------------
// UNIDADES (placeholder — sem dados reais de pagamento)
// ----------------------------------------------------------------------------

export const UNIDADES: Unidade[] = [
  { id: "101", nome: "Apt 101", statusPagamento: "sem_dado" },
  { id: "102", nome: "Apt 102", statusPagamento: "sem_dado" },
  { id: "201", nome: "Apt 201", statusPagamento: "sem_dado" },
  { id: "202", nome: "Apt 202", statusPagamento: "sem_dado" },
  { id: "301", nome: "Apt 301", statusPagamento: "sem_dado" },
  { id: "302", nome: "Apt 302", statusPagamento: "sem_dado" },
]

// ============================================================================
// SELETORES / AGREGAÇÕES
// ============================================================================

/** Mapa rápido de categoria por id */
export const CATEGORIA_BY_ID: Record<string, Categoria> = Object.fromEntries(
  CATEGORIAS.map((c) => [c.id, c]),
)

/** Soma das despesas de um mês */
export function despesaDoMes(mes: Mes): number {
  return TRANSACOES.filter((t) => t.mes === mes).reduce((s, t) => s + t.valor, 0)
}

/** Soma de despesas por categoria em um mês */
export function despesaMesPorCategoria(mes: Mes): Record<string, number> {
  const out: Record<string, number> = {}
  for (const t of TRANSACOES.filter((t) => t.mes === mes)) {
    out[t.categoriaId] = (out[t.categoriaId] ?? 0) + t.valor
  }
  return out
}

/** Soma de despesas por tipo (fixo_mensal, fixo_recorrente, variavel) num mês */
export function despesaMesPorTipo(mes: Mes): Record<CategoriaTipo, number> {
  const out: Record<CategoriaTipo, number> = {
    fixo_mensal: 0,
    fixo_recorrente: 0,
    variavel: 0,
  }
  for (const t of TRANSACOES.filter((t) => t.mes === mes)) {
    const tipo = CATEGORIA_BY_ID[t.categoriaId]?.tipo
    if (tipo) out[tipo] += t.valor
  }
  return out
}

/** Resumo financeiro mês a mês com saldo rolante */
export function calcularResumosMensais(): ResumoMensal[] {
  let saldo = META.saldoInicialAgo25
  return MESES.map((mes, idx) => {
    const receita = META.receitaMensal
    const despesa = despesaDoMes(mes)
    const resultado = receita - despesa
    const saldoInicial = saldo
    saldo += resultado
    const saldoFinal = saldo

    // Heurística de status: verde se sobrou ≥ meta de reserva; amarelo se sobra
    // positiva mas abaixo da meta; vermelho se déficit.
    let status: "verde" | "amarelo" | "vermelho" = "verde"
    if (resultado < 0) status = "vermelho"
    else if (resultado < META.metaReservaMensal) status = "amarelo"

    // Reserva alocada = mínimo entre o resultado positivo e a meta
    const reservaAlocada = Math.max(0, Math.min(resultado, META.metaReservaMensal))
    const caixaLivre = Math.max(0, saldoFinal - reservaAlocada)

    return {
      mes,
      mesIdx: idx,
      receita,
      despesa,
      saldoInicial,
      saldoFinal,
      reservaAlocada,
      caixaLivre,
      resultado,
      status,
    }
  })
}

/** Total gasto por fornecedor no período (rankeado desc) */
export function totalPorFornecedor(): { fornecedor: string; total: number; ocorrencias: number }[] {
  const map = new Map<string, { total: number; ocorrencias: number }>()
  for (const t of TRANSACOES) {
    const cur = map.get(t.fornecedor) ?? { total: 0, ocorrencias: 0 }
    cur.total += t.valor
    cur.ocorrencias += 1
    map.set(t.fornecedor, cur)
  }
  return [...map.entries()]
    .map(([fornecedor, v]) => ({ fornecedor, ...v }))
    .sort((a, b) => b.total - a.total)
}

/** Total gasto por categoria no período */
export function totalPorCategoria(): { categoriaId: string; nome: string; total: number; cor: string }[] {
  const map = new Map<string, number>()
  for (const t of TRANSACOES) {
    map.set(t.categoriaId, (map.get(t.categoriaId) ?? 0) + t.valor)
  }
  return [...map.entries()]
    .map(([id, total]) => {
      const cat = CATEGORIA_BY_ID[id]
      return { categoriaId: id, nome: cat?.nome ?? id, total, cor: cat?.cor ?? "#888" }
    })
    .sort((a, b) => b.total - a.total)
}

/** Total fixo vs recorrente vs variável no período */
export function totalPorTipo(): { tipo: CategoriaTipo; total: number; rotulo: string }[] {
  const out: Record<CategoriaTipo, number> = {
    fixo_mensal: 0,
    fixo_recorrente: 0,
    variavel: 0,
  }
  for (const t of TRANSACOES) {
    const tipo = CATEGORIA_BY_ID[t.categoriaId]?.tipo
    if (tipo) out[tipo] += t.valor
  }
  return [
    { tipo: "fixo_mensal", total: out.fixo_mensal, rotulo: "Fixo Mensal" },
    { tipo: "fixo_recorrente", total: out.fixo_recorrente, rotulo: "Fixo Recorrente" },
    { tipo: "variavel", total: out.variavel, rotulo: "Variável" },
  ]
}

/** Custo médio mensal no período (8 meses) */
export function custoMedioMensal(): number {
  const total = TRANSACOES.reduce((s, t) => s + t.valor, 0)
  return total / MESES.length
}

/** Custo médio mensal por era (para comparativo 2020 vs 2025) */
export function custoMedioPorEra(): { era: string; media: number; n: number }[] {
  const agrupado = new Map<string, number[]>()
  for (const m of MANUSCRITOS) {
    const arr = agrupado.get(m.era) ?? []
    arr.push(m.totalDebito)
    agrupado.set(m.era, arr)
  }
  const out: { era: string; media: number; n: number }[] = []
  for (const [era, arr] of agrupado) {
    out.push({ era, media: arr.reduce((s, v) => s + v, 0) / arr.length, n: arr.length })
  }
  // adiciona "Ago/25–Mar/26" do período principal
  out.push({ era: "Ago/25–Mar/26", media: custoMedioMensal(), n: MESES.length })
  return out
}

/** Detector simples de outliers: despesas mensais que excedem média + 50% */
export function outliersDespesa(): { mes: Mes; valor: number; media: number; razao: number }[] {
  const resumos = calcularResumosMensais()
  const media = resumos.reduce((s, r) => s + r.despesa, 0) / resumos.length
  const limite = media * 1.5
  return resumos
    .filter((r) => r.despesa > limite)
    .map((r) => ({
      mes: r.mes as Mes,
      valor: r.despesa,
      media,
      razao: r.despesa / media,
    }))
}

/** Cobertura: quantos meses o saldo atual cobriria do custo médio */
export function mesesDeCobertura(): number {
  const resumos = calcularResumosMensais()
  const saldoFinal = resumos[resumos.length - 1].saldoFinal
  return saldoFinal / custoMedioMensal()
}

/** Reserva ideal acumulada: meta × meses decorridos */
export function reservaAcumuladaIdealVsReal(): { mes: Mes; ideal: number; real: number }[] {
  const resumos = calcularResumosMensais()
  let realAcum = 0
  return resumos.map((r, i) => {
    realAcum += r.reservaAlocada
    return {
      mes: r.mes as Mes,
      ideal: META.metaReservaMensal * (i + 1),
      real: realAcum,
    }
  })
}

/** Total mensal amortizado por criticidade (mapa de riscos) */
export function reservaPorCriticidade(): { criticidade: Criticidade; total: number }[] {
  const map = new Map<Criticidade, number>()
  for (const r of RISCOS) {
    map.set(r.criticidade, (map.get(r.criticidade) ?? 0) + r.mensalAmortizado)
  }
  const ordem: Criticidade[] = ["Critica", "Alta", "Media", "Baixa"]
  return ordem
    .filter((c) => map.has(c))
    .map((c) => ({ criticidade: c, total: map.get(c) ?? 0 }))
}
