import { request } from '@/utils/request';

export async function fetchTrainByCondition(params) {
  return request(`/api/train/findByCondition`, {
    method: 'POST',
    data:params.data
  });
}

export async function fetchFlightByCondition(params){
  return request(`/api/flight/findByCondition`,{
    method: 'POST',
    data:params.data
  })
}