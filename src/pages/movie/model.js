import { fetchAll,deleteMovie,saveMovie,fetchByType,fetchAllComments,saveComment} from './service';
import { Result } from 'antd';

export default {
  namespace: 'Movie',

  state: {
    movies:[],
    comments:[],
  },

  effects: {
    *save({ payload,callback  }, { call, put, select ,take}) {
      let response = yield call(saveMovie,payload);
      return response
    },
    *getAllMovies({ payload,callback  }, { call, put, select ,take}) {
      let {success,data} = yield call(fetchAll);
      if(success){
        let newData = data.map((v,index)=>{
          return {...v,id:index}
        })
        yield put({
          type:'init_movies',
          payload:newData
        })
      }
      if (callback) callback({success,data});
    },
    *deleteMovie({ payload,callback  }, { call, put, select ,take}) {
      let response = yield call(deleteMovie,payload);
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
  },

  reducers: {
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
