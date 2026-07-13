export interface LandingBuilderTarjeta {
  id: string;
  titulo: string;
  descripcion: string;
  textoBoton: string;
  enlaceBoton: string;
  imagenUrl: string | null;
}

export interface LandingBuilderCard {
  id: string;
  titulo: string;
  descripcion: string;
  imagenUrl: string;
  urlDestino: string;
  textoBoton: string;
  tipoDestino: string;
  orientacion: string;
  tituloTipo?: string;
  tituloAlineacion?: string;
  descripcionTipo?: string;
  descripcionAlineacion?: string;
}

export interface LandingBuilderSection {
  id: string;
  tipo: 'tarjetas';
  datos: {
    disposicion: 'vertical' | 'horizontal';
    tarjetas: LandingBuilderCard[];
  };
}

export interface LandingBuilderConfig {
  nombrePlataforma: string;
  titulo: string;
  subtitulo: string;
  tituloSeccion: string;
  descripcion: string;
  seccionTexto: string;
  logoUrl: string | null;
  logoSecundarioUrl: string | null;
  logoTerceroUrl: string | null;
  logoCuartoUrl: string | null;
  tarjetas: LandingBuilderTarjeta[];
  secciones?: LandingBuilderSection[];
  actualizadoEn: string;
}

export interface LandingBuilderLogo {
  data: Buffer;
  mimetype: string;
}

export const LIMITE_TARJETAS = 10;

const CONFIG_KEY = 'config.json';
const LOGO_KEY = 'logo:archivo';
const LOGO_META_KEY = 'logo:meta.json';
const LOGO_SECUNDARIO_KEY = 'logo_secundario:archivo';
const LOGO_SECUNDARIO_META_KEY = 'logo_secundario:meta.json';
const LOGO_TERCERO_KEY = 'logo_tercero:archivo';
const LOGO_TERCERO_META_KEY = 'logo_tercero:meta.json';
const LOGO_CUARTO_KEY = 'logo_cuarto:archivo';
const LOGO_CUARTO_META_KEY = 'logo_cuarto:meta.json';

const tarjetaImagenKey = (id: string) => `tarjeta:${id}:archivo`;
const tarjetaImagenMetaKey = (id: string) => `tarjeta:${id}:meta.json`;

const tarjetasPorDefecto: LandingBuilderTarjeta[] = [
  {
    id: 'visualiza',
    titulo: 'Visualiza información territorial',
    descripcion:
      'Explora mapas interactivos con capas de información geográfica: datos económicos, límites administrativos, de infraestructura, población y más. Filtra por región, tema o periodo, combina fuentes y descarga tus mapas en formatos estándar.',
    textoBoton: 'Ir al visualizador',
    enlaceBoton: '/consulta',
    imagenUrl: '/inicio/tarjeta_visualiza.png',
  },
  {
    id: 'analiza',
    titulo: 'Analiza con Inteligencia Artificial',
    descripcion:
      'Crea un proyecto de análisis, sube tus documentos o selecciona fuentes del catálogo SIGIC, y haz preguntas en lenguaje natural. La IA lee, compara y resume la información para darte respuestas con referencias a las fuentes originales.',
    textoBoton: 'Iniciar análisis con IA',
    enlaceBoton: '/ia',
    imagenUrl: '/inicio/tarjeta_analiza.png',
  },
  {
    id: 'explora',
    titulo: 'Explora los recursos disponibles',
    descripcion:
      'Consulta el catálogo completo de recursos del SIGIC: capas geográficas, tablas de datos, documentos de investigación y otros servicios remotos. Busca por tema, institución, fecha o tipo de recurso, y descarga lo que necesites.',
    textoBoton: 'Ir al catálogo de información',
    enlaceBoton: '/catalogo',
    imagenUrl: '/inicio/tarjeta_explora.png',
  },
  {
    id: 'usa',
    titulo: 'Usa tu propia información',
    descripcion:
      'Sube tus archivos con información geográfica o científica, y úsalos directamente en el visualizador o en tus proyectos de análisis con IA. Sin necesidad de herramientas externas, puedes integrar tus datos al ecosistema SIGIC.',
    textoBoton: 'Ir a subir archivo',
    enlaceBoton: '/catalogo/cargar-archivos',
    imagenUrl: '/inicio/tarjeta_usa.png',
  },
];

