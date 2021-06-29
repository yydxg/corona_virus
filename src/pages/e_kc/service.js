import { request } from '@/utils/request';

export async function fetchKcSearch(params) {
  return request(`/api/neo/ekc/search/${params.selectValue}`, {
    method: 'GET'
  });
}