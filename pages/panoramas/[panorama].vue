<script setup>
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';
import {
  SisdaiCapaVectorial,
  SisdaiCapaWms,
  SisdaiCapaXyz,
  SisdaiLeyendaWms,
  SisdaiMapa,
} from '@centrogeomx/sisdai-mapas';
import { basemapsPanorama, fuenteBasemap } from '~/utils/geocontenidos/basemapsPanorama';
import { estiloMarcadorSisdai } from '~/utils/geocontenidos/estiloMarcadorSisdai';
import pictogramas from '~/utils/geocontenidos/pictogramas.json';

definePageMeta({ layout: 'geohistorias' });

const { gnoxyFetch } = useGnoxyUrl();
const config = useRuntimeConfig();
const { panorama: panoramaId } = useRoute().params;

const panorama = reactive({ cargando: true, datos: null, sinAcceso: false });
const topicoActivoId = ref(null);
const textoActivoId = ref(null);
const capasPorTopico = reactive({});
const itemsPorTextoTopico = reactive({});
const capasEncendidas = reactive({});
const marcadoresPorCapa = reactive({});
const cargandoCapas = ref(false);
const cargandoTexto = ref(false);
const modalInfoAdicional = ref(null);
const modalCapaInfo = ref(null);
const capaInfo = ref(null);
const modalItemTexto = ref(null);
const itemTextoActivo = ref(null);
const basemapActivo = ref(null);
const wmsExternosEncendidos = reactive(new Set());
const modalWmsExternos = ref(null);
const modalBasemap = ref(null);
const capaMascara = ref(null);
const leyendaVisible = ref(true);

function elegirBasemap(id) {
  basemapActivo.value = id;
  modalBasemap.value?.cerrarModal();
}

async function cargarCapaMascara(datasetId) {
  if (!datasetId) return;

  const respuesta = await gnoxyFetch(`${config.public.geonodeApi}/datasets/${datasetId}/`);
  if (!respuesta.ok) return;

  const datos = await respuesta.json();
  capaMascara.value = (datos.dataset || datos).alternate || null;
}

async function cargarMarcadoresCapa(capaId) {
  if (marcadoresPorCapa[capaId]) return;
  marcadoresPorCapa[capaId] = [];

  const respuesta = await gnoxyFetch(
    `${config.public.geonodeApi}/panorama-markers/by-layer/${capaId}/`
  );
  marcadoresPorCapa[capaId] = await respuesta.json();
}

async function cargarPanorama() {
  panorama.cargando = true;
  const respuesta = await gnoxyFetch(`${config.public.geonodeApi}/panoramas/${panoramaId}/`);

  if (!respuesta.ok) {
    panorama.sinAcceso = true;
    panorama.cargando = false;
    return;
  }

  const data = await respuesta.json();
  panorama.datos = data;
  panorama.cargando = false;
  basemapActivo.value = data.config;
  (data.external_wms || [])
    .filter((item) => item.at_start)
    .forEach((item) => wmsExternosEncendidos.add(item.id));
  cargarCapaMascara(data.mask_dataset_id);

  if (data.landing_info && data.extra_info) {
    await nextTick();
    modalInfoAdicional.value?.abrirModal();
  }

  const primerTopico = [...(data.topics || [])].sort((a, b) => a.stack_order - b.stack_order)[0];
  if (primerTopico) await seleccionarTopico(primerTopico.id);
}
cargarPanorama();

async function seleccionarTopico(topicoId) {
  topicoActivoId.value = topicoId;
  textoActivoId.value = null;
  if (capasPorTopico[topicoId]) return;

  cargandoCapas.value = true;
  const respuesta = await gnoxyFetch(`${config.public.geonodeApi}/panorama-topics/${topicoId}/`);
  const data = await respuesta.json();
  const capas = data.layers || [];
  capasPorTopico[topicoId] = capas;
  const encendidas = capas.filter((capa) => capa.visible);
  capasEncendidas[topicoId] = new Set(encendidas.map((capa) => capa.id));
  encendidas.forEach((capa) => cargarMarcadoresCapa(capa.id));
  cargandoCapas.value = false;
}

