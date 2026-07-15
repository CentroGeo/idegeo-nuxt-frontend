<script setup>
const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
const TAMANO_MAXIMO_BYTES = 5 * 1024 * 1024;

defineProps({
  imagenUrl: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(['seleccionar-imagen', 'quitar-imagen']);

const inputArchivo = ref(null);
const arrastrandoArchivo = ref(false);
const error = ref('');

function abrirSelectorArchivos() {
  inputArchivo.value?.click();
}

function activarArrastre() {
  arrastrandoArchivo.value = true;
}

function desactivarArrastre() {
  arrastrandoArchivo.value = false;
}

function procesarArchivo(archivo) {
  if (!archivo) return;

  if (!TIPOS_PERMITIDOS.includes(archivo.type)) {
    error.value = 'Selecciona una imagen JPG, PNG, WEBP o SVG.';
    return;
  }

  if (archivo.size > TAMANO_MAXIMO_BYTES) {
    error.value = 'La imagen no puede pesar más de 5 MB.';
    return;
  }

  error.value = '';
  emit('seleccionar-imagen', archivo);
}

function seleccionarArchivo(event) {
  procesarArchivo(event.target.files?.[0]);

  if (event.target) {
    event.target.value = '';
  }
}

function soltarArchivo(event) {
  arrastrandoArchivo.value = false;
  procesarArchivo(event.dataTransfer?.files?.[0]);
}
</script>

<template>
  <div class="selector-imagen-carrusel">
    <div v-if="imagenUrl" class="selector-imagen-carrusel__previsualizacion">
      <img :src="imagenUrl" alt="Imagen de la diapositiva" />

      <button
        type="button"
        class="selector-imagen-carrusel__quitar"
        aria-label="Quitar imagen"
        title="Quitar imagen"
        @click="emit('quitar-imagen')"
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

    <div
      v-else
      class="selector-imagen-carrusel__zona"
      :class="{ 'selector-imagen-carrusel__zona--activa': arrastrandoArchivo }"
      role="button"
      tabindex="0"
      aria-label="Arrastra o selecciona una imagen para la diapositiva"
      @click="abrirSelectorArchivos"
      @keydown.enter.prevent="abrirSelectorArchivos"
      @keydown.space.prevent="abrirSelectorArchivos"
      @dragenter.prevent="activarArrastre"
      @dragover.prevent="activarArrastre"
      @dragleave.prevent="desactivarArrastre"
      @drop.prevent="soltarArchivo"
    >
      <input
        ref="inputArchivo"
        class="selector-imagen-carrusel__input"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml"
        @change="seleccionarArchivo"
      />

      <span class="pictograma-archivo-subir pictograma-mediano" aria-hidden="true" />
      <p class="selector-imagen-carrusel__indicacion">Arrastra o elige una imagen</p>
    </div>

    <p v-if="error" class="texto-color-error">{{ error }}</p>
  </div>
</template>

<style scoped lang="scss">
.selector-imagen-carrusel {
  &__previsualizacion {
    position: relative;
    overflow: hidden;
    border-radius: 10px;

    img {
      display: block;
      width: 100%;
      height: 140px;
      object-fit: cover;
    }
  }

  &__quitar {
    position: absolute;
    top: 8px;
    right: 8px;
    display: inline-flex;
    width: 28px;
    height: 28px;
    align-items: center;
    justify-content: center;
    border: 0;
    border-radius: 50%;
    background: rgb(0 0 0 / 55%);
    color: white;
    cursor: pointer;

    &:hover,
    &:focus-visible {
      background: rgb(0 0 0 / 75%);
    }

    &:focus-visible {
      outline: 2px solid white;
      outline-offset: 2px;
    }

    svg {
      width: 16px;
      height: 16px;
    }
  }

  &__zona {
    display: flex;
    min-height: 140px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 16px;
    border: 1px dashed rgb(255 255 255 / 40%);
    border-radius: 10px;
    background: rgb(255 255 255 / 4%);
    text-align: center;
    cursor: pointer;
    transition:
      background-color 0.2s ease,
      border-color 0.2s ease;

    &:hover,
    &:focus-visible,
    &--activa {
      border-color: rgb(255 255 255 / 75%);
      background: rgb(255 255 255 / 8%);
    }

    &:focus-visible {
      outline: 2px solid white;
      outline-offset: 3px;
    }
  }

  &__input {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    white-space: nowrap;
  }

  &__indicacion {
    margin: 8px 0 0;
    color: var(--texto-secundario);
    font-size: 0.875rem;
  }
}
</style>
