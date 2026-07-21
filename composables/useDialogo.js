/**
 * useDialogo — reemplazo modular de los modales nativos del navegador
 * (`alert`, `confirm`, `prompt`) por un modal con el estilo de la app.
 *
 * Estado singleton a nivel de módulo: una sola instancia de <UiModalDialogo>
 * (montada en `app.vue`) refleja este estado, y cualquier componente puede
 * invocar los diálogos vía este composable.
 *
 * Uso:
 *   const { alerta, confirmar, preguntar } = useDialogo();
 *
 *   await alerta('No se pudo guardar.');                    // → true
 *   if (!(await confirmar('¿Eliminar el mapa?'))) return;   // → boolean
 *   const nombre = await preguntar('Nuevo nombre:');        // → string | null
 *
 * Cada método acepta una cadena (mensaje) o un objeto de opciones:
 *   confirmar({ mensaje, titulo, textoAceptar: 'Eliminar', variante: 'peligro' })
 */

// 'alerta' | 'confirmacion' | 'prompt'
const VALORES_INICIALES = {
  tipo: 'confirmacion',
  titulo: '',
  mensaje: '',
  textoAceptar: '', // vacío → texto por defecto según el tipo (en el componente)
  textoCancelar: 'Cancelar',
  variante: 'normal', // 'normal' | 'peligro' (botón de acción en rojo)
  valor: '', // valor del campo para tipo 'prompt'
  marcador: '', // placeholder del campo para tipo 'prompt'
};

const abierto = ref(false);
const opciones = reactive({ ...VALORES_INICIALES });
let resolver = null;

function aOpciones(arg) {
  return typeof arg === 'string' ? { mensaje: arg } : { ...arg };
}

/**
 * Abre el diálogo y devuelve una promesa que se resuelve al aceptar o cancelar.
 * @param {Object} config
 * @returns {Promise<boolean|string|null>}
 */
function abrir(config) {
  // Si ya había un diálogo pendiente, se resuelve como cancelado.
  if (resolver) cancelar();
  Object.assign(opciones, VALORES_INICIALES, config);
  return new Promise((resolve) => {
    resolver = resolve;
    abierto.value = true;
  });
}

function alerta(arg) {
  return abrir({ ...aOpciones(arg), tipo: 'alerta' });
}

function confirmar(arg) {
  return abrir({ ...aOpciones(arg), tipo: 'confirmacion' });
}

function preguntar(arg) {
  return abrir({ ...aOpciones(arg), tipo: 'prompt' });
}

function finalizar(resultado) {
  abierto.value = false;
  if (resolver) {
    const resolve = resolver;
    resolver = null;
    resolve(resultado);
  }
}

/** Acción de aceptar: true (alerta/confirmación) o el valor (prompt). */
function aceptar() {
  finalizar(opciones.tipo === 'prompt' ? opciones.valor : true);
}

/** Acción de cancelar / cierre nativo: false (confirmación), null (prompt), true (alerta). */
function cancelar() {
  let resultado = false;
  if (opciones.tipo === 'prompt') resultado = null;
  else if (opciones.tipo === 'alerta') resultado = true;
  finalizar(resultado);
}

export function useDialogo() {
  return { abierto, opciones, alerta, confirmar, preguntar, aceptar, cancelar };
}
