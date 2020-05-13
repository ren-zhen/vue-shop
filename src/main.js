import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入全局样式表
import './assets/css/global.css'
// 导入字体图标
import './assets/fonts/iconfont.css'
// 导入树形表格插件
import TreeTable from 'vue-table-with-tree-grid'
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 富文本编辑器对应的样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme
// 导入axios请求
import axios from 'axios'
// 配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 请求拦截器
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 最后必须 return config
  return config
})
Vue.prototype.$http = axios
// 富文本编辑器注册为全局可用的组件
Vue.use(VueQuillEditor)
// 过滤器
Vue.filter('dateFormat', function(originVal) {
  var dt = new Date(originVal)
  // 获取年月日
  var y = dt.getFullYear()
  var m = (dt.getMonth() + 1 + '').padStart(2, '0')
  var d = (dt.getDate() + '').padStart(2, '0')
  // 获取时分秒
  var hh = (dt.getHours() + '').padStart(2, '0')
  var mm = (dt.getMinutes() + '').padStart(2, '0')
  var ss = (dt.getSeconds() + '').padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

Vue.config.productionTip = false

// 注册树形表格为全局可用的组件
Vue.component('tree-table', TreeTable)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
