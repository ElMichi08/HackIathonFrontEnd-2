"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

const activities = [
  {
    id: 1,
    type: "clasificacion",
    title: "Documento clasificado",
    description: "Propuesta técnica - EMPRESA ABC S.A.",
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 min ago
    status: "success",
  },
  {
    id: 2,
    type: "validacion",
    title: "Validación completada",
    description: "Pliego de condiciones - Proyecto Vial",
    timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 min ago
    status: "warning",
  },
  {
    id: 3,
    type: "alerta",
    title: "Alerta generada",
    description: "Contrato con inconsistencias detectadas",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    status: "error",
  },
  {
    id: 4,
    type: "clasificacion",
    title: "RUC verificado",
    description: "Información actualizada - CONSULTORA XYZ",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    status: "success",
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "success":
      return "bg-green-500"
    case "warning":
      return "bg-yellow-500"
    case "error":
      return "bg-red-500"
    default:
      return "bg-gray-500"
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "success":
      return <Badge className="bg-green-100 text-green-800">Exitoso</Badge>
    case "warning":
      return <Badge className="bg-yellow-100 text-yellow-800">Advertencia</Badge>
    case "error":
      return <Badge className="bg-red-100 text-red-800">Error</Badge>
    default:
      return <Badge variant="secondary">Desconocido</Badge>
  }
}

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad Reciente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className={getStatusColor(activity.status)}>
                  <div className="h-2 w-2 rounded-full bg-white" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{activity.title}</p>
                  {getStatusBadge(activity.status)}
                </div>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(activity.timestamp, {
                    addSuffix: true,
                    locale: es,
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
