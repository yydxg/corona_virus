/* global mars3d Cesium coordtransform AMap $*/
import React, { Component } from 'react';
import {
  Divider, Checkbox, Button, Row, Col, Tooltip, Modal, Select, Table, Tag, Card, Form,
  Input, Icon, Radio, Collapse, Slider, Carousel, Menu, InputNumber, Message
} from 'antd'
import styles from './style.less'
import echarts from 'echarts'
import Item from 'antd/lib/list/Item';
import { connect } from 'dva';
import { router } from 'umi';

const { SubMenu } = Menu;
const { Panel } = Collapse;
const { Option, OptGroup } = Select;

const defaultMarker = require('./file/poi-marker-default.png')
let driving = null;

class Gaode_search extends Component {
  constructor(props) {
    super(props)
    this.state = {
      zhh_point: 'zhh_point',
      fgw: null,
      mouseTool: null,
      addVisible: false,
      map: null,
      center: new AMap.LngLat(113.5, 34.35),
      showTable: true,
      poiPoints: [],
      radioValue: 1,
      searchType: 'All',
      showChart: true,
      myChart: null,

      collapsed: false,
      inputVal: '',
      inputBuffer: 1000,
      closeBuffer: true,
      currentMarker: null,
      currentPoint: null,
      placeSearch: null,
      prePeople: null,
      nextPeople: null,

      defaultLayer: AMap.createDefaultLayer(),
      weiPianLayer: new AMap.TileLayer.Satellite(),
      roadNetLayer: new AMap.TileLayer.RoadNet(),
      trafficLayer: new AMap.TileLayer.Traffic({
        zIndex: 10
      })
    }
  }

  componentDidMount() {
    const { history } = this.props
    const { center, defaultLayer, trafficLayer, roadNetLayer, weiPianLayer } = this.state
    const login = this.props.Login;
   
    setTimeout(() => {
      var map = new AMap.Map(this.mapDiv, {
        zoom: 10,
        // center
      })

      map.addLayer(defaultLayer)
      map.addLayer(trafficLayer)
      map.addLayer(weiPianLayer)
      map.addLayer(roadNetLayer)
      trafficLayer.hide()
      weiPianLayer.hide()
      roadNetLayer.hide()

      this.bindMarkerEvent(map);
      this.bindMarkerAdd(map);

      this.setState({
        map,
      })
    }, 600)
  }

  componentWillUnmount() {
  }

  bindMarkerAdd = (map) => {
    AMap.plugin(["AMap.MouseTool"], () => {
      var mouseTool2 = new AMap.MouseTool(map);

      //监听draw事件可获取画好的覆盖物
      this.setState({
        mouseTool: mouseTool2
      })
      mouseTool2.on('draw', (e) => {
        const { fgw } = this.state
        console.log(e)
        fgw && map.remove(fgw)
        this.setState({
          fgw: e.obj,
          addVisible: true
        })
      })
    })
  }

  bindMarkerEvent = (map) => {
    //创建右键菜单
    var contextMenu = new AMap.ContextMenu();
    //右键添加Marker标记
    var contextMenuPositon
    contextMenu.addItem("添加起点标记", extend => {
      const { prePeople } = this.state
      // 创建一个 Icon
      var startIcon = new AMap.Icon({
        // 图标尺寸
        size: new AMap.Size(25, 34),
        // 图标的取图地址
        image: '//a.amap.com/jsapi_demos/static/demo-center/icons/dir-marker.png',
        // 图标所用图片大小
        imageSize: new AMap.Size(135, 40),
        // 图标取图偏移量
        imageOffset: new AMap.Pixel(-9, -3)
      });
      // 将 icon 传入 marker
      prePeople && prePeople.remove()
      var marker = new AMap.Marker({
        map: map,
        icon: startIcon,
        offset: new AMap.Pixel(-13, -30),
        position: contextMenuPositon //基点位置
      });
      this.setState({
        prePeople: marker
      })
    }, 3);
    contextMenu.addItem("添加终点标记", extend => {
      const { nextPeople } = this.state
      // 创建一个 Icon
      var endIcon = new AMap.Icon({
        size: new AMap.Size(25, 34),
        image: '//a.amap.com/jsapi_demos/static/demo-center/icons/dir-marker.png',
        imageSize: new AMap.Size(135, 40),
        imageOffset: new AMap.Pixel(-95, -3)
      });
      // 将 icon 传入 marker
      nextPeople && nextPeople.remove()
      var marker = new AMap.Marker({
        map: map,
        icon: endIcon,
        offset: new AMap.Pixel(-13, -30),
        position: contextMenuPositon //基点位置
      });
      this.setState({
        nextPeople: marker
      })
    }, 3);
    //地图绑定鼠标右击事件——弹出右键菜单
    map.on('rightclick', function (e) {
      contextMenu.open(map, e.lnglat);
      contextMenuPositon = e.lnglat;
    });

  }

