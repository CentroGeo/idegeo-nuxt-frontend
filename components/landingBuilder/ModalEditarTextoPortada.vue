<script setup>
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';

const emit = defineEmits(['guardar-textos']);

const modalEditarTexto = ref(null);
const inputTitulo = ref(null);

const titulo = ref('');
const subtitulo = ref('');
const error = ref('');

const LIMITE_TITULO = 80;
const LIMITE_SUBTITULO = 180;

function abrirModal(valores = {}) {
  titulo.value = valores.titulo || '';
  subtitulo.value = valores.subtitulo || '';
  error.value = '';

  modalEditarTexto.value?.abrirModal();

  nextTick(() => {
    inputTitulo.value?.focus();
  });
}

function cerrarModal() {
  modalEditarTexto.value?.cerrarModal?.();
}

function guardarTextos() {
  const tituloLimpio = titulo.value.trim();
  const subtituloLimpio = subtitulo.value.trim();

  if (!tituloLimpio) {
    error.value = 'El título es obligatorio.';
    inputTitulo.value?.focus();
    return;
  }

  if (!subtituloLimpio) {
    error.value = 'El subtítulo es obligatorio.';
    return;
  }

  error.value = '';

  emit('guardar-textos', {
    titulo: tituloLimpio,
    subtitulo: subtituloLimpio,
  });

  cerrarModal();
}

defineExpose({
  abrirModal,
});
</script>

<template>
  <ClientOnly>
    <SisdaiModal ref="modalEditarTexto" class="modal-editar-texto">
      <template #encabezado>
        <div class="modal-editar-texto__encabezado">
          <div>
            <h2 class="modal-editar-texto__titulo">Editar contenido</h2>
            <p class="modal-editar-texto__descripcion">
              Cambia el título y el texto descriptivo de la portada.
            </p>
          </div>

          <button
            type="button"
            class="modal-editar-texto__cerrar"
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
        <form class="modal-editar-texto__formulario" @submit.prevent="guardarTextos">
          <div class="modal-editar-texto__campo">
            <div class="modal-editar-texto__etiqueta">
              <label for="portada-titulo">Título</label>

              <span aria-live="polite"> {{ titulo.length }}/{{ LIMITE_TITULO }} </span>
            </div>

            <input
              id="portada-titulo"
              ref="inputTitulo"
              v-model="titulo"
              type="text"
              :maxlength="LIMITE_TITULO"
              placeholder="Escribe el título principal"
              autocomplete="off"
            />
          </div>

          <div class="modal-editar-texto__campo">
            <div class="modal-editar-texto__etiqueta">
              <label for="portada-subtitulo">Subtítulo</label>

              <span aria-live="polite"> {{ subtitulo.length }}/{{ LIMITE_SUBTITULO }} </span>
            </div>

            <textarea
              id="portada-subtitulo"
              v-model="subtitulo"
              :maxlength="LIMITE_SUBTITULO"
              rows="4"
              placeholder="Escribe el texto descriptivo de la portada"
            />
          </div>

          <p v-if="error" class="texto-color-error modal-editar-texto__error" role="alert">
            {{ error }}
          </p>

          <div class="modal-editar-texto__acciones">
            <button type="button" class="boton-secundario boton-chico" @click="cerrarModal">
              Cancelar
            </button>

            <button type="submit" class="boton-primario boton-chico">Guardar cambios</button>
          </div>
        </form>
      </template>
    </SisdaiModal>
  </ClientOnly>
</template>

<style scoped lang="scss">
.modal-editar-texto {
  :deep(.modal-contenedor) {
    width: min(620px, calc(100vw - 32px));
    max-width: 100%;
    max-height: calc(100dvh - 32px);
    box-sizing: border-box;
    overflow-x: hidden;
    overflow-y: auto;
  }

  :deep(.modal-cabecera),
  :deep(.modal-cuerpo) {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    box-sizing: border-box;
  }

  &__encabezado {
    display: flex;
    width: 100%;
    min-width: 0;
    align-items: flex-start;
    justify-content: space-between;
    gap: 24px;
  }

  &__titulo {
    margin: 0;
    font-size: 1.25rem;
    line-height: 1.3;
  }

  &__descripcion {
    margin: 6px 0 0;
    color: var(--texto-secundario);
    font-size: 0.9375rem;
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

  &__formulario {
    display: flex;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    flex-direction: column;
    gap: 24px;
  }

  &__campo {
    display: flex;
    width: 100%;
    min-width: 0;
    flex-direction: column;
    gap: 8px;

    input,
    textarea {
      width: 100%;
      max-width: 100%;
      min-width: 0;
      box-sizing: border-box;
    }

    textarea {
      min-height: 120px;
      resize: vertical;
    }
  }

  &__etiqueta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;

    label {
      font-weight: 600;
    }

    span {
      color: var(--texto-secundario);
      font-size: 0.8125rem;
      white-space: nowrap;
    }
  }

  &__error {
    margin: 0;
    overflow-wrap: anywhere;
  }

  &__acciones {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
    padding-top: 8px;
  }
}

@media (max-width: 767px) {
  .modal-editar-texto {
    :deep(.modal-contenedor) {
      width: calc(100vw - 24px);
      max-height: calc(100dvh - 24px);
    }

    &__encabezado {
      gap: 12px;
    }

    &__titulo {
      font-size: 1.0625rem;
    }

    &__descripcion {
      font-size: 0.875rem;
    }

    &__acciones {
      align-items: stretch;
      flex-direction: column-reverse;

      button {
        width: 100%;
      }
    }
  }
}
</style>
