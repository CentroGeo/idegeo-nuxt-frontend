<script setup>
const props = defineProps({
  schema: { type: Array, default: () => [] },
  geoStrategy: { type: String, default: 'none' },
  specs: { type: Array, default: () => [] },
});

const emit = defineEmits(['update:specs']);

const RAMPS = {
  sequential: [
    {
      name: 'YlOrRd',
      label: 'Amarillo → Rojo',
      colors: [
        '#FFFFCC',
        '#FFEDA0',
        '#FED976',
        '#FEB24C',
        '#FD8D3C',
        '#FC4E2A',
        '#E31A1C',
        '#BD0026',
        '#800026',
      ],
    },
    {
      name: 'YlGnBu',
      label: 'Amarillo → Azul',
      colors: [
        '#FFFFD9',
        '#EDF8B1',
        '#C7E9B4',
        '#7FCDBB',
        '#41B6C4',
        '#1D91C0',
        '#225EA8',
        '#253494',
        '#081D58',
      ],
    },
    {
      name: 'Blues',
      label: 'Azules',
      colors: [
        '#F7FBFF',
        '#DEEBF7',
        '#C6DBEF',
        '#9ECAE1',
        '#6BAED6',
        '#4292C6',
        '#2171B5',
        '#08519C',
        '#08306B',
      ],
    },
    {
      name: 'Greens',
      label: 'Verdes',
      colors: [
        '#F7FCF5',
        '#E5F5E0',
        '#C7E9C0',
        '#A1D99B',
        '#74C476',
        '#41AB5D',
        '#238B45',
        '#006D2C',
        '#00441B',
      ],
    },
    {
      name: 'Reds',
      label: 'Rojos',
      colors: [
        '#FFF5F0',
        '#FEE0D2',
        '#FCBBA1',
        '#FC9272',
        '#FB6A4A',
        '#EF3B2C',
        '#CB181D',
        '#A50F15',
        '#67000D',
      ],
    },
    {
      name: 'OrRd',
      label: 'Naranja → Rojo',
      colors: [
        '#FFF7EC',
        '#FEE8C8',
        '#FDD49E',
        '#FDBB84',
        '#FC8D59',
        '#EF6548',
        '#D7301F',
        '#B30000',
        '#7F0000',
      ],
    },
    {
      name: 'BuPu',
      label: 'Azul → Morado',
      colors: [
        '#F7FCFD',
        '#E0ECF4',
        '#BFD3E6',
        '#9EBCDA',
        '#8C96C6',
        '#8C6BB1',
        '#88419D',
        '#810F7C',
        '#4D004B',
      ],
    },
    {
      name: 'PuRd',
      label: 'Morado → Rojo',
      colors: [
        '#F7F4F9',
        '#E7E1EF',
        '#D4B9DA',
        '#C994C7',
        '#DF65B0',
        '#E7298A',
        '#CE1256',
        '#980043',
        '#67001F',
      ],
    },
  ],
  diverging: [
    {
      name: 'RdYlGn',
      label: 'Rojo → Verde',
      colors: [
        '#D73027',
        '#F46D43',
        '#FDAE61',
        '#FEE08B',
        '#FFFFBF',
        '#D9EF8B',
        '#A6D96A',
        '#66BD63',
        '#1A9850',
      ],
    },
    {
      name: 'RdBu',
      label: 'Rojo → Azul',
      colors: [
        '#B2182B',
        '#D6604D',
        '#F4A582',
        '#FDDBC7',
        '#F7F7F7',
        '#D1E5F0',
        '#92C5DE',
        '#4393C3',
        '#2166AC',
      ],
    },
    {
      name: 'PuOr',
      label: 'Morado → Naranja',
      colors: [
        '#B35806',
        '#E08214',
        '#FDB863',
        '#FEE0B6',
        '#F7F7F7',
        '#D8DAEB',
        '#B2ABD2',
        '#8073AC',
        '#542788',
      ],
    },
    {
      name: 'BrBG',
      label: 'Café → Azul-verde',
      colors: [
        '#8C510A',
        '#BF812D',
        '#DFC27D',
        '#F6E8C3',
        '#F5F5F5',
        '#C7EAE5',
        '#80CDC1',
        '#35978F',
        '#01665E',
      ],
    },
  ],
  qualitative: [
    {
      name: 'Set1',
      label: 'Set1 — Vivos',
      colors: [
        '#E41A1C',
        '#377EB8',
        '#4DAF4A',
        '#984EA3',
        '#FF7F00',
        '#FFFF33',
        '#A65628',
        '#F781BF',
        '#999999',
      ],
    },
    {
      name: 'Set2',
      label: 'Set2 — Suaves',
      colors: [
        '#66C2A5',
        '#FC8D62',
        '#8DA0CB',
        '#E78AC3',
        '#A6D854',
        '#FFD92F',
        '#E5C494',
        '#B3B3B3',
      ],
    },
    {
      name: 'Set3',
      label: 'Set3 — Pastel',
      colors: [
        '#8DD3C7',
        '#FFFFB3',
        '#BEBADA',
        '#FB8072',
        '#80B1D3',
        '#FDB462',
        '#B3DE69',
        '#FCCDE5',
        '#D9D9D9',
        '#BC80BD',
        '#CCEBC5',
        '#FFED6F',
      ],
    },
    {
      name: 'Paired',
      label: 'Paired — Pares',
      colors: [
        '#A6CEE3',
        '#1F78B4',
        '#B2DF8A',
        '#33A02C',
        '#FB9A99',
        '#E31A1C',
        '#FDBF6F',
        '#FF7F00',
        '#CAB2D6',
        '#6A3D9A',
      ],
    },
    {
      name: 'Pastel1',
      label: 'Pastel1',
      colors: [
        '#FBB4AE',
        '#B3CDE3',
        '#CCEBC5',
        '#DECBE4',
        '#FED9A6',
        '#FFFFCC',
        '#E5D8BD',
        '#FDDAEC',
        '#F2F2F2',
      ],
    },
  ],
};

