import Vue from 'vue'
import './plugins/axios'
import App from './App.vue'
import router from './router'
import store from './store'

import VueToastr from "vue-toastr";

import "@fortawesome/fontawesome-free/js/all"
import "@/assets/css/theme_v2.css"

Vue.config.productionTip = false;

Vue.use(VueToastr, {
	defaultProgressBar: false,
	defaultPosition: "toast-bottom-right"
});

new Vue({
	router,
	store,
	render: h => h(App)
}).$mount('#app')