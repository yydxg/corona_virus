import {fetchSearch,fetchAll,doSave,doDelete,fetchSearchType} from './service'

export default {
  namespace: 'supermap_gd',

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

    *save({payload},{call,put,take}){
      let response = yield call(doSave,payload);
      return response
    },

    *doAll({payload},{call,put,take}){
      let response = yield call(fetchAll,payload);
      return response
    },
    *doSearchType({payload},{call,put,take}){
      let response = yield call(fetchSearchType,payload);
      return response
    },
    *doSearch({payload},{call,put,take}){
      let response = yield call(fetchSearch,payload);
      return response
    },
    *delete({payload},{call,put,take}){
      let response = yield call(doDelete,payload);
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
