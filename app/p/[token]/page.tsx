"use client"

import { useState, use } from "react"
import { notFound } from "next/navigation"
import {
  ChevronRight,
  Monitor,
  Settings,
  Shield,
  Target,
  Users,
  Bell,
  RefreshCw,
  CalendarDays,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { getProjectByToken, type Project } from "@/lib/projects"
import CommandCenterPage from "../../command-center/page"
import AgentNetworkPage from "../../agent-network/page"
import OperationsPage from "../../operations/page"
import IntelligencePage from "../../intelligence/page"
import SystemsPage from "../../systems/page"
import CondominioPage from "../../condominio/page"

// ---------------------------------------------------------------------------
// Componente de status do projeto (substitui o painel "SYSTEM ONLINE")
// ---------------------------------------------------------------------------
function ProjectStatusPanel({ project }: { project: Project }) {
  const start = new Date(project.startDate).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
  const end = new Date(project.endDate).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })

  const statusLabel: Record<Project["status"], string> = {
    active: "EM ANDAMENTO",
    completed: "CONCLUÍDO",
    paused: "PAUSADO",
  }

  const statusColor: Record<Project["status"], string> = {
    active: "bg-orange-500",
    completed: "bg-green-500",
    paused: "bg-yellow-500",
  }

  return (
    <div className="mt-8 p-4 bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded space-y-3">
      {/* status */}
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full animate-pulse ${statusColor[project.status]}`} />
        <span className="text-xs font-semibold text-gray-700 dark:text-white tracking-wider">
          {statusLabel[project.status]}
        </span>
      </div>

      <div className="text-xs text-gray-500 dark:text-neutral-500 space-y-1 font-mono">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3 h-3 text-orange-500" />
          <span>CONCLUSÃO: {project.metrics.completionRate}%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CalendarDays className="w-3 h-3 text-orange-500" />
          <span>TÉRMINO: {end}</span>
        </div>
        <div>EQUIPE: {project.metrics.teamSize} pessoas</div>
      </div>

      {/* barra de progresso */}
      <div className="w-full h-1.5 bg-gray-200 dark:bg-neutral-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-orange-500 rounded-full transition-all"
          style={{ width: `${project.metrics.completionRate}%` }}
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Banner de identificação do cliente (topo da área de conteúdo)
// ---------------------------------------------------------------------------
function ClientBanner({ project }: { project: Project }) {
  return (
    <div className="px-6 py-3 bg-orange-500/10 border-b border-orange-500/20 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {project.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={project.logoUrl} alt={project.clientName} className="h-6 object-contain" />
        ) : (
          <span className="text-sm font-bold text-orange-500 tracking-wider">{project.clientName.toUpperCase()}</span>
        )}
        <span className="text-gray-400 dark:text-neutral-500 text-xs">|</span>
        <span className="text-xs text-gray-600 dark:text-neutral-400">{project.projectName}</span>
      </div>
      <span className="text-xs text-gray-400 dark:text-neutral-500 font-mono hidden sm:block">
        ACESSO EXCLUSIVO · BLINK
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Dashboard do cliente (tipos: campaign ou condominio)
// ---------------------------------------------------------------------------
function ClientDashboard({ project }: { project: Project }) {
  // Projetos tipo "condominio" renderizam o dashboard específico do condomínio
  if (project.type === "condominio") {
    return <CondominioPage />
  }

  // Projetos tipo "campaign" renderizam o dashboard multi-seção genérico
  const [activeSection, setActiveSection] = useState("overview")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const navItems = [
    { id: "overview", icon: Monitor, label: "VISÃO GERAL" },
    { id: "agents", icon: Users, label: "EQUIPE" },
    { id: "operations", icon: Target, label: "OPERAÇÕES" },
    { id: "intelligence", icon: Shield, label: "RELATÓRIOS" },
    { id: "systems", icon: Settings, label: "SISTEMAS" },
  ]

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <div
        className={`${sidebarCollapsed ? "w-16" : "w-70"} bg-white dark:bg-neutral-900 border-r border-gray-200 dark:border-neutral-700 transition-all duration-300 fixed md:relative z-50 md:z-auto h-full`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            <div className={`${sidebarCollapsed ? "hidden" : "block"}`}>
              {/*
                LOGO BLINK — substituir pela logo SVG real.
                Versão light: escura | dark: clara
              */}
              <div className="flex flex-col gap-0.5">
                <span className="text-orange-500 font-bold text-xl tracking-widest">BLINK</span>
                <span className="text-gray-400 dark:text-neutral-500 text-xs tracking-wider">
                  {project.clientName}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-gray-400 hover:text-orange-500 dark:text-neutral-400 dark:hover:text-orange-500"
            >
              <ChevronRight
                className={`w-4 h-4 transition-transform ${sidebarCollapsed ? "" : "rotate-180"}`}
              />
            </Button>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 p-3 rounded transition-colors ${
                  activeSection === item.id
                    ? "bg-orange-500 text-white"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-800"
                }`}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!sidebarCollapsed && (
                  <span className="text-sm font-medium truncate">{item.label}</span>
                )}
              </button>
            ))}
          </nav>

          {!sidebarCollapsed && <ProjectStatusPanel project={project} />}
        </div>
      </div>

      {/* Mobile Overlay */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Toolbar */}
        <div className="h-16 bg-gray-50 dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700 flex items-center justify-between px-6 shrink-0">
          <div className="text-sm text-gray-500 dark:text-neutral-400 font-mono truncate">
            BLINK / <span className="text-orange-500">{navItems.find((i) => i.id === activeSection)?.label}</span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-xs text-gray-400 dark:text-neutral-500 font-mono hidden sm:block">
              {new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-orange-500 dark:text-neutral-400 dark:hover:text-orange-500"
            >
              <Bell className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-orange-500 dark:text-neutral-400 dark:hover:text-orange-500"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <ThemeToggle />
          </div>
        </div>

        {/* Banner do cliente */}
        <ClientBanner project={project} />

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto bg-gray-50 dark:bg-black">
          {activeSection === "overview" && <CommandCenterPage />}
          {activeSection === "agents" && <AgentNetworkPage />}
          {activeSection === "operations" && <OperationsPage />}
          {activeSection === "intelligence" && <IntelligencePage />}
          {activeSection === "systems" && <SystemsPage />}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page — valida token e renderiza o dashboard
// ---------------------------------------------------------------------------
export default function ClientDashboardPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = use(params)
  const project = getProjectByToken(token)

  if (!project) {
    notFound()
  }

  return <ClientDashboard project={project} />
}
