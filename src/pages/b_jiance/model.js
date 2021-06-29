import {fetchCheck} from './service'

export default {
  namespace: 'B_JIANCE',
  state: {
    
  },

  effects: {
    *doCheck({ payload,callback  }, { call, put, select ,take}) {
      let response = yield call(fetchCheck,payload);
      return response
    },
  },

  reducers: {
  }
};