const GEO_ROLES = new Set(['lat', 'lon', 'state_key', 'mun_key', 'state_name', 'mun_name']);

const styleableColumns = computed(() =>
  props.schema.filter((col) => {
    const t = col.editable_type || col.detected_type;
    if (t === 'ignorar' || t === 'fecha' || t === 'booleano') return false;
    if (col.geo_role && GEO_ROLES.has(col.geo_role)) return false;
    return t === 'entero' || t === 'decimal' || t === 'texto';
  })
);

const localSpecs = ref({});

watch(
  styleableColumns,
  (cols) => {
    const next = {};
    cols.forEach((col) => {
      const t = col.editable_type || col.detected_type;
      const isNumeric = t === 'entero' || t === 'decimal';
      const existing = props.specs.find((s) => s.col === col.name);
      next[col.name] = existing
        ? { ...existing, enabled: true }
        : {
            col: col.name,
            type: isNumeric ? 'graduated' : 'categorical',
            palette: isNumeric ? 'YlOrRd' : 'Set1',
            n_classes: 5,
            classification: 'quantile',
            enabled: true,
          };
    });
    localSpecs.value = next;
    emitSpecs();
  },
  { immediate: true }
);

function emitSpecs() {
  const specs = Object.values(localSpecs.value)
    .filter((s) => s.enabled)
    // eslint-disable-next-line no-unused-vars
    .map(({ enabled, ...rest }) => rest);
  emit('update:specs', specs);
}

function updateSpec(colName, patch) {
  localSpecs.value[colName] = { ...localSpecs.value[colName], ...patch };
  emitSpecs();
}

function availableRamps(colName) {
  const spec = localSpecs.value[colName];
  if (!spec) return RAMPS.qualitative;
  if (spec.type === 'categorical') return RAMPS.qualitative;
  return [...RAMPS.sequential, ...RAMPS.diverging];
}

function swatchColors(paletteName) {
  const all = [...RAMPS.sequential, ...RAMPS.diverging, ...RAMPS.qualitative];
  const ramp = all.find((r) => r.name === paletteName);
  if (!ramp) return [];
  const colors = ramp.colors;
  if (colors.length <= 7) return colors;
  const step = (colors.length - 1) / 6;
  return Array.from({ length: 7 }, (_, i) => colors[Math.round(i * step)]);
}
</script>

