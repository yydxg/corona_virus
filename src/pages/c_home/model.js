import {fetchSearch} from './service'

export default {
  namespace: 'JDIAN',

  state: {
    
  },

  effects: {
    *getAllData({payload},{call,put,take}){
      const dataMap = (items) => {
        items.find((item) => {
          if (item.key === payload.id) {
            //找到当前要展开的节点
            item.children = payload.data
            return items
          }
          if (item.children && item.children.length > 0) {
            dataMap(item.children)
          }
        })
      }
      dataMap(payload.old_data)
    },
    *doSearch({payload},{call,put,take}){
      let response = yield call(fetchSearch,payload);
      return response
    }

  },

  reducers: {
    /* init_Nodes(state, action) {
      return {
        ...state,
        data: action.payload.data
      };
    },*/
  }
};
