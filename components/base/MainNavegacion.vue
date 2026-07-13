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

const modalCambiarLogo1 = ref(null);
const modalCambiarLogo2 = ref(null);
const modalCambiarLogo3 = ref(null);
const modalCambiarLogo4 = ref(null);

function abrirModalLogo1() {
  modalCambiarLogo1.value?.abrirModal();
}

function abrirModalLogo2() {
  modalCambiarLogo2.value?.abrirModal();
}

function abrirModalLogo3() {
  modalCambiarLogo3.value?.abrirModal();
}

function abrirModalLogo4() {
  modalCambiarLogo4.value?.abrirModal();
}

function seleccionarArchivoLogo1(archivo) {
  store.setLogoFile(archivo);
}

function seleccionarEnlaceLogo1(enlace) {
  store.setLogoUrl(enlace);
}

function seleccionarArchivoLogo2(archivo) {
  store.setLogoSecundarioFile(archivo);
}

function seleccionarEnlaceLogo2(enlace) {
  store.setLogoSecundarioUrl(enlace);
}

function seleccionarArchivoLogo3(archivo) {
  store.setLogoTerceroFile(archivo);
}

function seleccionarEnlaceLogo3(enlace) {
  store.setLogoTerceroUrl(enlace);
}

function seleccionarArchivoLogo4(archivo) {
  store.setLogoCuartoFile(archivo);
}

function seleccionarEnlaceLogo4(enlace) {
  store.setLogoCuartoUrl(enlace);
}
</script>

