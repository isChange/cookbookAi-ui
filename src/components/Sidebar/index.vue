<template>
  <div class="sidebar" :class="{ collapsed: chatStore.sidebarCollapsed }">
    <div class="sidebar-content">
      <!-- Logo和新建对话 -->
      <div class="sidebar-header">
        <div v-if="!chatStore.sidebarCollapsed" class="logo">
          <h2>COOKBOOK AI</h2>
        </div>
        <el-tooltip content="新建对话" placement="right" :disabled="!chatStore.sidebarCollapsed">
          <el-button
            type="primary"
            :icon="Plus"
            :circle="chatStore.sidebarCollapsed"
            class="new-chat-btn"
            @click="handleNewChat"
          >
            <span v-if="!chatStore.sidebarCollapsed">新建对话</span>
          </el-button>
        </el-tooltip>
      </div>

      <!-- 会话列表 -->
      <div class="conversation-list">
        <div v-if="chatStore.conversations.length === 0" class="empty-conversations">
          <el-empty
            v-if="!chatStore.sidebarCollapsed"
            description="暂无对话记录"
            :image-size="60"
          />
        </div>
        
        <ConversationItem
          v-for="conv in chatStore.conversations"
          :key="conv.id"
          :conversation="conv"
          :active="conv.id === chatStore.currentConversationId"
          :collapsed="chatStore.sidebarCollapsed"
          @select="handleSelectConversation"
          @delete="handleDeleteConversation"
          @rename="handleRenameConversation"
        />
      </div>

      <!-- 用户信息 -->
      <div class="sidebar-footer">
        <UserInfo :collapsed="chatStore.sidebarCollapsed" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useChatStore } from '@/stores/chat'
import { Plus } from '@element-plus/icons-vue'
import ConversationItem from './ConversationItem.vue'
import UserInfo from './UserInfo.vue'
import { ElMessageBox } from 'element-plus'

const chatStore = useChatStore()

const handleNewChat = () => {
  chatStore.createConversation('新对话')
}

const handleSelectConversation = async (conversationId) => {
  try {
    await chatStore.switchConversation(conversationId)
  } catch (error) {
    console.error('切换会话失败:', error)
  }
}

const handleDeleteConversation = async (conversationId) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这个对话吗？删除后无法恢复。',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await chatStore.deleteConversation(conversationId)
  } catch (error) {
    // 用户取消删除
  }
}

const handleRenameConversation = async (conversationId) => {
  const conversation = chatStore.conversations.find(c => c.id === conversationId)
  if (!conversation) return

  try {
    const { value } = await ElMessageBox.prompt(
      '请输入新的对话名称',
      '重命名',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: conversation.title,
        inputPattern: /.+/,
        inputErrorMessage: '对话名称不能为空'
      }
    )
    
    if (value) {
      chatStore.renameConversation(conversationId, value)
    }
  } catch (error) {
    // 用户取消重命名
  }
}
</script>

<style scoped lang="scss">
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 260px;
  background: var(--bg-primary);
  border-right: 1px solid var(--border-color);
  transition: transform 0.3s ease;
  z-index: 100;

  &.collapsed {
    transform: translateX(-260px);
  }

  .sidebar-content {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .sidebar-header {
    padding: 20px 16px;
    border-bottom: 1px solid var(--border-color);

    .logo {
      margin-bottom: 16px;
      text-align: center;

      h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: var(--text-primary);
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    }

    .new-chat-btn {
      width: 100%;
    }
  }

  .conversation-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--border-dark);
      border-radius: 3px;

      &:hover {
        background: var(--text-placeholder);
      }
    }

    .empty-conversations {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 200px;
    }
  }

  .sidebar-footer {
    border-top: 1px solid var(--border-color);
  }
}
</style>

