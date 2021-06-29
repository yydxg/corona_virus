import { request } from '@/utils/request';

export async function fetchAll(params) {
  return request(`/api/neo4j/all`, {
    method: 'GET'
  });
}