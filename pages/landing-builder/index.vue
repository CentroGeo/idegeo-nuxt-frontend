<script setup>
// Bypass temporal para trabajar localmente sin Keycloak.
// Antes del commit final, vuelve a habilitar el middleware:
definePageMeta({ middleware: 'auth' });

const store = useLandingBuilderStore();

onMounted(() => {
  store.cargarConfiguracion();
});
</script>

<template>
  <div class="landing-builder-pagina">
    <!-- Portada del constructor -->
    <LandingBuilderPortadaEditor />

    <!-- Formulario existente -->
    <section
      class="contenedor ancho-fijo m-y-4 landing-builder-configuracion"
      aria-labelledby="landing-builder-configuracion-titulo"
    >
      <div class="landing-builder-configuracion__encabezado">
        <h2 id="landing-builder-configuracion-titulo">Configuración de la landing page</h2>

        <p>
          Configura los textos y el logo principales de la landing page. Los cambios se reflejan en
          la vista previa antes de guardarlos.
        </p>
      </div>

      <div v-if="store.isLoading" class="flex flex-contenido-centrado m-y-4">
        <p>Cargando configuración...</p>
      </div>

      <div v-else class="flex landing-builder-contenido">
        <!-- Panel de edición -->
        <div class="columna-8 landing-builder-panel">
          <LandingBuilderPanelEdicion />

          <div class="flex flex-vertical-centrado m-t-3 landing-builder-acciones">
            <button
              class="boton-primario boton-chico"
              type="button"
              :disabled="store.isSaving"
              @click="store.guardarConfiguracion"
            >
              {{ store.isSaving ? 'Guardando...' : 'Guardar cambios' }}
            </button>

            <p v-if="store.saveSuccess" class="texto-color-confirmacion m-l-2">
              Configuración guardada.
            </p>

            <p v-if="store.error" class="texto-color-error m-l-2">
              {{ store.error }}
            </p>
          </div>
        </div>

        <!-- Vista previa -->
        <div class="columna-8 landing-builder-panel">
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
    </section>
  </div>
</template>

<style scoped lang="scss">
.landing-builder-pagina {
  width: 100%;
}

.landing-builder-configuracion {
  padding-top: 32px;
  padding-bottom: 48px;
}

.landing-builder-configuracion__encabezado {
  max-width: 780px;
  margin-bottom: 32px;
}

.landing-builder-configuracion__encabezado h2 {
  margin-bottom: 8px;
}

.landing-builder-contenido {
  align-items: flex-start;
  gap: 32px;
}

.landing-builder-panel {
  min-width: 0;
}

.landing-builder-acciones {
  flex-wrap: wrap;
  gap: 12px;
}

.landing-builder-acciones p {
  margin-top: 0;
  margin-bottom: 0;
}

@media (max-width: 767px) {
  .landing-builder-configuracion {
    padding-top: 24px;
    padding-bottom: 32px;
  }

  .landing-builder-contenido {
    display: block;
  }

  .landing-builder-panel + .landing-builder-panel {
    margin-top: 40px;
  }

  .landing-builder-acciones {
    align-items: flex-start;
    flex-direction: column;
  }

  .landing-builder-acciones p {
    margin-left: 0;
  }
}
</style>
