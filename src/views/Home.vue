<template>
  <div class="home-container">
    <!-- 侧边栏 -->
    <Sidebar />
    
    <!-- 主内容区 -->
    <div class="main-content" :class="{ 'sidebar-collapsed': chatStore.sidebarCollapsed }">
      <ChatPanel />
    </div>

    <!-- 设置对话框 -->
    <SettingsDialog />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useChatStore } from '@/stores/chat'
import { useUserStore } from '@/stores/user'
import Sidebar from '@/components/Sidebar/index.vue'
import ChatPanel from '@/components/Chat/ChatPanel.vue'
import SettingsDialog from '@/components/Settings/SettingsDialog.vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const chatStore = useChatStore()
const userStore = useUserStore()

onMounted(async () => {
  try {
    // 获取用户信息
    if (!userStore.userInfo) {
      await userStore.getUserInfo()
    }
    
    // 加载会话列表
    await chatStore.loadConversations()
  } catch (error) {
    console.error('初始化失败:', error)
    ElMessage.error('获取用户信息失败，请重新登录')
    router.push('/login')
  }
})
</script>

<style scoped lang="scss">
.home-container {
  display: flex;
  height: 100vh;
  background: var(--bg-secondary);
  overflow: hidden;
}

.main-content {
  flex: 1;
  transition: all 0.3s ease;
  margin-left: 260px;
  
  &.sidebar-collapsed {
    margin-left: 0;
  }
}
</style>

