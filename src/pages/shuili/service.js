import { request } from '@/utils/request';

export async function fetchAll(params) {
  return request(`/api/pigDisease/findAll`, {
    method: 'GET'
  });
}

export async function deleteById(params) {
  return request(`/api/v1/common/deleteById/${params.id}`, {
    method: 'GET'
  });
}

export async function save(params){
  return request(`/api/v1/common/save`,{
    method: 'POST',
    data: params.data
  })
}

export async function update(params){
  return request(`/api/v1/common/update`,{
    method: 'POST',
    data: params.data
  })
}

export async function fetchByName(params){
  return request(`/api/v1/common/findByV4_/shuili/${params.name}`,{
    method: 'GET',
  })
}