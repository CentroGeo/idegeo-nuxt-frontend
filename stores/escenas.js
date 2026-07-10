import { defineStore } from 'pinia';

/**
 * Store para las capas de una escena de geohistorias. Reproduce la API pública
 * de `useMapasStore` (activeLayers, layersOrdered, cargar/agregar/actualizar/
 * eliminar/reordenar capas y control del modal), pero opera contra los
 * endpoints de `/scene-layers/` en lugar de `/sigic-map-layers/`.
 *
 * Las peticiones usan `gnoxyFetch` (proxy gnoxy) igual que el resto del módulo
 * de geohistorias; con fetch directo estos endpoints responden 404.
 *
 * Endpoints disponibles para scene-layers:
 *  - GET  /scene-layers/by-scene/{escena}/
 *  - POST /scene-layers/bulk-add/{escena}//
 *  - PATCH /scene-layers/{id}//
 *  - POST /scene-layers/bulk-delete/{escena}//
 * No existe reordenamiento ni borrado individual dedicados, por lo que se
 * resuelven con PATCH por capa y bulk-delete de un solo elemento.
 */
export const useEscenasStore = defineStore('escenas', () => {
  const config = useRuntimeConfig();
  const { data: session } = useAuth();
  const { gnoxyFetch } = useGnoxyUrl();
  const api = config.public.geonodeApi;

  function jsonHeaders() {
    const token = session.value?.accessToken;
    const h = { 'Content-Type': 'application/json' };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }

  // ── State ─────────────────────────────────────────────────────────────────

  const escenaActiva = ref(null);
  const activeLayers = ref([]);
  const isLoadingLayers = ref(false);
  const modalAgregarCapasAbierto = ref(false);

  function abrirModalAgregarCapas(escenaId) {
    escenaActiva.value = escenaId;
    modalAgregarCapasAbierto.value = true;
  }

  function cerrarModalAgregarCapas() {
    modalAgregarCapasAbierto.value = false;
  }

  // ── Getters ───────────────────────────────────────────────────────────────

  const layersOrdered = computed(() =>
    [...activeLayers.value].sort((a, b) => a.stack_order - b.stack_order)
  );

  // ── Layer actions ─────────────────────────────────────────────────────────

  async function cargarCapas(escenaId = escenaActiva.value) {
    if (escenaId === null || escenaId === undefined) return false;
    isLoadingLayers.value = true;
    const res = await gnoxyFetch(`${api}/scene-layers/by-scene/${escenaId}/`);
    isLoadingLayers.value = false;
    if (!res.ok) {
      activeLayers.value = [];
      return false;
    }
    activeLayers.value = await res.json();
    await enriquecerPublicado();
    return true;
  }

  // El endpoint by-scene no incluye si el dataset está publicado. Se consulta a
  // /datasets/ por geonode_id y se anexa `dataset_is_published` a cada capa
  // (para mostrar la etiqueta Pública/Privada, como en el modal de mapas).
  async function enriquecerPublicado() {
    const ids = activeLayers.value
      .map((l) => l.geonode_id)
      .filter((v) => v !== null && v !== undefined);
    if (!ids.length) return;

    const params = new URLSearchParams();
    ids.forEach((id) => params.append('filter{pk.in}', String(id)));
    params.append('page_size', String(ids.length));

    const res = await gnoxyFetch(`${api}/datasets/?${params.toString()}`, {
      headers: jsonHeaders(),
    });
    if (!res.ok) return;

    const data = await res.json();
    const lista = data.datasets || data.results || [];
    const publicado = Object.fromEntries(lista.map((d) => [d.pk, Boolean(d.is_published)]));

    activeLayers.value = activeLayers.value.map((l) => ({
      ...l,
      dataset_is_published: l.geonode_id in publicado ? publicado[l.geonode_id] : null,
    }));
  }

  async function agregarCapas(escenaId, layers) {
    const res = await gnoxyFetch(`${api}/scene-layers/bulk-add/${escenaId}//`, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify(layers),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.success === false) return data;
    // Recargar para obtener ids/stack_order reales asignados por el backend.
    await cargarCapas(escenaId);
    return data;
  }

  async function actualizarCapa(id, body) {
    const res = await gnoxyFetch(`${api}/scene-layers/${id}//`, {
      method: 'PATCH',
      headers: jsonHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const idx = activeLayers.value.findIndex((l) => l.id === id);
    if (idx !== -1) activeLayers.value[idx] = { ...activeLayers.value[idx], ...body };
    return data;
  }

  function actualizarEstiloCapa(id, style, styleTitle) {
    return actualizarCapa(id, { style, style_title: styleTitle });
  }

  async function eliminarCapa(capa, escenaId = escenaActiva.value) {
    // scene-layers no expone DELETE individual: bulk-delete de un elemento.
    const res = await gnoxyFetch(`${api}/scene-layers/bulk-delete/${escenaId}//`, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify([capa]),
    });
    if (!res.ok) return false;
    const data = await res.json().catch(() => null);
    if (data?.success === false) return false;
    activeLayers.value = activeLayers.value.filter((l) => l.id !== capa.id);
    return true;
  }

  async function reordenarCapas(orden) {
    // orden: [{ id, stack_order }]. Sin bulk-reorder: un PATCH por capa.
    const respuestas = await Promise.all(
      orden.map(({ id, stack_order }) =>
        gnoxyFetch(`${api}/scene-layers/${id}//`, {
          method: 'PATCH',
          headers: jsonHeaders(),
          body: JSON.stringify({ stack_order }),
        })
      )
    );
    if (respuestas.some((r) => !r.ok)) return null;
    orden.forEach(({ id, stack_order }) => {
      const idx = activeLayers.value.findIndex((l) => l.id === id);
      if (idx !== -1) activeLayers.value[idx] = { ...activeLayers.value[idx], stack_order };
    });
    return true;
  }

  function limpiar() {
    activeLayers.value = [];
    escenaActiva.value = null;
  }

  return {
    escenaActiva,
    activeLayers,
    isLoadingLayers,
    modalAgregarCapasAbierto,
    abrirModalAgregarCapas,
    cerrarModalAgregarCapas,
    layersOrdered,
    cargarCapas,
    agregarCapas,
    actualizarCapa,
    actualizarEstiloCapa,
    eliminarCapa,
    reordenarCapas,
    limpiar,
  };
});
