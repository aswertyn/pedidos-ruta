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

    useEffect(() => {
        async function cargarFotografias() {
            try {
                const respuesta = await fetch('/api/hojas-ruta', {
                    credentials: 'same-origin'
                })

                if (!respuesta.ok) {
                    throw new Error('No se pudieron consultar las fotografías')
                }

                const datos: HojaRuta[] = await respuesta.json()

                setFotografias(datos)
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Ocurrió un error'
                )
            } finally {
                setCargando(false)
            }
        }

        cargarFotografias()
    }, [])

    if (cargando) {
        return <p>Cargando fotografías...</p>
    }

    if (error) {
        return <p>{error}</p>
    }

    return (
        <div className="photo-gallery">
            <h2>Fotografías registradas</h2>

            {fotografias.length === 0 ? (
                <p>No tienes fotografías registradas.</p>
            ) : (
                <div className="photo-gallery-grid">
                    {fotografias.map((foto) => (
                        <div className="photo-gallery-item" key={foto.id}>
                            <img
                                src={`/api/hojas-ruta/${foto.id}/foto`}
                                alt={`Fotografía ${foto.id}`}
                                loading="lazy"
                                style={{
                                    width: '100%',
                                    maxWidth: '300px',
                                    borderRadius: '8px'
                                }}
                            />

                            <p>Fotografía #{foto.id}</p>

                            <p>
                                {new Date(foto.fecha).toLocaleString('es-MX')}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}