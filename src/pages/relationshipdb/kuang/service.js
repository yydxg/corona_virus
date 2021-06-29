import { request } from '@/utils/request';

export async function fetchAll(params) {
  return request(`/api/kuang/findAll`, {
    method: 'GET'
  });
}

export async function deleteKuang(params) {
  return request(`/api/kuang/delete/${params.id}`, {
    method: 'GET'
  });
}

export async function saveKuang(params){
  return request(`/api/kuang/save`,{
    method: 'POST',
    data: params.data
  })
}