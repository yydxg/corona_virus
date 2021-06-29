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
  return request(`/api/pigDisease/save`,{
    method: 'POST',
    data: params.data
  })
}

export async function update(params){
  return request(`/api/pigDisease/update`,{
    method: 'POST',
    data: params.data
  })
}

export async function fetchByDateAndBinming(params){
  return request(`/api/pigDisease/findByDateAndBinming/${params.date}/${params.binming}`,{
    method: 'GET',
  })
}