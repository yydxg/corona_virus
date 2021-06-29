import {fetchAll} from './service'

export default {
  namespace: 'B_SEE',
  state: {
    
  },

  effects: {
    *doAll({ payload,callback  }, { call, put, select ,take}) {
      let response = yield call(fetchAll,payload);
      return response
    },
  },

  reducers: {
  }
};
