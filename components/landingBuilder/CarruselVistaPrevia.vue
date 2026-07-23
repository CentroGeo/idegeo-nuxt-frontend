<script setup>
import { Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const store = useLandingBuilderStore();

defineProps({
  diapositivas: {
    type: Array,
    default: () => [],
  },
});

const modulosSwiper = [Navigation, Pagination];
</script>

<template>
  <div class="carrusel-vista-previa">
    <p v-if="!diapositivas.length" class="carrusel-vista-previa__vacio texto-color-secundario">
      Agrega al menos una diapositiva para ver la vista previa.
    </p>

    <ClientOnly v-else>
      <Swiper
        :modules="modulosSwiper"
        :slides-per-view="1"
        :space-between="16"
        navigation
        :pagination="{ clickable: true }"
        class="carrusel-vista-previa__swiper"
      >
        <SwiperSlide v-for="diapositiva in diapositivas" :key="diapositiva.id">
          <figure class="carrusel-vista-previa__diapositiva">
            <img
              v-if="diapositiva.imagenUrl"
              class="carrusel-vista-previa__imagen"
              :src="store.resolverUrlImagen(diapositiva.imagenUrl)"
              :alt="diapositiva.texto || 'Diapositiva del carrusel'"
            />
            <div v-else class="carrusel-vista-previa__imagen-vacia" aria-hidden="true" />

            <figcaption v-if="diapositiva.texto" class="carrusel-vista-previa__texto">
              {{ diapositiva.texto }}
            </figcaption>
          </figure>
        </SwiperSlide>
      </Swiper>
    </ClientOnly>
  </div>
</template>

<style scoped lang="scss">
.carrusel-vista-previa {
  width: 100%;
  max-width: 960px;
  margin-inline: auto;

  &__vacio {
    display: flex;
    min-height: 220px;
    align-items: center;
    justify-content: center;
    border: 1px dashed rgb(255 255 255 / 25%);
    border-radius: 12px;
    text-align: center;
  }

  &__swiper {
    width: 100%;
    padding-bottom: 36px;

    :deep(.swiper-button-next),
    :deep(.swiper-button-prev) {
      color: inherit;
    }

    :deep(.swiper-pagination-bullet) {
      background: currentcolor;
      opacity: 0.4;
    }

    :deep(.swiper-pagination-bullet-active) {
      opacity: 1;
    }
  }

  &__diapositiva {
    position: relative;
    display: flex;
    aspect-ratio: 21 / 9;
    max-height: 480px;
    min-height: 200px;
    flex-direction: column;
    justify-content: flex-end;
    margin: 0;
    overflow: hidden;
    border-radius: 12px;
    background: rgb(255 255 255 / 4%);
  }

  &__imagen {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__imagen-vacia {
    position: absolute;
    inset: 0;
    background: rgb(255 255 255 / 6%);
  }

  &__texto {
    position: relative;
    z-index: 1;
    margin: 0;
    padding: 20px;
    background: linear-gradient(to top, rgb(0 0 0 / 65%), transparent);
    color: white;
  }
}
</style>
