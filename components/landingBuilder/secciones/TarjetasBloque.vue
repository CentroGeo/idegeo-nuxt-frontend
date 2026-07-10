<script setup>
/* eslint-disable vue/no-mutating-props */
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';
import ModalAlineacionTexto from '~/components/landingBuilder/ModalAlineacionTexto.vue';
import ModalCambiarImagenTarjeta from '~/components/landingBuilder/ModalCambiarImagenTarjeta.vue';

const props = defineProps({
  seccionId: { type: String, required: true },
  datos: { type: Object, required: true },
});
const modalCambiarImagen = ref(null);
const modalAlineacion = ref(null);
const modalEnlace = ref(null);

const indiceTarjetaEdicion = ref(-1);
const indiceTarjetaArrastrada = ref(-1);
const indiceTarjetaSobre = ref(-1);

// Estado para controlar qué tarjeta y qué campo de texto estamos estilizando
const tarjetaEstiloIndex = ref(-1);
const campoEstilo = ref(''); // 'titulo' o 'descripcion'

// Estados para el modal de configuración de hipervínculo
const tarjetaEnlaceIndex = ref(-1);
const tempBotonTexto = ref('');
const tempBotonUrl = ref('');

// Asegurar que existan las propiedades básicas en datos para evitar crashes por bases de datos antiguas
if (!props.datos.tarjetas) {
  props.datos.tarjetas = [];
}
if (!props.datos.disposicion) {
  props.datos.disposicion = 'vertical';
}

// Watch para sanitizar la orientación de las tarjetas si cambia la disposición global
watch(
  () => props.datos.disposicion,
  (nuevaDisposicion) => {
    props.datos.tarjetas.forEach((t) => {
      if (nuevaDisposicion === 'vertical') {
        if (!t.orientacion || !t.orientacion.startsWith('vertical')) {
          t.orientacion = 'vertical-abajo';
        }
      } else {
        if (!t.orientacion || !t.orientacion.startsWith('horizontal')) {
          t.orientacion = 'horizontal-derecha';
        }
      }
    });
  },
  { immediate: true }
);

function agregarTarjeta() {
  if (props.datos.tarjetas.length >= 8) return;

  const esHorizontal = props.datos.disposicion === 'horizontal';
  props.datos.tarjetas.push({
    id: 'tarjeta-' + Math.random().toString(36).substring(2),
    titulo: '',
    descripcion: '',
    imagenUrl: '/inicio/tarjeta_visualiza.png',
    orientacion: esHorizontal ? 'horizontal-derecha' : 'vertical-abajo',
    tituloTipo: 'h2',
    tituloAlineacion: 'left',
    tituloColor: 'inherit',
    descripcionTipo: 'p',
    descripcionAlineacion: 'left',
    descripcionColor: 'inherit',
    botonTexto: '',
    botonUrl: '',
  });
}

function eliminarTarjeta(idx) {
  props.datos.tarjetas.splice(idx, 1);
}

function iniciarArrastreTarjeta(idx, event) {
  indiceTarjetaArrastrada.value = idx;
  event.dataTransfer.effectAllowed = 'move';
}

function soltarTarjeta(idxDestino) {
  if (indiceTarjetaArrastrada.value === -1 || indiceTarjetaArrastrada.value === idxDestino) {
    indiceTarjetaSobre.value = -1;
    return;
  }

  const tarjetas = props.datos.tarjetas;
  const tarjetaMovida = tarjetas.splice(indiceTarjetaArrastrada.value, 1)[0];
  tarjetas.splice(idxDestino, 0, tarjetaMovida);
  indiceTarjetaArrastrada.value = -1;
  indiceTarjetaSobre.value = -1;
}

function terminarArrastre() {
  indiceTarjetaArrastrada.value = -1;
  indiceTarjetaSobre.value = -1;
}

function abrirModalImagen(idx) {
  indiceTarjetaEdicion.value = idx;
  modalCambiarImagen.value?.abrirModal();
}

function manejarSeleccionarArchivo(archivo) {
  if (!archivo || indiceTarjetaEdicion.value === -1) return;

  const tarjeta = props.datos.tarjetas[indiceTarjetaEdicion.value];
  if (tarjeta.imagenUrl && tarjeta.imagenUrl.startsWith('blob:')) {
    URL.revokeObjectURL(tarjeta.imagenUrl);
  }
  tarjeta.imagenFile = archivo;
  tarjeta.imagenUrl = URL.createObjectURL(archivo);
}

function manejarSeleccionarEnlace(url) {
  if (!url || indiceTarjetaEdicion.value === -1) return;

  const tarjeta = props.datos.tarjetas[indiceTarjetaEdicion.value];
  if (tarjeta.imagenUrl && tarjeta.imagenUrl.startsWith('blob:')) {
    URL.revokeObjectURL(tarjeta.imagenUrl);
  }
  tarjeta.imagenFile = null;
  tarjeta.imagenUrl = url;
}

