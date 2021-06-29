/* global mars3d Cesium coordtransform AMap $*/
import React, { Component } from 'react';
import {
  Divider, Checkbox, Button, Row, Col, Tooltip, Modal, Select, Table, Tag, Card, Form,
  Input, Icon, Radio, Collapse, Slider, Carousel, Menu, InputNumber,Message
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

/**
 * 乔家大院
地址：晋中市祁县东观镇乔家堡村
电话：(0354)5321045
坐标：112.445706,37.41338
渠家大院
地址：山西省晋中市祁县东大街33号
电话：(0354)5223101
坐标：112.333779,37.363859
曹家大院
地址：山西省晋中市太谷区东后街
坐标：112.51997,37.397253
常家大院
地址：晋中市太谷区南关正街与太洛路交叉路口东侧(鑫港湾购物广场)
坐标：112.565606,37.425037
王家大院
地址：晋中市灵石县静升镇静升村
电话：(0354)7722122,(0354)5596666
坐标：111.880403,36.902151
马家大院
地址：晋中市平遥县马家巷34号
坐标：112.191997,37.214807
 */

@connect(({ JDIAN ,Login}) => ({
  JDIAN,Login
}))

class B_gaode extends Component {
  constructor(props) {
    super(props)
    this.state = {
      map: null,
      center: new AMap.LngLat(112.4, 37.4),
      showCarousel: true,
      collapsed: false,
      inputVal: '',
      inputBuffer: 1000,
      closeBuffer: true,
      currentMarker: null,
      currentPoint: null,
      placeSearch: null,
      prePeople: null,
      nextPeople: null,
      marker1: new AMap.Marker({
        title: '乔家大院',
        position: new AMap.LngLat(112.445706, 37.41338),
        icon: defaultMarker,
        anchor: 'bottom-center',
        visible: false,
      }),
      marker2: new AMap.Marker({
        title: '渠家大院',
        position: new AMap.LngLat(112.333779, 37.363859),
        icon: defaultMarker,
        anchor: 'bottom-center',
        visible: false,
      }),
      marker3: new AMap.Marker({
        title: '曹家大院',
        position: new AMap.LngLat(112.51997, 37.397253),
        icon: defaultMarker,
        anchor: 'bottom-center',
        visible: false,
      }),
      marker4: new AMap.Marker({
        title: '常家大院',
        position: new AMap.LngLat(112.565606, 37.425037),
        icon: defaultMarker,
        anchor: 'bottom-center',
        visible: false,
      }),
      marker5: new AMap.Marker({
        title: '王家大院',
        position: new AMap.LngLat(111.880403, 36.902151),
        icon: defaultMarker,
        anchor: 'bottom-center',
        visible: false,
      }),
      marker6: new AMap.Marker({
        title: '马家大院',
        position: new AMap.LngLat(112.191997, 37.214807),
        icon: defaultMarker,
        anchor: 'bottom-center',
        visible: false,
      }),
    }
  }

  componentDidMount() {
    const {history} = this.props
    const { center } = this.state
    const login = this.props.Login;
    if(login && login.username !==''){
      setTimeout(() => {
        var map = new AMap.Map(this.mapDiv, {
          zoom: 10,
          center
        })
        this.bindMarkerEvent(map);
        this.setState({
          map
        })
      }, 600)
    }else{
      history.push('/')
    }
  }

  componentWillUnmount() {
  }

  bindMarkerEvent = (map) => {
    const { marker1, marker2, marker3, marker4, marker5, marker6 } = this.state;
    map.add(marker1)
    map.add(marker2)
    map.add(marker3)
    map.add(marker4)
    map.add(marker5)
    map.add(marker6)


    //创建右键菜单
    var contextMenu = new AMap.ContextMenu();
    /* //右键放大
    contextMenu.addItem("放大一级", function () {
      map.zoomIn();
    }, 0);

    //右键缩小
    contextMenu.addItem("缩小一级", function () {
      map.zoomOut();
    }, 1);

    //右键显示全国范围
    contextMenu.addItem("缩放至景区范围", function (e) {
      map.setZoomAndCenter(4, center);
    }, 2); */
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

    marker1.on('click', () => {
      this.setState({
        closeBuffer: false,
        currentPoint: marker1.getPosition(),
        currentMarker: marker1
      })
      this._getByName(marker1.getTitle()).then(res => {
        const { data } = res;
        var infoWindow = new AMap.InfoWindow({
          offset: [10, -20],
          showShadow: true,
          content: `<h3><b>景点信息</b></h3>
                    <span>名称:</span><span>${data.name}</span></br>
                    <span>简介:</span><span>${data.info}</span></br>`//信息窗体的内容
        });
        infoWindow.open(map, marker1.getPosition()); //信息窗体打开
      })
    })
    marker2.on('click', () => {
      this.setState({
        closeBuffer: false,
        currentPoint: marker2.getPosition(),
        currentMarker: marker2
      })
      this._getByName(marker2.getTitle()).then(res => {
        const { data } = res;
        var infoWindow = new AMap.InfoWindow({
          offset: [10, -20],
          showShadow: true,
          content: `<h3><b>景点信息</b></h3>
                    <span>名称:</span><span>${data.name}</span></br>
                    <span>简介:</span><span>${data.info}</span></br>`//信息窗体的内容
        });
        infoWindow.open(map, marker2.getPosition()); //信息窗体打开
      })
    })
    marker3.on('click', () => {
      console.log(marker3.getTitle())
      this.setState({
        closeBuffer: false,
        currentPoint: marker3.getPosition(),
        currentMarker: marker3
      })
      this._getByName(marker3.getTitle()).then(res => {
        const { data } = res;
        var infoWindow = new AMap.InfoWindow({
          offset: [10, -20],
          showShadow: true,
          content: `<h3><b>景点信息</b></h3>
                    <span>名称:</span><span>${data.name}</span></br>
                    <span>简介:</span><span>${data.info}</span></br>`//信息窗体的内容
        });
        infoWindow.open(map, marker3.getPosition()); //信息窗体打开
      })
    })
    marker4.on('click', () => {
      console.log(marker4.getTitle())
      this.setState({
        closeBuffer: false,
        currentPoint: marker4.getPosition(),
        currentMarker: marker4
      })
      this._getByName(marker4.getTitle()).then(res => {
        const { data } = res;
        var infoWindow = new AMap.InfoWindow({
          offset: [10, -20],
          showShadow: true,
          content: `<h3><b>景点信息</b></h3>
                    <span>名称:</span><span>${data.name}</span></br>
                    <span>简介:</span><span>${data.info}</span></br>`//信息窗体的内容
        });
        infoWindow.open(map, marker4.getPosition()); //信息窗体打开
      })
    })
    marker5.on('click', () => {
      console.log(marker5.getTitle())
      this.setState({
        closeBuffer: false,
        currentPoint: marker5.getPosition(),
        currentMarker: marker5
      })
      this._getByName(marker5.getTitle()).then(res => {
        const { data } = res;
        var infoWindow = new AMap.InfoWindow({
          offset: [10, -20],
          showShadow: true,
          content: `<h3><b>景点信息</b></h3>
                    <span>名称:</span><span>${data.name}</span></br>
                    <span>简介:</span><span>${data.info}</span></br>`//信息窗体的内容
        });
        infoWindow.open(map, marker5.getPosition()); //信息窗体打开
      })
    })
    marker6.on('click', () => {
      console.log(marker6.getTitle())
      this.setState({
        closeBuffer: false,
        currentPoint: marker6.getPosition(),
        currentMarker: marker6
      })
      this._getByName(marker6.getTitle()).then(res => {
        const { data } = res;
        var infoWindow = new AMap.InfoWindow({
          offset: [10, -20],
          showShadow: true,
          content: `<h3><b>景点信息</b></h3>
                    <span>名称:</span><span>${data.name}</span></br>
                    <span>简介:</span><span>${data.info}</span></br>`//信息窗体的内容
        });
        infoWindow.open(map, marker6.getPosition()); //信息窗体打开
      })
    })
  }

  _getByName = (name) => {
    const { dispatch } = this.props;
    return new Promise((resolve, reject) => {
      dispatch({
        type: 'JDIAN/doSearch',
        payload: {
          name
        }
      }).then(res => {
        resolve(res)
      })
    })
  }

  changeJD = e => {
    this.setState({
      inputVal: e.target.value
    })
  }
  searchJD = e => {
    const {map, inputVal,marker1, marker2, marker3, marker4, marker5, marker6 } = this.state
    const { dispatch } = this.props
    if (e.keyCode == 13) {
      console.log(inputVal)
      dispatch({
        type: 'JDIAN/doSearch',
        payload: {
          name: inputVal
        }
      }).then(res => {
        console.log(res)
        const {data} = res
        if(data===null){
          Message.info("没有找到该景点")
        }else{
          this._markersHide()
          switch (inputVal) {
            case '乔家大院':
              marker1.show()
              map.setCenter(marker1.getPosition())
              break;
            case '渠家大院':
              marker2.show()
              map.setCenter(marker2.getPosition())
              break;
            case '曹家大院':
              marker3.show()
              map.setCenter(marker3.getPosition())
              break;
            case '常家大院':
              marker4.show()
              map.setCenter(marker4.getPosition())
              break;
            case '王家大院':
              marker5.show()
              map.setCenter(marker5.getPosition())
              break;
            case '马家大院':
              marker6.show()
              map.setCenter(marker6.getPosition())
              break;
            default:
              break
          }
        }
      })
    }
  }

  clickImg = (c) => {
    const { map, marker1, marker2, marker3, marker4, marker5, marker6 } = this.state
    this._markersHide()
    switch (c) {
      case 1:
        marker1.show()
        map.setCenter(marker1.getPosition())
        break;
      case 2:
        marker2.show()
        map.setCenter(marker2.getPosition())
        break;
      case 3:
        marker3.show()
        map.setCenter(marker3.getPosition())
        break;
      case 4:
        marker4.show()
        map.setCenter(marker4.getPosition())
        break;
      case 5:
        marker5.show()
        map.setCenter(marker5.getPosition())
        break;
      case 6:
        marker6.show()
        map.setCenter(marker6.getPosition())
        break;
      default:
        break
    }
  }

  handleClick = (e) => {
    const { map, marker1, marker2, marker3, marker4, marker5, marker6, prePeople, nextPeople, currentMarker ,placeSearch} = this.state
    switch (e.key) {
      case "1"://首页
        this._markersHide()
        driving && driving.clear()
        this.setState({
          showCarousel: true,
          closeBuffer: true,
        })
        break;
      case "2"://景点
        // this._goto(10,[112.75,37.68])
        driving && driving.clear()
        this.excuteJD();
        break;
      case "3"://在线观光
        if (currentMarker === null) {
          Modal.error({
            content: '请先选择游览的景点'
          })
          return;
        }
        Modal.confirm({
          content: `当前选中的景点是：${currentMarker.getTitle()}`,
          okText:'去观光',
          cancelText:'取消',
          onOk() {
            switch (currentMarker.getTitle()) {
              case '乔家大院':
                window.open('https://baike.baidu.com/item/%E4%B9%94%E5%AE%B6%E5%A4%A7%E9%99%A2/5844')
                break;
              case '渠家大院':
                window.open('https://baike.baidu.com/item/%E6%B8%A0%E5%AE%B6%E5%A4%A7%E9%99%A2')
                break;
              case '曹家大院':
                window.open('https://baike.baidu.com/item/%E6%9B%B9%E5%AE%B6%E5%A4%A7%E9%99%A2')
                break;
              case '王家大院':
                window.open('https://baike.baidu.com/item/%E7%8E%8B%E5%AE%B6%E5%A4%A7%E9%99%A2')
                break;
              case '马家大院':
                window.open('https://baike.baidu.com/item/%E9%A9%AC%E5%AE%B6%E5%A4%A7%E9%99%A2/9166005')
                break;
              case '常家大院':
                window.open('https://baike.baidu.com/item/%E5%B8%B8%E5%AE%B6%E5%A4%A7%E9%99%A2')
                break;
            }

          },
          onCancel() {
            console.log('Cancel');
          },
        })
        break;
      case "5"://指定人员位置
        break;
      case "6"://路线规划
        break;
      case "7"://时间路线规划
        //构造路线导航类
        if (prePeople === null || nextPeople === null) {
          Modal.error({
            content: '请选择人员起始，终止位置'
          })
          return;
        }
        placeSearch && placeSearch.clear()
        driving && driving.clear()
        marker1.show()
        marker2.show()
        marker3.show()
        marker4.show()
        marker5.show()
        marker6.show()
        map.plugin('AMap.Driving', function () {
          driving = new AMap.Driving({
            policy: AMap.DrivingPolicy.LEAST_TIME,
            map: map,
            panel: "panel1"
          });
          var path = [];
          let start = prePeople.getPosition()
          let end = nextPeople.getPosition()
          let go1 = marker1.getPosition()
          let go2 = marker2.getPosition()
          path.push(new AMap.LngLat(go1.lng, go1.lat))
          path.push(new AMap.LngLat(go2.lng, go2.lat))
          let go3 = marker3.getPosition()
          let go4 = marker4.getPosition()
          path.push(new AMap.LngLat(go3.lng, go3.lat))
          path.push(new AMap.LngLat(go4.lng, go4.lat))
          let go5 = marker5.getPosition()
          let go6 = marker6.getPosition()
          path.push(new AMap.LngLat(go5.lng, go5.lat))
          path.push(new AMap.LngLat(go6.lng, go6.lat))
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
            content: '请选择人员起始，终止位置'
          })
          return;
        }
        placeSearch && placeSearch.clear()
        driving && driving.clear()
        marker1.show()
        marker2.show()
        marker3.show()
        marker4.show()
        marker5.show()
        marker6.show()
        map.plugin('AMap.Driving', function () {
          driving = new AMap.Driving({
            policy: AMap.DrivingPolicy.LEAST_DISTANCE,
            map: map,
            panel: "panel1"
          });
          var path = [];
          let start = prePeople.getPosition()
          let end = nextPeople.getPosition()
          let go1 = marker1.getPosition()
          let go2 = marker2.getPosition()
          path.push(new AMap.LngLat(go1.lng, go1.lat))
          path.push(new AMap.LngLat(go2.lng, go2.lat))
          let go3 = marker3.getPosition()
          let go4 = marker4.getPosition()
          path.push(new AMap.LngLat(go3.lng, go3.lat))
          path.push(new AMap.LngLat(go4.lng, go4.lat))
          let go5 = marker5.getPosition()
          let go6 = marker6.getPosition()
          path.push(new AMap.LngLat(go5.lng, go5.lat))
          path.push(new AMap.LngLat(go6.lng, go6.lat))
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
  excuteJD = () => {
    const { map, marker1, marker2, marker3, marker4, marker5, marker6 } = this.state
    this._goto(9, [112.333779, 37.363859])
    marker1.show()
    marker2.show()
    marker3.show()
    marker4.show()
    marker5.show()
    marker6.show()

    this.setState({
      showCarousel: false,
    })
  }
  _markersHide = () => {
    const { marker1, marker2, marker3, marker4, marker5, marker6 } = this.state
    marker1.hide()
    marker2.hide()
    marker3.hide()
    marker4.hide()
    marker5.hide()
    marker6.hide()

  }
  _goto = (zoom, center) => {
    const { map } = this.state
    map && map.setZoomAndCenter(zoom, center, false, 5)
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

  searchBuffer = () => {
    const { map, inputBuffer, currentPoint, placeSearch } = this.state
    console.log(inputBuffer, currentPoint)
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

      var cpoint = [currentPoint.lng, currentPoint.lat]; //中心点坐标
      placeSearch2.searchNearBy('', cpoint, inputBuffer, (status, result) => {
        console.log(result)

        this.setState({
          placeSearch: placeSearch2
        })
      });


    });
  }
  render() {
    const { showCarousel, closeBuffer } = this.state
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 8 },
    };
    const formTailLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 8, offset: 4 },
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
              <span>首页</span>
            </Menu.Item>
            <SubMenu
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
            </Menu.Item>
            <SubMenu
              key="sub2"
              title={
                <span>
                  <Icon type="mail" />
                  <span>线路规划</span>
                </span>
              }
            >
              <Menu.Item key="5" disabled>步骤1，指定人员起始位置</Menu.Item>
              <Menu.Item key="6" disabled>步骤2，指定人员终止位置</Menu.Item>
              <Menu.Item key="7" >步骤3.1 时间最短规划</Menu.Item>
              <Menu.Item key="8" >步骤3.2 路径最短规划</Menu.Item>
            </SubMenu>
          </Menu>
        </div>

        {showCarousel && <Card style={{ position: 'absolute', zIndex: 999, width: '50%', left: 0, right: 0, bottom: 0, margin: 'auto' }}>
          <Carousel autoplay >
            <div onClick={() => this.clickImg(1)} style={{ cursor: 'pointer' }} className={styles.img1} >
              <h3>乔家大院</h3>
            </div>
            <div onClick={() => this.clickImg(2)} style={{ cursor: 'pointer' }} className={styles.img2} >
              <h3>渠家大院</h3>
            </div>
            <div onClick={() => this.clickImg(3)} style={{ cursor: 'pointer' }} className={styles.img3}>
              <h3>曹家大院</h3>
            </div>
            <div onClick={() => this.clickImg(4)} style={{ cursor: 'pointer' }} className={styles.img1}>
              <h3>常家大院</h3>
            </div>
            <div onClick={() => this.clickImg(5)} style={{ cursor: 'pointer' }} className={styles.img1}>
              <h3>王家大院</h3>
            </div>
            <div onClick={() => this.clickImg(6)} style={{ cursor: 'pointer' }} className={styles.img1}>
              <h3>马家大院</h3>
            </div>
          </Carousel>
        </Card>}
        {showCarousel &&
          <Card style={{ position: 'absolute', right: 0, top: 100, zIndex: 2147483647, background: 'currentColor' }}>
            <Input placeholder="景点名称如：马家大院" onChange={this.changeJD} onKeyDown={e => this.searchJD(e)}></Input>
          </Card>}
        <div id="container" style={{ width: '100%', height: '100%', paddingTop: '100px', position: 'absolute', left: 0 }} ref={(mapDiv) => { this.mapDiv = mapDiv }}></div>
      </div>
    )
  }
}

const WrappedDynamicRule = Form.create({ name: 'dynamic_rule' })(B_gaode);
export default WrappedDynamicRule