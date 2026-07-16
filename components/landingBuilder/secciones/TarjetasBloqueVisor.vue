<script setup>
const store = useLandingBuilderStore();

defineProps({
  datos: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <section class="visor-tarjetas contenedor ancho-fijo m-y-10">
    <div class="flex">
      <div
        v-for="tarjeta in datos.tarjetas"
        :key="tarjeta.id"
        class="m-b-4"
        :class="datos.disposicion === 'horizontal' ? 'columna-8' : 'columna-5'"
      >
        <div
          class="tarjeta visor-tarjeta"
          :class="'visor-tarjeta-orientacion-' + (tarjeta.orientacion || 'vertical-abajo')"
        >
          <div class="visor-tarjeta-imagen-wrapper">
            <img
              :src="store.resolverUrlImagen(tarjeta.imagenUrl)"
              class="visor-tarjeta-imagen"
              alt=""
            />
          </div>

          <div class="visor-tarjeta-cuerpo">
            <component
              :is="tarjeta.tituloTipo || 'h2'"
              class="visor-tarjeta-titulo"
              :class="{
                'visor-tarjeta-titulo-h1': (tarjeta.tituloTipo || 'h2') === 'h2',
                'visor-tarjeta-titulo-h2': tarjeta.tituloTipo === 'h3',
                'visor-tarjeta-titulo-p': tarjeta.tituloTipo === 'p',
              }"
              :style="{
                textAlign: tarjeta.tituloAlineacion || 'left',
                color: tarjeta.tituloColor || 'inherit',
              }"
            >
              {{ tarjeta.titulo }}
            </component>

            <component
              :is="tarjeta.descripcionTipo || 'p'"
              class="visor-tarjeta-descripcion"
              :class="{
                'visor-tarjeta-desc-h1': tarjeta.descripcionTipo === 'h2',
                'visor-tarjeta-desc-h2': tarjeta.descripcionTipo === 'h3',
                'visor-tarjeta-desc-p': (tarjeta.descripcionTipo || 'p') === 'p',
              }"
              :style="{
                textAlign: tarjeta.descripcionAlineacion || 'left',
                color: tarjeta.descripcionColor || 'inherit',
              }"
            >
              {{ tarjeta.descripcion }}
            </component>

            <div v-if="tarjeta.botonTexto" class="visor-tarjeta-pie flex flex-contenido-centrado">
              <NuxtLink
                :to="tarjeta.botonUrl || '#'"
                target="_blank"
                rel="noopener noreferrer"
                class="boton-primario boton-chico"
              >
                {{ tarjeta.botonTexto }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.visor-tarjeta {
  display: flex;
  height: 100%;
  min-height: 180px;
  overflow: hidden;
}

.visor-tarjeta-imagen-wrapper {
  position: relative;
  flex-shrink: 0;
  overflow: hidden;
  background: var(--color-neutro-2, #e0e0e0);
}

.visor-tarjeta-imagen {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.visor-tarjeta-cuerpo {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  padding: 12px;
}

.visor-tarjeta-titulo,
.visor-tarjeta-descripcion {
  margin: 0;
}

.visor-tarjeta-titulo-h1 {
  font-size: 1.75rem;
  font-weight: 700;
}

.visor-tarjeta-titulo-h2 {
  font-size: 1.375rem;
  font-weight: 700;
}

.visor-tarjeta-titulo-p {
  font-size: 0.875rem;
  font-weight: 400;
}

.visor-tarjeta-desc-h1 {
  font-size: 1.75rem;
  font-weight: 700;
}

.visor-tarjeta-desc-h2 {
  font-size: 1.375rem;
  font-weight: 700;
}

.visor-tarjeta-desc-p {
  font-size: 0.875rem;
  font-weight: 400;
}

.visor-tarjeta-pie {
  padding-top: 8px;
  border-top: 1px dashed var(--color-neutro-2, #e0e0e0);
}

.visor-tarjeta-orientacion-vertical-abajo {
  flex-direction: column;

  .visor-tarjeta-imagen-wrapper {
    width: 100%;
    height: 160px;
  }
}

.visor-tarjeta-orientacion-vertical-arriba {
  flex-direction: column-reverse;

  .visor-tarjeta-imagen-wrapper {
    width: 100%;
    height: 160px;
  }
}

.visor-tarjeta-orientacion-horizontal-derecha {
  flex-direction: row;
  align-items: stretch;

  .visor-tarjeta-imagen-wrapper {
    width: 200px;
    min-width: 200px;
    height: auto;
  }
}

.visor-tarjeta-orientacion-horizontal-izquierda {
  flex-direction: row-reverse;
  align-items: stretch;

  .visor-tarjeta-imagen-wrapper {
    width: 200px;
    min-width: 200px;
    height: auto;
  }
}
</style>