function registrarTitulo(elemento, tarjeta) {
  if (elemento) {
    if (document.activeElement !== elemento && elemento.textContent !== tarjeta.titulo) {
      elemento.textContent = tarjeta.titulo;
    }
  }
}

function registrarDescripcion(elemento, tarjeta) {
  if (elemento) {
    if (document.activeElement !== elemento && elemento.textContent !== tarjeta.descripcion) {
      elemento.textContent = tarjeta.descripcion;
    }
  }
}

// Métodos para abrir el modal de alineación/color y guardar
function abrirAlineacion(idx, campo) {
  tarjetaEstiloIndex.value = idx;
  campoEstilo.value = campo;

  const tarjeta = props.datos.tarjetas[idx];
  const alineacion =
    campo === 'titulo'
      ? tarjeta.tituloAlineacion || 'left'
      : tarjeta.descripcionAlineacion || 'left';
  const color =
    campo === 'titulo' ? tarjeta.tituloColor || '#ffffff' : tarjeta.descripcionColor || '#ffffff';

  modalAlineacion.value?.abrirModal({
    alineacion,
    color,
  });
}

function guardarEstilosTexto({ alineacion, color }) {
  if (tarjetaEstiloIndex.value === -1 || !campoEstilo.value) return;

  const tarjeta = props.datos.tarjetas[tarjetaEstiloIndex.value];
  if (campoEstilo.value === 'titulo') {
    tarjeta.tituloAlineacion = alineacion;
    tarjeta.tituloColor = color;
  } else {
    tarjeta.descripcionAlineacion = alineacion;
    tarjeta.descripcionColor = color;
  }

  tarjetaEstiloIndex.value = -1;
  campoEstilo.value = '';
}

// Métodos para abrir el modal de configuración de hipervínculo
function abrirModalEnlace(idx) {
  tarjetaEnlaceIndex.value = idx;
  const tarjeta = props.datos.tarjetas[idx];
  tempBotonTexto.value = tarjeta.botonTexto || 'Ver más';
  tempBotonUrl.value = tarjeta.botonUrl || '';
  modalEnlace.value?.abrirModal();
}

function cerrarModalEnlace() {
  modalEnlace.value?.cerrarModal();
  tarjetaEnlaceIndex.value = -1;
}

function guardarEnlace() {
  if (tarjetaEnlaceIndex.value === -1) return;
  const tarjeta = props.datos.tarjetas[tarjetaEnlaceIndex.value];
  tarjeta.botonTexto = tempBotonTexto.value.trim();
  tarjeta.botonUrl = tempBotonUrl.value.trim();
  cerrarModalEnlace();
}

function eliminarBoton(tarjeta) {
  tarjeta.botonTexto = '';
  tarjeta.botonUrl = '';
}

function evitarExcesoTexto(limite, event) {
  const texto = event.target.textContent || '';
  const teclasPermitidas = [
    'Backspace',
    'Delete',
    'ArrowLeft',
    'ArrowRight',
    'ArrowUp',
    'ArrowDown',
    'Tab',
    'Escape',
    'Enter',
  ];
  if (
    texto.length >= limite &&
    !teclasPermitidas.includes(event.key) &&
    !event.ctrlKey &&
    !event.metaKey
  ) {
    event.preventDefault();
  }
}

function manejarInput(limite, event, tarjeta, campo) {
  let texto = event.target.textContent || '';
  if (texto.length > limite) {
    texto = texto.slice(0, limite);
    event.target.textContent = texto;

    // Colocar el cursor al final del contenido
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(event.target);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
  }
  tarjeta[campo] = texto;
}
</script>

