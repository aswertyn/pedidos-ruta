
import { useState, type FormEvent } from 'react'
import { login, type AuthUser } from '../services/authService'
import VerificationPage from './VerificationPage'

interface LoginPageProps {
  onLoginSuccess: (user: AuthUser) => void
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [usuario, setUsuario] = useState('')
  const [contraseña, setContraseña] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [requiresVerification, setRequiresVerification] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await login({ usuario, contraseña })
      if (response.requires2FA === true) {
        setRequiresVerification(true)
        setContraseña('')
        return
      }

      onLoginSuccess(response.user)
      setContraseña('')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No fue posible iniciar sesión'
      )
    } finally {
      setLoading(false)
    }
  }

  if (requiresVerification) {
    return (
      <VerificationPage
        onBack={() => {
          setRequiresVerification(false)
          setContraseña('')
          setError('')
        }}
        onVerificationSuccess={onLoginSuccess}
      />
    )
  }

  return (
    <main className="login-page">
      <div className="login-card">
        <h1>Inicio de sesión</h1>
        <p>Ingresa tus credenciales para continuar.</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="usuario">Usuario</label>
          <input
            id="usuario"
            type="text"
            autoComplete="username"
            value={usuario}
            onChange={(event) => setUsuario(event.target.value)}
            required
          />

          <label htmlFor="contraseña">Contraseña</label>
          <input
            id="contraseña"
            type="password"
            autoComplete="current-password"
            value={contraseña}
            onChange={(event) => setContraseña(event.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Verificando...' : 'Iniciar sesión'}
          </button>
        </form>

        {error && <p role="alert">{error}</p>}

      </div>
    </main>
  )
}
