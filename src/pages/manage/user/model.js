import { fetchAll,deleteUser, fetchTravel} from './service';

export default {
  namespace: 'User',

  state: {
    users:[]
  },

  effects: {
    *getAllUser({ payload,callback  }, { call, put, select ,take}) {
      let {success,data} = yield call(fetchAll);
      if(success){
        yield put({
          type:'init_users',
          payload:data
        })
      }
      if (callback) callback({success,data});
    },
    *deleteUser({ payload,callback  }, { call, put, select ,take}) {
      let response = yield call(deleteUser,payload);
      return response
    },
  },

  reducers: {
    init_users(state, action) {
      return {
        ...state,
        users: action.payload
      };
    },
  }
};
