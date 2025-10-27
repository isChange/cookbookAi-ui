<template>
  <div id="app">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { initDevToolsDetector, stopDevToolsDetector } from '@/utils/devtools-detector'
import { ElMessage, ElMessageBox } from 'element-plus'

const appStore = useAppStore()

// 开发者工具检测回调
const handleDevToolsDetected = () => {
  ElMessageBox.alert(
    '检测到开发者工具已打开，为了保护系统安全，请关闭开发者工具后继续使用。',
    '安全提示',
    {
      confirmButtonText: '我知道了',
      type: 'warning',
      showClose: false,
      closeOnClickModal: false,
      closeOnPressEscape: false
    }
  ).then(() => {
    // 用户点击确认后，可以选择刷新页面或其他操作
    // window.location.reload()
  })
}

onMounted(() => {
  // 初始化主题
  document.documentElement.setAttribute('data-theme', appStore.theme)

  // 只在生产环境启用开发者工具检测
  if (import.meta.env.PROD) {
    initDevToolsDetector(handleDevToolsDetected, {
      disableContextMenu: true,  // 禁用右键菜单
      disableShortcuts: true,     // 禁用快捷键
      useDebugger: false,         // 不使用 debugger（避免影响用户体验）
      interval: 1000              // 每秒检测一次
    })
  }
})

onUnmounted(() => {
  // 组件卸载时停止检测
  if (import.meta.env.PROD) {
    stopDevToolsDetector()
  }
})
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

