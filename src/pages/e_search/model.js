import {fetchSearch} from './service'

export default {
  namespace: 'E_SEARCH',
  state: {
    
  },

  effects: {
    *doSearch({ payload,callback  }, { call, put, select ,take}) {
      let response = yield call(fetchSearch,payload);
      return response
    },
  },

  reducers: {
  }
};
