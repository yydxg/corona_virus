import { fetchTrainByCondition, fetchFlightByCondition} from './service';

export default {
  namespace: 'Cesium_Travel',

  state: {
    
  },

  effects: {
    *findFlights({ payload }, { call, put, select ,take}) {
      let {success,data} = yield call(fetchFlightByCondition, {
        ...payload
      });
      return {success:success,data:data}
    },
    *findTrains({ payload }, { call, put, select ,take}) {
      let {success,data} = yield call(fetchTrainByCondition, {
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
