import {excuteSql} from './service'

export default {
  namespace: 'B_Import',
  state: {
    
  },

  effects: {
    *doExcute({ payload,callback  }, { call, put, select ,take}) {
      console.log(payload)
      let response = yield call(excuteSql,payload);
      return response
    },
  },

  reducers: {
  }
};