<template>
  <section class="seccion-tarjetas-editor m-y-10">
    <div class="contenedor-tarjetas-wrapper">
      <div class="seccion-tarjetas-config m-b-6 flex flex-gap-2 align-items-center">
        <span class="label-config-chico">Vista de tarjetas:</span>
        <div class="flex flex-gap-2">
          <button
            type="button"
            class="btn-config-disposicion"
            :class="{ 'boton-activo': (datos.disposicion || 'vertical') === 'vertical' }"
            @click="datos.disposicion = 'vertical'"
          >
            ▦ Cuadrícula
          </button>
          <button
            type="button"
            class="btn-config-disposicion"
            :class="{ 'boton-activo': datos.disposicion === 'horizontal' }"
            @click="datos.disposicion = 'horizontal'"
          >
            ☰ Lista
          </button>
        </div>
      </div>

      <div class="contenedor ancho-fijo">
        <div class="flex">
          <div
            v-for="(tarjeta, idx) in datos.tarjetas"
            :key="tarjeta.id"
            :class="[
              datos.disposicion === 'horizontal' ? 'columna-8' : 'columna-5',
              'posicion-relativa wrapper-tarjeta-draggable m-b-4',
            ]"
            draggable="true"
            @dragstart="iniciarArrastreTarjeta(idx, $event)"
            @dragover.prevent
            @dragenter="indiceTarjetaSobre = idx"
            @dragleave="if (indiceTarjetaSobre === idx) indiceTarjetaSobre = -1;"
            @drop="soltarTarjeta(idx)"
            @dragend="terminarArrastre"
          >
            <!-- Botón Eliminar Desplazado al exterior para evitar clics accidentales -->
            <div class="tarjeta-editable-controles">
              <button
                type="button"
                class="boton-pictograma boton-sin-contenedor-secundario text-danger btn-eliminar-tarjeta"
                aria-label="Eliminar tarjeta"
                title="Eliminar tarjeta"
                @click="eliminarTarjeta(idx)"
              >
                <span class="pictograma-eliminar" aria-hidden="true"></span>
              </button>
            </div>

            <div
              class="tarjeta tarjeta-editable"
              :class="{
                ['tarjeta-orientacion-' + (tarjeta.orientacion || 'vertical-abajo')]: true,
                'tarjeta-dragover': indiceTarjetaSobre === idx && indiceTarjetaArrastrada !== idx,
              }"
            >
              <div class="tarjeta-imagen-wrapper">
                <img :src="tarjeta.imagenUrl" class="tarjeta-imagen" alt="" />
                <div
                  class="tarjeta-imagen-overlay flex flex-column align-items-center justify-content-center flex-gap-2"
                >
                  <button
                    type="button"
                    class="boton-secundario boton-chico boton-imagen-cambiar"
                    @click="abrirModalImagen(idx)"
                  >
                    <span class="pictograma-editar m-r-1" aria-hidden="true"></span>
                    <span>Editar Imagen</span>
                  </button>

                  <!-- Selector Acotado de Orientación por Tarjeta (Condicional según disposición global) -->
                  <div class="overlay-config-layout">
                    <span class="overlay-config-label">Alineación imagen:</span>

                    <!-- Opciones si la disposición es Vertical -->
                    <div
                      v-if="(datos.disposicion || 'vertical') === 'vertical'"
                      class="flex flex-gap-1 flex-contenido-centrado m-t-1"
                    >
                      <button
                        type="button"
                        class="btn-overlay-layout"
                        :class="{
                          active: (tarjeta.orientacion || 'vertical-abajo') === 'vertical-abajo',
                        }"
                        title="Imagen arriba"
                        @click="tarjeta.orientacion = 'vertical-abajo'"
                      >
                        <span class="pictograma-flecha-arriba" aria-hidden="true"></span>
                      </button>
                      <button
                        type="button"
                        class="btn-overlay-layout"
                        :class="{ active: tarjeta.orientacion === 'vertical-arriba' }"
                        title="Imagen abajo"
                        @click="tarjeta.orientacion = 'vertical-arriba'"
                      >
                        <span class="pictograma-flecha-abajo" aria-hidden="true"></span>
                      </button>
                    </div>

                    <!-- Opciones si la disposición es Horizontal -->
                    <div v-else class="flex flex-gap-1 flex-contenido-centrado m-t-1">
                      <button
                        type="button"
                        class="btn-overlay-layout"
                        :class="{
                          active:
                            (tarjeta.orientacion || 'horizontal-derecha') === 'horizontal-derecha',
                        }"
                        title="Imagen izquierda"
                        @click="tarjeta.orientacion = 'horizontal-derecha'"
                      >
                        <span class="pictograma-flecha-izquierda" aria-hidden="true"></span>
                      </button>
                      <button
                        type="button"
                        class="btn-overlay-layout"
                        :class="{ active: tarjeta.orientacion === 'horizontal-izquierda' }"
                        title="Imagen derecha"
                        @click="tarjeta.orientacion = 'horizontal-izquierda'"
                      >
                        <span class="pictograma-flecha-derecha" aria-hidden="true"></span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="tarjeta-cuerpo flex flex-column">
                <div class="editable-texto-seccion">
                  <div class="tarjeta-texto-toolbar flex flex-gap-2 align-items-center">
                    <div class="flex flex-gap-1">
                      <button
                        type="button"
                        class="btn-config-texto"
                        :class="{ active: (tarjeta.tituloTipo || 'h2') === 'h2' }"
                        @click="tarjeta.tituloTipo = 'h2'"
                      >
                        H1
                      </button>
                      <button
                        type="button"
                        class="btn-config-texto"
                        :class="{ active: tarjeta.tituloTipo === 'h3' }"
                        @click="tarjeta.tituloTipo = 'h3'"
                      >
                        H2
                      </button>
                      <button
                        type="button"
                        class="btn-config-texto"
                        :class="{ active: tarjeta.tituloTipo === 'p' }"
                        @click="tarjeta.tituloTipo = 'p'"
                      >
                        P
                      </button>
                    </div>

                    <div class="flex flex-gap-1">
                      <button
                        type="button"
                        class="btn-config-texto btn-config-estilo-modal"
                        title="Estilos y alineación"
                        @click="abrirAlineacion(idx, 'titulo')"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          style="width: 13px; height: 13px"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M4 20h4l11-11a2.8 2.8 0 0 0-4-4L4 16v4ZM13.5 6.5l4 4" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <component
                    :is="tarjeta.tituloTipo || 'h2'"
                    :ref="(el) => registrarTitulo(el, tarjeta)"
                    class="input-tarjeta-titulo tarjeta-titulo"
                    :class="{
                      'is-empty': !tarjeta.titulo || tarjeta.titulo.trim() === '',
                      'tarjeta-titulo-h1': (tarjeta.tituloTipo || 'h2') === 'h2',
                      'tarjeta-titulo-h2': tarjeta.tituloTipo === 'h3',
                      'tarjeta-titulo-p': tarjeta.tituloTipo === 'p',
                    }"
                    :style="{
                      textAlign: tarjeta.tituloAlineacion || 'left',
                      color: tarjeta.tituloColor || 'inherit',
                    }"
                    contenteditable="true"
                    data-placeholder="Título de la tarjeta..."
                    @keydown="evitarExcesoTexto(70, $event)"
                    @input="manejarInput(70, $event, tarjeta, 'titulo')"
                    @blur="tarjeta.titulo = $event.target.textContent.trim() || ''"
                  />
                </div>

                <div class="editable-texto-seccion">
                  <div class="tarjeta-texto-toolbar flex flex-gap-2 align-items-center">
                    <div class="flex flex-gap-1">
                      <button
                        type="button"
                        class="btn-config-texto"
                        :class="{ active: tarjeta.descripcionTipo === 'h2' }"
                        @click="tarjeta.descripcionTipo = 'h2'"
                      >
                        H1
                      </button>
                      <button
                        type="button"
                        class="btn-config-texto"
                        :class="{ active: tarjeta.descripcionTipo === 'h3' }"
                        @click="tarjeta.descripcionTipo = 'h3'"
                      >
                        H2
                      </button>
                      <button
                        type="button"
                        class="btn-config-texto"
                        :class="{ active: (tarjeta.descripcionTipo || 'p') === 'p' }"
                        @click="tarjeta.descripcionTipo = 'p'"
                      >
                        P
                      </button>
                    </div>

                    <div class="flex flex-gap-1">
                      <button
                        type="button"
                        class="btn-config-texto btn-config-estilo-modal"
                        title="Estilos y alineación"
                        @click="abrirAlineacion(idx, 'descripcion')"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          style="width: 13px; height: 13px"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M4 20h4l11-11a2.8 2.8 0 0 0-4-4L4 16v4ZM13.5 6.5l4 4" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <component
                    :is="tarjeta.descripcionTipo || 'p'"
                    :ref="(el) => registrarDescripcion(el, tarjeta)"
                    class="textarea-tarjeta-desc tarjeta-descripcion"
                    :class="{
                      'is-empty': !tarjeta.descripcion || tarjeta.descripcion.trim() === '',
                      'tarjeta-desc-h1': tarjeta.descripcionTipo === 'h2',
                      'tarjeta-desc-h2': tarjeta.descripcionTipo === 'h3',
                      'tarjeta-desc-p': (tarjeta.descripcionTipo || 'p') === 'p',
                    }"
                    :style="{
                      textAlign: tarjeta.descripcionAlineacion || 'left',
                      color: tarjeta.descripcionColor || 'inherit',
                    }"
                    contenteditable="true"
                    data-placeholder="Descripción de la tarjeta..."
                    @keydown="evitarExcesoTexto(450, $event)"
                    @input="manejarInput(450, $event, tarjeta, 'descripcion')"
                    @blur="tarjeta.descripcion = $event.target.textContent.trim() || ''"
                  />
                </div>

                <!-- Footer/Acción de la Tarjeta (Opcional en Tarjeta-Pie) -->
                <div
                  class="tarjeta-pie-editor flex justify-content-center m-t-2"
                  :class="{ 'sin-boton': !tarjeta.botonTexto }"
                >
                  <div
                    v-if="tarjeta.botonTexto !== undefined && tarjeta.botonTexto !== ''"
                    class="posicion-relativa wrapper-boton-editable"
                  >
                    <span class="boton-primario boton-chico cursor-pointer text-no-select">
                      {{ tarjeta.botonTexto }}
                    </span>

                    <div class="boton-editable-acciones">
                      <button
                        type="button"
                        class="btn-control-boton btn-editar-link"
                        title="Editar enlace"
                        @click="abrirModalEnlace(idx)"
                      >
                        <span class="pictograma-editar" aria-hidden="true"></span>
                      </button>
                      <button
                        type="button"
                        class="btn-control-boton btn-eliminar-link"
                        title="Eliminar enlace"
                        @click="eliminarBoton(tarjeta)"
                      >
                        <span class="pictograma-eliminar" aria-hidden="true"></span>
                      </button>
                    </div>
                  </div>
                  <button
                    v-else
                    type="button"
                    class="btn-agregar-enlace-tarjeta"
                    @click="abrirModalEnlace(idx)"
                  >
                    <span class="pictograma-agregar m-r-1" aria-hidden="true"></span>
                    <span>Agregar enlace</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="texto-centrado m-t-6">
        <button
          type="button"
          class="boton-secundario"
          :disabled="datos.tarjetas.length >= 8"
          @click="agregarTarjeta"
        >
          <span class="pictograma-agregar" aria-hidden="true"></span>
          <span>Agregar Tarjeta ({{ datos.tarjetas.length }}/8)</span>
        </button>
      </div>
    </div>

    <ClientOnly>
      <!-- Modal para cambiar imagen -->
      <ModalCambiarImagenTarjeta
        ref="modalCambiarImagen"
        @seleccionar-archivo="manejarSeleccionarArchivo"
        @seleccionar-enlace="manejarSeleccionarEnlace"
      />

      <!-- Modal de alineación de texto -->
      <ModalAlineacionTexto ref="modalAlineacion" @guardar-estilos="guardarEstilosTexto" />

      <!-- Modal exclusivo para configurar el Hipervínculo (Limpieza de interfaz) -->
      <SisdaiModal ref="modalEnlace" class="modal-enlace-tarjeta">
        <template #encabezado>
          <div class="modal-enlace-tarjeta__encabezado">
            <h2 class="modal-enlace-tarjeta__titulo">Configurar enlace de la tarjeta</h2>
          </div>
        </template>
        <template #cuerpo>
          <div class="modal-enlace-tarjeta__cuerpo flex flex-column flex-gap-3">
            <div class="grupo-formulario">
              <label for="input-link-texto">Texto del enlace (ej: "Ver más", "Ir al sitio"):</label>
              <input
                id="input-link-texto"
                v-model="tempBotonTexto"
                type="text"
                placeholder="Escribe el texto que verá el usuario..."
                class="input-control"
              />
            </div>
            <div class="grupo-formulario">
              <label for="input-link-url">Dirección URL de destino:</label>
              <input
                id="input-link-url"
                v-model="tempBotonUrl"
                type="text"
                placeholder="Ej: https://ejemplo.com o /ruta-interna"
                class="input-control"
              />
            </div>
            <div class="flex flex-gap-2 justify-content-end m-t-4">
              <button type="button" class="boton-secundario boton-chico" @click="cerrarModalEnlace">
                Cancelar
              </button>
              <button type="button" class="boton-primario boton-chico" @click="guardarEnlace">
                Aceptar
              </button>
            </div>
          </div>
        </template>
      </SisdaiModal>
    </ClientOnly>
  </section>
