import { fetchAll,deleteImage,saveImage,fetchByBiaoqian} from './service';

export default {
  namespace: 'Imagery',

  state: {
    images:[]
  },

  effects: {
    *save({ payload,callback  }, { call, put, select ,take}) {
      let response = yield call(saveImage,payload);
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
      let response = yield call(deleteImage,payload);
      return response
    },
    *findByBiaoqian({ payload,callback  }, { call, put, select ,take}) {
      let {success,data} = yield call(fetchByBiaoqian,payload);
      if(success){
        yield put({
          type:'init_images',
          payload:data
        })
      }
      if (callback) callback({success,data});
    },
  },

  reducers: {
    init_images(state, action) {
      return {
        ...state,
        images: action.payload
      };
    },
  }
};
