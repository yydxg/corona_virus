import {fakeTuiJian} from './service'

const Model = {
  namespace: 'TUI',

  state: {
    data: [],
  },
  effects: {
    *tuijian({ payload ,callback}, { call, put }) {
      let response = yield call(fakeTuiJian, {
        ...payload
      });
      return response
    },
  },
  reducers: {
  }
};

export default Model