import { request } from '@/utils/request';

export async function fetchXb(params) {
  return request(`/api/huanghe/findList/${params.lng}/${params.lat}`, {
    method: 'GET'
  });
}