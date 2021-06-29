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

export async function fakeJiebaSearch(params) {
  return request('/api/services/jiebaSearch',{ 
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
