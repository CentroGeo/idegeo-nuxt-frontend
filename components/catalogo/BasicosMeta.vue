<script setup>
import SisdaiCampoBase from '@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue';
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';
import { OGC_CATEGORY_IDENTIFIERS, SIGIC_CATEGORY_IDENTIFIERS } from '~/utils/consulta';

const props = defineProps({
  recurso: {
    type: Object,
    default: () => ({}),
  },
  resourcePk: {
    type: String,
    default: '',
  },
  resourceType: {
    type: String,
    default: '',
  },
  isModal: {
    type: Boolean,
    default: false,
  },
  isPreview: {
    type: Boolean,
    default: false,
  },
});

const storeMetadatos = useEditedMetadataStore();
storeMetadatos.checkFilling(props.resourcePk, props.resourceType);
const { data } = useAuth();
const config = useRuntimeConfig();

const campoTitulo = computed({
  get: () => storeMetadatos.metadata.title,
  set: (value) => storeMetadatos.updateAttr('title', value),
});
const campoResumen = computed({
  get: () => storeMetadatos.metadata.abstract,
  set: (value) => storeMetadatos.updateAttr('abstract', value),
});
const campoFecha = computed({
  get: () => storeMetadatos.metadata.date,
  set: (value) => storeMetadatos.updateAttr('date', value),
});
const campoTipoFecha = computed({
  get: () => storeMetadatos.metadata.date_type,
  set: (value) => storeMetadatos.updateAttr('date_type', value),
});
const campoPalabrasClave = computed({
  get: () => storeMetadatos.metadata.keywords,
  set: (value) => storeMetadatos.updateAttr('keywords', value),
});

// ── Categorías ──────────────────────────────────────────────────────────────

const dictCategoriaOGC = [
  { farming: 'Agricultura' },
  { inlandWaters: 'Aguas Continentales' },
  { biota: 'Biota' },
  { climatologyMeteorologyAtmosphere: 'Climatología, Meteorología y Atmósfera' },
  { economy: 'Economía' },
  { elevation: 'Elevación' },
  { structure: 'Estructura' },
  { boundaries: 'Fronteras' },
  { geoscientificInformation: 'Información Geocientífica' },
  { intelligenceMilitary: 'Inteligencia Militar' },
  { imageryBaseMapsEarthCover: 'Mapas Base y Cobertura Terrestre' },
  { environment: 'Medio Ambiente' },
  { oceans: 'Océanos' },
  { planningCadastre: 'Planeación Catastral' },
  { population: 'Población' },
  { health: 'Salud' },
  { utilitiesCommunication: 'Servicios Públicos y Comunicación' },
  { society: 'Sociedad' },
  { transportation: 'Transporte' },
  { location: 'Ubicación' },
];

const dictCategoriaSIGIC = [
  { medioAmbienteRecursosNaturales: 'Medio ambiente y recursos naturales' },
  { infraestructuraServiciosUrbanosRegionales: 'Infraestructura y servicios urbanos regionales' },
  { territorioLimitesCatastro: 'Territorio, límites y catastro' },
  { sociedadDemografiaEconomia: 'Sociedad, demografía y economía' },
  { sensoresRemotosMapasBase: 'Sensores remotos y mapas base' },
];

// Categorías sincronizadas con el store
const categoriaOGC = computed({
  get: () => storeMetadatos.metadata.categoriaOGC || '',
  set: (val) => {
    storeMetadatos.updateAttr('categoriaOGC', val);
    if (val && tipoCategoria.value === 'ogc') storeMetadatos.updateAttr('category', val);
  },
});

const categoriaSIGIC = computed({
  get: () => storeMetadatos.metadata.categoriaSIGIC || '',
  set: (val) => {
    storeMetadatos.updateAttr('categoriaSIGIC', val);
    if (val && tipoCategoria.value === 'sigic') storeMetadatos.updateAttr('category', val);
  },
});

const tipoCategoria = computed({
  get: () => {
    if (storeMetadatos.metadata.category) {
      if (OGC_CATEGORY_IDENTIFIERS.has(storeMetadatos.metadata.category)) return 'ogc';
      if (SIGIC_CATEGORY_IDENTIFIERS.has(storeMetadatos.metadata.category)) return 'sigic';
    }
    return '';
  },
  set: (val) => {
    if (val === 'ogc' && categoriaOGC.value)
      storeMetadatos.updateAttr('category', categoriaOGC.value);
    else if (val === 'sigic' && categoriaSIGIC.value)
      storeMetadatos.updateAttr('category', categoriaSIGIC.value);
    else storeMetadatos.updateAttr('category', '');
  },
});

// ── Imagen ───────────────────────────────────────────────────────────────────