async function seleccionarTextoTopico(textoId) {
  textoActivoId.value = textoId;
  topicoActivoId.value = null;
  if (itemsPorTextoTopico[textoId]) return;

  cargandoTexto.value = true;
  const respuesta = await gnoxyFetch(
    `${config.public.geonodeApi}/panorama-text-topics/${textoId}/`
  );
  const data = await respuesta.json();
  itemsPorTextoTopico[textoId] = data.items || [];
  cargandoTexto.value = false;
}

function abrirItemTexto(item) {
  itemTextoActivo.value = item;
  modalItemTexto.value?.abrirModal();
}

function alternarCapa(capa) {
  const encendidas = capasEncendidas[topicoActivoId.value];
  if (!encendidas) return;
  if (encendidas.has(capa.id)) {
    encendidas.delete(capa.id);
  } else {
    encendidas.add(capa.id);
    cargarMarcadoresCapa(capa.id);
  }
}

function abrirInfoCapa(capa) {
  capaInfo.value = capa;
  modalCapaInfo.value?.abrirModal();
}

function alMoverVista({ acercamiento, vista }) {
  const datos = panorama.datos;
  if (!datos?.limited_zoom || !datos.custom_zoom) return;
  if (acercamiento < datos.custom_zoom) {
    vista.animate({ zoom: datos.custom_zoom, duration: 250 });
  }
}

const capasActivas = computed(() => capasPorTopico[topicoActivoId.value] || []);
const itemsTextoActivos = computed(() => itemsPorTextoTopico[textoActivoId.value] || []);
const capasVisibles = computed(() =>
  capasActivas.value.filter((capa) => capasEncendidas[topicoActivoId.value]?.has(capa.id))
);

function caracterPictograma(nombre) {
  const codigo = pictogramas[nombre];
  return codigo ? String.fromCharCode(parseInt(codigo, 16)) : '';
}

