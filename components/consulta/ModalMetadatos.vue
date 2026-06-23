<script setup>
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';
const props = defineProps({
  resourceType: {
    type: String,
    default: '',
  },
  selectedElement: {
    type: Object,
    default: () => ({}),
  },
});

const modalMetadatos = ref(null);
const Direction = {
  BASICO: 0,
  ATRIBUTOS: 1,
  OPCIONAL: 2,
};
const seccionActual = ref(0);

function abrirModalMetadatos() {
  modalMetadatos.value?.abrirModal();
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
        <div class="contenedor alineacion-izquierda ancho-lectura">
          <CatalogoBasicosMeta
            v-if="seccionActual === Direction.BASICO"
            :recurso="props.selectedElement"
            :resource-pk="props.selectedElement.pk"
            :resource-type="resourceType"
            :is-modal="true"
            :is-preview="true"
          />
          <CatalogoUbicacionMeta
            v-else-if="seccionActual === Direction.ATRIBUTOS"
            :resource="props.selectedElement"
            :resource-pk="props.selectedElement.pk"
            :resource-type="resourceType"
            :is-modal="true"
            :is-preview="true"
          />
          <CatalogoOpcionalesMeta
            v-else-if="seccionActual === Direction.OPCIONAL"
            :recurso="props.selectedElement"
            :resource-pk="props.selectedElement.pk"
            :resource-type="resourceType"
            :is-modal="true"
            :is-preview="true"
          />
        </div>
        <button
          class="boton-secundario boton-chico separacion"
          aria-label="Ir a mis archivos"
          :disabled="seccionActual === Direction.BASICO"
          @click="seccionActual -= 1"
        >
          Regresar
        </button>
        <button
          aria-label="Siguiente"
          class="boton-primario boton-chico separacion"
          :disabled="seccionActual === Direction.OPCIONAL"
          @click="seccionActual += 1"
        >
          Siguiente
        </button>
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
  padding: 16px;
  align-items: center;
}

.separacion {
  margin: 16px;
  padding: 16px;
  font-size: 16px;
}
</style>
