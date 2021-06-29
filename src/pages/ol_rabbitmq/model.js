import { deleteById,save,update, fetchAll, fetchByStationNum} from './service';

export default {
  namespace: 'Rabbit',

  state: {
    datas:[]
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
    
    *getAll({payload},{call,put,take}){
      let {success,data} = yield call(fetchAll,payload);
      if(success){
        yield put({
          type:'init_datas',
          payload:data
        })
      }
      if (callback) callback({success,data});
    },

    *findByStationNum({payload},{call,put,take}){
      let {success,data} = yield call(fetchByStationNum,payload);
      if(success){
        yield put({
          type:'init_datas',
          payload:data
        })
      }
      if (callback) callback({success,data});
    },
  },

  reducers: {
    /* init_Nodes(state, action) {
      return {
        ...state,
        data: action.payload.data
      };
    },
    setNodes(state, action) {
      return {
        ...state,
        id:action.payload.id,
        data: action.payload.data
      }
    }, */

    init_datas(state, action) {
      return {
        ...state,
        datas: action.payload
      };
    },

  }
};
