import { z } from "zod"
import { mockApi } from "@/lib/mock-data"
import type {
  ClasificarResponse,
  CrearBaseVectorialResponse,
  ValidarDocumentosResponse,
  DocumentoMejoras,
  CrearBaseVectorialAlertasResponse,
} from "@/types"

// Función para obtener la URL base de la API dinámicamente
const getApiBaseUrl = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("apiBaseUrl") || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"
}

// Función para obtener el modo de datos dinámicamente
const getDataMode = () => {
  if (typeof window !== "undefined") {
    return (localStorage.getItem("dataMode") as "MOCK" | "API") || "MOCK"
  }
  return "MOCK"
}

// Schemas de validación con Zod
const ClasificarResponseSchema = z.object({
  id: z.number(),
  ruc_encontrado: z.string(),
  ruc_info: z.object({
    razonSocial: z.string().optional(),
    estadoContribuyenteRuc: z.string().optional(),
    actividadEconomicaPrincipal: z.string().optional(),
    tipoContribuyente: z.string().optional(),
    regimen: z.string().optional(),
    categoria: z.string().optional(),
    obligadoLlevarContabilidad: z.string().optional(),
    agenteRetencion: z.string().optional(),
    contribuyenteEspecial: z.string().optional(),
    informacionFechasContribuyente: z
      .object({
        fechaInicioActividades: z.string().optional(),
        fechaCese: z.string().nullable().optional(),
        fechaReinicioActividades: z.string().nullable().optional(),
        fechaActualizacion: z.string().optional(),
      })
      .optional(),
    representantesLegales: z
      .array(
        z.object({
          identificacion: z.string().optional(),
          nombre: z.string().optional(),
        }),
      )
      .optional(),
    motivoCancelacionSuspension: z.string().nullable().optional(),
    contribuyenteFantasma: z.string().optional(),
    transaccionesInexistente: z.string().optional(),
  }),
  clasificacion: z.object({
    legal: z.array(z.string()),
    tecnica: z.array(z.string()),
    economica: z.array(z.string()),
  }),
})

const DocumentoValidadoSchema = z.object({
  id: z.number(),
  tipo_documento: z.string(),
  observaciones: z.string(),
})

const DocumentoMejorasSchema = z.object({
  id: z.number(),
  tipo_documento: z.string(),
  observaciones: z.string(),
  recomendaciones: z.string(),
  semaforo_alerta: z.enum(["VERDE", "AMARILLO", "ROJO"]),
})

// Cliente API
class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}, schema?: z.ZodSchema<T>): Promise<T> {
    try {
      const API_BASE = getApiBaseUrl()
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API Error ${response.status}: ${errorText}`)
      }

      const data = await response.json()

      if (schema) {
        return schema.parse(data)
      }

      return data
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error)
      throw error
    }
  }

  // Clasificación y RUC
  async clasificar(formData: FormData): Promise<ClasificarResponse> {
    const dataMode = getDataMode()
    if (dataMode === "MOCK") {
      return mockApi.clasificar(formData)
    }

    return this.request(
      "/clasificacion/clasificar/",
      {
        method: "POST",
        body: formData,
        headers: {}, // No Content-Type para FormData
      },
      ClasificarResponseSchema,
    )
  }

  // Detección / Validación
  async crearBaseVectorialDeteccion(): Promise<CrearBaseVectorialResponse> {
    const dataMode = getDataMode()
    if (dataMode === "MOCK") {
      return mockApi.crearBaseVectorialDeteccion()
    }

    return this.request("/deteccion/crear_base_vectorial", {
      method: "POST",
    })
  }

  async validarDocumentos(): Promise<ValidarDocumentosResponse> {
    const dataMode = getDataMode()
    if (dataMode === "MOCK") {
      return mockApi.validarDocumentos()
    }

    return this.request(
      "/deteccion/validar_documentos",
      {
        method: "GET",
      },
      z.array(DocumentoValidadoSchema),
    )
  }

  // Alertas y mejoras
  async crearBaseVectorialAlertas(): Promise<CrearBaseVectorialAlertasResponse> {
    const dataMode = getDataMode()
    if (dataMode === "MOCK") {
      return mockApi.crearBaseVectorialAlertas()
    }

    return this.request("/alert/crear_base_vectorial", {
      method: "POST",
    })
  }

  async sugerirMejorasAlertas(documentoId: number): Promise<DocumentoMejoras> {
    const dataMode = getDataMode()
    if (dataMode === "MOCK") {
      return mockApi.sugerirMejorasAlertas(documentoId)
    }

    return this.request(
      `/alert/sugerir_mejoras_alertas/${documentoId}`,
      {
        method: "GET",
      },
      DocumentoMejorasSchema,
    )
  }
}

// Exportar tanto api como apiClient para compatibilidad
const apiInstance = new ApiClient()

export const api = apiInstance
export const apiClient = apiInstance
export default apiInstance
