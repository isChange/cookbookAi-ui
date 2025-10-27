<template>
  <div
    class="conversation-item"
    :class="{ active }"
    @click="handleSelect"
  >
    <el-tooltip
      :content="conversation.title"
      placement="right"
      :disabled="!collapsed"
    >
      <div class="conversation-content">
        <el-icon class="conversation-icon">
          <ChatDotRound />
        </el-icon>
        <span v-if="!collapsed" class="conversation-title">
          {{ conversation.title }}
        </span>
      </div>
    </el-tooltip>

    <div v-if="!collapsed && active" class="conversation-actions">
      <el-button
        text
        :icon="Edit"
        size="small"
        @click.stop="handleRename"
      />
      <el-button
        text
        :icon="Delete"
        size="small"
        type="danger"
        @click.stop="handleDelete"
      />
    </div>
  </div>
</template>

<script setup>
import { ChatDotRound, Edit, Delete } from '@element-plus/icons-vue'

const props = defineProps({
  conversation: {
    type: Object,
    required: true
  },
  active: {
    type: Boolean,
    default: false
  },
  collapsed: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select', 'delete', 'rename'])

const handleSelect = () => {
  emit('select', props.conversation.id)
}

const handleDelete = () => {
  emit('delete', props.conversation.id)
}

const handleRename = () => {
  emit('rename', props.conversation.id)
}
</script>

<style scoped lang="scss">
.conversation-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  margin-bottom: 4px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--bg-secondary);

    .conversation-actions {
      opacity: 1;
    }
  }

  &.active {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
    
    .conversation-title {
      color: var(--primary-color);
      font-weight: 500;
    }
  }

  .conversation-content {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    min-width: 0;

    .conversation-icon {
      flex-shrink: 0;
      font-size: 18px;
      color: var(--text-secondary);
    }

    .conversation-title {
      flex: 1;
      font-size: 14px;
      color: var(--text-primary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .conversation-actions {
    display: flex;
    gap: 4px;
    opacity: 0;
    transition: opacity 0.2s ease;

    .el-button {
      padding: 4px;
    }
  }
}
</style>

