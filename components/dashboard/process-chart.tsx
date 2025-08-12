"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

const data = [
  { name: "Ene", clasificaciones: 45, validaciones: 38, alertas: 12 },
  { name: "Feb", clasificaciones: 52, validaciones: 41, alertas: 8 },
  { name: "Mar", clasificaciones: 61, validaciones: 55, alertas: 15 },
  { name: "Abr", clasificaciones: 58, validaciones: 49, alertas: 11 },
  { name: "May", clasificaciones: 67, validaciones: 62, alertas: 9 },
  { name: "Jun", clasificaciones: 74, validaciones: 68, alertas: 13 },
]

export function ProcessChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Procesamiento Mensual</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="clasificaciones"
              stackId="1"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="validaciones"
              stackId="1"
              stroke="hsl(220 90% 70%)"
              fill="hsl(220 90% 70%)"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="alertas"
              stackId="1"
              stroke="hsl(0 84% 60%)"
              fill="hsl(0 84% 60%)"
              fillOpacity={0.6}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
