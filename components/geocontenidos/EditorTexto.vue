<template>
  <ClientOnly>
    <component
      :is="Ckeditor"
      v-if="editor && config.plugins.length > 0"
      v-model="contenido"
      :editor="editor"
      :config="config"
    />
  </ClientOnly>
</template>

<script setup>
import { Ckeditor } from '@ckeditor/ckeditor5-vue';
import CkeditorConfig from '~/utils/geocontenidos/CkeditorConfig';

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
});
const { modelValue } = toRefs(props);
const emit = defineEmits(['update:modelValue']);

// const editor = ref(null);
const editor = shallowRef(null);
const config = reactive(CkeditorConfig);
const contenido = ref(props.modelValue || '');

watch(contenido, (nuevoContenido) => {
  emit('update:modelValue', nuevoContenido);
});
watch(modelValue, (nuevoContenidoProp) => {
  if (nuevoContenidoProp !== contenido.value) {
    contenido.value = nuevoContenidoProp;
  }
});

onMounted(async () => {
  // const { Ckeditor } = await import('@ckeditor/ckeditor5-vue');
  // const { ClassicEditor } = await import('ckeditor5');
  // const [Ckeditor5Vue, { ClassicEditor, Autosave, Essentials, Paragraph, Underline }] =
  //   await Promise.all([import('@ckeditor/ckeditor5-vue'), import('ckeditor5')]);
  const {
    ClassicEditor,
    Autosave,
    Essentials,
    Paragraph,
    List,
    TodoList,
    MediaEmbed,
    Link,
    AutoLink,
    BlockQuote,
    HorizontalLine,
    Indent,
    IndentBlock,
    Alignment,
    GeneralHtmlSupport,
    MediaEmbedStyle,
    MediaEmbedToolbar,
    ImageStyle,
    ImageBlock,
    ImageToolbar,
    Highlight,
    FontBackgroundColor,
    FontColor,
    FontFamily,
    FontSize,
    Superscript,
    Subscript,
    Code,
    Strikethrough,
    Underline,
    Italic,
    ImageInline,
    Heading,
    CodeBlock,
    Style,
    ImageUpload,
    CloudServices,
    ImageInsertViaUrl,
    AutoImage,
    LinkImage,
    ImageCaption,
    ImageTextAlternative,
    Table,
    TableToolbar,
    TableCaption,
    PlainTableOutput,
    HtmlComment,
    SourceEditing,
    ShowBlocks,
    Bold,
  } = await import('ckeditor5');

  editor.value = ClassicEditor;
  config.plugins = [
    Alignment,
    AutoImage,
    AutoLink,
    Autosave,
    BlockQuote,
    Bold,
    CloudServices,
    Code,
    CodeBlock,
    Essentials,
    FontBackgroundColor,
    FontColor,
    FontFamily,
    FontSize,
    GeneralHtmlSupport,
    Heading,
    Highlight,
    HorizontalLine,
    HtmlComment,
    ImageBlock,
    ImageCaption,
    ImageInline,
    ImageInsertViaUrl,
    ImageStyle,
    ImageTextAlternative,
    ImageToolbar,
    ImageUpload,
    Indent,
    IndentBlock,
    Italic,
    Link,
    LinkImage,
    List,
    MediaEmbed,
    MediaEmbedStyle,
    MediaEmbedToolbar,
    Paragraph,
    PlainTableOutput,
    ShowBlocks,
    SourceEditing,
    Strikethrough,
    Style,
    Subscript,
    Superscript,
    Table,
    TableCaption,
    TableToolbar,
    TodoList,
    Underline,
  ];
});
</script>

<style lang="scss">
@import 'ckeditor5/ckeditor5.css';
</style>
