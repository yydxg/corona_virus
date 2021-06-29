import { request } from '@/utils/request';

export async function fetchAllByModule(params) {
  return request(`/api/v1/common/findByModule/${params.data}`, {
    method: 'GET'
  });
}

export async function deleteById(params) {
  return request(`/api/v1/common/deleteById/${params.id}`, {
    method: 'GET'
  });
}

export async function save(params){
  return request(`/api/v1/common/save`,{
    method: 'POST',
    data: params.data
  })
}

export async function fetchHasNot(params){
  return request(`/api/v1/common/getHasNot`,{
    method: 'POST',
    data: params.data
  })
}

export async function update(params){
  return request(`/api/v1/common/update`,{
    method: 'POST',
    data: params.data
  })
}
export async function fetchByV2(params){
  return request(`/api/v1/common/findByV2/${params.module}/${params.v2}`,{
    method: 'GET',
  })
}
export async function fetchByV4(params){
  return request(`/api/v1/common/findByV4/${params.module}/${params.v4}`,{
    method: 'GET',
  })
}
export async function fetchByV2AndV3(params){
  return request(`/api/v1/common/findByV2AndV3/${params.module}/${params.v2}/${params.v3}`,{
    method: 'GET',
  })
}
export async function fetchByV2AndV5(params){
  return request(`/api/v1/common/findByV2AndV5/${params.module}/${params.v2}/${params.v5}`,{
    method: 'GET',
  })
}
export async function fetchByModuleAndV5(params){
  return request(`/api/v1/common/findByModuleAndV5/${params.module}/${params.v5}`,{
    method: 'GET',
  })
}
export async function fetchV7Like(params){
  return request(`/api/v1/common/findV7Like/${params.module}/${params.account}`,{
    method: 'GET',
  })
}
//日期搜索工作记录
export async function fetchV2AndDate(params){
  return request(`/api/v1/common/findV2AndDate/${params.module}/${params.v2}/${params.startDate}/${params.endDate}`,{
    method: 'GET',
  })
}
//查找所有打卡数据fetchAllDakaByModuleAndV1
export async function fetchByModuleAndV1(params){
  return request(`/api/v1/common/findByModuleAndV1/${params.module}/${params.v1}`,{
    method: 'GET',
  })
}


export async function fetchByType(params){
  console.log(params)
  return request(`/api/v1/common/find/${params.name}/${params.type}`,{
    method: 'GET',
  })
}

export async function isV1Unique(params){
  return request(`/api/v1/common/isV1Unique/${params.module}/${params.v1}`,{
    method: 'GET',
  })
}

export async function findModule1AndV1NotInModule2AndV2(params){
  return request(`/api/v1/common/findModule1AndV1NotInModule2AndV2/${params.module1}/${params.module2}`,{
    method: 'GET',
  })
}

export async function findModule1AndV1InModule2AndV2(params){
  return request(`/api/v1/common/findModule1AndV1InModule2AndV2/${params.module1}/${params.module2}`,{
    method: 'GET',
  })
}

export async function getAllByModuleAndV3(params){
  return request(`/api/v1/common/getAllByModuleAndV3/${params.module}/${params.v3}`,{
    method: 'GET',
  })
}


export async function findByModuleAndV4GreaterThanZero(params){
  return request(`/api/v1/common/findByModuleAndV4GreaterThanZero/${params.module}`,{
    method: 'GET',
  })
}

export async function updateV4(params){
  return request(`/api/v1/common/updateV4/${params.id}/${params.v4}`,{
    method: 'GET',
  })
}


export async function fetchAllComments(params) {
  return request(`/api/v1/common/comments/findAll/${params.movieName}`, {
    method: 'GET'
  });
}

export async function saveComment(params){
  return request(`/api/v1/common/comments/save/${params.movieName}`,{
    method: 'POST',
    data: params.data
  })
}

