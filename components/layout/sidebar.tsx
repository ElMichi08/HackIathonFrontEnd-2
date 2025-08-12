"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Search, AlertTriangle, BarChart3, Settings, Brain } from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: BarChart3,
  },
  {
    name: "Clasificación",
    href: "/clasificacion",
    icon: FileText,
    badge: "IA",
  },
  {
    name: "Detección",
    href: "/deteccion",
    icon: Search,
    badge: "RAG",
  },
  {
    name: "Alertas",
    href: "/alertas",
    icon: AlertTriangle,
    badge: "IA",
  },
  {
    name: "Comparar",
    href: "/comparar",
    icon: Brain,
    badge: "IA",
  },
  {
    name: "Configuración",
    href: "/configuracion",
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-card border-r">
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center gap-2">
          <Brain className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-lg font-bold">Licitaciones IA</h1>
            <p className="text-xs text-muted-foreground">Sistema Inteligente</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn("w-full justify-start gap-3", isActive && "bg-secondary")}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
                {item.badge && (
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {item.badge}
                  </Badge>
                )}
              </Button>
            </Link>
          )
        })}
      </nav>

      <div className="border-t p-4">
        <div className="text-xs text-muted-foreground">
          <p>Versión 1.0.0</p>
          <p>Modo: Desarrollo</p>
        </div>
      </div>
    </div>
  )
}
