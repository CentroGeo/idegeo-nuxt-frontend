<script setup>
import { ref, computed, watch } from 'vue';

definePageMeta({
  middleware: 'auth',
});

const storeLevantamiento = useLevantamientoStore();

// MOCK DATA: Aportes Rechazados
const aportesRechazados = ref(Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  titulo: `un planton calle x ponce y ${i + 1}`,
  fecha: `07/11/2025 07:${40 + i} PM`,
  folio: `F-85${i} RECHAZADO`,
  proyecto: `Proyecto diario`,
  estado: 'RECHAZADO',
  registrante: 'Irving Sanchez',
  atendidoPor: 'Saul Morgado',
  fotos: [ 
    'https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/kale-1.jpg',
    i % 2 === 0 ? 'https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/kale-1.jpg' : '',
    ''
  ],
  mensajes: [
    { id: 1, autor: 'Revisor', texto: 'La fotografía no es clara y no coincide con la ubicación reportada.', fecha: '10:00 AM' },
    { id: 2, autor: 'Tú', texto: 'Entendido, pediré que se vuelva a tomar la evidencia.', fecha: '10:15 AM' }
  ],
  detalle: {
    preguntaAbierta: `esto es una prueba ${i + 1}. Un texto lo suficientemente largo para demostrar que nuestro hover moderno sigue funcionando a la perfección...`,
    preguntaOpcion: `opción ${ (i % 3) + 1 }`,
    seleccionMultiple: `Opción 1, Opción 3, Opción 5`
  }
})));

// Lógica de búsqueda
const busqueda = ref('');

const aportesFiltrados = computed(() => {
  if (!busqueda.value) return aportesRechazados.value;
  return aportesRechazados.value.filter(aporte => 
    aporte.titulo.toLowerCase().includes(busqueda.value.toLowerCase())
  );
});

// Paginación
const paginaActual = ref(1);
const itemsPorPagina = 8; 

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

// Selección de tarjeta
const aporteSeleccionado = ref(aportesRechazados.value[0]);

function verFichaAporte(aporte) {
  aporteSeleccionado.value = aporte;
}

// LÓGICA DEL VISOR DE IMÁGENES 
const imagenAmpliada = ref(null);

function abrirImagen(url) {
  if (url) {
    imagenAmpliada.value = url;
  }
}

function cerrarImagen() {
  imagenAmpliada.value = null;
}

