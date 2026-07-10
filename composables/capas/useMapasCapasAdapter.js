import { storeToRefs } from 'pinia';
import { unref } from 'vue';

/**
 * Adaptador de capas para mapas. Expone el contrato uniforme que consume
 * CapasModalAgregar, delegando en useMapasStore (endpoints /sigic-map-layers/).
 * Construye internamente el payload de bulk-add, incluyendo map_position para
 * mapas swipe/dual.
 *
 * @param {import('vue').MaybeRef<number>} mapaId
 * @param {import('vue').MaybeRef<string>} mapType 'regular' | 'swipe' | 'dual'
 */
export function useMapasCapasAdapter(mapaId, mapType) {
  const store = useMapasStore();
  const { layersOrdered, isLoadingMap } = storeToRefs(store);

  const idDe = () => unref(mapaId);

  return {
    layersOrdered,
    isLoading: isLoadingMap,

    // El detalle del mapa ya trae las capas (cargarMapa); nada que recargar.
    cargar: () => Promise.resolve(),

    agregar: (seleccionadas, extra = {}) => {
      const tieneLados = unref(mapType) === 'swipe' || unref(mapType) === 'dual';
      const base = layersOrdered.value.length;
      const payload = seleccionadas.map((l, i) => ({
        geonode_id: l.pk,
        visible: true,
        opacity: 1.0,
        map_position: tieneLados ? extra.posicion || 'left' : 'left',
        stack_order: base + i,
      }));
      return store.agregarCapas(idDe(), payload);
    },

    actualizar: (id, patch) => store.actualizarCapa(id, patch),
    // El store de mapas actualiza el estilo solo con el nombre.
    actualizarEstilo: (id, style) => store.actualizarEstiloCapa(id, style),
    eliminar: (capa) => store.eliminarCapa(capa.id),
    reordenar: (orden) => store.reordenarCapas(orden),
  };
}