function escaparHtml(texto) {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

const marcadoresGeoJSON = computed(() => ({
  type: 'FeatureCollection',
  features: capasVisibles.value.flatMap((capa) =>
    (marcadoresPorCapa[capa.id] || []).map((marcador) => ({
      type: 'Feature',
      properties: {
        id: marcador.id,
        title: marcador.title,
        narrative: marcador.narrative,
        icon: caracterPictograma(marcador.icon),
        color: (marcador.options && marcador.options.color) || '#df4242',
      },
      geometry: { type: 'Point', coordinates: [Number(marcador.lng), Number(marcador.lat)] },
    }))
  ),
}));

function contenidoGloboMarcador(propiedades) {
  const partes = [`<strong>${escaparHtml(propiedades.title)}</strong>`];
  if (propiedades.narrative) partes.push(`<p>${escaparHtml(propiedades.narrative)}</p>`);
  return partes.join('');
}

async function contenidoCuadroInfoCapa(url, capa) {
  const titulo = escaparHtml(capa.dataset_title || capa.name);

  const respuesta = await gnoxyFetch(url);
  if (!respuesta.ok) return `<p>${titulo}</p><p>No hay información disponible.</p>`;

  const datos = await respuesta.json();
  if (!datos.features?.length) {
    return `<p>${titulo}</p><p>No hay información disponible para este punto.</p>`;
  }

  const filas = Object.entries(datos.features[0].properties)
    .map(([clave, valor]) => `<li>${escaparHtml(clave)}: ${escaparHtml(String(valor))}</li>`)
    .join('');
  return `<p>${titulo}</p><ul>${filas}</ul>`;
}

const wmsExternosActivos = computed(() =>
  (panorama.datos?.external_wms || []).filter((item) => wmsExternosEncendidos.has(item.id))
);

function alternarWmsExterno(item) {
  if (wmsExternosEncendidos.has(item.id)) wmsExternosEncendidos.delete(item.id);
  else wmsExternosEncendidos.add(item.id);
}

const vista = computed(() => {
  const datos = panorama.datos;
  if (!datos || datos.bbox_x0 === null || datos.bbox_x0 === undefined) {
    return { centro: [-103.5, 23.6], acercamiento: 5 };
  }
  return { extension: `${datos.bbox_x0},${datos.bbox_y0},${datos.bbox_x1},${datos.bbox_y1}` };
});
</script>

<template>
  <main class="panorama">
    <GeocontenidosLoader v-if="panorama.cargando" />

    <p v-else-if="panorama.sinAcceso" class="texto-centrado h3 p-4">
      Este panorama no existe o no tienes acceso a él.
    </p>

    <template v-else>
      <header
        v-if="panorama.datos.template_use === 'normal' && panorama.datos.header_title"
        class="panorama__encabezado"
        :style="{
          backgroundColor: panorama.datos.header_color || '#1a1a2e',
          color: panorama.datos.header_title_color || '#ffffff',
        }"
      >
        <img
          v-if="panorama.datos.header_logo"
          :src="panorama.datos.header_logo"
          alt=""
          class="panorama__encabezado-logo"
        />
        <h1 class="m-0">{{ panorama.datos.header_title }}</h1>
      </header>

      <div class="panorama__contenedor">
        <nav
          class="panorama__temas"
          :class="{ 'panorama__temas--ancho': panorama.datos.icon_title }"
        >
          <button
            v-for="topico in [...(panorama.datos.topics || [])].sort(
              (a, b) => a.stack_order - b.stack_order
            )"
            :key="`capas-${topico.id}`"
            class="panorama__tema-item"
            :class="{ activo: topico.id === topicoActivoId }"
            :aria-label="topico.name"
            :title="topico.name"
            @click="seleccionarTopico(topico.id)"
          >
            <img
              v-if="topico.custom_icon"
              :src="topico.custom_icon"
              alt=""
              class="panorama__tema-icono"
            />
            <span v-else :class="`pictograma-${topico.icon}`" />
            <span v-if="panorama.datos.icon_title" class="panorama__tema-nombre">
              {{ topico.name }}
            </span>
          </button>

          <hr v-if="panorama.datos.text_topics?.length" class="panorama__temas-separador" />

          <button
            v-for="topico in [...(panorama.datos.text_topics || [])].sort(
              (a, b) => a.stack_order - b.stack_order
            )"
            :key="`texto-${topico.id}`"
            class="panorama__tema-item"
            :class="{ activo: topico.id === textoActivoId }"
            :aria-label="topico.name"
            :title="topico.name"
            @click="seleccionarTextoTopico(topico.id)"
          >
            <img
              v-if="topico.custom_icon"
              :src="topico.custom_icon"
              alt=""
              class="panorama__tema-icono"
            />
            <span v-else :class="`pictograma-${topico.icon}`" />
            <span v-if="panorama.datos.icon_title" class="panorama__tema-nombre">
              {{ topico.name }}
            </span>
          </button>
        </nav>

        <div class="panorama__mapa">
          <div class="panorama__controles">
            <button
              type="button"
              class="boton-pictograma boton-primario"
              aria-label="Leyenda"
              title="Mostrar/ocultar leyenda"
              @click="leyendaVisible = !leyendaVisible"
            >
              <span class="pictograma-capas" aria-hidden="true" />
            </button>

            <button
              type="button"
              class="boton-pictograma boton-primario"
              aria-label="Mapa base"
              title="Cambiar mapa base"
              @click="modalBasemap?.abrirModal()"
            >
              <span class="pictograma-mapa-centro" aria-hidden="true" />
            </button>

            <button
              v-if="panorama.datos.extra_info"
              type="button"
              class="boton-pictograma boton-primario"
              aria-label="Información del panorama"
              title="Información del panorama"
              @click="modalInfoAdicional?.abrirModal()"
            >
              <span class="pictograma-informacion" aria-hidden="true" />
            </button>

            <button
              v-if="panorama.datos.external_wms?.length"
              type="button"
              class="boton-pictograma boton-primario"
              aria-label="WMS externos"
              title="Mostrar/ocultar WMS externos"
              @click="modalWmsExternos?.abrirModal()"
            >
              <span class="pictograma-enlace-externo" aria-hidden="true" />
            </button>
          </div>

          <ClientOnly>
            <SisdaiMapa class="gema" :vista="vista" @al-mover-vista="alMoverVista">
              <SisdaiCapaXyz
                :key="basemapActivo"
                :posicion="0"
                :fuente="fuenteBasemap(basemapActivo)"
              />

              <SisdaiCapaWms
                v-for="capa in capasVisibles"
                :key="`capa-${capa.id}`"
                :fuente="`${config.public.geoserverUrl}/ows`"
                :capa="capa.name"
                :estilo="capa.style || undefined"
                :posicion="capa.stack_order"
                :cuadro-informativo="(url) => contenidoCuadroInfoCapa(url, capa)"
              />

              <template v-for="externo in wmsExternosActivos" :key="`externo-${externo.id}`">
                <SisdaiCapaWms
                  v-if="externo.wms_or_tile === 'wms'"
                  :fuente="externo.url"
                  :capa="externo.wms_layers"
                  :posicion="externo.stack_order"
                />
                <SisdaiCapaXyz v-else :fuente="externo.url" :posicion="externo.stack_order" />
              </template>

              <SisdaiCapaVectorial
                v-if="capaMascara"
                :fuente="`${config.public.geoserverUrl}/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=${capaMascara}&outputFormat=application%2Fjson&srsName=EPSG%3A4326`"
                :posicion="capasVisibles.length + wmsExternosActivos.length + 1"
                :estilo="{
                  'relleno-color': 'transparent',
                  'contorno-color': '#ff9800',
                  'contorno-grosor': 3,
                }"
              />

              <SisdaiCapaVectorial
                :fuente="marcadoresGeoJSON"
                :posicion="capasVisibles.length + wmsExternosActivos.length + 2"
                :estilo="estiloMarcadorSisdai()"
                :globo-informativo="contenidoGloboMarcador"
              />
            </SisdaiMapa>
          </ClientOnly>
        </div>

        <aside v-if="topicoActivoId && leyendaVisible" class="panorama__leyenda">
          <h3>Capas</h3>

          <GeocontenidosLoader v-if="cargandoCapas" />

          <p v-else-if="capasActivas.length === 0" class="texto-tamanio-2">
            Esta temática no tiene capas.
          </p>

          <div
            v-for="capa in capasActivas"
            v-else
            :key="`capa-control-${capa.id}`"
            class="panorama__capa"
          >
            <div class="flex flex-contenido-separado">
              <label class="panorama__capa-etiqueta">
                <input
                  type="checkbox"
                  :checked="capasEncendidas[topicoActivoId]?.has(capa.id)"
                  @change="alternarCapa(capa)"
                />
                {{ capa.dataset_title || capa.name }}
              </label>

              <button
                aria-label="Información de la capa"
                title="Información de la capa"
                type="button"
                class="boton-pictograma boton-sin-contenedor-secundario"
                @click="abrirInfoCapa(capa)"
              >
                <span class="pictograma-informacion" aria-hidden="true" />
              </button>
            </div>

            <SisdaiLeyendaWms
              v-if="capasEncendidas[topicoActivoId]?.has(capa.id)"
              :fuente="`${config.public.geoserverUrl}/wms`"
              :nombre="capa.name"
              :titulo="capa.dataset_title"
              :estilo="capa.style || undefined"
              :sin-control="true"
            />
          </div>
        </aside>

        <aside v-else-if="textoActivoId && leyendaVisible" class="panorama__leyenda">
          <h3>Contenidos</h3>

          <GeocontenidosLoader v-if="cargandoTexto" />

          <p v-else-if="itemsTextoActivos.length === 0" class="texto-tamanio-2">
            Esta temática no tiene contenidos.
          </p>

          <button
            v-for="item in itemsTextoActivos"
            v-else
            :key="`item-texto-${item.id}`"
            type="button"
            class="panorama__item-texto"
            @click="abrirItemTexto(item)"
          >
            {{ item.name }}
          </button>
        </aside>
      </div>

      <ClientOnly>
        <SisdaiModal ref="modalInfoAdicional">
          <template #encabezado>
            <h2 class="m-t-0">{{ panorama.datos.name }}</h2>
          </template>
          <template #cuerpo>
            <p>{{ panorama.datos.extra_info }}</p>
          </template>
        </SisdaiModal>

        <SisdaiModal ref="modalCapaInfo">
          <template #encabezado>
            <h2 class="m-t-0">{{ capaInfo?.dataset_title || capaInfo?.name }}</h2>
          </template>
          <template #cuerpo>
            <template v-if="capaInfo?.narrative || capaInfo?.dataset_abstract">
              <div v-if="capaInfo.narrative" class="m-b-4">
                <h3>Narrativa</h3>
                <p class="panorama__texto-info">{{ capaInfo.narrative }}</p>
              </div>
              <div v-if="capaInfo.dataset_abstract">
                <h3>Descripción de la capa</h3>
                <p class="panorama__texto-info">{{ capaInfo.dataset_abstract }}</p>
              </div>
            </template>
            <p v-else>Esta capa no tiene información adicional.</p>
          </template>
        </SisdaiModal>

        <SisdaiModal ref="modalBasemap">
          <template #encabezado>
            <h2 class="m-t-0">Mapa base</h2>
          </template>
          <template #cuerpo>
            <ul class="lista-sin-estilo">
              <li v-for="basemap in basemapsPanorama" :key="basemap.id">
                <button
                  type="button"
                  class="boton boton-secundario panorama__opcion-basemap"
                  :class="{ activo: basemap.id === basemapActivo }"
                  @click="elegirBasemap(basemap.id)"
                >
                  {{ basemap.label }}
                </button>
              </li>
            </ul>
          </template>
        </SisdaiModal>

        <SisdaiModal ref="modalItemTexto">
          <template #encabezado>
            <h2 class="m-t-0">{{ itemTextoActivo?.name }}</h2>
          </template>
          <template #cuerpo>
            <p class="panorama__texto-info">{{ itemTextoActivo?.contents }}</p>
          </template>
        </SisdaiModal>

        <SisdaiModal ref="modalWmsExternos">
          <template #encabezado>
            <h2 class="m-t-0">WMS externos</h2>
          </template>
          <template #cuerpo>
            <label
              v-for="externo in panorama.datos.external_wms"
              :key="`toggle-externo-${externo.id}`"
              class="panorama__capa-etiqueta m-b-2"
            >
              <input
                type="checkbox"
                :checked="wmsExternosEncendidos.has(externo.id)"
                @change="alternarWmsExterno(externo)"
              />
              {{ externo.name }}
            </label>
          </template>
        </SisdaiModal>
      </ClientOnly>
    </template>
  </main>
