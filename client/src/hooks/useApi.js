import { useState, useCallback } from 'react'
import { getApiUrl } from '../utils/api'

export const useApi = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const callApi = useCallback(async (endpoint, options = {}) => {
    // Avoid synchronous state updates in effects
    await Promise.resolve()
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(getApiUrl(endpoint), {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      let data = {}
      try {
        const text = await response.text()
        data = text ? JSON.parse(text) : {}
      } catch (e) {
        // Fallback for non-JSON response (e.g. PHP warnings/errors)
        if (!response.ok) {
          throw new Error(`Error del Servidor (${response.status})`)
        }
        data = {}
      }

      if (!response.ok) {
        throw new Error(data?.error || data?.message || `Error en la petición: ${response.status}`)
      }

      return data
    } catch (err) {
      const msg = err.message || 'Error de conexión'
      setError(msg)
      // Throw for view handling but keep console clean
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { callApi, loading, error }
}
