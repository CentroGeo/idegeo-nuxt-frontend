<script setup>
import { Ckeditor } from '@ckeditor/ckeditor5-vue';
import translations from 'ckeditor5/translations/es.js';

// const editor = ref(null);
const editor = shallowRef(null);
const config = reactive({
  root: {
    placeholder: '¡Escribe o pega tu contenido aquí!',
  },
  toolbar: {
    items: [
      'undo',
      'redo',
      '|',
      'sourceEditing',
      'showBlocks',
      '|',
      'heading',
      // 'style',
      '|',
      'fontSize',
      'fontFamily',
      'fontColor',
      'fontBackgroundColor',
      '|',
      'bold',
      'italic',
      'underline',
      'strikethrough',
      'subscript',
      'superscript',
      'code',
      '|',
      'horizontalLine',
      'link',
      'insertImageViaUrl',
      'mediaEmbed',
      'insertTable',
      'highlight',
      'blockQuote',
      'codeBlock',
      '|',
      'alignment',
      '|',
      'bulletedList',
      'numberedList',
      'todoList',
      'outdent',
      'indent',
    ],
    shouldNotGroupWhenFull: false,
  },
  plugins: [],
  licenseKey: 'GPL',
  fontFamily: {
    supportAllValues: true,
  },
  fontSize: {
    options: [10, 12, 14, 'default', 18, 20, 22],
    supportAllValues: true,
  },
  heading: {
    options: [
      {
        model: 'paragraph',
        title: 'Paragraph',
        class: 'ck-heading_paragraph',
      },
      {
        model: 'heading1',
        view: 'h1',
        title: 'Heading 1',
        class: 'ck-heading_heading1',
      },
      {
        model: 'heading2',
        view: 'h2',
        title: 'Heading 2',
        class: 'ck-heading_heading2',
      },
      {
        model: 'heading3',
        view: 'h3',
        title: 'Heading 3',
        class: 'ck-heading_heading3',
      },
      {
        model: 'heading4',
        view: 'h4',
        title: 'Heading 4',
        class: 'ck-heading_heading4',
      },
      {
        model: 'heading5',
        view: 'h5',
        title: 'Heading 5',
        class: 'ck-heading_heading5',
      },
      {
        model: 'heading6',
        view: 'h6',
        title: 'Heading 6',
        class: 'ck-heading_heading6',
      },
    ],
  },
  htmlSupport: {
    allow: [
      {
        name: /^.*$/,
        styles: true,
        attributes: true,
        classes: true,
      },
    ],
  },
  image: {
    toolbar: [
      'toggleImageCaption',
      'imageTextAlternative',
      '|',
      'imageStyle:inline',
      'imageStyle:wrapText',
      'imageStyle:breakText',
    ],
  },
  language: 'es',
  link: {
    addTargetToExternalLinks: true,
    defaultProtocol: 'https://',
    decorators: {
      toggleDownloadable: {
        mode: 'manual',
        label: 'Downloadable',
        attributes: {
          download: 'file',
        },
      },
    },
  },
  mediaEmbed: {
    toolbar: ['mediaEmbed:breakText', 'mediaEmbed:wrapText'],
  },
  menuBar: {
    isVisible: true,
  },
  style: {
    definitions: [
      {
        name: 'Article category',
        element: 'h3',
        classes: ['category'],
      },
      {
        name: 'Title',
        element: 'h2',
        classes: ['document-title'],
      },
      {
        name: 'Subtitle',
        element: 'h3',
        classes: ['document-subtitle'],
      },
      {
        name: 'Info box',
        element: 'p',
        classes: ['info-box'],
      },
      {
        name: 'CTA Link Primary',
        element: 'a',
        classes: ['button', 'button--green'],
      },
      {
        name: 'CTA Link Secondary',
        element: 'a',
        classes: ['button', 'button--black'],
      },
      {
        name: 'Marker',
        element: 'span',
        classes: ['marker'],
      },
      {
        name: 'Spoiler',
        element: 'span',
        classes: ['spoiler'],
      },
    ],
  },
  table: {
    contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells'],
  },
  translations: [translations],
});
const data = ref('<p>Hello world!</p>');

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

<template>
  <ClientOnly>
    <component
      :is="Ckeditor"
      v-if="editor && config.plugins.length > 0"
      v-model="data"
      :editor="editor"
      :config="config"
    />
  </ClientOnly>
</template>

<style lang="scss">
@import 'ckeditor5/ckeditor5.css';
</style>
