import { request } from '@/utils/request';

export async function fetchPerson(params) {
  return request(`/api/person/findByCurrentCity/${params.currentCity}`, {
    method: 'GET'
  });
}
