import {fetchSearch,fetchSearch2} from './service'

export default {
  namespace: 'D_SEARCH',
  state: {
    
  },

  effects: {
    *doSearch({ payload,callback  }, { call, put, select ,take}) {
      let response = yield call(fetchSearch,payload);
      return response
    },
    *doSearch2({ payload,callback  }, { call, put, select ,take}) {
      let response = yield call(fetchSearch2,payload);
      return response
    },
  },

  reducers: {
  }
};
