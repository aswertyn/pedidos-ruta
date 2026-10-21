
import { useState, type ChangeEvent } from 'react'

export default function PhotoCapture() {
    const [foto, setFoto] = useState<File | null>(null)
    const [vistaPrevia, setVistaPrevia] = useState<string | null>(null)
    const [mensaje, setMensaje] = useState('')
    const [enviando, setEnviando] = useState(false)

    function seleccionarFoto(event: ChangeEvent<HTMLInputElement>) {
        const archivo = event.target.files?.[0]

        if (!archivo) return

        if (!['image/jpeg', 'image/png'].includes(archivo.type)) {
            setMensaje('Solo se permiten fotografías JPG o PNG')
            return
        }

        if (archivo.size > 5 * 1024 * 1024) {
            setMensaje('La fotografía no debe superar los 5 MB')
            return
        }

        setFoto(archivo)
        setVistaPrevia(URL.createObjectURL(archivo))
        setMensaje('')
    }

    async function enviarFoto() {
        if (!foto) return

        setEnviando(true)
        setMensaje('')

        try {
            const datos = new FormData()
            datos.append('foto', foto)

            const respuesta = await fetch('/api/hojas-ruta', {
                method: 'POST',
                credentials: 'same-origin',
                body: datos,
            })

            const resultado = await respuesta.json()

            if (!respuesta.ok) {
                throw new Error(resultado.message || 'Error al enviar fotografía')
            }

            setMensaje('Fotografía guardada correctamente')

        } catch (error) {
            setMensaje(
                error instanceof Error ? error.message : 'Error desconocido'
            )
        } finally {
            setEnviando(false)
        }
    }

    return (
        <section>
            <h2>Captura por fotografía</h2>

            <p>Toma una fotografía de la nota de pedido o selecciónala desde tu dispositivo.</p>

            <input
                type="file"
                accept="image/jpeg,image/png"
                capture="environment"
                onChange={seleccionarFoto}
            />

            {vistaPrevia && (
                <div>
                    <img
                        src={vistaPrevia}
                        alt="Vista previa de la nota de pedido"
                        style={{ maxWidth: '100%', maxHeight: '400px' }}
                    />
                </div>
            )}

            <button
                type="button"
                onClick={enviarFoto}
                disabled={!foto || enviando}
            >
                {enviando ? 'Guardando...' : 'Guardar fotografía'}
            </button>

            {mensaje && <p role="status">{mensaje}</p>}
        </section>
    )
}
