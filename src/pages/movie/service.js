import { request } from '@/utils/request';

export async function fetchAll(params) {
  return request(`/api/movie/findAll`, {
    method: 'GET'
  });
}

export async function deleteMovie(params) {
  return request(`/api/movie/delete/${params.id}`, {
    method: 'GET'
  });
}

export async function saveMovie(params){
  return request(`/api/movie/save`,{
    method: 'POST',
    data: params.data
  })
}

export async function fetchByType(params){
  console.log(params)
  return request(`/api/movie/find/${params.name}/${params.type}`,{
    method: 'GET',
  })
}

export async function fetchAllComments(params) {
  return request(`/api/comments/findAll/${params.movieName}`, {
    method: 'GET'
  });
}

export async function saveComment(params){
  return request(`/api/comments/save/${params.movieName}`,{
    method: 'POST',
    data: params.data
  })
}