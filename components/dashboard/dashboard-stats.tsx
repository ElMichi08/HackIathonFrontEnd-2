"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, CheckCircle, AlertTriangle, TrendingUp } from "lucide-react"

const stats = [
  {
    title: "Documentos Procesados",
    value: "1,247",
    change: "+12%",
    changeType: "positive" as const,
    icon: FileText,
  },
  {
    title: "Clasificaciones Exitosas",
    value: "1,156",
    change: "+8%",
    changeType: "positive" as const,
    icon: CheckCircle,
  },
  {
    title: "Alertas Generadas",
    value: "89",
    change: "-5%",
    changeType: "negative" as const,
    icon: AlertTriangle,
  },
  {
    title: "Precisión del Sistema",
    value: "94.2%",
    change: "+2.1%",
    changeType: "positive" as const,
    icon: TrendingUp,
  },
]

export function DashboardStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Badge variant={stat.changeType === "positive" ? "default" : "destructive"} className="text-xs">
                {stat.change}
              </Badge>
              <span>vs mes anterior</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
