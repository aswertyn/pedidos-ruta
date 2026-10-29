import { useEffect, useState } from 'react'

interface HojaRuta {
    id: number
    fecha: string
    usuario: number
    tamano_bytes: number
}

export default function PhotoGallery() {
    const [fotografias, setFotografias] = useState<HojaRuta[]>([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')
    const [fotoSeleccionada, setFotoSeleccionada] = useState<HojaRuta | null>(null)

    useEffect(() => {
        const controlador = new AbortController()

        async function cargarFotografias() {
            try {
                const respuesta = await fetch('/api/hojas-ruta', {
                    credentials: 'same-origin',
                    signal: controlador.signal,
                })

                if (!respuesta.ok) {
                    throw new Error('No se pudieron consultar las fotografías')
                }

                const datos: HojaRuta[] = await respuesta.json()

                setFotografias(datos)
            } catch (err) {
                if (controlador.signal.aborted) return

                setError(
                    err instanceof Error
                        ? err.message
                        : 'Ocurrió un error'
                )
            } finally {
                if (!controlador.signal.aborted) {
                    setCargando(false)
                }
            }
        }

        cargarFotografias()
        return () => controlador.abort()
    }, [])

    function formatearFecha(fecha: string) {
        const valor = new Date(fecha)
        if (Number.isNaN(valor.getTime())) return 'Fecha no disponible'
        return valor.toLocaleString('es-MX', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    function formatearTamano(bytes: number) {
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
    }

    if (cargando) {
        return (
            <div className="photo-gallery-state" role="status">
                <div className="photo-gallery-spinner" />
                <p>Cargando fotografías...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="photo-gallery-state photo-gallery-error" role="alert">
                <h3>No se pudieron cargar las fotografías</h3>
                <p>{error}</p>
            </div>
        )
    }

    return (
        <section className="photo-gallery">
            <div className="photo-gallery-header">
                <div>
                    <h2>Mis fotografías</h2>
                    <p>Consulta las notas de pedido que has registrado.</p>
                </div>
                <span className="photo-gallery-count">{fotografias.length}</span>
            </div>

            {fotografias.length === 0 ? (
                <div className="photo-gallery-empty">
                    <div className="photo-gallery-empty-icon" aria-hidden="true">▤</div>
                    <h3>No hay fotografías registradas</h3>
                    <p>
                        Las fotografías que guardes aparecerán aquí
                        para que puedas consultarlas.
                    </p>
                </div>
            ) : (
                <div className="photo-gallery-grid">
                    {fotografias.map((foto) => (
                        <button
                            type="button"
                            className="photo-gallery-item"
                            key={foto.id}
                            onClick={() => setFotoSeleccionada(foto)}
                            aria-label={`Ver fotografía ${foto.id}`}
                        >
                            <div className="photo-gallery-image-container">
                                <img
                                    src={`/api/hojas-ruta/${foto.id}/foto`}
                                    alt={`Nota de pedido ${foto.id}`}
                                    loading="lazy"
                                />
                            </div>
                            <div className="photo-gallery-info">
                                <strong>Fotografía #{foto.id}</strong>
                                <span>{formatearFecha(foto.fecha)}</span>
                                <small>{formatearTamano(foto.tamano_bytes)}</small>
                            </div>
                        </button>
                    ))}
                </div>
            )}
            {fotoSeleccionada && (
                <div
                    className="photo-gallery-overlay"
                    role="presentation"
                    onClick={() => setFotoSeleccionada(null)}
                >
                    <div
                        className="photo-gallery-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-label={`Fotografía ${fotoSeleccionada.id}`}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="photo-gallery-modal-header">
                            <strong>Fotografía #{fotoSeleccionada.id}</strong>
                            <button
                                type="button"
                                className="photo-gallery-close"
                                onClick={() => setFotoSeleccionada(null)}
                                aria-label="Cerrar fotografía"
                            >
                                ×
                            </button>
                        </div>
                        <div className="photo-gallery-modal-image">
                            <img
                                src={`/api/hojas-ruta/${fotoSeleccionada.id}/foto`}
                                alt={`Fotografía ampliada ${fotoSeleccionada.id}`}
                            />
                        </div>
                        <div className="photo-gallery-modal-footer">
                            <span>{formatearFecha(fotoSeleccionada.fecha)}</span>
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}
