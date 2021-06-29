import { request } from '@/utils/request';

export async function fakeChartData(params) {
  return request('/api/services/getServerHostAndServiceAndLayerByUrl',{
    method: 'POST',
    data: params,
  });
}

export async function initAll(params) {
  return request('/api/country/initAll',{ 
    method: 'post',
    data: params,
  });
}

export async function commonSearch(params) {
  return request('/api/country/commonSearch',{ 
    method: 'POST',
    data: params,
  });
}

export async function fakeLayer(params) {
  return request('/api/services/fetchLayer',{ 
    method: 'POST',
    data: params,
  });
}

export async function fakeLike(params) {
  return request('/api/services/goLike',{ 
    method: 'POST',
    data: params,
  });
}
