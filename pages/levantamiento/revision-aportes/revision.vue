<script setup>
import { ref, computed, watch } from 'vue';

definePageMeta({
  middleware: 'auth',
});

const storeLevantamiento = useLevantamientoStore();

// Data Dummy para probar funcionalidad
const aportesEnRevision = ref(Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  titulo: `Cámara de cultivo ${i + 1}`,
  fecha: `14/11/2025 10:${40 + i} AM`,
  folio: `F-65${i}/NO REVISADO`,
  proyecto: `Proyecto prueba ${i % 2 === 0 ? 'A' : 'B'}`,
  estado: i < 3 ? 'Revisando' : 'Por revisar',
  progreso: Math.floor(Math.random() * 100), 
  registrante: `Usuario Registrante ${i + 1}`, 
  fotos: [ 
    'https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/kale-1.jpg',
    i % 2 === 0 ? 'https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/kale-1.jpg' : '',
    ''
  ],
  // === NUEVO: Array de mensajes dummy ===
  mensajes: [
    { id: 1, autor: 'Revisor', texto: '¿Podrías confirmar la ubicación exacta en el mapa?', fecha: '10:00 AM' },
    { id: 2, autor: 'Tú', texto: 'Claro, es justo en la intersección principal.', fecha: '10:15 AM' }
  ],
  detalle: {
    preguntaAbierta: `Esta es una respuesta sumamente larga para el aporte ${i + 1} que seguramente se cortará en el input y requerirá hover para leerse por completo...`,
    siNo: i % 2 === 0 ? 'Sí' : 'No',
    seleccionSimple: `Opción seleccionada número ${ (i % 3) + 1 } con texto extra`,
    porqueSi: i % 2 === 0 ? `Porque el proyecto ${i + 1} lo requiere de manera estricta según los lineamientos.` : 'No aplica',
    seleccionMultiple: `Opción 1, Opción ${ (i % 4) + 2 }, Otra opción más para hacer bulto`,
    colonia: `Colonia Centro Histórico Ampliación ${i + 1}`,
    calle: `Avenida Principal de los Insurgentes Sur ${100 + i}`,
    ciudad: 'Ciudad de México, Entidad Federativa'
  }
})));

const busqueda = ref('');

const aportesFiltrados = computed(() => {
  if (!busqueda.value) return aportesEnRevision.value;
  return aportesEnRevision.value.filter(aporte => 
    aporte.titulo.toLowerCase().includes(busqueda.value.toLowerCase())
  );
});

const paginaActual = ref(1);
const itemsPorPagina = 5;

const totalPaginas = computed(() => 
  Math.ceil(aportesFiltrados.value.length / itemsPorPagina) || 1
);

const aportesPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * itemsPorPagina;
  const fin = inicio + itemsPorPagina;
  return aportesFiltrados.value.slice(inicio, fin);
});

watch(busqueda, () => {
  paginaActual.value = 1;
});

function irAPagina(pagina) {
  if (pagina >= 1 && pagina <= totalPaginas.value) {
    paginaActual.value = pagina;
  }
}

const aporteSeleccionado = ref(aportesEnRevision.value[0]);

function verFichaAporte(aporte) {
  aporteSeleccionado.value = aporte;
}

// === Lógica para el visor de imágenes ===
const imagenAmpliada = ref(null);

function abrirImagen(url) {
  if (url) {
    imagenAmpliada.value = url;
  }
}

function cerrarImagen() {
  imagenAmpliada.value = null;
}

// === NUEVO: Lógica para el modal de mensajes ===
const modalMensajesAbierto = ref(false);

function abrirMensajes() {
  modalMensajesAbierto.value = true;
}

function cerrarMensajes() {
  modalMensajesAbierto.value = false;
}
</script>

