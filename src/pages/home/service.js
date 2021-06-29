import { request } from '@/utils/request';

export async function fetchNodes(params) {
  return request('/api/fetchNodes', {
    method: 'POST',
    data: params
  });
}

export async function getApplicationList(params) {
  return request('/portal/web/gisApplication/listPage', {
    method: 'GET',
    data: params
  });
}
