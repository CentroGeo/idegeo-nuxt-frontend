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

const mapaRef = ref(null);
defineExpose({ mapaRef });

const baseLayerUrls = {
  osm: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  carto: 'https://{a-c}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png',
  carto_dark: 'https://{a-c}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png',
  satellite:
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
};

const baseLayerUrl = computed(() => baseLayerUrls[props.mapa.base_layer] || baseLayerUrls.osm);

const vista = computed(() => ({
  centro: [props.mapa.center_lat, props.mapa.center_long],
  acercamiento: props.mapa.zoom,
}));

const wmsFuente = computed(() => `${config.public.geoserverUrl}/wms?`);

const capasOrdenadas = computed(() =>
  [...props.capas].sort((a, b) => a.stack_order - b.stack_order)
);
</script>

<template>
  <ClientOnly>
    <SisdaiMapa ref="mapaRef" class="visor-mapa" :vista="vista">
      <SisdaiCapaXyz :posicion="0" :fuente="baseLayerUrl" />

      <template v-for="capa in capasOrdenadas" :key="capa.id">
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

      <slot />
    </SisdaiMapa>
  </ClientOnly>
</template>

<style lang="scss" scoped>
.visor-mapa {
  --altura-visor: calc(100vh - 112px);
  height: var(--altura-visor) !important;
  width: 100%;
}
</style>
