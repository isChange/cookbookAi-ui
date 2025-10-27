<template>
  <div class="user-info" :class="{ collapsed }">
    <el-dropdown
      trigger="click"
      placement="top-start"
      @command="handleCommand"
    >
      <div class="user-content">
        <el-avatar :size="collapsed ? 32 : 40" :src="userStore.avatar">
          <el-icon><User /></el-icon>
        </el-avatar>
        <div v-if="!collapsed" class="user-details">
          <div class="user-name">{{ userStore.nickname }}</div>
          <div class="user-role">{{ roleText }}</div>
        </div>
      </div>
      
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="settings" :icon="Setting">
            设置
          </el-dropdown-item>
          <el-dropdown-item command="profile" :icon="User">
            个人信息
          </el-dropdown-item>
          <el-dropdown-item divided command="logout" :icon="SwitchButton">
            退出登录
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
import { User, Setting, SwitchButton } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

defineProps({
  collapsed: {
    type: Boolean,
    default: false
  }
})

const router = useRouter()
const userStore = useUserStore()
const appStore = useAppStore()

const roleText = computed(() => {
  const roleMap = {
    'ADMIN': '管理员',
    'VIP': 'VIP用户',
    'FREE': '免费用户'
  }
  return roleMap[userStore.role] || '用户'
})

const handleCommand = async (command) => {
  switch (command) {
    case 'settings':
      appStore.showSettings()
      break
    case 'profile':
      // TODO: 打开个人信息对话框
      ElMessage.info('个人信息功能开发中')
      break
    case 'logout':
      try {
        await ElMessageBox.confirm(
          '确定要退出登录吗？',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        await userStore.logout()
        ElMessage.success('已退出登录')
        router.push('/login')
      } catch (error) {
        // 用户取消
      }
      break
  }
}
</script>

<style scoped lang="scss">
.user-info {
  padding: 16px;

  &.collapsed {
    display: flex;
    justify-content: center;
    padding: 12px;
  }

  .user-content {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.2s ease;

    &:hover {
      background: var(--bg-secondary);
    }

    .user-details {
      flex: 1;
      min-width: 0;

      .user-name {
        font-size: 14px;
        font-weight: 500;
        color: var(--text-primary);
        margin-bottom: 2px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .user-role {
        font-size: 12px;
        color: var(--text-secondary);
      }
    }
  }
}
</style>