</template>

<style lang="scss" scoped>
.panorama {
  &__encabezado {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px 24px;
  }

  &__encabezado-logo {
    height: 40px;
    width: auto;
  }

  &__contenedor {
    display: flex;
    height: calc(100vh - 51px);
  }

  &__temas {
    width: 64px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 8px 0;
    background-color: var(--color-primario-4);

    &--ancho {
      width: 96px;
    }
  }

  &__temas-separador {
    width: 80%;
    border: none;
    border-top: 1px solid var(--texto-inverso);
    opacity: 0.3;
    margin: 4px 0;
  }

  &__tema-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    width: 100%;
    padding: 8px 4px;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--texto-inverso);

    &.activo {
      background-color: var(--color-primario-2);
      border-radius: 8px;
    }
  }

  &__tema-icono {
    width: 20px;
    height: 20px;
    object-fit: contain;
  }

  &__tema-nombre {
    font-size: 0.7rem;
    line-height: 1.2;
    text-align: center;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__mapa {
    flex: 1;
    position: relative;
  }

  &__controles {
    position: absolute;
    top: 16px;
    right: 16px;
    z-index: 2;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__opcion-basemap {
    width: 100%;
    text-align: left;
    margin-bottom: 8px;

    &.activo {
      font-weight: bold;
      border-color: var(--color-primario-1);
    }
  }

  &__leyenda {
    width: 280px;
    overflow-y: auto;
    padding: 16px;
    border-left: 1px solid var(--color-secundario-4);
  }

  &__item-texto {
    display: block;
    width: 100%;
    text-align: left;
    padding: 8px 0;
    background: none;
    border: none;
    border-bottom: 1px solid var(--color-secundario-4);
    cursor: pointer;
  }

  &__capa {
    padding: 8px 0;
    border-bottom: 1px solid var(--color-secundario-4);
  }

  &__capa-etiqueta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.85rem;
  }

  &__texto-info {
    white-space: pre-wrap;
  }
}
</style>

<style lang="scss">
/* Mueve los controles de acercamiento (nativos de sisdai-mapas) al lado
   izquierdo para que no se encimen con los controles propios del panorama
   (leyenda, mapa base, info, WMS externos) del lado derecho. */
.panorama__mapa .sisdai-mapa-control.contenedor-controles-vista {
  left: var(--margen);
  right: auto;
}
</style>
