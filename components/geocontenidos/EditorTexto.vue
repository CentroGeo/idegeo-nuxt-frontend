<script setup>
import { ClientOnly } from '#components';

const Ckeditor = shallowRef(null);
// const editor = ref(null);
const editor = shallowRef(null);
const editor_listo = ref(false);
// const config = reactive({
//   licenseKey: 'GPL',
// });
const config = ref(null);

onMounted(async () => {
  // const { Ckeditor } = await import('@ckeditor/ckeditor5-vue');
  // const { ClassicEditor } = await import('ckeditor5');
  // const [{ Ckeditor }, { ClassicEditor, Autosave, Essentials, Paragraph }] = await Promise.all([
  const [Ckeditor5Vue, ckeditor5] = await Promise.all([
    import('@ckeditor/ckeditor5-vue'),
    import('ckeditor5'),
  ]);

  // console.log(Ckeditor);
  // console.log(ClassicEditor);
  Ckeditor.value = Ckeditor5Vue.Ckeditor;
  editor.value = ckeditor5.ClassicEditor;
  config.value = {
    root: {
      placeholder: 'Type or paste your content here!',
      initialData: 'texto',
    },
    toolbar: {
      items: ['undo', 'redo', '|', 'underline'],
      // shouldNotGroupWhenFull: false,
    },
    plugins: [ckeditor5.Autosave, ckeditor5.Essentials, ckeditor5.Paragraph, ckeditor5.Underline],
    licenseKey: 'GPL',
  };
  editor_listo.value = true;

  // console.log(editor_listo.value && Ckeditor.value);
});
</script>

<template>
  <ClientOnly>
    <component
      :is="Ckeditor"
      v-if="editor && config"
      :editor="editor"
      :config="config"
      :model-value="config.root.initialData"
    />
  </ClientOnly>
</template>

<style lang="scss">
@import 'ckeditor5/ckeditor5.css';
</style>
