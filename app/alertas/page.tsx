"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useApp } from "@/contexts/app-context"
import { api } from "@/lib/api"
import { Database, AlertTriangle, Copy, Download, RefreshCw, Clock, FileX } from "lucide-react"
import type { DocumentoMejoras, Semaforo } from "@/types"

export default function AlertasPage() {
  const [isBuilding, setIsBuilding] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedDocId, setSelectedDocId] = useState<string>("")
  const [alertResult, setAlertResult] = useState<DocumentoMejoras | null>(null)
  const { toast } = useToast()
  const { documentos, lastAlertsBuild, setLastAlertsBuild } = useApp()

  const handleBuildBase = async () => {
    setIsBuilding(true)
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
      setIsBuilding(false)
    }
  }

  const handleGenerateAlerts = async () => {
    if (!selectedDocId) return

    setIsGenerating(true)
    try {
      const result = await api.sugerirMejorasAlertas(Number.parseInt(selectedDocId))
      setAlertResult(result)
      toast({
        title: "Alertas generadas",
        description: "Se han generado las alertas y recomendaciones",
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"

      if (errorMessage.includes("500")) {
        toast({
          title: "Error de alertas",
          description: "Cree primero la base vectorial de Alertas",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error al generar alertas",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const getSemaforoConfig = (semaforo: Semaforo) => {
    const configs = {
      VERDE: {
        color: "bg-green-500",
        textColor: "text-green-700",
        bgColor: "bg-green-50",
        label: "VERDE - Sin problemas críticos",
      },
      AMARILLO: {
        color: "bg-yellow-500",
        textColor: "text-yellow-700",
        bgColor: "bg-yellow-50",
        label: "AMARILLO - Requiere atención",
      },
      ROJO: {
        color: "bg-red-500",
        textColor: "text-red-700",
        bgColor: "bg-red-50",
        label: "ROJO - Problemas críticos",
      },
    }
    return configs[semaforo]
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copiado",
      description: "Texto copiado al portapapeles",
    })
  }

  const exportToMarkdown = () => {
    if (!alertResult) return

    const selectedDoc = documentos.find((d) => d.id === alertResult.id)
    const semaforoConfig = getSemaforoConfig(alertResult.semaforo_alerta)

    const content = `# Reporte de Alertas - Documento #${alertResult.id}

**Documento:** ${selectedDoc?.nombre || "N/A"}
**Tipo:** ${alertResult.tipo_documento}
**Estado:** ${semaforoConfig.label}

## Observaciones

${alertResult.observaciones}

## Recomendaciones

${alertResult.recomendaciones}

---
*Generado el ${new Date().toLocaleString()}*`

    const blob = new Blob([content], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `alertas_documento_${alertResult.id}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const exportToTxt = () => {
    if (!alertResult) return

    const selectedDoc = documentos.find((d) => d.id === alertResult.id)
    const semaforoConfig = getSemaforoConfig(alertResult.semaforo_alerta)

    const content = `REPORTE DE ALERTAS - DOCUMENTO #${alertResult.id}

Documento: ${selectedDoc?.nombre || "N/A"}
Tipo: ${alertResult.tipo_documento}
Estado: ${semaforoConfig.label}

OBSERVACIONES:
${alertResult.observaciones}

RECOMENDACIONES:
${alertResult.recomendaciones}

Generado el ${new Date().toLocaleString()}`

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `alertas_documento_${alertResult.id}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Alertas y Mejoras</h1>
          <p className="text-muted-foreground">
            Genera observaciones, recomendaciones y semáforo de alertas por documento
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Base Vectorial */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Base Vectorial (Alertas)
              </CardTitle>
              <CardDescription>Construye la base de conocimiento para generar alertas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleBuildBase} disabled={isBuilding} className="w-full">
                {isBuilding ? (
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
            </CardContent>
          </Card>

          {/* Seleccionar Documento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Seleccionar Documento
              </CardTitle>
              <CardDescription>Elige un documento para generar alertas y recomendaciones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {documentos.length > 0 ? (
                <>
                  <Select value={selectedDocId} onValueChange={setSelectedDocId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar documento..." />
                    </SelectTrigger>
                    <SelectContent>
                      {documentos.map((doc) => (
                        <SelectItem key={doc.id} value={doc.id.toString()}>
                          #{doc.id} - {doc.nombre} ({doc.tipo_documento})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    onClick={handleGenerateAlerts}
                    disabled={isGenerating || !selectedDocId || !lastAlertsBuild}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Generando...
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Generar alertas
                      </>
                    )}
                  </Button>

                  {!lastAlertsBuild && (
                    <div className="flex items-center gap-2 text-sm text-amber-600">
                      <AlertTriangle className="h-4 w-4" />
                      Construye primero la base vectorial
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileX className="h-12 w-12 mx-auto mb-4" />
                  <p className="font-medium">No hay documentos disponibles</p>
                  <p className="text-sm">Sube documentos en la sección de Clasificación</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Resultados */}
        {alertResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Resultado de Alertas</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleGenerateAlerts} disabled={isGenerating}>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Re-evaluar
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Documento #{alertResult.id} - {alertResult.tipo_documento}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Semáforo */}
              <div className="text-center">
                <div
                  className={`inline-flex items-center gap-3 px-6 py-4 rounded-lg ${getSemaforoConfig(alertResult.semaforo_alerta).bgColor}`}
                >
                  <div className={`w-6 h-6 rounded-full ${getSemaforoConfig(alertResult.semaforo_alerta).color}`} />
                  <span className={`font-bold text-lg ${getSemaforoConfig(alertResult.semaforo_alerta).textColor}`}>
                    {getSemaforoConfig(alertResult.semaforo_alerta).label}
                  </span>
                </div>
              </div>

              {/* Tabs con contenido */}
              <Tabs defaultValue="observaciones" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="observaciones">Observaciones</TabsTrigger>
                  <TabsTrigger value="recomendaciones">Recomendaciones</TabsTrigger>
                </TabsList>

                <TabsContent value="observaciones" className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{alertResult.observaciones}</p>
                  </div>
                  <Button variant="outline" onClick={() => copyToClipboard(alertResult.observaciones)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar observaciones
                  </Button>
                </TabsContent>

                <TabsContent value="recomendaciones" className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{alertResult.recomendaciones}</p>
                  </div>
                  <Button variant="outline" onClick={() => copyToClipboard(alertResult.recomendaciones)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar recomendaciones
                  </Button>
                </TabsContent>
              </Tabs>

              {/* Acciones de exportación */}
              <div className="flex gap-2 pt-4 border-t">
                <Button variant="outline" onClick={exportToTxt}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar .txt
                </Button>
                <Button variant="outline" onClick={exportToMarkdown}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar .md
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}
