<script setup>
// Font Awesome 6 para los iconos (fa-solid) de los controles del visor de mapa
// (MapasControlInfo, MapasControlCapaBase). El resto de layouts ya lo cargan.
useHead({
  link: [
    {
      rel: 'stylesheet',
      href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css',
    },
  ],
});
</script>

<template>
  <div>
    <div class="contenido vista-geohistorias">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.vista-geohistorias {
  height: 100%;
}
</style>
