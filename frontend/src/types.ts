export type Problem = {
  id_problema: number
  titulo: string
  dificultad: string | null
  descripcion: string | null
  restricciones: string | null
}

export type Technique = {
  id_tecnica: number
  nombre: string
  descripcion: string | null
}

export type Experiment = {
  id_experimento: number
  id_problema: number
  id_tecnica: number
  prompt_generado: string
  codigo_generado: string
  fecha_ejecucion: string | null
}

export type Result = {
  id_resultado: number
  id_experimento: number
  exactitud_funcional: number | null
  maintainability_index: number | null
  complejidad: number | null
  cognitive_complexity: number | null
  code_smells: number | null
  fecha_registro: string | null
}
