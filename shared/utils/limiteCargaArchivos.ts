// Límite único para "Catálogo > Carga de archivos" (ticket E1-AcO2): capas base,
// documentos, estilos SLD y XML de metadatos. Los archivos tabulares (csv/xlsx/xls/json)
// usan su propio límite de 50 MB, definido en
// geonode/src/sigic_geonode/sigic_data_importer/views.py (_MAX_FILE_SIZE).
export const LIMITE_CARGA_ARCHIVOS_MIB = 100;
export const LIMITE_CARGA_ARCHIVOS_BYTES = LIMITE_CARGA_ARCHIVOS_MIB * 1024 * 1024;
