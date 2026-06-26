<script setup>
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';
import { useResourcesSupplements } from '~/composables/useResourcesSupplements';

definePageMeta({
  middleware: 'sidebase-auth',
  bodyAttrs: {
    class: '',
  },
});
const storeCatalogo = useCatalogoStore();
const storeResources = useResourcesCatalogoStore();
const { getSLDs, destroySLDs } = useResourcesSupplements();
const config = useRuntimeConfig();

const { data } = useAuth();
const route = useRoute();
const selectedPk = route.query.data;
const subidaExitosa = ref(undefined);
const resourceToEdit = ref(null);
const dragNdDrop = ref(null);
const style_files = ['.sld'];
const isLoadingGlobal = ref(true);
const isLoading = ref(false);
const loadedStylesStatus = ref({});
const resourcestyles = ref([]);

const modalEliminar = ref(null);
const estiloAEliminar = ref('');
const defaultStyle = ref(null);

// Función que usa el nuevo endpoint
async function guardarArchivo(files) {
  loadedStylesStatus.value = {};
  subidaExitosa.value = undefined;
  isLoading.value = true;

  const validFileList = {};
  // Primero revisamos si los archivos son válidos
  for (const file of files) {
    const isValid = style_files.map((end) => file.name.endsWith(end)).includes(true);
    validFileList[file.name] = isValid;
  }

  // Si los archivos son válidos, agregamos los sld
  if (!Object.values(validFileList).includes(false)) {
    for (const d of files) {
      loadedStylesStatus.value[d.name] = 'loading';
    }
    for (const d of files) {
      const fileName = d.name;
      const formData = new FormData();
      formData.append('base_file', d);
      formData.append('token', data.value?.accessToken);
      formData.append('pk', selectedPk);
      const fileUpdateStatus = await $fetch('/api/subirSLDMultiple', {
        method: 'POST',
        body: formData,
      });
      loadedStylesStatus.value[fileName] = fileUpdateStatus;
      const styles = await getSLDs(resourceToEdit.value);
      resourcestyles.value = styles.styleList;
      defaultStyle.value = styles.defaultStyle;
    }
  } else {
    dragNdDrop.value?.archivoNoValido();
  }
  isLoading.value = false;
}

function abrirConfirmacionBorrar(style) {
  estiloAEliminar.value = style;
  modalEliminar.value?.abrirModal();
}

async function confirmarBorrarEstilo() {
  isLoading.value = true;
  const exito = await destroySLDs({
    pk: selectedPk,
    stylename: estiloAEliminar.value,
    sourcetype: resourceToEdit.value.sourcetype,
    token: data.value?.accessToken,
  });

  if (exito) {
    const styles = await getSLDs(resourceToEdit.value);
    resourcestyles.value = styles.styleList;
    defaultStyle.value = styles.defaultStyle;
  }
  modalEliminar.value?.cerrarModal();
  isLoading.value = false;
}

onMounted(async () => {
  resourceToEdit.value = await storeResources.fetchResourceByPk(selectedPk);
  const styles = await getSLDs(resourceToEdit.value);
  resourcestyles.value = styles.styleList;
  defaultStyle.value = styles.defaultStyle;
  isLoadingGlobal.value = false;
});
</script>