<template>
  <section v-if="styleableColumns.length > 0 && geoStrategy !== 'none'" class="estilos-columnas">
    <h3 class="m-b-1">Estilos de visualización</h3>
    <p class="texto-chico texto-color-secundario m-b-3">
      Configura cómo se verá cada columna en el mapa. Las paletas se aplicarán automáticamente al
      dataset en GeoNode.
    </p>

    <div
      v-for="col in styleableColumns"
      :key="col.name"
      class="estilo-fila"
      :class="{ deshabilitada: !localSpecs[col.name]?.enabled }"
    >
      <div class="estilo-header">
        <label class="flex flex-alineacion-central brecha-2 cursor-pointer">
          <input
            type="checkbox"
            :checked="localSpecs[col.name]?.enabled"
            @change="updateSpec(col.name, { enabled: $event.target.checked })"
          />
          <strong>{{ col.name }}</strong>
          <span class="etiqueta etiqueta-neutro texto-chico">
            {{ col.editable_type || col.detected_type }}
          </span>
        </label>
      </div>

      <template v-if="localSpecs[col.name]?.enabled">
        <div class="estilo-controles">
          <div class="campo-chico">
            <label class="etiqueta-chica">Tipo</label>
            <select
              class="campo-texto campo-texto-chico"
              :value="localSpecs[col.name]?.type"
              @change="
                updateSpec(col.name, {
                  type: $event.target.value,
                  palette: $event.target.value === 'categorical' ? 'Set1' : 'YlOrRd',
                })
              "
            >
              <option value="categorical">Categorizado</option>
              <option
                v-if="['entero', 'decimal'].includes(col.editable_type || col.detected_type)"
                value="graduated"
              >
                Graduado
              </option>
            </select>
          </div>

          <div v-if="localSpecs[col.name]?.type === 'graduated'" class="campo-chico">
            <label class="etiqueta-chica">Clasificación</label>
            <select
              class="campo-texto campo-texto-chico"
              :value="localSpecs[col.name]?.classification"
              @change="updateSpec(col.name, { classification: $event.target.value })"
            >
              <option value="quantile">Cuantiles</option>
              <option value="equal_interval">Intervalos iguales</option>
            </select>
          </div>

          <div v-if="localSpecs[col.name]?.type === 'graduated'" class="campo-chico">
            <label class="etiqueta-chica">Clases</label>
            <select
              class="campo-texto campo-texto-chico"
              :value="localSpecs[col.name]?.n_classes"
              @change="updateSpec(col.name, { n_classes: Number($event.target.value) })"
            >
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
            </select>
          </div>

          <div class="campo-chico campo-paleta">
            <label class="etiqueta-chica">Paleta</label>
            <select
              class="campo-texto campo-texto-chico"
              :value="localSpecs[col.name]?.palette"
              @change="updateSpec(col.name, { palette: $event.target.value })"
            >
              <optgroup
                v-for="(group, groupKey) in {
                  Secuenciales: availableRamps(col.name).filter((r) =>
                    [
                      'YlOrRd',
                      'YlGnBu',
                      'Blues',
                      'Greens',
                      'Reds',
                      'OrRd',
                      'BuPu',
                      'PuRd',
                    ].includes(r.name)
                  ),
                  Divergentes: availableRamps(col.name).filter((r) =>
                    ['RdYlGn', 'RdBu', 'PuOr', 'BrBG'].includes(r.name)
                  ),
                  Cualitativas: availableRamps(col.name).filter((r) =>
                    ['Set1', 'Set2', 'Set3', 'Paired', 'Pastel1'].includes(r.name)
                  ),
                }"
                :key="groupKey"
                :label="groupKey"
              >
                <option v-for="ramp in group" :key="ramp.name" :value="ramp.name">
                  {{ ramp.label }}
                </option>
              </optgroup>
            </select>
          </div>

          <div class="paleta-preview" aria-hidden="true">
            <span
              v-for="(color, ci) in swatchColors(localSpecs[col.name]?.palette ?? '')"
              :key="ci"
              class="swatch"
              :style="{ backgroundColor: color }"
            />
          </div>
        </div>
      </template>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.estilos-columnas {
  margin-top: 1.5rem;
}

.estilo-fila {
  border: 1px solid var(--color-borde, #ddd);
  border-radius: 6px;
  padding: 12px 14px;
  margin-bottom: 10px;
  transition: opacity 0.15s;

  &.deshabilitada {
    opacity: 0.45;
  }
}

.estilo-header {
  margin-bottom: 8px;
}

.estilo-controles {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 12px;
}

.campo-chico {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.etiqueta-chica {
  font-size: 0.7rem;
  color: var(--color-texto-secundario, #666);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.campo-texto-chico {
  padding: 4px 8px;
  font-size: 0.85rem;
  height: 32px;
}

.paleta-preview {
  display: flex;
  align-items: center;
  gap: 1px;
  margin-bottom: 2px;
}

.swatch {
  display: inline-block;
  width: 22px;
  height: 22px;
  border-radius: 2px;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
