<script setup>
const route = useRoute();
const mapasStore = useMapasStore();
const { data: session } = useAuth();

const isLoggedIn = computed(() => !!session.value);

const ruta = '/mapas';

const subPaginas = [
  {
    pictograma: 'pictograma-explorar',
    ruta: ruta,
    globo: 'Explorar mapas',
  },
];

const sesionPaginas = computed(() =>
  isLoggedIn.value
    ? [
        {
          pictograma: 'pictograma-mas',
          ruta: `${ruta}/crear`,
          globo: 'Crear mapa',
        },
      ]
    : []
);

const idColapsable = `nav-mapas-${Math.random().toString(36).substring(2)}`;

const modalCrear = ref(null);

const idActual = computed(() => route.params.id ?? null);
const enDetalleMapa = computed(() => !!idActual.value);
const enEdicion = computed(() => route.path.endsWith('/editar'));

const esOwner = computed(() => {
  const ownerUsername = mapasStore.activeMap?.owner?.username;
  const sessionEmail = session.value?.user?.email;
  const sessionName = session.value?.user?.name;
  if (!ownerUsername || !session.value) return false;
  return ownerUsername === sessionEmail || ownerUsername === sessionName;
});

const mostrarBotonAgregar = computed(
  () => enDetalleMapa.value && esOwner.value && !enEdicion.value
);
const textoBoton = computed(() => (mostrarBotonAgregar.value ? 'Agregar capas' : 'Crear mapa'));

function alClickAccion() {
  if (mostrarBotonAgregar.value) {
    mapasStore.abrirModalAgregarCapas();
  } else {
    modalCrear.value?.abrir();
  }
}

function alCrearMapa(mapa) {
  navigateTo(`/mapas/${mapa.id}/editar`);
}
</script>

<template>
  <div class="modulo-mapas flex">
    <UiNavegacionLateral
      :id-colapsable="idColapsable"
      :sub-paginas="subPaginas"
      :sesion-paginas="sesionPaginas"
    />
    <div class="contenedor-contenido">
      <div
        v-if="isLoggedIn && !enEdicion"
        class="barra-acciones flex flex-contenido-final p-x-3 p-t-2"
      >
        <button class="boton-primario" type="button" @click="alClickAccion">
          <span class="pictograma-mas" aria-hidden="true" /> {{ textoBoton }}
        </button>
      </div>

      <NuxtPage />
    </div>

    <MapasModalCrearMapa ref="modalCrear" @creado="alCrearMapa" />

    <MapasModalAgregarCapas
      v-if="enDetalleMapa && mapasStore.activeMap"
      :mapa-id="Number(idActual)"
      :map-type="mapasStore.activeMap.map_type"
    />
  </div>
</template>

<style lang="scss" scoped>
.modulo-mapas {
  --altura-mapas: calc(100vh - 112px);
  height: var(--altura-mapas);
  gap: 0;

  .contenedor-contenido {
    flex: 1;
    overflow-y: auto;
  }
}
</style>
