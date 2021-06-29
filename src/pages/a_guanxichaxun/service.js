import { request } from '@/utils/request';

export async function fetchSearch(params) {
  return request(`/api/services/fetchSearch`, {
    method: 'POST',
    data: params
  });
}
