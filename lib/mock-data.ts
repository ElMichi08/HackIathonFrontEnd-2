import type {
  ClasificarResponse,
  CrearBaseVectorialResponse,
  ValidarDocumentosResponse,
  DocumentoMejoras,
  CrearBaseVectorialAlertasResponse,
} from "@/types"

// Datos mock para desarrollo y testing
export const mockData = {
  clasificaciones: [
    {
      id: 1,
      ruc_encontrado: "1234567890001",
      ruc_info: {
        razonSocial: "EMPRESA CONSTRUCTORA ABC S.A.",
        estadoContribuyenteRuc: "ACTIVO",
        actividadEconomicaPrincipal: "CONSTRUCCIÓN DE EDIFICIOS",
        tipoContribuyente: "SOCIEDAD",
        regimen: "RÉGIMEN GENERAL",
        categoria: "CONTRIBUYENTE ESPECIAL",
        obligadoLlevarContabilidad: "SI",
        agenteRetencion: "SI",
        contribuyenteEspecial: "SI",
        informacionFechasContribuyente: {
          fechaInicioActividades: "2020-01-15",
          fechaCese: null,
          fechaReinicioActividades: null,
          fechaActualizacion: "2024-01-10",
        },
        representantesLegales: [
          {
            identificacion: "1234567890",
            nombre: "JUAN PÉREZ GARCÍA",
          },
        ],
        motivoCancelacionSuspension: null,
        contribuyenteFantasma: "NO",
        transaccionesInexistente: "NO",
      },
      clasificacion: {
        legal: [
          "Cumplimiento de normativas de construcción",
          "Requisitos legales para contratación pública",
          "Certificaciones ambientales requeridas",
        ],
        tecnica: [
          "Especificaciones técnicas de materiales",
          "Metodología de construcción propuesta",
          "Cronograma de ejecución detallado",
        ],
        economica: [
          "Presupuesto detallado por partidas",
          "Análisis de precios unitarios",
          "Garantías económicas ofrecidas",
        ],
      },
    },
    {
      id: 2,
      ruc_encontrado: "0987654321001",
      ruc_info: {
        razonSocial: "CONSULTORA TÉCNICA XYZ LTDA.",
        estadoContribuyenteRuc: "ACTIVO",
        actividadEconomicaPrincipal: "SERVICIOS DE CONSULTORÍA",
        tipoContribuyente: "SOCIEDAD",
        regimen: "RÉGIMEN GENERAL",
        categoria: "CONTRIBUYENTE NORMAL",
        obligadoLlevarContabilidad: "SI",
        agenteRetencion: "NO",
        contribuyenteEspecial: "NO",
        informacionFechasContribuyente: {
          fechaInicioActividades: "2019-03-20",
          fechaCese: null,
          fechaReinicioActividades: null,
          fechaActualizacion: "2024-02-15",
        },
        representantesLegales: [
          {
            identificacion: "0987654321",
            nombre: "MARÍA GONZÁLEZ LÓPEZ",
          },
        ],
        motivoCancelacionSuspension: null,
        contribuyenteFantasma: "NO",
        transaccionesInexistente: "NO",
      },
      clasificacion: {
        legal: ["Marco legal para servicios de consultoría", "Cumplimiento de regulaciones profesionales"],
        tecnica: ["Metodología de análisis propuesta", "Herramientas técnicas a utilizar", "Perfil del equipo técnico"],
        economica: ["Estructura de costos del servicio", "Cronograma de pagos propuesto"],
      },
    },
  ] as ClasificarResponse[],

  documentosValidados: [
    {
      id: 1,
      tipo_documento: "pliego",
      observaciones:
        "El documento cumple con los requisitos básicos. Se identificaron algunas inconsistencias menores en las especificaciones técnicas que podrían generar confusión en los oferentes.",
    },
    {
      id: 2,
      tipo_documento: "propuesta",
      observaciones:
        "La propuesta presenta una estructura sólida y cumple con la mayoría de requisitos. Se recomienda revisar la sección de garantías para mayor claridad.",
    },
    {
      id: 3,
      tipo_documento: "contrato",
      observaciones:
        "El contrato está bien estructurado y contiene las cláusulas esenciales. Se sugiere incluir penalizaciones más específicas por incumplimiento.",
    },
  ] as ValidarDocumentosResponse,

  documentosMejoras: [
    {
      id: 1,
      tipo_documento: "pliego",
      observaciones:
        "Se detectaron inconsistencias en los criterios de evaluación técnica. Los pesos asignados no suman 100% y algunas especificaciones son ambiguas.",
      recomendaciones:
        "Revisar y ajustar los pesos de evaluación para que sumen exactamente 100%. Clarificar las especificaciones técnicas ambiguas, especialmente en la sección 3.2 sobre materiales.",
      semaforo_alerta: "AMARILLO" as const,
    },
    {
      id: 2,
      tipo_documento: "propuesta",
      observaciones:
        "La propuesta cumple con los requisitos principales pero carece de algunos documentos de respaldo importantes.",
      recomendaciones:
        "Incluir certificados de calidad ISO actualizados y referencias de proyectos similares ejecutados en los últimos 3 años.",
      semaforo_alerta: "VERDE" as const,
    },
    {
      id: 3,
      tipo_documento: "contrato",
      observaciones:
        "El contrato presenta cláusulas conflictivas en las secciones de penalizaciones y garantías que podrían generar disputas legales.",
      recomendaciones:
        "Revisar urgentemente las cláusulas 15.3 y 18.7 para eliminar contradicciones. Consultar con el área legal antes de la firma.",
      semaforo_alerta: "ROJO" as const,
    },
  ] as DocumentoMejoras[],
}

// Funciones mock que simulan las llamadas a la API
export const mockApi = {
  async clasificar(formData: FormData): Promise<ClasificarResponse> {
    await new Promise((resolve) => setTimeout(resolve, 2000)) // Simular delay
    const randomIndex = Math.floor(Math.random() * mockData.clasificaciones.length)
    return mockData.clasificaciones[randomIndex]
  },

  async crearBaseVectorial(): Promise<CrearBaseVectorialResponse> {
    await new Promise((resolve) => setTimeout(resolve, 3000))
    return {
      mensaje: "Base vectorial creada con 156 fragmentos de documentos",
    }
  },

  async crearBaseVectorialDeteccion(): Promise<CrearBaseVectorialResponse> {
    await new Promise((resolve) => setTimeout(resolve, 3000))
    return {
      mensaje: "Base vectorial creada con 156 fragmentos de documentos",
    }
  },

  async validarDocumentos(): Promise<ValidarDocumentosResponse> {
    await new Promise((resolve) => setTimeout(resolve, 2500))
    return mockData.documentosValidados
  },

  async crearBaseVectorialAlertas(): Promise<CrearBaseVectorialAlertasResponse> {
    await new Promise((resolve) => setTimeout(resolve, 3000))
    return {
      mensaje: "Base vectorial de alertas creada con 89 fragmentos",
    }
  },

  async sugerirMejoras(documentoId: number): Promise<DocumentoMejoras> {
    await new Promise((resolve) => setTimeout(resolve, 1500))
    const documento = mockData.documentosMejoras.find((d) => d.id === documentoId)
    if (!documento) {
      throw new Error("Documento no encontrado")
    }
    return documento
  },

  async sugerirMejorasAlertas(documentoId: number): Promise<DocumentoMejoras> {
    await new Promise((resolve) => setTimeout(resolve, 1500))
    const documento = mockData.documentosMejoras.find((d) => d.id === documentoId)
    if (!documento) {
      throw new Error("Documento no encontrado")
    }
    return documento
  },
}
