"use client"

import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react"
import type { AppState, DataMode, DocumentoMin } from "@/types"

interface AppContextType extends AppState {
  setDataMode: (mode: DataMode) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  addClasificacion: (clasificacion: any) => void
  setDocumentos: (documentos: any[]) => void
  documentos: DocumentoMin[]
  addDocumento: (documento: DocumentoMin) => void
  apiBaseUrl: string
  setApiBaseUrl: (url: string) => void
  lastDetectionBuild: string | null
  setLastDetectionBuild: (timestamp: string | null) => void
  lastAlertsBuild: string | null
  setLastAlertsBuild: (timestamp: string | null) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

type AppAction =
  | { type: "SET_DATA_MODE"; payload: DataMode }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "ADD_CLASIFICACION"; payload: any }
  | { type: "SET_DOCUMENTOS"; payload: any[] }
  | { type: "ADD_DOCUMENTO"; payload: DocumentoMin }
  | { type: "SET_API_BASE_URL"; payload: string }
  | { type: "SET_LAST_DETECTION_BUILD"; payload: string | null }
  | { type: "SET_LAST_ALERTS_BUILD"; payload: string | null }

const initialState: AppState = {
  dataMode: "MOCK",
  isLoading: false,
  error: null,
  documentos: [],
  clasificaciones: [],
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_DATA_MODE":
      return { ...state, dataMode: action.payload }
    case "SET_LOADING":
      return { ...state, isLoading: action.payload }
    case "SET_ERROR":
      return { ...state, error: action.payload }
    case "ADD_CLASIFICACION":
      return {
        ...state,
        clasificaciones: [...state.clasificaciones, action.payload],
      }
    case "SET_DOCUMENTOS":
      return { ...state, documentos: action.payload }
    case "ADD_DOCUMENTO":
      return {
        ...state,
        documentos: [...state.documentos, action.payload],
      }
    case "SET_API_BASE_URL":
      return { ...state, apiBaseUrl: action.payload }
    case "SET_LAST_DETECTION_BUILD":
      return { ...state, lastDetectionBuild: action.payload }
    case "SET_LAST_ALERTS_BUILD":
      return { ...state, lastAlertsBuild: action.payload }
    default:
      return state
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, {
    ...initialState,
    documentos: [],
    apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000",
    lastDetectionBuild: null,
    lastAlertsBuild: null,
  })

  useEffect(() => {
    const savedDataMode = localStorage.getItem("dataMode") as DataMode
    const savedDocumentos = localStorage.getItem("documentos")
    const savedApiUrl = localStorage.getItem("apiBaseUrl")
    const savedDetectionBuild = localStorage.getItem("lastDetectionBuild")
    const savedAlertsBuild = localStorage.getItem("lastAlertsBuild")

    if (savedDataMode) {
      dispatch({ type: "SET_DATA_MODE", payload: savedDataMode })
    }
    if (savedDocumentos) {
      try {
        const documentos = JSON.parse(savedDocumentos)
        dispatch({ type: "SET_DOCUMENTOS", payload: documentos })
      } catch (error) {
        console.error("Error parsing saved documentos:", error)
      }
    }
    if (savedApiUrl) {
      dispatch({ type: "SET_API_BASE_URL", payload: savedApiUrl })
    }
    if (savedDetectionBuild) {
      dispatch({ type: "SET_LAST_DETECTION_BUILD", payload: savedDetectionBuild })
    }
    if (savedAlertsBuild) {
      dispatch({ type: "SET_LAST_ALERTS_BUILD", payload: savedAlertsBuild })
    }

    const handleDataModeChange = (event: CustomEvent) => {
      dispatch({ type: "SET_DATA_MODE", payload: event.detail })
    }

    window.addEventListener("dataMode-changed", handleDataModeChange as EventListener)

    return () => {
      window.removeEventListener("dataMode-changed", handleDataModeChange as EventListener)
    }
  }, [])

  const contextValue: AppContextType = {
    ...state,
    setDataMode: (mode: DataMode) => {
      dispatch({ type: "SET_DATA_MODE", payload: mode })
      localStorage.setItem("dataMode", mode)
    },
    setLoading: (loading: boolean) => dispatch({ type: "SET_LOADING", payload: loading }),
    setError: (error: string | null) => dispatch({ type: "SET_ERROR", payload: error }),
    addClasificacion: (clasificacion: any) => dispatch({ type: "ADD_CLASIFICACION", payload: clasificacion }),
    setDocumentos: (documentos: any[]) => {
      dispatch({ type: "SET_DOCUMENTOS", payload: documentos })
      localStorage.setItem("documentos", JSON.stringify(documentos))
    },
    addDocumento: (documento: DocumentoMin) => {
      dispatch({ type: "ADD_DOCUMENTO", payload: documento })
      const updatedDocumentos = [...state.documentos, documento]
      localStorage.setItem("documentos", JSON.stringify(updatedDocumentos))
    },
    setApiBaseUrl: (url: string) => {
      dispatch({ type: "SET_API_BASE_URL", payload: url })
      localStorage.setItem("apiBaseUrl", url)
    },
    setLastDetectionBuild: (timestamp: string | null) => {
      dispatch({ type: "SET_LAST_DETECTION_BUILD", payload: timestamp })
      if (timestamp) {
        localStorage.setItem("lastDetectionBuild", timestamp)
      } else {
        localStorage.removeItem("lastDetectionBuild")
      }
    },
    setLastAlertsBuild: (timestamp: string | null) => {
      dispatch({ type: "SET_LAST_ALERTS_BUILD", payload: timestamp })
      if (timestamp) {
        localStorage.setItem("lastAlertsBuild", timestamp)
      } else {
        localStorage.removeItem("lastAlertsBuild")
      }
    },
  }

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
