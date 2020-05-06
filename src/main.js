import Vue from 'vue'
import App from './App.vue'
import store from './store'
import './plugins/element.js'
import electron from 'electron'

Vue.config.productionTip = false

Vue.prototype.$electron = electron

new Vue({
  store,
  render: h => h(App)
}).$mount('#app')
