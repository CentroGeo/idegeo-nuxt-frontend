<script setup>
const mapasStore = useMapasStore();
const storeCatalogo = useCatalogoStore();
const { data: session } = useAuth();

const isLoggedIn = computed(() => !!session.value);
const paginaActual = ref(0);
const modalCrear = ref(null);

async function cargar(pagina) {
  await mapasStore.cargarMapas({ page: pagina + 1 });
}

const totalPags = computed(() =>
  Math.max(1, Math.ceil(mapasStore.pagination.total / mapasStore.pagination.page_size))
);

function alCrearMapa(mapa) {
  navigateTo(`/consulta/mapas/${mapa.id}/editar`);
}

watch(paginaActual, (p) => cargar(p));

onMounted(() => cargar(paginaActual.value));
</script>

<template>
  <UiLayoutPaneles :estado-colapable="storeCatalogo.catalogoColapsado">
    <template #catalogo>
      <CatalogoListaMenuLateral />
    </template>

    <template #visualizador>
      <main id="principal" class="contenedor m-b-10 m-t-3 p-3">
        <div class="encabezado flex flex-contenido-separado">
          <div class="flex">
            <h2 class="m-0">Mapas</h2>
            <UiNumeroElementos :numero="mapasStore.pagination.total ?? 0" />
          </div>
          <button
            v-if="isLoggedIn"
            class="boton-primario"
            type="button"
            @click="modalCrear?.abrir()"
          >
            <span class="pictograma-mas" aria-hidden="true" /> Crear mapa
          </button>
        </div>

        <p v-if="mapasStore.isLoading" class="m-y-3">Cargando…</p>

        <div v-else-if="!mapasStore.maps.length" class="m-y-3">
          <p class="texto-secundario">No hay mapas disponibles.</p>
        </div>

        <div v-else class="grid-mapas m-y-3">
          <MapasTarjetaMapa v-for="m in mapasStore.maps" :key="m.id" :mapa="m" />
        </div>

        <ClientOnly>
          <UiPaginador
            v-if="mapasStore.maps.length"
            :pagina-parent="paginaActual"
            :total-paginas="totalPags"
            @cambio="paginaActual = $event"
          />
        </ClientOnly>

        <MapasModalCrearMapa ref="modalCrear" @creado="alCrearMapa" />
      </main>
    </template>
  </UiLayoutPaneles>
</template>

<style lang="scss" scoped>
.encabezado {
  align-items: center;
  margin-bottom: 16px;
}

.grid-mapas {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}
</style>
