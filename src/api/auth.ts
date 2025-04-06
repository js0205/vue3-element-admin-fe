import request from '../utils/request';

const Auth_BASE_URL = '/api/v1/auth';

/** 登录表单数据 */
export interface LoginFormData {
  /** 用户名 */
  username: string;
  /** 密码 */
  password: string;
  /** 验证码缓存key */
  captchaKey: string;
  /** 验证码 */
  captchaCode: string;
  /** 记住我 */
  rememberMe: boolean;
}

/** 登录响应数据 */
export interface LoginResponse {
  /** 令牌类型 */
  tokenType: string;
  /** 访问令牌 */
  accessToken: string;
  /** 刷新令牌 */
  refreshToken: string;
  /** 过期时间（秒） */
  expiresIn: number;
}

/** 验证码信息 */
export interface CaptchaInfo {
  /** 验证码缓存key */
  captchaKey: string;
  /** 验证码Base64图片 */
  captchaBase64: string;
}

const AuthAPI = {
  /** 登录接口 */
  login: (data: LoginFormData) => {
    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('password', data.password);
    formData.append('captchaKey', data.captchaKey);
    formData.append('captchaCode', data.captchaCode);
    return request<any, LoginResponse>({
      url: `${Auth_BASE_URL}/login`,
      data: formData,
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  /** 登出 */
  logout: () => {
    return request<any, any>({
      url: `${Auth_BASE_URL}/logout`,
      method: 'DELETE',
    })
  },
  /** 获取验证码接口 */
  getCaptcha: () => {
    return request<any, CaptchaInfo>({
      url: `${Auth_BASE_URL}/captcha`,
      method: 'GET',
    })
  },
  /** 刷新令牌 */
  refreshToken: (refreshToken: string) => {
    return request<any, LoginResponse>({
      url: `${Auth_BASE_URL}/refresh-token`,
      params: {
        refreshToken:refreshToken,
      },
      method: 'POST',
      headers: {
        'Authorization': `no-auth`,
      },
    })
  }
}

export default AuthAPI;