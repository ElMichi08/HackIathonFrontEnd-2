export type Semaforo = "VERDE" | "AMARILLO" | "ROJO"

export interface RucInfo {
  razonSocial?: string
  estadoContribuyenteRuc?: string
  actividadEconomicaPrincipal?: string
  tipoContribuyente?: string
  regimen?: string
  categoria?: string
  obligadoLlevarContabilidad?: string
  agenteRetencion?: string
  contribuyenteEspecial?: string
  informacionFechasContribuyente?: {
    fechaInicioActividades?: string
    fechaCese?: string | null
    fechaReinicioActividades?: string | null
    fechaActualizacion?: string
  }
  representantesLegales?: Array<{
    identificacion?: string
    nombre?: string
  }>
  motivoCancelacionSuspension?: string | null
  contribuyenteFantasma?: string
  transaccionesInexistente?: string
}

export interface ClasificarResponse {
  id: number
  ruc_encontrado: string
  ruc_info: RucInfo
  clasificacion: {
    legal: string[]
    tecnica: string[]
    economica: string[]
  }
}

export interface CrearBaseVectorialResponse {
  mensaje: string
}

export interface DocumentoValidado {
  id: number
  tipo_documento: string
  observaciones: string
}

export type ValidarDocumentosResponse = DocumentoValidado[]

export interface CrearBaseVectorialAlertasResponse {
  mensaje: string
}

export interface DocumentoMejoras {
  id: number
  tipo_documento: string
  observaciones: string
  recomendaciones: string
  semaforo_alerta: Semaforo
}

export interface PDFMetadata {
  sha256: string
  num_pages: number
  extracted_text: string
  metadata: Record<string, any>
}

export interface ProcesarPdfNuevoResponse {
  mensaje: "Documento procesado"
  sha256: string
}

export interface ProcesarPdfExistenteResponse {
  mensaje: "Documento ya existe"
  sha256: string
}

export type DataMode = "MOCK" | "API"

export interface AppState {
  dataMode: DataMode
  isLoading: boolean
  error: string | null
  documentos: DocumentoValidado[]
  clasificaciones: ClasificarResponse[]
}

export interface DocumentoMin {
  id: number
  nombre: string
  tipo_documento: "pliego" | "propuesta" | "contrato" | string
  ruc: string
  ruc_info: RucInfo
  clasificacion: ClasificarResponse["clasificacion"]
}
