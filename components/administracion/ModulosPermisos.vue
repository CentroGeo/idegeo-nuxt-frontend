<script setup>
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';

// --- Módulos (con submódulos anidados) ---
// Refleja la estructura real de módulos de la plataforma (ver CLAUDE.md /
// nuxt.config.ts): cada entrada de nivel superior es un módulo funcional con
// su propia ruta base, y sus submódulos son las funcionalidades reales que
// vive bajo esa ruta en pages/.
const modulos = reactive([
  {
    id: 'catalogo',
    nombre: 'Catálogo',
    ruta: '/catalogo',
    descripcion: 'Exploración, carga y gestión de recursos del catálogo geoespacial.',
    habilitado: true,
    submodulos: [
      { id: 'catalogo-capas', nombre: 'Capas geográficas', habilitado: true },
      { id: 'catalogo-documentos', nombre: 'Documentos', habilitado: true },
      { id: 'catalogo-tablas', nombre: 'Datos tabulados', habilitado: true },
      { id: 'catalogo-externos', nombre: 'Catálogos externos', habilitado: true },
      { id: 'catalogo-cargar', nombre: 'Cargar archivos', habilitado: true },
      { id: 'catalogo-mis-archivos', nombre: 'Mis archivos', habilitado: true },
      { id: 'catalogo-revision', nombre: 'Revisión de solicitudes', habilitado: true },
      { id: 'catalogo-servicios-remotos', nombre: 'Servicios remotos', habilitado: true },
    ],
  },
  {
    id: 'consulta',
    nombre: 'Consulta',
    ruta: '/consulta',
    descripcion: 'Visualización de capas, documentos y tablas publicadas en el catálogo.',
    habilitado: true,
    submodulos: [
      { id: 'consulta-capas', nombre: 'Capas', habilitado: true },
      { id: 'consulta-documentos', nombre: 'Documentos', habilitado: true },
      { id: 'consulta-tablas', nombre: 'Tablas', habilitado: true },
    ],
  },
  {
    id: 'geocontenidos',
    nombre: 'Geocontenidos',
    ruta: '/geocontenidos',
    descripcion: 'Autoría de mapas, panoramas, geo-historias y tableros de datos.',
    habilitado: true,
    submodulos: [
      { id: 'geocontenidos-mapas', nombre: 'Mapas', habilitado: true },
      { id: 'geocontenidos-panoramas', nombre: 'Panoramas', habilitado: true },
      { id: 'geocontenidos-geohistorias', nombre: 'Geo-historias', habilitado: true },
      { id: 'geocontenidos-tableros', nombre: 'Tableros de datos', habilitado: true },
      { id: 'geocontenidos-importar', nombre: 'Importar datos', habilitado: true },
      { id: 'geocontenidos-micrositios', nombre: 'Micrositios', habilitado: false },
    ],
  },
  {
    id: 'levantamiento',
    nombre: 'Levantamiento',
    ruta: '/levantamiento',
    descripcion: 'Gestión de aportes y proyectos de campo.',
    habilitado: true,
    submodulos: [
      { id: 'levantamiento-proyectos', nombre: 'Proyectos', habilitado: true },
      { id: 'levantamiento-aportes', nombre: 'Aportes', habilitado: true },
      { id: 'levantamiento-descargas', nombre: 'Descargas', habilitado: true },
      { id: 'levantamiento-revision-proyectos', nombre: 'Revisión de proyectos', habilitado: true },
      { id: 'levantamiento-revision-aportes', nombre: 'Revisión de aportes', habilitado: true },
      { id: 'levantamiento-revision-descargas', nombre: 'Revisión de descargas', habilitado: true },
    ],
  },
  {
    id: 'ia',
    nombre: 'Análisis IA',
    ruta: '/ia',
    descripcion: 'Chat semántico y proyectos de análisis con IA sobre documentos.',
    habilitado: false,
    submodulos: [
      { id: 'ia-proyectos', nombre: 'Proyectos IA', habilitado: false },
      { id: 'ia-chats', nombre: 'Chats', habilitado: false },
    ],
  },
]);

const expandido = reactive({});

function claseEstado(activo) {
  return activo
    ? 'texto-color-confirmacion fondo-color-confirmacion borde borde-color-confirmacion'
    : 'texto-color-neutro fondo-color-neutro borde borde-color-neutro';
}

