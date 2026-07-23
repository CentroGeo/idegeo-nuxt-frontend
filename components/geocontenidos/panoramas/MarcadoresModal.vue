<script setup>
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';
import pictogramas from '~/utils/geocontenidos/pictogramas.json';
import { iconosTematicaPanorama } from '~/utils/geocontenidos/basemapsPanorama';

const props = defineProps({
  capa: { type: Object, required: true },
});

const { gnoxyFetch } = useGnoxyUrl();
const config = useRuntimeConfig();
const { data: userData } = useAuth();

const modal = ref(null);
const cargando = ref(false);
const marcadores = ref([]);

function caracterPictograma(nombre) {
  return String.fromCharCode(parseInt(pictogramas[nombre], 16));
}

const formularioVacio = () => ({
  id: null,
  title: '',
  narrative: '',
  icon: iconosTematicaPanorama[0],
  color: '#df4242',
  lat: null,
  lng: null,
});

const formulario = reactive(formularioVacio());
const guardando = ref(false);
const errorGuardado = ref('');

const capaMapa = computed(() => [
  { name: props.capa.name, opacity: 1, stack_order: 1, visible: true },
]);

const marcadoresMapa = computed(() => {
  const lista = marcadores.value.map((m) => ({
    id: m.id,
    title: m.title,
    content: m.narrative,
    icon: caracterPictograma(m.icon || iconosTematicaPanorama[0]),
    color: (m.options && m.options.color) || '#df4242',
    lat: m.lat,
    lng: m.lng,
  }));

  if (formulario.lat !== null && formulario.lng !== null) {
    lista.push({
      id: 'nuevo',
      title: formulario.title || 'Nuevo marcador',
      content: formulario.narrative,
      icon: caracterPictograma(formulario.icon),
      color: formulario.color,
      lat: formulario.lat,
      lng: formulario.lng,
    });
  }

  return lista;
});

async function cargarMarcadores() {
  cargando.value = true;
  const respuesta = await gnoxyFetch(
    `${config.public.geonodeApi}/panorama-markers/by-layer/${props.capa.id}/`
  );
  marcadores.value = await respuesta.json();
  cargando.value = false;
}

function abrir() {
  Object.assign(formulario, formularioVacio());
  errorGuardado.value = '';
  cargarMarcadores();
  modal.value?.abrirModal();
}

defineExpose({ abrir });

function clickVista({ coordenadas }) {
  // El backend guarda lat/lng en DecimalField(decimal_places=10); los floats crudos de OL
  // suelen traer mas decimales de los permitidos y el guardado truena con un 400.
  formulario.lng = Number(coordenadas[0].toFixed(6));
  formulario.lat = Number(coordenadas[1].toFixed(6));
}

function seleccionarMarcador(marcador) {
  Object.assign(formulario, {
    id: marcador.id,
    title: marcador.title,
    narrative: marcador.narrative || '',
    icon: marcador.icon || iconosTematicaPanorama[0],
    color: (marcador.options && marcador.options.color) || '#df4242',
    lat: marcador.lat,
    lng: marcador.lng,
  });
}

function cancelarSeleccion() {
  Object.assign(formulario, formularioVacio());
}

function extraerMensajeError(cuerpo) {
  if (!cuerpo || typeof cuerpo !== 'object') return 'Ocurrió un error inesperado.';
  if (Array.isArray(cuerpo.errors)) return cuerpo.errors.join(' ');
  if (cuerpo.detail) return String(cuerpo.detail);
  return Object.entries(cuerpo)
    .map(([campo, mensaje]) => `${campo}: ${Array.isArray(mensaje) ? mensaje.join(' ') : mensaje}`)
    .join(' | ');
}

async function guardarMarcador() {
  if (formulario.lat === null || formulario.lng === null) {
    errorGuardado.value = 'Haz click en el mapa para ubicar el marcador.';
    return;
  }

  errorGuardado.value = '';
  guardando.value = true;

  const esNuevo = formulario.id === null;
  const url = esNuevo
    ? `${config.public.geonodeApi}/panorama-markers/`
    : `${config.public.geonodeApi}/panorama-markers/${formulario.id}/`;

  const cuerpo = {
    layer: props.capa.id,
    title: formulario.title,
    narrative: formulario.narrative,
    icon: formulario.icon,
    lat: formulario.lat,
    lng: formulario.lng,
    options: { color: formulario.color },
  };

  const respuesta = await gnoxyFetch(url, {
    method: esNuevo ? 'POST' : 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userData.value?.accessToken}`,
    },
    body: JSON.stringify(cuerpo),
  });

  guardando.value = false;

  if (!respuesta.ok) {
    errorGuardado.value = extraerMensajeError(await respuesta.json().catch(() => null));
    return;
  }

  cancelarSeleccion();
  await cargarMarcadores();
}

async function eliminarMarcador(id) {
  guardando.value = true;
  const respuesta = await gnoxyFetch(`${config.public.geonodeApi}/panorama-markers/${id}/`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${userData.value?.accessToken}` },
  });
  guardando.value = false;

  if (!respuesta.ok) {
    alert('No se pudo eliminar el marcador.');
    return;
  }

  if (formulario.id === id) cancelarSeleccion();
  await cargarMarcadores();
}
</script>

