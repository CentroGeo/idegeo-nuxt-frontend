<script setup>
// Bypass temporal para trabajar localmente sin Keycloak.
// Antes del commit final, vuelve a habilitar el middleware:
// definePageMeta({ middleware: 'auth' });

const store = useLandingBuilderStore();

onMounted(() => {
  store.cargarConfiguracion();
});
</script>

<template>
  <div class="landing-builder-pagina">
    <!-- Portada del constructor -->
    <LandingBuilderLienzoBloques />
    <!-- Formulario existente -->
    <section
      class="contenedor m-y-4 landing-builder-configuracion"
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

      <div v-else class="landing-builder-contenido">
        <!-- Panel de edición -->
        <div class="landing-builder-panel">
          <h3 class="landing-builder-panel__titulo">Editor</h3>

          <LandingBuilderPanelEdicion />

          <LandingBuilderTarjetasEditor class="m-t-3" />

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
        <div class="landing-builder-panel landing-builder-panel--vista-previa">
          <h3 class="landing-builder-panel__titulo">Vista previa</h3>

          <LandingBuilderVistaPrevia
            :nombre-plataforma="store.nombrePlataforma"
            :titulo="store.titulo"
            :subtitulo="store.subtitulo"
            :titulo-seccion="store.tituloSeccion"
            :descripcion="store.descripcion"
            :seccion-texto="store.seccionTexto"
            :logo-url="store.logoUrl"
            :tarjetas="store.tarjetas"
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

.landing-builder-panel {
  min-width: 0;

  &__titulo {
    margin: 0 0 16px;
  }
}

@media (min-width: 768px) {
  .landing-builder-contenido {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    align-items: start;
    gap: 32px;
  }

  .landing-builder-panel--vista-previa {
    position: sticky;
    top: 24px;
    max-height: calc(100vh - 48px);
    overflow-y: auto;
  }
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
