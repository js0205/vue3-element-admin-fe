import { useStorage } from '@vueuse/core';
import { defineStore } from 'pinia';
import AuthAPI, { type LoginFormData } from '@/api/auth';
import { getRefreshToken, setAccessToken, setRefreshToken,clearToken } from "@/utils/auth";

interface UserInfo {
  username: string;
  password: string;
}

export const useUserStore = defineStore('user', ()=>{
  const userInfo = useStorage<UserInfo>("userInfo", {} as UserInfo);
  function login(LoginFormData:LoginFormData){
     return new Promise<void>((resolve,reject)=>{
      AuthAPI.login(LoginFormData).then((data: { accessToken: string; refreshToken: string; })=>{
        const {accessToken,refreshToken} = data;
        setAccessToken(accessToken);
        setRefreshToken(refreshToken);
        resolve()
      }).catch((error:unknown)=>{
        reject(error)
      })
     })
  }
  function refreshToken(){
    const refreshToken = getRefreshToken();
    return new Promise<void>((resolve,reject)=>{
      AuthAPI.refreshToken(refreshToken).then((data: { accessToken: string; refreshToken: string; })=>{
        const {accessToken,refreshToken} = data;
        setAccessToken(accessToken);
        setRefreshToken(refreshToken);
        resolve()
      }).catch((error:unknown)=>{
        console.log("refreshToken  刷新失败", error);
        reject(error)
      })
    })
  }
  function getUserInfo(){
  }

  function clearSessionAndCache(){
     return new Promise<void>((resolve)=>{
        clearToken();
        resolve()
     })
  }

  return {
    userInfo,
    login,
    refreshToken,
    getUserInfo,
    clearSessionAndCache
  }
});