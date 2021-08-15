import { fetchXb} from './service';

export default {
  namespace: 'Cesium_Huanghe',

  state: {
    
  },

  effects: {
    *getXb({ payload }, { call, put, select ,take}) {
      let {success,data} = yield call(fetchXb, {
        ...payload
      });
      return {success:success,data:data}
    },
  },

  reducers: {
  }
};
