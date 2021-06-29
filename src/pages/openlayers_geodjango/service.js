import { request } from '@/utils/request';

export async function viewPoi(params) {
  return request(`/api/viewPoi/`, {
    method: 'GET'
  });
}

export async function viewRoad(params) {
  return request(`/api/viewRoad/`, {
    method: 'GET'
  });
}

export async function viewBuilding(params) {
  return request(`/api/viewBuilding/`, {
    method: 'GET'
  });
}