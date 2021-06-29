/* global mars3d Cesium $*/
import React, { Component } from 'react';
import { Divider, Checkbox, Button,Row, Col,Tooltip,Modal,Select  } from 'antd'
import styles from './style.less'
import {draw,addPie,clearDraw } from './fun'
import echarts from 'echarts'
import Item from 'antd/lib/list/Item';

const { Option, OptGroup } = Select;

const china = require('../file/china.json')
const shi = require('../file/shi.json')
const shengJson = require('../file/sheng.json')

class Pie extends Component{

  constructor(props) {
    super(props)
    this.state = {
      input_value:'',
      
      visible: false,
      confirmLoading: false,

      records:null,
      shengData:[],

      error:null,

      showBoard:false,
      confirmedArea:'',
      confirmedTotal:0,
      curesTotal:0,
      deathsTotal:0,
    }
  }

  componentDidMount() {
    $.getJSON('https://mapbox-ncov.versalinks.net/api/v1/coronavirus/data/1583651100.json').then(
      response => this.setState({ records: response}),
      error => this.setState({ error }))
    $.getJSON('/data/sheng.json').then(
      response => this.setState({ shengData: response.data}),
    error => this.setState({ error }))
  }
  

  handleOk = () => {
    const { viewer }= this.props
    const {input_value,records,shengData} = this.state;
    clearDraw()
    if(input_value === 'china'){
      records.provinces.map((item,index) =>{
        let lonlat = shengData.filter((item1)=>{return item1.province === item.name})
        if(lonlat.length>0){
          let id = "sss"+Math.random()
          let data = [{
              name: "确诊",
              value: item.confirmedNum
          },{
              name: "治愈",
              value: item.curesNum
          },{
              name: "死亡",
              value: item.deathsNum
          }]
          addPie({id:id,lon:lonlat[0].lon,lat:lonlat[0].lat,name:item.name,data:data})
        }
      })
      this._loadGeoJson(china)
      this.setState({
        showBoard:true,
        confirmedArea:records.nationTotal.name,
        confirmedTotal:records.nationTotal.confirmedTotal,
        curesTotal:records.nationTotal.curesTotal,
        deathsTotal:records.nationTotal.deathsTotal,
      })
    }else{
      let singleProvince = records.provinces.filter((item)=>{return item.name === input_value})
      // console.log(singleProvince)
      let singleProvinceLonLat = shengData.filter((item)=>{return item.province === input_value})
      singleProvince[0].cities.map((item,index)=>{
        let lonlat = singleProvinceLonLat[0].shi.filter((item1)=>{return item1.name === item.name})
        if(lonlat.length>0){
          let id = "sss"+Math.random()
          let data = [{
              name: "确诊",
              value: item.confirmedNum
          },{
              name: "治愈",
              value: item.curesNum
          },{
              name: "死亡",
              value: item.deathsNum
          }]
          addPie({id:id,lon:lonlat[0].lon,lat:lonlat[0].lat,name:item.name,data:data})
        }
      })

      this.setState({
        showBoard:true,
        confirmedArea:singleProvince[0].name,
        confirmedTotal:singleProvince[0].confirmedNum,
        curesTotal:singleProvince[0].curesNum,
        deathsTotal:singleProvince[0].deathsNum,
      })
      viewer.camera.flyTo({
            destination : Cesium.Cartesian3.fromDegrees(singleProvinceLonLat[0].lon,singleProvinceLonLat[0].lat,25000),
        })
    }

    this.setState({
      confirmLoading: true,
    });
    setTimeout(() => {
      this.setState({
        confirmLoading: false,
      });
      this.props.parent.hideModal()
    }, 2000);
  };

