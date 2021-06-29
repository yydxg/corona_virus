import { request } from '@/utils/request';

export async function fakeTuiJian(params) {
  return request('/api/services/tuiJian',{ 
    method: 'POST',
    data: params,
  });
}