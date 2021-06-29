import { request } from '@/utils/request';

export async function fetchTongjiArea(params) {
  return request(`/api/ny/tongjiArea/`, {
    method: 'GET'
  });
}