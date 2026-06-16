<script setup>
definePageMeta({
  middleware: 'auth',
});

const route = useRoute();
const mapasStore = useMapasStore();
const { data: session } = useAuth();

const mapaId = computed(() => Number(route.params.id));

const modalEditar = ref(null);
const modalCompartir = ref(null);

function abrirCompartir() {
  modalCompartir.value?.abrir();
}

const esOwner = computed(() => {
  const ownerUsername = mapasStore.activeMap?.owner?.username;
  const sessionEmail = session.value?.user?.email;
  const sessionName = session.value?.user?.name;
  if (!ownerUsername || !session.value) return false;
  return ownerUsername === sessionEmail || ownerUsername === sessionName;
});

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

function cambiarVista(vista) {
  if (!mapasStore.activeMap) return;
  mapasStore.activeMap = { ...mapasStore.activeMap, ...vista };
}

async function guardarVista(vista) {
  if (!mapasStore.activeMap) return;
  await mapasStore.actualizarMapa(mapasStore.activeMap.id, vista);
}

function abrirAgregarCapas() {
  mapasStore.abrirModalAgregarCapas();
}

function abrirEditar() {
  modalEditar.value?.abrir();
}

async function eliminarMapa() {
  if (!confirm('¿Eliminar este mapa? Esta acción no se puede deshacer.')) return;
  const ok = await mapasStore.eliminarMapa(mapaId.value);
  if (ok) navigateTo('/catalogo/explorar/mapas');
}

watch(
  () => mapasStore.activeMap?.map_type,
  (nv, ov) => {
    console.warn('[editar.vue] activeMap.map_type cambió', { ov, nv });
  }
);

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
      <NuxtLink to="/catalogo/explorar/mapas" class="boton-secundario">Volver</NuxtLink>
    </div>

    <div v-else-if="!esOwner" class="m-3">
      <p>No tienes permisos para editar este mapa.</p>
      <NuxtLink :to="`/consulta/mapas/${mapaId}`" class="boton-secundario">Ver mapa</NuxtLink>
    </div>

    <template v-else>
      <header class="encabezado-editor flex flex-contenido-separado p-x-3 p-y-2">
        <div>
          <h1 class="m-0">Editando: {{ mapasStore.activeMap.name }}</h1>
          <p class="texto-secundario m-0">Tipo: {{ mapasStore.activeMap.map_type }}</p>
        </div>
        <div class="flex">
          <button class="boton-secundario" type="button" @click="abrirCompartir">
            <i class="fa-solid fa-share-nodes" aria-hidden="true"></i> Compartir
          </button>
          <button class="boton-secundario" type="button" @click="abrirEditar">
            <span class="pictograma-editar" aria-hidden="true" /> Configuración
          </button>
          <button class="boton-secundario" type="button" @click="eliminarMapa">
            <span class="pictograma-tache" aria-hidden="true" /> Eliminar mapa
          </button>
          <NuxtLink :to="`/consulta/mapas/${mapaId}`" class="boton-secundario">Atrás</NuxtLink>
        </div>
      </header>

      <div class="contenido-editor flex">
        <div :key="mapasStore.activeMap.map_type" class="contenedor-mapa">
          <MapasVisorMapa
            v-if="mapasStore.activeMap.map_type === 'regular'"
            :mapa="mapasStore.activeMap"
            :capas="mapasStore.activeLayers"
            @vista="cambiarVista"
          />
          <MapasVisorSwipe
            v-else-if="mapasStore.activeMap.map_type === 'swipe'"
            :mapa="mapasStore.activeMap"
            :capas="mapasStore.activeLayers"
            @vista="cambiarVista"
          />
          <MapasVisorDual
            v-else-if="mapasStore.activeMap.map_type === 'dual'"
            :mapa="mapasStore.activeMap"
            :capas="mapasStore.activeLayers"
            @vista="cambiarVista"
          />
        </div>

        <MapasPanelCapas
          :capas="mapasStore.activeLayers"
          :editable="true"
          :mapa="mapasStore.activeMap"
          @toggle="alternarVisible"
          @opacidad="cambiarOpacidad"
          @reordenar="reordenar"
          @eliminar="eliminarCapa"
          @agregar="abrirAgregarCapas"
          @vista="cambiarVista"
          @guardar-vista="guardarVista"
        />
      </div>

      <MapasModalEditarMapa ref="modalEditar" :mapa="mapasStore.activeMap" />
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
