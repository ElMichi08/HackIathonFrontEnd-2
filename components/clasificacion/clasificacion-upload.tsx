"use client"

import type React from "react"

import { useState } from "react"
import { useApp } from "@/contexts/app-context"
import { apiClient } from "@/lib/api"
import { mockApi } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Upload, FileText, Loader2 } from "lucide-react"

export function ClasificacionUpload() {
  const { dataMode, setLoading, addClasificacion } = useApp()
  const { toast } = useToast()
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileUpload = async (file: File) => {
    if (!file.type.includes("pdf")) {
      toast({
        title: "Error",
        description: "Solo se permiten archivos PDF",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    setLoading(true)
    setUploadProgress(0)

    try {
      // Simular progreso de subida
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const formData = new FormData()
      formData.append("file", file)

      const client = dataMode === "API" ? apiClient : mockApi
      const result = await client.clasificar(formData)

      clearInterval(progressInterval)
      setUploadProgress(100)

      addClasificacion(result)

      toast({
        title: "Clasificación completada",
        description: `Documento procesado exitosamente. RUC encontrado: ${result.ruc_encontrado}`,
      })
    } catch (error) {
      toast({
        title: "Error en la clasificación",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setLoading(false)
      setUploadProgress(0)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Subir Documento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={() => setIsDragging(true)}
          onDragLeave={() => setIsDragging(false)}
        >
          {isProcessing ? (
            <div className="space-y-4">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <div className="space-y-2">
                <p className="text-sm font-medium">Procesando documento...</p>
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-xs text-muted-foreground">
                  {uploadProgress < 90 ? "Subiendo archivo..." : "Analizando contenido..."}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
              <div className="space-y-2">
                <p className="text-lg font-medium">Arrastra tu archivo PDF aquí</p>
                <p className="text-sm text-muted-foreground">o haz clic para seleccionar un archivo</p>
              </div>
              <input type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" id="file-upload" />
              <Button asChild>
                <label htmlFor="file-upload" className="cursor-pointer">
                  Seleccionar Archivo
                </label>
              </Button>
            </div>
          )}
        </div>

        <div className="mt-4 text-xs text-muted-foreground">
          <p>• Solo archivos PDF</p>
          <p>• Tamaño máximo: 10MB</p>
          <p>• El documento debe contener un RUC válido</p>
        </div>
      </CardContent>
    </Card>
  )
}
