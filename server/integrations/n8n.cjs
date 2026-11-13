async function enviarPedidoN8n(pedido) {
    const url = process.env.N8N_WEBHOOK_URL

    if (!url) {
        throw new Error('N8N_WEBHOOK_URL no configurada')
    }

    const respuesta = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(pedido),
        signal: AbortSignal.timeout(15000),
    })

    const contenido = await respuesta.text()

    if (!respuesta.ok) {
        throw new Error(`Error de n8n: HTTP ${respuesta.status}`)
    }

    return {
        status: respuesta.status,
        respuesta: contenido,
    }
}

module.exports = { enviarPedidoN8n }
