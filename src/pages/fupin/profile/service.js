import { request } from '@/utils/request';

/* export async function fetchLogin(params) {
  return request(`/api/user/login/${params.username}/${params.password}`, {
    method: 'GET'
  });
}
export async function fetchRegister(params) {
  return request(`/api/user/register`, {
    method: 'POST',
    data:params
  });
} */

export async function fetchProfile(params) {
  return request(`/api/profile/findByName/${params.name}`, {
    method: 'GET'
  });
}

export async function fetchAll(params) {
  return request(`/api/profile/findBySourceId/${params.sourceId}`, {
    method: 'GET'
  });
}

export async function deleteProfile(params) {
  return request(`/api/profile/delete/${params.id}`, {
    method: 'GET'
  });
}

export async function saveMovie(params){
  return request(`/api/profile/save`,{
    method: 'POST',
    data: params.data
  })
}

export async function fetchByType(params){
  console.log(params)
  return request(`/api/profile/fetchByType/${params.sourceId}/${params.type}`,{
    method: 'GET',
  })
}