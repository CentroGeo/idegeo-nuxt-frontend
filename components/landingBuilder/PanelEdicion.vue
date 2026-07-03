<script setup>
const store = useLandingBuilderStore();

function manejarSeleccionLogo(archivo) {
  store.setLogoFile(archivo);
}
</script>

<template>
  <div>
    <h2>Textos principales</h2>

    <div class="m-b-3">
      <label for="landing-builder-nombre-plataforma">Nombre de la plataforma</label>
      <input
        id="landing-builder-nombre-plataforma"
        v-model="store.nombrePlataforma"
        type="text"
        placeholder="Ej. SIGIC"
        required
      />
    </div>

    <div class="m-b-3">
      <label for="landing-builder-titulo">Título</label>
      <input
        id="landing-builder-titulo"
        v-model="store.titulo"
        type="text"
        placeholder="Título principal de la portada"
        required
      />
    </div>

    <div class="m-b-3">
      <label for="landing-builder-subtitulo">Subtítulo</label>
      <input
        id="landing-builder-subtitulo"
        v-model="store.subtitulo"
        type="text"
        placeholder="Subtítulo de la portada"
        required
      />
    </div>

    <div class="m-b-3">
      <label for="landing-builder-descripcion">Descripción</label>
      <textarea
        id="landing-builder-descripcion"
        v-model="store.descripcion"
        rows="4"
        placeholder="Descripción general de la plataforma"
        required
      />
    </div>

    <div class="m-b-3">
      <label for="landing-builder-seccion-texto">Sección de texto descriptivo</label>
      <textarea
        id="landing-builder-seccion-texto"
        v-model="store.seccionTexto"
        rows="4"
        placeholder="Texto adicional que acompaña a la descripción"
        required
      />
    </div>

    <LandingBuilderCargaLogo
      :logo-url="store.logoUrl"
      label="Logo de la plataforma"
      @seleccionar-logo="manejarSeleccionLogo"
    />
  </div>
</template>