const configPorDefecto: LandingBuilderConfig = {
  nombrePlataforma: '',
  titulo: 'Sistema Integral de Gestión de Información Científica (SIGIC)',
  subtitulo: 'Integra, visualiza y aprovecha el conocimiento científico de México',
  tituloSeccion: '¿Qué es SIGIC?',
  descripcion:
    'SIGIC es la plataforma digital de la Secretaría de Ciencia y Tecnología, desarrollada en colaboración con CentroGeo para consultar, visualizar y analizar información científica y territorial de México.',
  seccionTexto:
    'Reúne datos abiertos, capas geográficas, documentos y herramientas de inteligencia artificial en un solo lugar, para que investigadores, tomadores de decisiones y público en general puedan explorar el conocimiento generado por el sistema nacional de ciencia y tecnología.',
  logoUrl: null,
  logoSecundarioUrl: null,
  logoTerceroUrl: null,
  logoCuartoUrl: null,
  tarjetas: tarjetasPorDefecto,
  secciones: [],
  actualizadoEn: new Date(0).toISOString(),
};

export async function getLandingBuilderConfig(): Promise<LandingBuilderConfig> {
  const storage = useStorage('landingBuilder');
  const config = await storage.getItem<LandingBuilderConfig>(CONFIG_KEY);
  return config ? { ...configPorDefecto, ...config } : configPorDefecto;
}

export async function saveLandingBuilderConfig(
  campos: Omit<
    LandingBuilderConfig,
    | 'logoUrl'
    | 'logoSecundarioUrl'
    | 'logoTerceroUrl'
    | 'logoCuartoUrl'
    | 'tarjetas'
    | 'actualizadoEn'
  > & {
    logoUrl?: string;
    logoSecundarioUrl?: string;
    logoTerceroUrl?: string;
    logoCuartoUrl?: string;
    tarjetas: Array<Omit<LandingBuilderTarjeta, 'imagenUrl'> & { imagenUrl?: string | null }>;
  },
  logo?: LandingBuilderLogo,
  logoSecundario?: LandingBuilderLogo,
  logoTercero?: LandingBuilderLogo,
  logoCuarto?: LandingBuilderLogo,
  imagenesTarjetas?: Record<string, LandingBuilderLogo>
): Promise<LandingBuilderConfig> {
  const storage = useStorage('landingBuilder');
  const actual = await getLandingBuilderConfig();

  if (campos.tarjetas.length > LIMITE_TARJETAS) {
    throw createError({
      statusCode: 400,
      statusMessage: `No se permiten más de ${LIMITE_TARJETAS} tarjetas`,
    });
  }

  let logoUrl = actual.logoUrl;
  if (logo) {
    await storage.setItemRaw(LOGO_KEY, logo.data);
    await storage.setItem(LOGO_META_KEY, { mimetype: logo.mimetype });
    logoUrl = `/api/landing-builder/logo?v=${Date.now()}`;
  } else if (campos.logoUrl !== undefined) {
    logoUrl = campos.logoUrl || null;
  }

  let logoSecundarioUrl = actual.logoSecundarioUrl;
  if (logoSecundario) {
    await storage.setItemRaw(LOGO_SECUNDARIO_KEY, logoSecundario.data);
    await storage.setItem(LOGO_SECUNDARIO_META_KEY, { mimetype: logoSecundario.mimetype });
    logoSecundarioUrl = `/api/landing-builder/logo-secundario?v=${Date.now()}`;
  } else if (campos.logoSecundarioUrl !== undefined) {
    logoSecundarioUrl = campos.logoSecundarioUrl || null;
  }

  let logoTerceroUrl = actual.logoTerceroUrl;
  if (logoTercero) {
    await storage.setItemRaw(LOGO_TERCERO_KEY, logoTercero.data);
    await storage.setItem(LOGO_TERCERO_META_KEY, { mimetype: logoTercero.mimetype });
    logoTerceroUrl = `/api/landing-builder/logo-tercero?v=${Date.now()}`;
  } else if (campos.logoTerceroUrl !== undefined) {
    logoTerceroUrl = campos.logoTerceroUrl || null;
  }

  let logoCuartoUrl = actual.logoCuartoUrl;
  if (logoCuarto) {
    await storage.setItemRaw(LOGO_CUARTO_KEY, logoCuarto.data);
    await storage.setItem(LOGO_CUARTO_META_KEY, { mimetype: logoCuarto.mimetype });
    logoCuartoUrl = `/api/landing-builder/logo-cuarto?v=${Date.now()}`;
  } else if (campos.logoCuartoUrl !== undefined) {
    logoCuartoUrl = campos.logoCuartoUrl || null;
  }

  const idsActuales = new Set(actual.tarjetas.map((tarjeta) => tarjeta.id));
  const idsNuevos = new Set(campos.tarjetas.map((tarjeta) => tarjeta.id));
  await Promise.all(
    [...idsActuales]
      .filter((id) => !idsNuevos.has(id))
      .map((id) =>
        Promise.all([
          storage.removeItem(tarjetaImagenKey(id)),
          storage.removeItem(tarjetaImagenMetaKey(id)),
        ])
      )
  );

  const tarjetas: LandingBuilderTarjeta[] = await Promise.all(
    campos.tarjetas.map(async (tarjeta) => {
      const imagen = imagenesTarjetas?.[tarjeta.id];
      if (imagen) {
        await storage.setItemRaw(tarjetaImagenKey(tarjeta.id), imagen.data);
        await storage.setItem(tarjetaImagenMetaKey(tarjeta.id), { mimetype: imagen.mimetype });
        return {
          ...tarjeta,
          imagenUrl: `/api/landing-builder/tarjeta-imagen/${tarjeta.id}?v=${Date.now()}`,
        };
      }

      return { ...tarjeta, imagenUrl: tarjeta.imagenUrl ?? null };
    })
  );

  const nuevaConfig: LandingBuilderConfig = {
    ...campos,
    logoUrl,
    logoSecundarioUrl,
    logoTerceroUrl,
    logoCuartoUrl,
    tarjetas,
    actualizadoEn: new Date().toISOString(),
  };
  await storage.setItem(CONFIG_KEY, nuevaConfig);
  return nuevaConfig;
}

