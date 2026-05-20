<script setup>
const props = defineProps({
  mapa: {
    type: Object,
    required: true,
  },
});

const config = useRuntimeConfig();

const tipoEtiqueta = {
  regular: 'Mapa simple',
  swipe: 'Comparativo',
  dual: 'Dual',
};

const previewSrc = computed(() => props.mapa.preview || `${config.app.baseURL}img/icono_sigic.png`);

function abrirMapa() {
  navigateTo(`/mapas/${props.mapa.id}`);
}
</script>

<template>
  <div class="tarjeta columna-5 tarjeta-mapa">
    <div class="tarjeta-cuerpo">
      <div class="preview-contenedor">
        <img :src="previewSrc" :alt="`Vista previa de ${mapa.name}`" class="preview" />
        <span class="borde-redondeado-16 p-1 etiqueta-tipo">
          {{ tipoEtiqueta[mapa.map_type] || mapa.map_type }}
        </span>
      </div>

      <div class="tarjeta-titulo">
        <p class="m-0" style="font-weight: bold">{{ mapa.name }}</p>
      </div>

      <div class="meta flex">
        <span class="pictograma-persona" aria-hidden="true" />
        <span>{{ mapa.owner?.username || 'Anónimo' }}</span>
      </div>

      <UiNumeroElementos :numero="mapa.layers_count ?? 0" :etiqueta="'Capas'" />

      <button
        class="boton-primario flex flex-contenido-centrado"
        style="width: 100%; margin: 8px"
        @click="abrirMapa"
      >
        Abrir mapa
      </button>
    </div>
    <div class="tarjeta-pie columna-16"></div>
  </div>
</template>

<style lang="scss" scoped>
.tarjeta-mapa {
  display: flex;
  flex-direction: column;
}

.preview-contenedor {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 8px;
  background-color: var(--color-neutro-1);
}

.preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.etiqueta-tipo {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: var(--color-secundario-2);
  color: var(--color-primario-4);
  border: solid 1px var(--color-primario-4);
  font-size: 0.85rem;
}

.meta {
  gap: 8px;
  align-items: center;
  color: var(--campo-etiqueta-color);
  font-size: 0.9rem;
}

.flex {
  gap: 8px;
}
</style>
