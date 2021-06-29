import { request } from '@/utils/request';

export async function fakeChartData(params) {
  return request('/api/services/getServerHostAndServiceAndLayerByUrl',{
    method: 'POST',
    data: params,
  });
}

export async function fakeJieba(params) {
  return request('/api/services/fetchJieba',{ 
    method: 'POST',
    data: params,
  });
}