export async function getLandingBuilderLogo(): Promise<LandingBuilderLogo | null> {
  const storage = useStorage('landingBuilder');
  const [data, meta] = await Promise.all([
    storage.getItemRaw<Buffer>(LOGO_KEY),
    storage.getItem<{ mimetype: string }>(LOGO_META_KEY),
  ]);
  if (!data || !meta) return null;
  return { data, mimetype: meta.mimetype };
}

export async function getLandingBuilderLogoSecundario(): Promise<LandingBuilderLogo | null> {
  const storage = useStorage('landingBuilder');
  const [data, meta] = await Promise.all([
    storage.getItemRaw<Buffer>(LOGO_SECUNDARIO_KEY),
    storage.getItem<{ mimetype: string }>(LOGO_SECUNDARIO_META_KEY),
  ]);
  if (!data || !meta) return null;
  return { data, mimetype: meta.mimetype };
}

export async function getLandingBuilderLogoTercero(): Promise<LandingBuilderLogo | null> {
  const storage = useStorage('landingBuilder');
  const [data, meta] = await Promise.all([
    storage.getItemRaw<Buffer>(LOGO_TERCERO_KEY),
    storage.getItem<{ mimetype: string }>(LOGO_TERCERO_META_KEY),
  ]);
  if (!data || !meta) return null;
  return { data, mimetype: meta.mimetype };
}

export async function getLandingBuilderLogoCuarto(): Promise<LandingBuilderLogo | null> {
  const storage = useStorage('landingBuilder');
  const [data, meta] = await Promise.all([
    storage.getItemRaw<Buffer>(LOGO_CUARTO_KEY),
    storage.getItem<{ mimetype: string }>(LOGO_CUARTO_META_KEY),
  ]);
  if (!data || !meta) return null;
  return { data, mimetype: meta.mimetype };
}

export async function getLandingBuilderTarjetaImagen(
  id: string
): Promise<LandingBuilderLogo | null> {
  const storage = useStorage('landingBuilder');
  const [data, meta] = await Promise.all([
    storage.getItemRaw<Buffer>(tarjetaImagenKey(id)),
    storage.getItem<{ mimetype: string }>(tarjetaImagenMetaKey(id)),
  ]);
  if (!data || !meta) return null;
  return { data, mimetype: meta.mimetype };
}

export async function saveLandingBuilderCardImage(
  sectionId: string,
  cardId: string,
  data: Buffer,
  mimetype: string
): Promise<string> {
  const storage = useStorage('landingBuilder');
  await storage.setItemRaw(`secciones:${sectionId}:tarjetas:${cardId}:archivo`, data);
  await storage.setItem(`secciones:${sectionId}:tarjetas:${cardId}:meta.json`, { mimetype });
  return `/api/landing-builder/tarjetas/${sectionId}/${cardId}/imagen?v=${Date.now()}`;
}

export async function getLandingBuilderCardImage(
  sectionId: string,
  cardId: string
): Promise<LandingBuilderLogo | null> {
  const storage = useStorage('landingBuilder');
  const [data, meta] = await Promise.all([
    storage.getItemRaw<Buffer>(`secciones:${sectionId}:tarjetas:${cardId}:archivo`),
    storage.getItem<{ mimetype: string }>(`secciones:${sectionId}:tarjetas:${cardId}:meta.json`),
  ]);
  if (!data || !meta) return null;
  return { data, mimetype: meta.mimetype };
}
