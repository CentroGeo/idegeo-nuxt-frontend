<script setup>
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';

const props = defineProps({
  indicador: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['guardado', 'cerrar']);

const { data: userData } = useAuth();
const { actualizarIndicador } = useTableroApi();

const modal = ref(null);
const guardando = ref(false);
const error = ref('');

const TIPOS_GRAFICA = [
  { value: 'bar', label: 'Barras' },
  { value: 'donut', label: 'Dona (categórico)' },
  { value: 'histogram', label: 'Histograma' },
];

const PALETAS = [
  { value: 'azules_3', label: 'Azules' },
  { value: 'cafes', label: 'Cafés' },
  { value: 'morados', label: 'Morados' },
  { value: 'verdes_2', label: 'Verdes' },
  { value: 'naranjas', label: 'Naranjas' },
  { value: 'rosas', label: 'Rosas' },
  { value: 'varios', label: 'Multicolor' },
  { value: 'semaforo', label: 'Semáforo' },
  { value: 'semaforo_3', label: 'Semáforo 3 tonos' },
];

const formulario = reactive({
  name: '',
  info_text: '',
  plot_type: 'bar',
  colors: 'azules_3',
});

onMounted(async () => {
  formulario.name = props.indicador.name || '';
  formulario.info_text = props.indicador.info_text || '';
  formulario.plot_type = props.indicador.plot_type || 'bar';
  formulario.colors = props.indicador.colors || 'azules_3';
  await nextTick();
  modal.value?.abrirModal();
});

async function guardar() {
  error.value = '';
  guardando.value = true;
  try {
    const token = userData.value?.accessToken;
    const data = await actualizarIndicador(props.indicador.id, formulario, token);
    if (data?.id) {
      emit('guardado', data);
      modal.value?.cerrarModal();
    } else {
      error.value = data?.detail || JSON.stringify(data);
    }
  } catch (e) {
    error.value = e?.message || 'Error al guardar';
  } finally {
    guardando.value = false;
  }
}
</script>

<template>
  <ClientOnly>
    <SisdaiModal ref="modal" @cerrar="emit('cerrar')">
      <template #encabezado>
        <h2>Editar indicador</h2>
      </template>

      <template #cuerpo>
        <form @submit.prevent="guardar">
          <div class="m-b-2">
            <label for="ind-nombre">Nombre del indicador</label>
            <input id="ind-nombre" v-model="formulario.name" type="text" required />
          </div>

          <div class="m-b-2">
            <label for="ind-info">Texto descriptivo</label>
            <textarea
              id="ind-info"
              v-model="formulario.info_text"
              rows="3"
              placeholder="Descripción del indicador, metodología, fuente..."
            />
          </div>

          <div class="m-b-2">
            <label for="ind-tipo">Tipo de gráfica</label>
            <select id="ind-tipo" v-model="formulario.plot_type">
              <option v-for="t in TIPOS_GRAFICA" :key="t.value" :value="t.value">
                {{ t.label }}
              </option>
            </select>
          </div>

          <div class="m-b-3">
            <label for="ind-paleta">Paleta de colores</label>
            <select id="ind-paleta" v-model="formulario.colors">
              <option v-for="p in PALETAS" :key="p.value" :value="p.value">
                {{ p.label }}
              </option>
            </select>
          </div>

          <p v-if="error" class="color-error">{{ error }}</p>

          <div class="flex flex-contenido-separado">
            <button type="button" class="boton boton-secundario" @click="emit('cerrar')">
              Cancelar
            </button>
            <input
              type="submit"
              class="boton boton-primario"
              :value="guardando ? 'Guardando...' : 'Guardar'"
              :disabled="guardando"
            />
          </div>
        </form>
      </template>
    </SisdaiModal>
  </ClientOnly>
</template>