<template>
  <UiLayoutPaneles :estado-colapable="storeLevantamiento.catalogoColapsado">
    <template #catalogo>
      <LevantamientoListaMenuLateral />
    </template>

    <template #visualizador>
      <main id="principal" class="contenedor m-b-10 m-t-3">
        <!-- Menú superior -->
        <LevantamientoMenuSecundario
          :opciones="[
            { texto: 'Aprobados', ruta: '/levantamiento/revision-aportes' },
            { texto: 'En revisión', ruta: '/levantamiento/revision-aportes/revision', notificacion: false },
            { texto: 'Rechazados', ruta: '/levantamiento/revision-aportes/rechazados', notificacion: false },
          ]"
        />

        <div class="flex m-b-3" style="align-items: center; gap: 8px;">
          <h2>Revisión del estado de los aportes</h2>
          <UiNumeroElementos :numero="aportesFiltrados.length" />
        </div>

        <div class="grid">
          
          <!-- COLUMNA IZQUIERDA -->
          <div class="columna-5 flex flex-columna">
            <div class="m-b-3">
              <input 
                v-model="busqueda" 
                type="text" 
                placeholder="Buscar por título de aporte..." 
                class="ancho-completo p-1 form-input" 
                style="background: white; border-color: #ccc; color: #333;"
              />
            </div>

            <!-- Lista de tarjetas iteradas -->
            <div class="flex flex-columna" style="gap: 12px; flex-grow: 1;">
              <div 
                v-for="aporte in aportesPaginados" 
                :key="aporte.id"
                class="tarjeta-aporte cursor-pointer p-2 borde borde-redondeado-8"
                :class="{ 'seleccionada': aporteSeleccionado?.id === aporte.id }"
                @click="verFichaAporte(aporte)"
              >
                <div class="flex m-b-1">
                  <div class="icono-doc m-r-2">📄</div>
                  <div style="flex-grow: 1; overflow: hidden;">
                    <p class="titulo m-0"><strong>{{ aporte.titulo }}</strong></p>
                    <p class="texto-secundario m-0 text-chico">{{ aporte.fecha }}</p>
                    <p class="texto-secundario m-0 text-chico">{{ aporte.folio }}</p>
                    <p class="texto-secundario m-0 text-chico">{{ aporte.proyecto }}</p>
                  </div>
                </div>
                
                <!-- Barra de progreso -->
                <div class="contenedor-progreso m-t-2">
                  <div class="flex" style="justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <span class="text-chico texto-porcentaje">Progreso del aporte</span>
                    <span class="text-chico texto-porcentaje"><strong>{{ aporte.progreso }}%</strong></span>
                  </div>
                  <div class="barra-fondo">
                    <div class="barra-relleno" :style="{ width: aporte.progreso + '%' }"></div>
                  </div>
                </div>
              </div>

              <!-- Mensaje sin resultados -->
              <div v-if="aportesFiltrados.length === 0" class="texto-centrado p-3" style="color: #888;">
                No se encontraron aportes.
              </div>
            </div>

            <!-- Controles de Paginación -->
            <div class="paginacion flex m-t-3" v-if="totalPaginas > 1">
              <button @click="irAPagina(paginaActual - 1)" :disabled="paginaActual === 1" class="btn-paginacion">&lt;</button>
              <button 
                v-for="pagina in totalPaginas" 
                :key="pagina"
                @click="irAPagina(pagina)"
                class="btn-paginacion"
                :class="{ 'activa': paginaActual === pagina }"
              >
                {{ pagina }}
              </button>
              <button @click="irAPagina(paginaActual + 1)" :disabled="paginaActual === totalPaginas" class="btn-paginacion">&gt;</button>
            </div>
          </div>

          <!-- COLUMNA DERECHA: FICHA DEL PROYECTO -->
          <div class="columna-11">
            <div class="tarjeta-ficha p-4 borde borde-redondeado-8" v-if="aporteSeleccionado">
              <div class="flex m-b-3" style="justify-content: space-between; align-items: center;">
                <h3 class="m-0">Ficha de proyecto: <span style="font-weight: normal; color: #715B62;">{{ aporteSeleccionado.titulo }}</span></h3>
                <div class="flex" style="gap: 8px;">
                  <button class="boton-secundario boton-chico">GeoJson</button>
                  <button class="boton-secundario boton-chico">KML</button>
                  <button class="boton-secundario boton-chico">Shapefile</button>
                  <!-- NUEVO: Botón adaptado para abrir el modal -->
                  <button class="boton-secundario boton-chico" @click="abrirMensajes">Mensajes</button>
                </div>
              </div>

              <!-- Placeholder del Mapa -->
              <div class="mapa-placeholder m-b-3">
                <p>Mapa Satelital aquí</p>
              </div>

              <!-- Metadatos del Registrante -->
              <div class="m-b-3 flex" style="gap: 8px; align-items: center;">
                <span class="form-label" style="margin-bottom: 0;">NOMBRE DEL REGISTRANTE:</span>
                <span style="color: #334155; font-size: 0.9rem; font-weight: 500;">{{ aporteSeleccionado.registrante }}</span>
              </div>

              <!-- Galería de Fotografías (Máximo 3) -->
              <div class="flex m-b-4" style="gap: 16px; justify-content: center;">
                <template v-for="(foto, index) in aporteSeleccionado.fotos.slice(0, 3)" :key="index">
                  <div 
                    v-if="foto" 
                    class="imagen-miniatura bg-imagen miniatura-interactiva" 
                    :style="{ backgroundImage: `url(${foto})` }"
                    @click="abrirImagen(foto)"
                  ></div>
                  <div v-else class="imagen-miniatura bg-placeholder">
                    <span style="color: #94a3b8; font-size: 0.75rem;">Sin imagen</span>
                  </div>
                </template>
              </div>

              <!-- Formulario de revisión -->
              <div class="grid m-b-4" style="gap: 16px;">
                <div class="columna-8">
                  <label class="form-label">1.- PREGUNTA ABIERTA</label>
                  <input type="text" class="ancho-completo form-input" readonly :value="aporteSeleccionado.detalle.preguntaAbierta" :title="aporteSeleccionado.detalle.preguntaAbierta" />
                </div>
                <div class="columna-8">
                  <label class="form-label">4.- ¿SI O NO?</label>
                  <input type="text" class="ancho-completo form-input" readonly :value="aporteSeleccionado.detalle.siNo" :title="aporteSeleccionado.detalle.siNo" />
                </div>
                <div class="columna-8">
                  <label class="form-label">2.- SELECCIÓN SIMPLE</label>
                  <input type="text" class="ancho-completo form-input" readonly :value="aporteSeleccionado.detalle.seleccionSimple" :title="aporteSeleccionado.detalle.seleccionSimple" />
                </div>
                <div class="columna-8">
                  <label class="form-label">4.1.- ¿POR QUÉ SÍ?</label>
                  <input type="text" class="ancho-completo form-input" readonly :value="aporteSeleccionado.detalle.porqueSi" :title="aporteSeleccionado.detalle.porqueSi" />
                </div>
                <div class="columna-8">
                  <label class="form-label">3.- SELECCIÓN MÚLTIPLE</label>
                  <input type="text" class="ancho-completo form-input" readonly :value="aporteSeleccionado.detalle.seleccionMultiple" :title="aporteSeleccionado.detalle.seleccionMultiple" />
                </div>
                <div class="columna-8">
                  <label class="form-label">5.- COLONIA</label>
                  <input type="text" class="ancho-completo form-input" readonly :value="aporteSeleccionado.detalle.colonia" :title="aporteSeleccionado.detalle.colonia" />
                </div>
                <div class="columna-16">
                  <label class="form-label">5.1.- CALLE</label>
                  <input type="text" class="ancho-completo form-input" readonly :value="aporteSeleccionado.detalle.calle" :title="aporteSeleccionado.detalle.calle" />
                </div>
                <div class="columna-16">
                  <label class="form-label">5.2.- CIUDAD</label>
                  <input type="text" class="ancho-completo form-input" readonly :value="aporteSeleccionado.detalle.ciudad" :title="aporteSeleccionado.detalle.ciudad" />
                </div>
              </div>

              <!-- Botones de aceptación y rechazo -->
              <div class="flex" style="justify-content: center; gap: 24px; padding-top: 1rem; border-top: 1px solid #e0e0e0;">
                <button class="btn-moderno btn-aprobar">
                  <span class="icono">✓</span> APROBAR APORTE
                </button>
                <button class="btn-moderno btn-rechazar">
                  <span class="icono">✕</span> RECHAZAR APORTE
                </button>
              </div>

            </div>
          </div>
        </div>
      </main>

      <!-- Modal de Mensajes-->
      <Teleport to="body">
        <div v-if="modalMensajesAbierto" class="modal-overlay" @click="cerrarMensajes">
          <div class="modal-mensajes-contenido" @click.stop>
            <div class="modal-mensajes-header">
              <h4 class="m-0" style="color: #334155;">Mensajes del Aporte</h4>
              <button class="btn-cerrar-sutil" @click="cerrarMensajes">✕</button>
            </div>
            
            <div class="chat-area">
              <div 
                v-for="msj in aporteSeleccionado.mensajes" 
                :key="msj.id" 
                :class="['burbuja', msj.autor === 'Tú' ? 'propia' : 'ajena']"
              >
                <div style="font-weight: bold; font-size: 0.7rem; margin-bottom: 4px;">{{ msj.autor }}</div>
                <p class="m-0">{{ msj.texto }}</p>
                <span class="fecha-msj">{{ msj.fecha }}</span>
              </div>
              <div v-if="aporteSeleccionado.mensajes.length === 0" class="texto-centrado" style="color: #94a3b8; font-size: 0.85rem; margin-top: 2rem;">
                No hay mensajes para este aporte.
              </div>
            </div>
            
            <div class="chat-input-area">
              <input type="text" placeholder="Escribe un mensaje..." class="input-chat" />
              <button class="btn-enviar-chat">Enviar</button>
            </div>
          </div>
        </div>
      </Teleport>

      <!--Modal de Imagen Ampliada-->
      <Teleport to="body">
        <div v-if="imagenAmpliada" class="modal-imagen-overlay" @click="cerrarImagen">
          <div class="modal-imagen-contenido" @click.stop>
            <button class="btn-cerrar-imagen" @click="cerrarImagen">✕</button>
            <img :src="imagenAmpliada" alt="Vista previa de evidencia" class="imagen-grande" />
          </div>
        </div>
      </Teleport>

    </template>
  </UiLayoutPaneles>
