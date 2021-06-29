import { request } from '@/utils/request';

export async function fetchCheck(params) {
  return request(`/api/neo/javaCode/check/${params.type}`, {
    method: 'GET'
  });
}