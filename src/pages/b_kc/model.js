import {fetchKcSearch} from './service'

export default {
  namespace: 'B_kc',
  state: {
    
  },

  effects: {
    *doSearch({ payload,callback  }, { call, put, select ,take}) {
      let response = yield call(fetchKcSearch,payload);
      return response
    },
  },

  reducers: {
  }
};
