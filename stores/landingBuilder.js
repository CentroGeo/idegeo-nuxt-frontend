import { defineStore } from 'pinia';

export const useLandingBuilderStore = defineStore('landingBuilder', () => {
  return {
    nombrePlataforma: ref(''),
    titulo: ref(''),
    subtitulo: ref(''),
    tituloSeccion: ref(''),
    descripcion: ref(''),
    seccionTexto: ref(''),
    logoUrl: ref(null),
    logoFile: ref(null),
    logoSecundarioUrl: ref(null),
    logoSecundarioFile: ref(null),
    isLoading: ref(false),
    isSaving: ref(false),
    error: ref(null),
    saveSuccess: ref(false),

    async cargarConfiguracion() {
      this.isLoading = true;
      this.error = null;
      try {
        const config = await $fetch('/api/landing-builder/config');
        this.nombrePlataforma = config.nombrePlataforma;
        this.titulo = config.titulo;
        this.subtitulo = config.subtitulo;
        this.tituloSeccion = config.tituloSeccion;
        this.descripcion = config.descripcion;
        this.seccionTexto = config.seccionTexto;
        this.logoUrl = config.logoUrl;
        this.logoSecundarioUrl = config.logoSecundarioUrl;
      } catch (err) {
        console.error('Error al cargar la configuración de la landing page:', err);
        this.error = 'No se pudo cargar la configuración. Intenta de nuevo.';
      } finally {
        this.isLoading = false;
      }
    },

    setLogoFile(archivo) {
      this.logoFile = archivo;
      if (this.logoUrl && this.logoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(this.logoUrl);
      }
      this.logoUrl = URL.createObjectURL(archivo);
    },

    setLogoSecundarioFile(archivo) {
      this.logoSecundarioFile = archivo;
      if (this.logoSecundarioUrl && this.logoSecundarioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(this.logoSecundarioUrl);
      }
      this.logoSecundarioUrl = URL.createObjectURL(archivo);
    },

    setLogoSecundarioUrl(url) {
      if (this.logoSecundarioUrl && this.logoSecundarioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(this.logoSecundarioUrl);
      }
      this.logoSecundarioUrl = url;
      this.logoSecundarioFile = null;
    },

    async guardarConfiguracion() {
      this.isSaving = true;
      this.error = null;
      this.saveSuccess = false;
      try {
        const formData = new FormData();
        formData.append('nombrePlataforma', this.nombrePlataforma);
        formData.append('titulo', this.titulo);
        formData.append('subtitulo', this.subtitulo);
        formData.append('tituloSeccion', this.tituloSeccion);
        formData.append('descripcion', this.descripcion);
        formData.append('seccionTexto', this.seccionTexto);

        if (this.logoFile) {
          formData.append('logo', this.logoFile);
        }

        if (this.logoSecundarioFile) {
          formData.append('logoSecundario', this.logoSecundarioFile);
        } else if (
          this.logoSecundarioUrl &&
          !this.logoSecundarioUrl.startsWith('blob:') &&
          !this.logoSecundarioUrl.startsWith('/api/')
        ) {
          formData.append('logoSecundarioUrl', this.logoSecundarioUrl);
        } else if (!this.logoSecundarioUrl) {
          formData.append('logoSecundarioUrl', '');
        }

        const config = await $fetch('/api/landing-builder/config', {
          method: 'POST',
          body: formData,
        });
        this.logoUrl = config.logoUrl;
        this.logoSecundarioUrl = config.logoSecundarioUrl;
        this.logoFile = null;
        this.logoSecundarioFile = null;
        this.saveSuccess = true;
      } catch (err) {
        console.error('Error al guardar la configuración de la landing page:', err);
        this.error = 'No se pudo guardar la configuración. Intenta de nuevo.';
      } finally {
        this.isSaving = false;
      }
    },
  };
});
