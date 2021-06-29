import { request } from '@/utils/request';

export async function fetchAll(params) {
  return request(`/api/supermap/findAll`, {
    method: 'GET'
  });
}

export async function doSave(params) {
  return request(`/api/supermap/save`, {
    method: 'POST',
    data: params.data
  });
}

export async function clear(params) {
  return request(`/api/supermap/clear`, {
    method: 'GET'
  });
}

export async function doDelete(params) {
  return request(`/api/supermap/delete/${params.id}`, {
    method: 'GET'
  });
}

export async function fetchSearch(params) {
  return request(`/api/supermap/find/${params.name}`, {
    method: 'GET'
  });
}

export async function fetchSearchType(params) {
  return request(`/api/supermap/findByType/${params.type}`, {
    method: 'GET'
  });
}
