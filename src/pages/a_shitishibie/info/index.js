/* global mars3d Cesium coordtransform$*/
import React, { Component } from 'react';
import {
  Divider, Checkbox, Button, Row, Col, Tooltip, Modal, Select, Table, Tag, Card, Form,
  Input, Icon as MyIcon, Radio, Collapse, Slider, Carousel
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
import { OSM, XYZ} from 'ol/source';
import {LineString, Point, Polygon} from 'ol/geom';
import {defaults as defaultInteractions, Pointer as PointerInteraction} from 'ol/interaction';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import {TileJSON, Vector as VectorSource} from 'ol/source';
import {Fill, Icon, Stroke, Style} from 'ol/style';
import {toLonLat, fromLonLat} from 'ol/proj';
import {FullScreen} from 'ol/control';
import GeoJSON from 'ol/format/GeoJSON';

const { Panel } = Collapse;
const { Option, OptGroup } = Select;

const columns = [
  {
    title: '图层',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '说明',
    dataIndex: 'url',
    key: 'url',
  }
];

const data = [
  {
    key: '1',
    name: 'World_Hillshade_Dark',
    url: '这里是图层的一些说明',
  },
  {
    key: '2',
    name: 'World_Hillshade_Dark',
    url: '这里是图层的一些说明',
  },
  {
    key: '3',
    name: 'World_Hillshade_Dark',
    url: '这里是图层的一些说明',
  },
  {
    key: '4',
    name: 'World_Hillshade_Dark',
    url: '这里是图层的一些说明',
  },
  {
    key: '5',
    name: 'World_Hillshade_Dark',
    url: '这里是图层的一些说明',
  }
];


@connect(({ FUWU }) => ({
  FUWU
}))

class Fuwu extends Component {
  constructor(props) {
    super(props)
    this.state = {
      data: [],
      myChart:null,
      map:null,
      digitalLayer:new TileLayer({
        //source: new OSM()
        source: new XYZ({
          url: 'https://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}'
        }) 
      }),
      arcgisLayer:new TileLayer({
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
    this.initMap()
    const myChart = echarts.init(this.chartsDiv);
    this.setState({
      myChart,
    })
    
  }


  createGraph = (myChart) => {
    const option = this.getOption()
    myChart.setOption(option);
  }

  getOption = () => {
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
          data:  [
                  {
                      name: '站点1',
                      des: 'sss',
                      symbolSize: 100,
                      itemStyle: {
                          normal: {
                              color: 'red'
                          }
                      }
                  }, {
                      name: '服务1',
                      des: '汉东省公安厅厅长',
                      symbolSize: 80,
                      itemStyle: {
                        normal: {
                            color: '#000'
                        }
                    }
                  }, {
                      name: '图层1',
                      des: 'ssssssssssss\npppp:ppppppppp',
                      symbolSize: 50,
                      itemStyle: {
                          normal: {
                              color: 'blue'
                          }
                      }
                  },
              ],
          links:  [
                  {
                      source: '站点1',
                      target: '服务1',
                      name: 'HAS',
                      des: '站点->服务',
                  }, {
                    source: '服务1',
                    target: '图层1',
                    name: "HAS",
                    des: '服务->图层',
                    lineStyle: {
                        normal: {
                            type: 'dotted',
                            color: '#000'
                        }
                    }
                }]
        }
      ]
    };
  }

  initMap = () => {
    const {wuhanGeojson,arcgisLayer,imagesLayer,digitalLayer } = this.state
    digitalLayer.set('id','arcgisLayer')
    digitalLayer.setVisible(true)
    return new Promise(resolve => {
      var fullScreenControl = new FullScreen()
      var map = new Map({
        // interactions: defaultInteractions().extend([new Drag()]),
        view: new View({
          center: fromLonLat([114, 30.5]),
          zoom: 16
        }),
        layers: [
          digitalLayer,
        ],
        target: 'map'
      });
      map.addControl(fullScreenControl)
      this.setState({
        map
      })
    })
  };

  handleSubmit = e => {
    e.preventDefault();
    const { dispatch } = this.props
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        console.log(values)
        const { words } = values
        dispatch({
          type: 'FUWU/jieba',
          payload: {
            words,
          }
        }).then(res => {
          console.log(res)
        })
      }
    });
  };
  render() {
    const { myChart } = this.state

    myChart && this.createGraph(myChart)
    
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 20 },
    };
    const buttonItemLayout = {
      wrapperCol: { span: 2, offset: 4 },
    };
    return (
      <div className={styles.root}>
        <Card>
              <Row>
                <Col span={4} offset={20} style={{cursor:'point'}}>
                  <Button type="primary">复制图层地址</Button>
                </Col>
              </Row>
          <Table columns={columns} dataSource={data} />
        </Card>
        <Card style={{marginTop:10}}>
             <div id="map" style={{width:'100%', height:500}} ref={(mapDiv) => { this.mapDiv = mapDiv }}> </div>
        </Card>
        <Card style={{marginTop:10}}>
        <div style={{ width: '100%' }}>
            <div id="main" style={{ width: '100%', height: '500px' }} ref={(chartsDiv) => { this.chartsDiv = chartsDiv }} />
          </div>
        </Card>
      </div>

    )
  }
}

export default Fuwu = Form.create({ name: 'register' })(Fuwu);