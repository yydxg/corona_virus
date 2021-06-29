import { request } from '@/utils/request';

export async function fetchKcSearch(params) {
  return request(`/api/neo/kc/search/${params.selectValue}`, {
    method: 'GET'
  });
}