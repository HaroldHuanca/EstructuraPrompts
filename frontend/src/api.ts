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

export const api = {
  problems: {
    list: () => request<any[]>('/problems/'),
    create: (data: unknown) => request('/problems/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: unknown) => request(`/problems/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id: number) => request(`/problems/${id}`, { method: 'DELETE' }),
  },
  techniques: {
    list: () => request<any[]>('/techniques/'),
    create: (data: unknown) => request('/techniques/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: unknown) => request(`/techniques/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id: number) => request(`/techniques/${id}`, { method: 'DELETE' }),
  },
  experiments: {
    list: () => request<any[]>('/experiments/'),
    create: (data: unknown) => request('/experiments/', { method: 'POST', body: JSON.stringify(data) }),
    execute: (data: unknown) => request('/experiments/execute', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: unknown) => request(`/experiments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id: number) => request(`/experiments/${id}`, { method: 'DELETE' }),
  },
  results: {
    list: () => request<any[]>('/results/'),
    create: (data: unknown) => request('/results/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: unknown) => request(`/results/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id: number) => request(`/results/${id}`, { method: 'DELETE' }),
  },
}
