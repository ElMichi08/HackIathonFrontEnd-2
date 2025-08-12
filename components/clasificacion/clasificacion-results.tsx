"use client"

import { useApp } from "@/contexts/app-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Building, FileText, Scale, Calculator, Users } from "lucide-react"

export function ClasificacionResults() {
  const { clasificaciones } = useApp()
  const latestClasificacion = clasificaciones[clasificaciones.length - 1]

  if (!latestClasificacion) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Resultados de Clasificación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay clasificaciones disponibles</p>
            <p className="text-sm">Sube un documento para ver los resultados</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { ruc_info, clasificacion, ruc_encontrado } = latestClasificacion

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Resultados de Clasificación
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="ruc" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ruc" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Información RUC
            </TabsTrigger>
            <TabsTrigger value="clasificacion" className="flex items-center gap-2">
              <Scale className="h-4 w-4" />
              Clasificación
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ruc" className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">RUC:</span>
                <Badge variant="outline" className="font-mono">
                  {ruc_encontrado}
                </Badge>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Información General</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Razón Social:</span>
                    <span className="font-medium">{ruc_info.razonSocial}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estado:</span>
                    <Badge variant={ruc_info.estadoContribuyenteRuc === "ACTIVO" ? "default" : "destructive"}>
                      {ruc_info.estadoContribuyenteRuc}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tipo:</span>
                    <span>{ruc_info.tipoContribuyente}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Categoría:</span>
                    <span>{ruc_info.categoria}</span>
                  </div>
                </div>
              </div>

              {ruc_info.representantesLegales && ruc_info.representantesLegales.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Representantes Legales
                  </h4>
                  <div className="space-y-1">
                    {ruc_info.representantesLegales.map((rep, index) => (
                      <div key={index} className="text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Nombre:</span>
                          <span>{rep.nombre}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Identificación:</span>
                          <span className="font-mono">{rep.identificacion}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="clasificacion" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Scale className="h-4 w-4 text-blue-500" />
                  Aspectos Legales ({clasificacion.legal.length})
                </h4>
                <ScrollArea className="h-24 w-full rounded border p-2">
                  <div className="space-y-1">
                    {clasificacion.legal.map((item, index) => (
                      <p key={index} className="text-xs text-muted-foreground">
                        • {item}
                      </p>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4 text-green-500" />
                  Aspectos Técnicos ({clasificacion.tecnica.length})
                </h4>
                <ScrollArea className="h-24 w-full rounded border p-2">
                  <div className="space-y-1">
                    {clasificacion.tecnica.map((item, index) => (
                      <p key={index} className="text-xs text-muted-foreground">
                        • {item}
                      </p>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-orange-500" />
                  Aspectos Económicos ({clasificacion.economica.length})
                </h4>
                <ScrollArea className="h-24 w-full rounded border p-2">
                  <div className="space-y-1">
                    {clasificacion.economica.map((item, index) => (
                      <p key={index} className="text-xs text-muted-foreground">
                        • {item}
                      </p>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