</template>

<style lang="scss" scoped>
/* Utilidades base */
.cursor-pointer { cursor: pointer; }
.text-chico { font-size: 0.75rem; }
.ancho-completo { width: 100%; box-sizing: border-box; }
.flex-columna { flex-direction: column; }

/* TARJETAS LATERALES*/
.tarjeta-aporte {
  /* ESTADO NORMAL / NO SELECCIONADO */
  background-color: #715B62;
  border: 1px solid #715B62;
  transition: all 0.25s ease;
  
  .icono-doc, .titulo, .texto-secundario, .texto-porcentaje {
    color: #FFFFFF !important;
  }
  
  .barra-fondo {
    height: 6px;
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
    overflow: hidden;
  }
  .barra-relleno {
    height: 100%;
    background-color: #D48D95; 
    border-radius: 3px;
    transition: width 0.3s ease;
  }

  &:hover:not(.seleccionada) {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    filter: brightness(1.05);
  }

  /* ESTADO SELECCIONADO */
  &.seleccionada {
    background-color: #D48D95;
    border-color: #D48D95;
    
    .icono-doc, .titulo, .texto-secundario, .texto-porcentaje {
      color: #391821 !important;
    }
    
    .barra-fondo {
      background-color: rgba(255, 255, 255, 0.4); 
    }
    .barra-relleno {
      background-color: #391821; 
    }
  }
}

