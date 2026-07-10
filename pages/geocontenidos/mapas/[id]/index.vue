<script setup>
import { useMapaPreview } from '~/composables/mapas/useMapaPreview';

const route = useRoute();
const mapasStore = useMapasStore();
const { capturarVisor } = useMapaPreview();
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

const modalEditar = ref(null);
const modalCompartir = ref(null);
function abrirCompartir() {
  modalCompartir.value?.abrir();
}

// Edición de capas en línea (en vez de navegar a /editar).
const editandoCapas = ref(false);
function alternarEdicionCapas() {
  editandoCapas.value = !editandoCapas.value;
}

function abrirEditar() {
  modalEditar.value?.abrir();
}

// Vista previa de la tarjeta: captura el canvas del visor en pantalla y lo sube.
const visorRef = ref(null);
const generandoPreview = ref(false);
const previewMensaje = ref('');

async function generarVistaPrevia() {
  if (!visorRef.value || !mapasStore.activeMap) return;
  generandoPreview.value = true;
  previewMensaje.value = '';
  try {
    const blob = await capturarVisor(visorRef.value, mapasStore.activeMap.map_type);
    const file = new File([blob], `preview-mapa-${mapasStore.activeMap.id}.png`, {
      type: 'image/png',
    });
    const data = await mapasStore.subirImagenMapa(mapasStore.activeMap.id, file);
    previewMensaje.value = data
      ? 'Vista previa actualizada.'
      : 'No se pudo guardar la vista previa.';
  } catch (e) {
    previewMensaje.value = e?.message || 'No se pudo generar la vista previa.';
  } finally {
    generandoPreview.value = false;
    setTimeout(() => (previewMensaje.value = ''), 5000);
  }
}

async function alternarVisible({ id, visible }) {
  await mapasStore.actualizarCapa(id, { visible });
}

async function cambiarOpacidad({ id, opacity }) {
  await mapasStore.actualizarCapa(id, { opacity });
}

async function reordenar(orden) {
  await mapasStore.reordenarCapas(orden);
}

function abrirAgregarCapas() {
  mapasStore.abrirModalAgregarCapas();
}

async function eliminarCapa(id) {
  await mapasStore.eliminarCapa(id);
}

async function eliminarMapa() {
  if (!confirm('¿Eliminar este mapa? Esta acción no se puede deshacer.')) return;
  const ok = await mapasStore.eliminarMapa(mapaId.value);
  if (ok) navigateTo('/geocontenidos/mapas');
}

// Acepta ambos payloads: el del visor ({ acercamiento, centro:[lat, long] }) y
// el del panel de capas ({ zoom, center_lat, center_long }).
function cambiarVista(payload) {
  if (!mapasStore.activeMap || !payload) return;
  const zoom = payload.acercamiento ?? payload.zoom;
  const lat = Array.isArray(payload.centro) ? payload.centro[0] : payload.center_lat;
  const long = Array.isArray(payload.centro) ? payload.centro[1] : payload.center_long;
  mapasStore.activeMap = {
    ...mapasStore.activeMap,
    ...(zoom !== undefined ? { zoom } : {}),
    ...(lat !== undefined ? { center_lat: lat } : {}),
    ...(long !== undefined ? { center_long: long } : {}),
  };
}

