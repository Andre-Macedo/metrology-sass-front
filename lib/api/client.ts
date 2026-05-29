const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

interface ApiClientConfig {
  baseUrl?: string
  headers?: Record<string, string>
}

interface ApiResponse<T> {
  data: T
  message?: string
  status: number
}

interface ApiError {
  message: string
  status: number
  errors?: Record<string, string[]>
}

class ApiClient {
  private baseUrl: string
  private defaultHeaders: Record<string, string>

  constructor(config: ApiClientConfig = {}) {
    this.baseUrl = config.baseUrl || API_BASE_URL
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...config.headers,
    }
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('auth_token')
  }

  private redirectToLogin() {
    if (typeof window !== 'undefined') {
      // Evita loop se já estiver na página de login
      if (window.location.pathname.includes('/login')) {
        return
      }

      localStorage.removeItem('auth_token')
      // Extract locale from current path (e.g. /en/dashboard -> en)
      const pathParts = window.location.pathname.split('/')
      const currentLocale = pathParts[1]
      const locale = ['en', 'pt-BR'].includes(currentLocale) ? currentLocale : 'pt-BR'

      window.location.href = `/${locale}/login`
    }
  }

  private redirectToExpired() {
    if (typeof window !== 'undefined') {
      const pathParts = window.location.pathname.split('/')
      const currentLocale = pathParts[1]
      const locale = ['en', 'pt-BR'].includes(currentLocale) ? currentLocale : 'pt-BR'
      
      // Evita loop se já estiver na página de expirado
      if (!window.location.pathname.includes('/billing/expired')) {
        window.location.href = `/${locale}/billing/expired`
      }
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error: ApiError = {
        message: 'An error occurred',
        status: response.status,
      }

      try {
        const errorData = await response.json()
        error.message = errorData.message || error.message
        error.errors = errorData.errors
      } catch {
        // Response is not JSON
      }

      if (response.status === 401) {
        // Só redireciona se a falha for na obtenção do perfil (check de sessão vital)
        if (response.url.includes('/system/profile') || response.url.includes('/system/user')) {
          this.redirectToLogin()
        }
      }

      if (response.status === 402) {
        this.redirectToExpired()
      }

      if (response.status === 429) {
        // Importar toast dinamicamente se necessário, ou assumir que quem chama lida com o erro.
        // Por segurança, vamos apenas lançar o erro com uma mensagem clara.
        error.message = 'Muitas tentativas em pouco tempo. Por favor, aguarde alguns minutos antes de tentar novamente.'
      }

      throw error
    }

    return response.json()
  }

  private getHeaders(): Record<string, string> {
    const headers = { ...this.defaultHeaders }
    const token = this.getAuthToken()

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    // Identificação de Tenant via Header (X-Tenant-ID)
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      
      // Se houver um subdomínio (ex: amemiya.localhost)
      if (hostname !== 'localhost' && hostname.includes('.localhost')) {
        const tenantSlug = hostname.split('.')[0]
        headers['X-Tenant-ID'] = tenantSlug
      } else {
        // Se estivermos puramente em localhost, tentamos pegar o tenant do localStorage 
        // ou de um parâmetro (fallback para dev sem subdomínios)
        const savedTenant = localStorage.getItem('current_tenant_slug')
        if (savedTenant) {
          headers['X-Tenant-ID'] = savedTenant
        }
      }
    }

    return headers
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`)

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value)
      })
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getHeaders(),
    })

    return this.handleResponse<T>(response)
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    })

    return this.handleResponse<T>(response)
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    })

    return this.handleResponse<T>(response)
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    })

    return this.handleResponse<T>(response)
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    })

    return this.handleResponse<T>(response)
  }
  async getBlob(endpoint: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      // Handle error similar to handleResponse but without assuming JSON
      if (response.status === 401) {
        // Só redireciona se a falha for na obtenção do perfil (check de sessão vital)
        if (response.url.includes('/system/profile') || response.url.includes('/system/user')) {
          this.redirectToLogin()
        }
      }
      throw new Error(`Request failed with status ${response.status}`)
    }

    return response.blob()
  }
}

// Singleton instance
export const apiClient = new ApiClient()

// Export class for custom instances
export { ApiClient }
export type { ApiResponse, ApiError }
