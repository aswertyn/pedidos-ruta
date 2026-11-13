
function esObjeto(valor) {
    return (
        valor !== null &&
        typeof valor === 'object' &&
        !Array.isArray(valor)
    )
}

function textoValido(valor, minimo = 1) {
    return (
        typeof valor === 'string' &&
        valor.trim().length >= minimo
    )
}

function telefonoValido(valor) {
    return (
        typeof valor === 'string' &&
        /^\d{10}$/.test(valor)
    )
}

function horaValida(valor) {
    return (
        typeof valor === 'string' &&
        /^([01]\d|2[0-3]):[0-5]\d$/.test(valor)
    )
}

function cantidadValida(valor) {
    return (
        typeof valor === 'number' &&
        Number.isSafeInteger(valor) &&
        valor > 0
    )
}

function precioValido(valor) {
    return (
        typeof valor === 'number' &&
        Number.isFinite(valor) &&
        valor >= 0
    )
}

function fechaValida(valor) {
    if (
        typeof valor !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(valor)
    ) {
        return false
    }

    const fecha = new Date(`${valor}T00:00:00Z`)

    return (
        !Number.isNaN(fecha.getTime()) &&
        fecha.toISOString().slice(0, 10) === valor
    )
}

function validarPedido(datos) {
    if (!esObjeto(datos)) {
        return 'El cuerpo de la solicitud no es válido'
    }

    const { order, customer, consignee } = datos

    // 1. Estructura general

    if (!esObjeto(order)) {
        return 'Faltan los datos del pedido'
    }

    if (!esObjeto(customer)) {
        return 'Faltan los datos del cliente'
    }

    if (!esObjeto(consignee)) {
        return 'Faltan los datos del lugar de entrega'
    }

    // 2. Datos del pedido

    if (
        typeof order.folio !== 'string' ||
        !/^\d{1,10}$/.test(order.folio)
    ) {
        return 'El folio debe contener entre 1 y 10 dígitos'
    }

    if (!textoValido(order.agentNumber)) {
        return 'El número de agente es obligatorio'
    }

    if (!textoValido(order.customerNumber)) {
        return 'El número de cliente es obligatorio'
    }

    if (!fechaValida(order.orderDate)) {
        return 'La fecha del pedido no es válida'
    }

    if (
        !['immediate', 'scheduled', 'urgent']
            .includes(order.deliveryPriority)
    ) {
        return 'La prioridad de entrega no es válida'
    }

    if (
        order.purchaseOrder !== undefined &&
        typeof order.purchaseOrder !== 'string'
    ) {
        return 'La orden de compra no es válida'
    }

    if (
        order.observations !== undefined &&
        typeof order.observations !== 'string'
    ) {
        return 'Las observaciones no son válidas'
    }

    // 3. Datos del cliente

    if (!textoValido(customer.customerNumber)) {
        return 'El número del cliente es obligatorio'
    }

    if (!textoValido(customer.name, 2)) {
        return 'El nombre del cliente no es válido'
    }

    if (!textoValido(customer.address, 10)) {
        return 'La dirección del cliente no es válida'
    }

    if (!textoValido(customer.city, 3)) {
        return 'La población del cliente no es válida'
    }

    if (!telefonoValido(customer.phone)) {
        return 'El teléfono del cliente debe tener 10 dígitos'
    }

    if (order.customerNumber !== customer.customerNumber) {
        return 'El número de cliente no coincide'
    }

    if (
        order.customerPhone !== undefined &&
        order.customerPhone !== customer.phone
    ) {
        return 'El teléfono del cliente no coincide'
    }

    // 4. Datos del consignado

    if (
        consignee.type !== 'manual' &&
        consignee.type !== 'registered'
    ) {
        return 'El tipo de consignación no es válido'
    }

    if (!textoValido(consignee.name, 2)) {
        return 'El nombre del consignado no es válido'
    }

    if (!telefonoValido(consignee.phone)) {
        return 'El teléfono del consignado debe tener 10 dígitos'
    }

    if (!textoValido(consignee.address, 10)) {
        return 'La dirección del consignado debe tener al menos 10 caracteres'
    }

    if (!textoValido(consignee.city, 3)) {
        return 'La población del consignado debe tener al menos 3 caracteres'
    }

    // Horario de recepción

    if (
        !horaValida(consignee.receivingStartTime) ||
        !horaValida(consignee.receivingEndTime)
    ) {
        return 'El horario de recepción no es válido'
    }

    if (
        consignee.receivingEndTime <=
        consignee.receivingStartTime
    ) {
        return 'La hora final debe ser posterior a la inicial'
    }

    // Consignación registrada

    if (consignee.type === 'registered') {
        if (!textoValido(consignee.consigneeNumber)) {
            return 'El número de consignación es obligatorio'
        }

        if (
            consignee.customerNumber !==
            order.customerNumber
        ) {
            return 'La consignación no corresponde al cliente'
        }

        if (
            consignee.consigneeNumber !==
            order.consigneeNumber
        ) {
            return 'El número de consignación no coincide'
        }
    }

    // Consignación manual

    if (consignee.type === 'manual') {
        if (
            consignee.consigneeNumber !== null ||
            order.consigneeNumber !== null
        ) {
            return 'La consignación manual no debe tener un número registrado'
        }
    }

    // 5. Productos

    if (
        !Array.isArray(order.items) ||
        order.items.length === 0
    ) {
        return 'El pedido debe contener al menos un producto'
    }

    for (const item of order.items) {
        if (!esObjeto(item)) {
            return 'Se encontró un producto inválido'
        }

        if (!textoValido(item.model)) {
            return 'El modelo del producto es obligatorio'
        }

        if (!textoValido(item.productType)) {
            return 'El tipo de producto es obligatorio'
        }

        if (!textoValido(item.bedSize)) {
            return 'El tamaño del producto es obligatorio'
        }

        if (!cantidadValida(item.quantity)) {
            return 'La cantidad del producto debe ser un entero mayor que cero'
        }

        if (!precioValido(item.price)) {
            return 'El precio del producto no puede ser negativo'
        }

        if (typeof item.isManual !== 'boolean') {
            return 'El origen del producto no es válido'
        }
    }

    // 6. Bolsas de polietileno

    if (
        order.polyethyleneBag !== undefined &&
        !Array.isArray(order.polyethyleneBag)
    ) {
        return 'Las bolsas de polietileno deben ser un arreglo'
    }

    if (Array.isArray(order.polyethyleneBag)) {
        for (const bolsa of order.polyethyleneBag) {
            if (!esObjeto(bolsa)) {
                return 'Se encontró una bolsa de polietileno inválida'
            }

            if (!textoValido(bolsa.key)) {
                return 'La clave de la bolsa es obligatoria'
            }

            if (!cantidadValida(bolsa.quantity)) {
                return 'La cantidad de bolsas debe ser un entero mayor que cero'
            }

            if (!precioValido(bolsa.price)) {
                return 'El precio de la bolsa no puede ser negativo'
            }
        }
    }

    return null
}

module.exports = { validarPedido }