  _getByName = (name) => {
    const { dispatch } = this.props;
    return new Promise((resolve, reject) => {
      dispatch({
        type: 'supermap_gd/doSearch',
        payload: {
          name
        }
      }).then(res => {
        resolve(res)
      })
    })
  }

  handleClick = (e) => {
    const { map, prePeople, nextPeople, poiPoints, currentMarker, placeSearch } = this.state
    switch (e.key) {
      case "1"://超图路网
        driving && driving.clear()
        this.setState({
          showTable: true,
          closeBuffer: true,
        })
        break;
      case "2":
        driving && driving.clear()
        break;
      case "7"://时间路线规划
        //构造路线导航类
        if (prePeople === null || nextPeople === null) {
          Modal.error({
            content: '请选择起始，终止位置'
          })
          return;
        }
        placeSearch && placeSearch.clear()
        driving && driving.clear()

        map.plugin('AMap.Driving', function () {
          driving = new AMap.Driving({
            policy: AMap.DrivingPolicy.LEAST_TIME,
            map: map,
            panel: "panel1"
          });
          var path = [], areas = [];
          let start = prePeople.getPosition()
          let end = nextPeople.getPosition()
          poiPoints.forEach(item => {
            if (item.type === 'zhh_point' || item.type === 'yj_point') {
              let lnglat = item.lnglats.split(" ")[0]
              let lng = parseFloat(lnglat.split(",")[0])
              let lat = parseFloat(lnglat.split(",")[1])
              path.push(new AMap.LngLat(lng, lat))
            }
            if (item.type === 'zhalj_point') {
              let area = []
              let lnglats = item.lnglats.split(" ")
              lnglats.forEach(element => {
                let lng = parseFloat(element.split(",")[0]);
                let lat = parseFloat(element.split(",")[1])
                area.push([lng, lat])
              });
              area.pop()
              areas.push(area)
            }
          })
          driving.setAvoidPolygons(areas)
          // 根据起终点经纬度规划驾车导航路线
          driving.search(new AMap.LngLat(start.lng, start.lat), new AMap.LngLat(end.lng, end.lat), { waypoints: path }, function (status, result) {
            // result 即是对应的驾车导航信息，相关数据结构文档请参考  https://lbs.amap.com/api/javascript-api/reference/route-search#m_DrivingResult
            if (status === 'complete') {
              console.log('绘制驾车路线完成')
            } else {
              console.error('获取驾车数据失败：' + result)
            }
          });
        })
        break;
      case '8':
        if (prePeople === null || nextPeople === null) {
          Modal.error({
            content: '请选择起始，终止位置'
          })
          return;
        }
        placeSearch && placeSearch.clear()
        driving && driving.clear()

        map.plugin('AMap.Driving', function () {
          driving = new AMap.Driving({
            policy: AMap.DrivingPolicy.LEAST_DISTANCE,
            map: map,
            panel: "panel1"
          });
          var path = [], areas = [];
          let start = prePeople.getPosition()
          let end = nextPeople.getPosition()
          poiPoints.forEach(item => {
            if (item.type === 'zhh_point' || item.type === 'yj_point') {
              let lnglat = item.lnglats.split(" ")[0]
              let lng = parseFloat(lnglat.split(",")[0])
              let lat = parseFloat(lnglat.split(",")[1])
              path.push(new AMap.LngLat(lng, lat))
            }
            if (item.type === 'zhalj_point') {
              let area = []
              let lnglats = item.lnglats.split(" ")
              lnglats.forEach(element => {
                let lng = parseFloat(element.split(",")[0]);
                let lat = parseFloat(element.split(",")[1])
                area.push([lng, lat])
              });
              area.pop()
              areas.push(area)
            }
          })
          driving.setAvoidPolygons(areas)
          // 根据起终点经纬度规划驾车导航路线
          driving.search(new AMap.LngLat(start.lng, start.lat), new AMap.LngLat(end.lng, end.lat), { waypoints: path }, function (status, result) {
            // result 即是对应的驾车导航信息，相关数据结构文档请参考  https://lbs.amap.com/api/javascript-api/reference/route-search#m_DrivingResult
            if (status === 'complete') {
              console.log('绘制驾车路线完成')
            } else {
              console.error('获取驾车数据失败：' + result)
            }
          });
        })
        break;
    }
  }

