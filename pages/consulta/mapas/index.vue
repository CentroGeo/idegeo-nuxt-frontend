<script setup>
const mapasStore = useMapasStore();
const route = useRoute();
const router = useRouter();

const seleccionado = ref(null);
const cargandoLista = ref(false);

async function cargarLista() {
  cargandoLista.value = true;
  await mapasStore.cargarMapas({ page: 1, page_size: 50 });
  cargandoLista.value = false;
}

async function seleccionar(id) {
  if (seleccionado.value === id) return;
  seleccionado.value = id;
  router.replace({ query: { ...route.query, mapa: String(id) } });
  await mapasStore.cargarMapa(id);
}

function deseleccionar() {
  seleccionado.value = null;
  mapasStore.limpiarMapa();
  const { mapa: _omitido, ...resto } = route.query;
  void _omitido;
  router.replace({ query: resto });
}

onMounted(async () => {
  await cargarLista();
  const idQuery = Number(route.query.mapa);
  if (Number.isFinite(idQuery) && idQuery > 0) {
    await seleccionar(idQuery);
  }
});

onUnmounted(() => {
  mapasStore.limpiarMapa();
});
</script>

<template>
  <ConsultaLayoutPaneles>
    <template #catalogo>
      <div class="explorador-mapas">
        <header class="encabezado p-3">
          <h3 class="m-0">Mapas</h3>
          <UiNumeroElementos :numero="mapasStore.maps.length" :etiqueta="'Mapas'" />
        </header>

        <p v-if="cargandoLista" class="texto-secundario p-3 m-0">Cargando…</p>

        <ul v-else-if="mapasStore.maps.length" class="lista">
          <li
            v-for="m in mapasStore.maps"
            :key="m.id"
            class="item p-2"
            :class="{ activo: seleccionado === m.id }"
            @click="seleccionar(m.id)"
          >
            <div class="item-titulo">{{ m.name }}</div>
            <div class="item-meta texto-secundario">
              <span>{{ m.owner?.username || 'Anónimo' }}</span>
              <span v-if="m.is_public === false" class="chip-privado">
                <i class="fa-solid fa-lock" aria-hidden="true"></i> Privado
              </span>
            </div>
          </li>
        </ul>

        <p v-else class="texto-secundario p-3 m-0">No hay mapas disponibles.</p>
      </div>
    </template>

    <template #visualizador>
      <div v-if="!seleccionado || !mapasStore.activeMap" class="contenedor">
        <ConsultaTarjetaSinSeleccion />
      </div>
      <div v-else :key="mapasStore.activeMap.map_type" class="contenedor-visor">
        <header class="visor-encabezado flex flex-contenido-separado p-x-2 p-y-1">
          <div>
            <strong>{{ mapasStore.activeMap.name }}</strong>
            <span class="texto-secundario"> · {{ mapasStore.activeMap.map_type }}</span>
          </div>
          <div class="flex">
            <NuxtLink
              :to="`/consulta/mapas/${mapasStore.activeMap.id}/visualizar`"
              class="boton-secundario boton-chico"
              target="_blank"
            >
              <i class="fa-solid fa-eye" aria-hidden="true"></i> Visualizar
            </NuxtLink>
            <button class="boton-secundario boton-chico" type="button" @click="deseleccionar">
              Cerrar
            </button>
          </div>
        </header>

        <MapasVisorMapa
          v-if="mapasStore.activeMap.map_type === 'regular'"
          :mapa="mapasStore.activeMap"
          :capas="mapasStore.activeLayers"
        />
        <MapasVisorSwipe
          v-else-if="mapasStore.activeMap.map_type === 'swipe'"
          :mapa="mapasStore.activeMap"
          :capas="mapasStore.activeLayers"
        />
        <MapasVisorDual
          v-else-if="mapasStore.activeMap.map_type === 'dual'"
          :mapa="mapasStore.activeMap"
          :capas="mapasStore.activeLayers"
        />
      </div>
    </template>

    <template #seleccion>
      <div v-if="!seleccionado || !mapasStore.activeMap" class="p-3">
        <p class="texto-secundario">Seleccioná un mapa para ver sus capas.</p>
      </div>
      <MapasPanelCapas v-else :capas="mapasStore.activeLayers" :editable="false" />
    </template>
  </ConsultaLayoutPaneles>
</template>

<style lang="scss" scoped>
.explorador-mapas {
  height: 100%;
  overflow-y: auto;
}

.encabezado {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-neutro-1);
}

.lista {
  list-style: none;
  margin: 0;
  padding: 0;
}

.item {
  cursor: pointer;
  border-bottom: 1px solid var(--color-neutro-1);
  transition: background-color 0.15s ease;

  &:hover {
    background-color: var(--fondo-acento);
  }

  &.activo {
    background-color: var(--color-secundario-2);
  }
}

.item-titulo {
  font-weight: 600;
}

.item-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 0.85rem;
  margin-top: 2px;
}

.chip-privado {
  background-color: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 0 6px;
  border-radius: 8px;
  font-size: 0.7rem;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.contenedor-visor {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.visor-encabezado {
  align-items: center;
  border-bottom: 1px solid var(--color-neutro-1);
}

.contenedor-visor :deep(.visor-mapa) {
  --altura-visor: calc(100% - 48px) !important;
  flex: 1;
  height: auto !important;
}

.flex {
  gap: 8px;
}
</style>
