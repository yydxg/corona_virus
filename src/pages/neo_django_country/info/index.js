/* global mars3d Cesium coordtransform$*/
import React, { Component } from 'react';
import {
  Divider, Checkbox, Button, Row, Col, Tooltip, Modal, Select, Table, Tag, Card, Form,
  Input, Icon as MyIcon, Radio, Collapse, Slider, Carousel,Rate ,Message,
} from 'antd'
import styles from './style.less'
import echarts from 'echarts'
import Item from 'antd/lib/list/Item';
import { connect } from 'dva';
import { router } from 'umi';

/* openlayers */
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import Feature from 'ol/Feature';
import { OSM, XYZ } from 'ol/source';
import { LineString, Point, Polygon } from 'ol/geom';
import { defaults as defaultInteractions, Pointer as PointerInteraction } from 'ol/interaction';
import { Tile as TileLayer, Vector as VectorLayer, Image as ImageLayer } from 'ol/layer';
import { TileJSON, Vector as VectorSource, ImageArcGISRest, TileArcGISRest } from 'ol/source';
import { Fill, Icon, Stroke, Style } from 'ol/style';
import { toLonLat, fromLonLat } from 'ol/proj';
import { FullScreen } from 'ol/control';
import GeoJSON from 'ol/format/GeoJSON';

const { Panel } = Collapse;
const { Option, OptGroup } = Select;
const desc = ['20', '40', '60', '80', '100'];

@connect(({ FUWU }) => ({
  FUWU
}))

class Fuwu extends Component {
  constructor(props) {
    super(props)
    this.state = {
      tableData: [],
      dataArr: [],
      linkArr: [],
      url: '',
      myChart: null,
      map: null,
      rateValue : 3,
      serviceName:'',
      currentUser:'张三',
      digitalLayer: new TileLayer({
        //source: new OSM()
        source: new XYZ({
          url: 'https://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}'
        })
      }),
      arcgisLayer: new TileLayer({
        source: new XYZ({
          //url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          url: 'http://cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}'
        })
      }),
    }
  }

  componentWillUnmount() {
  }

  componentDidMount() {
    // this.props.dispatch({
    //   type:'SHITI/init',
    // })

    this.initTable()
      .then(() => {
        return this.initMap(this.state.url)
      }).then(() => {
        const myChart = echarts.init(this.chartsDiv)
        myChart && this.createGraph(myChart)
        this.setState({
          myChart,
        })
      })
  }

  initTable = () => {
    const { name } = this.props.location.query
    const { dispatch } = this.props;

    this.setState({
      serviceName:name,
    })
    return new Promise((resolve, reject) => {
      dispatch({
        type: "FUWU/getLayer",
        payload: {
          name
        }
      }).then(res => {
        const { success, data } = res
        const dataArr = []; const linkArr = [];
        let n_arr = [], m_arr = []; //记录是否重复
        let link_arr = [];

        let tableData = [], url = '';
        if (success) {
          data.map((d, idx) => {
            url = d.n.url;
            tableData.push({
              key: idx,
              name: d.m.name,
              description: d.m.description,
            })


            if (n_arr.indexOf("n:" + d.n.name) < 0) {
              dataArr.push({
                name: "n:" + d.n.name,
                des: 'sss',
                symbolSize: 100,
                itemStyle: {
                  normal: {
                    color: '#B23AEE'
                  }
                }
              })
              n_arr.push("n:" + d.n.name)
            }
            if (m_arr.indexOf("m:" + d.m.name) < 0) {
              dataArr.push({
                name: "m:" + d.m.name,
                des: 'sss',
                symbolSize: 80,
                itemStyle: {
                  normal: {
                    color: 'gray'
                  }
                }
              })
              m_arr.push("m:" + d.m.name)
            }
            if (link_arr.indexOf('n:' + d.n.name + '->' + 'm:' + d.m.name) < 0) {
              linkArr.push({
                source: 'n:' + d.n.name,
                target: 'm:' + d.m.name,
                name: 'HAS',
                des: '服务->图层',
              })
              link_arr.push('n:' + d.n.name + '->' + 'm:' + d.m.name)
            }
          })
          this.setState({
            url,
            tableData,
            dataArr,
            linkArr,
          })
          resolve()
        }
      })
    })
  }

  createGraph = (myChart) => {
    const option = this.getOption()
    myChart.setOption(option);
  }