async function guardarVista(vista) {
  if (!mapasStore.activeMap) return;
  await mapasStore.actualizarMapa(mapasStore.activeMap.id, vista);
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
    <p v-if="mapasStore.isLoadingMap || !mapasStore.mapaCargado" class="m-3">Cargando mapa…</p>

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
            <i class="fa-solid fa-arrow-up-right-from-square"></i>&nbsp;Visualizar
          </NuxtLink>
          <button class="boton-secundario" type="button" @click="abrirCompartir">
            <i class="fa-solid fa-share-nodes" aria-hidden="true"></i>&nbsp;Compartir
          </button>
          <button v-if="puedeEditar" class="boton-primario" type="button" @click="abrirEditar">
            <span class="pictograma-mas" aria-hidden="true" /> Propiedades del Mapa
          </button>
          <button
            v-if="puedeEditar"
            class="boton-secundario"
            :class="{ 'boton-primario': editandoCapas }"
            type="button"
            :aria-pressed="editandoCapas"
            @click="alternarEdicionCapas"
          >
            <span class="pictograma-editar" aria-hidden="true" />
            &nbsp;{{ editandoCapas ? 'Cerrar Edición' : 'Editar Capas' }}
          </button>
          <button
            v-if="puedeEditar"
            class="boton-secundario"
            type="button"
            :disabled="generandoPreview"
            @click="generarVistaPrevia"
          >
            <i class="fa-solid fa-camera" aria-hidden="true"></i>
            &nbsp;{{ generandoPreview ? 'Generando…' : 'Generar vista previa' }}
          </button>
          <NuxtLink to="/geocontenidos/mapas" class="boton-secundario">Lista de Mapas</NuxtLink>
          <button class="boton-primario boton-eliminar" type="button" @click="eliminarMapa">
            <span class="pictograma-tache" aria-hidden="true" /> Eliminar mapa
          </button>
        </div>
      </header>

      <p v-if="previewMensaje" class="texto-secundario m-0">{{ previewMensaje }}</p>

      <div class="contenido-visor flex">
        <div :key="mapasStore.activeMap.map_type" class="contenedor-mapa">
          <MapasVisor
            v-if="mapasStore.activeMap.map_type === 'regular'"
            ref="visorRef"
            :vista="{
              centro: [mapasStore.activeMap.center_lat, mapasStore.activeMap.center_long],
              acercamiento: mapasStore.activeMap.zoom,
            }"
            :capas="mapasStore.activeLayers"
            :base-layer="mapasStore.activeMap.base_layer"
            :opciones="{
              titulo: mapasStore.activeMap.name,
              colorControles: mapasStore.activeMap.highlight_color,
            }"
            @vista="cambiarVista"
          />
          <MapasVisorSwipe
            v-else-if="mapasStore.activeMap.map_type === 'swipe'"
            ref="visorRef"
            :mapa="mapasStore.activeMap"
            :capas="mapasStore.activeLayers"
            @vista="cambiarVista"
          />
          <MapasVisorDual
            v-else-if="mapasStore.activeMap.map_type === 'dual'"
            ref="visorRef"
            :mapa="mapasStore.activeMap"
            :capas="mapasStore.activeLayers"
            @vista="cambiarVista"
          />
        </div>

        <MapasPanelCapas
          :capas="mapasStore.activeLayers"
          :editable="editandoCapas"
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
.encabezado-mapa {
  align-items: center;
  border-bottom: 1px solid var(--color-neutro-1);
}

.contenido-visor {
  gap: 0;
  height: calc(88.5vh);
  overflow-y: scroll;
}

.contenedor-mapa {
  flex: 1;
  min-width: 600px;
  padding: 5px;
  margin-top: 8px;
  margin-bottom: 8px;
  margin-left: 10px;
  border: 3px solid #e5c743;
  /* Alto definido: el visor (.visor-mapa) usa height:100% y lo llena.
     --altura-visor lo hereda el divisor del swipe. Ajustable. */
  height: 45rem;
  --altura-visor: 45rem;
}

.boton-eliminar {
  background-color: var(--mapa-peligro-fondo);
  border-color: var(--mapa-peligro-fondo);
  color: var(--mapa-peligro-color);
}

.boton-eliminar:hover {
  background-color: var(--mapa-peligro-fondo-cursor);
  border-color: var(--mapa-peligro-fondo-cursor);
}

.flex {
  gap: 8px;
  flex-wrap: wrap;
}
</style>

<!-- Sin `scoped`: las definiciones body[data-tema=...] deben poder apuntar al
     <body>. Con scoped se les añade [data-v-hash] y dejan de coincidir. Los
     tokens quedan globales; el prefijo --mapa- evita colisiones. -->
<style lang="scss">
:root,
body[data-tema='claro'] {
  --mapa-peligro-fondo: var(--color-error-3);
  --mapa-peligro-fondo-cursor: var(--color-error-4);
  --mapa-peligro-color: var(--color-neutro-0);
}

body[data-tema='oscuro'] {
  --mapa-peligro-fondo: var(--color-error-4);
  --mapa-peligro-fondo-cursor: var(--color-error-3);
  --mapa-peligro-color: var(--color-neutro-0);
}
</style>
