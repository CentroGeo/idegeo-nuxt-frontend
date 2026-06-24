<script setup>
import {
  // SisdaiCapaArcgis,
  SisdaiCapaWms,
  SisdaiCapaXyz,
  // utiles,
  SisdaiMapa,
} from '@centrogeomx/sisdai-mapas';
import SelectedLayer from '~/utils/consulta/SelectedLayer';

definePageMeta({ layout: 'iframe' });

// http://localhost:3000/mapa?capas=8,trayectoria_cat_otis,,1,1;4,amenazas_meteorologicas_otis,,1,1#vista=7/14.3780/-98.6803/false

const { gnoxyFetch } = useGnoxyUrl();
const config = useRuntimeConfig();
const { hash, query } = useRoute();

const vistaDelMapa = ref({});
function obtenerVistaDelMapa() {
  const hashString = hash.substring(1); // quita #
  const params = new URLSearchParams(hashString);
  const { vista } = Object.fromEntries(params.entries());

  if (vista) {
    const [acercamiento, latitud, longitud, swipe] = vista.split('/');
    vistaDelMapa.value = { acercamiento, centro: [longitud, latitud] };
  }
}

function obtenerCapas() {
  return query.capas
    .split(';')
    .reverse()
    .map((txt, position) => new SelectedLayer(`${txt},${position}`));
}

const capas_consultadas = ref([]);
async function consultarCapas(capas) {
  const recursos = [];
  for await (const capa of capas) {
    const respuesta = await gnoxyFetch(`${config.public.geonodeApi}/datasets/${capa.pk}`);

    if (!respuesta.ok) return;

    const { dataset } = await respuesta.json();
    recursos.push({
      pk: capa.pk,
      posicion: capa.posicion,
      estilo: capa.estilo,
      alternate: dataset.alternate,
      opacidad: capa.opacidad,
      posicion: capa.posicion,
      visible: capa.visible,
    });
  }
  // console.log(recursos);

  return recursos;
}

onMounted(async () => {
  if (hash) obtenerVistaDelMapa();

  if (query && query.capas) {
    const capas = obtenerCapas();
    capas_consultadas.value = await consultarCapas(capas);
  }
});
</script>

<template>
  <div class="contenedor-ifrme grid">
    <div class="mapa columna-11">
      <ClientOnly>
        <SisdaiMapa class="gema" :vista="vistaDelMapa">
          <SisdaiCapaXyz :posicion="0" />

          <SisdaiCapaWms
            v-for="capa in capas_consultadas"
            :key="`wms-${capa.pk}-${capa.posicion}-${capa.estilo}`"
            :capa="capa.alternate"
            :consulta="gnoxyFetch"
            :estilo="capa.estilo"
            :fuente="`${config.public.geoserverUrl}/ows`"
            :mosaicos="true"
            :opacidad="capa.opacidad"
            :posicion="capa.posicion + 1"
            :visible="capa.visible"
          />
          <!-- 
            :fuente="findServer(resource)"
            :lado="storeSelected.byPk(resource.pk).lado"
            :cuadro-informativo="
              (url) =>
                buildLayerInfo(url, getLayerName(resource), resource.title, resource.sourcetype)
            "
          -->
        </SisdaiMapa>
      </ClientOnly>

      <!-- <p>mapa</p> -->
    </div>
    <div class="leyendas columna-5">
      <p>leyendas</p>

      <!-- <code>{{ vistaDelMapa }}</code> -->
      <code>
        {{ capas_consultadas }}
      </code>
    </div>
  </div>
</template>

<style lang="scss">
.contenedor-ifrme {
  background-color: blanchedalmond;
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: 99999;
  gap: 0;

  .mapa {
    background-color: cadetblue;
  }
  .leyendas {
    background-color: cornflowerblue;
  }
}
</style>