<template>
  <ClientOnly>
    <SisdaiModal ref="modal" tamanio-modal="modal-grande">
      <template #encabezado>
        <h2 class="m-t-0">Marcadores de la capa: {{ capa.dataset_title || capa.name }}</h2>
      </template>

      <template #cuerpo>
        <p class="m-0">
          Haz click en el mapa para ubicar un marcador nuevo, o selecciona uno existente de la lista
          para editarlo.
        </p>

        <div class="flex m-t-4">
          <div class="marcadores-modal__contenedor-mapa columna-8">
            <MapasVisor
              class="borde borde-color-secundario"
              :vista="{ centro: [-103.5, 23.6], acercamiento: 5 }"
              :capas="capaMapa"
              :marcadores="marcadoresMapa"
              base-layer="satellite"
              :opciones="{ info: false, cambiarBase: false, leyenda: false, coordenadas: false }"
              @click-vista="clickVista"
            />
          </div>

          <div class="columna-6">
            <h3>{{ formulario.id ? 'Editar marcador' : 'Nuevo marcador' }}</h3>

            <p v-if="errorGuardado" class="texto-color-error">{{ errorGuardado }}</p>

            <form @submit.prevent="guardarMarcador">
              <div class="m-b-4">
                <label for="marcador-titulo">Título</label>
                <input id="marcador-titulo" v-model="formulario.title" type="text" required />
              </div>

              <div class="m-b-4">
                <label>Narrativa</label>
                <UiEditorTexto v-model="formulario.narrative" />
              </div>

              <div class="flex flex-contenido-separado m-b-4">
                <div class="columna-8">
                  <label for="marcador-icono">Ícono</label>
                  <GeocontenidosSelectorIcono
                    id="marcador-icono"
                    v-model="formulario.icon"
                    por-nombre
                  />
                </div>

                <div>
                  <label for="marcador-color">Color</label>
                  <input id="marcador-color" v-model="formulario.color" type="color" />
                </div>
              </div>

              <div class="flex flex-contenido-final">
                <button
                  v-if="formulario.id"
                  type="button"
                  class="boton boton-secundario"
                  @click="cancelarSeleccion"
                >
                  Cancelar edición
                </button>
                <input
                  type="submit"
                  class="boton-primario"
                  :value="formulario.id ? 'Guardar cambios' : 'Agregar marcador'"
                  :disabled="guardando"
                />
              </div>
            </form>

            <h3>Marcadores existentes</h3>

            <GeocontenidosLoader v-if="cargando" />

            <p v-else-if="marcadores.length === 0" class="texto-tamanio-2">
              Esta capa no tiene marcadores.
            </p>

            <ul v-else class="lista-sin-estilo">
              <li
                v-for="marcador in marcadores"
                :key="marcador.id"
                class="fondo-color-acento borde-redondeado-8 p-2 m-b-2 flex flex-contenido-separado"
              >
                <button
                  type="button"
                  class="boton-sin-contenedor-secundario"
                  style="text-align: left"
                  @click="seleccionarMarcador(marcador)"
                >
                  {{ marcador.title }}
                </button>

                <button
                  aria-label="Eliminar marcador"
                  title="Eliminar marcador"
                  type="button"
                  class="boton-pictograma boton-sin-contenedor-secundario"
                  @click="eliminarMarcador(marcador.id)"
                >
                  <span class="pictograma-eliminar" aria-hidden="true" />
                </button>
              </li>
            </ul>
          </div>
        </div>
      </template>
    </SisdaiModal>
  </ClientOnly>
</template>

<style lang="scss">
.marcadores-modal__contenedor-mapa {
  height: 480px;
}
.marcadores-modal__contenedor-mapa .visor-mapa-contenedor {
  height: 100%;
}
</style>
