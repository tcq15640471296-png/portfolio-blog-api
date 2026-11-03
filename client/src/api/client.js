import axios from 'axios'

/**
 * A single pre-configured Axios instance used by every page and component.
 *
 * - baseURL comes from VITE_API_URL (.env) and falls back to the local API.
 * - The request interceptor attaches the JWT stored in localStorage to every
 *   call as `Authorization: Bearer <token>` (required by the protected routes).
 * - The response interceptor unwraps the API payload and normalises errors into
 *   a plain `Error` with a readable `message` (and optional field errors).
 */
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const TOKEN_KEY = 'capstone_token'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // No response at all -> network / server down / CORS problem.
    if (!error.response) {
      const offline = new Error(
        `Cannot reach the API at ${API_URL}. Is the back-end running and is CORS configured?`
      )
      offline.status = 0
      return Promise.reject(offline)
    }

    const { status, data } = error.response
    const message =
      (data && (data.message || data.error)) || `Request failed with status code ${status}`

    const normalised = new Error(message)
    normalised.status = status
    normalised.errors = data?.errors || []
    return Promise.reject(normalised)
  }
)

export default api
