import { useEffect, useRef, useState, type FormEvent } from 'react'
import {
  verifyCode,
  resendCode,
  cancelVerification,
  type AuthUser,
} from '../services/authService'

interface VerificationPageProps {
  onBack: () => void
  onVerificationSuccess: (user: AuthUser) => void
}

export default function VerificationPage({
  onBack,
  onVerificationSuccess,
}: VerificationPageProps) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [secondsRemaining, setSecondsRemaining] = useState(60)
  const codeInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (secondsRemaining <= 0) return

    const timer = window.setTimeout(() => {
      setSecondsRemaining((previous) => Math.max(0, previous - 1))
    }, 1000)

    return () => window.clearTimeout(timer)
  }, [secondsRemaining])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!/^\d{6}$/.test(code) || loading) return

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const user = await verifyCode(code)
      onVerificationSuccess(user)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No fue posible verificar el código'
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    if (loading || secondsRemaining > 0) return

    setLoading(true)
    setError('')
    setMessage('')

    try {
      await resendCode()
      setCode('')
      setSecondsRemaining(60)
      setMessage('Se envió un nuevo código a tu correo electrónico.')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No fue posible reenviar el código'
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleBack() {
    if (loading) return

    setLoading(true)
    setError('')

    try {
      await cancelVerification()
      onBack()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No fue posible cancelar la verificación'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="verification-title">
        <header className="auth-header">
          <h1>Levantamiento de pedidos</h1>
          <p>Aplicación para captura de pedidos en ruta.</p>
        </header>

        <button
          type="button"
          className="auth-back"
          onClick={handleBack}
          disabled={loading}
        >
          <span aria-hidden="true">←</span>
          Volver al inicio de sesión
        </button>

        <div className="auth-content">
          <h2 id="verification-title">Verificación de seguridad</h2>

          <p className="auth-description">
            Introduce el código de seis dígitos enviado a tu correo electrónico.
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="verification-field">
              <label className="verification-label" htmlFor="verification-code">
                Código de verificación
              </label>

              <div
                className="verification-code-wrapper"
                onClick={() => codeInputRef.current?.focus()}
              >
                <input
                  ref={codeInputRef}
                  id="verification-code"
                  className="verification-code-input"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  pattern="[0-9]{6}"
                  value={code}
                  onChange={(event) =>
                    setCode(
                      event.target.value.replace(/\D/g, '').slice(0, 6)
                    )
                  }
                  disabled={loading}
                  required
                  aria-label="Código de verificación de seis dígitos"
                />

                <div className="verification-digits" aria-hidden="true">
                  {Array.from({ length: 6 }, (_, index) => (
                    <span
                      key={index}
                      className={`verification-digit ${
                        code.length === index ? 'active' : ''
                      }`}
                    >
                      {code[index] ?? ''}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <p className="auth-message auth-message-error" role="alert">
                {error}
              </p>
            )}

            {message && (
              <p className="auth-message verification-success" role="status">
                {message}
              </p>
            )}

            <button
              className="auth-submit"
              type="submit"
              disabled={loading || code.length !== 6}
            >
              {loading ? 'Procesando...' : 'Verificar código'}
            </button>
          </form>

          <div className="verification-resend">
            <div className="verification-resend-info">
              <div>
                <strong>¿No recibiste el código?</strong>
                <p>
                  {secondsRemaining > 0
                    ? 'Puedes solicitar un nuevo código en:'
                    : 'Ya puedes solicitar un nuevo código.'}
                </p>
              </div>

              {secondsRemaining > 0 && (
                <span className="verification-timer">
                  00:{String(secondsRemaining).padStart(2, '0')}
                </span>
              )}
            </div>

            <button
              type="button"
              className="verification-resend-button"
              onClick={handleResend}
              disabled={loading || secondsRemaining > 0}
            >
              <span aria-hidden="true">↻</span>
              Reenviar código
            </button>
          </div>

          <div className="verification-notice">
            <span className="verification-notice-icon" aria-hidden="true">
              i
            </span>
            <p>
              El código de verificación tiene una vigencia de 5 minutos.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
