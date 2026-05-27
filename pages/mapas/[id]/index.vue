<script setup>
const route = useRoute();
const mapasStore = useMapasStore();
const { data: session } = useAuth();

const mapaId = computed(() => Number(route.params.id));

const esOwner = computed(() => {
  const ownerUsername = mapasStore.activeMap?.owner?.username;
  const sessionEmail = session.value?.user?.email;
  const sessionName = session.value?.user?.name;
  if (!ownerUsername || !session.value) return false;
  return ownerUsername === sessionEmail || ownerUsername === sessionName;
});

onMounted(async () => {
  await mapasStore.cargarMapa(mapaId.value);
});

onUnmounted(() => {
  mapasStore.limpiarMapa();
});
</script>

<template>
  <div class="visor-pagina">
    <p v-if="mapasStore.isLoadingMap" class="m-3">Cargando mapa…</p>

    <div v-else-if="!mapasStore.activeMap" class="m-3">
      <p>No se encontró el mapa solicitado.</p>
      <NuxtLink to="/mapas" class="boton-secundario">Volver al listado</NuxtLink>
    </div>

    <template v-else>
      <header class="encabezado-mapa flex flex-contenido-separado p-x-3 p-y-2">
        <div>
          <h1 class="m-0">{{ mapasStore.activeMap.name }}</h1>
          <p class="texto-secundario m-0">
            Por {{ mapasStore.activeMap.owner?.username || 'Anónimo' }} · Tipo:
            {{ mapasStore.activeMap.map_type }}
          </p>
        </div>
        <div class="flex">
          <NuxtLink v-if="esOwner" :to="`/mapas/${mapaId}/editar`" class="boton-secundario">
            <span class="pictograma-editar" aria-hidden="true" /> Editar
          </NuxtLink>
          <NuxtLink to="/mapas" class="boton-secundario">Volver</NuxtLink>
        </div>
      </header>

      <div class="contenido-visor flex">
        <div class="contenedor-mapa">
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

        <MapasPanelCapas :capas="mapasStore.activeLayers" :editable="false" />
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
a {
  display: inline-flex !important;
  padding: 16px 24px !important;
  align-items: center !important;
}
.encabezado-mapa {
  align-items: center;
  border-bottom: 1px solid var(--color-neutro-1);
}

.contenido-visor {
  gap: 0;
  height: calc(100vh - 200px);
}

.contenedor-mapa {
  flex: 1;
  min-width: 0;
}

.flex {
  gap: 8px;
}
</style>
