<script setup>
import { SisdaiCapaWms, SisdaiCapaXyz, SisdaiMapa } from '@centrogeomx/sisdai-mapas';

const props = defineProps({
  mapa: {
    type: Object,
    required: true,
  },
  capas: {
    type: Array,
    default: () => [],
  },
});

const config = useRuntimeConfig();
const { gnoxyFetch } = useGnoxyUrl();
const mapasStore = useMapasStore();

const mapaIzqRef = ref(null);
const mapaDerRef = ref(null);
defineExpose({ mapaIzqRef, mapaDerRef });

const baseLayerUrls = {
  osm: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  carto: 'https://{a-c}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png',
  carto_dark: 'https://{a-c}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png',
  satellite:
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
};

const baseLayerUrl = computed(() => baseLayerUrls[props.mapa.base_layer] || baseLayerUrls.osm);

const wmsFuente = computed(() => `${config.public.geoserverUrl}/wms?`);

const vistaInicial = {
  centro: [props.mapa.center_lat, props.mapa.center_long],
  acercamiento: props.mapa.zoom,
};

const vistaIzq = ref({ ...vistaInicial });
const vistaDer = ref({ ...vistaInicial });

let sincronizando = false;

function sincronizarDesdeIzq({ acercamiento, centro }) {
  if (sincronizando) return;
  sincronizando = true;
  vistaDer.value = { acercamiento, centro };
  nextTick(() => {
    sincronizando = false;
  });
}

function sincronizarDesdeDer({ acercamiento, centro }) {
  if (sincronizando) return;
  sincronizando = true;
  vistaIzq.value = { acercamiento, centro };
  nextTick(() => {
    sincronizando = false;
  });
}

const capasOrdenadas = computed(() =>
  [...props.capas].sort((a, b) => a.stack_order - b.stack_order)
);

const capasIzq = computed(() => capasOrdenadas.value.filter((l) => l.map_position === 'left'));
const capasDer = computed(() => capasOrdenadas.value.filter((l) => l.map_position === 'right'));
</script>

<template>
  <ClientOnly>
    <div class="visor-dual">
      <div class="panel-mapa">
        <SisdaiMapa
          ref="mapaIzqRef"
          class="visor-mapa"
          :vista="vistaIzq"
          @al-mover-vista="sincronizarDesdeIzq"
        >
          <SisdaiCapaXyz :posicion="0" :fuente="baseLayerUrl" />

          <template v-for="capa in capasIzq" :key="`izq-${capa.id}`">
            <SisdaiCapaWms
              v-if="capa.layer_type === 'wms'"
              :capa="capa.name"
              :fuente="wmsFuente"
              :consulta="gnoxyFetch"
              :estilo="capa.style || undefined"
              :opacidad="capa.opacity"
              :visible="capa.visible"
              :posicion="capa.stack_order"
              :mosaicos="true"
            />

            <SisdaiCapaXyz
              v-else-if="capa.layer_type === 'wmts'"
              :fuente="mapasStore.buildWmtsUrl(capa)"
              :opacidad="capa.opacity"
              :visible="capa.visible"
              :posicion="capa.stack_order"
            />
          </template>

          <slot name="izquierdo" />
        </SisdaiMapa>
      </div>

      <div class="panel-mapa">
        <SisdaiMapa
          ref="mapaDerRef"
          class="visor-mapa"
          :vista="vistaDer"
          @al-mover-vista="sincronizarDesdeDer"
        >
          <SisdaiCapaXyz :posicion="0" :fuente="baseLayerUrl" />

          <template v-for="capa in capasDer" :key="`der-${capa.id}`">
            <SisdaiCapaWms
              v-if="capa.layer_type === 'wms'"
              :capa="capa.name"
              :fuente="wmsFuente"
              :consulta="gnoxyFetch"
              :estilo="capa.style || undefined"
              :opacidad="capa.opacity"
              :visible="capa.visible"
              :posicion="capa.stack_order"
              :mosaicos="true"
            />

            <SisdaiCapaXyz
              v-else-if="capa.layer_type === 'wmts'"
              :fuente="mapasStore.buildWmtsUrl(capa)"
              :opacidad="capa.opacity"
              :visible="capa.visible"
              :posicion="capa.stack_order"
            />
          </template>

          <slot name="derecho" />
        </SisdaiMapa>
      </div>
    </div>
  </ClientOnly>
</template>

<style lang="scss" scoped>
.visor-dual {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  width: 100%;
}

.panel-mapa {
  min-width: 0;
}

.visor-mapa {
  --altura-visor: calc(100vh - 112px);
  height: var(--altura-visor) !important;
  width: 100%;
}
</style>
