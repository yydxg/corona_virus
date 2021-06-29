import { fetchTongjiArea} from './service';

export default {
  namespace: 'nongye',

  state: {
    
  },

  effects: {
    *getTongjiArea({ payload }, { call, put, select ,take}) {
      let result = yield call(fetchTongjiArea, {
        ...payload
      });
      return result
    },
  },

  reducers: {
    /* init_Nodes(state, action) {
      return {
        ...state,
        data: action.payload.data
      };
    },
    setNodes(state, action) {
      return {
        ...state,
        id:action.payload.id,
        data: action.payload.data
      }
    }, */
  }
};
