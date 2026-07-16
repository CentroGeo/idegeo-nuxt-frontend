<script setup>
const store = useLandingBuilderStore();

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

const tamanosTitulo = {
  pequeno: '1.5rem',
  mediano: '2rem',
  grande: '2.5rem',
  'extra-grande': '3rem',
};

const tamanosParrafo = {
  pequeno: '0.875rem',
  normal: '1rem',
  mediano: '1.125rem',
  grande: '1.25rem',
};

function obtenerEstilosTitulo(bloque) {
  const datos = bloque.datos || {};
  const tamano = datos.tamano || 'grande';

  return {
    textAlign: datos.alineacion || 'left',
    color: datos.color || '#FFFFFF',
    fontWeight: datos.negrita ? 700 : 400,
    fontSize: tamanosTitulo[tamano] || tamanosTitulo.grande,
  };
}

function obtenerEstilosParrafo(bloque) {
  const datos = bloque.datos || {};
  const tamano = datos.tamano || 'normal';

  return {
    textAlign: datos.alineacion || 'left',
    color: datos.color || '#FFFFFF',
    fontWeight: datos.negrita ? 700 : 400,
    fontSize: tamanosParrafo[tamano] || tamanosParrafo.normal,
  };
}

function obtenerLineasParrafo(bloque) {
  return String(bloque.datos?.texto ?? '')
    .replace(/\r/g, '')
    .split('\n');
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
          <source :src="store.resolverUrlImagen(bloque.datos.fondo.url)" type="video/mp4" />
        </video>

        <img
          v-else
          class="visor-portada__media"
          :src="store.resolverUrlImagen(bloque.datos.fondo?.url)"
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

      <section
        v-else-if="bloque.tipo === 'titulo'"
        class="visor-titulo contenedor ancho-fijo m-y-6"
      >
        <h2 class="visor-titulo__contenido" :style="obtenerEstilosTitulo(bloque)">
          {{ bloque.datos?.texto }}
        </h2>
      </section>

      <section
        v-else-if="bloque.tipo === 'parrafo'"
        class="visor-parrafo contenedor ancho-fijo m-y-6"
      >
        <ul
          v-if="bloque.datos?.tipoLista === 'vinetas'"
          class="visor-parrafo__lista"
          :style="obtenerEstilosParrafo(bloque)"
        >
          <li
            v-for="(linea, indice) in obtenerLineasParrafo(bloque)"
            :key="`${bloque.id}-linea-${indice}`"
          >
            {{ linea }}
          </li>
        </ul>

        <p v-else class="visor-parrafo__contenido" :style="obtenerEstilosParrafo(bloque)">
          {{ bloque.datos?.texto }}
        </p>
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
.visor-titulo {
  &__contenido {
    margin: 0;
    line-height: 1.25;
    overflow-wrap: anywhere;
  }
}

.visor-parrafo {
  &__contenido,
  &__lista {
    margin: 0;
    line-height: 1.6;
    overflow-wrap: anywhere;
  }

  &__contenido {
    white-space: pre-wrap;
  }

  &__lista {
    padding-left: 1.75rem;

    li {
      min-height: 1.6em;
      padding-left: 0.2rem;
    }
  }
}

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