// LÓGICA DEL MODAL DE MENSAJES
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
        <!-- Menú secundario-->
        <LevantamientoMenuSecundario
          :opciones="[
            { texto: 'Aprobados', ruta: '/levantamiento/revision-aportes' },
            {
              texto: 'En revisión',
              ruta: '/levantamiento/revision-aportes/revision'
            },
            {
              texto: 'Rechazados',
              ruta: '/levantamiento/revision-aportes/rechazados',
            },
          ]"
        />

        <!--Contenedor del título-->
        <div class="flex titulo-contenido-levantamiento m-b-3">
          <h2>Aportes rechazados</h2>
          <UiNumeroElementos :numero="aportesFiltrados.length" />
        </div>

        <div class="grid">
          
          <!--Columna de las cards -->
          <div class="columna-5 flex flex-columna">
            
            <!-- Buscador -->
            <div class="m-b-2">
              <input 
                v-model="busqueda" 
                type="text" 
                placeholder="Búsqueda de aportes" 
                class="ancho-completo p-1 form-input m-b-1" 
                style="background: white; border-color: #cbd5e1; color: #333;"
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
                <div class="flex">
                  <div class="icono-doc m-r-2">📄</div>
                  <div style="flex-grow: 1; overflow: hidden;">
                    <p class="titulo m-0"><strong>{{ aporte.titulo }}</strong></p>
                    <p class="texto-secundario m-0 text-chico">{{ aporte.fecha }}</p>
                    <p class="texto-secundario m-0 text-chico">{{ aporte.folio }}</p>
                    <p class="texto-secundario m-0 text-chico">{{ aporte.proyecto }}</p>
                  </div>
                </div>
              </div>

              <!-- Mensaje sin resultados -->
              <div v-if="aportesFiltrados.length === 0" class="texto-centrado p-3" style="color: #888;">
                No se encontraron aportes rechazados.
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

          <!--Ficha de proyecto rechazado-->
          <div class="columna-11">
            <div class="flex m-b-2" style="justify-content: space-between; align-items: center;">
              <h3 class="m-0">Ficha de proyecto</h3>
              
              <!-- Botones de Acción (Modificados según tu petición) -->
              <div class="flex botones-exportacion" style="gap: 8px;">
                <button class="btn-outline">GeoJson</button>
                <button class="btn-outline">KML</button>
                <button class="btn-outline">Shapefile (zip)</button>
                <!-- Botón de Mensajes posicionado arriba -->
                <button class="btn-outline" @click="abrirMensajes">Mensajes</button>
                <!-- Botón Eliminar en vez de Desaprobar -->
                <button class="btn-moderno-chico btn-eliminar">Eliminar</button>
              </div>
            </div>

            <!-- Mapa panorámico arriba -->
            <div class="mapa-placeholder m-b-3">
              <p>Mapa Satelital</p>
            </div>

            <!-- Panel de Detalles del Aporte -->
            <div class="tarjeta-detalle p-4 borde borde-redondeado-8" v-if="aporteSeleccionado">
              
              <!-- Cabecera del panel interno -->
              <div class="flex m-b-4" style="justify-content: space-between; align-items: center;">
                <div class="flex" style="gap: 12px; align-items: center;">
                  <span class="badge-estado badge-rechazado">{{ aporteSeleccionado.folio }}</span>
                  <button class="btn-outline" style="border-color: #10b981;">Ver proyecto</button>
                </div>
                <span class="text-chico" style="color: #64748b; font-weight: 500;">{{ aporteSeleccionado.fecha }}</span>
              </div>

              <!-- Metadatos -->
              <div class="grid-metadatos m-b-4">
                <div class="meta-label">TÍTULO:</div>
                <div class="meta-value">{{ aporteSeleccionado.titulo }}</div>
                
                <div class="meta-label">NOMBRE DEL REGISTRANTE:</div>
                <div class="meta-value">{{ aporteSeleccionado.registrante }}</div>
                
                <div class="meta-label">ATENDIDO POR:</div>
                <div class="meta-value">{{ aporteSeleccionado.atendidoPor }}</div>
              </div>

              <!-- Galería de Fotografías Interactivas (Máximo 3) -->
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

              <!--Ficha de Información-->
              <h4 class="form-titulo m-b-2">Ficha de información:</h4>
              <div class="grid" style="gap: 16px;">
                <div class="columna-16">
                  <label class="form-label">1.- PREGUNTA ABIERTA</label>
                  <input type="text" class="ancho-completo form-input" readonly :value="aporteSeleccionado.detalle.preguntaAbierta" :title="aporteSeleccionado.detalle.preguntaAbierta" />
                </div>
                <div class="columna-16">
                  <label class="form-label">2.- PREGUNTA DE OPCIÓN</label>
                  <input type="text" class="ancho-completo form-input" readonly :value="aporteSeleccionado.detalle.preguntaOpcion" :title="aporteSeleccionado.detalle.preguntaOpcion" />
                </div>
                <div class="columna-16">
                  <label class="form-label">5.- PREGUNTA DE SELECCIÓN MÚLTIPLE</label>
                  <div class="flex flex-columna" style="gap: 8px;">
                    <input type="text" class="ancho-completo form-input" readonly value="Opción 1" title="Opción 1" />
                    <input type="text" class="ancho-completo form-input" readonly value="Opción 3" title="Opción 3" />
                    <input type="text" class="ancho-completo form-input" readonly value="Opción 5" title="Opción 5" />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      <!-- Modal de Mensajes -->
      <Teleport to="body">
        <div v-if="modalMensajesAbierto" class="modal-overlay" @click="cerrarMensajes">
          <div class="modal-mensajes-contenido" @click.stop>
            <div class="modal-mensajes-header">
              <h4 class="m-0" style="color: #334155;">Mensajes de Rechazo</h4>
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

      <!--Modal de imágenes-->
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
.titulo-contenido-levantamiento {
  align-items: center;
  gap: 8px; 
}

