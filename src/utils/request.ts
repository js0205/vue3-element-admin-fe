import axios, { type InternalAxiosRequestConfig } from 'axios';
import * as qs from 'qs';
import { ResultEnum } from '../enums';
import { ElMessage, ElNotification } from 'element-plus';
import { getAccessToken } from './auth';
import { useUserStore } from '../store/modules/user';

const request = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || '',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
  },
  paramsSerializer: (params: any) => {
    return qs.stringify(params)
  },
});
request.interceptors.request.use(config => {
  const accessToken = getAccessToken();
  // 如果 Authorization 设置为 no-auth，则不携带 Token
  if (accessToken && config.headers.Authorization !== 'no-auth') {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }else{
    delete config.headers.Authorization;
  }
  return config;
}, error => {
  return Promise.reject(error);
});
request.interceptors.response.use(response => {
  const { code, msg, data } = response.data;
  if(code === ResultEnum.SUCCESS){
    return data;
  }
   ElMessage.error(msg || "系统出错");
   return Promise.reject(new Error(msg || "系统出错"));
}, async(error) => {
  console.error("error", error);
  const { config, response } = error;
  if(response){
    const { code, msg } = response.data;
    if(code === ResultEnum.ACCESS_TOKEN_INVALID){
       return handleTokenRefresh(config);
    }else if (code === ResultEnum.REFRESH_TOKEN_INVALID) {
       await handleSessionExpired();
       return Promise.reject(new Error(msg || "系统出错"));
    }else{
      ElMessage.error(msg || "系统出错");
    }
  }
  return Promise.reject(error.message);
});


let isRefreshing = false;
const waitingQueue: Array<() => void> = [];
const handleTokenRefresh = async (config: InternalAxiosRequestConfig) => {
   return new Promise((resolve) => {
    const retryRequest = () => {
      config.headers.Authorization = `Bearer ${getAccessToken()}`;
      resolve(request(config));
    }
    waitingQueue.push(retryRequest);
    if(!isRefreshing){
      isRefreshing = true;
      useUserStore().refreshToken().then(()=>{
        waitingQueue.forEach(cb=>cb());
        waitingQueue.length = 0;
      }).catch(async (error)=>{
        console.error("刷新token失败",error);
        await handleSessionExpired();
      }).finally(()=>{
        isRefreshing = false;
      })
    }
   })
}

const handleSessionExpired = async () => {
  ElNotification({
    title: '提示',
    message: '登录已过期，请重新登录',
    type: 'info',
  })
  await useUserStore().clearSessionAndCache();
}

export default request;