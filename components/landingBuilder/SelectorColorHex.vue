<script setup>
const props = defineProps({
  modelValue: {
    type: String,
    default: '#FFFFFF',
  },
  id: {
    type: String,
    required: true,
  },
  etiqueta: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['update:modelValue']);

const coloresRapidos = [
  {
    nombre: 'Negro',
    valor: '#000000',
  },
  {
    nombre: 'Blanco',
    valor: '#FFFFFF',
  },
  {
    nombre: 'Rojo institucional',
    valor: '#9F2241',
  },
];

const valorLocal = computed({
  get: () => props.modelValue,
  set: (valor) => emit('update:modelValue', valor),
});

const colorValido = computed(() => /^#[0-9A-F]{6}$/i.test(props.modelValue));

function normalizarColor() {
  let valor = props.modelValue.trim().toUpperCase();

  if (valor && !valor.startsWith('#')) {
    valor = `#${valor}`;
  }

  emit('update:modelValue', valor);
}

function seleccionarColor(color) {
  emit('update:modelValue', color);
}

function estaSeleccionado(color) {
  return props.modelValue.toUpperCase() === color;
}
</script>

<template>
  <div class="selector-color">
    <div class="selector-color__controles">
      <div class="selector-color__entrada">
        <span
          class="selector-color__muestra"
          :style="{
            backgroundColor: colorValido ? modelValue : 'transparent',
          }"
          aria-hidden="true"
        />

        <input
          :id="id"
          v-model="valorLocal"
          type="text"
          inputmode="text"
          maxlength="7"
          placeholder="#FFFFFF"
          :aria-label="etiqueta"
          :aria-describedby="`${id}-ayuda`"
          @blur="normalizarColor"
        />
      </div>

      <div
        class="selector-color__opciones"
        role="group"
        :aria-label="`Colores rápidos para ${etiqueta.toLowerCase()}`"
      >
        <button
          v-for="color in coloresRapidos"
          :key="color.valor"
          type="button"
          class="selector-color__circulo"
          :class="{
            'selector-color__circulo--seleccionado': estaSeleccionado(color.valor),
          }"
          :style="{ backgroundColor: color.valor }"
          :aria-label="color.nombre"
          :title="color.nombre"
          :aria-pressed="estaSeleccionado(color.valor)"
          @click="seleccionarColor(color.valor)"
        />
      </div>
    </div>

    <p :id="`${id}-ayuda`" class="selector-color__ayuda">
      Usa un color hexadecimal con formato #RRGGBB.
    </p>
  </div>
</template>

<style scoped lang="scss">
.selector-color {
  display: flex;
  width: 100%;
  min-width: 0;
  flex-direction: column;
  gap: 5px;

  &__controles {
    display: flex;
    width: 100%;
    min-width: 0;
    align-items: center;
    gap: 10px;
  }

  &__entrada {
    position: relative;
    width: 220px;
    max-width: 220px;
    min-width: 160px;
    flex: 0 1 220px;

    input {
      width: 100%;
      min-width: 0;
      padding-left: 38px;
      box-sizing: border-box;
      text-transform: uppercase;
    }
  }

  &__muestra {
    position: absolute;
    top: 50%;
    left: 11px;
    width: 17px;
    height: 17px;
    border: 1px solid rgb(128 128 128 / 60%);
    border-radius: 4px;
    box-shadow: 0 1px 3px rgb(0 0 0 / 16%);
    pointer-events: none;
    transform: translateY(-50%);
  }

  &__opciones {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    gap: 7px;
  }

  &__circulo {
    width: 26px;
    height: 26px;
    padding: 0;
    border: 2px solid rgb(128 128 128 / 45%);
    border-radius: 50%;
    box-shadow: 0 2px 5px rgb(0 0 0 / 16%);
    cursor: pointer;
    transition:
      transform 0.15s ease,
      box-shadow 0.15s ease;

    &:hover {
      transform: scale(1.08);
    }

    &:focus-visible {
      outline: 2px solid currentcolor;
      outline-offset: 3px;
    }

    &--seleccionado {
      box-shadow:
        0 0 0 2px var(--color-neutro-1, white),
        0 0 0 4px var(--color-primario-3, #9f2241);
      transform: scale(1.04);
    }
  }

  &__ayuda {
    margin: 0;
    color: var(--texto-secundario);
    font-size: 0.6875rem;
    line-height: 1.3;
  }
}

@media (max-width: 520px) {
  .selector-color {
    &__controles {
      flex-wrap: wrap;
    }

    &__entrada {
      width: 100%;
      max-width: none;
      flex: 1 1 100%;
    }
  }
}
</style>
