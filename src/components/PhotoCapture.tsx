import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { FaCamera } from 'react-icons/fa'

export default function PhotoCapture() {
    const [foto, setFoto] = useState<File | null>(null)
    const [vistaPrevia, setVistaPrevia] = useState<string | null>(null)
    const [mensaje, setMensaje] = useState('')
    const [tipoMensaje, setTipoMensaje] = useState<'success' | 'error' | null>(null)
    const [enviando, setEnviando] = useState(false)
    const [guardada, setGuardada] = useState(false)

    const camaraRef = useRef<HTMLInputElement>(null)
    const galeriaRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        return () => {
            if (vistaPrevia) {
                URL.revokeObjectURL(vistaPrevia)
            }
        }
    }, [vistaPrevia])

    function seleccionarFoto(event: ChangeEvent<HTMLInputElement>) {
        const archivo = event.target.files?.[0]

        if (!archivo) return

        // Permite volver a seleccionar el mismo archivo.
        event.target.value = ''

        if (!['image/jpeg', 'image/png'].includes(archivo.type)) {
            setMensaje('Solo se permiten fotografías JPG o PNG.')
            setTipoMensaje('error')
            return
        }

        if (archivo.size > 5 * 1024 * 1024) {
            setMensaje('La fotografía no debe superar los 5 MB.')
            setTipoMensaje('error')
            return
        }

        setFoto(archivo)
        setVistaPrevia(URL.createObjectURL(archivo))
        setMensaje('')
        setTipoMensaje(null)
        setGuardada(false)
    }

    async function enviarFoto() {
        if (!foto || enviando || guardada) return

        setEnviando(true)
        setMensaje('')
        setTipoMensaje(null)

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
                throw new Error(
                    resultado.message || 'Error al enviar fotografía'
                )
            }

            setGuardada(true)
            setMensaje('Fotografía guardada correctamente.')
            setTipoMensaje('success')

        } catch (error) {
            setMensaje(
                error instanceof Error
                    ? error.message
                    : 'Error desconocido'
            )
            setTipoMensaje('error')
        } finally {
            setEnviando(false)
        }
    }

    return (
        <section className="photo-capture">
            <div className="photo-capture-header">
                <h2>Registrar fotografía</h2>
                <p>
                    Toma una fotografía de la nota de pedido
                    o selecciónala desde tu dispositivo.
                </p>
            </div>

            <input
                ref={camaraRef}
                type="file"
                accept="image/jpeg,image/png"
                capture="environment"
                onChange={seleccionarFoto}
                className="photo-hidden-input"
                aria-label="Tomar fotografía"
            />

            <input
                ref={galeriaRef}
                type="file"
                accept="image/jpeg,image/png"
                onChange={seleccionarFoto}
                className="photo-hidden-input"
                aria-label="Seleccionar fotografía de galería"
            />

            {!vistaPrevia ? (
                <div className="photo-upload-area">
                    <div className="photo-upload-icon" aria-hidden="true">
                        <FaCamera />
                    </div>

                    <h3>Agrega una fotografía</h3>

                    <p>
                        Asegúrate de que la nota sea legible
                        y esté completamente visible.
                    </p>

                    <div className="photo-upload-actions">
                        <button
                            type="button"
                            className="primary-button"
                            onClick={() => camaraRef.current?.click()}
                            disabled={enviando}
                        >
                            Tomar fotografía
                        </button>

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={() => galeriaRef.current?.click()}
                            disabled={enviando}
                        >
                            Seleccionar de galería
                        </button>
                    </div>

                    <small>Formatos JPG o PNG · Máximo 5 MB</small>
                </div>
            ) : (
                <div className="photo-preview-card">
                    <div className="photo-preview-header">
                        <strong>Vista previa</strong>
                        <span>{guardada ? 'Guardada' : 'Lista para guardar'}</span>
                    </div>

                    <img
                        src={vistaPrevia}
                        alt="Vista previa de la nota de pedido"
                        className="photo-preview-image"
                    />

                    <p className="photo-file-name">
                        {foto?.name}
                    </p>

                    <button
                        type="button"
                        className="secondary-button photo-change-button"
                        onClick={() => galeriaRef.current?.click()}
                        disabled={enviando}
                    >
                        Cambiar fotografía
                    </button>
                </div>
            )}

            {mensaje && (
                <p
                    className={`photo-message photo-message-${tipoMensaje}`}
                    role={tipoMensaje === 'error' ? 'alert' : 'status'}
                >
                    {mensaje}
                </p>
            )}

            <button
                type="button"
                className="primary-button photo-save-button"
                onClick={enviarFoto}
                disabled={!foto || enviando || guardada}
            >
                {enviando
                    ? 'Guardando fotografía...'
                    : guardada
                        ? 'Fotografía guardada'
                        : 'Guardar fotografía'}
            </button>
        </section>
    )
}
