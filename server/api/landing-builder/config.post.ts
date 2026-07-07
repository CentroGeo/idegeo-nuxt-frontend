import formidable from 'formidable';
import { promises as fsp } from 'fs';
import type { LandingBuilderConfig, LandingBuilderTarjeta } from '../../utils/landingBuilderConfig';
import { LIMITE_TARJETAS } from '../../utils/landingBuilderConfig';

const TIPOS_LOGO_PERMITIDOS = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
const TAMANO_MAXIMO_LOGO = 2 * 1024 * 1024; // 2MB
const CAMPOS_REQUERIDOS = [
  'nombrePlataforma',
  'titulo',
  'subtitulo',
  'tituloSeccion',
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
    if (
      !archivoLogoSecundario.mimetype ||
      !TIPOS_LOGO_PERMITIDOS.includes(archivoLogoSecundario.mimetype)
    ) {
      throw createError({
        statusCode: 400,
        statusMessage: 'El logo secundario debe ser una imagen PNG, JPEG, WEBP o SVG',
      });
    }
    if (archivoLogoSecundario.size > TAMANO_MAXIMO_LOGO) {
      throw createError({
        statusCode: 400,
        statusMessage: 'El logo secundario no debe superar 2MB',
      });
    }
    logoSecundario = {
      data: await fsp.readFile(archivoLogoSecundario.filepath),
      mimetype: archivoLogoSecundario.mimetype,
    };
  }

  let tarjetasCrudas: unknown;
  try {
    tarjetasCrudas = JSON.parse(fields.tarjetas?.[0] ?? '[]');
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'El listado de tarjetas es inválido' });
  }

  if (!Array.isArray(tarjetasCrudas)) {
    throw createError({ statusCode: 400, statusMessage: 'El listado de tarjetas es inválido' });
  }

  if (tarjetasCrudas.length > LIMITE_TARJETAS) {
    throw createError({
      statusCode: 400,
      statusMessage: `No se permiten más de ${LIMITE_TARJETAS} tarjetas`,
    });
  }

  const tarjetas: Array<Omit<LandingBuilderTarjeta, 'imagenUrl'> & { imagenUrl?: string | null }> =
    tarjetasCrudas.map((valor) => {
      if (!valor || typeof valor !== 'object') {
        throw createError({ statusCode: 400, statusMessage: 'Cada tarjeta requiere un id válido' });
      }

      const tarjeta = valor as Record<string, unknown>;
      if (typeof tarjeta.id !== 'string' || !tarjeta.id) {
        throw createError({ statusCode: 400, statusMessage: 'Cada tarjeta requiere un id válido' });
      }

      const imagenUrl = tarjeta.imagenUrl;
      return {
        id: tarjeta.id,
        titulo: typeof tarjeta.titulo === 'string' ? tarjeta.titulo.trim() : '',
        descripcion: typeof tarjeta.descripcion === 'string' ? tarjeta.descripcion.trim() : '',
        textoBoton: typeof tarjeta.textoBoton === 'string' ? tarjeta.textoBoton.trim() : '',
        enlaceBoton: typeof tarjeta.enlaceBoton === 'string' ? tarjeta.enlaceBoton.trim() : '',
        imagenUrl:
          typeof imagenUrl === 'string' && imagenUrl && !imagenUrl.startsWith('blob:')
            ? imagenUrl
            : null,
      };
    });

  const imagenesTarjetas: Record<string, { data: Buffer; mimetype: string }> = {};
  for (const tarjeta of tarjetas) {
    const archivoImagen = files[`tarjetaImagen_${tarjeta.id}`]?.[0];
    if (!archivoImagen) continue;

    if (!archivoImagen.mimetype || !TIPOS_LOGO_PERMITIDOS.includes(archivoImagen.mimetype)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'La imagen de la tarjeta debe ser PNG, JPEG, WEBP o SVG',
      });
    }
    if (archivoImagen.size > TAMANO_MAXIMO_LOGO) {
      throw createError({
        statusCode: 400,
        statusMessage: 'La imagen de la tarjeta no debe superar 2MB',
      });
    }

    imagenesTarjetas[tarjeta.id] = {
      data: await fsp.readFile(archivoImagen.filepath),
      mimetype: archivoImagen.mimetype,
    };
  }

  return saveLandingBuilderConfig(
    {
      ...campos,
      tarjetas,
    } as unknown as Omit<
      LandingBuilderConfig,
      'logoUrl' | 'logoSecundarioUrl' | 'tarjetas' | 'actualizadoEn'
    > & {
      logoSecundarioUrl?: string;
      tarjetas: Array<Omit<LandingBuilderTarjeta, 'imagenUrl'> & { imagenUrl?: string | null }>;
    },
    logo,
    logoSecundario,
    imagenesTarjetas
  );
});
