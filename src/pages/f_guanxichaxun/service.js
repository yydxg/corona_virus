import { request } from '@/utils/request';

export async function fetchSearch(params) {
  return request(`/djapi/model/fetchSearch`, {
    method: 'POST',
    data: params
  });
}
