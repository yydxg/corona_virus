import { fetchAll,deleteStudent,saveStudent,fetchBySemester} from './service';

export default {
  namespace: 'Student',

  state: {
    students:[]
  },

  effects: {
    *save({ payload,callback  }, { call, put, select ,take}) {
      let response = yield call(saveStudent,payload);
      return response
    },
    *getAllStudents({ payload,callback  }, { call, put, select ,take}) {
      let {success,data} = yield call(fetchAll);
      if(success){
        yield put({
          type:'init_students',
          payload:data
        })
      }
      if (callback) callback({success,data});
    },
    *deleteStudent({ payload,callback  }, { call, put, select ,take}) {
      let response = yield call(deleteStudent,payload);
      return response
    },
    *findBySemester({ payload,callback  }, { call, put, select ,take}) {
      let {success,data} = yield call(fetchBySemester,payload);
      if(success){
        yield put({
          type:'init_students',
          payload:data
        })
      }
      if (callback) callback({success,data});
    },
  },

  reducers: {
    init_students(state, action) {
      return {
        ...state,
        students: action.payload
      };
    },
  }
};
