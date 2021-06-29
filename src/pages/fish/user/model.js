import { fetchLogin,fetchRegister} from './service';

export default {
  namespace: 'F_Login',

  state: {
    tempdata:null,//临时,如用户user
    username:'',
    role:'',
  },

  effects: {
    *login({ payload,callback  }, { call, put, select ,take}) {
      let response = yield call(fetchLogin, payload);
      console.log(response)
      if(response.success && response.data){
        yield put({
          type:'initName',
          payload:response.data
        })
      }
      return response
    },
    *updateTempdata({ payload,callback  }, { call, put, select ,take}){
      yield put({
        type:'initName',
        payload:payload.data
      })
    },
    *exist({ payload,callback  }, { call, put, select ,take}) {
      yield put({
        type:'deleteName',
        payload:''
      })
    },
    *register({ payload,callback  }, { call, put, select ,take}) {
      let response = yield call(fetchRegister, payload);
      if(response.success && response.data){
        yield put({
          type:'initName',
          payload:response.data.username
        })
      }
      return response
    },
    
  },

  reducers: {
    initName(state, action) {
      return {
        ...state,
        tempdata:action.payload,
        username: action.payload.v2,
        role:action.payload.v5
      };
    },
    deleteName(state,action){
      return {
        ...state,
        tempdata:null,
        username: action.payload
      };
    }
  }
};
