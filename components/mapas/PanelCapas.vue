<script setup>
const props = defineProps({
  capas: {
    type: Array,
    default: () => [],
  },
  editable: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['toggle', 'opacidad', 'reordenar', 'eliminar', 'agregar']);

const capasOrdenadas = computed(() =>
  [...props.capas].sort((a, b) => b.stack_order - a.stack_order)
);

function alternarVisible(capa) {
  emit('toggle', { id: capa.id, visible: !capa.visible });
}

function cambiarOpacidad(capa, valor) {
  emit('opacidad', { id: capa.id, opacity: Number(valor) });
}

function moverArriba(index) {
  if (index === 0) return;
  const ordenadas = capasOrdenadas.value;
  const a = ordenadas[index];
  const b = ordenadas[index - 1];
  emit('reordenar', [
    { id: a.id, stack_order: b.stack_order },
    { id: b.id, stack_order: a.stack_order },
  ]);
}

function moverAbajo(index) {
  const ordenadas = capasOrdenadas.value;
  if (index === ordenadas.length - 1) return;
  const a = ordenadas[index];
  const b = ordenadas[index + 1];
  emit('reordenar', [
    { id: a.id, stack_order: b.stack_order },
    { id: b.id, stack_order: a.stack_order },
  ]);
}

function eliminar(capa) {
  if (!confirm(`¿Eliminar la capa "${capa.name}"?`)) return;
  emit('eliminar', capa.id);
}
</script>

<template>
  <aside class="panel-capas">
    <div class="panel-encabezado flex flex-contenido-separado">
      <h3 class="m-0">Capas</h3>
      <button
        v-if="editable"
        class="boton-secundario boton-chico"
        type="button"
        @click="emit('agregar')"
      >
        <span class="pictograma-mas" aria-hidden="true" /> Agregar
      </button>
    </div>

    <p v-if="!capasOrdenadas.length" class="m-y-2 texto-secundario">Este mapa no tiene capas.</p>

    <ul class="lista-capas">
      <li v-for="(capa, idx) in capasOrdenadas" :key="capa.id" class="capa-item p-1">
        <div class="capa-cabecera flex flex-contenido-separado">
          <label class="capa-toggle flex">
            <input
              type="checkbox"
              :checked="capa.visible"
              :disabled="!editable"
              @change="alternarVisible(capa)"
            />
            <span class="capa-nombre">{{ capa.name }}</span>
          </label>

          <span v-if="capa.map_position" class="etiqueta-pos">
            {{ capa.map_position === 'left' ? 'Izq' : 'Der' }}
          </span>
        </div>

        <div class="capa-opacidad m-t-1">
          <label :for="`op-${capa.id}`" class="texto-secundario">
            Opacidad: {{ Math.round(capa.opacity * 100) }}%
          </label>
          <input
            :id="`op-${capa.id}`"
            type="range"
            min="0"
            max="1"
            step="0.05"
            :value="capa.opacity"
            :disabled="!editable"
            @input="cambiarOpacidad(capa, $event.target.value)"
          />
        </div>

        <div v-if="editable" class="capa-acciones flex flex-contenido-final m-t-1">
          <button
            class="boton-pictograma boton-sin-contenedor-secundario"
            :disabled="idx === 0"
            aria-label="Subir capa"
            type="button"
            @click="moverArriba(idx)"
          >
            <span class="pictograma-angulo-arriba" aria-hidden="true" />
          </button>
          <button
            class="boton-pictograma boton-sin-contenedor-secundario"
            :disabled="idx === capasOrdenadas.length - 1"
            aria-label="Bajar capa"
            type="button"
            @click="moverAbajo(idx)"
          >
            <span class="pictograma-angulo-abajo" aria-hidden="true" />
          </button>
          <button
            class="boton-pictograma boton-sin-contenedor-secundario"
            aria-label="Eliminar capa"
            type="button"
            @click="eliminar(capa)"
          >
            <span class="pictograma-tache" aria-hidden="true" />
          </button>
        </div>
      </li>
    </ul>
  </aside>
</template>

<style lang="scss" scoped>
.panel-capas {
  padding: 12px;
  background-color: var(--fondo);
  border-left: 1px solid var(--color-neutro-1);
  overflow-y: auto;
  height: 100%;
  min-width: 280px;
}

.panel-encabezado {
  align-items: center;
  margin-bottom: 12px;
}

.lista-capas {
  list-style: none;
  padding: 0;
  margin: 0;
}

.capa-item {
  border: 1px solid var(--color-neutro-1);
  border-radius: 8px;
  margin-bottom: 8px;
  background-color: var(--fondo-acento);
}

.capa-toggle {
  align-items: center;
  gap: 8px;
  cursor: pointer;
  flex: 1;
  min-width: 0;
}

.capa-nombre {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.etiqueta-pos {
  font-size: 0.75rem;
  background-color: var(--color-secundario-2);
  color: var(--color-primario-4);
  padding: 2px 6px;
  border-radius: 6px;
}

.capa-opacidad input[type='range'] {
  width: 100%;
}

.flex {
  gap: 8px;
}
</style>