  _loadGeoJson = (dataJson)=>{
    var dataPromise = Cesium.GeoJsonDataSource.load(dataJson,{
      clampToGround: true
    })
    dataPromise.then(function(dataSource) {
      viewer.dataSources.add(dataSource);
      var entities = dataSource.entities.values;
      var colorHash = {};
      for (var i = 0; i < entities.length; i++) {
          var entity = entities[i];
          var name = entity.name;  //geojson里面必须得有一个name属性，entity.name对应
          var color = colorHash[name]; //可以使两个同名要素使用同一种颜色。。。
          if (!color) {
              color = Cesium.Color.fromRandom({
                  alpha : 1.0
              });
              colorHash[name] = color;
          }
          entity.name = entity.properties.NAME._value;
          entity.polygon.material = color;
          entity.label={
            text:"aaaaaaaaaaa"
          }
          entity.polygon.outline = true;
          entity.polygon.fill = false
          entity.polygon.outlineColor = color;
          entity.polygon.outlineWidth = 10;
          // entity.polygon.extrudedHeight = Math.floor(Math.random()*40000+20000) //20000~60000的随机数，单位是米
          // viewer.zoomTo(promise);

          var pointsArray = entity.polygon.hierarchy.getValue(Cesium.JulianDate.now()).positions;
    　　　//获取entity的polygon的中心点
          var centerpoint = Cesium.BoundingSphere.fromPoints(pointsArray).center;
      }
      viewer.flyTo(dataSource);
    }).otherwise(function(error) {});
  }

  handleCancel = () => {
    this.props.parent.hideModal()
  };

  handleChange = (value)=> {
    console.log(`selected ${value}`);
    this.setState({
      input_value:value
    })
  }

  addAllPie = ()=>{
    let id = "sss"+Math.random()
    let data = [{
        name: "a",
        value: Math.round(Math.random() * 100000)
    },{
        name: "b",
        value: Math.round(Math.random() * 100000)
    },{
        name: "c",
        value: Math.round(Math.random() * 100000)
    }]
    addPie({id:id,data:data,lon:113,lat:25})

    id = "sss"+Math.random()
    data = [{
        name: "a",
        value: Math.round(Math.random() * 100000)
    },{
        name: "b",
        value: Math.round(Math.random() * 100000)
    },{
        name: "c",
        value: Math.round(Math.random() * 100000)
    }]
    addPie({id:id,data:data,lon:114,lat:26})
    this.state.viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(114, 23, 1000),
      duration: 1.0,
    });
  }

  render(){
    const {confirmLoading, ModalText,showBoard,
      confirmedArea,
      confirmedTotal,
      curesTotal,
      deathsTotal} = this.state
    const { visible }= this.props
    return(
      <div>
        { showBoard ===true && <div>
        <div className={styles.numberboard_boardTitle}><span>{confirmedArea}</span></div>
          <div className={styles.numberboard_board}>
            <div className={styles.numberboard_boardblock}>
              <p className = {styles.numberboard_titleConfirm}><span>确诊</span></p>
              <p className = {styles.numberboard_numberConfirm}>{confirmedTotal}</p>
            </div>
            <div className={styles.numberboard_boardblock}>
              <p className = {styles.numberboard_titleConfirm}><span>治愈</span></p>
              <p className = {styles.numberboard_numberConfirm}>{curesTotal}</p>
            </div>
            <div className={styles.numberboard_boardblock}>
              <p className = {styles.numberboard_titleConfirm}><span>死亡</span></p>
              <p className = {styles.numberboard_numberConfirm}>{deathsTotal}</p>
            </div>
          </div>
          </div>
        }
        <Modal
            title="分析区域"
            visible={visible}
            onOk={this.handleOk}
            confirmLoading={confirmLoading}
            onCancel={this.handleCancel}
          >
            请选择：
            <Select showSearch defaultValue="河南" style={{ width: 200 }} onChange={this.handleChange}>
              <Option value="china">全国</Option>
              <OptGroup label="省份">
                <Option value="湖北">湖北</Option>
                <Option value="河南">河南</Option>
                <Option value="广东">广东</Option>
                <Option value="湖南">湖南</Option>
              </OptGroup>
            </Select>,
          </Modal>
      </div>
    )
  }
}

export default Pie