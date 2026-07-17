/**
 * Estilo de marcador (pin + pictograma) usado por SisdaiCapaVectorial.
 * Mismo patrón que components/geocontenidos/mapaEscena.vue (geohistorias).
 */
export function estiloMarcadorSisdai(icono = 16) {
  return [
    {
      // triangulo
      'forma-angulo': Math.PI / 1,
      'forma-desplazamiento': [0, icono],
      'forma-relleno-color': ['get', 'color'],
      'forma-puntos': 3,
      'forma-radio': icono,
    },
    {
      // circulo
      'circulo-desplazamiento': [0, icono * 2],
      'circulo-relleno-color': ['get', 'color'],
      'circulo-radio': icono,
    },
    {
      // pictograma
      'circulo-desplazamiento': [0, icono * 2],
      'circulo-relleno-color': 'white',
      'circulo-radio': icono - icono / 4,
      'texto-relleno-color': ['get', 'color'],
      'texto-tipografia': `${icono + icono / 4}px sisdai-pictogramas`,
      'texto-desplazar_en-y': -(icono * 2) + 1,
      'texto-valor': ['get', 'icon'],
    },
  ];
}
