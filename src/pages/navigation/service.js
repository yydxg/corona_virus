import { request } from '@/utils/request';

export async function fetchPoi(params) {
  return request(`/api/poi/findAll`, {
    method: 'GET'
  });
}

export async function fetchPerson(params) {
  return request(`/api/person/findByCurrentCity/${params.currentCity}`, {
    method: 'GET'
  });
}

export async function fetchSuyuan(params) {
  return request(`/api/person/findSuyuan/${params.id}`, {
    method: 'GET'
  });
}

export async function fetchTravel(params){
  return request(`/api/travel/findTravelOrderByDate/${params.id}`,{
    method: 'GET'
  })
}