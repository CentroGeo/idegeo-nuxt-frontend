import { defineStore } from 'pinia';
import { useSigicMapas } from '~/composables/useSigicMapas';

export const useMapasStore = defineStore('mapas', () => {
  const config = useRuntimeConfig();
  const {
    fetchMaps,
    fetchMap,
    fetchLayers,
    createMap,
    updateMap,
    deleteMap,
    uploadMapImage,
    createLayer,
    updateLayer,
    deleteLayer,
    updateLayerStyle,
    bulkAddLayers,
    bulkReorderLayers,
    bulkDeleteLayers,
  } = useSigicMapas();

  // ── State ─────────────────────────────────────────────────────────────────

  const maps = ref([]);
  const pagination = ref({ page: 1, page_size: 12, total: 0, links: {} });
  const activeMap = ref(null);
  const activeLayers = ref([]);
  const isLoading = ref(false);
  const isLoadingMap = ref(false);

  // ── Getters ───────────────────────────────────────────────────────────────

  const layersOrdered = computed(() =>
    [...activeLayers.value].sort((a, b) => a.stack_order - b.stack_order)
  );

  function layersByPosition(position) {
    return layersOrdered.value.filter((l) => l.map_position === position);
  }

  function buildWmtsUrl(layer) {
    const style = layer.style || 'default';
    return (
      `${config.public.geoserverUrl}/gwc/service/wmts/rest/` +
      `${layer.name}/${style}/EPSG:3857/EPSG:3857:{z}/{y}/{x}?format=image/png`
    );
  }

  // ── Map actions ───────────────────────────────────────────────────────────

  async function cargarMapas(params = {}) {
    isLoading.value = true;
    const data = await fetchMaps({ page_size: pagination.value.page_size, ...params });
    isLoading.value = false;
    if (!data) return false;
    maps.value = data.results;
    pagination.value = {
      ...pagination.value,
      page: data.page,
      total: data.total,
      links: data.links,
    };
    return true;
  }

  async function cargarMapa(id) {
    isLoadingMap.value = true;
    const [mapData, layersData] = await Promise.all([fetchMap(id), fetchLayers(id)]);
    isLoadingMap.value = false;
    if (!mapData) return false;
    activeMap.value = mapData;
    activeLayers.value = layersData ?? [];
    return true;
  }

  async function crearMapa(body) {
    const data = await createMap(body);
    if (!data) return null;
    maps.value.unshift(data);
    return data;
  }

  async function actualizarMapa(id, body) {
    const data = await updateMap(id, body);
    if (!data) return null;
    if (activeMap.value?.id === id) activeMap.value = { ...activeMap.value, ...data };
    const idx = maps.value.findIndex((m) => m.id === id);
    if (idx !== -1) maps.value[idx] = { ...maps.value[idx], ...data };
    return data;
  }

  async function eliminarMapa(id) {
    const ok = await deleteMap(id);
    if (!ok) return false;
    maps.value = maps.value.filter((m) => m.id !== id);
    if (activeMap.value?.id === id) {
      activeMap.value = null;
      activeLayers.value = [];
    }
    return true;
  }

  async function subirImagenMapa(id, file) {
    const data = await uploadMapImage(id, file);
    if (!data) return null;
    const idx = maps.value.findIndex((m) => m.id === id);
    if (idx !== -1) maps.value[idx] = { ...maps.value[idx], preview: data.url };
    if (activeMap.value?.id === id) activeMap.value = { ...activeMap.value, preview: data.url };
    return data;
  }

  // ── Layer actions ─────────────────────────────────────────────────────────

  async function agregarCapa(body) {
    const data = await createLayer(body);
    if (!data) return null;
    activeLayers.value.push(data);
    return data;
  }

  async function agregarCapas(mapId, layers) {
    const data = await bulkAddLayers(mapId, layers);
    if (!data) return null;
    activeLayers.value.push(...data);
    return data;
  }

  async function actualizarCapa(id, body) {
    const data = await updateLayer(id, body);
    if (!data) return null;
    const idx = activeLayers.value.findIndex((l) => l.id === id);
    if (idx !== -1) activeLayers.value[idx] = { ...activeLayers.value[idx], ...data };
    return data;
  }

  async function actualizarEstiloCapa(id, style) {
    const data = await updateLayerStyle(id, style);
    if (!data) return null;
    const idx = activeLayers.value.findIndex((l) => l.id === id);
    if (idx !== -1) activeLayers.value[idx] = { ...activeLayers.value[idx], style };
    return data;
  }

  async function eliminarCapa(id) {
    const ok = await deleteLayer(id);
    if (!ok) return false;
    activeLayers.value = activeLayers.value.filter((l) => l.id !== id);
    return true;
  }

  async function eliminarCapas(mapId, ids) {
    const data = await bulkDeleteLayers(mapId, ids);
    if (!data) return null;
    activeLayers.value = activeLayers.value.filter((l) => !ids.includes(l.id));
    return data;
  }

  async function reordenarCapas(orden) {
    // orden: [{ id, stack_order }]
    const data = await bulkReorderLayers(orden);
    if (!data) return null;
    orden.forEach(({ id, stack_order }) => {
      const idx = activeLayers.value.findIndex((l) => l.id === id);
      if (idx !== -1) activeLayers.value[idx] = { ...activeLayers.value[idx], stack_order };
    });
    return data;
  }

  function limpiarMapa() {
    activeMap.value = null;
    activeLayers.value = [];
  }

  return {
    maps,
    pagination,
    activeMap,
    activeLayers,
    isLoading,
    isLoadingMap,
    layersOrdered,
    layersByPosition,
    buildWmtsUrl,
    cargarMapas,
    cargarMapa,
    crearMapa,
    actualizarMapa,
    eliminarMapa,
    subirImagenMapa,
    agregarCapa,
    agregarCapas,
    actualizarCapa,
    actualizarEstiloCapa,
    eliminarCapa,
    eliminarCapas,
    reordenarCapas,
    limpiarMapa,
  };
});
