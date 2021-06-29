import {fakeChartData,initAll,commonSearch,fakeLayer,fakeLike} from './service'

const Model = {
  namespace: 'Country',

  state: {
    initData: [],
  },
  effects: {
    *init(_, { put }) {
     /*  yield put({
        type: 'fetchUserCurrent',
      });
      yield put({
        type: 'fetchProjectNotice',
      });
      yield put({
        type: 'fetchActivitiesList',
      }); */
      /* yield put({
        type: 'fetchChart',
        payload:'',
      }); */
    },
    *initAll({ payload ,callback}, { call, put }) {
      let response = yield call(initAll, {
        ...payload
      });
      return response
    },
    *commonSearch({ payload ,callback}, { call, put }) {
      let response = yield call(commonSearch, {
        ...payload
      });
      // if (callback) callback(response);
      return response
    },
    
    *getLayer({ payload ,callback}, { call, put }) {
      let response = yield call(fakeLayer, {
        ...payload
      });
      return response
    },
    *goLike({ payload ,callback}, { call, put }) {
      let response = yield call(fakeLike, {
        ...payload
      });
      return response
    },
    // *fetchChart({ payload ,callback}, { call, put }) {
    //   let response = yield call(fakeChartData, {
    //     ...payload
    //   });
      
    //   if (callback) callback(response);
    // },
  },
  reducers: {
    initAll(state, { payload }) {
      return { ...state, ...payload };
    },

    clear() {
      return {
        currentUser: undefined,
        projectNotice: [],
        activities: [],
        data: [],
      };
    },
  }
};

export default Model