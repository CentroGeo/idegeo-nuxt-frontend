<script setup>
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';

const LIMITE_DIAPOSITIVAS = 10;

const emit = defineEmits(['guardar-carrusel']);

const modalCarrusel = ref(null);
const modalEnlace = ref(null);
const diapositivas = ref([]);
const idArrastrado = ref(null);
const diapositivaEnlaceId = ref(null);
const tempBotonTexto = ref('');
const tempBotonUrl = ref('');

function crearDiapositivaVacia() {
  return {
    id: crypto.randomUUID(),
    texto: '',
    imagenUrl: null,
    imagenTipo: 'imagen',
    imagenArchivo: null,
    botonTexto: '',
    botonUrl: '',
  };
}

function esUrlDeVideo(url) {
  return /\.(mp4|webm|ogg|mov|m4v)(\?|#|$)/i.test(url);
}

function puedeAgregarDiapositiva() {
  return diapositivas.value.length < LIMITE_DIAPOSITIVAS;
}

function agregarDiapositiva() {
  if (!puedeAgregarDiapositiva()) return;
  diapositivas.value.push(crearDiapositivaVacia());
}

function eliminarDiapositiva(id) {
  const diapositiva = diapositivas.value.find((d) => d.id === id);
  if (diapositiva?.imagenUrl?.startsWith('blob:')) {
    URL.revokeObjectURL(diapositiva.imagenUrl);
  }
  diapositivas.value = diapositivas.value.filter((d) => d.id !== id);
}

function manejarSeleccionImagen(id, archivo) {
  const diapositiva = diapositivas.value.find((d) => d.id === id);
  if (!diapositiva) return;

  if (diapositiva.imagenUrl?.startsWith('blob:')) {
    URL.revokeObjectURL(diapositiva.imagenUrl);
  }

  diapositiva.imagenArchivo = archivo;
  diapositiva.imagenUrl = URL.createObjectURL(archivo);
  diapositiva.imagenTipo = archivo.type.startsWith('video/') ? 'video' : 'imagen';
}

function manejarSeleccionEnlace(id, url) {
  const diapositiva = diapositivas.value.find((d) => d.id === id);
  if (!diapositiva) return;

  if (diapositiva.imagenUrl?.startsWith('blob:')) {
    URL.revokeObjectURL(diapositiva.imagenUrl);
  }

  diapositiva.imagenArchivo = null;
  diapositiva.imagenUrl = url;
  diapositiva.imagenTipo = esUrlDeVideo(url) ? 'video' : 'imagen';
}

function abrirModalEnlace(id) {
  const diapositiva = diapositivas.value.find((d) => d.id === id);
  if (!diapositiva) return;

  diapositivaEnlaceId.value = id;
  tempBotonTexto.value = diapositiva.botonTexto || 'Ver más';
  tempBotonUrl.value = diapositiva.botonUrl || '';
  modalEnlace.value?.abrirModal();
}

function cerrarModalEnlace() {
  modalEnlace.value?.cerrarModal?.();
  diapositivaEnlaceId.value = null;
}

function guardarEnlace() {
  const diapositiva = diapositivas.value.find((d) => d.id === diapositivaEnlaceId.value);
  if (!diapositiva) return;

  diapositiva.botonTexto = tempBotonTexto.value.trim();
  diapositiva.botonUrl = tempBotonUrl.value.trim();
  cerrarModalEnlace();
}

function eliminarBoton(diapositiva) {
  diapositiva.botonTexto = '';
  diapositiva.botonUrl = '';
}

function alIniciarArrastre(id) {
  idArrastrado.value = id;
}

function alSoltar(idDestino) {
  if (!idArrastrado.value || idArrastrado.value === idDestino) {
    idArrastrado.value = null;
    return;
  }

  const indiceOrigen = diapositivas.value.findIndex((d) => d.id === idArrastrado.value);
  const indiceDestino = diapositivas.value.findIndex((d) => d.id === idDestino);
  idArrastrado.value = null;

  if (indiceOrigen === -1 || indiceDestino === -1) return;

  const lista = [...diapositivas.value];
  const [movida] = lista.splice(indiceOrigen, 1);
  lista.splice(indiceDestino, 0, movida);
  diapositivas.value = lista;
}

function abrirModal(carruselExistente) {
  diapositivas.value = carruselExistente?.length
    ? carruselExistente.map((diapositiva) => ({ ...diapositiva }))
    : [crearDiapositivaVacia()];

  modalCarrusel.value?.abrirModal();
}

function cerrarModal() {
  modalCarrusel.value?.cerrarModal?.();
}

function confirmarCarrusel() {
  const diapositivasValidas = diapositivas.value.filter((d) => d.texto.trim() || d.imagenUrl);

  emit('guardar-carrusel', diapositivasValidas);
  cerrarModal();
}

defineExpose({
  abrirModal,
});
</script>

<template>
  <ClientOnly>
    <SisdaiModal ref="modalCarrusel" class="modal-carrusel">
      <template #encabezado>
        <div class="modal-carrusel__encabezado">
          <h2 class="modal-carrusel__titulo">Carrusel</h2>

          <button
            type="button"
            class="modal-carrusel__cerrar"
            aria-label="Cerrar modal"
            title="Cerrar"
            @click="cerrarModal"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M6 6l12 12M18 6 6 18"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>
      </template>

      <template #cuerpo>
        <div class="flex flex-contenido-separado modal-carrusel__encabezado-lista">
          <p class="texto-color-secundario m-0">
            Agrega una imagen o video y un texto por diapositiva.
          </p>

          <span class="modal-carrusel__contador" aria-live="polite">
            {{ diapositivas.length }}/{{ LIMITE_DIAPOSITIVAS }}
          </span>
        </div>

        <ul class="modal-carrusel__lista">
          <li
            v-for="(diapositiva, indice) in diapositivas"
            :key="diapositiva.id"
            class="modal-carrusel__item borde borde-redondeado-8"
            @dragover.prevent
            @drop="alSoltar(diapositiva.id)"
          >
            <div
              class="modal-carrusel__item-encabezado"
              draggable="true"
              @dragstart="alIniciarArrastre(diapositiva.id)"
            >
              <button
                type="button"
                class="boton-pictograma boton-sin-contenedor-secundario boton-chico"
                aria-label="Arrastra para reordenar la diapositiva"
                title="Arrastra para reordenar"
              >
                <span class="pictograma-mover" aria-hidden="true" />
              </button>

              <p class="modal-carrusel__item-titulo">Diapositiva {{ indice + 1 }}</p>

              <button
                type="button"
                class="boton-pictograma boton-sin-contenedor-secundario boton-chico"
                aria-label="Eliminar diapositiva"
                title="Eliminar diapositiva"
                @click="eliminarDiapositiva(diapositiva.id)"
              >
                <span class="pictograma-eliminar" aria-hidden="true" />
              </button>
            </div>

            <div class="modal-carrusel__campo">
              <LandingBuilderSelectorImagenCarrusel
                :imagen-url="diapositiva.imagenUrl"
                :imagen-tipo="diapositiva.imagenTipo"
                @seleccionar-imagen="(archivo) => manejarSeleccionImagen(diapositiva.id, archivo)"
                @seleccionar-enlace="(url) => manejarSeleccionEnlace(diapositiva.id, url)"
              />
            </div>

            <div class="modal-carrusel__campo">
              <label :for="`carrusel-texto-${diapositiva.id}`">Texto</label>
              <input
                :id="`carrusel-texto-${diapositiva.id}`"
                v-model="diapositiva.texto"
                type="text"
                placeholder="Texto de la diapositiva"
              />
            </div>

            <div class="modal-carrusel__campo">
              <div v-if="diapositiva.botonTexto" class="modal-carrusel__enlace-info">
                <span class="modal-carrusel__enlace-texto">{{ diapositiva.botonTexto }}</span>

                <div class="modal-carrusel__enlace-acciones">
                  <button
                    type="button"
                    class="btn-control-boton btn-editar-link"
                    title="Editar enlace"
                    @click="abrirModalEnlace(diapositiva.id)"
                  >
                    <span class="pictograma-editar" aria-hidden="true"></span>
                  </button>
                  <button
                    type="button"
                    class="btn-control-boton btn-eliminar-link"
                    title="Eliminar enlace"
                    @click="eliminarBoton(diapositiva)"
                  >
                    <span class="pictograma-eliminar" aria-hidden="true"></span>
                  </button>
                </div>
              </div>

              <button
                v-else
                type="button"
                class="modal-carrusel__boton-agregar-enlace"
                @click="abrirModalEnlace(diapositiva.id)"
              >
                <span class="pictograma-agregar m-r-1" aria-hidden="true"></span>
                <span>Agregar enlace</span>
              </button>
            </div>
          </li>
        </ul>

        <button
          type="button"
          class="boton-secundario boton-chico"
          :disabled="!puedeAgregarDiapositiva()"
          @click="agregarDiapositiva"
        >
          <span class="pictograma-agregar m-r-1" aria-hidden="true" />
          Agregar diapositiva
        </button>

        <p v-if="!puedeAgregarDiapositiva()" class="texto-color-secundario m-t-1">
          Alcanzaste el límite máximo de {{ LIMITE_DIAPOSITIVAS }} diapositivas.
        </p>
      </template>

      <template #pie>
        <div class="flex flex-vertical-centrado modal-carrusel__acciones">
          <button type="button" class="boton-secundario boton-chico" @click="cerrarModal">
            Cancelar
          </button>

          <button type="button" class="boton-primario boton-chico" @click="confirmarCarrusel">
            Agregar carrusel
          </button>
        </div>
      </template>
    </SisdaiModal>

    <!-- Modal exclusivo para configurar el enlace de la diapositiva -->
    <SisdaiModal ref="modalEnlace" class="modal-enlace-diapositiva">
      <template #encabezado>
        <div class="modal-enlace-diapositiva__encabezado">
          <h2 class="modal-enlace-diapositiva__titulo">Configurar enlace de la diapositiva</h2>
        </div>
      </template>
      <template #cuerpo>
        <div class="modal-enlace-diapositiva__cuerpo flex flex-column flex-gap-3">
          <div class="grupo-formulario">
            <label for="input-link-texto-diapositiva">
              Texto del enlace (ej: "Ver más", "Ir al sitio"):
            </label>
            <input
              id="input-link-texto-diapositiva"
              v-model="tempBotonTexto"
              type="text"
              placeholder="Escribe el texto que verá el usuario..."
              class="input-control"
            />
          </div>
          <div class="grupo-formulario">
            <label for="input-link-url-diapositiva">Dirección URL de destino:</label>
            <input
              id="input-link-url-diapositiva"
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
</template>

<style scoped lang="scss">
.modal-carrusel {
  :deep(.modal-contenedor) {
    width: min(720px, calc(100vw - 32px));
    max-width: 100%;
    max-height: calc(100dvh - 32px);
    box-sizing: border-box;
    overflow-x: hidden;
    overflow-y: auto;
  }

  &__encabezado {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  &__titulo {
    margin: 0;
    font-size: 1.125rem;
  }

  &__cerrar {
    display: inline-flex;
    width: 36px;
    height: 36px;
    flex: 0 0 36px;
    align-items: center;
    justify-content: center;
    padding: 8px;
    border: 0;
    border-radius: 4px;
    background: transparent;
    color: inherit;
    cursor: pointer;

    &:hover,
    &:focus-visible {
      background: rgb(255 255 255 / 10%);
    }

    &:focus-visible {
      outline: 2px solid currentcolor;
      outline-offset: 2px;
    }

    svg {
      width: 20px;
      height: 20px;
    }
  }

  &__encabezado-lista {
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 12px;
  }

  &__contador {
    flex-shrink: 0;
    padding: 2px 10px;
    border-radius: 999px;
    background: var(--fondo-acento);
    font-size: 0.8125rem;
    font-weight: 600;
    white-space: nowrap;
  }

  &__lista {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin: 0 0 16px;
    padding: 0;
    list-style: none;
  }

  &__item {
    padding: 16px;
  }

  &__item-encabezado {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    cursor: grab;

    &:active {
      cursor: grabbing;
    }
  }

  &__item-titulo {
    flex: 1;
    margin: 0;
    font-weight: 600;
  }

  &__campo {
    margin-bottom: 12px;
  }

  &__acciones {
    justify-content: flex-end;
    gap: 12px;
  }

  &__enlace-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 8px 10px;
    border: 1px solid var(--color-neutro-2, #e0e0e0);
    border-radius: 8px;
  }

  &__enlace-texto {
    overflow: hidden;
    font-size: 0.8125rem;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__enlace-acciones {
    display: flex;
    flex-shrink: 0;
    gap: 6px;
  }

  &__boton-agregar-enlace {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 8px 12px !important;
    border: 1px solid var(--formulario-borde, #bdbdbd) !important;
    border-radius: 8px !important;
    background: var(--formulario-fondo, #f5f5f5) !important;
    color: var(--formulario-texto-secundario, #757575) !important;
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
}

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

.modal-enlace-diapositiva {
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
