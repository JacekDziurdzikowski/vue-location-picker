import Vue from 'vue'
import App from './App'

global.vue = new Vue({
  el: '#app',
  render: h => h(App)
})
