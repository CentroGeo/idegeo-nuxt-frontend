<script setup>
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';

const props = defineProps({
  selectedElement: {
    type: Object,
    default: () => ({}),
  },
});
const { selectedElement } = toRefs(props);
const modalMetadatos = ref(null);

function abrirModalMetadatos() {
  modalMetadatos.value?.abrirModal();
}

function filtrarMetadatos(resource) {
  return {
    titulo: resource.title,
    resumen: resource.abstract,
    tipo_de_fecha: resource.date_type,
    fecha: resource.date,
    categoria: resource.category,
    palabras_claves: resource.keywords,
    lenguaje: resource.language,
    licencia: resource.license,
    autores_o_institucion: resource.attribution,
    calidad_de_datos: resource.data_quality_statement,
    restricciones: resource.restrictions,
    otras_restricciones: resource.constraints_other,
    edicion: resource.edition,
    doi: resource.doi,
    proposito: resource.purpose,
    informacion_adicional: resource.supplemental_information,
    frencuencia_de_actualizacion: resource.maintenance_frequency,
  };
}

defineExpose({
  abrirModalMetadatos,
});
</script>

<template>
  <ClientOnly>
    <SisdaiModal ref="modalMetadatos" tamanio-modal="modal-grande">
      <template #encabezado>
        <h1 class="m-t-0">Metadatos</h1>
      </template>

      <template #cuerpo>
        <!-- {{ filtrarMetadatos(selectedElement) }} -->
        <div v-for="(valor, attributo) in filtrarMetadatos(selectedElement)" :key="attributo">
          <div v-if="valor" class="m-b-2 columna-16">
            <label class="m-0">{{ attributo }}</label>
            <p class="m-0">
              {{ valor }}
            </p>
          </div>
        </div>
      </template>

      <template #pie>
        <!-- <button type="button" class="boton-primario" value="acepta" @click="DescargarMapa"> -->
        <!--   Descargar -->
        <!-- </button> -->
      </template>
    </SisdaiModal>
  </ClientOnly>
</template>

<style lang="scss" scoped>
.contenedor {
  margin: 0px;
  padding: 8px;
  align-items: center;
}

.tarjeta {
  background-color: var(--color-neutro-0);
  border: 1px solid var(--color-secundario-8);
}
</style>
