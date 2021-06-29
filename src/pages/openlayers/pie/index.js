/* global mars3d Cesium $*/
import React, { Component } from 'react';
import { Divider, Checkbox, Button,Row, Col,Tooltip,Modal,Select  } from 'antd'
import styles from './style.less'
import echarts from 'echarts'
import Item from 'antd/lib/list/Item';
import Overlay from 'ol/Overlay';
import {toLonLat, fromLonLat} from 'ol/proj';

const { Option, OptGroup } = Select;

const china = require('../file/china.json')
const shi = require('../file/shi.json')
const shiJson = require('../file/shi.json')

class Pie extends Component{

  constructor(props) {
    super(props)
    this.state = {
      input_value:'湖北',
      
      visible: false,
      confirmLoading: false,

      records:null,
      shiData:shiJson,

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
      response => {
        console.log(response)
        let records = response.provinces.filter((item)=> {return item.name === '湖北'})
        this.setState({ records: records[0]})
      },
      error => this.setState({ error }))
  }
  
  componentWillUnmount(){
    
  }

  handleOk = () => {
    const { map }= this.props
    const {input_value,records,shiData} = this.state;
    console.log(input_value)
    // clearDraw()
    if(input_value === '湖北'){
      records.cities.map((item,index) =>{
        let lonlat = shiData.data.filter((item1)=>{return item1.name === item.name})
        if(lonlat.length>0){
          var option =  {
            backgroundColor:'#ccc',
            title:{
              show:true,
              text:item.name
            },
            grid: {
              show :true,
              left: '20%',   //距离左边的距离
             },
            xAxis: {
                type: 'category',
                data: ['确诊', '治愈', '死亡']
            },
            yAxis: {
                type: 'value',
                show:true,
                axisLabel:{
                  padding:[20, 4, 5, 6],
                  formatter:function (value, index) {
                    return value / 1000 + 'k';
                }
                }
            },
            series: [{
                data: [item.confirmedNum,item.curesNum,item.deathsNum],
                type: 'bar',
                type: 'bar',
                barWidth: "70%",
                itemStyle: {
                    normal: {
                        //每根柱子颜色设置
                        color: function(params) {
                            let colorList = [
                                "rgba(251, 103, 103, 1)",
                                "rgba(40, 218, 111, 1)",
                                "rgba(148, 159, 165, 1)",
                            ];
                            return colorList[params.dataIndex];
                        }
                    }
                }
            }],
            tooltip:{
              show:true,
              formatter:function(params){
                  return params.data *1000
              }
            }
          };
          this.addColumnChart(lonlat[0].lon,lonlat[0].lat,option)
        }
      })

      this.setState({
        showBoard:true,
        confirmedArea:records.name,
        confirmedTotal:records.confirmedNum,
        curesTotal:records.curesNum,
        deathsTotal:records.deathsNum,
      })
    }else{
      let singleProvince = records.shi.filter((item)=>{return item.name === input_value})
      // console.log(singleProvince)
      let singleProvinceLonLat = shiData.filter((item)=>{return item.province === input_value})
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
          // addPie({id:id,lon:lonlat[0].lon,lat:lonlat[0].lat,name:item.name,data:data})
        }
      })

      this.setState({
        showBoard:true,
        confirmedArea:singleProvince[0].name,
        confirmedTotal:singleProvince[0].confirmedNum,
        curesTotal:singleProvince[0].curesNum,
        deathsTotal:singleProvince[0].deathsNum,
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
    // addPie({id:id,data:data,lon:113,lat:25})

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
    // addPie({id:id,data:data,lon:114,lat:26})
    this.state.viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(114, 23, 1000),
      duration: 1.0,
    });
  }

  guid =()=> {  //为了生成不一样的id，实现每个装柱状图的盒子的唯一性
    var d = new Date().getTime();
    var guid = 'xxxx-xxxx-xxxx-xxxx'.replace(
      /[xy]/g,
      function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
      });
    return guid;
  }
  
  addColumnChart = (lng,lat,option)=>{   //向点位添加柱状图的方法
    let {map,chart} = this.props
    console.log(chart)
    var html='';  
      var pt = fromLonLat([lng,lat]);
      var domid = "chart"+ this.guid();    //生成不同的id
      html+=`<div id='${domid}' style='width: 100px;height: 150px;
      margin-left: -18px;margin-bottom: -22px;'></div>`
      chart.innerHTML=html;
      // 创建树状图
      let canvasDom = document.createElement('canvas');
      var bodyFa = document.getElementById(domid)
      bodyFa .appendChild(canvasDom);
      canvasDom.width = 200;
      canvasDom.height = 250;
      var myChart = echarts.init(canvasDom);
      myChart.setOption(option);
    //将柱状图添加到指定点位上去
      var chart1 = new Overlay({
        id: domid,
        positioning: "bottom-center",
        element: document.getElementById(domid),
        offset: [0, 5],
        stopEvent: true  //overlay也支持滚珠放大缩小
      });
      map.addOverlay(chart1);
      chart1.setPosition(pt);
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
            <Select showSearch defaultValue="湖北" style={{ width: 200 }} onChange={this.handleChange}>
              <Option value="湖北">湖北</Option>
              <Option value="河南">河南</Option>
              <Option value="...">...</Option>
              {/* <OptGroup label="省份">
                <Option value="襄阳">襄阳</Option>
                <Option value="武汉">武汉</Option>
                <Option value="随州">随州</Option>
                <Option value="黄冈">黄冈</Option>
              </OptGroup> */}
            </Select>,
          </Modal>
      </div>
    )
  }
}

export default Pie