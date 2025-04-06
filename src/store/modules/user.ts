import { useStorage } from '@vueuse/core';
import { defineStore } from 'pinia';
import AuthAPI, { type LoginFormData } from '@/api/auth';
import { getRefreshToken, setAccessToken, setRefreshToken,clearToken } from "@/utils/auth";
import UserAPI, { type UserInfo } from "@/api/user";


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
    return new Promise<UserInfo>((resolve,reject)=>{
      UserAPI.getInfo().then((data: UserInfo)=>{
        if(!data){
          reject("获取用户信息失败")
          return;
        }
        Object.assign(userInfo.value,{...data}); // 合并用户信息到 userInfo 中
        resolve(data)
      }).catch((error:unknown)=>{
        reject(error)
      })
    })
  }

  function clearSessionAndCache(){
     return new Promise<void>((resolve)=>{
        clearToken();
        userInfo.value = {} as UserInfo;
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