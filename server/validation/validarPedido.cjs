function esObjeto(valor) {
    return (
        valor !== null &&
        typeof valor === 'object' &&
        !Array.isArray(valor)
    )
}

function validarPedido(datos) {
    if (!esObjeto(datos)) {
        return 'El cuerpo de la solicitud no es válido'
    }

    const { order, customer } = datos

    if (!esObjeto(order)) {
        return 'Faltan los datos del pedido'
    }

    if (!esObjeto(customer)) {
        return 'Faltan los datos del cliente'
    }

    if (
        typeof order.folio !== 'string' ||
        !/^\d{1,10}$/.test(order.folio)
    ) {
        return 'El folio debe contener entre 1 y 10 dígitos'
    }

    if (
        typeof order.agentNumber !== 'string' ||
        !order.agentNumber.trim()
    ) {
        return 'El número de agente es obligatorio'
    }

    if (
        typeof order.customerNumber !== 'string' ||
        !order.customerNumber.trim()
    ) {
        return 'El número de cliente es obligatorio'
    }

    if (!Array.isArray(order.items) || order.items.length === 0) {
        return 'El pedido debe contener al menos un producto'
    }

    for (const item of order.items) {
        if (!esObjeto(item)) {
            return 'Se encontró un producto inválido'
        }

        if (
            typeof item.quantity !== 'number' ||
            !Number.isFinite(item.quantity) ||
            item.quantity <= 0
        ) {
            return 'Las cantidades deben ser mayores que cero'
        }

        if (
            typeof item.price !== 'number' ||
            !Number.isFinite(item.price) ||
            item.price < 0
        ) {
            return 'Los precios no pueden ser negativos'
        }
    }

    if (
        order.polyethyleneBag !== undefined &&
        !Array.isArray(order.polyethyleneBag)
    ) {
        return 'Las bolsas de polietileno deben ser un arreglo'
    }

    return null
}

module.exports = { validarPedido }
