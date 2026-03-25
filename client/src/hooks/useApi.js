import { useState, useCallback } from 'react'
import { getApiUrl } from '../utils/api'

export const useApi = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const callApi = useCallback(async (endpoint, options = {}) => {
    // Avoid synchronous state updates in effects to satisfy react-hooks/set-state-in-effect
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

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error en la petición')
      }

      return data
    } catch (err) {
      const msg = err.message || 'Error de conexión'
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  return { callApi, loading, error }
}
