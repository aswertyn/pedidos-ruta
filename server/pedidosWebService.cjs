
const { XMLParser } = require('fast-xml-parser');

const parser = new XMLParser({
  ignoreAttributes: true,
  processEntities: true,
});

async function consultarServicio(operacion, parametros = {}) {
  const baseUrl = process.env.PEDIDOS_WS_URL;

  if (!baseUrl) {
    throw new Error('Falta configurar PEDIDOS_WS_URL');
  }

  const url = `${baseUrl.replace(/\/$/, '')}/${operacion}`;

  const respuesta = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(parametros),
    signal: AbortSignal.timeout(15000),
  });

  if (!respuesta.ok) {
    throw new Error(
      `El Web Service respondió con HTTP ${respuesta.status}`
    );
  }

  const xml = await respuesta.text();
  const documento = parser.parse(xml);

  let contenido = documento.string;

  if (contenido === undefined || contenido === null) {
    throw new Error('Respuesta XML inesperada');
  }

  // Algunos métodos devuelven JSON codificado dos veces.
  for (let intento = 0; intento < 2; intento++) {
    if (typeof contenido !== 'string') break;

    contenido = JSON.parse(contenido);
  }

  if (
    contenido &&
    !Array.isArray(contenido) &&
    contenido.status === 'ERROR'
  ) {
    throw new Error(contenido.mensaje || 'Error del Web Service');
  }

  if (!Array.isArray(contenido)) {
    throw new Error('El servicio no devolvió un arreglo');
  }

  return contenido;
}

function consultarClientes() {
  return consultarServicio('consultarClientes');
}

function consultarProductos(datos = '') {
  return consultarServicio('consultarProductos', { datos });
}

function consultarPedidos(desde, hasta) {
  return consultarServicio('consultarPedidos', {
    desde,
    hasta,
  });
}

module.exports = {
  consultarClientes,
  consultarProductos,
  consultarPedidos,
};
