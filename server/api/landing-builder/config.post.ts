import formidable from 'formidable';
import { promises as fsp } from 'fs';
import type { LandingBuilderConfig } from '../../utils/landingBuilderConfig';

const TIPOS_LOGO_PERMITIDOS = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
const TAMANO_MAXIMO_LOGO = 2 * 1024 * 1024; // 2MB
const CAMPOS_REQUERIDOS = [
  'nombrePlataforma',
  'titulo',
  'subtitulo',
  'descripcion',
  'seccionTexto',
] as const;

export default defineEventHandler(async (event) => {
  const form = formidable({ multiples: false, maxFileSize: TAMANO_MAXIMO_LOGO });
  const { fields, files } = await new Promise<{
    fields: formidable.Fields;
    files: formidable.Files;
  }>((resolve, reject) => {
    form.parse(event.node.req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });

  const campos: Record<string, string> = {};
  for (const campo of CAMPOS_REQUERIDOS) {
    const valor = fields[campo]?.[0]?.trim();
    if (!valor) {
      throw createError({ statusCode: 400, statusMessage: `El campo "${campo}" es requerido` });
    }
    campos[campo] = valor;
  }

  // Parse optional fields
  if (fields.logoSecundarioUrl?.[0] !== undefined) {
    campos.logoSecundarioUrl = fields.logoSecundarioUrl[0].trim();
  }

  let logo: { data: Buffer; mimetype: string } | undefined;
  const archivoLogo = files.logo?.[0];
  if (archivoLogo) {
    if (!archivoLogo.mimetype || !TIPOS_LOGO_PERMITIDOS.includes(archivoLogo.mimetype)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'El logo debe ser una imagen PNG, JPEG, WEBP o SVG',
      });
    }
    if (archivoLogo.size > TAMANO_MAXIMO_LOGO) {
      throw createError({ statusCode: 400, statusMessage: 'El logo no debe superar 2MB' });
    }
    logo = {
      data: await fsp.readFile(archivoLogo.filepath),
      mimetype: archivoLogo.mimetype,
    };
  }

  let logoSecundario: { data: Buffer; mimetype: string } | undefined;
  const archivoLogoSecundario = files.logoSecundario?.[0];
  if (archivoLogoSecundario) {
    if (!archivoLogoSecundario.mimetype || !TIPOS_LOGO_PERMITIDOS.includes(archivoLogoSecundario.mimetype)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'El logo secundario debe ser una imagen PNG, JPEG, WEBP o SVG',
      });
    }
    if (archivoLogoSecundario.size > TAMANO_MAXIMO_LOGO) {
      throw createError({ statusCode: 400, statusMessage: 'El logo secundario no debe superar 2MB' });
    }
    logoSecundario = {
      data: await fsp.readFile(archivoLogoSecundario.filepath),
      mimetype: archivoLogoSecundario.mimetype,
    };
  }

  return saveLandingBuilderConfig(
    campos as unknown as Omit<LandingBuilderConfig, 'logoUrl' | 'logoSecundarioUrl' | 'actualizadoEn'> & { logoSecundarioUrl?: string },
    logo,
    logoSecundario
  );
});
