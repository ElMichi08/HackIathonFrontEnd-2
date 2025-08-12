"use client"

import type React from "react"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { useApp } from "@/contexts/app-context"
import { api } from "@/lib/api"
import { mockApi } from "@/lib/mock-data"
import { Upload, FileText, Building2, CheckCircle, AlertCircle, Save } from "lucide-react"
import type { ClasificarResponse, DocumentoMin } from "@/types"

export default function ClasificacionPage() {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [currentResult, setCurrentResult] = useState<ClasificarResponse | null>(null)
  const [selectedTipoDoc, setSelectedTipoDoc] = useState<string>("")
  const [fileName, setFileName] = useState<string>("")

  const { toast } = useToast()
  const { dataMode, addDocumento } = useApp()

  const handleNewDocument = () => {
    setCurrentResult(null)
    setSelectedTipoDoc("")
    setFileName("")
    setUploadProgress(0)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (currentResult && !isUploading) return
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    if (currentResult && !isUploading) return
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (currentResult && !isUploading) return
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    handleFiles(files)
    e.target.value = ""
  }

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return

    const file = files[0]

    // Validaciones
    if (file.type !== "application/pdf") {
      toast({
        title: "Archivo no válido",
        description: "Solo se permiten archivos PDF",
        variant: "destructive",
      })
      return
    }

    const maxSize = Number.parseInt(localStorage.getItem("maxFileSize") || "10") * 1024 * 1024
    if (file.size > maxSize) {
      toast({
        title: "Archivo muy grande",
        description: `El archivo excede el límite de ${maxSize / 1024 / 1024}MB`,
        variant: "destructive",
      })
      return
    }

    setFileName(file.name)
    setIsUploading(true)
    setUploadProgress(0)

    // Simular progreso
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 200)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const result = dataMode === "MOCK" ? await mockApi.clasificar(formData) : await api.clasificar(formData)

      setCurrentResult(result)
      setUploadProgress(100)

      toast({
        title: "Clasificación completada",
        description: "El documento ha sido procesado exitosamente",
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"

      if (errorMessage.includes("400")) {
        toast({
          title: "Error de procesamiento",
          description: "El PDF no contiene RUC legible o es inválido",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error en la clasificación",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } finally {
      clearInterval(progressInterval)
      setIsUploading(false)
      setTimeout(() => setUploadProgress(0), 1000)
    }
  }

  const handleSaveDocument = () => {
    if (!currentResult) return

    const tipoDocumento = selectedTipoDoc || "documento"

    const documento: DocumentoMin = {
      id: currentResult.id,
      nombre: fileName,
      tipo_documento: tipoDocumento,
      ruc: currentResult.ruc_encontrado,
      ruc_info: currentResult.ruc_info,
      clasificacion: currentResult.clasificacion,
    }

    addDocumento(documento)

    toast({
      title: "Documento guardado",
      description: "El documento ha sido agregado a la lista para comparar",
    })
  }

  const getTotalFragments = (clasificacion: ClasificarResponse["clasificacion"]) => {
    return clasificacion.legal.length + clasificacion.tecnica.length + clasificacion.economica.length
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Clasificación de Documentos</h1>
          <p className="text-muted-foreground">
            Sube documentos PDF para clasificar contenido y extraer información de RUC
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Card de Subida */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Subir Documento
              </CardTitle>
              <CardDescription>Arrastra un archivo PDF o haz clic para seleccionar (máx. 10MB)</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging && !currentResult
                    ? "border-primary bg-primary/5"
                    : currentResult && !isUploading
                      ? "border-muted-foreground/10 bg-muted/20"
                      : "border-muted-foreground/25 hover:border-muted-foreground/50"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{
                  pointerEvents: currentResult && !isUploading ? "none" : "auto",
                }}
              >
                {isUploading ? (
                  <div className="space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Procesando {fileName}...</p>
                      <Progress value={uploadProgress} className="w-full" />
                      <p className="text-xs text-muted-foreground">{uploadProgress}% completado</p>
                    </div>
                  </div>
                ) : currentResult ? (
                  <div className="space-y-4">
                    <CheckCircle className="h-12 w-12 mx-auto text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-600">Documento procesado exitosamente</p>
                      <p className="text-xs text-muted-foreground">{fileName}</p>
                    </div>
                    <Button onClick={handleNewDocument} variant="outline" size="sm">
                      Procesar nuevo documento
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Arrastra tu archivo PDF aquí</p>
                      <p className="text-xs text-muted-foreground">o haz clic para seleccionar</p>
                    </div>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {currentResult && !isUploading && (
                <div className="mt-4 space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tipo de documento (opcional)</label>
                    <Select value={selectedTipoDoc} onValueChange={setSelectedTipoDoc}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pliego">Pliego</SelectItem>
                        <SelectItem value="propuesta">Propuesta</SelectItem>
                        <SelectItem value="contrato">Contrato</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={handleSaveDocument} className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Guardar en lista para comparar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card de Resultados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Resultados de Clasificación
              </CardTitle>
              <CardDescription>Información extraída del documento procesado</CardDescription>
            </CardHeader>
            <CardContent>
              {currentResult ? (
                <Tabs defaultValue="ruc" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="ruc">RUC e Información</TabsTrigger>
                    <TabsTrigger value="clasificacion">
                      Clasificación ({getTotalFragments(currentResult.clasificacion)})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="ruc" className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm">RUC Encontrado</h4>
                        <p className="text-lg font-mono">{currentResult.ruc_encontrado}</p>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm">Razón Social</h4>
                        <p>{currentResult.ruc_info.razonSocial || "No disponible"}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <h4 className="font-medium text-sm">Estado</h4>
                          <Badge
                            variant={
                              currentResult.ruc_info.estadoContribuyenteRuc === "ACTIVO" ? "default" : "secondary"
                            }
                          >
                            {currentResult.ruc_info.estadoContribuyenteRuc}
                          </Badge>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">Tipo</h4>
                          <Badge variant="outline">{currentResult.ruc_info.tipoContribuyente}</Badge>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm">Obligaciones</h4>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {currentResult.ruc_info.obligadoLlevarContabilidad === "SI" && (
                            <Badge variant="secondary" className="text-xs">
                              Contabilidad
                            </Badge>
                          )}
                          {currentResult.ruc_info.agenteRetencion === "SI" && (
                            <Badge variant="secondary" className="text-xs">
                              Agente Retención
                            </Badge>
                          )}
                          {currentResult.ruc_info.contribuyenteEspecial === "SI" && (
                            <Badge variant="secondary" className="text-xs">
                              Contribuyente Especial
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="clasificacion" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 rounded-full bg-blue-500" />
                          <h4 className="font-medium text-sm">Legal ({currentResult.clasificacion.legal.length})</h4>
                        </div>
                        <ul className="space-y-1 text-sm">
                          {currentResult.clasificacion.legal.slice(0, 3).map((item, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 rounded-full bg-green-500" />
                          <h4 className="font-medium text-sm">
                            Técnica ({currentResult.clasificacion.tecnica.length})
                          </h4>
                        </div>
                        <ul className="space-y-1 text-sm">
                          {currentResult.clasificacion.tecnica.slice(0, 3).map((item, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 rounded-full bg-orange-500" />
                          <h4 className="font-medium text-sm">
                            Económica ({currentResult.clasificacion.economica.length})
                          </h4>
                        </div>
                        <ul className="space-y-1 text-sm">
                          {currentResult.clasificacion.economica.slice(0, 3).map((item, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                  <p className="font-medium">No hay clasificación disponible</p>
                  <p className="text-sm">Sube un documento PDF para ver los resultados</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