const dragNdDrop = ref(null);
const img_files = ['.jpg', '.jpeg', '.png', '.webp'];
async function guardarImagen(files) {
  const token = ref(data.value?.accessToken);
  if (img_files.map((end) => files[0]?.name.endsWith(end)).includes(true)) {
    const formData = new FormData();
    formData.append('file', files[0]);
    formData.append('token', token.value);
    formData.append('pk', props.resourcePk);
    const response = await fetch(`${config.app.baseURL}api/metadatos-thumbnail`, {
      method: 'PUT',
      body: formData,
    });
    console.warn(await response.json());
  } else {
    dragNdDrop.value?.archivoNoValido();
  }
}
</script>

<template>
  <div>
    <CatalogoHeaderMetadatos
      :resource="props.recurso"
      :title="'Metadatos básicos'"
      :exclude-links="props.isModal"
      :is-preview="isPreview"
      ,
    />
    <p class="m-t-2 m-b-0">* Campos obligatorios</p>

    <div v-if="!props.isModal">
      <p class="texto-peso-600">
        Miniatura imagen no mayor a 9kb tamaño 120x120px. Archivos Png o JPG
      </p>
      <ClientOnly>
        <CatalogoElementoDragNdDrop ref="dragNdDrop" @pasar-archivo="(i) => guardarImagen(i)" />
      </ClientOnly>
    </div>

    <!-- Formulario -->
    <div class="m-t-3">
      <div class="flex" style="gap: 0 24px">
        <div class="columna-16">
          <ClientOnly>
            <SisdaiCampoBase
              v-model="campoTitulo"
              etiqueta="Título*"
              ejemplo="Añade un nombre"
              tipo="text"
              :es_etiqueta_visible="true"
            />
            <SisdaiCampoBase
              v-model="campoResumen"
              class="m-y-3"
              etiqueta="Resumen"
              ejemplo="El texto descriptivo es conciso y significativo. Debe ayudar a la persona usuaria a..."
              tipo="text"
              :es_etiqueta_visible="true"
            />
          </ClientOnly>
        </div>

        <div class="columna-8">
          <ClientOnly>
            <SisdaiSelector
              v-model="campoTipoFecha"
              etiqueta="Tipo de fecha*"
              texto_ayuda="Creación, publicación o revisión."
            >
              <option value="creation">Creación</option>
              <option value="publication">Publicación</option>
              <option value="revision">Revisón</option>
            </SisdaiSelector>
          </ClientOnly>
        </div>

        <div class="columna-8">
          <ClientOnly>
            <SisdaiCampoBase
              v-model="campoFecha"
              etiqueta="Fecha*"
              ejemplo="tipo date"
              tipo="date"
              texto_ayuda="aaaa-mm-dd"
            />
          </ClientOnly>
        </div>

        <div class="columna-16">
          <ClientOnly>
            <!-- Selector 1: Categoría OGC -->
            <SisdaiSelector v-model="categoriaOGC" etiqueta="Categoría OGC *">
              <option value="">Selecciona una categoría OGC</option>
              <option
                v-for="value in dictCategoriaOGC"
                :key="Object.keys(value)[0]"
                :value="Object.keys(value)[0]"
              >
                {{ value[Object.keys(value)[0]] }}
              </option>
            </SisdaiSelector>

            <!-- Selector 2: Categoría SIGIC -->
            <SisdaiSelector v-model="categoriaSIGIC" class="m-t-3" etiqueta="Categoría SIGIC *">
              <option value="">Selecciona una categoría SIGIC</option>
              <option
                v-for="value in dictCategoriaSIGIC"
                :key="Object.keys(value)[0]"
                :value="Object.keys(value)[0]"
              >
                {{ value[Object.keys(value)[0]] }}
              </option>
            </SisdaiSelector>

            <!-- Selector 3: tipo de visualización -->
            <SisdaiSelector
              v-model="tipoCategoria"
              class="m-t-3"
              etiqueta="¿Qué categoría deseas que se visualice?*"
            >
              <option value="">Selecciona una opción</option>
              <option value="ogc" :disabled="!categoriaOGC">Categoría OGC</option>
              <option value="sigic" :disabled="!categoriaSIGIC">Categoría SIGIC</option>
            </SisdaiSelector>

            <SisdaiCampoBase
              v-model="campoPalabrasClave"
              class="m-t-3"
              etiqueta="Palabras clave *"
              ejemplo="Agua, educación, conservación..."
            />
          </ClientOnly>
        </div>
      </div>

      <CatalogoBotonesMetadatos
        v-if="!props.isModal"
        :key="`1-${props.resourcePk}-buttons`"
        class="m-t-2"
        :resource="props.recurso"
        :title="'MetadatosBasicos'"
        :pk="props.resourcePk"
        :tipo="props.resourceType"
      />
    </div>
  </div>
</template>
