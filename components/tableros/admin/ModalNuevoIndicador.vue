<script setup>
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';

const props = defineProps({
  siteId: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(['creado', 'cerrar']);

const { data: userData } = useAuth();
const { crearIndicador, fetchDatasets, fetchDatasetAttributes, syncDatasetAttributes } =
  useTableroApi();

const modal = ref(null);
const paso = ref(1);
const guardando = ref(false);
const error = ref('');

const formulario = reactive({
  name: '',
  info_text: '',
  layer: '',
  layer_id_field: '',
  field_one: '',
  field_two: '',
  plot_type: 'bar',
  category_method: 'quantile',
  field_category: 5,
  colors: 'Reds',
  use_single_field: true,
  is_histogram: false,
});

// Dataset search
const busquedaDataset = ref('');
const resultadosDataset = ref([]);
const buscandoDataset = ref(false);
const datasetSeleccionado = ref(null);
const atributosDataset = ref([]);
const cargandoAtributos = ref(false);
const errorAtributos = ref(false);
const sincronizandoAtributos = ref(false);
const errorSincronizacion = ref('');
const busquedaInputRef = ref(null);

const GEO_ATTRS = new Set(['the_geom', 'geometry', 'geom', 'wkb_geometry', 'shape']);

let busquedaTimeout = null;

function buscarDatasets() {
  if (busquedaDataset.value.length < 2) {
    resultadosDataset.value = [];
    return;
  }
  if (busquedaTimeout) clearTimeout(busquedaTimeout);
  busquedaTimeout = setTimeout(async () => {
    buscandoDataset.value = true;
    try {
      const data = await fetchDatasets(busquedaDataset.value);
      resultadosDataset.value = data?.datasets ?? data?.results ?? [];
    } catch {
      resultadosDataset.value = [];
    } finally {
      buscandoDataset.value = false;
    }
  }, 350);
}

async function cargarAtributos(pk) {
  cargandoAtributos.value = true;
  errorAtributos.value = false;
  try {
    const data = await fetchDatasetAttributes(pk);
    const attrs = data?.dataset?.attribute_set ?? data?.attribute_set ?? [];
    atributosDataset.value = attrs.filter((a) => !GEO_ATTRS.has(a.attribute));
  } catch {
    errorAtributos.value = true;
    atributosDataset.value = [];
  } finally {
    cargandoAtributos.value = false;
  }
}

function seleccionarDataset(ds) {
  datasetSeleccionado.value = ds;
  formulario.layer = ds.pk;
  formulario.name = formulario.name || ds.title;
  resultadosDataset.value = [];
  busquedaDataset.value = '';
  atributosDataset.value = [];
  cargarAtributos(ds.pk);
}

function limpiarDataset() {
  datasetSeleccionado.value = null;
  formulario.layer = '';
  formulario.layer_id_field = '';
  formulario.field_one = '';
  formulario.field_two = '';
  atributosDataset.value = [];
  errorSincronizacion.value = '';
}

async function sincronizarAtributos() {
  if (!datasetSeleccionado.value) return;
  sincronizandoAtributos.value = true;
  errorSincronizacion.value = '';
  try {
    const data = await syncDatasetAttributes(
      datasetSeleccionado.value.pk,
      userData.value?.accessToken
    );
    if (data?.attributes?.length) {
      atributosDataset.value = data.attributes.filter((a) => !GEO_ATTRS.has(a.attribute));
    } else if (data?.error === 'wfs_no_disponible') {
      errorSincronizacion.value =
        'El servicio WFS remoto no está disponible en este momento. ' +
        'Inténtalo más tarde o contacta al administrador del recurso.';
    } else {
      errorSincronizacion.value =
        data?.detail || 'No se encontraron atributos en el servicio remoto para esta capa.';
    }
  } catch {
    errorSincronizacion.value =
      'No se pudo conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.';
  } finally {
    sincronizandoAtributos.value = false;
  }
}

async function guardar() {
  error.value = '';
  guardando.value = true;
  try {
    const payload = {
      site: props.siteId,
      group: null,
      subgroup: null,
      name: formulario.name,
      info_text: formulario.info_text,
      layer: formulario.layer ? Number(formulario.layer) : null,
      layer_id_field: formulario.layer_id_field,
      field_one: formulario.field_one,
      field_two: formulario.field_two || '',
      plot_type: formulario.plot_type,
      category_method: formulario.category_method,
      field_category: formulario.field_category,
      colors: formulario.colors,
      use_single_field: formulario.use_single_field,
      is_histogram: formulario.is_histogram,
      stack_order: 1,
    };
    const data = await crearIndicador(payload, userData.value?.accessToken);
    if (data?.id) {
      emit('creado', data);
      modal.value?.cerrarModal();
    } else {
      error.value = data?.detail || JSON.stringify(data);
    }
  } catch (e) {
    error.value = e?.message || 'Error al crear indicador';
  } finally {
    guardando.value = false;
  }
}

function siguiente() {
  if (paso.value < 3) paso.value += 1;
  else guardar();
}

function anterior() {
  if (paso.value > 1) paso.value -= 1;
}

onMounted(() => {
  modal.value?.abrirModal();
});

watch(
  () => modal.value,
  (m) => {
    if (m) m.abrirModal();
  }
);
</script>

<template>
  <ClientOnly>
    <SisdaiModal ref="modal" @cerrar="emit('cerrar')">
      <template #encabezado>
        <h2>Nuevo indicador — Paso {{ paso }} de 3</h2>
      </template>

      <template #cuerpo>
        <form @submit.prevent="siguiente">
          <section v-show="paso === 1">
            <h3>Datos del indicador</h3>

            <div class="m-b-2">
              <label for="ind-name">Nombre del indicador</label>
              <input id="ind-name" v-model="formulario.name" type="text" required />
            </div>

            <div class="m-b-2">
              <label for="ind-info">Descripción</label>
              <textarea id="ind-info" v-model="formulario.info_text" rows="2" />
            </div>

            <!-- Dataset search -->
            <div class="m-b-2">
              <label>Capa de datos</label>
              <div v-if="datasetSeleccionado" class="dataset-seleccionado">
                <span>{{ datasetSeleccionado.title }}</span>
                <button
                  type="button"
                  class="boton boton-chico boton-secundario"
                  @click="limpiarDataset"
                >
                  Cambiar
                </button>
              </div>
              <div v-else class="dataset-buscador">
                <input
                  ref="busquedaInputRef"
                  v-model="busquedaDataset"
                  type="text"
                  placeholder="Escribe para buscar capa..."
                  autocomplete="off"
                  @input="buscarDatasets"
                  @keydown.enter.prevent
                  @keydown.stop
                  @keyup.stop
                  @keypress.stop
                />
                <p v-show="buscandoDataset" class="formulario-ayuda">Buscando...</p>
                <ul
                  v-show="!buscandoDataset && resultadosDataset.length > 0"
                  class="dataset-resultados"
                >
                  <li
                    v-for="ds in resultadosDataset"
                    :key="ds.pk"
                    @mousedown.prevent="seleccionarDataset(ds)"
                  >
                    {{ ds.title }}
                    <span class="formulario-ayuda">ID: {{ ds.pk }}</span>
                  </li>
                </ul>
                <p
                  v-show="
                    !buscandoDataset &&
                    resultadosDataset.length === 0 &&
                    busquedaDataset.length >= 2
                  "
                  class="formulario-ayuda"
                >
                  Sin resultados.
                </p>
              </div>
            </div>

            <!-- Field pickers (available once a dataset is selected) -->
            <template v-if="datasetSeleccionado">
              <p v-if="errorAtributos" class="formulario-ayuda color-error">
                No se pudieron cargar los campos del dataset.
              </p>

              <div
                v-if="!cargandoAtributos && !errorAtributos && atributosDataset.length === 0"
                class="sin-atributos-aviso"
              >
                <p class="formulario-ayuda">
                  Este recurso no tiene atributos registrados. Puedes sincronizarlos directamente
                  desde el servicio de origen.
                </p>
                <button
                  type="button"
                  class="boton boton-secundario boton-chico"
                  :disabled="sincronizandoAtributos"
                  @click="sincronizarAtributos"
                >
                  {{ sincronizandoAtributos ? 'Sincronizando...' : 'Sincronizar atributos' }}
                </button>
                <p v-if="errorSincronizacion" class="formulario-ayuda color-error m-t-1">
                  {{ errorSincronizacion }}
                </p>
              </div>

              <div class="m-b-2">
                <label for="ind-field-id">Campo ID de la geometría</label>
                <select
                  id="ind-field-id"
                  v-model="formulario.layer_id_field"
                  :disabled="cargandoAtributos || !atributosDataset.length"
                  required
                >
                  <option value="" disabled>
                    {{
                      cargandoAtributos
                        ? 'Cargando campos...'
                        : !atributosDataset.length
                          ? 'Sin atributos disponibles'
                          : 'Selecciona un campo'
                    }}
                  </option>
                  <option v-for="a in atributosDataset" :key="a.attribute" :value="a.attribute">
                    {{ a.attribute }}
                  </option>
                </select>
              </div>

              <div class="m-b-2">
                <label for="ind-field-one">Campo principal a visualizar</label>
                <select
                  id="ind-field-one"
                  v-model="formulario.field_one"
                  :disabled="cargandoAtributos || !atributosDataset.length"
                  required
                >
                  <option value="" disabled>
                    {{
                      cargandoAtributos
                        ? 'Cargando campos...'
                        : !atributosDataset.length
                          ? 'Sin atributos disponibles'
                          : 'Selecciona un campo'
                    }}
                  </option>
                  <option v-for="a in atributosDataset" :key="a.attribute" :value="a.attribute">
                    {{ a.attribute }} ({{ a.attribute_type }})
                  </option>
                </select>
              </div>

              <div class="m-b-2">
                <label for="ind-field-two">Campo secundario (opcional)</label>
                <select
                  id="ind-field-two"
                  v-model="formulario.field_two"
                  :disabled="cargandoAtributos || !atributosDataset.length"
                >
                  <option value="">— ninguno —</option>
                  <option v-for="a in atributosDataset" :key="a.attribute" :value="a.attribute">
                    {{ a.attribute }} ({{ a.attribute_type }})
                  </option>
                </select>
              </div>
            </template>
          </section>

          <section v-show="paso === 2">
            <h3>Tematización</h3>

            <div class="m-b-2">
              <label for="ind-method">Método de clasificación</label>
              <select id="ind-method" v-model="formulario.category_method">
                <option value="quantile">Cuantiles</option>
                <option value="jenks">Jenks (natural breaks)</option>
                <option value="equal">Intervalos iguales</option>
                <option value="manual">Manual</option>
              </select>
            </div>

            <div class="m-b-2">
              <label for="ind-categories">Número de clases</label>
              <input
                id="ind-categories"
                v-model.number="formulario.field_category"
                type="number"
                min="2"
                max="10"
              />
            </div>

            <div class="m-b-2">
              <label for="ind-colors">Rampa de color</label>
              <select id="ind-colors" v-model="formulario.colors">
                <option value="Reds">Rojos</option>
                <option value="Blues">Azules</option>
                <option value="Greens">Verdes</option>
                <option value="Oranges">Naranjas</option>
                <option value="Purples">Morados</option>
                <option value="Greys">Grises</option>
                <option value="YlOrRd">Amarillo → Rojo</option>
                <option value="BuPu">Azul → Morado</option>
              </select>
            </div>

            <div class="m-b-2">
              <label for="ind-plot-type">Tipo de gráfica</label>
              <select id="ind-plot-type" v-model="formulario.plot_type">
                <option value="bar">Barras</option>
                <option value="histogram">Histograma</option>
              </select>
            </div>
          </section>

          <section v-show="paso === 3">
            <h3>Confirmar</h3>
            <p>
              Se creará el indicador con los parámetros definidos. Los datos de gráfica y mapa
              podrán reconstruirse después desde la edición del indicador.
            </p>

            <ul>
              <li><b>Nombre:</b> {{ formulario.name }}</li>
              <li><b>Capa:</b> {{ datasetSeleccionado?.title || formulario.layer }}</li>
              <li><b>Campo ID:</b> {{ formulario.layer_id_field }}</li>
              <li><b>Campo 1:</b> {{ formulario.field_one }}</li>
              <li><b>Método:</b> {{ formulario.category_method }}</li>
              <li><b>Clases:</b> {{ formulario.field_category }}</li>
              <li><b>Colores:</b> {{ formulario.colors }}</li>
            </ul>
          </section>

          <p v-if="error" class="color-error">{{ error }}</p>

          <div class="flex flex-contenido-separado">
            <div>
              <button
                v-if="paso > 1"
                type="button"
                class="boton boton-secundario"
                @click="anterior"
              >
                Atrás
              </button>
              <button type="button" class="boton boton-secundario" @click="emit('cerrar')">
                Cancelar
              </button>
            </div>

            <input
              type="submit"
              class="boton boton-primario"
              :value="paso < 3 ? 'Siguiente' : guardando ? 'Guardando...' : 'Crear indicador'"
              :disabled="guardando"
            />
          </div>
        </form>
      </template>
    </SisdaiModal>
  </ClientOnly>
</template>

<style lang="scss" scoped>
.dataset-seleccionado {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 6px 10px;
  border: 1px solid var(--color-borde, #ccc);
  border-radius: 4px;
  background: var(--color-fondo-2, #f5f5f5);
}

.dataset-buscador {
  position: relative;

  input {
    width: 100%;
  }
}

.sin-atributos-aviso {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 10px 12px;
  border: 1px dashed var(--color-borde, #ccc);
  border-radius: 4px;
  background: var(--color-fondo-2, #f5f5f5);
  margin-bottom: 1rem;
}

.dataset-resultados {
  position: absolute;
  z-index: 100;
  left: 0;
  right: 0;
  top: calc(100% + 2px);
  list-style: none;
  padding: 0;
  margin: 0;
  background: #fff;
  border: 1px solid var(--color-borde, #ccc);
  border-radius: 4px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
  max-height: 220px;
  overflow-y: auto;

  li {
    padding: 8px 12px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 2px;

    &:hover {
      background: var(--color-primario-suave, #f0e4e8);
    }
  }
}
</style>
