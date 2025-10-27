import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

import App from './App.vue'
import router from './router'
import pinia from './stores'

// 导入全局样式
import '@/styles/index.scss'

const app = createApp(App)

// 注册 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 使用插件
app.use(pinia)

// 初始化主题（在使用 pinia 之后）
import { useAppStore } from '@/stores/app'
const appStore = useAppStore()
document.documentElement.setAttribute('data-theme', appStore.theme)

app.use(router)
app.use(ElementPlus, {
  locale: zhCn
})

app.mount('#app')

