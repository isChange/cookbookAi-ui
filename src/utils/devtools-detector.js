/**
 * 开发者工具检测器
 * 注意：这些方法无法100%阻止开发者工具的使用，只能增加普通用户使用的难度
 * 有经验的开发者可以轻易绕过这些检测
 */

class DevToolsDetector {
  constructor() {
    this.isOpen = false
    this.listeners = []
    this.checkInterval = null
  }

  /**
   * 添加监听器
   * @param {Function} callback - 当开发者工具打开时的回调函数
   */
  addListener(callback) {
    this.listeners.push(callback)
  }

  /**
   * 触发所有监听器
   */
  trigger() {
    this.listeners.forEach(callback => callback())
  }

  /**
   * 方法1: 检测 console.log 的执行时间
   * 开发者工具打开时，console 操作会变慢
   */
  detectByConsoleTime() {
    const start = performance.now()
    console.log('%c', '')
    const end = performance.now()
    return end - start > 100 // 超过100ms认为开发者工具已打开
  }

  /**
   * 方法2: 检测窗口大小
   * 开发者工具打开会改变可视区域大小
   */
  detectByWindowSize() {
    const threshold = 160
    const widthThreshold = window.outerWidth - window.innerWidth > threshold
    const heightThreshold = window.outerHeight - window.innerHeight > threshold
    return widthThreshold || heightThreshold
  }

  /**
   * 方法3: 检测 debugger
   * 使用定时 debugger 语句
   */
  detectByDebugger() {
    let checkTime = 0
    const check = () => {
      checkTime++
      const start = new Date().getTime()
      // eslint-disable-next-line no-debugger
      debugger
      const end = new Date().getTime()
      if (end - start > 100) {
        return true
      }
      return false
    }
    return check()
  }

  /**
   * 方法4: 使用 toString 检测
   */
  detectByToString() {
    const element = new Image()
    let isOpen = false
    
    Object.defineProperty(element, 'id', {
      get: function() {
        isOpen = true
        throw new Error('Dev Tools detected')
      }
    })

    try {
      console.log(element)
    } catch (e) {
      // 忽略错误
    }

    return isOpen
  }

  /**
   * 方法5: 检测 Firebug
   */
  detectFirebug() {
    return window.console && (window.console.firebug || window.console.exception)
  }

  /**
   * 禁用右键菜单
   */
  disableContextMenu() {
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault()
      return false
    })
  }

  /**
   * 禁用常用快捷键
   * F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
   */
  disableShortcuts() {
    document.addEventListener('keydown', (e) => {
      // F12
      if (e.keyCode === 123) {
        e.preventDefault()
        return false
      }
      // Ctrl+Shift+I (开发者工具)
      if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
        e.preventDefault()
        return false
      }
      // Ctrl+Shift+J (控制台)
      if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
        e.preventDefault()
        return false
      }
      // Ctrl+U (查看源代码)
      if (e.ctrlKey && e.keyCode === 85) {
        e.preventDefault()
        return false
      }
      // Ctrl+S (保存)
      if (e.ctrlKey && e.keyCode === 83) {
        e.preventDefault()
        return false
      }
    })
  }

  /**
   * 开始检测
   * @param {Object} options - 配置选项
   * @param {boolean} options.disableContextMenu - 是否禁用右键菜单
   * @param {boolean} options.disableShortcuts - 是否禁用快捷键
   * @param {boolean} options.useDebugger - 是否使用 debugger 检测（可能影响性能）
   * @param {number} options.interval - 检测间隔（毫秒）
   */
  start(options = {}) {
    const {
      disableContextMenu = true,
      disableShortcuts = true,
      useDebugger = false,
      interval = 1000
    } = options

    // 禁用右键菜单
    if (disableContextMenu) {
      this.disableContextMenu()
    }

    // 禁用快捷键
    if (disableShortcuts) {
      this.disableShortcuts()
    }

    // 定期检测
    this.checkInterval = setInterval(() => {
      let detected = false

      // 方法1: 窗口大小检测
      if (this.detectByWindowSize()) {
        detected = true
      }

      // 方法2: Console 时间检测
      if (this.detectByConsoleTime()) {
        detected = true
      }

      // 方法3: Firebug 检测
      if (this.detectFirebug()) {
        detected = true
      }

      // 方法4: debugger 检测（可选，可能影响用户体验）
      if (useDebugger && this.detectByDebugger()) {
        detected = true
      }

      // 如果检测到开发者工具打开
      if (detected && !this.isOpen) {
        this.isOpen = true
        this.trigger()
      } else if (!detected && this.isOpen) {
        this.isOpen = false
      }
    }, interval)
  }

  /**
   * 停止检测
   */
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
  }

  /**
   * 清除所有监听器
   */
  clearListeners() {
    this.listeners = []
  }
}

// 导出单例
export const devToolsDetector = new DevToolsDetector()

/**
 * 初始化开发者工具检测
 * @param {Function} onDetect - 检测到开发者工具时的回调
 * @param {Object} options - 配置选项
 */
export function initDevToolsDetector(onDetect, options) {
  devToolsDetector.addListener(onDetect)
  devToolsDetector.start(options)
}

/**
 * 停止检测
 */
export function stopDevToolsDetector() {
  devToolsDetector.stop()
  devToolsDetector.clearListeners()
}

