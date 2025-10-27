import request from '@/utils/request'

/**
 * 生成注册码（需要登录）
 * @param {Object} data - 生成信息
 * @param {string} data.remark - 备注
 * @param {number} data.count - 生成数量（可选，默认1）
 */
export function generateRegisterCode(data) {
  return request({
    url: '/register-code/generate',
    method: 'post',
    data
  })
}

/**
 * 验证注册码（不需要登录）
 * 验证成功后会删除注册码（一次性使用）
 * @param {Object} data - 验证信息
 * @param {string} data.code - 注册码
 */
export function validateRegisterCode(data) {
  return request({
    url: '/register-code/validate',
    method: 'post',
    data
  })
}

/**
 * 检查注册码（不需要登录）
 * 仅检查有效性，不会删除注册码
 * @param {Object} data - 检查信息
 * @param {string} data.code - 注册码
 */
export function checkRegisterCode(data) {
  return request({
    url: '/register-code/check',
    method: 'post',
    data
  })
}

/**
 * 删除注册码（需要登录）
 * @param {string} code - 注册码
 */
export function removeRegisterCode(code) {
  return request({
    url: `/register-code/remove/${code}`,
    method: 'delete'
  })
}

/**
 * 查询注册码剩余有效时间（不需要登录）
 * @param {string} code - 注册码
 */
export function getRegisterCodeExpireTime(code) {
  return request({
    url: `/register-code/expire-time/${code}`,
    method: 'get'
  })
}

/**
 * 查询我生成的注册码列表（需要登录）
 */
export function getMyRegisterCodes() {
  return request({
    url: '/register-code/my-codes',
    method: 'get'
  })
}

/**
 * 查询注册码详细信息（需要登录）
 * @param {string} code - 注册码
 */
export function getRegisterCodeInfo(code) {
  return request({
    url: `/register-code/info/${code}`,
    method: 'get'
  })
}