</template>

<style scoped lang="scss">
.contenedor-tarjetas-wrapper {
  position: relative;
  padding: 16px;
  border: 1px dashed transparent;
  border-radius: 8px;
  transition: border-color 0.2s;

  &:hover {
    border-color: rgb(105 28 50 / 40%);
  }
}

.seccion-tarjetas-config {
  background: var(--color-neutro-1, #f5f5f5);
  padding: 10px 16px;
  border-radius: 6px;
  border: 1px solid var(--color-neutro-2, #e0e0e0);
  width: fit-content;
}

.label-config-chico {
  font-size: 0.6875rem;
  font-weight: 700;
  color: var(--color-neutro-5, #757575);
  text-transform: uppercase;
  margin-right: 8px;
}

.btn-config-disposicion {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 12px;
  border: 1px solid var(--color-neutro-2, #e0e0e0);
  background: var(--color-neutro-0, #ffffff);
  border-radius: 4px;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-neutro-5, #616161);
  cursor: pointer;
  transition:
    background 0.15s,
    border-color 0.15s,
    color 0.15s;

  &:hover {
    background: var(--color-neutro-1, #f5f5f5);
    border-color: var(--color-neutro-3, #bdbdbd);
  }

  &.boton-activo {
    background: rgb(105 28 50);
    border-color: rgb(105 28 50);
    color: #ffffff;
  }
}

.posicion-relativa {
  position: relative;
}

.wrapper-tarjeta-draggable {
  &:hover {
    .tarjeta-editable-controles {
      opacity: 1;
      pointer-events: auto;
    }
  }
}

.tarjeta-editable-controles {
  position: absolute;
  top: -8px;
  right: -8px;
  z-index: 25;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
}

.btn-eliminar-tarjeta {
  background: var(--color-neutro-0, #ffffff) !important;
  border: 1px solid var(--color-neutro-3, #bdbdbd) !important;
  border-radius: 50% !important;
  width: 28px !important;
  height: 28px !important;
  padding: 0 !important;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15) !important;
  cursor: pointer;

  &:hover {
    background: #ffebee !important;
    border-color: var(--color-alerta, #ff3b30) !important;
    color: var(--color-alerta, #ff3b30) !important;
  }
}

.btn-config-texto {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  padding: 0;
  border: 1px solid var(--color-neutro-2, #e0e0e0);
  background: var(--color-neutro-0, #ffffff);
  border-radius: 4px;
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--color-neutro-5, #616161);
  cursor: pointer;
  transition:
    background 0.15s,
    border-color 0.15s,
    color 0.15s;

  &:hover {
    background: var(--color-neutro-1, #f5f5f5);
    border-color: var(--color-neutro-3, #bdbdbd);
  }

  &.active {
    background: rgb(105 28 50);
    border-color: rgb(105 28 50);
    color: #ffffff;
  }

  &.btn-config-estilo-modal {
    width: 22px;
    height: 22px;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
}

.tarjeta-editable {
  position: relative;
  overflow: visible !important;
  cursor: grab;
  display: flex;
  height: 100%;
  min-height: 180px;
  transition:
    border-color 0.2s,
    background-color 0.2s,
    transform 0.2s,
    box-shadow 0.2s;

  &:active {
    cursor: grabbing;
  }

  &.tarjeta-dragover {
    border: 2px dashed rgb(105 28 50) !important;
    background-color: rgb(105 28 50 / 4%) !important;
    transform: scale(1.02);
  }

  &:hover {
    .tarjeta-imagen-overlay {
      opacity: 1;
    }
  }
}

.tarjeta-imagen-wrapper {
  position: relative;
  overflow: hidden;
  background: var(--color-neutro-2, #e0e0e0);
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &:hover {
    .tarjeta-imagen-overlay {
      opacity: 1;
      pointer-events: auto;
    }
  }
}

.tarjeta-imagen-overlay {
  position: absolute;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  background: rgba(0, 0, 0, 0.4);
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
  z-index: 10;
  box-sizing: border-box;
}

.boton-imagen-cambiar {
  background: var(--color-neutro-0, #ffffff) !important;
  color: var(--color-primario-2, rgb(105 28 50)) !important;
  border: 1px solid var(--color-primario-2, rgb(105 28 50)) !important;
  font-weight: 600;
  margin: 0 auto !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;

  &:hover {
    background: var(--color-neutro-1, rgb(245 245 245)) !important;
  }
}

.overlay-config-layout {
  text-align: center;
  background: rgba(0, 0, 0, 0.7);
  padding: 6px 12px;
  border-radius: 6px;
  width: max-content;
  max-width: 90%;
  margin: 0 auto !important;
  box-sizing: border-box;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
}

.overlay-config-label {
  font-size: 0.625rem;
  color: #ffffff;
  font-weight: 600;
  display: block;
}

.btn-overlay-layout {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: #ffffff;
  cursor: pointer;

  span {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    line-height: 1 !important;
    width: 100% !important;
    height: 100% !important;
    padding: 0 !important;
  }
  transition:
    background 0.15s,
    border-color 0.15s,
    color 0.15s;

  &:hover {
    background: rgba(255, 255, 255, 0.4);
  }

  &.active {
    background: rgb(105 28 50);
    border-color: rgb(105 28 50);
    color: #ffffff;
  }
}

.tarjeta-cuerpo {
  padding: 12px;
  gap: 8px;
  flex: 1;
  min-width: 0;

  > .editable-texto-seccion {
    margin: 0 !important;
  }
}

.editable-texto-seccion {
  position: relative;
  width: 100%;

  &:focus-within {
    .tarjeta-texto-toolbar {
      opacity: 1;
      pointer-events: auto;
      transform: translate(-50%, 0);
    }
  }
}

.tarjeta-texto-toolbar {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translate(-50%, 2px);
  margin-bottom: 4px;
  background: var(--color-neutro-0, #ffffff);
  border: 1px solid var(--color-neutro-2, #e0e0e0);
  border-radius: 6px;
  padding: 4px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  z-index: 20;
  opacity: 0;
  pointer-events: none;
  transition:
    opacity 0.15s,
    transform 0.15s;
}

.input-tarjeta-titulo {
  border: 1px solid var(--campo-borde) !important;
  background: var(--campo-fondo) !important;
  width: 100%;
  padding: 8px 12px !important;
  margin: 0;
  box-sizing: border-box;
  border-radius: 8px !important;
  font-family: var(--tipografia-familia, inherit);
  color: var(--campo-color, inherit);
  transition:
    border-color 0.2s,
    background-color 0.2s,
    box-shadow 0.2s;
  outline: none;

  &:hover {
    background-color: var(--campo-cursor-fondo) !important;
    border-color: var(--campo-cursor-borde) !important;
  }

  &:focus {
    background-color: var(--campo-enfoque-fondo) !important;
    border-color: var(--campo-enfoque-borde) !important;
    box-shadow: 0 0 8px var(--campo-enfoque-sombra) !important;
    outline: none !important;
  }

  &.is-empty:not(:focus)::before {
    content: attr(data-placeholder);
    color: var(--campo-ejemplo-color, #757575) !important;
    font-style: italic;
    opacity: 1;
    pointer-events: none;
    display: inline-block;
  }
}

.textarea-tarjeta-desc {
  border: 1px solid var(--campo-borde) !important;
  background: var(--campo-fondo) !important;
  width: 100%;
  padding: 8px 12px !important;
  margin: 0;
  box-sizing: border-box;
  border-radius: 8px !important;
  font-family: var(--tipografia-familia, inherit);
  line-height: 1.4;
  color: var(--campo-color, inherit);
  transition:
    border-color 0.2s,
    background-color 0.2s,
    box-shadow 0.2s;
  outline: none;
  white-space: pre-wrap;
  word-break: break-word;

  &:hover {
    background-color: var(--campo-cursor-fondo) !important;
    border-color: var(--campo-cursor-borde) !important;
  }

  &:focus {
    background-color: var(--campo-enfoque-fondo) !important;
    border-color: var(--campo-enfoque-borde) !important;
    box-shadow: 0 0 8px var(--campo-enfoque-sombra) !important;
    outline: none !important;
  }

  &.is-empty:not(:focus)::before {
    content: attr(data-placeholder);
    color: var(--campo-ejemplo-color, #757575) !important;
    font-style: italic;
    opacity: 1;
    pointer-events: none;
    display: inline-block;
  }
}

// Typography dynamic size and margin mappings matching Sisdai CSS
.tarjeta-titulo {
  margin-top: 0 !important;
  margin-bottom: 2px !important;
}

.tarjeta-descripcion {
  margin-top: 0 !important;
  margin-bottom: 0 !important;
}

.tarjeta-titulo-h1 {
  font-size: 1.75rem !important;
  font-weight: 700 !important;
}

.tarjeta-titulo-h2 {
  font-size: 1.375rem !important;
  font-weight: 700 !important;
}

.tarjeta-titulo-p {
  font-size: 0.875rem !important;
  font-weight: 400 !important;
}

.tarjeta-desc-h1 {
  font-size: 1.75rem !important;
  font-weight: 700 !important;
  color: inherit !important;
}

.tarjeta-desc-h2 {
  font-size: 1.375rem !important;
  font-weight: 700 !important;
  color: inherit !important;
}

.tarjeta-desc-p {
  font-size: 0.875rem !important;
  font-weight: 400 !important;
}

.tarjeta-orientacion-vertical-abajo {
  flex-direction: column;

  .tarjeta-imagen-wrapper {
    width: 100%;
    height: 160px;
    border-radius: 8px 8px 0 0;
  }
}

.tarjeta-orientacion-vertical-arriba {
  flex-direction: column-reverse;

  .tarjeta-imagen-wrapper {
    width: 100%;
    height: 160px;
    border-radius: 0 0 8px 8px;
  }
}

.tarjeta-orientacion-horizontal-derecha {
  flex-direction: row !important;
  align-items: stretch !important;

  .tarjeta-imagen-wrapper {
    width: 200px !important;
    min-width: 200px !important;
    height: auto !important;
    position: relative !important;
    flex-shrink: 0 !important;
    border-radius: 8px 0 0 8px;

    img {
      position: absolute !important;
      top: 0;
      left: 0;
      width: 100% !important;
      height: 100% !important;
      object-fit: cover !important;
    }
  }
}

.tarjeta-orientacion-horizontal-izquierda {
  flex-direction: row-reverse !important;
  align-items: stretch !important;

  .tarjeta-imagen-wrapper {
    width: 200px !important;
    min-width: 200px !important;
    height: auto !important;
    position: relative !important;
    flex-shrink: 0 !important;
    border-radius: 0 8px 8px 0;

    img {
      position: absolute !important;
      top: 0;
      left: 0;
      width: 100% !important;
      height: 100% !important;
      object-fit: cover !important;
    }
  }
}

// Botones de acción opcionales al pie de la tarjeta
.tarjeta-pie-editor {
  border-top: 1px dashed var(--color-neutro-2, #e0e0e0);
  padding-top: 8px;
  width: 100%;
  display: flex;
  justify-content: center;

  &.sin-boton {
    display: none;
    border-top: none;
    padding-top: 0;
  }
}

.tarjeta-editable:hover {
  .tarjeta-pie-editor.sin-boton {
    display: flex;
    border-top: 1px dashed var(--color-neutro-2, #e0e0e0);
    padding-top: 8px;
  }
}

.wrapper-boton-editable {
  position: relative;
  display: inline-flex;
  align-items: center;

  &:hover {
    .boton-editable-acciones {
      opacity: 1;
      pointer-events: auto;
      transform: translate(-50%, 0);
    }
  }
}

.boton-editable-acciones {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translate(-50%, 4px);
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--color-neutro-0, #ffffff);
  border: 1px solid var(--color-neutro-2, #e0e0e0);
  border-radius: 6px;
  padding: 4px 6px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  opacity: 0;
  pointer-events: none;
  transition:
    opacity 0.15s,
    transform 0.15s;
  z-index: 20;

  &::before {
    content: '';
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    height: 12px;
    background: transparent;
  }
}

// Las clases de ayuda del modal de imagen se eliminan de aquí y se definen en el namespace del modal correspondiente.

.btn-control-boton {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 26px;
  height: 26px;
  padding: 0;
  border: 1px solid var(--color-neutro-2, #e0e0e0);
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s,
    border-color 0.15s;

  span {
    font-size: 0.875rem;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    line-height: 1 !important;
    width: 100% !important;
    height: 100% !important;
    padding: 0 !important;
  }

  &:hover {
    background: var(--color-neutro-1, #f5f5f5);
  }

  &.btn-eliminar-link {
    color: var(--color-alerta, #ff3b30);
    &:hover {
      background: #ffebee;
      border-color: var(--color-alerta, #ff3b30);
    }
  }

  &.btn-editar-link {
    color: var(--color-primario-2, rgb(105 28 50));
    &:hover {
      background: #f5ecef;
      border-color: rgb(105 28 50);
    }
  }
}

.btn-agregar-enlace-tarjeta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--formulario-fondo, #f5f5f5) !important;
  border: 1px solid var(--formulario-borde, #bdbdbd) !important;
  color: var(--formulario-texto-secundario, #757575) !important;
  border-radius: 8px !important;
  padding: 8px 12px !important;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition:
    background 0.2s,
    color 0.2s,
    border-color 0.2s;

  &:hover {
    border-color: var(--formulario-foco, #9f2241) !important;
    background: var(--color-neutro-1, #f5f5f5) !important;
    color: var(--formulario-foco, #9f2241) !important;
  }
}

// Las clases de ayuda del modal de imagen se trasladaron a ModalCambiarImagenTarjeta.vue.

.modal-enlace-tarjeta {
  :deep(.modal-contenedor) {
    width: min(440px, calc(100vw - 32px));
    max-width: 100%;
    box-sizing: border-box;
  }

  &__encabezado {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--color-neutro-2, #e0e0e0);
  }

  &__titulo {
    margin: 0;
    font-size: 1.125rem;
    line-height: 1.3;
  }

  &__cuerpo {
    padding: 16px 0;
  }

  :deep(label) {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--campo-etiqueta-color) !important;
    margin-bottom: 4px;
  }

  :deep(input[type='text']) {
    border: 1px solid var(--campo-borde) !important;
    background: var(--campo-fondo) !important;
    width: 100%;
    padding: 8px 12px !important;
    box-sizing: border-box;
    border-radius: 8px !important;
    font-family: var(--tipografia-familia, inherit);
    color: var(--campo-color, inherit) !important;
    transition:
      border-color 0.2s,
      background-color 0.2s,
      box-shadow 0.2s;
    outline: none;

    &:hover {
      background-color: var(--campo-cursor-fondo) !important;
      border-color: var(--campo-cursor-borde) !important;
    }

    &:focus {
      background-color: var(--campo-enfoque-fondo) !important;
      border-color: var(--campo-enfoque-borde) !important;
      box-shadow: 0 0 8px var(--campo-enfoque-sombra) !important;
      outline: none !important;
    }

    &::placeholder {
      color: var(--campo-ejemplo-color, #757575) !important;
      font-style: italic;
      opacity: 1;
    }
  }
}
</style>
