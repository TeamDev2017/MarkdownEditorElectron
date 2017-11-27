<template>
  <div class="editor row full-height">
    <header>
      <div class="page-title">
        <p>Markdown Editor</p>
      </div>
      <div class="button-area">
        <b-button variant="outline-success" @click="exportPdf()">
          Export PDF
        </b-button>
      </div>
    </header>
    <div class="col-xs-6 full-height">
      <textarea v-model="source" class="source full-height syncscroll" name="scroll-area">
      </textarea>
    </div>
    <section class="result-area col-xs-6 full-height">
      <vue-markdown
        class="markdown-preview result-html full-height syncscroll"
        name="scroll-area"
        :source="source"
        :watches="['source']"
        :show="show"
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
import path from 'path'
import fs from 'fs'
// import markdownpdf from 'markdown-pdf'
import { remote } from 'electron'
import moment from 'moment'

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
  components: {
    VueMarkdown
  },
  methods: {
    highlight () {
      Prism.highlightAll()
    },
    exportPdf () {
      const contents = remote.webContents.getFocusedWebContents()
      const options = {
        marginsType: 0,
        printBackground: false,
        printSelectionOnly: false,
        landscape: false
      }
      const currentDate = moment().format('YYYYMMDDHHmmss')
      contents.printToPDF(options, (error, data) => {
        if (error) throw error
        fs.writeFile(
          path.join(remote.app.getPath('home'), `/desktop/output_${currentDate}.pdf`), data, (error) => {
            if (error) throw error
            console.log('Write PDF successfully.')
          }
        )
      })
      // const currentDate = moment().format('YYYYMMDDHHmmss')
      // fs.writeFileSync('tmp/output.md', this.source)
      // markdownpdf()
      //   .from('tmp/output.md')
      //   .to(path.join(remote.app.getPath('home'), `/desktop/output_${currentDate}.pdf`), () => {
      //     const win = remote.getCurrentWindow()
      //     const options = {
      //       type: 'info',
      //       buttons: ['OK'],
      //       title: '完了',
      //       message: 'PDFの出力が完了しました。',
      //       detail: ''
      //     }
      //     remote.dialog.showMessageBox(win, options)
      //   })
    }
  }
}
</script>
