import { defineStore } from 'pinia';

export const useCategoriasStore = defineStore('categorias', () => {
  // --- Conjuntos de categorías ---
  // Cada instancia puede tener varios conjuntos (ej. "Categorías SIGIC",
  // "Atlas de riesgos", "Atlas de vulnerabilidad"), y cada conjunto agrupa
  // sus propias categorías. Solo un conjunto está activo por instancia: es
  // el que se ofrece en el catálogo y en el formulario de llenado de
  // metadatos.
  const conjuntos = reactive([
    {
      id: 'sigic',
      nombre: 'Categorías SIGIC',
      descripcion: 'Esquema de categorización estándar de la plataforma.',
      protegido: true,
      categorias: [
        { id: 1, nombre: 'Zonas Climáticas', tipo: 'Geográfica', valores: 14, estado: 'Publicada' },
        {
          id: 2,
          nombre: 'Áreas Naturales Protegidas',
          tipo: 'Ambiental',
          valores: 182,
          estado: 'Publicada',
        },
        {
          id: 3,
          nombre: 'Cuencas Hidrológicas',
          tipo: 'Hidrología',
          valores: 37,
          estado: 'Borrador',
        },
        {
          id: 4,
          nombre: 'Entidades Federativas',
          tipo: 'Político-Administrativo',
          valores: 32,
          estado: 'Publicada',
        },
      ],
    },
    {
      id: 'atlas-riesgos',
      nombre: 'Atlas de riesgos',
      descripcion: 'Categorías para clasificar recursos del atlas de riesgos.',
      protegido: false,
      categorias: [
        { id: 5, nombre: 'Riesgo sísmico', tipo: 'Amenaza', valores: 6, estado: 'Publicada' },
        {
          id: 6,
          nombre: 'Riesgo hidrometeorológico',
          tipo: 'Amenaza',
          valores: 9,
          estado: 'Borrador',
        },
      ],
    },
    {
      id: 'atlas-vulnerabilidad',
      nombre: 'Atlas de vulnerabilidad',
      descripcion: 'Categorías para clasificar recursos del atlas de vulnerabilidad social.',
      protegido: false,
      categorias: [
        { id: 7, nombre: 'Vulnerabilidad social', tipo: 'Social', valores: 11, estado: 'Borrador' },
      ],
    },
  ]);

  const idConjuntoActivo = ref('sigic');

  const conjuntoActivo = computed(
    () => conjuntos.find((conjunto) => conjunto.id === idConjuntoActivo.value) ?? null
  );

  function categoriasPublicadas(conjunto) {
    return conjunto.categorias.filter((categoria) => categoria.estado === 'Publicada');
  }

  // Lo que realmente alimenta el catálogo y el formulario de metadatos de
  // la instancia: solo las categorías publicadas del conjunto activo.
  const categoriasVisiblesInstancia = computed(() =>
    conjuntoActivo.value ? categoriasPublicadas(conjuntoActivo.value) : []
  );

  function activarConjunto(id) {
    idConjuntoActivo.value = id;
  }

  function claseEstado(estado) {
    return estado === 'Publicada'
      ? 'texto-color-confirmacion fondo-color-confirmacion borde borde-color-confirmacion'
      : 'texto-color-neutro fondo-color-neutro borde borde-color-neutro';
  }

  // --- CRUD de conjuntos ---
  let siguienteIdConjunto = 1;

  function crearConjunto({ nombre, descripcion }) {
    const id = `conjunto-${siguienteIdConjunto++}`;
    conjuntos.push({
      id,
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      protegido: false,
      categorias: [],
    });
    return id;
  }

  function actualizarConjunto(id, { nombre, descripcion }) {
    const conjunto = conjuntos.find((item) => item.id === id);
    if (conjunto) {
      conjunto.nombre = nombre.trim();
      conjunto.descripcion = descripcion.trim();
    }
  }

  function eliminarConjunto(id) {
    const conjunto = conjuntos.find((item) => item.id === id);
    if (!conjunto || conjunto.protegido || conjunto.id === idConjuntoActivo.value) return false;
    const indice = conjuntos.findIndex((item) => item.id === id);
    if (indice !== -1) conjuntos.splice(indice, 1);
    return true;
  }

  // --- CRUD de categorías dentro de un conjunto ---
  let siguienteIdCategoria = 8;

  function crearCategoria(conjuntoId, { nombre, tipo, valores, estado }) {
    const conjunto = conjuntos.find((item) => item.id === conjuntoId);
    if (!conjunto) return;
    conjunto.categorias.push({
      id: siguienteIdCategoria++,
      nombre: nombre.trim(),
      tipo: tipo.trim(),
      valores: Number(valores) || 0,
      estado,
    });
  }

  function actualizarCategoria(conjuntoId, categoriaId, { nombre, tipo, valores, estado }) {
    const conjunto = conjuntos.find((item) => item.id === conjuntoId);
    const categoria = conjunto?.categorias.find((item) => item.id === categoriaId);
    if (categoria) {
      categoria.nombre = nombre.trim();
      categoria.tipo = tipo.trim();
      categoria.valores = Number(valores) || 0;
      categoria.estado = estado;
    }
  }

  function eliminarCategoria(conjuntoId, categoriaId) {
    const conjunto = conjuntos.find((item) => item.id === conjuntoId);
    if (!conjunto) return;
    const indice = conjunto.categorias.findIndex((item) => item.id === categoriaId);
    if (indice !== -1) conjunto.categorias.splice(indice, 1);
  }

  return {
    conjuntos,
    idConjuntoActivo,
    conjuntoActivo,
    categoriasPublicadas,
    categoriasVisiblesInstancia,
    activarConjunto,
    claseEstado,
    crearConjunto,
    actualizarConjunto,
    eliminarConjunto,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria,
  };
});
