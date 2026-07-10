import { storeToRefs } from 'pinia';
import { unref } from 'vue';

/**
 * Adaptador de capas para escenas de geohistorias. Expone el contrato uniforme
 * que consume CapasModalAgregar, delegando en useEscenasStore (endpoints
 * /scene-layers/). Construye internamente el payload de bulk-add.
 *
 * @param {import('vue').MaybeRef<string|number>} escenaId
 */
export function useEscenasCapasAdapter(escenaId) {
  const store = useEscenasStore();
  const { layersOrdered, isLoadingLayers } = storeToRefs(store);

  const idDe = () => unref(escenaId);

  return {
    layersOrdered,
    isLoading: isLoadingLayers,

    cargar: () => store.cargarCapas(idDe()),

    agregar: (seleccionadas) => {
      const base = layersOrdered.value.length;
      const payload = seleccionadas.map((l, i) => ({
        visible: true,
        opacity: 1,
        style: null,
        style_title: null,
        geonode_id: l.pk,
        dataset_title: l.title,
        name: l.alternate,
        identifier: l.category?.identifier,
        stack_order: base + i,
      }));
      return store.agregarCapas(idDe(), payload);
    },

    actualizar: (id, patch) => store.actualizarCapa(id, patch),
    actualizarEstilo: (id, style, styleTitle) => store.actualizarEstiloCapa(id, style, styleTitle),
    eliminar: (capa) => store.eliminarCapa(capa, idDe()),
    reordenar: (orden) => store.reordenarCapas(orden),
  };
}
