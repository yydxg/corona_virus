import { fetchAllByModule,deleteById,save,update,
  fetchByV2,fetchByV4,fetchByV2AndV3,fetchByV2AndV5,fetchByModuleAndV5,fetchV7Like,fetchV2AndDate,fetchHasNot,fetchByModuleAndV1,
  fetchByType,fetchAllComments,saveComment,getAllByModuleAndV3
  ,isV1Unique,findModule1AndV1NotInModule2AndV2,findModule1AndV1InModule2AndV2,findByModuleAndV4GreaterThanZero,updateV4} from './service';
import { Result } from 'antd';

export default {
  namespace: 'Fish',

  state: {
    datas:[],
    comments:[],
  },

  effects: {
    *save({ payload,callback  }, { call, put, select ,take}) {
      let response = yield call(save,payload);
      return response
    },
    *update({ payload,callback  }, { call, put, select ,take}) {
      let response = yield call(update,payload);
      return response
    },
    *delete({ payload,callback  }, { call, put, select ,take}) {
      let response = yield call(deleteById,payload);
      return response
    },
    *getAllByModule({ payload,callback  }, { call, put, select ,take}) {
      let {success,data} = yield call(fetchAllByModule,payload);
      if(success){
        yield put({
          type:'init_datas',
          payload:data
        })
      }
      if (callback) callback({success,data});
    },
    *getAllByModule2({ payload,callback  }, { call, put, select ,take}) {
      let {success,data} = yield call(fetchAllByModule,payload);
      if (callback) callback({success,data});
    },
    *getAllByModule3({ payload,callback  }, { call, put, select ,take}) {
      let response = yield call(fetchAllByModule,payload);
      if (response && response.success){
        return response
      };
    },
    *getAllByModuleAndV3({ payload,callback  }, { call, put, select ,take}) {
      let response = yield call(getAllByModuleAndV3,payload);
      if (response && response.success){
        return response
      };
    },
    *findByV2({ payload,callback  }, { call, put, select ,take}) {
      let {success,data} = yield call(fetchByV2,payload);
      if(success){
        yield put({
          type:'init_datas',
          payload:data
        })
      }
      if (callback) callback({success,data});
    },
    *findByV4({ payload,callback  }, { call, put, select ,take}) {
      let response = yield call(fetchByV4,payload);
      if (response && response.success){
        return response
      };
    },
    *findByV2AndV3({ payload,callback  }, { call, put, select ,take}) {
      let {success,data} = yield call(fetchByV2AndV3,payload);
      if(success){
        yield put({
          type:'init_datas',
          payload:data
        })
      }
      if (callback) callback({success,data});
    },
    *findByV2AndV5({ payload,callback  }, { call, put, select ,take}) {
      let {success,data} = yield call(fetchByV2AndV5,payload);
      if(success){
        yield put({
          type:'init_datas',
          payload:data
        })
      }
      if (callback) callback({success,data});
    },
    *findByModuleAndV5({ payload,callback  }, { call, put, select ,take}) {
      let response = yield call(fetchByModuleAndV5,payload);
      if (response && response.success){
        return response
      };
    },
    *findV7Like({ payload,callback  }, { call, put, select ,take}) {
      let response = yield call(fetchV7Like,payload);
      if (response && response.success){
        return response
      };
    },
    *findByV2AndDate({ payload,callback  }, { call, put, select ,take}) {
      console.log(payload)
      let {success,data} = yield call(fetchV2AndDate,payload);
      if(success){
        yield put({
          type:'init_datas',
          payload:data
        })
      }
      if (callback) callback({success,data});
    },
    *getHasNot({ payload,callback  }, { call, put, select ,take}) {
      let response = yield call(fetchHasNot,payload);
      if (response && response.success){
        return response
      };
    },
    *getAllDakaByModuleAndV1({ payload,callback  }, { call, put, select ,take}) {
      let response = yield call(fetchByModuleAndV1,payload);
      if (response && response.success){
        return response
      };
    },
    *findByType({ payload,callback  }, { call, put, select ,take}) {
      let {success,data} = yield call(fetchByType,payload);
      if(success){
        yield put({
          type:'init_movies',
          payload:data
        })
      }
      if (callback) callback({success,data});
    },
    *getAllComments({ payload,callback  }, { call, put, select ,take}) {
      let {success,data} = yield call(fetchAllComments,payload);
      if(success){
        let newData = data.map((v,index)=>{
          return {...v,id:index}
        })
        yield put({
          type:'init_comments',
          payload:newData
        })
      }
      if (callback) callback({success,data});
    },
    *addComment({ payload,callback  }, { call, put, select ,take}) {
      let response = yield call(saveComment,payload);
      return response
    },
    *isV1Unique({ payload,callback  }, { call, put, select ,take}) {
      let response = yield call(isV1Unique,payload);
      return response
    },
    *findModule1AndV1NotInModule2AndV2({ payload, callback  }, { call, put, select ,take}) {
      let response = yield call(findModule1AndV1NotInModule2AndV2,payload);
      return response
    },
    *findModule1AndV1InModule2AndV2({ payload, callback  }, { call, put, select ,take}) {
      let response = yield call(findModule1AndV1InModule2AndV2,payload);
      return response
    },
    *findByModuleAndV4GreaterThanZero({ payload, callback  }, { call, put, select ,take}) {
      let response = yield call(findByModuleAndV4GreaterThanZero,payload);
      return response
    },
    *updateV4({ payload, callback  }, { call, put, select ,take}) {
      let response = yield call(updateV4,payload);
      return response
    },
  },

  reducers: {
    init_datas(state, action) {
      return {
        ...state,
        datas: action.payload
      };
    },
    init_comments(state, action) {
      return {
        ...state,
        comments: action.payload
      };
    },
  }
};
