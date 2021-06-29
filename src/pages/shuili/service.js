import { request } from '@/utils/request';

export async function fetchAll(params) {
  return request(`/api/pigDisease/findAll`, {
    method: 'GET'
  });
}

export async function deleteById(params) {
  return request(`/api/pigDisease/deleteById/${params.id}`, {
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

export async function fetchByNameAndCategory(params){
  return request(`/api/yichan/findByNameAndCategory/${params.name}/${params.category}`,{
    method: 'GET',
  })
}