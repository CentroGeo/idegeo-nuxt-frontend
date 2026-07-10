import { defineStore } from 'pinia';

export const LIMITE_TARJETAS = 10;

function crearTarjetaVacia() {
  return {
    id: crypto.randomUUID(),
    titulo: '',
    descripcion: '',
    textoBoton: '',
    enlaceBoton: '',
    imagenUrl: null,
  };
}

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
    tarjetas: ref([]),
    tarjetaImagenFiles: ref({}),
    secciones: ref([]),
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
        this.tarjetas = config.tarjetas ?? [];
        this.tarjetaImagenFiles = {};
        this.secciones = config.secciones || [];
      } catch (err) {
        console.error('Error al cargar la configuración de la landing page:', err);
        this.error = 'No se pudo cargar la configuración. Intenta de nuevo.';
      } finally {
        this.isLoading = false;
      }
    },

    puedeAgregarTarjeta() {
      return this.tarjetas.length < LIMITE_TARJETAS;
    },

    agregarTarjeta() {
      if (!this.puedeAgregarTarjeta()) return null;
      const tarjeta = crearTarjetaVacia();
      this.tarjetas.push(tarjeta);
      return tarjeta;
    },

    eliminarTarjeta(id) {
      const tarjeta = this.tarjetas.find((t) => t.id === id);
      if (tarjeta?.imagenUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(tarjeta.imagenUrl);
      }
      this.tarjetas = this.tarjetas.filter((t) => t.id !== id);
      const archivos = { ...this.tarjetaImagenFiles };
      delete archivos[id];
      this.tarjetaImagenFiles = archivos;
    },

    actualizarTarjeta(id, campos) {
      const tarjeta = this.tarjetas.find((t) => t.id === id);
      if (!tarjeta) return;
      Object.assign(tarjeta, campos);
    },

    setImagenTarjeta(id, archivo) {
      const tarjeta = this.tarjetas.find((t) => t.id === id);
      if (!tarjeta) return;

      if (tarjeta.imagenUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(tarjeta.imagenUrl);
      }

      this.tarjetaImagenFiles = { ...this.tarjetaImagenFiles, [id]: archivo };
      tarjeta.imagenUrl = URL.createObjectURL(archivo);
    },

    reordenarTarjetas(idOrigen, idDestino) {
      if (idOrigen === idDestino) return;

      const indiceOrigen = this.tarjetas.findIndex((t) => t.id === idOrigen);
      const indiceDestino = this.tarjetas.findIndex((t) => t.id === idDestino);
      if (indiceOrigen === -1 || indiceDestino === -1) return;

      const tarjetas = [...this.tarjetas];
      const [tarjetaMovida] = tarjetas.splice(indiceOrigen, 1);
      tarjetas.splice(indiceDestino, 0, tarjetaMovida);
      this.tarjetas = tarjetas;
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

        formData.append(
          'tarjetas',
          JSON.stringify(
            this.tarjetas.map(
              ({ id, titulo, descripcion, textoBoton, enlaceBoton, imagenUrl }) => ({
                id,
                titulo,
                descripcion,
                textoBoton,
                enlaceBoton,
                imagenUrl,
              })
            )
          )
        );

        for (const [id, archivo] of Object.entries(this.tarjetaImagenFiles)) {
          formData.append(`tarjetaImagen_${id}`, archivo);
        }

        const seccionesMetadata = this.secciones.map((sec) => {
          if (sec.tipo === 'tarjetas' && sec.datos.tarjetas) {
            return {
              id: sec.id,
              tipo: sec.tipo,
              datos: {
                ...sec.datos,
                disposicion: sec.datos.disposicion || 'vertical',
                tarjetas: sec.datos.tarjetas.map((t) => ({
                  id: t.id,
                  titulo: t.titulo,
                  descripcion: t.descripcion,
                  imagenUrl: t.imagenUrl,
                  orientacion: t.orientacion || 'vertical-abajo',
                  tituloTipo: t.tituloTipo || 'h2',
                  tituloAlineacion: t.tituloAlineacion || 'left',
                  tituloColor: t.tituloColor || 'inherit',
                  descripcionTipo: t.descripcionTipo || 'p',
                  descripcionAlineacion: t.descripcionAlineacion || 'left',
                  descripcionColor: t.descripcionColor || 'inherit',
                  botonTexto: t.botonTexto || '',
                  botonUrl: t.botonUrl || '',
                })),
              },
            };
          }
          return sec;
        });

        formData.append('secciones', JSON.stringify(seccionesMetadata));

        this.secciones.forEach((sec) => {
          if (sec.tipo === 'tarjetas' && sec.datos.tarjetas) {
            sec.datos.tarjetas.forEach((t) => {
              if (t.imagenFile) {
                formData.append(`tarjeta_imagen_${sec.id}_${t.id}`, t.imagenFile);
              }
            });
          }
        });

        const config = await $fetch('/api/landing-builder/config', {
          method: 'POST',
          body: formData,
        });

        this.logoUrl = config.logoUrl;
        this.logoSecundarioUrl = config.logoSecundarioUrl;
        this.secciones = config.secciones || [];
        this.logoFile = null;
        this.logoSecundarioFile = null;
        this.tarjetas = config.tarjetas ?? [];
        this.tarjetaImagenFiles = {};
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
