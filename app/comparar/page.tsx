"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useApp } from "@/contexts/app-context"
import { api } from "@/lib/api"
import { ArrowLeftRight, Download, RefreshCw, FileX, AlertTriangle } from "lucide-react"
import type { DocumentoMejoras, Semaforo } from "@/types"

export default function CompararPage() {
  const [docAId, setDocAId] = useState<string>("")
  const [docBId, setDocBId] = useState<string>("")
  const [alertasA, setAlertasA] = useState<DocumentoMejoras | null>(null)
  const [alertasB, setAlertasB] = useState<DocumentoMejoras | null>(null)
  const [isLoadingAlertas, setIsLoadingAlertas] = useState(false)
  const { toast } = useToast()
  const { documentos } = useApp()

  const docA = documentos.find((d) => d.id.toString() === docAId)
  const docB = documentos.find((d) => d.id.toString() === docBId)

  const handleSwapDocuments = () => {
    const tempA = docAId
    setDocAId(docBId)
    setDocBId(tempA)

    // Intercambiar también las alertas
    const tempAlertasA = alertasA
    setAlertasA(alertasB)
    setAlertasB(tempAlertasA)
  }

  const handleGetAlertas = async () => {
    if (!docAId || !docBId) return

    setIsLoadingAlertas(true)
    try {
      const [resultA, resultB] = await Promise.all([
        api.sugerirMejorasAlertas(Number.parseInt(docAId)),
        api.sugerirMejorasAlertas(Number.parseInt(docBId)),
      ])

      setAlertasA(resultA)
      setAlertasB(resultB)

      toast({
        title: "Alertas obtenidas",
        description: "Se han cargado las alertas para ambos documentos",
      })
    } catch (error) {
      toast({
        title: "Error al obtener alertas",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      })
    } finally {
      setIsLoadingAlertas(false)
    }
  }

  const getSemaforoConfig = (semaforo: Semaforo) => {
    const configs = {
      VERDE: { color: "bg-green-500", label: "VERDE" },
      AMARILLO: { color: "bg-yellow-500", label: "AMARILLO" },
      ROJO: { color: "bg-red-500", label: "ROJO" },
    }
    return configs[semaforo]
  }

  const exportComparison = () => {
    if (!docA || !docB) return

    const content = `# Comparación de Documentos

## Documento A: ${docA.nombre}
- **ID:** #${docA.id}
- **Tipo:** ${docA.tipo_documento}
- **RUC:** ${docA.ruc}
- **Razón Social:** ${docA.ruc_info.razonSocial}

## Documento B: ${docB.nombre}
- **ID:** #${docB.id}
- **Tipo:** ${docB.tipo_documento}
- **RUC:** ${docB.ruc}
- **Razón Social:** ${docB.ruc_info.razonSocial}

## Clasificación

### Legal
**Documento A:**
${docA.clasificacion.legal.map((item) => `- ${item}`).join("\n")}

**Documento B:**
${docB.clasificacion.legal.map((item) => `- ${item}`).join("\n")}

### Técnica
**Documento A:**
${docA.clasificacion.tecnica.map((item) => `- ${item}`).join("\n")}

**Documento B:**
${docB.clasificacion.tecnica.map((item) => `- ${item}`).join("\n")}

### Económica
**Documento A:**
${docA.clasificacion.economica.map((item) => `- ${item}`).join("\n")}

**Documento B:**
${docB.clasificacion.economica.map((item) => `- ${item}`).join("\n")}

${
  alertasA && alertasB
    ? `
## Alertas

### Documento A - ${getSemaforoConfig(alertasA.semaforo_alerta).label}
**Observaciones:** ${alertasA.observaciones}
**Recomendaciones:** ${alertasA.recomendaciones}

### Documento B - ${getSemaforoConfig(alertasB.semaforo_alerta).label}
**Observaciones:** ${alertasB.observaciones}
**Recomendaciones:** ${alertasB.recomendaciones}
`
    : ""
}

---
*Comparación generada el ${new Date().toLocaleString()}*`

    const blob = new Blob([content], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `comparacion_${docA.id}_vs_${docB.id}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (documentos.length < 2) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Comparar Documentos</h1>
            <p className="text-muted-foreground">Compara dos documentos lado a lado</p>
          </div>

          <Card>
            <CardContent className="text-center py-12">
              <FileX className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Documentos insuficientes</h3>
              <p className="text-muted-foreground mb-4">
                Necesitas al menos 2 documentos para realizar una comparación
              </p>
              <p className="text-sm text-muted-foreground">Sube documentos en la sección de Clasificación</p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Comparar Documentos</h1>
          <p className="text-muted-foreground">Compara clasificación, alertas y validación entre dos documentos</p>
        </div>

        {/* Selectores */}
        <Card>
          <CardHeader>
            <CardTitle>Seleccionar Documentos</CardTitle>
            <CardDescription>Elige dos documentos para comparar sus características</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3 items-end">
              <div className="space-y-2">
                <label className="text-sm font-medium">Documento A</label>
                <Select value={docAId} onValueChange={setDocAId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {documentos.map((doc) => (
                      <SelectItem key={doc.id} value={doc.id.toString()} disabled={doc.id.toString() === docBId}>
                        #{doc.id} - {doc.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-center">
                <Button variant="outline" size="icon" onClick={handleSwapDocuments} disabled={!docAId || !docBId}>
                  <ArrowLeftRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Documento B</label>
                <Select value={docBId} onValueChange={setDocBId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {documentos.map((doc) => (
                      <SelectItem key={doc.id} value={doc.id.toString()} disabled={doc.id.toString() === docAId}>
                        #{doc.id} - {doc.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {docA && docB && (
              <div className="mt-6 flex gap-2">
                <Button onClick={handleGetAlertas} disabled={isLoadingAlertas}>
                  {isLoadingAlertas ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Obteniendo alertas...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Obtener Alertas A/B
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={exportComparison}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar comparación
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumen */}
        {docA && docB && (
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600">Documento A</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <strong>Nombre:</strong> {docA.nombre}
                </div>
                <div>
                  <strong>Tipo:</strong> <Badge>{docA.tipo_documento}</Badge>
                </div>
                <div>
                  <strong>RUC:</strong> {docA.ruc}
                </div>
                <div>
                  <strong>Razón Social:</strong> {docA.ruc_info.razonSocial}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Documento B</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <strong>Nombre:</strong> {docB.nombre}
                </div>
                <div>
                  <strong>Tipo:</strong> <Badge>{docB.tipo_documento}</Badge>
                </div>
                <div>
                  <strong>RUC:</strong> {docB.ruc}
                </div>
                <div>
                  <strong>Razón Social:</strong> {docB.ruc_info.razonSocial}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Comparación detallada */}
        {docA && docB && (
          <Card>
            <CardHeader>
              <CardTitle>Comparación Detallada</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="clasificacion" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="clasificacion">Clasificación</TabsTrigger>
                  <TabsTrigger value="alertas">Alertas</TabsTrigger>
                  <TabsTrigger value="validacion">Validación</TabsTrigger>
                </TabsList>

                <TabsContent value="clasificacion" className="space-y-6">
                  {/* Legal */}
                  <div>
                    <h4 className="font-medium mb-3 text-blue-600">Legal</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h5 className="text-sm font-medium mb-2">Documento A</h5>
                        <ul className="space-y-1 text-sm">
                          {docA.clasificacion.legal.slice(0, 5).map((item, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium mb-2">Documento B</h5>
                        <ul className="space-y-1 text-sm">
                          {docB.clasificacion.legal.slice(0, 5).map((item, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Técnica */}
                  <div>
                    <h4 className="font-medium mb-3 text-green-600">Técnica</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h5 className="text-sm font-medium mb-2">Documento A</h5>
                        <ul className="space-y-1 text-sm">
                          {docA.clasificacion.tecnica.slice(0, 5).map((item, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium mb-2">Documento B</h5>
                        <ul className="space-y-1 text-sm">
                          {docB.clasificacion.tecnica.slice(0, 5).map((item, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Económica */}
                  <div>
                    <h4 className="font-medium mb-3 text-orange-600">Económica</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h5 className="text-sm font-medium mb-2">Documento A</h5>
                        <ul className="space-y-1 text-sm">
                          {docA.clasificacion.economica.slice(0, 5).map((item, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium mb-2">Documento B</h5>
                        <ul className="space-y-1 text-sm">
                          {docB.clasificacion.economica.slice(0, 5).map((item, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="alertas" className="space-y-6">
                  {alertasA && alertasB ? (
                    <>
                      {/* Semáforos */}
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="text-center">
                          <h5 className="text-sm font-medium mb-2">Documento A</h5>
                          <Badge className={`${getSemaforoConfig(alertasA.semaforo_alerta).color} text-white`}>
                            {getSemaforoConfig(alertasA.semaforo_alerta).label}
                          </Badge>
                        </div>
                        <div className="text-center">
                          <h5 className="text-sm font-medium mb-2">Documento B</h5>
                          <Badge className={`${getSemaforoConfig(alertasB.semaforo_alerta).color} text-white`}>
                            {getSemaforoConfig(alertasB.semaforo_alerta).label}
                          </Badge>
                        </div>
                      </div>

                      {/* Observaciones */}
                      <div>
                        <h4 className="font-medium mb-3">Observaciones</h4>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <h5 className="text-sm font-medium mb-2">Documento A</h5>
                            <div className="bg-muted p-3 rounded text-sm">
                              {alertasA.observaciones.substring(0, 200)}
                              {alertasA.observaciones.length > 200 && "..."}
                            </div>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium mb-2">Documento B</h5>
                            <div className="bg-muted p-3 rounded text-sm">
                              {alertasB.observaciones.substring(0, 200)}
                              {alertasB.observaciones.length > 200 && "..."}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Recomendaciones */}
                      <div>
                        <h4 className="font-medium mb-3">Recomendaciones</h4>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <h5 className="text-sm font-medium mb-2">Documento A</h5>
                            <div className="bg-muted p-3 rounded text-sm">
                              {alertasA.recomendaciones.substring(0, 200)}
                              {alertasA.recomendaciones.length > 200 && "..."}
                            </div>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium mb-2">Documento B</h5>
                            <div className="bg-muted p-3 rounded text-sm">
                              {alertasB.recomendaciones.substring(0, 200)}
                              {alertasB.recomendaciones.length > 200 && "..."}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
                      <p>No hay alertas cargadas</p>
                      <p className="text-sm">Haz clic en "Obtener Alertas A/B" para cargar las alertas</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="validacion" className="space-y-4">
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
                    <p>Validación RAG no disponible</p>
                    <p className="text-sm">
                      Esta funcionalidad se implementará cuando esté disponible el endpoint de validación por documento
                      específico
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}
