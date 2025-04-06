import request from '../utils/request';

const USER_BASE_URL = '/api/v1/users';

/** 登录用户信息 */
export interface UserInfo {
    /** 用户ID */
    userId?: string;
  
    /** 用户名 */
    username?: string;
  
    /** 昵称 */
    nickname?: string;
  
    /** 头像URL */
    avatar?: string;
  
    /** 角色 */
    roles: string[];
  
    /** 权限 */
    perms: string[];
}

const UserAPI = {
  /**
   * 获取当前登录用户信息
   * @returns 登录用户昵称、头像信息，包括角色和权限
   */
   getInfo: () => {
    return request<any, UserInfo>({
      url: `${USER_BASE_URL}/me`,
      method: 'GET',
    })
   }

}

export default UserAPI;