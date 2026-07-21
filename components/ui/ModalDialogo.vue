<script setup>
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';

// Instancia única del diálogo (montada en app.vue). El estado y las acciones
// viven en el composable useDialogo; aquí solo se renderiza y se enlaza el
// cierre nativo del <dialog> (ESC, botón X o clic en el backdrop) → cancelar.
const { abierto, opciones, aceptar, cancelar } = useDialogo();

const modal = ref(null);
const campo = ref(null);
let dialogEl = null;

const TITULOS_POR_DEFECTO = {
  alerta: 'Aviso',
  confirmacion: 'Confirmar',
  prompt: '',
};

const titulo = computed(() => opciones.titulo || TITULOS_POR_DEFECTO[opciones.tipo] || '');
const textoAceptar = computed(() => opciones.textoAceptar || 'Aceptar');
const hayCancelar = computed(() => opciones.tipo !== 'alerta');
const claseAceptar = computed(() => ({
  'boton-primario': true,
  'boton-peligro': opciones.variante === 'peligro',
}));

// SisdaiModal no emite evento al cerrarse; el <dialog> nativo sí dispara 'close'
// en ESC / X / backdrop. Lo tratamos como cancelación si el diálogo sigue abierto.
function engancharCierreNativo() {
  if (dialogEl || !modal.value?.id_aleatorio) return;
  dialogEl = document.getElementById(modal.value.id_aleatorio);
  dialogEl?.addEventListener('close', () => {
    if (abierto.value) cancelar();
  });
}

watch(abierto, async (visible) => {
  if (visible) {
    modal.value?.abrirModal();
    await nextTick();
    engancharCierreNativo();
    if (opciones.tipo === 'prompt') campo.value?.focus();
  } else {
    modal.value?.cerrarModal();
  }
});
</script>

<template>
  <ClientOnly>
    <SisdaiModal ref="modal">
      <template #encabezado>
        <h1 class="m-0">{{ titulo }}</h1>
      </template>

      <template #cuerpo>
        <p class="dialogo-mensaje">{{ opciones.mensaje }}</p>

        <input
          v-if="opciones.tipo === 'prompt'"
          ref="campo"
          v-model="opciones.valor"
          type="text"
          class="dialogo-campo m-t-2"
          :placeholder="opciones.marcador"
          @keyup.enter="aceptar"
        />
      </template>

      <template #pie>
        <div class="flex flex-contenido-final">
          <button v-if="hayCancelar" class="boton-secundario" type="button" @click="cancelar">
            {{ opciones.textoCancelar }}
          </button>
          <button :class="claseAceptar" type="button" @click="aceptar">
            {{ textoAceptar }}
          </button>
        </div>
      </template>
    </SisdaiModal>
  </ClientOnly>
</template>

<style lang="scss" scoped>
.modal {
  border: 2px solid var(--color-secundario-2);
}

// Fondo (backdrop) más oscuro, igual que en los modales de mapas.
.modal::backdrop {
  background-color: rgba(0, 0, 0, 0.8);
}

.dialogo-mensaje {
  margin: 0;
  white-space: pre-wrap; // respeta saltos de línea del mensaje
}

.dialogo-campo {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid var(--color-neutro-1);
  border-radius: 4px;
}

// Variante de peligro (eliminaciones): reutiliza la forma de boton-primario
// y sólo cambia el color a rojo.
.boton-peligro {
  background-color: var(--color-error-3, #940b1c);
  border-color: var(--color-error-3, #940b1c);
  color: #fff;
}

.flex {
  gap: 8px;
}
</style>
