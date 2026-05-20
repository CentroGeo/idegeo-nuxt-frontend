<script setup>
const mapasStore = useMapasStore();
const { data: session } = useAuth();
const isLoggedIn = computed(() => !!session.value);

const paginaActual = ref(0);

async function cargar(pagina) {
  await mapasStore.cargarMapas({ page: pagina + 1 });
}

const totalPags = computed(() =>
  Math.max(1, Math.ceil(mapasStore.pagination.total / mapasStore.pagination.page_size))
);

watch(paginaActual, (p) => cargar(p));

onMounted(() => cargar(paginaActual.value));
</script>

<template>
  <main class="pagina-mapas p-3">
    <div class="encabezado flex flex-contenido-separado">
      <h1 class="m-0">Mapas</h1>
      <NuxtLink v-if="isLoggedIn" to="/mapas/crear" class="boton-primario">
        <span class="pictograma-mas" aria-hidden="true" /> Crear mapa
      </NuxtLink>
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
  </main>
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
