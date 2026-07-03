<script setup>
import SisdaiNavegacionPrincipal from '@centrogeomx/sisdai-componentes/src/componentes/navegacion-principal/SisdaiNavegacionPrincipal.vue';

const { status, signIn } = useAuth();
const route = useRoute();
const config = useRuntimeConfig();
const store = useLandingBuilderStore();

const esConstructor = computed(() => {
  return route.path.startsWith('/landing-builder');
});

onMounted(() => {
  if (esConstructor.value && !store.logoSecundarioUrl) {
    store.cargarConfiguracion();
  }
});

async function iniciarSesion() {
  await signIn('keycloak', {
    // A dónde volver después del login
    callbackUrl: route.fullPath,
  });
}
const mostrarInicio = computed(() => config.public.defaultPage);
const mostrarCatalogo = computed(() => config.public.enableCatalogoVista);
const mostrarConsulta = computed(() => config.public.enableConsulta);
const mostrarIaa = computed(() => config.public.enableIaa);
const mostrarLevantamiento = computed(() => config.public.enableLevantamiento);
const mostrarAuth = computed(() => config.public.enableAuth);
const mostrarAcercaDe = computed(() => config.public.enableAcercaDe);
const mostrarGeocontenidos = computed(() => config.public.enableGeocontenidos);
const mostrarLandingBuilder = computed(() => config.public.enableLandingBuilder);

const modalCambiarLogoSecundario = ref(null);

function abrirModalLogoSecundario() {
  modalCambiarLogoSecundario.value?.abrirModal();
}

function seleccionarArchivoLogoSecundario(archivo) {
  store.setLogoSecundarioFile(archivo);
}

function seleccionarEnlaceLogoSecundario(enlace) {
  store.setLogoSecundarioUrl(enlace);
}
</script>

<template>
  <SisdaiNavegacionPrincipal>
    <!--Definiendo el logo del sitio-->
    <template #identidad>
      <div class="contenedor-identidades-nav">
        <a
          href="https://secihti.mx/"
          target="_blank"
          rel="noopener noreferrer"
          class="nav-hiperviculo-logo"
        >
          <img
            :src="`${config.app.baseURL}img/logo_secihiti.svg`"
            class="nav-logo color-invertir"
            alt="SECIHITI"
            height="36"
          />
        </a>

        <div class="contenedor-logo-secundario" :class="{ 'editando-logo': esConstructor }">
          <NuxtLink to="/" rel="noopener noreferrer" class="nav-hiperviculo-logo">
            <img
              :src="
                (esConstructor && store.logoSecundarioUrl) ||
                `${config.app.baseURL}img/logo_sigic.svg`
              "
              class="nav-logo color-invertir"
              :alt="store.nombrePlataforma || 'SIGIC'"
              height="36"
            />
          </NuxtLink>
          <button
            v-if="esConstructor"
            type="button"
            class="boton-pictograma boton-sin-contenedor-secundario boton-chico boton-editar-logo"
            aria-label="Cambiar logo secundario"
            @click="abrirModalLogoSecundario"
          >
            <span class="pictograma-editar" aria-hidden="true"></span>
          </button>
        </div>
      </div>
    </template>

    <ul class="nav-menu">
      <li v-if="mostrarInicio">
        <NuxtLink class="nav-hipervinculo" to="/" exact-path>Inicio</NuxtLink>
      </li>
      <li v-if="mostrarCatalogo">
        <NuxtLink class="nav-hipervinculo" to="/catalogo">Catálogo</NuxtLink>
      </li>
      <li v-if="mostrarConsulta">
        <NuxtLink class="nav-hipervinculo" to="/consulta">Consulta</NuxtLink>
      </li>
      <li v-if="mostrarIaa && status === 'authenticated'">
        <NuxtLink class="nav-hipervinculo" to="/ia">Análisis Inteligencia Artificial</NuxtLink>
      </li>
      <li v-if="mostrarLevantamiento && status === 'authenticated'">
        <NuxtLink class="nav-hipervinculo" to="/levantamiento">Levantamiento</NuxtLink>
      </li>
      <li v-if="mostrarGeocontenidos && status === 'authenticated'">
        <NuxtLink class="nav-hipervinculo" to="/geocontenidos">Geocontenidos</NuxtLink>
      </li>
      <li v-if="mostrarLandingBuilder && status === 'authenticated'">
        <NuxtLink class="nav-hipervinculo" to="/landing-builder">Landing Builder</NuxtLink>
      </li>
      <li v-if="mostrarAcercaDe">
        <NuxtLink class="nav-hipervinculo" to="/acerca-de">Acerca de</NuxtLink>
      </li>
      <li v-if="mostrarAuth">
        <NuxtLink v-if="status === 'authenticated'" class="nav-hipervinculo" to="/mi-cuenta">
          Mi cuenta
        </NuxtLink>

        <button
          v-else
          aria-label="Iniciar sesión"
          type="button"
          class="boton-secundario btn-inicio-sesion"
          @click="iniciarSesion"
        >
          Iniciar sesión
        </button>
      </li>
    </ul>

    <LandingBuilderModalCambiarLogo
      v-if="esConstructor"
      ref="modalCambiarLogoSecundario"
      @seleccionar-archivo="seleccionarArchivoLogoSecundario"
      @seleccionar-enlace="seleccionarEnlaceLogoSecundario"
    />
  </SisdaiNavegacionPrincipal>
</template>

<style lang="scss">
body[data-tema='oscuro'] {
  img.color-invertir {
    filter: grayscale(1) brightness(100);
  }
}
.contenedor-identidades-nav {
  display: inline-flex;
}

.contenedor-logo-secundario {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.editando-logo {
  border: 1px dashed transparent;
  border-radius: 4px;
  padding: 2px;
  transition: border-color 0.2s;
}

.editando-logo:hover {
  border-color: rgb(105 28 50 / 60%);
}

.boton-editar-logo {
  position: absolute;
  top: 50%;
  right: -28px;
  z-index: 10;
  opacity: 0;
  transform: translateY(-50%) scale(0.9);
  transition:
    opacity 0.2s,
    transform 0.2s;
}

.contenedor-logo-secundario:hover .boton-editar-logo,
.boton-editar-logo:focus-visible {
  opacity: 1;
  transform: translateY(-50%) scale(1);
}
</style>
