<script setup>
import SisdaiCampoBusqueda from '@centrogeomx/sisdai-componentes/src/componentes/campo-busqueda/SisdaiCampoBusqueda.vue';
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';

const props = defineProps({
  mapaId: {
    type: Number,
    required: true,
  },
  mapType: {
    type: String,
    default: 'regular',
  },
});

const emit = defineEmits(['agregadas']);

const config = useRuntimeConfig();
const mapasStore = useMapasStore();
const modal = ref(null);

const busqueda = ref('');
const datasets = ref([]);
const seleccionados = ref(new Map());
const cargando = ref(false);
const guardando = ref(false);
const error = ref('');
const posicionPorDefecto = ref('left');
const tieneLados = computed(() => props.mapType === 'swipe' || props.mapType === 'dual');

let busquedaTimer = null;

async function buscar() {
  cargando.value = true;
  error.value = '';
  const params = new URLSearchParams({
    page_size: '20',
    'filter{subtype.in}': 'vector,raster',
  });
  if (busqueda.value.trim()) params.append('search', busqueda.value.trim());

  try {
    const res = await fetch(`${config.public.geonodeApi}/datasets/?${params.toString()}`);
    if (!res.ok) throw new Error('error');
    const data = await res.json();
    datasets.value = data.datasets || data.results || [];
  } catch (e) {
    error.value = `No se pudo cargar el catálogo de datasets: ${e}`;
    datasets.value = [];
  } finally {
    cargando.value = false;
  }
}

watch(busqueda, () => {
  clearTimeout(busquedaTimer);
  busquedaTimer = setTimeout(buscar, 300);
});

function alternarSeleccion(ds) {
  const map = seleccionados.value;
  if (map.has(ds.pk)) {
    map.delete(ds.pk);
  } else {
    map.set(ds.pk, {
      geonode_id: ds.pk,
      visible: true,
      opacity: 1.0,
      map_position: tieneLados.value ? posicionPorDefecto.value : 'left',
    });
  }
  seleccionados.value = new Map(map);
}

function abrir() {
  busqueda.value = '';
  datasets.value = [];
  seleccionados.value = new Map();
  error.value = '';
  posicionPorDefecto.value = 'left';
  modal.value?.abrirModal();
  buscar();
}

function cerrar() {
  modal.value?.cerrarModal();
}

async function guardar() {
  if (!seleccionados.value.size) {
    error.value = 'Selecciona al menos una capa.';
    return;
  }
  guardando.value = true;
  error.value = '';
  const payload = Array.from(seleccionados.value.values()).map((s) => ({
    ...s,
    map_position: tieneLados.value ? posicionPorDefecto.value : s.map_position,
  }));
  const data = await mapasStore.agregarCapas(props.mapaId, payload);
  guardando.value = false;
  if (!data) {
    error.value = 'No se pudieron agregar las capas.';
    return;
  }
  emit('agregadas', data);
  cerrar();
}

defineExpose({ abrir, cerrar });
</script>

<template>
  <ClientOnly>
    <SisdaiModal ref="modal">
      <template #encabezado>
        <h1 class="m-0">Agregar capas</h1>
      </template>

      <template #cuerpo>
        <SisdaiCampoBusqueda
          v-model="busqueda"
          etiqueta="Buscar dataset"
          ejemplo="Nombre, palabra clave…"
        />

        <div v-if="tieneLados" class="m-t-2">
          <SisdaiSelector v-model="posicionPorDefecto" etiqueta="Asignar al panel">
            <option value="left">Izquierdo</option>
            <option value="right">Derecho</option>
          </SisdaiSelector>
        </div>

        <p v-if="cargando" class="m-y-2">Buscando…</p>
        <p v-if="error" class="m-y-2 texto-error">{{ error }}</p>

        <ul v-if="datasets.length" class="lista-datasets m-t-2">
          <li
            v-for="ds in datasets"
            :key="ds.pk"
            class="dataset-item p-1"
            :class="{ seleccionado: seleccionados.has(ds.pk) }"
          >
            <label class="flex">
              <input
                type="checkbox"
                :checked="seleccionados.has(ds.pk)"
                @change="alternarSeleccion(ds)"
              />
              <div class="dataset-info">
                <strong>{{ ds.title || ds.alternate }}</strong>
                <div class="texto-secundario">
                  <span class="etiqueta">{{ ds.subtype }}</span>
                  <span class="m-l-1">{{ ds.alternate }}</span>
                </div>
              </div>
            </label>
          </li>
        </ul>

        <p v-else-if="!cargando" class="m-y-2 texto-secundario">
          {{ busqueda ? 'Sin resultados.' : 'Escribe para buscar capas.' }}
        </p>
      </template>

      <template #pie>
        <div class="flex flex-contenido-separado">
          <span class="texto-secundario">{{ seleccionados.size }} seleccionadas</span>
          <div class="flex flex-contenido-final">
            <button class="boton-secundario" type="button" @click="cerrar">Cancelar</button>
            <button
              class="boton-primario"
              type="button"
              :disabled="guardando || !seleccionados.size"
              @click="guardar"
            >
              {{ guardando ? 'Agregando…' : `Agregar (${seleccionados.size})` }}
            </button>
          </div>
        </div>
      </template>
    </SisdaiModal>
  </ClientOnly>
</template>

<style lang="scss" scoped>
.lista-datasets {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 50vh;
  overflow-y: auto;
}

.dataset-item {
  border: 1px solid var(--color-neutro-1);
  border-radius: 8px;
  margin-bottom: 6px;

  &.seleccionado {
    border-color: var(--color-primario-4);
    background-color: var(--fondo-acento);
  }

  label {
    cursor: pointer;
    align-items: flex-start;
  }
}

.dataset-info {
  flex: 1;
  min-width: 0;
}

.etiqueta {
  background-color: var(--color-secundario-2);
  color: var(--color-primario-4);
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 0.75rem;
}

.texto-error {
  color: var(--color-error, #c0392b);
}

.flex {
  gap: 8px;
}
</style>
