<script setup>
const route = useRoute();
const mapasStore = useMapasStore();
const { data: session } = useAuth();
const { esAdmin, cargarEsAdmin } = useEsAdmin();

const mapaId = computed(() => Number(route.params.id));

const esOwner = computed(() => {
  const ownerUsername = mapasStore.activeMap?.owner?.username;
  const sessionEmail = session.value?.user?.email;
  const sessionName = session.value?.user?.name;
  if (!ownerUsername || !session.value) return false;
  return ownerUsername === sessionEmail || ownerUsername === sessionName;
});

// Un mapa público solo es editable por su dueño o por un administrador.
const puedeEditar = computed(() => esAdmin.value || esOwner.value);

const modalCompartir = ref(null);
function abrirCompartir() {
  modalCompartir.value?.abrir();
}

function abrirAgregarCapas() {
  mapasStore.abrirModalAgregarCapas();
}

onMounted(async () => {
  await Promise.all([mapasStore.cargarMapa(mapaId.value), cargarEsAdmin()]);
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
      <NuxtLink to="/geocontenidos/mapas" class="boton-secundario">Volver al listado</NuxtLink>
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
          <NuxtLink
            :to="`/geocontenidos/mapas/${mapaId}/visualizar`"
            class="boton-secundario"
            target="_blank"
          >
            <i class="fa-solid fa-eye" aria-hidden="true"></i> Visualizar
          </NuxtLink>
          <button class="boton-secundario" type="button" @click="abrirCompartir">
            <i class="fa-solid fa-share-nodes" aria-hidden="true"></i> Compartir
          </button>
          <button
            v-if="puedeEditar"
            class="boton-primario"
            type="button"
            @click="abrirAgregarCapas"
          >
            <span class="pictograma-mas" aria-hidden="true" /> Agregar capas
          </button>
          <NuxtLink
            v-if="puedeEditar"
            :to="`/geocontenidos/mapas/${mapaId}/editar`"
            class="boton-secundario"
          >
            <span class="pictograma-editar" aria-hidden="true" /> Editar
          </NuxtLink>
          <NuxtLink to="/geocontenidos/mapas" class="boton-secundario">Volver</NuxtLink>
        </div>
      </header>

      <div class="contenido-visor flex">
        <div :key="mapasStore.activeMap.map_type" class="contenedor-mapa">
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

      <MapasModalCompartir ref="modalCompartir" :mapa="mapasStore.activeMap" />
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
  height: calc(100vh - 17rem);
}

.contenedor-mapa {
  flex: 1;
  min-width: 0;
}

.flex {
  gap: 8px;
}
</style>
