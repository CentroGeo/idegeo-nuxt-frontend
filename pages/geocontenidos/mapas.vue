<script setup>
import { useMapasCapasAdapter } from '~/composables/capas/useMapasCapasAdapter';

const route = useRoute();
const mapasStore = useMapasStore();

const idActual = computed(() => route.params.id ?? null);
const enDetalleMapa = computed(() => !!idActual.value);
const enVisualizar = computed(() => route.path.endsWith('/visualizar'));
const enEmbed = computed(() => route.path.endsWith('/embed'));
const enChromeOculto = computed(() => enVisualizar.value || enEmbed.value);

// Modal de capas (componente compartido components/capas/CapasModalAgregar).
const adaptadorCapas = useMapasCapasAdapter(
  computed(() => Number(idActual.value)),
  computed(() => mapasStore.activeMap?.map_type)
);
const tieneLados = computed(() => ['swipe', 'dual'].includes(mapasStore.activeMap?.map_type));
const opcionesCapas = computed(() => ({
  contexto: 'mapa',
  titulo: 'Agregar capas',
  mostrarOpacidad: false,
  mostrarEstilo: true,
  permitirDuplicados: false,
  posiciones: tieneLados.value
    ? [
        { value: 'left', label: 'Izquierdo' },
        { value: 'right', label: 'Derecho' },
      ]
    : null,
}));
const abiertoCapas = computed({
  get: () => mapasStore.modalAgregarCapasAbierto,
  set: (v) => (v ? mapasStore.abrirModalAgregarCapas() : mapasStore.cerrarModalAgregarCapas()),
});
</script>

<template>
  <NuxtPage v-if="enChromeOculto" />
  <div v-else class="modulo-mapas-geocontenidos">
    <NuxtPage />
    <CapasModalAgregar
      v-if="enDetalleMapa && mapasStore.activeMap"
      v-model:abierto="abiertoCapas"
      :adaptador="adaptadorCapas"
      :opciones="opcionesCapas"
    />
  </div>
</template>

<style lang="scss" scoped>
.modulo-mapas-geocontenidos {
  height: 100%;
  overflow-y: hidden;
}
</style>
