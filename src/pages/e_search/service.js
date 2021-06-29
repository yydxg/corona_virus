import { request } from '@/utils/request';

export async function fetchSearch(params) {
  return request(`/api/neo/javaCode/search/${params.flag}/${params.sName}/${params.tName}`, {
    method: 'GET'
  });
}

export async function fetchAll(params) {
  return request(`/api/neo/javaCode/all`, {
    method: 'GET'
  });
}