// --- Roles ---
const rolesBase = reactive([
  {
    id: 'administrador',
    nombre: 'Administrador',
    color: 'confirmacion',
    descripcion:
      'Acceso completo a todos los módulos habilitados y a la configuración de la plataforma.',
  },
  {
    id: 'editor',
    nombre: 'Editor',
    color: 'informacion',
    descripcion: 'Puede crear y editar contenido en los módulos que tenga asignados.',
  },
  {
    id: 'visualizador',
    nombre: 'Visualizador',
    color: 'neutro',
    descripcion: 'Solo puede consultar el contenido de los módulos que tenga asignados.',
  },
]);

const rolesPersonalizados = reactive([
  {
    id: 'curador-metadatos',
    nombre: 'Curador de metadatos',
    color: 'acento',
    descripcion: 'Revisa y homologa categorías y metadatos publicados en el catálogo.',
    esPersonalizado: true,
  },
]);

const todosLosRoles = computed(() => [...rolesBase, ...rolesPersonalizados]);

// permisos[rolId] = array de ids de módulos asignados. Administrador no se
// guarda aquí: su acceso es siempre total sobre lo que esté habilitado.
const permisos = reactive({
  editor: ['catalogo', 'geocontenidos'],
  visualizador: ['catalogo', 'consulta'],
  'curador-metadatos': ['catalogo', 'consulta'],
});

function claseColorRol(color) {
  const mapa = {
    confirmacion:
      'texto-color-confirmacion fondo-color-confirmacion borde borde-color-confirmacion',
    informacion: 'texto-color-informacion fondo-color-informacion borde borde-color-informacion',
    neutro: 'texto-color-neutro fondo-color-neutro borde borde-color-neutro',
    acento: 'texto-color-acento fondo-color-acento borde borde-color-acento',
  };
  return mapa[color] ?? mapa.neutro;
}

function tienePermiso(rolId, moduloId) {
  if (rolId === 'administrador') return true;
  return permisos[rolId]?.includes(moduloId) ?? false;
}

function alternarPermiso(rol, modulo) {
  if (rol.id === 'administrador' || !modulo.habilitado) return;
  const lista = permisos[rol.id] ?? (permisos[rol.id] = []);
  const indice = lista.indexOf(modulo.id);
  if (indice === -1) lista.push(modulo.id);
  else lista.splice(indice, 1);
}

function totalModulosAccesibles(rol) {
  return modulos.filter((modulo) => modulo.habilitado && tienePermiso(rol.id, modulo.id)).length;
}

// --- Navegación interna: pestañas + alternancia general / detalle ---
const pestanaActiva = ref('modulos');
const vista = ref('general');
const moduloSeleccionado = ref(null);
const rolSeleccionado = ref(null);

function cambiarPestana(pestana) {
  pestanaActiva.value = pestana;
  volverAVistaGeneral();
}

function verDetalleModulo(modulo) {
  moduloSeleccionado.value = modulo;
  vista.value = 'detalle-modulo';
}

function verDetalleRol(rol) {
  rolSeleccionado.value = rol;
  vista.value = 'detalle-rol';
}

function volverAVistaGeneral() {
  vista.value = 'general';
  moduloSeleccionado.value = null;
  rolSeleccionado.value = null;
}

function rolesConAccesoA(moduloId) {
  return todosLosRoles.value.filter((rol) => tienePermiso(rol.id, moduloId));
}

// --- Modal Nuevo / Editar rol personalizado ---
const modalRol = ref(null);
const modoModalRol = ref('crear');
const formularioRol = reactive({ id: null, nombre: '', descripcion: '' });
let siguienteIdRol = 1;

function abrirModalNuevoRol() {
  modoModalRol.value = 'crear';
  formularioRol.id = null;
  formularioRol.nombre = '';
  formularioRol.descripcion = '';
  modalRol.value?.abrirModal();
}

function abrirModalEditarRol(rol) {
  modoModalRol.value = 'editar';
  formularioRol.id = rol.id;
  formularioRol.nombre = rol.nombre;
  formularioRol.descripcion = rol.descripcion;
  modalRol.value?.abrirModal();
}

function guardarRol() {
  if (!formularioRol.nombre.trim()) return;

  if (modoModalRol.value === 'crear') {
    const id = `personalizado-${siguienteIdRol++}`;
    rolesPersonalizados.push({
      id,
      nombre: formularioRol.nombre.trim(),
      descripcion: formularioRol.descripcion.trim(),
      color: 'acento',
      esPersonalizado: true,
    });
    permisos[id] = [];
  } else {
    const rol = rolesPersonalizados.find((item) => item.id === formularioRol.id);
    if (rol) {
      rol.nombre = formularioRol.nombre.trim();
      rol.descripcion = formularioRol.descripcion.trim();
    }
  }
  modalRol.value?.cerrarModal();
}