  getOption = () => {
    const {dataArr,linkArr} = this.state;
    return {
      title: { text: '查询结果' },
      tooltip: {
        formatter: function (x) {
          return x.data.des;
        }
      },
      series: [
        {
          type: 'graph',
          layout: 'force',
          symbolSize: 80,
          roam: true,
          edgeSymbol: ['circle', 'arrow'],
          edgeSymbolSize: [4, 10],
          edgeLabel: {
            normal: {
              textStyle: {
                fontSize: 20
              }
            }
          },
          force: {
            repulsion: 2500,
            edgeLength: [10, 50]
          },
          draggable: true,
          itemStyle: {
            normal: {
              color: '#4b565b'
            }
          },
          lineStyle: {
            normal: {
              width: 2,
              color: '#4b565b'

            }
          },
          edgeLabel: {
            normal: {
              show: true,
              formatter: function (x) {
                return x.data.name;
              }
            }
          },
          label: {
            normal: {
              show: true,
              textStyle: {
              }
            }
          },
          data: dataArr,
          links: linkArr
        }
      ]
    };
  }

  initMap = (url) => {
    console.log(url)
    // url = "http://118.31.43.251:6080/arcgis/rest/services/GHT2015/MapServer";
    url = "http://118.31.43.251:6080/arcgis/rest/services/land20002/MapServer";
    const { wuhanGeojson, arcgisLayer, imagesLayer, digitalLayer } = this.state
    digitalLayer.set('id', 'arcgisLayer')
    digitalLayer.setVisible(true)
    return new Promise(resolve => {
      var fullScreenControl = new FullScreen()
      /* var layers2 = new TileLayer({
             source: new TileArcGISRest({
                 ratio: 1,
                 params: {},
                 url: url,
                 projection: 'EPSG:3857'
             })
         }) */

      var layers2 = new ImageLayer({
        source: new ImageArcGISRest({
          ratio: 1,
          params: {},
          url: url,
          projection: 'EPSG:3857'
        })
      })
      var map = new Map({
        // interactions: defaultInteractions().extend([new Drag()]),
        view: new View({
          center: fromLonLat([114, 30.5]),
          zoom: 16
        }),
        layers: [
          digitalLayer, layers2,
        ],
        target: 'map'
      });
      map.addControl(fullScreenControl)
      this.setState({
        map
      })

      resolve()
    })
  };

  handleChange = rateValue => {
    this.setState({ 
      rateValue,
   });
  };

  handleUserChange = value =>{
    this.setState({
      currentUser:value
    })
  }
  
  rateService = () =>{
    const { currentUser, rateValue ,serviceName} = this.state
    const {dispatch} = this.props
    Modal.confirm({
      content:"当前用户是："+currentUser+",给出评分是："+rateValue*20+"分。请确认！",
      onOk:()=>{
        dispatch({
          type:'FUWU/goLike',
          payload:{
            u_name:currentUser,
            s_name:serviceName,
            r_value:rateValue*20
          }
        }).then(res=>{
          const {success , data} =res
          if(success){
            Message.info("评分成功！");
          }else{
            Message.info("评分失败！");
          }
        })
      }
    })
  }

  render() {
    const { myChart,rateValue } = this.state

    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 20 },
    };
    const buttonItemLayout = {
      wrapperCol: { span: 2, offset: 4 },
    };
    const columns = [
      {
        title: '图层',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '说明',
        dataIndex: 'description',
        key: 'description',
      }
    ];
    return (
      <div className={styles.root}>
        <Card>
          <Row>
            <Col span={4} offset={12} style={{ cursor: 'point' }}>
              切换用户：<Select defaultValue="张三" style={{ width: 120 }} onChange={this.handleUserChange}>
                <Option value="张三">张三</Option>
                <Option value="李四">李四</Option>
                <Option value="王五">王五</Option>
                <Option value="赵六">赵六</Option>
                <Option value="毛七">毛七</Option>
              </Select>
            </Col>
            <Col span={4} offset={0}>
            <Rate tooltips={desc} onChange={this.handleChange} value={rateValue} />
              {rateValue ? <span className="ant-rate-text">{desc[rateValue - 1]}分</span> : ''}
            </Col>
            <Col span={4} offset={0} style={{ cursor: 'point' }}>
              <Button type="primary" onClick={this.rateService}>给当前服务评分</Button>
            </Col>
          </Row>
          <Table columns={columns} dataSource={this.state.tableData} />
        </Card>
        <Card style={{ marginTop: 10 }}>
          <div id="map" style={{ width: '100%', height: 500 }} ref={(mapDiv) => { this.mapDiv = mapDiv }}> </div>
        </Card>
        <Card style={{ marginTop: 10 }}>
          <div style={{ width: '100%' }}>
            <div id="main" style={{ width: '100%', height: '500px' }} ref={(chartsDiv) => { this.chartsDiv = chartsDiv }} />
          </div>
        </Card>
      </div>

    )
  }
}

export default Fuwu = Form.create({ name: 'register' })(Fuwu);