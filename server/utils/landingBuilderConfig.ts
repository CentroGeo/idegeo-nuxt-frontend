export interface LandingBuilderConfig {
  nombrePlataforma: string;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  seccionTexto: string;
  logoUrl: string | null;
  logoSecundarioUrl: string | null;
  actualizadoEn: string;
}

export interface LandingBuilderLogo {
  data: Buffer;
  mimetype: string;
}

const CONFIG_KEY = 'config.json';
const LOGO_KEY = 'logo:archivo';
const LOGO_META_KEY = 'logo:meta.json';
const LOGO_SECUNDARIO_KEY = 'logo_secundario:archivo';
const LOGO_SECUNDARIO_META_KEY = 'logo_secundario:meta.json';

const configPorDefecto: LandingBuilderConfig = {
  nombrePlataforma: 'SIGIC',
  titulo: 'Sistema Integral de Gestión de Información Científica (SIGIC)',
  subtitulo: 'Integra, visualiza y aprovecha el conocimiento científico de México',
  descripcion:
    'SIGIC es la plataforma digital de la Secretaría de Ciencia y Tecnología, desarrollada en colaboración con CentroGeo para consultar, visualizar y analizar información científica y territorial de México.',
  seccionTexto:
    'Reúne datos abiertos, capas geográficas, documentos y herramientas de inteligencia artificial en un solo lugar, para que investigadores, tomadores de decisiones y público en general puedan explorar el conocimiento generado por el sistema nacional de ciencia y tecnología.',
  logoUrl: null,
  logoSecundarioUrl: null,
  actualizadoEn: new Date(0).toISOString(),
};

export async function getLandingBuilderConfig(): Promise<LandingBuilderConfig> {
  const storage = useStorage('landingBuilder');
  const config = await storage.getItem<LandingBuilderConfig>(CONFIG_KEY);
  return config ?? configPorDefecto;
}

export async function saveLandingBuilderConfig(
  campos: Omit<LandingBuilderConfig, 'logoUrl' | 'logoSecundarioUrl' | 'actualizadoEn'> & { logoSecundarioUrl?: string },
  logo?: LandingBuilderLogo,
  logoSecundario?: LandingBuilderLogo
): Promise<LandingBuilderConfig> {
  const storage = useStorage('landingBuilder');
  const actual = await getLandingBuilderConfig();

  let logoUrl = actual.logoUrl;
  if (logo) {
    await storage.setItemRaw(LOGO_KEY, logo.data);
    await storage.setItem(LOGO_META_KEY, { mimetype: logo.mimetype });
    logoUrl = `/api/landing-builder/logo?v=${Date.now()}`;
  }

  let logoSecundarioUrl = actual.logoSecundarioUrl;
  if (logoSecundario) {
    await storage.setItemRaw(LOGO_SECUNDARIO_KEY, logoSecundario.data);
    await storage.setItem(LOGO_SECUNDARIO_META_KEY, { mimetype: logoSecundario.mimetype });
    logoSecundarioUrl = `/api/landing-builder/logo-secundario?v=${Date.now()}`;
  } else if (campos.logoSecundarioUrl !== undefined) {
    logoSecundarioUrl = campos.logoSecundarioUrl || null;
  }

  const nuevaConfig: LandingBuilderConfig = {
    ...campos,
    logoUrl,
    logoSecundarioUrl,
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