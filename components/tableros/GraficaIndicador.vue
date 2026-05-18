<script setup>
const props = defineProps({
  plotValues: {
    type: Array,
    default: null,
  },
  plotConfig: {
    type: Object,
    default: null,
  },
  customColors: {
    type: String,
    default: null,
  },
  rangoActivoColor: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(['hover-rango']);

const chartType = computed(() => props.plotConfig?.chart_type || 'bar');

// Datos para gráficas que usan rangos (bar, donut)
const barras = computed(() => {
  if (!props.plotConfig?.ranges) return [];
  return props.plotConfig.ranges.map((r) => ({
    label: r.alias || r.label || `${r.min} - ${r.max}`,
    count: r.count || 0,
    color: r.color,
  }));
});

// Datos para gráficas que usan plot_values (horizontal_bar, treemap)
const estados = computed(() => {
  if (!props.plotValues?.length) return [];
  return [...props.plotValues].sort((a, b) => a.sortPosition - b.sortPosition);
});

const tieneDatos = computed(() => {
  if (chartType.value === 'horizontal_bar' || chartType.value === 'treemap') {
    return estados.value.length > 0;
  }
  return barras.value.length > 0;
});

// ─── Opciones ECharts ────────────────────────────────────────────────────────

const optionBar = computed(() => ({
  animationDurationUpdate: 350,
  animationEasingUpdate: 'cubicInOut',
  title: {
    text: 'Distribución de Frecuencias',
    textStyle: { fontSize: 12, fontWeight: '600', color: '#333' },
    top: 4,
    left: 8,
  },
  tooltip: {
    trigger: 'axis',
    formatter: (params) => `<b>${params[0].name}</b><br/>${params[0].value} estados`,
  },
  grid: { left: 36, right: 12, top: 44, bottom: 72, containLabel: false },
  xAxis: {
    type: 'category',
    data: barras.value.map((b) => b.label),
    axisLabel: { rotate: 35, fontSize: 10, overflow: 'truncate', width: 80, color: '#555' },
    axisLine: { lineStyle: { color: '#ddd' } },
  },
  yAxis: {
    type: 'value',
    minInterval: 1,
    axisLabel: { fontSize: 10, color: '#555' },
    splitLine: { lineStyle: { color: '#f0f0f0' } },
  },
  series: [
    {
      type: 'bar',
      barMaxWidth: 52,
      data: barras.value.map((b) => {
        const activo = !props.rangoActivoColor || b.color === props.rangoActivoColor;
        return {
          value: b.count,
          itemStyle: { color: b.color, opacity: activo ? 1 : 0.4, borderRadius: [3, 3, 0, 0] },
        };
      }),
    },
  ],
}));

const optionDonut = computed(() => ({
  animationDurationUpdate: 350,
  animationEasingUpdate: 'cubicInOut',
  tooltip: {
    trigger: 'item',
    formatter: (p) => `<b>${p.name}</b><br/>${p.value} estados (${p.percent}%)`,
  },
  series: [
    {
      type: 'pie',
      radius: ['42%', '72%'],
      center: ['50%', '50%'],
      label: {
        show: true,
        fontSize: 10,
        formatter: (p) => `${p.percent}%`,
        color: '#555',
      },
      labelLine: { length: 8, length2: 6 },
      emphasis: {
        label: { show: true, fontSize: 13, fontWeight: 'bold' },
        scaleSize: 6,
      },
      data: barras.value.map((b) => {
        const activo = !props.rangoActivoColor || b.color === props.rangoActivoColor;
        return {
          value: b.count,
          name: b.label,
          itemStyle: { color: b.color, opacity: activo ? 1 : 0.35 },
        };
      }),
    },
  ],
}));

const optionHorizontalBar = computed(() => {
  const lista = estados.value;
  const etiquetas = lista.map((e) => e.label).reverse();
  const datos = lista
    .map((e) => {
      const activo = !props.rangoActivoColor || e.color === props.rangoActivoColor;
      return {
        value: typeof e.value === 'number' ? e.value : parseFloat(e.value) || 0,
        itemStyle: { color: e.color, opacity: activo ? 1 : 0.4, borderRadius: [0, 3, 3, 0] },
      };
    })
    .reverse();

  return {
    animationDurationUpdate: 350,
    animationEasingUpdate: 'cubicInOut',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => {
        const p = params[0];
        const val =
          typeof p.value === 'number'
            ? p.value.toLocaleString('es-MX', { maximumFractionDigits: 2 })
            : p.value;
        return `<b>${p.name}</b><br/>${val}`;
      },
    },
    grid: { left: 8, right: 24, top: 8, bottom: 8, containLabel: true },
    xAxis: {
      type: 'value',
      axisLabel: { fontSize: 9, color: '#555' },
      splitLine: { lineStyle: { color: '#f0f0f0' } },
    },
    yAxis: {
      type: 'category',
      data: etiquetas,
      axisLabel: { fontSize: 9.5, color: '#444', width: 110, overflow: 'truncate' },
      axisLine: { lineStyle: { color: '#ddd' } },
    },
    series: [{ type: 'bar', barMaxWidth: 16, data: datos }],
  };
});

const optionTreemap = computed(() => ({
  animationDurationUpdate: 350,
  animationEasingUpdate: 'cubicInOut',
  tooltip: {
    formatter: (p) => {
      const val =
        typeof p.value === 'number'
          ? p.value.toLocaleString('es-MX', { maximumFractionDigits: 2 })
          : p.value;
      return `<b>${p.name}</b><br/>${val}`;
    },
  },
  series: [
    {
      type: 'treemap',
      roam: false,
      nodeClick: false,
      breadcrumb: { show: false },
      label: {
        show: true,
        fontSize: 10,
        formatter: (p) => p.name,
        overflow: 'truncate',
      },
      upperLabel: { show: false },
      itemStyle: { borderWidth: 2, borderColor: '#fff', gapWidth: 2 },
      data: estados.value.map((e) => {
        const activo = !props.rangoActivoColor || e.color === props.rangoActivoColor;
        return {
          name: e.label,
          value: typeof e.value === 'number' ? e.value : parseFloat(e.value) || 0,
          itemStyle: { color: e.color, opacity: activo ? 1 : 0.35 },
        };
      }),
    },
  ],
}));

const option = computed(() => {
  switch (chartType.value) {
    case 'donut':
      return optionDonut.value;
    case 'horizontal_bar':
      return optionHorizontalBar.value;
    case 'treemap':
      return optionTreemap.value;
    default:
      return optionBar.value;
  }
});

// ─── Interacción hover ────────────────────────────────────────────────────────

function onBarHover(params) {
  if (params.componentType !== 'series') return;
  let color = null;

  if (chartType.value === 'treemap') {
    const estado = estados.value.find((e) => e.label === params.name);
    color = estado?.color ?? null;
  } else if (chartType.value === 'horizontal_bar') {
    // La lista está invertida en ECharts (índice 0 = última entidad)
    const idx = estados.value.length - 1 - params.dataIndex;
    color = estados.value[idx]?.color ?? null;
  } else if (chartType.value === 'donut') {
    color = barras.value[params.dataIndex]?.color ?? null;
  } else {
    color = barras.value[params.dataIndex]?.color ?? null;
  }

  emit('hover-rango', color);
}

function onBarOut() {
  emit('hover-rango', null);
}
</script>

<template>
  <ClientOnly>
    <div v-if="tieneDatos" class="grafica-indicador">
      <VChart
        class="grafica-indicador__chart"
        :option="option"
        autoresize
        @mouseover="onBarHover"
        @mouseout="onBarOut"
      />
    </div>
    <div v-else class="grafica-indicador grafica-indicador--vacia">
      <p>Sin datos de distribución disponibles</p>
    </div>
  </ClientOnly>
</template>

<style lang="scss" scoped>
.grafica-indicador {
  height: 100%;
  min-height: 280px;
  display: flex;
  flex-direction: column;
  padding: 0.5rem;

  &__chart {
    width: 100%;
    height: 100%;
    min-height: 280px;
  }

  &--vacia {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 280px;
    color: #999;
    padding: 1rem;
  }
}
</style>