  onChangeBuffer = (value) => {
    this.setState({
      inputBuffer: value
    })
  }

  searchBuffer = () => {
    const {fgw} = this.state
    var center = fgw.getPosition()
    const { map, inputBuffer, placeSearch } = this.state
    console.log(inputBuffer)
    AMap.plugin(["AMap.PlaceSearch"], () => {
      //构造地点查询类
      driving && driving.clear()
      placeSearch && placeSearch.clear()
      var placeSearch2 = new AMap.PlaceSearch({
        type: '餐饮服务|酒店服务', // 兴趣点类别
        pageSize: 5, // 单页显示结果条数
        pageIndex: 1, // 页码
        // city: "010", // 兴趣点城市
        citylimit: true,  //是否强制限制在设置的城市内搜索
        map: map, // 展现结果的地图实例
        panel: "panel", // 结果列表将在此容器中进行展示。
        autoFitView: true // 是否自动调整地图视野使绘制的 Marker点都处于视口的可见范围
      });

      var cpoint = center; //中心点坐标
      placeSearch2.searchNearBy('', cpoint, inputBuffer, (status, result) => {
        console.log(result)

        this.setState({
          placeSearch: placeSearch2
        })
      });
    });
  }


  //-----------------------点
  addZhh = () => {
    this.draw("marker")
  }
  closeDraw = () => {
    const { map, fgw, mouseTool } = this.state
    mouseTool.close(true)
  }
  draw = (type) => {
    const { map, fgw, mouseTool } = this.state
    switch (type) {
      case 'marker': {
        mouseTool.marker({
          //同Marker的Option设置
        });
        break;
      }
      case 'polygon': {
        mouseTool.polygon({
          fillColor: '#00b0ff',
          strokeColor: '#80d8ff'
        });
        break;
      }
    }
  }

  showModal = () => {
    this.setState({ addVisible: true });
  };

  handleCancel = () => {
    this.setState({ addVisible: false });
  };

  //添加marker
  addMarker = (name, type, position) => {
    const { map } = this.state
    // var random = Math.random()
    var marker = new AMap.Marker({
      title: name,
      size: new AMap.Size(40, 50),
      icon: defaultMarker,
      position
      // offset: new AMap.Pixel(-13, -30)
    });
    marker.setMap(map);
    marker.on('click', () => {
      this.setState({
        closeBuffer: false,
        currentPoint: marker.getPosition(),
        currentMarker: marker
      })
    })
  }

  addPolygon = (name, data) => {
    const { map, } = this.state
    let polygon = new AMap.Polygon({
      extData: name,
      path: data,
      fillColor: 'rgba(205, 68, 230, 0.85)',
      strokeOpacity: 1,
      fillOpacity: 0.5,
      strokeColor: '#2b8cbe',
      strokeWeight: 1,
      strokeStyle: 'dashed',
      strokeDasharray: [5, 5],
    });
    polygon.on('mouseover', () => {
      polygon.setOptions({
        fillOpacity: 0.7,
        fillColor: '#7bccc4'
      })
    })
    polygon.on('mouseout', () => {
      polygon.setOptions({
        fillOpacity: 0.5,
        fillColor: 'rgba(205, 68, 230, 0.85)'
      })
    })
    map.add(polygon);
  }

  saveFormRef = formRef => {
    this.formRef = formRef;
  };

  locatePoi = id => {
    const { map, poiPoints } = this.state
    console.log(id)
    let item = poiPoints.filter(item => {
      return item.id == id
    })
    console.log(item)
    let lnglat = item[0].lnglats.split(" ")[0]
    let lng = parseFloat(lnglat.split(",")[0])
    let lat = parseFloat(lnglat.split(",")[1])
    map.setZoomAndCenter(16, [lng, lat], false, 5)
  }



