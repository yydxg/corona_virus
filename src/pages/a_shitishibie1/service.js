import { request } from '@/utils/request';

export async function fakeChartData(params) {
  return request('/api/services/initServices',{
    method: 'POST',
    data: params,
  });
}