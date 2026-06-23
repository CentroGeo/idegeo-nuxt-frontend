<script setup>
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';

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
        <div class="alineacion-izquierda ancho-lectura">
          <CatalogoBasicosMeta
            v-if="seccionActual === Direction.BASICO"
            :recurso="editedResource"
            :resource-pk="selectedPk"
            :resource-type="type"
            :is-modal="true"
            :is-preview="true"
          />
          <CatalogoUbicacionMeta
            v-else-if="seccionActual === Direction.ATRIBUTOS"
            :resource="editedResource"
            :resource-pk="selectedPk"
            :resource-type="type"
            :is-modal="true"
            :is-preview="true"
          />
          <CatalogoOpcionalesMeta
            v-else-if="seccionActual === Direction.OPCIONAL"
            :recurso="editedResource"
            :resource-pk="selectedPk"
            :resource-type="type"
            :is-modal="true"
            :is-preview="true"
          />
          <button
            class="boton-secundario boton-chico"
            aria-label="Ir a mis archivos"
            :disabled="seccionActual === Direction.BASICO"
            @click="seccionActual -= 1"
          >
            Regresar
          </button>
          <button
            aria-label="Siguiente"
            class="boton-primario boton-chico"
            :disabled="seccionActual === Direction.OPCIONAL"
            @click="seccionActual += 1"
          >
            Siguiente
          </button>
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
