<script setup>
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

function abrirModalCrear() {
  modalCrear.value?.abrir();
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
      <div v-if="isLoggedIn" class="barra-acciones flex flex-contenido-final p-x-3 p-t-2">
        <button class="boton-primario" type="button" @click="abrirModalCrear">
          <span class="pictograma-mas" aria-hidden="true" /> Crear mapa
        </button>
      </div>

      <NuxtPage />
    </div>

    <MapasModalCrearMapa ref="modalCrear" @creado="alCrearMapa" />
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
