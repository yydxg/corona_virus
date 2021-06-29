import { request } from '@/utils/request';

export async function excuteSql(params) {
  return request(`/api/neo/javaCode/excute`, {
    method: 'POST',
    data: params.inputValue
  });
}
