import {fetchKcSearch} from './service'

export default {
  namespace: 'E_kc',
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