<template>
  <UiLayoutPaneles :estado-colapable="storeCatalogo.catalogoColapsado">
    <template #catalogo>
      <CatalogoListaMenuLateral />
    </template>

    <template #visualizador>
      <main v-if="isLoadingGlobal">
        <div class="flex flex-contenido-centrado m-t-3">
          <img
            class="color-invertir"
            :src="`${config.app.baseURL}img/loader.gif`"
            alt="...Cargando"
            height="120px"
          />
        </div>
      </main>
      <main v-else id="principal" class="contenedor m-b-10 m-y-3">
        <div v-if="resourceToEdit === 'Error'">
          <div
            class="contenedor ancho-lectura borde-redondeado-16 texto-color-error fondo-color-error p-3 m-3 flex flex-contenido-centrado"
          >
            <span class="pictograma-alerta" />
            <b> Hubo un error en el servidor o el archivo no existe</b>
          </div>
        </div>
        <div v-else class="alineacion-izquierda ancho-lectura">
          <div class="flex">
            <nuxt-link to="/catalogo/mis-recursos" aria-label="regresar a mis recursos">
              <span
                class="pictograma-flecha-izquierda pictograma-mediano texto-color-acento"
                aria-hidden="true"
              />
              <span class="h5 texto-color-primario p-l-2">Editar</span>
            </nuxt-link>
          </div>

          <div class="flex">
            <div class="columna-16">
              <h2 class="m-b-0">{{ resourceToEdit?.title }}</h2>

              <CatalogoMenuMisArchivos
                :recurso="resourceToEdit"
                :opciones="[
                  { texto: 'Metadatos', ruta: '/catalogo/mis-recursos/editar/MetadatosBasicos' },
                  {
                    texto: 'Estilo',
                    ruta: '/catalogo/mis-recursos/editar/estilo',
                  },
                  {
                    texto: 'Clave Geoestadística',
                    ruta: '/catalogo/mis-recursos/unir-vectores',
                  },
                ]"
              />

              <h2 class="m-t-0">Estilos de la capa</h2>
              <div class="m-b-5">
                <table class="tabla-condensada">
                  <thead>
                    <tr>
                      <th>Nombre del estilo</th>
                      <th class="alineacion-derecha">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="style in resourcestyles" :key="style">
                      <td>{{ style }}</td>
                      <td class="alineacion-derecha">
                        <button
                          v-if="style !== defaultStyle"
                          type="button"
                          class="boton-pictograma boton-sin-contenedor-secundario"
                          aria-label="Eliminar estilo"
                          @click="abrirConfirmacionBorrar(style)"
                        >
                          <span class="pictograma-eliminar" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p><b style="font-weight: bold">Agregar estilos, solo archivos .sld</b></p>

              <!-- Drag & Drop -->
              <ClientOnly>
                <CatalogoElementoDragNdDrop
                  ref="dragNdDrop"
                  @pasar-archivo="(i) => guardarArchivo(i)"
                />
              </ClientOnly>
            </div>

            <div class="columna-16">
              <div v-if="Object.keys(loadedStylesStatus).length > 0">
                <h2>Cargas recientes</h2>
                <div v-for="file in Object.keys(loadedStylesStatus)" :key="file">
                  <!--Cargando-->
                  <div
                    v-if="loadedStylesStatus[file] === 'loading'"
                    class="fondo-color-neutro p-3 borde-redondeado-16 m-y-2"
                  >
                    <img
                      class="color-invertir"
                      :src="`${config.app.baseURL}img/loader.gif`"
                      height="30"
                    />
                    <b> Subiendo {{ file }}... </b>
                  </div>

                  <!--Subida exitosa-->
                  <div
                    v-else-if="loadedStylesStatus[file] === 'finished'"
                    class="fondo-color-confirmacion p-3 borde-redondeado-16 m-y-2"
                  >
                    <div class="flex texto-color-confirmacion">
                      <span class="pictograma-aprobado" />
                      <b> Archivo cargado correctamente </b>
                    </div>
                    <p>{{ file }}</p>
                    <div>
                      <nuxt-link to="/catalogo/mis-recursos">Ver en mis recursos</nuxt-link>
                    </div>
                  </div>

                  <!--Subida fracasó-->
                  <div
                    v-else
                    class="fondo-color-error texto-color-error p-3 borde-redondeado-16 m-y-2"
                  >
                    <div class="flex texto-color-error">
                      <span class="pictograma-alerta" />
                      <b> No se logró cargar el archivo adecuadamente. Inténtalo de nuevo </b>
                    </div>
                    <p>{{ file }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <ClientOnly>
        <SisdaiModal ref="modalEliminar">
          <template #encabezado>
            <h2 class="m-t-0">¿Deseas eliminar este estilo?</h2>
          </template>
          <template #cuerpo>
            <p>
              El estilo <b>{{ estiloAEliminar }}</b> será eliminado permanentemente del servidor.
            </p>
            <div class="flex flex-contenido-final m-t-5">
              <button
                type="button"
                class="boton-secundario m-r-2"
                @click="modalEliminar?.cerrarModal()"
              >
                Cancelar
              </button>
              <button type="button" class="boton-primario" @click="confirmarBorrarEstilo">
                Eliminar
              </button>
            </div>
          </template>
        </SisdaiModal>
      </ClientOnly>
    </template>
  </UiLayoutPaneles>
</template>
