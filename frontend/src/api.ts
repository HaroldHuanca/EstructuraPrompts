const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `HTTP ${response.status}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

const postJson = (data: unknown) => ({ method: 'POST', body: JSON.stringify(data) })
const putJson = (data: unknown) => ({ method: 'PUT', body: JSON.stringify(data) })

export const api = {
  problems: {
    list: () => request<unknown[]>('/problems/'),
    create: (data: unknown) => request('/problems/', postJson(data)),
    update: (id: number, data: unknown) => request(`/problems/${id}`, putJson(data)),
    remove: (id: number) => request(`/problems/${id}`, { method: 'DELETE' }),
  },
  cases: {
    list: () => request<unknown[]>('/cases-prueba/'),
    create: (data: unknown) => request('/cases-prueba/', postJson(data)),
    update: (id: number, data: unknown) => request(`/cases-prueba/${id}`, putJson(data)),
    remove: (id: number) => request(`/cases-prueba/${id}`, { method: 'DELETE' }),
  },
  techniques: {
    list: () => request<unknown[]>('/techniques/'),
  },
  experiments: {
    list: () => request<unknown[]>('/experiments/'),
    runSingle: (problemId: number, techniqueId: number) => request(`/experiments/run/${problemId}`, postJson({ technique_id: techniqueId })),
    runBatch: (problemIds: number[], techniqueId: number) => request('/experiments/run-batch', postJson({ problem_ids: problemIds, technique_id: techniqueId })),
    runPending: (techniqueId: number) => request('/experiments/run-pending', postJson({ technique_id: techniqueId })),
  },
  results: {
    list: () => request<unknown[]>('/results/'),
  },
  executionTests: {
    list: () => request<unknown[]>('/execution-tests/'),
  },
}
