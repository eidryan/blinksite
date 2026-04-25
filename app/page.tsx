"use client"

import { useState } from "react"
import { ChevronRight, Monitor, Settings, Shield, Target, Users, Bell, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import CommandCenterPage from "./command-center/page"
import AgentNetworkPage from "./agent-network/page"
import OperationsPage from "./operations/page"
import IntelligencePage from "./intelligence/page"
import SystemsPage from "./systems/page"

export default function TacticalDashboard() {
  const [activeSection, setActiveSection] = useState("overview")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <div
        className={`${sidebarCollapsed ? "w-16" : "w-70"} bg-white dark:bg-neutral-900 border-r border-gray-200 dark:border-neutral-700 transition-all duration-300 fixed md:relative z-50 md:z-auto h-full md:h-auto ${!sidebarCollapsed ? "md:block" : ""}`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            <div className={`${sidebarCollapsed ? "hidden" : "block"}`}>
              {/*
                LOGO BLINK — substituir este bloco pela logo SVG real da Blink.
                Versão light: logo escura | Versão dark: logo clara/branca
              */}
              <div className="flex flex-col gap-0.5">
                <span className="text-orange-500 font-bold text-xl tracking-widest">BLINK</span>
                <span className="text-gray-400 dark:text-neutral-500 text-xs tracking-wider">DASHBOARD</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-gray-400 hover:text-orange-500 dark:text-neutral-400 dark:hover:text-orange-500"
            >
              <ChevronRight
                className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${sidebarCollapsed ? "" : "rotate-180"}`}
              />
            </Button>
          </div>

          <nav className="space-y-2">
            {[
              { id: "overview", icon: Monitor, label: "COMMAND CENTER" },
              { id: "agents", icon: Users, label: "AGENT NETWORK" },
              { id: "operations", icon: Target, label: "OPERATIONS" },
              { id: "intelligence", icon: Shield, label: "INTELLIGENCE" },
              { id: "systems", icon: Settings, label: "SYSTEMS" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 p-3 rounded transition-colors ${
                  activeSection === item.id
                    ? "bg-orange-500 text-white"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-800"
                }`}
              >
                <item.icon className="w-5 h-5 md:w-5 md:h-5 sm:w-6 sm:h-6" />
                {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            ))}
          </nav>

          {!sidebarCollapsed && (
            <div className="mt-8 p-4 bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-700 dark:text-white font-medium">SISTEMA ONLINE</span>
              </div>
              <div className="text-xs text-gray-500 dark:text-neutral-500 space-y-0.5">
                <div>UPTIME: 72:14:33</div>
                <div>AGENTES: 847 ATIVOS</div>
                <div>MISSÕES: 23 EM CURSO</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Overlay */}
      {!sidebarCollapsed && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarCollapsed(true)} />
      )}

      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${!sidebarCollapsed ? "md:ml-0" : ""}`}>
        {/* Top Toolbar */}
        <div className="h-16 bg-gray-50 dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500 dark:text-neutral-400 font-mono">
              BLINK / <span className="text-orange-500">OVERVIEW</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-gray-400 dark:text-neutral-500 font-mono hidden sm:block">
              ATT: 05/06/2025 20:00
            </div>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-orange-500 dark:text-neutral-400 dark:hover:text-orange-500">
              <Bell className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-orange-500 dark:text-neutral-400 dark:hover:text-orange-500">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <ThemeToggle />
          </div>
        </div>

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
