<template>
  <div class="editor row full-height">
    <header>
      <div class="page-title">
        <p>Markdown Editor</p>
      </div>
      <div class="button-area">
        <b-button variant="outline-success" @click="exportPdf()" :disabled="isDisabledExportPdfButton">
          Export PDF
        </b-button>
      </div>
    </header>
    <div class="col-xs-6 full-height">
      <textarea v-model="source" class="source full-height syncscroll" name="scroll-area">
      </textarea>
    </div>
    <section class="result-area col-xs-6 full-height" id="print-area">
      <vue-markdown
        class="markdown-preview result-html full-height syncscroll"
        name="scroll-area"
        :source="source"
        :watches="['source']"
        :show="show"
        :toc="false"
        @rendered="highlight()">
      </vue-markdown>
    </section>
  </div>
</template>

<style src="../../../static/vendor/css/prism.min.css"></style>

<style lang="scss" scoped>

.editor {
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .page-title {
      margin-top: 15px;
      position: relative;
      min-height: 1px;
      padding-right: 15px;
      padding-left: 15px;
      > p {
        font-size: 24px;
        font-weight: 600;
      }
    }
    .button-area {
      margin-right: 15px;
    }
  }
  .source{
    width: 100%;
    font-size: 14px;
  }

  .result-html {
    padding: 2px 10px;
    overflow: auto;
    border: 1px solid rgb(153, 153, 153);
    border-radius:4px;
    background-color: inherit;
  }
}

</style>

<script>
import VueMarkdown from 'vue-markdown'
import Prism from 'prismjs'
import PrismLoader from 'prismjs-components-loader'
import componentIndex from 'prismjs-components-loader/lib/all-components'
import { ipcRenderer } from 'electron'
import { isEmpty } from 'lodash'

const prismLoader = new PrismLoader(componentIndex)
prismLoader.load(Prism, 'go')
prismLoader.load(Prism, 'ruby')

export default {
  name: 'editor',
  data: () => {
    return {
      source: '',
      show: true,
      html: false,
      breaks: true,
      linkify: false,
      emoji: true,
      typographer: true,
      toc: false
    }
  },
  computed: {
    isDisabledExportPdfButton () {
      return isEmpty(this.source)
    }
  },
  components: {
    VueMarkdown
  },
  methods: {
    highlight () {
      Prism.highlightAll()
    },
    exportPdf () {
      const context = this.$twemoji.parse(document.getElementById('print-area').innerHTML)
      ipcRenderer.send('print-to-pdf', context)
    }
  }
}
</script>
