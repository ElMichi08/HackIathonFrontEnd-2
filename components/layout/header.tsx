"use client"

import { useApp } from "@/contexts/app-context"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Database, Wifi, WifiOff } from "lucide-react"

export function Header() {
  const { dataMode, setDataMode, isLoading } = useApp()

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold">Panel de Control</h2>
        {isLoading && (
          <Badge variant="secondary" className="animate-pulse">
            Procesando...
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-muted-foreground" />
          <Select value={dataMode} onValueChange={setDataMode}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MOCK">
                <div className="flex items-center gap-2">
                  <WifiOff className="h-3 w-3" />
                  MOCK
                </div>
              </SelectItem>
              <SelectItem value="API">
                <div className="flex items-center gap-2">
                  <Wifi className="h-3 w-3" />
                  API
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Badge variant={dataMode === "API" ? "default" : "secondary"}>
          {dataMode === "API" ? "Conectado" : "Desarrollo"}
        </Badge>
      </div>
    </header>
  )
}
