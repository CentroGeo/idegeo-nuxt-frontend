<script setup>
const modalCambiarPortada = ref(null);
const portadaEditor = ref(null);
const mostrarAcciones = ref(false);

const fondoActual = ref({
  tipo: 'video',
  url: '/inicio/Portada_SIGIC_1_1.mp4',
});

let urlTemporal;

const nombreArchivoDescarga = computed(() => {
  const urlSinParametros = fondoActual.value.url.split('?')[0];
  const nombreOriginal = urlSinParametros.split('/').pop();

  if (nombreOriginal?.includes('.')) {
    return nombreOriginal;
  }

  return fondoActual.value.tipo === 'video' ? 'portada-sigic.mp4' : 'portada-sigic.jpg';
});

function esDispositivoTactil() {
  return import.meta.client && window.matchMedia('(hover: none), (pointer: coarse)').matches;
}

function mostrarAccionesConPuntero(event) {
  if (event.pointerType === 'mouse') {
    mostrarAcciones.value = true;
  }
}

function ocultarAccionesConPuntero(event) {
  if (event.pointerType === 'mouse') {
    mostrarAcciones.value = false;
  }
}

function alternarAccionesPortada() {
  if (esDispositivoTactil()) {
    mostrarAcciones.value = !mostrarAcciones.value;
  }
}

function mostrarAccionesConTeclado() {
  mostrarAcciones.value = true;
}

function ocultarAccionesConTeclado(event) {
  const siguienteElemento = event.relatedTarget;

  if (!(siguienteElemento instanceof Node) || !portadaEditor.value?.contains(siguienteElemento)) {
    mostrarAcciones.value = false;
  }
}

function abrirModalCambiarPortada() {
  mostrarAcciones.value = false;

  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }

  modalCambiarPortada.value?.abrirModal();
}

function seleccionarArchivo(archivo) {
  if (urlTemporal) {
    URL.revokeObjectURL(urlTemporal);
  }

  urlTemporal = URL.createObjectURL(archivo);

  fondoActual.value = {
    tipo: 'imagen',
    url: urlTemporal,
  };
}

function seleccionarEnlace(enlace) {
  if (urlTemporal) {
    URL.revokeObjectURL(urlTemporal);
    urlTemporal = undefined;
  }

  fondoActual.value = {
    tipo: 'imagen',
    url: enlace,
  };
}

onBeforeUnmount(() => {
  if (urlTemporal) {
    URL.revokeObjectURL(urlTemporal);
  }
});
</script>

<template>
  <section
    ref="portadaEditor"
    class="portada-editor"
    :class="{ 'portada-editor--acciones-visibles': mostrarAcciones }"
    aria-labelledby="landing-builder-titulo"
    @pointerenter="mostrarAccionesConPuntero"
    @pointerleave="ocultarAccionesConPuntero"
    @click="alternarAccionesPortada"
    @focusin="mostrarAccionesConTeclado"
    @focusout="ocultarAccionesConTeclado"
  >
    <video
      v-if="fondoActual.tipo === 'video'"
      aria-hidden="true"
      role="presentation"
      class="portada-editor__media"
      autoplay
      loop
      muted
      playsinline
    >
      <source :src="fondoActual.url" type="video/mp4" />
    </video>

    <img v-else class="portada-editor__media" :src="fondoActual.url" alt="" />

    <div class="portada-editor__degradado">
      <div class="portada-editor__acciones">
        <button
          type="button"
          class="portada-editor__accion portada-editor__accion--texto"
          @click.stop="abrirModalCambiarPortada"
        >
          Cambiar
        </button>

        <a
          :href="fondoActual.url"
          :download="nombreArchivoDescarga"
          class="portada-editor__accion portada-editor__accion--icono"
          aria-label="Descargar fondo actual"
          title="Descargar fondo actual"
          @click.stop
        >
          <svg class="portada-editor__icono-descarga" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 3v12m0 0 4-4m-4 4-4-4M5 20h14"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </a>
      </div>

      <div class="portada-editor__contenido">
        <h1 id="landing-builder-titulo">Constructor de landing page</h1>

        <p>
          Personaliza los textos, el logotipo y la información principal que se mostrará en la
          página de inicio.
        </p>
      </div>
    </div>

    <LandingBuilderModalCambiarPortada
      ref="modalCambiarPortada"
      @seleccionar-archivo="seleccionarArchivo"
      @seleccionar-enlace="seleccionarEnlace"
    />
  </section>
</template>

<style scoped lang="scss">
.portada-editor {
  position: relative;
  min-height: clamp(320px, 52vh, 580px);
  overflow: hidden;

  &__media {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__degradado {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px 24px;
    background: linear-gradient(
      180deg,
      rgb(0 0 0 / 18%) 0%,
      rgb(0 0 0 / 38%) 55%,
      rgb(0 0 0 / 65%) 100%
    );
  }

  &__acciones {
    position: absolute;
    top: 24px;
    right: 24px;
    z-index: 2;
    display: flex;
    align-items: stretch;
    overflow: hidden;
    border: 1px solid rgb(255 255 255 / 18%);
    border-radius: 6px;
    opacity: 0;
    background: var(--color-primario-3, #9f2241);
    box-shadow: 0 4px 12px rgb(0 0 0 / 24%);
    pointer-events: none;
    transform: translateY(-6px);
    backdrop-filter: blur(6px);
    transition:
      opacity 0.2s ease,
      transform 0.2s ease;
  }

  &--acciones-visibles &__acciones {
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0);
  }

  &__icono-descarga {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }

  &__accion {
    display: inline-flex;
    min-height: 40px;
    align-items: center;
    justify-content: center;
    border: 0;
    background: transparent;
    color: white;
    font: inherit;
    text-decoration: none;
    cursor: pointer;
    transition:
      background-color 0.2s ease,
      color 0.2s ease;

    &:hover,
    &:focus-visible {
      background: rgb(0 0 0 / 14%);
      color: white;
    }

    &:focus-visible {
      outline: 2px solid white;
      outline-offset: -3px;
    }
  }

  &__accion + &__accion {
    border-left: 1px solid rgb(255 255 255 / 18%);
  }

  &__accion--texto {
    padding: 8px 14px;
  }

  &__accion--icono {
    width: 42px;
    padding: 8px;
  }

  &__contenido {
    width: min(820px, 100%);
    color: white;
    text-align: center;

    h1 {
      margin: 0 0 16px;
    }

    p {
      max-width: 680px;
      margin: 0 auto;
      font-size: 1.125rem;
    }
  }
}

@media (max-width: 767px) {
  .portada-editor {
    min-height: 420px;

    &__degradado {
      padding: 72px 20px 24px;
    }

    &__acciones {
      top: 12px;
      right: 12px;
    }

    &__accion {
      min-height: 36px;
    }

    &__accion--texto {
      padding: 6px 12px;
      font-size: 0.875rem;
    }

    &__accion--icono {
      width: 38px;
      padding: 6px;
    }

    &__contenido p {
      font-size: 1rem;
    }
  }
}
</style>
