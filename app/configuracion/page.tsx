"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { useApp } from "@/contexts/app-context"
import { api } from "@/lib/api"
import { Wifi, WifiOff, Database, Upload, RotateCcw, CheckCircle, AlertCircle, Clock } from "lucide-react"

export default function ConfiguracionPage() {
  const [tempApiUrl, setTempApiUrl] = useState("")
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"unknown" | "connected" | "error">("unknown")
  const [connectionError, setConnectionError] = useState("")
  const [maxFileSize, setMaxFileSize] = useState("10")
  const [isBuildingDetection, setIsBuildingDetection] = useState(false)
  const [isBuildingAlerts, setIsBuildingAlerts] = useState(false)

  const {
    dataMode,
    setDataMode,
    apiBaseUrl,
    setApiBaseUrl,
    lastDetectionBuild,
    setLastDetectionBuild,
    lastAlertsBuild,
    setLastAlertsBuild,
  } = useApp()
  const { toast } = useToast()

  useEffect(() => {
    setTempApiUrl(apiBaseUrl)

    // Cargar configuración de localStorage
    const savedMaxSize = localStorage.getItem("maxFileSize")
    if (savedMaxSize) setMaxFileSize(savedMaxSize)
  }, [apiBaseUrl])

  const testConnection = async () => {
    setIsTestingConnection(true)
    setConnectionStatus("unknown")
    setConnectionError("")

    try {
      // Usar la URL temporal para la prueba
      const testUrl = tempApiUrl || apiBaseUrl
      const response = await fetch(`${testUrl}/deteccion/validar_documentos`)

      if (response.ok || response.status === 500) {
        // 500 es esperado si no hay base vectorial, pero significa que la API responde
        setConnectionStatus("connected")
        toast({
          title: "Conexión exitosa",
          description: "La API está respondiendo correctamente",
        })
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      setConnectionStatus("error")
      const errorMsg = error instanceof Error ? error.message : "Error desconocido"
      setConnectionError(errorMsg)
      toast({
        title: "Error de conexión",
        description: errorMsg,
        variant: "destructive",
      })
    } finally {
      setIsTestingConnection(false)
    }
  }

  const saveApiUrl = () => {
    setApiBaseUrl(tempApiUrl)
    toast({
      title: "URL guardada",
      description: "La URL base de la API ha sido actualizada",
    })
  }

  const saveMaxFileSize = () => {
    localStorage.setItem("maxFileSize", maxFileSize)
    toast({
      title: "Configuración guardada",
      description: `Tamaño máximo de archivo: ${maxFileSize}MB`,
    })
  }

  const buildDetectionBase = async () => {
    setIsBuildingDetection(true)
    try {
      const result = await api.crearBaseVectorialDeteccion()
      setLastDetectionBuild(new Date().toISOString())
      toast({
        title: "Base vectorial creada",
        description: result.mensaje,
      })
    } catch (error) {
      toast({
        title: "Error al crear base vectorial",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      })
    } finally {
      setIsBuildingDetection(false)
    }
  }

  const buildAlertsBase = async () => {
    setIsBuildingAlerts(true)
    try {
      const result = await api.crearBaseVectorialAlertas()
      setLastAlertsBuild(new Date().toISOString())
      toast({
        title: "Base vectorial creada",
        description: result.mensaje,
      })
    } catch (error) {
      toast({
        title: "Error al crear base vectorial",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      })
    } finally {
      setIsBuildingAlerts(false)
    }
  }

  const resetConfiguration = () => {
    // Limpiar localStorage
    localStorage.removeItem("dataMode")
    localStorage.removeItem("apiBaseUrl")
    localStorage.removeItem("maxFileSize")
    localStorage.removeItem("documentos")
    localStorage.removeItem("lastDetectionBuild")
    localStorage.removeItem("lastAlertsBuild")

    // Resetear estados
    setDataMode("MOCK")
    setApiBaseUrl("http://localhost:8000")
    setTempApiUrl("http://localhost:8000")
    setMaxFileSize("10")
    setConnectionStatus("unknown")
    setConnectionError("")

    toast({
      title: "Configuración restablecida",
      description: "Todas las configuraciones han sido restauradas a sus valores por defecto",
    })
  }

  const getConnectionBadge = () => {
    switch (connectionStatus) {
      case "connected":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Conectado
          </Badge>
        )
      case "error":
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary">
            <WifiOff className="h-3 w-3 mr-1" />
            Sin probar
          </Badge>
        )
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Configuración</h1>
          <p className="text-muted-foreground">Configura la conexión, modo de datos y parámetros del sistema</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Conexión */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="h-5 w-5" />
                Conexión
              </CardTitle>
              <CardDescription>Configura la URL base de la API y prueba la conectividad</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-url">URL Base de la API</Label>
                <Input
                  id="api-url"
                  value={tempApiUrl}
                  onChange={(e) => setTempApiUrl(e.target.value)}
                  placeholder="http://localhost:8000"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={testConnection} disabled={isTestingConnection} variant="outline">
                  {isTestingConnection ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                      Probando...
                    </>
                  ) : (
                    <>
                      <Wifi className="h-4 w-4 mr-2" />
                      Probar conexión
                    </>
                  )}
                </Button>

                <Button onClick={saveApiUrl} disabled={tempApiUrl === apiBaseUrl}>
                  Guardar URL
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Estado:</span>
                {getConnectionBadge()}
              </div>

              {connectionError && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{connectionError}</div>}
            </CardContent>
          </Card>

          {/* Modo de datos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Modo de Datos
              </CardTitle>
              <CardDescription>Alterna entre datos simulados y API real</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Modo actual</Label>
                  <p className="text-sm text-muted-foreground">
                    {dataMode === "MOCK" ? "Datos simulados para desarrollo" : "Conectado a API real"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">MOCK</span>
                  <Switch
                    checked={dataMode === "API"}
                    onCheckedChange={(checked) => {
                      // Prevenir propagación de eventos
                      setDataMode(checked ? "API" : "MOCK")
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                    }}
                  />
                  <span className="text-sm">API</span>
                </div>
              </div>

              <Badge variant={dataMode === "MOCK" ? "secondary" : "default"}>
                {dataMode === "MOCK" ? "Modo Desarrollo" : "Modo Producción"}
              </Badge>
            </CardContent>
          </Card>

          {/* Límites de subida */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Límites de Subida
              </CardTitle>
              <CardDescription>Configura las restricciones para archivos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="max-size">Tamaño máximo (MB)</Label>
                <Input
                  id="max-size"
                  type="number"
                  min="1"
                  max="100"
                  value={maxFileSize}
                  onChange={(e) => setMaxFileSize(e.target.value)}
                />
              </div>

              <div className="text-sm text-muted-foreground">
                <p>• Tipos permitidos: PDF únicamente</p>
                <p>• Tamaño actual: {maxFileSize}MB máximo</p>
              </div>

              <Button onClick={saveMaxFileSize} variant="outline">
                Guardar límites
              </Button>
            </CardContent>
          </Card>

          {/* Mantenimiento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5" />
                Mantenimiento
              </CardTitle>
              <CardDescription>Restablecer configuración y limpiar datos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={resetConfiguration} variant="destructive" className="w-full">
                <RotateCcw className="h-4 w-4 mr-2" />
                Restablecer configuración
              </Button>

              <div className="text-sm text-muted-foreground">
                <p>Esta acción eliminará:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Configuración de API y modo</li>
                  <li>Documentos guardados localmente</li>
                  <li>Historial de builds de bases vectoriales</li>
                  <li>Límites de subida personalizados</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Índices RAG */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Índices RAG
            </CardTitle>
            <CardDescription>Construye y mantén las bases vectoriales para detección y alertas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Detección */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Base Vectorial - Detección</h4>
                  <p className="text-sm text-muted-foreground">Para validación de documentos con RAG</p>
                </div>

                <Button onClick={buildDetectionBase} disabled={isBuildingDetection} className="w-full">
                  {isBuildingDetection ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Construyendo...
                    </>
                  ) : (
                    <>
                      <Database className="h-4 w-4 mr-2" />
                      Construir/Rebuild
                    </>
                  )}
                </Button>

                {lastDetectionBuild && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Último build: {new Date(lastDetectionBuild).toLocaleString()}
                  </div>
                )}
              </div>

              {/* Alertas */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Base Vectorial - Alertas</h4>
                  <p className="text-sm text-muted-foreground">Para generar alertas y recomendaciones</p>
                </div>

                <Button onClick={buildAlertsBase} disabled={isBuildingAlerts} className="w-full">
                  {isBuildingAlerts ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Construyendo...
                    </>
                  ) : (
                    <>
                      <Database className="h-4 w-4 mr-2" />
                      Construir/Rebuild
                    </>
                  )}
                </Button>

                {lastAlertsBuild && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Último build: {new Date(lastAlertsBuild).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