<template>
  <SisdaiNavegacionPrincipal>
    <template #identidad>
      <!-- Modo Constructor: 4 logos editables (sin imagen precargada si están vacíos) y nombre de la plataforma -->
      <div v-if="esConstructor" class="contenedor-identidades-nav constructor-identidades-nav">
        <!-- Logotipo 1 (Editable, sin imagen predeterminada si está vacío) -->
        <div class="contenedor-logo-nav editando-logo" :class="{ 'logo-vacio': !store.logoUrl }">
          <div v-if="!store.logoUrl" class="logo-placeholder-nav" @click="abrirModalLogo1">
            <span class="pictograma-agregar" aria-hidden="true"></span>
            <span>Logo 1</span>
          </div>
          <template v-else>
            <NuxtLink
              to="/"
              rel="noopener noreferrer"
              class="nav-hiperviculo-logo pointer-events-none"
            >
              <img
                :src="store.logoUrl"
                class="nav-logo color-invertir"
                alt="Logo principal"
                height="36"
              />
            </NuxtLink>
            <button
              type="button"
              class="boton-pictograma boton-sin-contenedor-secundario boton-chico boton-editar-logo"
              aria-label="Cambiar logo principal"
              @click="abrirModalLogo1"
            >
              <span class="pictograma-editar" aria-hidden="true"></span>
            </button>
          </template>
        </div>

        <!-- Logotipo 2 (Editable, sin imagen predeterminada si está vacío) -->
        <div
          class="contenedor-logo-nav editando-logo"
          :class="{ 'logo-vacio': !store.logoSecundarioUrl }"
        >
          <div
            v-if="!store.logoSecundarioUrl"
            class="logo-placeholder-nav"
            @click="abrirModalLogo2"
          >
            <span class="pictograma-agregar" aria-hidden="true"></span>
            <span>Logo 2</span>
          </div>
          <template v-else>
            <NuxtLink
              to="/"
              rel="noopener noreferrer"
              class="nav-hiperviculo-logo pointer-events-none"
            >
              <img
                :src="store.logoSecundarioUrl"
                class="nav-logo color-invertir"
                :alt="store.nombrePlataforma || 'SIGIC'"
                height="36"
              />
            </NuxtLink>
            <button
              type="button"
              class="boton-pictograma boton-sin-contenedor-secundario boton-chico boton-editar-logo"
              aria-label="Cambiar logo secundario"
              @click="abrirModalLogo2"
            >
              <span class="pictograma-editar" aria-hidden="true"></span>
            </button>
          </template>
        </div>

        <!-- Logotipo 3 (Editable, sin imagen predeterminada si está vacío) -->
        <div
          class="contenedor-logo-nav editando-logo"
          :class="{ 'logo-vacio': !store.logoTerceroUrl }"
        >
          <div v-if="!store.logoTerceroUrl" class="logo-placeholder-nav" @click="abrirModalLogo3">
            <span class="pictograma-agregar" aria-hidden="true"></span>
            <span>Logo 3</span>
          </div>
          <template v-else>
            <NuxtLink
              to="/"
              rel="noopener noreferrer"
              class="nav-hiperviculo-logo pointer-events-none"
            >
              <img
                :src="store.logoTerceroUrl"
                class="nav-logo color-invertir"
                alt="Logo tercero"
                height="36"
              />
            </NuxtLink>
            <button
              type="button"
              class="boton-pictograma boton-sin-contenedor-secundario boton-chico boton-editar-logo"
              aria-label="Cambiar logo tercero"
              @click="abrirModalLogo3"
            >
              <span class="pictograma-editar" aria-hidden="true"></span>
            </button>
          </template>
        </div>

        <!-- Logotipo 4 (Editable, sin imagen predeterminada si está vacío) -->
        <div
          class="contenedor-logo-nav editando-logo"
          :class="{ 'logo-vacio': !store.logoCuartoUrl }"
        >
          <div v-if="!store.logoCuartoUrl" class="logo-placeholder-nav" @click="abrirModalLogo4">
            <span class="pictograma-agregar" aria-hidden="true"></span>
            <span>Logo 4</span>
          </div>
          <template v-else>
            <NuxtLink
              to="/"
              rel="noopener noreferrer"
              class="nav-hiperviculo-logo pointer-events-none"
            >
              <img
                :src="store.logoCuartoUrl"
                class="nav-logo color-invertir"
                alt="Logo cuarto"
                height="36"
              />
            </NuxtLink>
            <button
              type="button"
              class="boton-pictograma boton-sin-contenedor-secundario boton-chico boton-editar-logo"
              aria-label="Cambiar logo cuarto"
              @click="abrirModalLogo4"
            >
              <span class="pictograma-editar" aria-hidden="true"></span>
            </button>
          </template>
        </div>

        <!-- Nombre de la plataforma -->
        <div class="contenedor-titulo-plataforma-nav">
          <span
            contenteditable="true"
            class="input-nav-titulo-plataforma"
            data-placeholder="Nombre de la plataforma"
            @blur="store.nombrePlataforma = $event.target.textContent.trim()"
            @keydown.enter.prevent="$event.target.blur()"
          >
            {{ store.nombrePlataforma }}
          </span>
        </div>
      </div>

      <!-- Modo Público (Resto de páginas): Diseño original de 2 logotipos de Sisdai -->
      <div v-else class="contenedor-identidades-nav">
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

        <NuxtLink to="/" rel="noopener noreferrer" class="nav-hiperviculo-logo">
          <img
            :src="`${config.app.baseURL}img/logo_sigic.svg`"
            class="nav-logo color-invertir"
            alt="SIGIC"
            height="36"
          />
        </NuxtLink>
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
        <NuxtLink class="nav-hipervinculo" to="/landing-builder">Constructor de Páginas</NuxtLink>
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
      ref="modalCambiarLogo1"
      @seleccionar-archivo="seleccionarArchivoLogo1"
      @seleccionar-enlace="seleccionarEnlaceLogo1"
    />
    <LandingBuilderModalCambiarLogo
      v-if="esConstructor"
      ref="modalCambiarLogo2"
      @seleccionar-archivo="seleccionarArchivoLogo2"
      @seleccionar-enlace="seleccionarEnlaceLogo2"
    />
    <LandingBuilderModalCambiarLogo
      v-if="esConstructor"
      ref="modalCambiarLogo3"
      @seleccionar-archivo="seleccionarArchivoLogo3"
      @seleccionar-enlace="seleccionarEnlaceLogo3"
    />
    <LandingBuilderModalCambiarLogo
      v-if="esConstructor"
      ref="modalCambiarLogo4"
      @seleccionar-archivo="seleccionarArchivoLogo4"
      @seleccionar-enlace="seleccionarEnlaceLogo4"
    />
  </SisdaiNavegacionPrincipal>
</template>

