
import { useState, type FormEvent } from 'react'
import { login, type AuthUser } from '../services/authService'
import VerificationPage from './VerificationPage'

interface LoginPageProps {
  onLoginSuccess: (user: AuthUser) => void
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [usuario, setUsuario] = useState('')
  const [contraseña, setContraseña] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="login-title">
        <header className="auth-header">
          <h1>Levantamiento de pedidos</h1>
          <p>Aplicación para captura de pedidos en ruta.</p>
        </header>

        <div className="auth-content">
          <h2 id="login-title">Inicia sesión</h2>
          <p className="auth-description">
            Ingresa tus credenciales para continuar.
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="usuario">Usuario</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4.5 21v-2a7.5 7.5 0 0 1 15 0v2H4.5Z" />
                  </svg>
                </span>
                <input
                  id="usuario"
                  type="text"
                  autoComplete="username"
                  placeholder="Ingresa tu usuario"
                  value={usuario}
                  onChange={(event) => setUsuario(event.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="contraseña">Contraseña</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="10" width="14" height="11" rx="2" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                    <circle cx="12" cy="15.5" r="1" />
                  </svg>
                </span>
                <input
                  id="contraseña"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Ingresa tu contraseña"
                  value={contraseña}
                  onChange={(event) => setContraseña(event.target.value)}
                  disabled={loading}
                  required
                />
                <button
                  className="auth-password-toggle"
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  aria-pressed={showPassword}
                  disabled={loading}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 3l18 18" />
                      <path d="M10.6 5.1A10.5 10.5 0 0 1 12 5c6.4 0 10 7 10 7a16 16 0 0 1-3.1 3.7" />
                      <path d="M6.1 6.1C3.4 8 2 12 2 12s3.6 7 10 7a10 10 0 0 0 4.2-.9" />
                      <path d="M10 10a3 3 0 0 0 4 4" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="auth-message auth-message-error" role="alert">
                {error}
              </p>
            )}

            <button className="auth-submit" type="submit" disabled={loading}>
              <span>{loading ? 'Verificando...' : 'Iniciar sesión'}</span>
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}
