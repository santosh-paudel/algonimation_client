import Vue from 'vue';
import {
  BootstrapVue,
  BootstrapVueIcons
} from 'bootstrap-vue'

import VueGtag from "vue-gtag";

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import router from './router';


import App from './App.vue'

Vue.config.productionTip = false

Vue.use(BootstrapVue);
Vue.use(BootstrapVueIcons);

Vue.use(VueGtag, {
  config: {
    id: "UA-158954413-1"
  }
});
new Vue({
  router: router,
  render: h => h(App),
}).$mount('#app')