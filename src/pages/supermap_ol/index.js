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
const redMarker = require('./file/poi-marker-red.png')

let driving = null;

@connect(({ supermap_gd, Login }) => ({
  supermap_gd, Login
}))

class supermap_gd extends Component {
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
      myChart:null,

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
    /* if (login && login.username === '') {
      
    } else {
      history.push('/')
    } */
    setTimeout(() => {
      var map = new AMap.Map(this.mapDiv, {
        zoom: 10,
        center
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
      this.initTableAndMap();

      const myChart = echarts.init(this.chartdiv)
      this.setState({
        map,
        myChart
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

  toggleCollapsed = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  };
  onChangeBuffer = (value) => {
    this.setState({
      inputBuffer: value
    })
  }

  searchBuffer = (center) => {
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


  //-----------------------应急点管理
  addZhh = () => {
    this.draw("marker")
    this.setState({
      addType: 'zhh_point'
    })
  }
  addYj = () => {
    this.draw("marker")
    this.setState({
      addType: 'yj_point'
    })
  }
  addZhalj = () => {
    this.draw("polygon")
    this.setState({
      addType: 'zhalj_point'
    })
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
          //同Polygon的Option设置
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

  handleCreate = () => {
    const { addType, fgw } = this.state
    // console.log(addType,fgw)

    let lnglatsTemp = '';
    if (addType === 'zhalj_point') {
      var position = fgw.getPath()
      position.map((item, i) => {
        lnglatsTemp += item.lng + ',' + item.lat + ' '
      })
      // console.log(lnglatsTemp)
    } else {
      var position = fgw.getPosition()
      lnglatsTemp += position.lng;
      lnglatsTemp += ','
      lnglatsTemp += position.lat;
    }
    const { form } = this.formRef.props;
    const { dispatch } = this.props;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
      console.log('Received values of form: ', values);
      dispatch({
        type: 'supermap_gd/save',
        payload: {
          data: {
            ...values,
            type: addType,
            lnglats: lnglatsTemp
          }
        }
      }).then(r => {
        console.log(r);
        r.success && this.initTableAndMap()

        form.resetFields();
        this.setState({ addVisible: false });
      })
    });
  };

  //初始化表格和地图
  initTableAndMap = () => {
    const { map, searchType } = this.state

    // this.props.dispatch({
    //   type: 'supermap_gd/doAll'
    // })
    this.props.dispatch({
      type: 'supermap_gd/doSearchType',
      payload: {
        type: searchType
      }
    }).then(res => {
      const { success, data } = res
      console.log(res)
      map && map.clearMap()
      data.map((item, idx) => {
        if (item.type === 'zhh_point') {
          let lng = parseFloat(item.lnglats.split(",")[0]);
          let lat = parseFloat(item.lnglats.split(",")[1])
          this.addMarker(item.name, 'zhh_point', [lng, lat])
        } else if (item.type === 'yj_point') {
          let lng = parseFloat(item.lnglats.split(",")[0]);
          let lat = parseFloat(item.lnglats.split(",")[1])
          this.addMarker(item.name, 'yj_point', [lng, lat])
        } else if (item.type === 'zhalj_point') {
          let path = [];
          let lnglats = item.lnglats.split(" ")
          lnglats.forEach(element => {
            let lng = parseFloat(element.split(",")[0]);
            let lat = parseFloat(element.split(",")[1])
            path.push([lng, lat])
          });
          path.pop()
          this.addPolygon(item.name, path)
        }
      })
      success && this.setState({
        poiPoints: data
      })
    })
  }

  //添加marker
  addMarker = (name, type, position) => {
    const { map } = this.state
    // var random = Math.random()
    var marker = new AMap.Marker({
      title: name,
      // icon: "//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png",
      icon: type === "yj_point" ? redMarker : defaultMarker,
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
      this._getByName(marker.getTitle()).then(res => {
        const { data } = res;
        var infoWindow = new AMap.InfoWindow({
          offset: [10, -20],
          showShadow: true,
          content: `<h3><b>信息</b></h3>
                    <span>名称:</span><span>${data.name}</span></br>
                    <span>类型:</span><span>${data.type === 'yj_point' ? '应急点' : (data.type === 'zhh_point' ? '灾害点' : '障碍路径')}</span></br>
                    <span>物资:</span><span>${data.resource}</span></br>
                    <span>备注:</span><span>${data.content}</span></br>`//信息窗体的内容
        });
        infoWindow.open(map, marker.getPosition()); //信息窗体打开
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

  deletePoi = id => {
    this.props.dispatch({
      type: 'supermap_gd/delete',
      payload: {
        id
      }
    }).then(res => {
      const { success } = res
      success && this.initTableAndMap()
    })
  }

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

  findByType = () => {
    const { dispatch } = this.props
    const { searchType } = this.state
    this.initTableAndMap()
  }

  doChart = () => {
    const { showChart, poiPoints } = this.state
    console.log(poiPoints)
    let zhh_points = 0, yj_points = 0
    poiPoints.map((item, idx) => {
      if (item.type === 'zhh_point') {
        zhh_points += parseFloat(item.resource)
      }
      if (item.type === 'yj_point') {
        yj_points += parseFloat(item.resource)
      }
      if (item.type === 'zhalj_point') {

      }
    })
    /* if(showChart){
      this.setState({
        showChart:false
      })
    }else{ */
      
      
      var option = {
        series: [
          {
            name: '访问来源',
            type: 'pie',    // 设置图表类型为饼图
            radius: '55%',  // 饼图的半径，外半径为可视区尺寸（容器高宽中较小一项）的 55% 长度。
            data: [          // 数据数组，name 为数据项名称，value 为数据项值
              { value: zhh_points, name: '灾害点物资总量' },
              { value: yj_points, name: '应急点物资总量' },
            ],
            itemStyle: {
              normal: {
                  shadowBlur: 200,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }
      this.state.myChart.setOption(option);

      this.setState({
        showChart:true
      })
    // }
    

  }

  render() {
    const { showTable, showChart, closeBuffer, poiPoints } = this.state
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 8 },
    };
    const formTailLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 8, offset: 4 },
    };
    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '30px',
    };
    return (
      <div>
        <div id="panel" style={{ position: 'absolute', right: 20, top: 100, zIndex: 10, height: 500, overflowY: 'auto' }}></div>
        <div id="panel1" style={{ position: 'absolute', right: 20, top: 100, zIndex: 10, height: 500, overflowY: 'auto' }}></div>
        <div style={{ width: 256, position: 'absolute', top: 80, zIndex: 9999, left: 0 }}>
          <Button type="primary" onClick={this.toggleCollapsed} style={{ marginBottom: 16 }}>
            <Icon type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'} />
          </Button>
          <Menu
            defaultSelectedKeys={['1']}
            defaultOpenKeys={['sub1']}
            mode="inline"
            theme="dark"
            inlineCollapsed={this.state.collapsed}
            onClick={this.handleClick}
          >
            <Menu.Item key="1">
              <Icon type="pie-chart" />
              <span>超图路网</span>
            </Menu.Item>
            {/*  <SubMenu
              key="sub1"
              title={
                <span>
                  <Icon type="mail" />
                  <span>景点</span>
                </span>
              }
            >
              <Menu.Item key="2">
                <Icon type="desktop" />
                <span>景点</span>
              </Menu.Item>
              <InputNumber min={100} max={10000} defaultValue={1000} onChange={this.onChangeBuffer} style={{ marginLeft: 25 }} />米 {closeBuffer ? <Button type="primary" disabled>搜索周边餐饮</Button> : <Button type="primary" onClick={this.searchBuffer}>搜索周边餐饮</Button>}
            </SubMenu>
            <Menu.Item key="3">
              <Icon type="inbox" />
              <span>在线观光</span>
            </Menu.Item> */}
            <SubMenu
              key="sub2"
              title={
                <span>
                  <Icon type="mail" />
                  <span>线路规划</span>
                </span>
              }
            >
              <Menu.Item key="5" disabled>步骤1，鼠标右键指定起始位置</Menu.Item>
              <Menu.Item key="6" disabled>步骤2，鼠标右键指定终止位置</Menu.Item>
              <Menu.Item key="7" >步骤3.1 时间最短规划</Menu.Item>
              <Menu.Item key="8" >步骤3.2 路径最短规划</Menu.Item>
            </SubMenu>
          </Menu>
        </div>
        {showTable && <Collapse defaultActiveKey={['1']} style={{ position: 'absolute', zIndex: 999, width: '80%', left: 0, right: 0, bottom: 0, margin: 'auto', backgroundColor: '#2196F3', color: '#fff' }}>
          <Panel header="障碍点|应急点 管理" key="1">
            <Row>
              <Col span={2}>
                <Button type="primary" shape="round" onClick={this.addZhh}><Icon type="plus" />灾害点</Button>
              </Col>
              <Col span={2}>
                <Button type="primary" shape="round" onClick={this.addYj}><Icon type="plus" />应急点</Button>
              </Col>
              <Col span={3}>
                <Button type="primary" shape="round" onClick={this.addZhalj}><Icon type="plus" />障碍路径</Button>
              </Col>
              <Col span={2}>
                <Button type="danger" shape="circle" onClick={this.closeDraw}><Icon type="close" />关闭</Button>
              </Col>
              <Col offset={1} span={10}>
                <Form layout={"inline"}>
                  <Form.Item label="类型  ">
                    <Select defaultValue="All" style={{ width: 120 }} onChange={this.handleTypeChange}>
                      <Select.Option value="All">All</Select.Option>
                      <Select.Option value="zhh_point">灾害点</Select.Option>
                      <Select.Option value="yj_point">应急点</Select.Option>
                      <Select.Option value="zhalj_point">障碍路径</Select.Option>
                    </Select>
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" onClick={this.findByType}><Icon type="search" />搜索</Button>
                  </Form.Item>
                </Form>
              </Col>
              <Col span={4}>
                <Button type="primary" onClick={this.doChart}>统计图</Button>
              </Col>
            </Row>
            <Table
              size="small"
              rowKey={record => record.id}
              columns={[
                /* {
                  title: 'id',
                  dataIndex: 'id',
                  key: 'id',
                }, */
                {
                  title: '名称',
                  dataIndex: 'name',
                  key: 'name',
                },
                {
                  title: '物资',
                  dataIndex: 'resource',
                  key: 'director',
                },
                {
                  title: '类型',
                  dataIndex: 'type',
                  key: 'type',
                  render: function (text, record) {
                    if (text === "zhalj_point") {
                      return <Tag color={'geekblue'} key={'zhalj_point'}> 障碍路径 </Tag>
                    } else if (text === "zhh_point") {
                      return <Tag color={'grey'} key={'zhh_point'}> 灾害点 </Tag>
                    } else if (text === "yj_point") {
                      return <Tag color={'pink'} key={'yj_point'}> 应急点 </Tag>
                    }
                  }
                },
                {
                  title: '备注',
                  dataIndex: 'content',
                  key: 'content',
                  ellipsis: true,
                },
                {
                  title: '操作',
                  key: 'action',
                  width: 300,
                  render: (text, record) => (
                    <span>
                      <Button type="danger" style={{ marginRight: 16 }} onClick={() => this.deletePoi(record.id)} >删除</Button>
                      <Button type="primary" style={{ marginRight: 16 }} onClick={() => this.locatePoi(record.id)} >定位</Button>
                      {record.type === 'zhalj_point' ? "" : <Button type="primary" style={{ marginRight: 16 }} onClick={() => this.searchBuffer2(record.id)} >周边搜索</Button>}
                    </span>
                  ),
                },
              ]} dataSource={poiPoints} pagination={{ pageSize: 5 }} />
          </Panel>
        </Collapse>}

        {showChart &&
          <Card style={{ position: 'absolute', right: 0, bottom: 400, zIndex: 2147483647, width: 400}}>
            <div style={{ width: '100%' }}>
              <div style={{width: '100%',height:200 }} ref={(div) => { this.chartdiv = div }}></div>
            </div>
          </Card>
        }

        <Card style={{ position: 'absolute', right: 0, bottom: 10, zIndex: 2147483647, width: 140 }}>
          <Radio.Group onChange={this.onChangeRadio} value={this.state.radioValue}>
            <Radio style={radioStyle} value={1}>
              电子地图
            </Radio>
            <Radio style={radioStyle} value={2}>
              卫星图
            </Radio>
            <Radio style={radioStyle} value={3}>
              卫星和路网
            </Radio>
            <Radio style={radioStyle} value={4}>
              实时路况
            </Radio>
          </Radio.Group>
        </Card>
        <div id="container" style={{ width: '100%', height: '100%', paddingTop: '100px', position: 'absolute', left: 0 }} ref={(mapDiv) => { this.mapDiv = mapDiv }}></div>

        <CollectionCreateForm
          wrappedComponentRef={this.saveFormRef}
          visible={this.state.addVisible}
          onCancel={this.handleCancel}
          onCreate={this.handleCreate}
          type={this.state.addType}
        />
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
            {/* <Form.Item className="collection-create-form_last-form-item" label="Type">
              {getFieldDecorator('type', {
                initialValue: 'love',
              })(
                <Radio.Group>
                  <Radio value="love">love</Radio>
                  <Radio value="action">action</Radio>
                  <Radio value="warfare">warfare</Radio>
                  <Radio value="comedy">comedy</Radio>
                </Radio.Group>,
              )}
            </Form.Item> */}
            <Form.Item label="备注">
              {getFieldDecorator('content')(<Input type="textarea" />)}
            </Form.Item>
          </Form>
        </Modal>
      );
    }
  },
);

const WrappedDynamicRule2 = Form.create({ name: 'dynamic_rule' })(supermap_gd);
export default WrappedDynamicRule2