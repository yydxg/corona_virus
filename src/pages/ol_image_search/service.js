import { request } from '@/utils/request';

export async function fetchAll(params) {
  return request(`/api/imagesearch/findAll`, {
    method: 'GET'
  });
}

export async function deleteImage(params) {
  return request(`/api/imagesearch/delete/${params.id}`, {
    method: 'GET'
  });
}

export async function saveImage(params){
  return request(`/api/imagesearch/save`,{
    method: 'POST',
    data: params.data
  })
}

export async function fetchByBiaoqian(params){
  return request(`/api/imagesearch/findByBq/${params.biaoqian}/${params.name}/${params.dates}/${params.cloud}`,{
    method: 'GET',
  })
}