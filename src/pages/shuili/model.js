import { fetchAll,deleteById,update,save,fetchByName} from './service';

export default {
  namespace: 'Shuili',

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
    *getAllImages({ payload,callback  }, { call, put, select ,take}) {
      let {success,data} = yield call(fetchAll);
      if(success){
        yield put({
          type:'init_images',
          payload:data
        })
      }
      if (callback) callback({success,data});
    },
    *deleteImage({ payload,callback  }, { call, put, select ,take}) {
      let response = yield call(deleteById,payload);
      return response
    },
    *findByName({ payload,callback  }, { call, put, select ,take}) {
      let {success,data} = yield call(fetchByName,payload);
      if(success){
        yield put({
          type:'init_images',
          payload:data
        })
      }
      // if (callback) callback({success,data});
      return {success,data}
    },
  },

  reducers: {
    init_images(state, action) {
      return {
        ...state,
        datas: action.payload
      };
    },
  }
};
