"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useToast } from "@/hooks/use-toast"
import { useApp } from "@/contexts/app-context"
import { api } from "@/lib/api"
import { Database, Play, Eye, Copy, Clock, AlertTriangle } from "lucide-react"
import type { ValidarDocumentosResponse, DocumentoValidado } from "@/types"

export default function DeteccionPage() {
  const [isBuilding, setIsBuilding] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [documentosValidados, setDocumentosValidados] = useState<ValidarDocumentosResponse>([])
  const [selectedDoc, setSelectedDoc] = useState<DocumentoValidado | null>(null)
  const { toast } = useToast()
  const { lastDetectionBuild, setLastDetectionBuild } = useApp()

  const handleBuildBase = async () => {
    setIsBuilding(true)
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
      setIsBuilding(false)
    }
  }

  const handleValidateDocuments = async () => {
    setIsValidating(true)
    try {
      const result = await api.validarDocumentos()
      setDocumentosValidados(result)
      toast({
        title: "Validación completada",
        description: `Se validaron ${result.length} documentos`,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"

      if (errorMessage.includes("500")) {
        toast({
          title: "Error de validación",
          description: "Cree primero la base vectorial de Detección",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error en la validación",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } finally {
      setIsValidating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copiado",
      description: "Texto copiado al portapapeles",
    })
  }

  const exportToTxt = (doc: DocumentoValidado) => {
    const content = `Documento ID: ${doc.id}
Tipo: ${doc.tipo_documento}
Observaciones:
${doc.observaciones}`

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `documento_${doc.id}_observaciones.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getTipoDocumentoBadge = (tipo: string) => {
    const colors = {
      pliego: "bg-blue-100 text-blue-800",
      propuesta: "bg-green-100 text-green-800",
      contrato: "bg-purple-100 text-purple-800",
    }
    return colors[tipo as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Detección y Validación</h1>
          <p className="text-muted-foreground">Crea bases vectoriales y valida documentos usando tecnología RAG</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Base Vectorial */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Base Vectorial (Detección)
              </CardTitle>
              <CardDescription>Construye la base de conocimiento para validación de documentos</CardDescription>
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

              {lastDetectionBuild && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Último build: {new Date(lastDetectionBuild).toLocaleString()}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Validar Documentos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Validar Documentos
              </CardTitle>
              <CardDescription>Ejecuta la validación RAG sobre todos los documentos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleValidateDocuments}
                disabled={isValidating || !lastDetectionBuild}
                className="w-full"
              >
                {isValidating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Validando...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Validar todos
                  </>
                )}
              </Button>

              {!lastDetectionBuild && (
                <div className="flex items-center gap-2 text-sm text-amber-600">
                  <AlertTriangle className="h-4 w-4" />
                  Construye primero la base vectorial
                </div>
              )}

              {documentosValidados.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  Últimos resultados: {documentosValidados.length} documentos validados
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Resultados de Validación */}
        {documentosValidados.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Resultados de Validación</CardTitle>
              <CardDescription>Documentos procesados con observaciones detectadas</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Observaciones</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documentosValidados.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">#{doc.id}</TableCell>
                      <TableCell>
                        <Badge className={getTipoDocumentoBadge(doc.tipo_documento)}>{doc.tipo_documento}</Badge>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <p className="truncate">
                          {doc.observaciones.substring(0, 100)}
                          {doc.observaciones.length > 100 && "..."}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedDoc(doc)}>
                              <Eye className="h-4 w-4 mr-1" />
                              Ver detalle
                            </Button>
                          </SheetTrigger>
                          <SheetContent className="w-[600px] sm:w-[700px]">
                            <SheetHeader>
                              <SheetTitle>Documento #{selectedDoc?.id}</SheetTitle>
                              <SheetDescription>Tipo: {selectedDoc?.tipo_documento}</SheetDescription>
                            </SheetHeader>

                            {selectedDoc && (
                              <div className="mt-6 space-y-4">
                                <div>
                                  <h4 className="font-medium mb-2">Observaciones completas:</h4>
                                  <div className="bg-muted p-4 rounded-lg text-sm whitespace-pre-wrap">
                                    {selectedDoc.observaciones}
                                  </div>
                                </div>

                                <div className="flex gap-2">
                                  <Button variant="outline" onClick={() => copyToClipboard(selectedDoc.observaciones)}>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copiar
                                  </Button>
                                  <Button variant="outline" onClick={() => exportToTxt(selectedDoc)}>
                                    Exportar .txt
                                  </Button>
                                </div>
                              </div>
                            )}
                          </SheetContent>
                        </Sheet>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}
