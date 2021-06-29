import {fakeChartData,fakeJieba,fakeJiebaSearch,fakeLayer,fakeLike} from './service'

const Model = {
  namespace: 'FUWU',

  state: {
    data: [],
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
    *jieba({ payload ,callback}, { call, put }) {
      let response = yield call(fakeJieba, {
        ...payload
      });
      // if (callback) callback(response);
      return response
    },
    *jiebaSearch({ payload ,callback}, { call, put }) {
      let response = yield call(fakeJiebaSearch, {
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
    *fetchChart({ payload ,callback}, { call, put }) {
      let response = yield call(fakeChartData, {
        ...payload
      });
      yield put({
        type: 'save',
        payload: {
          data:response.data
        },
      });
      if (callback) callback(response);
    },
  },
  reducers: {
    save(state, { payload }) {
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