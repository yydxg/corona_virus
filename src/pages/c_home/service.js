import { request } from '@/utils/request';

export async function fetchSearch(params) {
  return request(`/api/jzJingDian/findByName/${params.name}`, {
    method: 'GET'
  });
}
