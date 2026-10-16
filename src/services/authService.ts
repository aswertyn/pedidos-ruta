
//datos mandados al login para las credenciales
export interface LoginCredentials {
  usuario: string
  contraseña: string
}

//lo que devuelve SQL, para probar el acceso
export interface AuthUser {
  usuario: string
  nombre: string
  paterno: string
  materno: string
  rol: string | number
  autorizacion2Pasos: boolean | number
  correo: string
}

export type LoginResponse =
  | {
      message: string
      requires2FA: true
    }
  | {
      message: string
      requires2FA?: false
      user: AuthUser
    }

const API_URL = ''

//la petición
export async function login(
  credentials: LoginCredentials
): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Error al iniciar sesión')
  }

  return data as LoginResponse
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const response = await fetch('/api/auth/me', {
    credentials: 'same-origin',
  })

  if (response.status === 401) {
    return null
  }

  if (!response.ok) {
    throw new Error('No fue posible comprobar la sesión')
  }

  const data: { user: AuthUser } = await response.json()
  return data.user
}

export async function logout(): Promise<void> {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'same-origin',
  })

  if (!response.ok) {
    throw new Error('No fue posible cerrar la sesión')
  }
}

export async function verifyCode(codigo: string): Promise<AuthUser> {
  const response = await fetch(`${API_URL}/api/auth/verify-code`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ codigo }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message || 'No fue posible verificar el código'
    )
  }

  return data.user as AuthUser
}

export async function resendCode(): Promise<void> {
  const response = await fetch('/api/auth/resend-code', {
    method: 'POST',
    credentials: 'same-origin',
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message || 'No fue posible reenviar el código'
    )
  }
}

export async function cancelVerification(): Promise<void> {
  const response = await fetch('/api/auth/cancel-verification', {
    method: 'POST',
    credentials: 'same-origin',
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message || 'No fue posible cancelar la verificación'
    )
  }
}
