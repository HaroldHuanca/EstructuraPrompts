import { FormEvent, useEffect, useMemo, useState } from 'react'
import { api } from './api'
import type { CaseTest, ExecutionTest, Experiment, Problem, Result, Technique } from './types'

type ProblemForm = {
  titulo: string
  dificultad: string
  descripcion: string
  restricciones: string
}

type CaseForm = {
  id_problema: string
  datos_entrada: string
  salida_esperada: string
  descripcion: string
}

const emptyProblemForm: ProblemForm = {
  titulo: '',
  dificultad: '',
  descripcion: '',
  restricciones: '',
}

const emptyCaseForm: CaseForm = {
  id_problema: '',
  datos_entrada: '{\n  "valor": 1\n}',
  salida_esperada: '{\n  "valor": 1\n}',
  descripcion: '',
}

function App() {
  const [problems, setProblems] = useState<Problem[]>([])
  const [casesTests, setCasesTests] = useState<CaseTest[]>([])
  const [techniques, setTechniques] = useState<Technique[]>([])
  const [experiments, setExperiments] = useState<Experiment[]>([])
  const [results, setResults] = useState<Result[]>([])
  const [executionTests, setExecutionTests] = useState<ExecutionTest[]>([])

  const [problemForm, setProblemForm] = useState<ProblemForm>(emptyProblemForm)
  const [caseForm, setCaseForm] = useState<CaseForm>(emptyCaseForm)
  const [editingProblemId, setEditingProblemId] = useState<number | null>(null)
  const [editingCaseId, setEditingCaseId] = useState<number | null>(null)
  const [selectedProblemIds, setSelectedProblemIds] = useState<number[]>([])
  const [experimentTechniqueId, setExperimentTechniqueId] = useState('')
  const [status, setStatus] = useState('Listo para probar la API')
  const [busy, setBusy] = useState(false)

  const selectedProblem = useMemo(
    () => problems.find((problem) => problem.id_problema === editingProblemId) ?? null,
    [editingProblemId, problems],
  )
  const selectedCase = useMemo(
    () => casesTests.find((caseTest) => caseTest.id_caso_prueba === editingCaseId) ?? null,
    [casesTests, editingCaseId],
  )

  const pendingProblems = useMemo(() => {
    const problemIdsWithExperiments = new Set(experiments.map((experiment) => experiment.id_problema))
    return problems.filter((problem) => !problemIdsWithExperiments.has(problem.id_problema))
  }, [experiments, problems])

  const techniqueById = useMemo(() => new Map(techniques.map((technique) => [technique.id_tecnica, technique])), [techniques])
  const problemById = useMemo(() => new Map(problems.map((problem) => [problem.id_problema, problem])), [problems])
  const caseById = useMemo(() => new Map(casesTests.map((caseTest) => [caseTest.id_caso_prueba, caseTest])), [casesTests])
  const experimentById = useMemo(() => new Map(experiments.map((experiment) => [experiment.id_experimento, experiment])), [experiments])

  async function loadAll() {
    setBusy(true)
    try {
      const [nextProblems, nextCases, nextTechniques, nextExperiments, nextResults, nextExecutionTests] = await Promise.all([
        api.problems.list(),
        api.cases.list(),
        api.techniques.list(),
        api.experiments.list(),
        api.results.list(),
        api.executionTests.list(),
      ])
      setProblems(nextProblems as Problem[])
      setCasesTests(nextCases as CaseTest[])
      setTechniques(nextTechniques as Technique[])
      setExperiments(nextExperiments as Experiment[])
      setResults(nextResults as Result[])
      setExecutionTests(nextExecutionTests as ExecutionTest[])
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

  useEffect(() => {
    if (!experimentTechniqueId && techniques.length > 0) {
      setExperimentTechniqueId(String(techniques[0].id_tecnica))
    }
  }, [experimentTechniqueId, techniques])

  useEffect(() => {
    if (!caseForm.id_problema && problems.length > 0) {
      setCaseForm((current) => ({ ...current, id_problema: String(problems[0].id_problema) }))
    }
  }, [caseForm.id_problema, problems])

  async function handleProblemSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    try {
      const payload = {
        titulo: problemForm.titulo,
        dificultad: problemForm.dificultad || null,
        descripcion: problemForm.descripcion || null,
        restricciones: problemForm.restricciones || null,
      }

      if (selectedProblem) {
        await api.problems.update(selectedProblem.id_problema, payload)
        setStatus(`Problema ${selectedProblem.id_problema} actualizado`)
      } else {
        await api.problems.create(payload)
        setStatus('Problema creado')
      }

      setProblemForm(emptyProblemForm)
      setEditingProblemId(null)
      await loadAll()
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Error guardando problema')
    } finally {
      setBusy(false)
    }
  }

  async function handleCaseSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    try {
      const payload = {
        id_problema: Number(caseForm.id_problema),
        datos_entrada: JSON.parse(caseForm.datos_entrada),
        salida_esperada: JSON.parse(caseForm.salida_esperada),
        descripcion: caseForm.descripcion || null,
      }

      if (selectedCase) {
        await api.cases.update(selectedCase.id_caso_prueba, payload)
        setStatus(`Caso de prueba ${selectedCase.id_caso_prueba} actualizado`)
      } else {
        await api.cases.create(payload)
        setStatus('Caso de prueba creado')
      }

      setCaseForm(emptyCaseForm)
      setEditingCaseId(null)
      await loadAll()
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Error guardando caso de prueba')
    } finally {
      setBusy(false)
    }
  }

  async function removeProblem(id: number) {
    setBusy(true)
    try {
      await api.problems.remove(id)
      setSelectedProblemIds((current) => current.filter((problemId) => problemId !== id))
      setStatus(`Problema ${id} eliminado`)
      await loadAll()
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Error eliminando problema')
    } finally {
      setBusy(false)
    }
  }

  async function removeCase(id: number) {
    setBusy(true)
    try {
      await api.cases.remove(id)
      setStatus(`Caso de prueba ${id} eliminado`)
      await loadAll()
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Error eliminando caso de prueba')
    } finally {
      setBusy(false)
    }
  }

  async function runSingleProblem(problemId: number) {
    if (!experimentTechniqueId) {
      setStatus('Selecciona una técnica para ejecutar experimentos')
      return
    }

    setBusy(true)
    try {
      await api.experiments.runSingle(problemId, Number(experimentTechniqueId))
      setStatus(`Experimento ejecutado para el problema ${problemId}`)
      await loadAll()
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Error ejecutando experimento')
    } finally {
      setBusy(false)
    }
  }

  async function runSelectedProblems() {
    if (!experimentTechniqueId) {
      setStatus('Selecciona una técnica para ejecutar experimentos')
      return
    }

    if (selectedProblemIds.length === 0) {
      setStatus('Selecciona al menos un problema')
      return
    }

    setBusy(true)
    try {
      await api.experiments.runBatch(selectedProblemIds, Number(experimentTechniqueId))
      setStatus(`Experimentos ejecutados para ${selectedProblemIds.length} problemas seleccionados`)
      await loadAll()
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Error ejecutando lote de experimentos')
    } finally {
      setBusy(false)
    }
  }

  async function runPendingProblems() {
    if (!experimentTechniqueId) {
      setStatus('Selecciona una técnica para ejecutar experimentos')
      return
    }

    setBusy(true)
    try {
      await api.experiments.runPending(Number(experimentTechniqueId))
      setStatus(`Experimentos ejecutados para ${pendingProblems.length} problemas pendientes`)
      await loadAll()
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Error ejecutando problemas pendientes')
    } finally {
      setBusy(false)
    }
  }

  const toggleProblemSelection = (problemId: number) => {
    setSelectedProblemIds((current) =>
      current.includes(problemId) ? current.filter((id) => id !== problemId) : [...current, problemId],
    )
  }

  return (
    <main className="shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Investigacion Lab</p>
          <h1>CRUD visual y controles de experimentación</h1>
          <p className="lede">
            Solo problemas y casos_prueba son editables desde la interfaz. El resto de tablas se muestran en modo lectura,
            mientras que los experimentos se lanzan desde el panel de problemas.
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
        <article className="panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Problemas</p>
              <h2>CRUD y experimentación</h2>
            </div>
            <div className="status-pill">Pendientes: {pendingProblems.length}</div>
          </div>

          <form onSubmit={handleProblemSubmit} className="form-grid">
            <input
              value={problemForm.titulo}
              onChange={(event) => setProblemForm({ ...problemForm, titulo: event.target.value })}
              placeholder="Título"
            />
            <input
              value={problemForm.dificultad}
              onChange={(event) => setProblemForm({ ...problemForm, dificultad: event.target.value })}
              placeholder="Dificultad"
            />
            <textarea
              value={problemForm.descripcion}
              onChange={(event) => setProblemForm({ ...problemForm, descripcion: event.target.value })}
              placeholder="Descripción"
            />
            <textarea
              value={problemForm.restricciones}
              onChange={(event) => setProblemForm({ ...problemForm, restricciones: event.target.value })}
              placeholder="Restricciones"
            />
            <div className="actions-row">
              <button type="submit">{selectedProblem ? 'Actualizar problema' : 'Crear problema'}</button>
              {selectedProblem && (
                <button
                  type="button"
                  className="ghost"
                  onClick={() => {
                    setEditingProblemId(null)
                    setProblemForm(emptyProblemForm)
                  }}
                >
                  Cancelar edición
                </button>
              )}
            </div>
          </form>

          <div className="toolbar">
            <label>
              Técnica para experimentos
              <select value={experimentTechniqueId} onChange={(event) => setExperimentTechniqueId(event.target.value)}>
                <option value="">Selecciona una técnica</option>
                {techniques.map((technique) => (
                  <option key={technique.id_tecnica} value={technique.id_tecnica}>
                    {technique.nombre}
                  </option>
                ))}
              </select>
            </label>
            <div className="actions-row">
              <button type="button" className="secondary" onClick={() => void runSelectedProblems()}>
                Ejecutar seleccionados
              </button>
              <button type="button" className="secondary" onClick={() => void runPendingProblems()}>
                Ejecutar pendientes
              </button>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>ID</th>
                  <th>Título</th>
                  <th>Dificultad</th>
                  <th>Descripción</th>
                  <th>Restricciones</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {problems.map((problem) => (
                  <tr key={problem.id_problema}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedProblemIds.includes(problem.id_problema)}
                        onChange={() => toggleProblemSelection(problem.id_problema)}
                      />
                    </td>
                    <td>{problem.id_problema}</td>
                    <td>{problem.titulo}</td>
                    <td>{problem.dificultad ?? '-'}</td>
                    <td>{problem.descripcion ?? '-'}</td>
                    <td>{problem.restricciones ?? '-'}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="small"
                          onClick={() => {
                            setEditingProblemId(problem.id_problema)
                            setProblemForm({
                              titulo: problem.titulo,
                              dificultad: problem.dificultad ?? '',
                              descripcion: problem.descripcion ?? '',
                              restricciones: problem.restricciones ?? '',
                            })
                          }}
                        >
                          Editar
                        </button>
                        <button type="button" className="small danger" onClick={() => void removeProblem(problem.id_problema)}>
                          Eliminar
                        </button>
                        <button type="button" className="small secondary" onClick={() => void runSingleProblem(problem.id_problema)}>
                          Ejecutar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {problems.length === 0 && (
                  <tr>
                    <td colSpan={7} className="empty-state">
                      Sin problemas todavía
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className="panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Casos de prueba</p>
              <h2>CRUD editable</h2>
            </div>
          </div>

          <form onSubmit={handleCaseSubmit} className="form-grid">
            <select value={caseForm.id_problema} onChange={(event) => setCaseForm({ ...caseForm, id_problema: event.target.value })}>
              <option value="">Selecciona un problema</option>
              {problems.map((problem) => (
                <option key={problem.id_problema} value={problem.id_problema}>
                  {problem.id_problema} - {problem.titulo}
                </option>
              ))}
            </select>
            <textarea
              value={caseForm.datos_entrada}
              onChange={(event) => setCaseForm({ ...caseForm, datos_entrada: event.target.value })}
              placeholder="Datos de entrada JSON"
            />
            <textarea
              value={caseForm.salida_esperada}
              onChange={(event) => setCaseForm({ ...caseForm, salida_esperada: event.target.value })}
              placeholder="Salida esperada JSON"
            />
            <textarea
              value={caseForm.descripcion}
              onChange={(event) => setCaseForm({ ...caseForm, descripcion: event.target.value })}
              placeholder="Descripción"
            />
            <div className="actions-row">
              <button type="submit">{selectedCase ? 'Actualizar caso de prueba' : 'Crear caso de prueba'}</button>
              {selectedCase && (
                <button
                  type="button"
                  className="ghost"
                  onClick={() => {
                    setEditingCaseId(null)
                    setCaseForm(emptyCaseForm)
                  }}
                >
                  Cancelar edición
                </button>
              )}
            </div>
          </form>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Problema</th>
                  <th>Entrada</th>
                  <th>Esperada</th>
                  <th>Descripción</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {casesTests.map((caseTest) => (
                  <tr key={caseTest.id_caso_prueba}>
                    <td>{caseTest.id_caso_prueba}</td>
                    <td>{problemById.get(caseTest.id_problema)?.titulo ?? caseTest.id_problema}</td>
                    <td>{summarizeJson(caseTest.datos_entrada)}</td>
                    <td>{summarizeJson(caseTest.salida_esperada)}</td>
                    <td>{caseTest.descripcion ?? '-'}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="small"
                          onClick={() => {
                            setEditingCaseId(caseTest.id_caso_prueba)
                            setCaseForm({
                              id_problema: String(caseTest.id_problema),
                              datos_entrada: JSON.stringify(caseTest.datos_entrada, null, 2),
                              salida_esperada: JSON.stringify(caseTest.salida_esperada, null, 2),
                              descripcion: caseTest.descripcion ?? '',
                            })
                          }}
                        >
                          Editar
                        </button>
                        <button type="button" className="small danger" onClick={() => void removeCase(caseTest.id_caso_prueba)}>
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {casesTests.length === 0 && (
                  <tr>
                    <td colSpan={6} className="empty-state">
                      Sin casos de prueba todavía
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section className="grid two-up">
        <ReadonlyPanel title="Técnicas" eyebrow="Solo lectura" rows={techniques} renderRow={(technique) => [technique.id_tecnica, technique.nombre, technique.descripcion ?? '-']} />
        <ReadonlyPanel
          title="Experimentos"
          eyebrow="Solo lectura"
          rows={experiments}
          renderRow={(experiment) => [
            experiment.id_experimento,
            problemById.get(experiment.id_problema)?.titulo ?? experiment.id_problema,
            techniqueById.get(experiment.id_tecnica)?.nombre ?? experiment.id_tecnica,
            experiment.fecha_ejecucion ?? '-',
            truncate(experiment.prompt_generado, 60),
          ]}
        />
      </section>

      <section className="grid two-up">
        <ReadonlyPanel
          title="Resultados"
          eyebrow="Solo lectura"
          rows={results}
          renderRow={(result) => [
            result.id_resultado,
            result.id_experimento,
            result.exactitud_funcional ?? '-',
            result.maintainability_index ?? '-',
            result.code_smells ?? '-',
          ]}
        />
        <ReadonlyPanel
          title="Ejecuciones de prueba"
          eyebrow="Solo lectura"
          rows={executionTests}
          renderRow={(executionTest) => [
            executionTest.id_ejecucion_prueba,
            experimentById.get(executionTest.id_experimento)?.id_experimento ?? executionTest.id_experimento,
            caseById.get(executionTest.id_caso_prueba)?.id_caso_prueba ?? executionTest.id_caso_prueba,
            executionTest.prueba_superada ? 'Sí' : 'No',
            executionTest.tiempo_ejecucion ?? '-',
            executionTest.mensaje_error ?? '-',
          ]}
        />
      </section>
    </main>
  )
}

function ReadonlyPanel<T>({
  title,
  eyebrow,
  rows,
  renderRow,
}: {
  title: string
  eyebrow: string
  rows: T[]
  renderRow: (row: T) => Array<string | number>
}) {
  return (
    <article className="panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <tbody>
            {rows.map((row) => (
              <tr key={String(renderRow(row)[0])}>
                {renderRow(row).map((cell, index) => (
                  <td key={`${String(cell)}-${index}`}>{String(cell)}</td>
                ))}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={99} className="empty-state">
                  Sin registros todavía
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </article>
  )
}

function summarizeJson(value: Record<string, unknown>) {
  return truncate(JSON.stringify(value), 50)
}

function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value
  }

  return `${value.slice(0, maxLength - 1)}…`
}

export default App