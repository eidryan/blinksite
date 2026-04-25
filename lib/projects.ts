// ---------------------------------------------------------------------------
// Tipos e dados de projetos — base para a rota /p/[token]
// Em produção, substituir por consulta ao banco (ex: Supabase, Prisma, etc.)
// ---------------------------------------------------------------------------

export type ProjectStatus = "active" | "completed" | "paused"

export type ProjectType = "campaign" | "condominio"

export type ProjectMetrics = {
  completionRate: number   // 0–100
  activeTasks: number
  completedTasks: number
  teamSize: number
  daysRemaining: number
}

export type Project = {
  token: string            // identificador da URL: /p/[token]
  type: ProjectType        // "campaign" ou "condominio"
  clientName: string       // "L'Oréal"
  clientSlug: string       // "loreal" (para assets, etc.)
  projectName: string      // "Campanha Digital Q2 2025"
  description: string
  status: ProjectStatus
  startDate: string        // ISO: "2025-01-15"
  endDate: string          // ISO: "2025-06-30"
  logoUrl?: string         // URL do logo do cliente (opcional)
  metrics?: ProjectMetrics  // opcional para condominio
}

// ---------------------------------------------------------------------------
// Dados mock — adicione projetos reais aqui ou conecte a um banco
// ---------------------------------------------------------------------------

const PROJECTS: Project[] = [
  {
    token: "loreal-2025-x7k",
    type: "campaign",
    clientName: "L'Oréal",
    clientSlug: "loreal",
    projectName: "Campanha Digital Q2 2025",
    description: "Estratégia e execução de campanha digital multicanal para o mercado brasileiro.",
    status: "active",
    startDate: "2025-01-15",
    endDate: "2025-06-30",
    logoUrl: "/logos/loreal.png",
    metrics: {
      completionRate: 62,
      activeTasks: 14,
      completedTasks: 31,
      teamSize: 8,
      daysRemaining: 45,
    },
  },
  {
    token: "santos-moreira-2026",
    type: "condominio",
    clientName: "Condomínio Santos Moreira",
    clientSlug: "santos-moreira",
    projectName: "Análise Financeira e Manutenção",
    description: "Análise consolidada de fluxo de caixa, despesas, receitas e planejamento de manutenção. Período: Ago/2025 – Mar/2026.",
    status: "active",
    startDate: "2025-08-01",
    endDate: "2026-03-31",
    logoUrl: "/blink-logo-light.png",
  },
  // Adicione mais projetos conforme necessário
]

// ---------------------------------------------------------------------------
// Funções de acesso
// ---------------------------------------------------------------------------

export function getProjectByToken(token: string): Project | null {
  return PROJECTS.find((p) => p.token === token) ?? null
}

export function getAllProjects(): Project[] {
  return PROJECTS
}
