import { fetchPerson,fetchSuyuan, fetchTravel,fetchAllMoyus} from './service';

export default {
  namespace: 'Visualization',

  state: {
    
  },

  effects: {
    *getPerson({ payload }, { call, put, select ,take}) {
      let {success,data} = yield call(fetchPerson, {
        ...payload
      });
      return {success:success,data:data}
    },
    *getSuyuan({ payload }, { call, put, select ,take}) {
      let {success,data} = yield call(fetchSuyuan, {
        ...payload
      });
      return {success:success,data:data}
    },
    *getTravel({ payload }, { call, put, select ,take}) {
      let {success,data} = yield call(fetchTravel, {
        ...payload
      });
      return {success:success,data:data}
    },
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

    *getAllMoyus({ payload }, { call, put, select ,take}) {
      let {success,data} = yield call(fetchAllMoyus, {
        ...payload
      });
      return {success:success,data:data}
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
