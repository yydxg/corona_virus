import { viewBuilding, viewPoi, viewRoad } from './service';

export default {
  namespace: 'geodjango',

  state: {
    poiData:null,
    roadData:null,
    buildingData:null
  },

  effects: {
    *getAllData({ payload,callback }, { call, put, select ,take}) {
      yield put({type:'getPoiData'})
      yield put({type:'getRoadData'})
      yield put({type:'getBuildingData'})
      setTimeout(()=>{
        callback(); 
      },2000)
    },
    *getPoiData({ payload }, { call, put, select ,take}){
      let poiResult = yield call(viewPoi);
      const { result,code,data } = poiResult
      if(result === 'success' && code===200) {
        yield put({
          type:'init_pois',
          payload:data
        })
      }
    },
    *getRoadData({ payload }, { call, put, select ,take}){
      let roadResult = yield call(viewRoad);
      const { result,code,data } = roadResult
      if(result === 'success' && code===200) {
        yield put({
          type:'init_roads',
          payload:data
        })
      }
    },
    *getBuildingData({ payload }, { call, put, select ,take}){
      let buildingResult = yield call(viewBuilding);
      const { result,code,data } = buildingResult
      if(result === 'success' && code===200) {
        yield put({
          type:'init_buildings',
          payload:data
        })
      }
    }
  },

  reducers: {
    init_pois(state, action) {
      return {
        ...state,
        poiData: action.payload
      };
    },
    init_roads(state, action) {
      return {
        ...state,
        roadData: action.payload
      }
    },
    init_buildings(state, action) {
      return {
        ...state,
        buildingData: action.payload
      }
    },
  }
};
