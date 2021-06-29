import { request } from '@/utils/request';

export async function deleteById(params) {
  return request(`/api/rabbitStation/deleteById/${params.id}`, {
    method: 'GET'
  });
}

export async function save(params){
  return request(`/api/rabbitStation/save`, {
    method: 'POST',
    data: params.data
  })
}

export async function update(params){
  return request(`/api/rabbitStation/update`, {
    method: 'POST',
    data: params.data
  })
}

export async function fetchAll(params) {
  return request(`/api/rabbitStation/findAll`, {
    method: 'GET'
  });
}

export async function fetchByStationNum(params) {
  return request(`/api/rabbitStation/findByStationNum/${params.stationNum}`, {
    method: 'GET'
  });
}