<style lang="scss">
body[data-tema='oscuro'] {
  img.color-invertir {
    filter: grayscale(1) brightness(100);
  }
  .constructor-identidades-nav {
    .nav-titulo-plataforma,
    .input-nav-titulo-plataforma {
      color: var(--navegacion-color, var(--texto-primario, #ffffff)) !important;
    }
    .contenedor-logo-nav.editando-logo:hover {
      background-color: rgba(255, 255, 255, 0.15);
    }
  }
}

.constructor-identidades-nav {
  display: inline-flex;
  align-items: center;
  gap: 12px;

  .contenedor-logo-nav {
    position: relative;
    display: inline-flex;
    align-items: center;

    &:not(:last-of-type)::after {
      content: '';
      display: inline-block;
      width: 1px;
      height: 20px;
      background-color: var(--color-conacyt-oro, #d1a153);
      margin-left: 12px;
      align-self: center;
    }
  }

  .nav-logo {
    height: 36px;
    max-height: 36px;
    width: auto;
    max-width: 140px;
    object-fit: contain;
    display: block;
  }

  .editando-logo {
    border: 1px dashed transparent;
    border-radius: 4px;
    padding: 2px;
    transition:
      border-color 0.2s,
      background-color 0.2s;
  }

  .editando-logo:hover {
    border-color: var(--color-primario-2, rgb(105 28 50));
    background-color: rgba(0, 0, 0, 0.12);
  }

  .logo-vacio {
    border-color: var(--color-neutro-3, #bdbdbd);
  }

  .logo-placeholder-nav {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    border: 1px dashed var(--color-neutro-3, #bdbdbd);
    border-radius: 4px;
    height: 36px;
    padding: 0 8px;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-neutro-5, #757575);
    cursor: pointer;
    background: rgba(0, 0, 0, 0.02);
    transition:
      border-color 0.2s,
      background-color 0.2s;

    span {
      padding: 0 !important;
    }

    &:hover {
      border-color: var(--color-primario-2, rgb(105 28 50));
      background: rgba(0, 0, 0, 0.05);
    }
  }

  .boton-editar-logo {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.9);
    z-index: 10;
    opacity: 0;
    transition:
      opacity 0.2s,
      transform 0.2s;

    background-color: var(--color-primario-2, rgb(105 28 50)) !important;
    color: #ffffff !important;
    border-radius: 50% !important;
    width: 28px !important;
    height: 28px !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2) !important;
    border: none !important;
    padding: 0 !important;

    span {
      padding: 0 !important;
      font-size: 14px !important;
    }
  }

  .contenedor-logo-nav:hover .boton-editar-logo,
  .boton-editar-logo:focus-visible {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }

  .contenedor-titulo-plataforma-nav {
    margin-left: 8px;
    display: inline-flex;
    align-items: center;
  }

  .nav-titulo-plataforma {
    font-size: 0.875rem;
    font-weight: 400;
    color: var(--navegacion-color, var(--texto-primario, #141414));
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    vertical-align: middle;
    line-height: 1.2;
    max-height: 2.4em;
    max-width: 320px;
    white-space: normal;
    overflow-wrap: break-word;
  }

  .input-nav-titulo-plataforma {
    font-size: 0.875rem;
    font-weight: 400;
    color: var(--navegacion-color, var(--texto-primario, #141414));
    border: 1px dashed var(--color-neutro-3, #bdbdbd);
    border-radius: 4px;
    padding: 2px 6px;
    outline: none;
    min-width: 180px;
    max-width: 320px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    vertical-align: middle;
    line-height: 1.2;
    max-height: 2.4em;
    white-space: normal;
    overflow-wrap: break-word;

    &:empty::before {
      content: attr(data-placeholder);
      color: var(--color-neutro-4, #9e9e9e);
      font-style: italic;
    }

    &:focus::before {
      content: '' !important;
    }

    &:hover {
      border-color: var(--color-primario-2, rgb(105 28 50));
    }

    &:focus {
      border: 1px solid var(--campo-enfoque-borde);
      box-shadow: 0 0 8px var(--campo-enfoque-sombra);
      background: var(--campo-enfoque-fondo);
    }
  }
}
</style>
