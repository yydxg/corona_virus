import { fetchNodes,  } from './service';

export default {
  namespace: 'Home',

  state: {
    id:0,
    newData: [],
    data : [],
    expandedRows: [],
    // 通过 rowSelection 对象表明需要行选择
    rowSelection : {
      onChange(selectedRowKeys, selectedRows) {
        // console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      },
      onSelect(record, selected, selectedRows) {
        // console.log(record, selected, selectedRows);
      },
      onSelectAll(selected, selectedRows, changeRows) {
        // console.log(selected, selectedRows, changeRows);
      }
    },
    rowExpand:{
      onExpandedRowsChange(expandedRows){
        console.log(expandedRows)
      }
    }
  },

  effects: {
    *init(_, { put, all }) {
      yield all([
        put({
          type: 'initNodes',
          payload: {
            id: 101738,
          },
        }),
      ])
    },
    *initNodes({ payload }, { call, put }) {
      let { data , success } = yield call(fetchNodes, {
        ...payload
      });
      if (success) {
        yield put({
          type: 'init_Nodes',
          payload: {
            data,
          }
        })
      }
    },
    *getNodes({ payload }, { call, put, select ,take}) {
      let { data , success } = yield call(fetchNodes, {
        ...payload
      });
      if (success) {
        console.log(data)
        const source_data = yield select(state=>state.Home.data)
        console.log(source_data)
        const pp = yield put({
          type: 'getAllData',
          payload: {
            id:payload.id,
            old_data:source_data,
            data:data,
          }
        })
        yield take('getAllData/@@end')
        yield put({
          type: 'setNodes',
          payload: {
            id:payload.id,
            data:source_data,
          }
        })
      }
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
  },

  reducers: {
    init_Nodes(state, action) {
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
    },
  }
};
