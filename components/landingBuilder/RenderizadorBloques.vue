<script setup>
defineProps({
  bloques: {
    type: Array,
    default: () => [],
  },
});

function estiloFondoPortada(bloque) {
  const posicion = bloque.datos?.posicionFondo || { x: 50, y: 50 };
  return { objectPosition: `${posicion.x}% ${posicion.y}%` };
}
</script>

<template>
  <div class="renderizador-bloques">
    <template v-for="bloque in bloques" :key="bloque.id">
      <section v-if="bloque.tipo === 'portada'" class="visor-portada">
        <video
          v-if="bloque.datos.fondo?.tipo === 'video'"
          aria-hidden="true"
          role="presentation"
          class="visor-portada__media"
          :style="estiloFondoPortada(bloque)"
          autoplay
          loop
          muted
          playsinline
        >
          <source :src="bloque.datos.fondo.url" type="video/mp4" />
        </video>

        <img
          v-else
          class="visor-portada__media"
          :src="bloque.datos.fondo?.url"
          :style="estiloFondoPortada(bloque)"
          alt=""
        />

        <div class="visor-portada__degradado">
          <div class="visor-portada__contenido">
            <h1 :style="{ color: bloque.datos.colorTitulo }">{{ bloque.datos.titulo }}</h1>
            <p :style="{ color: bloque.datos.colorSubtitulo }">{{ bloque.datos.subtitulo }}</p>
          </div>
        </div>
      </section>

      <section v-else-if="bloque.tipo === 'texto'" class="visor-texto contenedor ancho-fijo m-y-6">
        <component
          :is="item.componente"
          v-for="item in bloque.datos.bloquesTexto"
          :key="item.id"
          :class="item.clase"
          :style="{ textAlign: item.alineacion, color: item.color }"
        >
          {{ item.texto }}
        </component>
      </section>

      <section v-else-if="bloque.tipo === 'carrusel'" class="m-y-6">
        <LandingBuilderCarruselVistaPrevia :diapositivas="bloque.datos.diapositivas" />
      </section>

      <LandingBuilderSeccionesTarjetasBloqueVisor
        v-else-if="bloque.tipo === 'tarjetas'"
        :datos="bloque.datos"
      />
    </template>
  </div>
</template>

<style scoped lang="scss">
.visor-portada {
  position: relative;
  min-height: clamp(320px, 52vh, 580px);
  overflow: hidden;

  &__media {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__degradado {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px 24px;
    background: linear-gradient(
      180deg,
      rgb(0 0 0 / 18%) 0%,
      rgb(0 0 0 / 38%) 55%,
      rgb(0 0 0 / 65%) 100%
    );
  }

  &__contenido {
    width: min(820px, 100%);
    color: white;
    text-align: center;

    h1 {
      margin: 0 0 16px;
    }

    p {
      max-width: 680px;
      margin: 0 auto;
      font-size: 1.125rem;
    }
  }
}

@media (max-width: 767px) {
  .visor-portada {
    min-height: 420px;

    &__degradado {
      padding: 72px 20px 24px;
    }

    &__contenido p {
      font-size: 1rem;
    }
  }
}
</style>
