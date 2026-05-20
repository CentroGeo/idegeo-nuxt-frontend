<script setup>
definePageMeta({
  middleware: 'auth',
});

const route = useRoute();
const mapasStore = useMapasStore();
const { data: session } = useAuth();

const mapaId = computed(() => Number(route.params.id));

const modalEditar = ref(null);
const modalAgregarCapas = ref(null);

const esOwner = computed(
  () =>
    !!session.value &&
    mapasStore.activeMap?.owner?.username &&
    mapasStore.activeMap.owner.username === session.value.user?.name
);

async function alternarVisible({ id, visible }) {
  await mapasStore.actualizarCapa(id, { visible });
}

async function cambiarOpacidad({ id, opacity }) {
  await mapasStore.actualizarCapa(id, { opacity });
}

async function reordenar(orden) {
  await mapasStore.reordenarCapas(orden);
}

async function eliminarCapa(id) {
  await mapasStore.eliminarCapa(id);
}

function abrirAgregarCapas() {
  modalAgregarCapas.value?.abrir();
}

function abrirEditar() {
  modalEditar.value?.abrir();
}

async function eliminarMapa() {
  if (!confirm('¿Eliminar este mapa? Esta acción no se puede deshacer.')) return;
  const ok = await mapasStore.eliminarMapa(mapaId.value);
  if (ok) navigateTo('/mapas');
}

onMounted(async () => {
  await mapasStore.cargarMapa(mapaId.value);
});

onUnmounted(() => {
  mapasStore.limpiarMapa();
});
</script>

<template>
  <div class="editor-pagina">
    <p v-if="mapasStore.isLoadingMap" class="m-3">Cargando mapa…</p>

    <div v-else-if="!mapasStore.activeMap" class="m-3">
      <p>No se encontró el mapa solicitado.</p>
      <NuxtLink to="/mapas" class="boton-secundario">Volver</NuxtLink>
    </div>

    <div v-else-if="!esOwner" class="m-3">
      <p>No tienes permisos para editar este mapa.</p>
      <NuxtLink :to="`/mapas/${mapaId}`" class="boton-secundario">Ver mapa</NuxtLink>
    </div>

    <template v-else>
      <header class="encabezado-editor flex flex-contenido-separado p-x-3 p-y-2">
        <div>
          <h1 class="m-0">Editando: {{ mapasStore.activeMap.name }}</h1>
          <p class="texto-secundario m-0">Tipo: {{ mapasStore.activeMap.map_type }}</p>
        </div>
        <div class="flex">
          <button class="boton-secundario" type="button" @click="abrirEditar">
            <span class="pictograma-editar" aria-hidden="true" /> Configuración
          </button>
          <button class="boton-secundario" type="button" @click="eliminarMapa">
            <span class="pictograma-tache" aria-hidden="true" /> Eliminar mapa
          </button>
          <NuxtLink :to="`/mapas/${mapaId}`" class="boton-secundario">Ver</NuxtLink>
        </div>
      </header>

      <div class="contenido-editor flex">
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

        <MapasPanelCapas
          :capas="mapasStore.activeLayers"
          :editable="true"
          @toggle="alternarVisible"
          @opacidad="cambiarOpacidad"
          @reordenar="reordenar"
          @eliminar="eliminarCapa"
          @agregar="abrirAgregarCapas"
        />
      </div>

      <MapasModalEditarMapa ref="modalEditar" :mapa="mapasStore.activeMap" />
      <MapasModalAgregarCapas
        ref="modalAgregarCapas"
        :mapa-id="mapaId"
        :map-type="mapasStore.activeMap.map_type"
      />
    </template>
  </div>
</template>

<style lang="scss" scoped>
.encabezado-editor {
  align-items: center;
  border-bottom: 1px solid var(--color-neutro-1);
}

.contenido-editor {
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
