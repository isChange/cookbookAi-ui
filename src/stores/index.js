import { createPinia } from 'pinia'

const pinia = createPinia()

// 简单的持久化插件
pinia.use(({ store, options }) => {
  // 检查 store 是否有 persist 配置
  const persistConfig = options.persist
  
  if (persistConfig && persistConfig.enabled) {
    const strategy = persistConfig.strategies[0]
    const { key, storage, paths } = strategy
    
    // 从 storage 恢复状态
    try {
      const savedState = storage.getItem(key)
      if (savedState) {
        const parsed = JSON.parse(savedState)
        store.$patch(parsed)
      }
    } catch (error) {
      console.error('Failed to restore state:', error)
    }

    // 监听状态变化并保存
    store.$subscribe(() => {
      try {
        const state = store.$state
        const toSave = paths ? 
          paths.reduce((acc, path) => {
            acc[path] = state[path]
            return acc
          }, {}) : 
          state
        
        storage.setItem(key, JSON.stringify(toSave))
      } catch (error) {
        console.error('Failed to save state:', error)
      }
    })
  }
})

export default pinia

