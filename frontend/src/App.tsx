import { FormEvent, type ReactNode, useEffect, useMemo, useState } from 'react'
import { api } from './api'
import type { Experiment, Problem, Result, Technique } from './types'

type ProblemForm = {
  titulo: string
  dificultad: string
  descripcion: string
  restricciones: string
}

type TechniqueForm = {
  nombre: string
  descripcion: string
}

type ExperimentForm = {
  id_problema: string
  id_tecnica: string
  prompt_generado: string
  codigo_generado: string
}

type ResultForm = {
  id_experimento: string
  exactitud_funcional: string
  maintainability_index: string
  complejidad: string
  cognitive_complexity: string
  code_smells: string
}

const emptyProblemForm: ProblemForm = {
  titulo: '',
  dificultad: '',
  descripcion: '',
  restricciones: '',
}

const emptyTechniqueForm: TechniqueForm = {
  nombre: '',
  descripcion: '',
}

const emptyExperimentForm: ExperimentForm = {
  id_problema: '',
  id_tecnica: '',
  prompt_generado: '',
  codigo_generado: '',
}

const emptyResultForm: ResultForm = {
  id_experimento: '',
  exactitud_funcional: '',
  maintainability_index: '',
  complejidad: '',
  cognitive_complexity: '',
  code_smells: '',
}

