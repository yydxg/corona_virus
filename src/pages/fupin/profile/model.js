import { fetchProfile,fetchAll,saveMovie,fetchByType,deleteProfile} from './service';

export default {
  namespace: 'Pro',

  state: {
    username:'',
    role:'',
    movies:[],
  },

  effects: {
    /* *login({ payload,callback  }, { call, put, select ,take}) {
      let response = yield call(fetchLogin, payload);
      if(response.success && response.data){
        yield put({
          type:'initName',
          payload:response.data
        })
      }
      return response
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
    }, */

    *getProfile({ payload,callback  }, { call, put, select ,take}) {
      let response = yield call(fetchProfile, payload);
      return response
    },

    *save({ payload,callback  }, { call, put, select ,take}) {
      let response = yield call(saveMovie,payload);
      return response
    },
    *getAll({ payload,callback  }, { call, put, select ,take}) {
      let {success,data} = yield call(fetchAll,payload);
      if(success){
        console.log(data)
        /* let newData = data.map((v,index)=>{
          return {...v,id:index}
        }) */
        yield put({
          type:'init_movies',
          payload:data
        })
      }
      if (callback) callback({success,data});
    },
    *deletePro({ payload,callback  }, { call, put, select ,take}) {
      let response = yield call(deleteProfile,payload);
      return response
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
  },

  reducers: {
    /* initName(state, action) {
      return {
        ...state,
        username: action.payload.username,
        role:action.payload.role
      };
    },
    deleteName(state,action){
      return {
        ...state,
        username: action.payload
      };
    } */
    init_movies(state, action) {
      return {
        ...state,
        movies: action.payload
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
