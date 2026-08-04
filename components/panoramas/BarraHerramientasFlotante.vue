<script setup>
const props = defineProps({
  topicosCapas: {
    type: Array,
    default: () => [],
  },
  topicosTexto: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['seleccionar-herramienta', 'seleccionar-topico']);

const barraAbierta = ref(false);
const seccionAbierta = ref(null);

const herramientas = [
  {
    id: 'wms',
    nombre: 'WMS',
    descripcion: 'Servicios WMS externos',
    icono: 'pictograma-enlace-externo',
  },
  {
    id: 'capas',
    nombre: 'Temáticas de capas',
    descripcion: 'Capas disponibles en el panorama',
    icono: 'pictograma-capas',
  },
  {
    id: 'texto',
    nombre: 'Temáticas de texto',
    descripcion: 'Contenidos informativos',
    icono: 'pictograma-vista-simplificada',
  },
  {
    id: 'informacion',
    nombre: 'Información',
    descripcion: 'Información general del panorama',
    icono: 'pictograma-informacion',
  },
];

const topicosCapasOrdenados = computed(() =>
  [...props.topicosCapas].sort((a, b) => a.stack_order - b.stack_order)
);

const topicosTextoOrdenados = computed(() =>
  [...props.topicosTexto].sort((a, b) => a.stack_order - b.stack_order)
);

function alternarBarra() {
  barraAbierta.value = !barraAbierta.value;

  if (!barraAbierta.value) {
    seccionAbierta.value = null;
  }
}

function seleccionarHerramienta(herramientaId) {
  if (herramientaId === 'capas' || herramientaId === 'texto') {
    seccionAbierta.value = seccionAbierta.value === herramientaId ? null : herramientaId;

    return;
  }

  emit('seleccionar-herramienta', herramientaId);
  barraAbierta.value = false;
  seccionAbierta.value = null;
}

function seleccionarTopico(tipo, topicoId) {
  emit('seleccionar-topico', {
    tipo,
    id: topicoId,
  });

  barraAbierta.value = false;
  seccionAbierta.value = null;
}
</script>

<template>
  <div class="barra-herramientas" :class="{ 'barra-herramientas--abierta': barraAbierta }">
    <button
      type="button"
      class="barra-herramientas__activador boton-pictograma boton-primario"
      :aria-expanded="barraAbierta"
      aria-controls="herramientas-panorama"
      :aria-label="barraAbierta ? 'Cerrar herramientas' : 'Abrir herramientas'"
      :title="barraAbierta ? 'Cerrar herramientas' : 'Abrir herramientas'"
      @click="alternarBarra"
    >
      <span :class="barraAbierta ? 'pictograma-cerrar' : 'pictograma-menu'" aria-hidden="true" />
    </button>

    <Transition name="barra-herramientas">
      <nav
        v-if="barraAbierta"
        id="herramientas-panorama"
        class="barra-herramientas__menu"
        aria-label="Herramientas del panorama"
      >
        <div
          v-for="herramienta in herramientas"
          :key="herramienta.id"
          class="barra-herramientas__grupo"
        >
          <button
            type="button"
            class="barra-herramientas__opcion"
            :aria-label="herramienta.nombre"
            :title="herramienta.descripcion"
            :aria-expanded="
              herramienta.id === 'capas' || herramienta.id === 'texto'
                ? seccionAbierta === herramienta.id
                : undefined
            "
            @click="seleccionarHerramienta(herramienta.id)"
          >
            <span :class="herramienta.icono" class="barra-herramientas__icono" aria-hidden="true" />

            <span class="barra-herramientas__nombre">
              {{ herramienta.nombre }}
            </span>

            <span
              v-if="herramienta.id === 'capas' || herramienta.id === 'texto'"
              :class="seccionAbierta === herramienta.id ? 'pictograma-arriba' : 'pictograma-abajo'"
              class="barra-herramientas__flecha"
              aria-hidden="true"
            />
          </button>

          <div
            v-if="herramienta.id === 'capas' && seccionAbierta === 'capas'"
            class="barra-herramientas__subopciones"
          >
            <p v-if="topicosCapasOrdenados.length === 0" class="barra-herramientas__vacio">
              No hay temáticas de capas.
            </p>

            <button
              v-for="topico in topicosCapasOrdenados"
              v-else
              :key="`capas-${topico.id}`"
              type="button"
              class="barra-herramientas__subopcion"
              @click="seleccionarTopico('capas', topico.id)"
            >
              <img
                v-if="topico.custom_icon"
                :src="topico.custom_icon"
                alt=""
                class="barra-herramientas__topico-icono"
              />
              <span
                v-else
                :class="`pictograma-${topico.icon}`"
                class="barra-herramientas__topico-icono"
                aria-hidden="true"
              />
              <span>{{ topico.name }}</span>
            </button>
          </div>

          <div
            v-if="herramienta.id === 'texto' && seccionAbierta === 'texto'"
            class="barra-herramientas__subopciones"
          >
            <p v-if="topicosTextoOrdenados.length === 0" class="barra-herramientas__vacio">
              No hay temáticas de texto.
            </p>

            <button
              v-for="topico in topicosTextoOrdenados"
              v-else
              :key="`texto-${topico.id}`"
              type="button"
              class="barra-herramientas__subopcion"
              @click="seleccionarTopico('texto', topico.id)"
            >
              <img
                v-if="topico.custom_icon"
                :src="topico.custom_icon"
                alt=""
                class="barra-herramientas__topico-icono"
              />
              <span
                v-else
                :class="`pictograma-${topico.icon}`"
                class="barra-herramientas__topico-icono"
                aria-hidden="true"
              />
              <span>{{ topico.name }}</span>
            </button>
          </div>
        </div>
      </nav>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
.barra-herramientas {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 10;
  display: flex;
  align-items: flex-start;
  gap: 8px;

  &__activador {
    flex-shrink: 0;
    margin: 0;
    box-shadow: 0 4px 12px rgb(0 0 0 / 25%);
  }

  &__menu {
    display: flex;
    flex-direction: column;
    width: min(280px, calc(100vw - 96px));
    max-height: calc(100vh - 100px);
    padding: 8px;
    gap: 4px;
    overflow-y: auto;
    background-color: var(--fondo);
    border: 1px solid var(--color-secundario-4);
    border-radius: 10px;
    box-shadow: 0 6px 18px rgb(0 0 0 / 22%);
  }

  &__grupo {
    width: 100%;
  }

  &__opcion,
  &__subopcion {
    display: flex;
    align-items: center;
    width: 100%;
    color: var(--texto);
    text-align: left;
    background-color: transparent;
    border: none;
    cursor: pointer;

    &:hover,
    &:focus-visible {
      background-color: var(--color-secundario-5);
    }

    &:focus-visible {
      outline: 2px solid var(--color-primario-1);
      outline-offset: 2px;
    }
  }

  &__opcion {
    min-height: 48px;
    padding: 8px 12px;
    gap: 10px;
    border-radius: 8px;
  }

  &__icono {
    flex-shrink: 0;
    font-size: 1.4rem;
    color: var(--color-primario-1);
  }

  &__nombre {
    flex: 1;
    font-size: 0.85rem;
    line-height: 1.25;
  }

  &__flecha {
    flex-shrink: 0;
    font-size: 1rem;
  }

  &__subopciones {
    margin: 2px 0 6px 20px;
    padding-left: 10px;
    border-left: 2px solid var(--color-secundario-4);
  }

  &__subopcion {
    min-height: 40px;
    padding: 6px 10px;
    gap: 8px;
    font-size: 0.8rem;
    border-radius: 6px;
  }

  &__topico-icono {
    width: 22px;
    height: 22px;
    flex-shrink: 0;
    object-fit: contain;
    font-size: 1.2rem;
    color: var(--color-primario-1);
  }

  &__vacio {
    margin: 0;
    padding: 8px 10px;
    font-size: 0.75rem;
    color: var(--texto-secundario);
  }
}

.barra-herramientas-enter-active,
.barra-herramientas-leave-active {
  transition:
    opacity 160ms ease,
    transform 160ms ease;
}

.barra-herramientas-enter-from,
.barra-herramientas-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}

@media (max-width: 600px) {
  .barra-herramientas {
    top: 8px;
    left: 8px;

    &__menu {
      width: min(260px, calc(100vw - 72px));
      max-height: calc(100vh - 72px);
    }

    &__nombre {
      font-size: 0.8rem;
    }
  }
}
</style>
