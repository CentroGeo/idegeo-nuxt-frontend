<script setup>
defineProps({
  contenido: { type: String, required: true },
  marcador: { type: Object, default: null },
});

defineEmits({ alCerrar: [] });
</script>

<template>
  <!-- eslint-disable vue/no-v-html -->
  <div v-if="!marcador" v-html="contenido" />

  <div v-else>
    <button @click="$emit('alCerrar')">Cerrar</button>

    {{ marcador }}
  </div>
</template>
