import { request } from '@/utils/request';

export async function fetchSearch(params) {
  return request(`/api/neo4j/search/${params.sName}/${params.tName}`, {
    method: 'GET'
  });
}

export async function fetchSearch2(params) {
  return request(`/api/neo4j/search/${params.name}`, {
    method: 'GET'
  });
}