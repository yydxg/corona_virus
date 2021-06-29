import { request } from '@/utils/request';

// export async function fetchLogin(params) {
//   return request(`/api/user/login/${params.username}/${params.password}`, {
//     method: 'GET'
//   });
// }
export async function fetchLogin(params) {
  return request(`/api/v1/common/findByV1AndV7`, {
    method: 'POST',
    data:params
  });
}
export async function fetchRegister(params) {
  return request(`/api/user/register`, {
    method: 'POST',
    data:params
  });
}
