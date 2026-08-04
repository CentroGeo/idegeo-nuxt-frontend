<script setup>
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';

const estados = ['Publicada', 'Borrador'];

const categorias = reactive([
  { id: 1, nombre: 'Zonas Climáticas', tipo: 'Geográfica', valores: 14, estado: 'Publicada' },
  {
    id: 2,
    nombre: 'Áreas Naturales Protegidas',
    tipo: 'Ambiental',
    valores: 182,
    estado: 'Publicada',
  },
  { id: 3, nombre: 'Cuencas Hidrológicas', tipo: 'Hidrología', valores: 37, estado: 'Borrador' },
  {
    id: 4,
    nombre: 'Entidades Federativas',
    tipo: 'Político-Administrativo',
    valores: 32,
    estado: 'Publicada',
  },
]);

let siguienteId = categorias.length + 1;

function claseEstado(estado) {
  return estado === 'Publicada'
    ? 'texto-color-confirmacion fondo-color-confirmacion borde borde-color-confirmacion'
    : 'texto-color-neutro fondo-color-neutro borde borde-color-neutro';
}

// --- Modal Nueva / Editar categoría ---
const modalCategoria = ref(null);
const modoModalCategoria = ref('crear');
const formularioCategoria = reactive({
  id: null,
  nombre: '',
  tipo: '',
  valores: 0,
  estado: 'Borrador',
});

function abrirModalNuevaCategoria() {
  modoModalCategoria.value = 'crear';
  formularioCategoria.id = null;
  formularioCategoria.nombre = '';
  formularioCategoria.tipo = '';
  formularioCategoria.valores = 0;
  formularioCategoria.estado = 'Borrador';
  modalCategoria.value?.abrirModal();
}

function abrirModalEditarCategoria(categoria) {
  modoModalCategoria.value = 'editar';
  formularioCategoria.id = categoria.id;
  formularioCategoria.nombre = categoria.nombre;
  formularioCategoria.tipo = categoria.tipo;
  formularioCategoria.valores = categoria.valores;
  formularioCategoria.estado = categoria.estado;
  modalCategoria.value?.abrirModal();
}

function guardarCategoria() {
  if (!formularioCategoria.nombre.trim() || !formularioCategoria.tipo.trim()) return;

  if (modoModalCategoria.value === 'crear') {
    categorias.push({
      id: siguienteId++,
      nombre: formularioCategoria.nombre.trim(),
      tipo: formularioCategoria.tipo.trim(),
      valores: Number(formularioCategoria.valores) || 0,
      estado: formularioCategoria.estado,
    });
  } else {
    const categoria = categorias.find((item) => item.id === formularioCategoria.id);
    if (categoria) {
      categoria.nombre = formularioCategoria.nombre.trim();
      categoria.tipo = formularioCategoria.tipo.trim();
      categoria.valores = Number(formularioCategoria.valores) || 0;
      categoria.estado = formularioCategoria.estado;
    }
  }
  modalCategoria.value?.cerrarModal();
}

// --- Modal Eliminar categoría ---
const modalEliminarCategoria = ref(null);
const categoriaAEliminar = ref(null);

function abrirModalEliminarCategoria(categoria) {
  categoriaAEliminar.value = categoria;
  modalEliminarCategoria.value?.abrirModal();
}

function confirmarEliminarCategoria() {
  const indice = categorias.findIndex((categoria) => categoria.id === categoriaAEliminar.value?.id);
  if (indice !== -1) categorias.splice(indice, 1);
  modalEliminarCategoria.value?.cerrarModal();
}
</script>

<template>
  <div class="administracion-categorias">
    <div class="flex flex-contenido-separado m-b-4">
      <div class="flex-vertical-centrado">
        <p class="m-0">
          <strong>{{ categorias.length }}</strong> categorías configuradas
        </p>
      </div>
      <button type="button" class="boton-primario" @click="abrirModalNuevaCategoria">
        <span class="pictograma-agregar" aria-hidden="true" /> Nueva categoría
      </button>
    </div>

    <div class="contenedor-tabla">
      <table class="tabla-expandida">
        <caption>
          Categorías y filtros de metadatos
        </caption>
        <thead>
          <tr>
            <th scope="col">Categoría</th>
            <th scope="col">Tipo</th>
            <th scope="col">Valores</th>
            <th scope="col">Estado</th>
            <th scope="col">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="categoria in categorias" :key="categoria.id">
            <td>{{ categoria.nombre }}</td>
            <td>{{ categoria.tipo }}</td>
            <td>{{ categoria.valores }} registros</td>
            <td>
              <span class="p-1 borde-redondeado-8" :class="claseEstado(categoria.estado)">
                {{ categoria.estado }}
              </span>
            </td>
            <td>
              <div class="flex-width flex" style="gap: 8px">
                <button
                  class="boton-secundario boton-chico"
                  type="button"
                  @click="abrirModalEditarCategoria(categoria)"
                >
                  <span class="pictograma-editar" aria-hidden="true" /> Editar
                </button>
                <button
                  class="boton-pictograma boton-secundario"
                  aria-label="Eliminar categoría"
                  type="button"
                  @click="abrirModalEliminarCategoria(categoria)"
                >
                  <span class="pictograma-eliminar" aria-hidden="true" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ClientOnly>
      <SisdaiModal ref="modalCategoria">
        <template #encabezado>
          <h2>{{ modoModalCategoria === 'crear' ? 'Nueva categoría' : 'Editar categoría' }}</h2>
        </template>
        <template #cuerpo>
          <label for="categoria-nombre">Nombre</label>
          <input
            id="categoria-nombre"
            v-model="formularioCategoria.nombre"
            type="text"
            class="m-b-2"
          />

          <label for="categoria-tipo">Tipo</label>
          <input id="categoria-tipo" v-model="formularioCategoria.tipo" type="text" class="m-b-2" />

          <label for="categoria-valores">Número de valores</label>
          <input
            id="categoria-valores"
            v-model="formularioCategoria.valores"
            type="number"
            min="0"
            class="m-b-2"
          />

          <label for="categoria-estado">Estado</label>
          <select id="categoria-estado" v-model="formularioCategoria.estado">
            <option v-for="estado in estados" :key="estado" :value="estado">{{ estado }}</option>
          </select>
        </template>
        <template #pie>
          <button
            class="boton-secundario boton-chico"
            type="button"
            @click="modalCategoria.cerrarModal()"
          >
            Cancelar
          </button>
          <button class="boton-primario boton-chico" type="button" @click="guardarCategoria">
            Guardar
          </button>
        </template>
      </SisdaiModal>

      <SisdaiModal ref="modalEliminarCategoria">
        <template #encabezado>
          <h2>Eliminar categoría</h2>
        </template>
        <template #cuerpo>
          <p>
            ¿Deseas eliminar la categoría <strong>{{ categoriaAEliminar?.nombre }}</strong
            >? Esta acción no se puede deshacer.
          </p>
        </template>
        <template #pie>
          <button
            class="boton-secundario boton-chico"
            type="button"
            @click="modalEliminarCategoria.cerrarModal()"
          >
            Cancelar
          </button>
          <button
            class="boton-primario boton-chico"
            type="button"
            @click="confirmarEliminarCategoria"
          >
            Eliminar
          </button>
        </template>
      </SisdaiModal>
    </ClientOnly>
  </div>
</template>

<style lang="scss" scoped>
.contenedor-tabla {
  width: 100%;
  overflow-x: auto;

  table {
    width: 100%;
  }
}
</style>
