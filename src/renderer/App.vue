<template>
  <div id="app" class="container full-height">
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: 'markdown-editor-electron'
  }
</script>

<style lang="scss">
$common_text_color: rgb(171, 178, 186);
$common_button_text_color: rgb(48, 166, 74);
$common_button_text_hover_color: #28a745;
$main_color: rgb(40, 44, 52);

#app {
  font-family: 'Helvetica Neue', 'Hiragino Kaku Gothic ProN', 'ヒラギノ角ゴ ProN W3', Meiryo, メイリオ, Osaka, 'MS PGothic', arial, helvetica, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

html,
body {
  height: 100%;
  padding-bottom: 50px;
  color: $common_text_color;
  background-color: $main_color;
}

.full-height {
  height: 100%;
}

h1, h2, h3, h4, h5 {
  font-weight: normal;
  color: white !important;
}

hr {
  color: rgb(75, 83, 98);
}

textarea {
  padding: 2px 10px;
  background-color: inherit;
  &:focus {
    outline-style: none;
  }
}

.btn {
  &.btn-outline-success {
    background-color: transparent;
    border-color: $common_button_text_color;
    color: $common_button_text_color;

    &:hover {
      color: white;
      background-color: $common_button_text_hover_color;
      border-color: $common_button_text_hover_color;
    }
    &:focus {
      outline-style: none;
    }
  }
}
</style>
