<script setup>
definePageMeta({
  middleware: 'auth',
});

const modalCrear = ref(null);

function alCrear(mapa) {
  navigateTo(`/mapas/${mapa.id}/editar`);
}

function cancelar() {
  navigateTo('/mapas');
}

onMounted(() => {
  modalCrear.value?.abrir();
});
</script>

<template>
  <main class="pagina-crear p-3">
    <h1>Crear mapa</h1>
    <p class="texto-secundario">
      Define los datos básicos de tu mapa. Podrás añadir capas en el siguiente paso.
    </p>

    <div class="flex m-t-2">
      <button class="boton-primario" type="button" @click="modalCrear?.abrir()">
        Abrir formulario
      </button>
      <button class="boton-secundario" type="button" @click="cancelar">Cancelar</button>
    </div>

    <MapasModalCrearMapa ref="modalCrear" @creado="alCrear" />
  </main>
</template>

<style lang="scss" scoped>
.flex {
  gap: 8px;
}
</style>