  searchBuffer2 = id => {
    const { map, poiPoints } = this.state
    console.log(id)
    let item = poiPoints.filter(item => {
      return item.id == id
    })
    console.log(item)
    let lnglat = item[0].lnglats.split(" ")[0]
    let lng = parseFloat(lnglat.split(",")[0])
    let lat = parseFloat(lnglat.split(",")[1])

    Modal.confirm({
      content: <InputNumber min={100} max={10000} defaultValue={1000} onChange={this.onChangeBuffer} style={{ marginLeft: 25 }} />,
      onOk: () => {
        this.searchBuffer([lng, lat])
      },
      onCancel() {
        console.log('Cancel');
      },
    });

  }

  onChangeRadio = e => {
    console.log('radio checked', e.target.value);
    const { map, defaultLayer, weiPianLayer, trafficLayer, roadNetLayer } = this.state
    defaultLayer.hide()
    weiPianLayer.hide()
    trafficLayer.hide()
    roadNetLayer.hide()
    switch (e.target.value) {
      case 1:
        defaultLayer.show()
        break;
      case 2:
        weiPianLayer.show()
        break;
      case 3:
        weiPianLayer.show()
        roadNetLayer.show()
        break;
      case 4:
        trafficLayer.show()
        break;
    }

    this.setState({
      radioValue: e.target.value,
    });
  };
  handleTypeChange = value => {
    this.setState({
      searchType: value,
    })
  }

  render() {
    const { showTable, closeBuffer, poiPoints } = this.state
    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '30px',
    };
    return (
      <div>
        <div id="panel" style={{ position: 'absolute', right: 20, top: 30, zIndex: 10, height: 500, overflowY: 'auto' }}></div>
        <div id="panel1" style={{ position: 'absolute', right: 20, top: 30, zIndex: 10, height: 500, overflowY: 'auto' }}></div>
        {showTable && <Collapse defaultActiveKey={['1']} style={{ position: 'absolute', zIndex: 999, width: '80%', left: 0, right: 0, bottom: 0, backgroundColor: '#2196F3', color: '#fff' }}>
          <Panel header="控制面板" key="1">
            <Row>
              <Col span={2}>
                <Button type="primary" onClick={this.addZhh}><Icon type="plus" />添加位置点</Button>
              </Col>
              <Col offset={2} span={2}>
                {/* <Button type="danger" shape="circle" onClick={this.closeDraw}><Icon type="close" />清除</Button> */}
              </Col>
              <Col offset={2} span={10}>
                <Form layout={"inline"}>
                  <Form.Item label="类型  ">
                    <InputNumber min={100} max={10000} defaultValue={1000} onChange={this.onChangeBuffer} style={{ marginLeft: 25 }} /> 米
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" onClick={this.searchBuffer}><Icon type="search" />搜索</Button>
                  </Form.Item>
                </Form>
              </Col>
            </Row>
          </Panel>
        </Collapse>}

        <Card style={{ position: 'absolute', right: 0, bottom: 10, zIndex: 2147483647, width: 140 }}>
          <Radio.Group onChange={this.onChangeRadio} value={this.state.radioValue}>
            <Radio style={radioStyle} value={1}>
              电子地图
            </Radio>
            <Radio style={radioStyle} value={2}>
              卫星图
            </Radio>
            <Radio style={radioStyle} value={4}>
              实时路况
            </Radio>
          </Radio.Group>
        </Card>
        <div id="container" style={{ width: '100%', height: '100%', paddingTop: '100px', position: 'absolute', left: 0 }} ref={(mapDiv) => { this.mapDiv = mapDiv }}></div>
      </div>
    )
  }
}


const CollectionCreateForm = Form.create({ name: 'dynamic_rule' })(
  // eslint-disable-next-line
  class extends React.Component {
    render() {
      const { visible, onCancel, onCreate, form, type } = this.props;
      console.log(type)
      const { getFieldDecorator } = form;
      return (
        <Modal
          visible={visible}
          title="添加"
          okText="add"
          onCancel={onCancel}
          onOk={onCreate}
        >
          <Form layout="vertical">
            <Form.Item label="名称">
              {getFieldDecorator('name', {
                rules: [{ required: true, message: 'please enter name !' }],
              })(<Input />)}
            </Form.Item>
            {type === 'zhalj_point' ? '' : <Form.Item label="物资">
              {getFieldDecorator('resource')(<Input />)}
            </Form.Item>}
            <Form.Item label="备注">
              {getFieldDecorator('content')(<Input type="textarea" />)}
            </Form.Item>
          </Form>
        </Modal>
      );
    }
  },
);

const WrappedDynamicRule2 = Form.create({ name: 'dynamic_rule' })(Gaode_search);
export default WrappedDynamicRule2