function App() {
  const [problems, setProblems] = useState<Problem[]>([])
  const [techniques, setTechniques] = useState<Technique[]>([])
  const [experiments, setExperiments] = useState<Experiment[]>([])
  const [results, setResults] = useState<Result[]>([])
  const [problemForm, setProblemForm] = useState<ProblemForm>(emptyProblemForm)
  const [techniqueForm, setTechniqueForm] = useState<TechniqueForm>(emptyTechniqueForm)
  const [experimentForm, setExperimentForm] = useState<ExperimentForm>(emptyExperimentForm)
  const [resultForm, setResultForm] = useState<ResultForm>(emptyResultForm)
  const [selectedProblemId, setSelectedProblemId] = useState<number | null>(null)
  const [selectedTechniqueId, setSelectedTechniqueId] = useState<number | null>(null)
  const [selectedExperimentId, setSelectedExperimentId] = useState<number | null>(null)
  const [selectedResultId, setSelectedResultId] = useState<number | null>(null)
  const [status, setStatus] = useState('Listo para probar la API')
  const [busy, setBusy] = useState(false)

  const selectedProblem = useMemo(
    () => problems.find((problem) => problem.id_problema === selectedProblemId) ?? null,
    [problems, selectedProblemId],
  )
  const selectedTechnique = useMemo(
    () => techniques.find((technique) => technique.id_tecnica === selectedTechniqueId) ?? null,
    [selectedTechniqueId, techniques],
  )
  const selectedExperiment = useMemo(
    () => experiments.find((experiment) => experiment.id_experimento === selectedExperimentId) ?? null,
    [experiments, selectedExperimentId],
  )
  const selectedResult = useMemo(
    () => results.find((result) => result.id_resultado === selectedResultId) ?? null,
    [results, selectedResultId],
  )

  async function loadAll() {
    setBusy(true)
    try {
      const [nextProblems, nextTechniques, nextExperiments, nextResults] = await Promise.all([
        api.problems.list(),
        api.techniques.list(),
        api.experiments.list(),
        api.results.list(),
      ])
      setProblems(nextProblems)
      setTechniques(nextTechniques)
      setExperiments(nextExperiments)
      setResults(nextResults)
      setStatus('Datos sincronizados con el backend')
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Error cargando datos')
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    void loadAll()
  }, [])

  async function handleProblemSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    try {
      if (selectedProblem) {
        await api.problems.update(selectedProblem.id_problema, problemForm)
        setStatus(`Problema ${selectedProblem.id_problema} actualizado`)
      } else {
        await api.problems.create(problemForm)
        setStatus('Problema creado')
      }
      setProblemForm(emptyProblemForm)
      setSelectedProblemId(null)
      await loadAll()
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Error guardando problema')
    } finally {
      setBusy(false)
    }
  }

  async function handleTechniqueSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    try {
      if (selectedTechnique) {
        await api.techniques.update(selectedTechnique.id_tecnica, techniqueForm)
        setStatus(`Técnica ${selectedTechnique.id_tecnica} actualizada`)
      } else {
        await api.techniques.create(techniqueForm)
        setStatus('Técnica creada')
      }
      setTechniqueForm(emptyTechniqueForm)
      setSelectedTechniqueId(null)
      await loadAll()
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Error guardando técnica')
    } finally {
      setBusy(false)
    }
  }

  async function handleExperimentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    try {
      const payload = {
        id_problema: Number(experimentForm.id_problema),
        id_tecnica: Number(experimentForm.id_tecnica),
        prompt_generado: experimentForm.prompt_generado,
        codigo_generado: experimentForm.codigo_generado,
      }

      if (selectedExperiment) {
        await api.experiments.update(selectedExperiment.id_experimento, payload)
        setStatus(`Experimento ${selectedExperiment.id_experimento} actualizado`)
      } else {
        await api.experiments.create(payload)
        setStatus('Experimento creado y ejecutado')
      }

      setExperimentForm(emptyExperimentForm)
      setSelectedExperimentId(null)
      await loadAll()
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Error creando experimento')
    } finally {
      setBusy(false)
    }
  }

  async function handleExperimentExecute() {
    if (!experimentForm.id_problema || !experimentForm.id_tecnica) {
      setStatus('Selecciona problema y técnica para ejecutar')
      return
    }
    setBusy(true)
    try {
      await api.experiments.execute({
        problem_id: Number(experimentForm.id_problema),
        technique_id: Number(experimentForm.id_tecnica),
      })
      setStatus('Experimento ejecutado')
      await loadAll()
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Error ejecutando experimento')
    } finally {
      setBusy(false)
    }
  }

  async function handleResultSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    try {
      const payload = {
        id_experimento: Number(resultForm.id_experimento),
        exactitud_funcional: resultForm.exactitud_funcional ? Number(resultForm.exactitud_funcional) : null,
        maintainability_index: resultForm.maintainability_index ? Number(resultForm.maintainability_index) : null,
        complejidad: resultForm.complejidad ? Number(resultForm.complejidad) : null,
        cognitive_complexity: resultForm.cognitive_complexity ? Number(resultForm.cognitive_complexity) : null,
        code_smells: resultForm.code_smells ? Number(resultForm.code_smells) : null,
      }

      if (selectedResult) {
        await api.results.update(selectedResult.id_resultado, payload)
        setStatus(`Resultado ${selectedResult.id_resultado} actualizado`)
      } else {
        await api.results.create(payload)
        setStatus('Resultado creado')
      }

      setResultForm(emptyResultForm)
      setSelectedResultId(null)
      await loadAll()
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Error guardando resultado')
    } finally {
      setBusy(false)
    }
  }

  async function removeProblem(id: number) {
    setBusy(true)
    try {
      await api.problems.remove(id)
      setStatus(`Problema ${id} eliminado`)
      await loadAll()
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Error eliminando problema')
    } finally {
      setBusy(false)
    }
  }

  async function removeTechnique(id: number) {
    setBusy(true)
    try {
      await api.techniques.remove(id)
      setStatus(`Técnica ${id} eliminada`)
      await loadAll()
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Error eliminando técnica')
    } finally {
      setBusy(false)
    }
  }

  async function removeExperiment(id: number) {
    setBusy(true)
    try {
      await api.experiments.remove(id)
      setStatus(`Experimento ${id} eliminado`)
      await loadAll()
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Error eliminando experimento')
    } finally {
      setBusy(false)
    }
  }

  async function removeResult(id: number) {
    setBusy(true)
    try {
      await api.results.remove(id)
      setStatus(`Resultado ${id} eliminado`)
      await loadAll()
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Error eliminando resultado')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Investigacion Lab</p>
          <h1>CRUD visual para validar la base de datos y la experimentación</h1>
          <p className="lede">
            Crea, edita y elimina problemas, técnicas, experimentos y resultados desde una interfaz única.
            También puedes lanzar experimentos con el backend y revisar las métricas generadas.
          </p>
        </div>
        <div className="status-card">
          <span className="status-label">Estado</span>
          <strong>{busy ? 'Procesando...' : 'Listo'}</strong>
          <p>{status}</p>
          <button type="button" className="secondary" onClick={() => void loadAll()}>
            Refrescar todo
          </button>
        </div>
      </section>

      <section className="grid two-up">
        <CrudPanel
          title="Problemas"
          subtitle="Tabla problemas"
          form={
            <form onSubmit={handleProblemSubmit} className="form-grid">
              <input value={problemForm.titulo} onChange={(event) => setProblemForm({ ...problemForm, titulo: event.target.value })} placeholder="Título" />
              <input value={problemForm.dificultad} onChange={(event) => setProblemForm({ ...problemForm, dificultad: event.target.value })} placeholder="Dificultad" />
              <textarea value={problemForm.descripcion} onChange={(event) => setProblemForm({ ...problemForm, descripcion: event.target.value })} placeholder="Descripción" />
              <textarea value={problemForm.restricciones} onChange={(event) => setProblemForm({ ...problemForm, restricciones: event.target.value })} placeholder="Restricciones" />
              <div className="actions-row">
                <button type="submit">{selectedProblem ? 'Actualizar problema' : 'Crear problema'}</button>
                {selectedProblem && (
                  <button type="button" className="ghost" onClick={() => { setSelectedProblemId(null); setProblemForm(emptyProblemForm) }}>
                    Cancelar edición
                  </button>
                )}
              </div>
            </form>
          }
          table={<EntityTable<Problem> rows={problems} onEdit={(row) => { setSelectedProblemId(row.id_problema); setProblemForm({ titulo: row.titulo, dificultad: row.dificultad ?? '', descripcion: row.descripcion ?? '', restricciones: row.restricciones ?? '' }) }} onDelete={(row) => void removeProblem(row.id_problema)} renderRow={(row) => [row.id_problema, row.titulo, row.dificultad ?? '-', row.descripcion ?? '-', row.restricciones ?? '-']} />}
        />

        <CrudPanel
          title="Técnicas"
          subtitle="Tabla técnicas"
          form={
            <form onSubmit={handleTechniqueSubmit} className="form-grid">
              <input value={techniqueForm.nombre} onChange={(event) => setTechniqueForm({ ...techniqueForm, nombre: event.target.value })} placeholder="Nombre" />
              <textarea value={techniqueForm.descripcion} onChange={(event) => setTechniqueForm({ ...techniqueForm, descripcion: event.target.value })} placeholder="Descripción" />
              <div className="actions-row">
                <button type="submit">{selectedTechnique ? 'Actualizar técnica' : 'Crear técnica'}</button>
                {selectedTechnique && (
                  <button type="button" className="ghost" onClick={() => { setSelectedTechniqueId(null); setTechniqueForm(emptyTechniqueForm) }}>
                    Cancelar edición
                  </button>
                )}
              </div>
            </form>
          }
          table={<EntityTable<Technique> rows={techniques} onEdit={(row) => { setSelectedTechniqueId(row.id_tecnica); setTechniqueForm({ nombre: row.nombre, descripcion: row.descripcion ?? '' }) }} onDelete={(row) => void removeTechnique(row.id_tecnica)} renderRow={(row) => [row.id_tecnica, row.nombre, row.descripcion ?? '-']} />}
        />
      </section>

      <section className="grid two-up">
        <CrudPanel
          title="Experimentos"
          subtitle="Tabla experimentos y controles"
          form={
            <form onSubmit={handleExperimentSubmit} className="form-grid">
              <select value={experimentForm.id_problema} onChange={(event) => setExperimentForm({ ...experimentForm, id_problema: event.target.value })}>
                <option value="">Selecciona un problema</option>
                {problems.map((problem) => (
                  <option key={problem.id_problema} value={problem.id_problema}>{problem.id_problema} - {problem.titulo}</option>
                ))}
              </select>
              <select value={experimentForm.id_tecnica} onChange={(event) => setExperimentForm({ ...experimentForm, id_tecnica: event.target.value })}>
                <option value="">Selecciona una técnica</option>
                {techniques.map((technique) => (
                  <option key={technique.id_tecnica} value={technique.id_tecnica}>{technique.id_tecnica} - {technique.nombre}</option>
                ))}
              </select>
              <textarea value={experimentForm.prompt_generado} onChange={(event) => setExperimentForm({ ...experimentForm, prompt_generado: event.target.value })} placeholder="Prompt opcional de referencia" />
              <textarea value={experimentForm.codigo_generado} onChange={(event) => setExperimentForm({ ...experimentForm, codigo_generado: event.target.value })} placeholder="Código opcional de referencia" />
              <div className="actions-row">
                <button type="submit">{selectedExperiment ? 'Actualizar experimento' : 'Crear experimento'}</button>
                <button type="button" className="secondary" onClick={handleExperimentExecute}>Ejecutar experimento</button>
              </div>
              {selectedExperiment && (
                <button type="button" className="ghost" onClick={() => { setSelectedExperimentId(null); setExperimentForm(emptyExperimentForm) }}>
                  Cancelar edición
                </button>
              )}
            </form>
          }
          table={<EntityTable<Experiment> rows={experiments} onEdit={(row) => { setSelectedExperimentId(row.id_experimento); setExperimentForm({ id_problema: String(row.id_problema), id_tecnica: String(row.id_tecnica), prompt_generado: row.prompt_generado, codigo_generado: row.codigo_generado }) }} onDelete={(row) => void removeExperiment(row.id_experimento)} renderRow={(row) => [row.id_experimento, row.id_problema, row.id_tecnica, row.fecha_ejecucion ?? '-', row.prompt_generado.slice(0, 48)]} />}
        />

        <div className="panel spotlight">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Control experimental</p>
              <h2>Ejecutar y revisar</h2>
            </div>
            <button type="button" className="secondary" onClick={handleExperimentExecute}>Lanzar ahora</button>
          </div>
          <div className="control-list">
            <div><span>Problema</span><strong>{selectedProblem ? `${selectedProblem.id_problema} - ${selectedProblem.titulo}` : 'Ninguno seleccionado'}</strong></div>
            <div><span>Técnica</span><strong>{selectedTechnique ? `${selectedTechnique.id_tecnica} - ${selectedTechnique.nombre}` : 'Ninguna seleccionada'}</strong></div>
            <div><span>Experimento</span><strong>{selectedExperiment ? selectedExperiment.id_experimento : 'Ninguno seleccionado'}</strong></div>
            <div><span>Resultado</span><strong>{selectedResult ? selectedResult.id_resultado : 'Ninguno seleccionado'}</strong></div>
          </div>
          <p className="hint">
            Usa las listas de abajo para editar, y esta tarjeta para lanzar la ejecución con el problema y la técnica elegidos.
          </p>
        </div>
      </section>

      <section className="grid two-up">
        <CrudPanel
          title="Resultados"
          subtitle="Tabla resultados"
          form={
            <form onSubmit={handleResultSubmit} className="form-grid">
              <select value={resultForm.id_experimento} onChange={(event) => setResultForm({ ...resultForm, id_experimento: event.target.value })}>
                <option value="">Selecciona un experimento</option>
                {experiments.map((experiment) => (
                  <option key={experiment.id_experimento} value={experiment.id_experimento}>{experiment.id_experimento}</option>
                ))}
              </select>
              <input value={resultForm.exactitud_funcional} onChange={(event) => setResultForm({ ...resultForm, exactitud_funcional: event.target.value })} placeholder="Exactitud funcional" />
              <input value={resultForm.maintainability_index} onChange={(event) => setResultForm({ ...resultForm, maintainability_index: event.target.value })} placeholder="Maintainability index" />
              <input value={resultForm.complejidad} onChange={(event) => setResultForm({ ...resultForm, complejidad: event.target.value })} placeholder="Complejidad" />
              <input value={resultForm.cognitive_complexity} onChange={(event) => setResultForm({ ...resultForm, cognitive_complexity: event.target.value })} placeholder="Cognitive complexity" />
              <input value={resultForm.code_smells} onChange={(event) => setResultForm({ ...resultForm, code_smells: event.target.value })} placeholder="Code smells" />
              <div className="actions-row">
                <button type="submit">{selectedResult ? 'Actualizar resultado' : 'Crear resultado'}</button>
                {selectedResult && (
                  <button type="button" className="ghost" onClick={() => { setSelectedResultId(null); setResultForm(emptyResultForm) }}>
                    Cancelar edición
                  </button>
                )}
              </div>
            </form>
          }
          table={<EntityTable<Result> rows={results} onEdit={(row) => { setSelectedResultId(row.id_resultado); setResultForm({ id_experimento: String(row.id_experimento), exactitud_funcional: row.exactitud_funcional?.toString() ?? '', maintainability_index: row.maintainability_index?.toString() ?? '', complejidad: row.complejidad?.toString() ?? '', cognitive_complexity: row.cognitive_complexity?.toString() ?? '', code_smells: row.code_smells?.toString() ?? '' }) }} onDelete={(row) => void removeResult(row.id_resultado)} renderRow={(row) => [row.id_resultado, row.id_experimento, row.exactitud_funcional ?? '-', row.maintainability_index ?? '-', row.code_smells ?? '-']} />}
        />

        <div className="panel preview-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Detalle</p>
              <h2>Vista de selección</h2>
            </div>
          </div>
          <pre>{JSON.stringify({ selectedProblem, selectedTechnique, selectedExperiment, selectedResult }, null, 2)}</pre>
        </div>
      </section>
    </main>
  )
}

function CrudPanel({ title, subtitle, form, table }: { title: string; subtitle: string; form: ReactNode; table: ReactNode }) {
  return (
    <article className="panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">{subtitle}</p>
          <h2>{title}</h2>
        </div>
      </div>
      {form}
      {table}
    </article>
  )
}

function EntityTable<T extends { [key: string]: unknown }>({
  rows,
  renderRow,
  onEdit,
  onDelete,
}: {
  rows: T[]
  renderRow: (row: T) => Array<string | number>
  onEdit: (row: T) => void
  onDelete: (row: T) => void
}) {
  return (
    <div className="table-wrap">
      <table>
        <tbody>
          {rows.map((row) => (
            <tr key={String(renderRow(row)[0])}>
              {renderRow(row).map((cell, index) => (
                <td key={`${String(cell)}-${index}`}>{String(cell)}</td>
              ))}
              <td className="row-actions">
                <button type="button" className="small" onClick={() => onEdit(row)}>Editar</button>
                <button type="button" className="small danger" onClick={() => onDelete(row)}>Eliminar</button>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={99} className="empty-state">Sin registros todavía</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default App