import { useEffect, useState, type FormEvent } from 'react'
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
    <main className="login-page">
      <div className="login-card">
        <h1>Verificación de seguridad</h1>

        <p>
          Introduce el código enviado a tu correo electrónico.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="verification-code">
            Código de verificación
          </label>

          <input
            id="verification-code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            pattern="[0-9]{6}"
            placeholder="000000"
            value={code}
            onChange={(event) =>
              setCode(event.target.value.replace(/\D/g, '').slice(0, 6))
            }
            disabled={loading}
            required
          />

          <button
            type="submit"
            disabled={loading || code.length !== 6}
          >
            {loading ? 'Procesando...' : 'Verificar código'}
          </button>
        </form>

        <button
          type="button"
          className="verification-back"
          onClick={handleResend}
          disabled={loading || secondsRemaining > 0}
        >
          {secondsRemaining > 0
            ? `Reenviar código (${secondsRemaining}s)`
            : 'Reenviar código'}
        </button>

        <button
          type="button"
          className="verification-back"
          onClick={handleBack}
          disabled={loading}
        >
          Volver al inicio de sesión
        </button>

        {error && <p role="alert">{error}</p>}
        {message && <p role="status">{message}</p>}

        <p className="verification-note">
          El código tiene una vigencia de 5 minutos.
          Para solicitar otro, espera al menos 60 segundos.
        </p>
      </div>
    </main>
  )
}