// --- Modal Eliminar rol personalizado ---
const modalEliminarRol = ref(null);
const rolAEliminar = ref(null);

function abrirModalEliminarRol(rol) {
  rolAEliminar.value = rol;
  modalEliminarRol.value?.abrirModal();
}

function confirmarEliminarRol() {
  const id = rolAEliminar.value?.id;
  const indice = rolesPersonalizados.findIndex((rol) => rol.id === id);
  if (indice !== -1) rolesPersonalizados.splice(indice, 1);
  delete permisos[id];
  if (vista.value === 'detalle-rol' && rolSeleccionado.value?.id === id) {
    volverAVistaGeneral();
  }
  modalEliminarRol.value?.cerrarModal();
}
</script>

<template>
  <div class="administracion-modulos-permisos">
    <template v-if="vista === 'general'">
      <div
        class="administracion-subtabs m-b-4"
        role="tablist"
        aria-label="Vista de módulos y permisos"
      >
        <button
          type="button"
          role="tab"
          :aria-selected="pestanaActiva === 'modulos'"
          :class="{ activa: pestanaActiva === 'modulos' }"
          @click="cambiarPestana('modulos')"
        >
          Módulos
        </button>
        <button
          type="button"
          role="tab"
          :aria-selected="pestanaActiva === 'permisos'"
          :class="{ activa: pestanaActiva === 'permisos' }"
          @click="cambiarPestana('permisos')"
        >
          Permisos
        </button>
      </div>

      <!-- ============ PESTAÑA MÓDULOS ============ -->
      <section v-if="pestanaActiva === 'modulos'" aria-label="Módulos">
        <p class="texto-color-secundario m-b-4">
          Estructura de módulos disponibles en la plataforma. Un módulo deshabilitado deja de poder
          asignarse a cualquier rol en la pestaña de Permisos.
        </p>

        <div
          v-for="modulo in modulos"
          :key="modulo.id"
          class="tarjeta administracion-modulo-tarjeta m-b-3"
        >
          <div class="tarjeta-cuerpo">
            <div class="flex flex-contenido-separado">
              <div class="administracion-modulo-info">
                <button
                  type="button"
                  class="administracion-expandir-boton"
                  :aria-expanded="Boolean(expandido[modulo.id])"
                  :aria-controls="`administracion-submodulos-${modulo.id}`"
                  @click="expandido[modulo.id] = !expandido[modulo.id]"
                >
                  <span
                    :class="
                      expandido[modulo.id] ? 'pictograma-angulo-abajo' : 'pictograma-angulo-derecho'
                    "
                    aria-hidden="true"
                  />
                  <strong>{{ modulo.nombre }}</strong>
                  <span class="texto-color-secundario"
                    >({{ modulo.submodulos.length }} submódulos)</span
                  >
                </button>
                <p class="texto-color-secundario m-0">{{ modulo.descripcion }}</p>
                <p class="texto-color-secundario m-0">
                  <code>{{ modulo.ruta }}</code>
                </p>
              </div>

              <div class="flex flex-vertical-centrado administracion-modulo-acciones">
                <span class="p-1 borde-redondeado-8" :class="claseEstado(modulo.habilitado)">
                  {{ modulo.habilitado ? 'Activo' : 'Inactivo' }}
                </span>
                <AdministracionSwitch
                  v-model="modulo.habilitado"
                  ocultar-texto
                  :aria-label="`Alternar módulo ${modulo.nombre}`"
                />
                <button
                  type="button"
                  class="boton-secundario boton-chico"
                  @click="verDetalleModulo(modulo)"
                >
                  Ver detalle
                </button>
              </div>
            </div>

            <ul
              v-if="expandido[modulo.id]"
              :id="`administracion-submodulos-${modulo.id}`"
              class="administracion-submodulos m-t-3"
            >
              <li
                v-for="sub in modulo.submodulos"
                :key="sub.id"
                class="flex flex-contenido-separado"
              >
                <span :class="{ 'texto-color-secundario': !modulo.habilitado }">{{
                  sub.nombre
                }}</span>
                <div class="flex flex-vertical-centrado" style="gap: 12px">
                  <span
                    class="p-1 borde-redondeado-8"
                    :class="claseEstado(modulo.habilitado && sub.habilitado)"
                  >
                    {{ modulo.habilitado && sub.habilitado ? 'Activo' : 'Inactivo' }}
                  </span>
                  <AdministracionSwitch
                    v-model="sub.habilitado"
                    :disabled="!modulo.habilitado"
                    ocultar-texto
                    :aria-label="`Alternar submódulo ${sub.nombre}`"
                  />
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <!-- ============ PESTAÑA PERMISOS ============ -->
      <section v-else aria-label="Permisos">
        <p class="texto-color-secundario m-b-4">
          Roles disponibles en la plataforma y los módulos a los que cada uno puede acceder. Las
          columnas en gris corresponden a módulos deshabilitados en la pestaña Módulos y no pueden
          asignarse.
        </p>

        <div class="flex m-b-4">
          <div v-for="rol in rolesBase" :key="rol.id" class="columna-5">
            <div class="tarjeta administracion-rol-tarjeta">
              <div class="tarjeta-cuerpo">
                <span class="p-1 borde-redondeado-8" :class="claseColorRol(rol.color)">{{
                  rol.nombre
                }}</span>
                <p class="m-t-2 m-b-2">{{ rol.descripcion }}</p>
                <p class="texto-color-secundario m-0">
                  {{ totalModulosAccesibles(rol) }} módulo(s) accesibles
                </p>
                <button
                  type="button"
                  class="boton-secundario boton-chico m-t-2"
                  @click="verDetalleRol(rol)"
                >
                  Ver detalle
                </button>
              </div>
            </div>
          </div>
        </div>

        <h3>Asociación de módulos por rol</h3>
        <div class="contenedor-tabla m-b-4">
          <table class="tabla-expandida">
            <caption>
              Matriz de acceso módulo por rol
            </caption>
            <thead>
              <tr>
                <th scope="col">Módulo</th>
                <th v-for="rol in todosLosRoles" :key="rol.id" scope="col">{{ rol.nombre }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="modulo in modulos"
                :key="modulo.id"
                :class="{ 'administracion-fila-inactiva': !modulo.habilitado }"
              >
                <td>
                  {{ modulo.nombre }}
                  <span v-if="!modulo.habilitado" class="texto-color-neutro"> (deshabilitado)</span>
                </td>
                <td v-for="rol in todosLosRoles" :key="rol.id">
                  <span
                    v-if="rol.id === 'administrador'"
                    v-globo-informacion="'Acceso completo, no editable'"
                    class="pictograma-aprobado texto-color-confirmacion"
                    :class="{ 'texto-color-neutro': !modulo.habilitado }"
                    aria-label="Acceso completo"
                  />
                  <AdministracionSwitch
                    v-else
                    :model-value="tienePermiso(rol.id, modulo.id)"
                    :disabled="!modulo.habilitado"
                    ocultar-texto
                    :aria-label="`Alternar acceso de ${rol.nombre} a ${modulo.nombre}`"
                    @update:model-value="alternarPermiso(rol, modulo)"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex flex-contenido-separado m-b-3">
          <h3 class="m-0">Roles personalizados</h3>
          <button type="button" class="boton-primario boton-chico" @click="abrirModalNuevoRol">
            <span class="pictograma-agregar" aria-hidden="true" /> Nuevo rol
          </button>
        </div>

        <div class="flex m-b-4">
          <div v-for="rol in rolesPersonalizados" :key="rol.id" class="columna-5">
            <div class="tarjeta administracion-rol-tarjeta">
              <div class="tarjeta-cuerpo">
                <span class="p-1 borde-redondeado-8" :class="claseColorRol(rol.color)">{{
                  rol.nombre
                }}</span>
                <p class="m-t-2 m-b-2">{{ rol.descripcion }}</p>
                <p class="texto-color-secundario m-0">
                  {{ totalModulosAccesibles(rol) }} módulo(s) accesibles
                </p>
                <div class="flex m-t-2" style="gap: 8px">
                  <button
                    type="button"
                    class="boton-secundario boton-chico"
                    @click="verDetalleRol(rol)"
                  >
                    Ver detalle
                  </button>
                  <button
                    type="button"
                    class="boton-pictograma boton-secundario"
                    aria-label="Editar rol"
                    @click="abrirModalEditarRol(rol)"
                  >
                    <span class="pictograma-editar" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    class="boton-pictograma boton-secundario"
                    aria-label="Eliminar rol"
                    @click="abrirModalEliminarRol(rol)"
                  >
                    <span class="pictograma-eliminar" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <p v-if="!rolesPersonalizados.length" class="texto-color-secundario">
            Aún no hay roles personalizados.
          </p>
        </div>

        <h3>Usuarios y accesos individuales</h3>
        <p class="texto-color-secundario m-b-3">
          Cada usuario hereda los módulos del rol que tenga asignado en el directorio.
        </p>
        <AdministracionUsuarios />
      </section>
    </template>

    <!-- ============ DETALLE DE MÓDULO ============ -->
    <section v-else-if="vista === 'detalle-modulo'" aria-label="Detalle de módulo">
      <button type="button" class="boton-secundario boton-chico m-b-3" @click="volverAVistaGeneral">
        <span class="pictograma-flecha-izquierda" aria-hidden="true" /> Volver a la vista general
      </button>

      <div class="flex flex-contenido-separado">
        <div>
          <h2 class="m-0">{{ moduloSeleccionado.nombre }}</h2>
          <p class="texto-color-secundario m-0">
            <code>{{ moduloSeleccionado.ruta }}</code>
          </p>
        </div>
        <div class="flex flex-vertical-centrado" style="gap: 12px">
          <span class="p-1 borde-redondeado-8" :class="claseEstado(moduloSeleccionado.habilitado)">
            {{ moduloSeleccionado.habilitado ? 'Activo' : 'Inactivo' }}
          </span>
          <AdministracionSwitch
            v-model="moduloSeleccionado.habilitado"
            :aria-label="`Alternar módulo ${moduloSeleccionado.nombre}`"
          />
        </div>
      </div>

      <p class="m-t-3">{{ moduloSeleccionado.descripcion }}</p>

      <h3>Submódulos</h3>
      <ul class="administracion-submodulos">
        <li
          v-for="sub in moduloSeleccionado.submodulos"
          :key="sub.id"
          class="flex flex-contenido-separado"
        >
          <span>{{ sub.nombre }}</span>
          <span
            class="p-1 borde-redondeado-8"
            :class="claseEstado(moduloSeleccionado.habilitado && sub.habilitado)"
          >
            {{ moduloSeleccionado.habilitado && sub.habilitado ? 'Activo' : 'Inactivo' }}
          </span>
        </li>
      </ul>

      <h3>Roles con acceso a este módulo</h3>
      <div v-if="rolesConAccesoA(moduloSeleccionado.id).length" class="flex" style="gap: 8px">
        <span
          v-for="rol in rolesConAccesoA(moduloSeleccionado.id)"
          :key="rol.id"
          class="p-1 borde-redondeado-8"
          :class="claseColorRol(rol.color)"
        >
          {{ rol.nombre }}
        </span>
      </div>
      <p v-else class="texto-color-secundario">Ningún rol tiene acceso a este módulo todavía.</p>
    </section>

    <!-- ============ DETALLE DE ROL ============ -->
    <section v-else-if="vista === 'detalle-rol'" aria-label="Detalle de rol">
      <button type="button" class="boton-secundario boton-chico m-b-3" @click="volverAVistaGeneral">
        <span class="pictograma-flecha-izquierda" aria-hidden="true" /> Volver a la vista general
      </button>

      <div class="flex flex-contenido-separado">
        <div>
          <span class="p-1 borde-redondeado-8" :class="claseColorRol(rolSeleccionado.color)">
            {{ rolSeleccionado.nombre }}
          </span>
          <p class="m-t-2">{{ rolSeleccionado.descripcion }}</p>
        </div>
        <div v-if="rolSeleccionado.esPersonalizado" class="flex" style="gap: 8px">
          <button
            type="button"
            class="boton-secundario boton-chico"
            @click="abrirModalEditarRol(rolSeleccionado)"
          >
            <span class="pictograma-editar" aria-hidden="true" /> Editar
          </button>
          <button
            type="button"
            class="boton-secundario boton-chico"
            @click="abrirModalEliminarRol(rolSeleccionado)"
          >
            <span class="pictograma-eliminar" aria-hidden="true" /> Eliminar
          </button>
        </div>
      </div>

      <h3>Módulos asignados</h3>
      <ul class="administracion-submodulos">
        <li
          v-for="modulo in modulos"
          :key="modulo.id"
          class="flex flex-contenido-separado"
          :class="{ 'administracion-fila-inactiva': !modulo.habilitado }"
        >
          <span :class="{ 'texto-color-neutro': !modulo.habilitado }">
            {{ modulo.nombre }}
            <span v-if="!modulo.habilitado" class="texto-color-neutro">(deshabilitado)</span>
          </span>
          <span
            v-if="rolSeleccionado.id === 'administrador'"
            v-globo-informacion="'Acceso completo, no editable'"
            class="pictograma-aprobado texto-color-confirmacion"
            :class="{ 'texto-color-neutro': !modulo.habilitado }"
            aria-label="Acceso completo"
          />
          <AdministracionSwitch
            v-else
            :model-value="tienePermiso(rolSeleccionado.id, modulo.id)"
            :disabled="!modulo.habilitado"
            ocultar-texto
            :aria-label="`Alternar acceso de ${rolSeleccionado.nombre} a ${modulo.nombre}`"
            @update:model-value="alternarPermiso(rolSeleccionado, modulo)"
          />
        </li>
      </ul>
    </section>

    <ClientOnly>
      <SisdaiModal ref="modalRol">
        <template #encabezado>
          <h2>{{ modoModalRol === 'crear' ? 'Nuevo rol personalizado' : 'Editar rol' }}</h2>
        </template>
        <template #cuerpo>
          <label for="rol-nombre">Nombre</label>
          <input id="rol-nombre" v-model="formularioRol.nombre" type="text" class="m-b-2" />

          <label for="rol-descripcion">Descripción</label>
          <textarea
            id="rol-descripcion"
            v-model="formularioRol.descripcion"
            rows="3"
            class="m-b-2"
          />
        </template>
        <template #pie>
          <button
            class="boton-secundario boton-chico"
            type="button"
            @click="modalRol.cerrarModal()"
          >
            Cancelar
          </button>
          <button class="boton-primario boton-chico" type="button" @click="guardarRol">
            Guardar
          </button>
        </template>
      </SisdaiModal>

      <SisdaiModal ref="modalEliminarRol">
        <template #encabezado>
          <h2>Eliminar rol</h2>
        </template>
        <template #cuerpo>
          <p>
            ¿Deseas eliminar el rol <strong>{{ rolAEliminar?.nombre }}</strong
            >? Los usuarios que lo tengan asignado se quedarán sin ese rol.
          </p>
        </template>
        <template #pie>
          <button
            class="boton-secundario boton-chico"
            type="button"
            @click="modalEliminarRol.cerrarModal()"
          >
            Cancelar
          </button>
          <button class="boton-primario boton-chico" type="button" @click="confirmarEliminarRol">
            Eliminar
          </button>
        </template>
      </SisdaiModal>
    </ClientOnly>
  </div>
</template>

<style lang="scss" scoped>
.administracion-subtabs {
  display: inline-flex;
  gap: 4px;
  padding: 4px;
  background-color: var(--color-neutro-1, #f2f2f2);
  border-radius: 8px;
  width: fit-content;

  button {
    padding: 8px 20px;
    font-weight: 600;
    border-radius: 6px;
    border: none;
    background: transparent;
    color: var(--texto-secundario);
    box-shadow: none;
    cursor: pointer;

    &.activa {
      background-color: var(--fondo-primario, #ffffff);
      color: var(--color-primario-2, #691c32);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
    }
  }
}

.administracion-modulo-tarjeta {
  .administracion-expandir-boton {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: none;
    padding: 0;
    box-shadow: none;
    cursor: pointer;
    font-size: 1rem;
    margin-bottom: 4px;
  }

  .administracion-modulo-acciones {
    gap: 16px;
    flex: 0 0 auto;
  }
}

.administracion-submodulos {
  list-style: none;
  margin: 0;
  padding: 12px 0 0 28px;
  border-top: 1px solid var(--boton-secundario-deshabilitado-borde, #e0e0e0);

  li {
    align-items: center;
    padding: 8px 0;

    &:not(:last-child) {
      border-bottom: 1px solid var(--boton-secundario-deshabilitado-borde, #e0e0e0);
    }
  }
}

.administracion-rol-tarjeta {
  height: 100%;
}

.contenedor-tabla {
  width: 100%;
  overflow-x: auto;

  table {
    width: 100%;
  }
}

.administracion-fila-inactiva {
  opacity: 0.6;
}
</style>
