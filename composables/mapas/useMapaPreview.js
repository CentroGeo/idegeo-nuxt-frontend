/**
 * Genera una miniatura (Blob PNG) a partir del/los canvas de OpenLayers de un
 * visor, para usarla como `mapa.preview`. regular/swipe usan un solo mapa; dual
 * compone los dos mapas lado a lado.
 *
 * Nota: el canvas queda "tainted" si las teselas no se sirven con CORS
 * (crossOrigin). En ese caso `toBlob` lanza SecurityError y se rechaza con un
 * mensaje claro.
 *
 * Composable en subcarpeta -> se importa explicitamente (no auto-import):
 *   import { useMapaPreview } from '~/composables/mapas/useMapaPreview';
 */
export function useMapaPreview() {
  // Espera a que el mapa termine de renderizar y devuelve un canvas compuesto.
  function esperarRender(olMap) {
    return new Promise((resolve, reject) => {
      if (!olMap) {
        reject(new Error('Mapa no disponible'));
        return;
      }
      olMap.once('rendercomplete', () => {
        try {
          resolve(componerCanvas(olMap));
        } catch (e) {
          reject(e);
        }
      });
      // Fuerza un frame para que 'rendercomplete' dispare aunque el mapa este ocioso.
      olMap.renderSync();
    });
  }

  // Combina los canvas internos de OL (uno por capa) en uno solo, respetando su
  // transform y opacidad. Basado en el ejemplo oficial "export map" de OpenLayers.
  function componerCanvas(olMap) {
    const [ancho, alto] = olMap.getSize();
    const salida = document.createElement('canvas');
    salida.width = ancho;
    salida.height = alto;
    const ctx = salida.getContext('2d');

    const canvases = olMap.getViewport().querySelectorAll('.ol-layer canvas, canvas.ol-layer');
    canvases.forEach((canvas) => {
      if (!canvas.width) return;
      const padre = canvas.parentNode;
      const opacidad = padre?.style?.opacity || canvas.style.opacity;
      ctx.globalAlpha = opacidad ? Number(opacidad) : 1;

      const transform = canvas.style.transform;
      const m =
        transform && transform.startsWith('matrix')
          ? transform
              .match(/matrix\(([^)]+)\)/)[1]
              .split(',')
              .map(Number)
          : [1, 0, 0, 1, 0, 0];
      ctx.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]);

      const fondo = padre?.style?.backgroundColor;
      if (fondo) {
        ctx.fillStyle = fondo;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(canvas, 0, 0);
    });

    ctx.globalAlpha = 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    return salida;
  }

  // Une varios canvas horizontalmente (mapa dual).
  function componerHorizontal(lista) {
    const alto = Math.max(...lista.map((c) => c.height));
    const ancho = lista.reduce((suma, c) => suma + c.width, 0);
    const salida = document.createElement('canvas');
    salida.width = ancho;
    salida.height = alto;
    const ctx = salida.getContext('2d');
    let x = 0;
    for (const c of lista) {
      ctx.drawImage(c, x, 0);
      x += c.width;
    }
    return salida;
  }

  function aBlob(canvas) {
    return new Promise((resolve, reject) => {
      try {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('No se pudo exportar la imagen del mapa.'));
        }, 'image/png');
      } catch {
        // SecurityError: el canvas quedo tainted (teselas sin CORS).
        reject(
          new Error('Las teselas del mapa deben servirse con CORS para generar la vista previa.')
        );
      }
    });
  }

  /**
   * Captura el visor y devuelve el Blob PNG.
   * @param {object} visor objeto expuesto por el visor (defineExpose)
   * @param {'regular'|'swipe'|'dual'} tipo tipo de mapa
   * @returns {Promise<Blob>}
   */
  async function capturarVisor(visor, tipo) {
    if (!visor) throw new Error('Visor no disponible');

    if (tipo === 'dual') {
      const izquierdo = await esperarRender(visor.mapaIzqRef?.mapa);
      const derecho = await esperarRender(visor.mapaDerRef?.mapa);
      return aBlob(componerHorizontal([izquierdo, derecho]));
    }

    // regular + swipe comparten un unico mapa OL.
    const unico = await esperarRender(visor.mapaRef?.mapa);
    return aBlob(unico);
  }

  return { capturarVisor };
}
