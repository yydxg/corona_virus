import { request } from '@/utils/request';

export async function fetchAll(params) {
  return request(`/api/student/findAll`, {
    method: 'GET'
  });
}

export async function deleteStudent(params) {
  return request(`/api/student/delete/${params.id}`, {
    method: 'GET'
  });
}

export async function saveStudent(params){
  return request(`/api/student/save`,{
    method: 'POST',
    data: params.data
  })
}

export async function fetchBySemester(params){
  return request(`/api/student/findBySemester/${params.data}`,{
    method: 'GET',
  })
}