/* Paginación */
.paginacion {
  justify-content: center;
  gap: 8px;
  
  .btn-paginacion {
    background: transparent;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 4px 10px;
    cursor: pointer;
    transition: all 0.2s;
    font-weight: 500;
    color: #444;

    &:hover:not(:disabled) { background: #eee; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
    &.activa {
      background-color: #715B62;
      color: #FFFFFF;
      border-color: #715B62;
    }
  }
}

/* FICHA Y FORMULARIOS*/
.tarjeta-ficha {
  background-color: #ffffff;
  box-shadow: 0 2px 10px rgba(0,0,0,0.03);
}

.mapa-placeholder {
  height: 250px; 
  background-color: #f8fafc; 
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  display: flex; 
  align-items: center; 
  justify-content: center;
  color: #94a3b8;
  font-weight: 500;
}

.form-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  display: block;
  margin-bottom: 6px;
  letter-spacing: 0.3px;
}

/* FOTOGRAFÍAS*/
.imagen-miniatura {
  width: 120px;
  height: 80px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.bg-imagen {
  background-size: cover;
  background-position: center;
}

.bg-placeholder {
  background-color: #f1f5f9;
}

.miniatura-interactiva {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  }
}

/* MODAL DE IMÁGENES */
.modal-imagen-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(30, 41, 59, 0.9); 
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.modal-imagen-contenido {
  position: relative;
  background: white;
  padding: 8px;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeInZoom 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.btn-cerrar-imagen {
  position: absolute;
  top: -12px;
  right: -12px;
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(239, 68, 68, 0.4);
  transition: all 0.2s ease;
  z-index: 10;

  &:hover {
    background-color: #dc2626;
    transform: scale(1.1);
  }
}

.imagen-grande {
  max-width: 100%;
  max-height: 85vh;
  border-radius: 6px;
  display: block;
}

@keyframes fadeInZoom {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

/* === NUEVO: ESTILOS MODAL DE MENSAJES === */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  background-color: rgba(15, 23, 42, 0.6);
  display: flex; align-items: center; justify-content: center;
  z-index: 9998;
  backdrop-filter: blur(2px);
}

.modal-mensajes-contenido {
  background: #ffffff;
  width: 100%; max-width: 450px; height: 70vh;
  border-radius: 12px; display: flex; flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: fadeInZoom 0.2s ease-out;
  overflow: hidden;
}

.modal-mensajes-header {
  padding: 16px 20px;
  background-color: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  display: flex; justify-content: space-between; align-items: center;
}

.btn-cerrar-sutil {
  background: transparent; border: none; color: #94a3b8; font-size: 1.2rem; cursor: pointer; transition: color 0.2s;
  &:hover { color: #ef4444; }
}

.chat-area {
  flex: 1; padding: 20px; overflow-y: auto; background-color: #f1f5f9; display: flex; flex-direction: column; gap: 12px;
}

.burbuja {
  padding: 12px 16px; border-radius: 12px; max-width: 85%; font-size: 0.9rem; line-height: 1.4; position: relative;
}

.ajena {
  background-color: #ffffff; color: #334155; border: 1px solid #e2e8f0; align-self: flex-start; border-bottom-left-radius: 4px;
}

.propia {
  background-color: #715B62; color: #ffffff; align-self: flex-end; border-bottom-right-radius: 4px;
}

.fecha-msj {
  display: block; font-size: 0.65rem; margin-top: 6px; text-align: right;
}

.ajena .fecha-msj { color: #94a3b8; }
.propia .fecha-msj { color: rgba(255,255,255,0.7); }

.chat-input-area {
  padding: 16px; background-color: #ffffff; border-top: 1px solid #e2e8f0; display: flex; gap: 12px;
}

.input-chat {
  flex: 1; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 20px; font-size: 0.9rem; transition: border-color 0.2s;
  &:focus { outline: none; border-color: #715B62; }
}

.btn-enviar-chat {
  background-color: #10b981; color: white; border: none; padding: 0 20px; border-radius: 20px; font-weight: 600; cursor: pointer; transition: background 0.2s;
  &:hover { background-color: #059669; }
}

/* Inputs form originales */
.form-input {
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 10px 14px;
  color: #334155;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  box-shadow: 0 1px 2px rgba(0,0,0,0.02);
  
  /* Lógica para textos largos */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover, &:focus {
    outline: none;
    background-color: #715B62; 
    color: #FFFFFF; 
    border-color: #715B62;
    box-shadow: 0 4px 6px rgba(113, 91, 98, 0.2);
    cursor: pointer;
  }
}

/*BOTONES */
.btn-moderno {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 28px;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  cursor: pointer;
  color: white;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  .icono { font-size: 1.1rem; font-weight: bold; }

  &:hover {
    transform: translateY(-2px); 
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15); 
    filter: brightness(1.05);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
}

.btn-aprobar { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
.btn-rechazar { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); }
</style>