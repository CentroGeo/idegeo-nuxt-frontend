<script setup>
definePageMeta({ middleware: 'auth' });

const store = useLandingBuilderStore();

onMounted(() => {
  store.cargarConfiguracion();
});
</script>

<template>
  <div class="contenedor ancho-fijo m-y-4">
    <h1>Constructor de landing page</h1>
    <p>
      Configura los textos y el logo principales de la landing page. Los cambios se ven reflejados
      en la vista previa antes de guardarlos.
    </p>

    <div v-if="store.isLoading" class="flex flex-contenido-centrado m-y-4">
      <p>Cargando configuración...</p>
    </div>

    <div v-else class="flex">
      <div class="columna-8">
        <LandingBuilderPanelEdicion />

        <div class="flex flex-vertical-centrado m-t-3">
          <button
            class="boton-primario boton-chico"
            :disabled="store.isSaving"
            @click="store.guardarConfiguracion"
          >
            {{ store.isSaving ? 'Guardando...' : 'Guardar cambios' }}
          </button>
          <p v-if="store.saveSuccess" class="texto-color-confirmacion m-l-2">
            Configuración guardada.
          </p>
          <p v-if="store.error" class="texto-color-error m-l-2">{{ store.error }}</p>
        </div>
      </div>

      <div class="columna-8">
        <h2>Vista previa</h2>
        <LandingBuilderVistaPrevia
          :nombre-plataforma="store.nombrePlataforma"
          :titulo="store.titulo"
          :subtitulo="store.subtitulo"
          :descripcion="store.descripcion"
          :seccion-texto="store.seccionTexto"
          :logo-url="store.logoUrl"
        />
      </div>
    </div>
  </div>
</template>