.cursor-pointer { cursor: pointer; }
.text-chico { font-size: 0.75rem; }
.ancho-completo { width: 100%; box-sizing: border-box; }
.flex-columna { flex-direction: column; }

/* TARJETAS LATERALES*/
.tarjeta-aporte {
  background-color: #715B62;
  border: 1px solid #715B62;
  transition: all 0.25s ease;
  
  .icono-doc, .titulo, .texto-secundario {
    color: #FFFFFF !important;
  }

  &:hover:not(.seleccionada) {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    filter: brightness(1.05);
  }

  &.seleccionada {
    background-color: #D48D95;
    border-color: #D48D95;
    
    .icono-doc, .titulo, .texto-secundario {
      color: #391821 !important;
    }
  }
}

/*PANEL DE ESTADÍSTICAS*/
.contenedor-stats {
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  overflow: hidden;
  font-size: 0.75rem;
  font-weight: 600;
  text-align: center;
  background: white;

  .stat-header {
    padding: 6px;
    border-bottom: 1px solid #cbd5e1;
    color: #334155;
  }

  .stat-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .stat-item {
    padding: 6px;
    border: 1px solid #e2e8f0;
    color: #64748b;
    
    &.activo {
      background-color: #ef4444; /* Rojo para indicar que estamos en la vista de rechazados */
      color: white;
      border-color: #ef4444;
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

/*MAPA Y CONTENEDOR DERECHO*/
.mapa-placeholder {
  height: 220px; 
  background-color: #f1f5f9; 
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  display: flex; 
  align-items: center; 
  justify-content: center;
  color: #94a3b8;
  font-weight: 500;
}

.tarjeta-detalle {
  background-color: #f8fafc;
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);
}

.badge-estado {
  background-color: #10b981;
  color: white;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: bold;
  letter-spacing: 0.5px;

  &.badge-rechazado {
    background-color: #ef4444; /* Badge en rojo para rechazados */
  }
}

.grid-metadatos {
  display: grid;
  grid-template-columns: 220px 1fr;
  row-gap: 12px;
  font-size: 0.85rem;
  
  .meta-label {
    font-weight: 700;
    color: #64748b;
  }
  .meta-value {
    color: #334155;
    font-weight: 500;
  }
}

/* FOTOGRAFÍAS */
.imagen-miniatura {
  width: 140px;
  height: 200px;
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
    transform: scale(1.03);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  }
}

/* VISOR DE IMÁGENES */
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
  border-radius: 25%;
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

.form-titulo {
  color: #334155;
  font-size: 1.1rem;
}

.form-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  display: block;
  margin-bottom: 6px;
  letter-spacing: 0.3px;
}

/* Inputs */
.form-input {
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 10px 14px;
  color: #334155;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  box-shadow: 0 1px 2px rgba(0,0,0,0.02);
  
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover, &:focus {
    outline: none;
    background-color: #715B62; 
    color: #FFFFFF; 
    border-color: #715B62;
    box-shadow: 0 4px 6px rgba(113, 91, 98, 0.2);
    cursor: default;
  }
}

/* --- BOTONES DE LA CABECERA --- */
.btn-outline {
  background: white;
  border: 1px solid #10b981;
  color: #10b981;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #10b981;
    color: #FFFFFF;
  }
}

.btn-moderno-chico {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  color: white;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-1px); 
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15); 
    filter: brightness(1.05);
  }
}

/* Botón Eliminar modificado */
.btn-eliminar {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

/* --- ESTILOS DEL MODAL DE MENSAJES --- */
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
</style>