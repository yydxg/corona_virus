import { fetchAll,deleteKuang,saveKuang} from './service';

export default {
  namespace: 'Kuang',

  state: {
    kuangs:[]
  },

  effects: {
    *save({ payload,callback  }, { call, put, select ,take}) {
      let response = yield call(saveKuang,payload);
      return response
    },
    *getAllKuangs({ payload,callback  }, { call, put, select ,take}) {
      let {success,data} = yield call(fetchAll);
      if(success){
        yield put({
          type:'init_Kuangs',
          payload:data
        })
      }
      if (callback) callback({success,data});
    },
    *deleteKuang({ payload,callback  }, { call, put, select ,take}) {
      let response = yield call(deleteKuang,payload);
      return response
    },
    *findBySemester({ payload,callback  }, { call, put, select ,take}) {
      let {success,data} = yield call(fetchBySemester,payload);
      if(success){
        yield put({
          type:'init_Kuangs',
          payload:data
        })
      }
      if (callback) callback({success,data});
    },
  },

  reducers: {
    init_Kuangs(state, action) {
      return {
        ...state,
        kuangs: action.payload
      };
    },
  }
};
