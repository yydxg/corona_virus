/* global mars3d Cesium*/
/* 导入antdesign包 */
import React, { Component } from 'react';
import { Divider, Checkbox, Button, Row, Col, Tooltip, Modal, Select, Card, Drawer, Input } from 'antd'
import styles from './style.less'
import echarts from 'echarts'
import Image_search from './search'
import { connect } from 'dva';

/* 导入openlayers依赖包 */
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import Feature from 'ol/Feature';
import { OSM, WMTS, XYZ } from 'ol/source';
import { LineString, Point, Polygon } from 'ol/geom';
import { defaults as defaultInteractions, Pointer as PointerInteraction } from 'ol/interaction';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { TileJSON, TileWMS, Vector as VectorSource } from 'ol/source';
import { click, pointerMove, altKeyOnly } from 'ol/events/condition';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';
import { Select as OlSelect } from 'ol/interaction';
import { toStringHDMS } from 'ol/coordinate';
import { Fill, Icon, Stroke, Style, Circle } from 'ol/style';
import { toLonLat, fromLonLat } from 'ol/proj';
import { FullScreen } from 'ol/control';
import Overlay from 'ol/Overlay';
import GeoJSON from 'ol/format/GeoJSON';

const { Option, OptGroup } = Select;

/** 引入geojson文件，加载矢量数据 */
const gaoxiao1Json = require('./file/gaoxiao1.json')
const gaoxiaoJson = require('./file/gaoxiao.json')

const provinceData = ['北京','广东','浙江', '江苏',];
const cityData = {
  '北京': ['北京'],
  '广东': ['深圳'],
  '浙江': ['杭州', '宁波', '温州'],
  '江苏': ['南京', '苏州', '镇江'],
};
const cityLnglatData = {
  '北京': [116.408788,39.909596],
  '深圳': [114.058084,22.549457],
  '杭州': [120.216947,30.259321],
  '宁波': [121.60986,29.863062],
  '温州': [120.706838,28.001086],
  '南京': [118.804147,32.061714],
  '苏州': [120.597586,31.311957], 
  '镇江': [119.432502,32.195634]
};


@connect(({ Imagery, Login }) => ({
  Imagery, Login
}))
class Ol_image_search extends Component {

  constructor(props) {
    super(props)
    this.state = {
      map: null,
      chart: null,
      /** 在线的osm数据源地图 */
      raster: new TileLayer({
        source: new OSM()
      }),
      /** 是在线的高德电子地图 */
      digitalLayer: new TileLayer({
        //source: new OSM()
        source: new XYZ({
          url: 'https://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}'
        })
      }),
      /** 是高德影像地图 */
      imagesLayer: new TileLayer({
        //source: new OSM()
        source: new XYZ({
          url: 'https://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=6&x={x}&y={y}&z={z}'
        })
      }),
      /** arcgis在线地图 */
      arcgisLayer: new TileLayer({
        source: new XYZ({
          //url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          url: 'http://cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}'
        })
      }),
      /** 高校的切片图层 wms */
      china: new TileLayer({
        source: new TileWMS({
          url: '/geoserver/imageSearch/wms',
          params: { 'LAYERS': 'imageSearch:china', 'TILED': true },
          serverType: 'geoserver',
          crossOrigin: 'anonymous'
        }),
        maxZoom: 8
      }),
      popHtml: '',/**存储弹框数据 */
      ModalText: 'Content of the modal',
      chartVisible: false,
      sourceVisible: false,
      confirmLoading: false,
      drawVisible: false,
      mylayers: [],
      cities: cityData[provinceData[0]],
      secondCity: cityData[provinceData[0]][0],
    }
  }

  /**
   * react生命周期结束后立即执行代码区块
   * 类似于document.onload=这种
   */
  componentDidMount() {
    this.start()
    console.log(this.refs.chart)
    this.setState({
      chart: this.refs.chart
    })
  }

  /**
   * 初始化加载地图
   */
  start = () => {
    this.initMap({
    }).then(() => {
      //**绑定点击地图事件 */
      this.bindClick()

    })
  }

  initMap = () => {
    const { raster, arcgisLayer, imagesLayer, digitalLayer, china } = this.state
    /** 先设置图层的显示隐藏 */
    raster.set("id", "raster")
    raster.setVisible(true)
    china.set('id', 'china')
    china.setVisible(true)
    arcgisLayer.set('id', 'arcgisLayer')
    arcgisLayer.setVisible(false)
    imagesLayer.set('id', 'imagesLayer')
    imagesLayer.setVisible(false)
    digitalLayer.set('id', 'digitalLayer')
    digitalLayer.setVisible(false)
    return new Promise(resolve => {
      //全屏控件
      var fullScreenControl = new FullScreen()
      var geojsonWrap = new GeoJSON()
      var features = geojsonWrap.readFeatures(gaoxiao1Json)//读取所有的geojson数据
      // console.log(features)
      var vectorSource = new VectorSource({
        projection: 'EPSG:4326',
        /* url: "./file/gaoxiao.json", //GeoJSON的文件路径，用户可以根据需求而改变
        format: new GeoJSON() */
        features: features
      });
      //矢量图层
      var vector = new VectorLayer({
        source: vectorSource,
        style: new Style({
          image: new Circle({
            radius: 3 * 2,
            fill: new Fill({
              color: [0, 153, 255, 0.01]
            }),
            stroke: new Stroke({
              color: [255, 255, 255, 0.01],
              width: 3 / 2
            })
          }),
        })
      });
      //弹出框层
      var overlay = new Overlay({
        id: 111,
        element: this.popupDiv,
        autoPan: true,
        autoPanMargin: 100,
        positioning: 'center-right'
      });
      var map = new Map({
        // interactions: defaultInteractions().extend([new Drag()]),
        view: new View({
          center: fromLonLat([114, 30.5]), //定位到的经纬度
          zoom: 4
        }),
        overlays: [overlay],
        layers: [
          raster,
          arcgisLayer,
          imagesLayer,
          digitalLayer,
          china,
          vector,
        ],
        target: 'map' //mapdiv的id 
      });
      map.addControl(fullScreenControl)

      //保存这个全局变量
      this.setState({
        map
      })
      resolve()
    })
  };

  //子组件里的调用
  locateLayer = (id) => {
    const { map, mylayers } = this.state
    const { images } = this.props.Imagery
    let olayer = mylayers.find(x => x.id == id);
    if (olayer) {
      olayer.layer.setVisible(true)
      return;
    }
    let image = images.find(i => i.id == id)
    let layer = null;
    if (image.serviceType === 'xyz') {
      layer = new TileLayer({
        source: new XYZ({
          url: `${image.url}/{z}/{x}/{y}.jpg`,
        }),
      })
    } else if (image.serviceType === 'wms') {
      let params = image.url.split('?')
      layer = new TileLayer({
        source: new TileWMS({
          url: params[0],
          params: { 'LAYERS': params[1], 'TILED': true },
          serverType: 'geoserver',
          crossOrigin: 'anonymous'
        }),
      })
      // layer = new ImageLayer({
      //   source: new ImageWMS({
      //     url: '/nongye/geoserver/nongye/wms',
      //     params: { 'LAYERS': 'nongye:wusubound' },
      //     ratio: 1,
      //     serverType: 'geoserver',
      //     crossOrigin: 'anonymous',
      //   }),
      // })
    }
    map.addLayer(layer)
    let points = image.points.split(',')
    map.getView().fit(new Point([parseFloat(points[0]), parseFloat(points[1])]).transform("EPSG:4326", "EPSG:3857"), {
      maxZoom: 10,
      duration: 1000
    })
    this.setState({
      mylayers: [...mylayers, { id, layer, points: image.points }]
    })
  }

  hideLayer = id => {
    const { mylayers } = this.state;
    let layer = mylayers.find(x => x.id == id);
    layer && layer.layer.setVisible(false)
  }

  bindClick = () => {
    const { map, } = this.state
    //监听地图鼠标事件
    var overlay = map.getOverlayById(111)

    var selected = null;
    //高亮显示要素的风格
    var highlightStyle = new Style({
      fill: new Fill({
        color: 'rgba(255,255,255,0.7)'
      }),
      stroke: new Stroke({
        color: '#3399CC',
        width: 3
      })
    });
    //监听单击点击事件
    map.on('singleclick', (e) => {//singleclick pointermove
      if (selected !== null) {
        selected.setStyle(undefined);
        selected = null;
      }

      map.forEachFeatureAtPixel(e.pixel, function (f) {
        selected = f;
        f.setStyle(highlightStyle);
        return true;
      });

      if (selected) {
        console.log(selected)
        var element = overlay.getElement();
        var coordinate = e.coordinate;
        var hdms = toStringHDMS(toLonLat(coordinate));
        overlay.setPosition(coordinate);

        var selectFeature = gaoxiaoJson.filter(item => {
          return item.id === "" + selected.values_.id
        })
        console.log(selectFeature)
        /* var pp ='';
        for (var key in selectFeature[0]) {
          pp += `<tr><td > ${key}：</td><td >${selectFeature[0][key]}</td></tr>`
        } */
        //保存点击的要素信息
        this.setState({
          popHtml: selectFeature[0]
        })
      }
    });
  }

  //影像和电子地图切换
  osg = () => {
    const { map, raster } = this.state
    var layers = map.getLayers()
    for (let i = 0; i < layers.getLength(); i++) {
      var id = layers.item(i).get('id')
      if (id === 'imagesLayer' || id === 'digitalLayer' || id === 'arcgisLayer') {
        layers.item(i).setVisible(false)
      }
    }
    raster.setVisible(true)
  }
  anhei = () => {
    const { map, arcgisLayer } = this.state
    var layers = map.getLayers()
    for (let i = 0; i < layers.getLength(); i++) {
      var id = layers.item(i).get('id')
      if (id === 'imagesLayer' || id === 'digitalLayer' || id === 'raster') {
        layers.item(i).setVisible(false)
      }
    }
    arcgisLayer.setVisible(true)
  }
  weixing = () => {
    const { map, imagesLayer } = this.state
    var layers = map.getLayers()
    for (let i = 0; i < layers.getLength(); i++) {
      var id = layers.item(i).get('id')
      if (id === 'arcgisLayer' || id === 'digitalLayer' || id === 'raster') {
        layers.item(i).setVisible(false)
      }
    }
    imagesLayer.setVisible(true)
  }
  luwang = () => {
    const { map, digitalLayer } = this.state
    var layers = map.getLayers()
    for (let i = 0; i < layers.getLength(); i++) {
      var id = layers.item(i).get('id')
      if (id === 'arcgisLayer' || id === 'imagesLayer' || id === 'raster') {
        layers.item(i).setVisible(false)
      }
    }
    digitalLayer.setVisible(true)
  }

  //关闭popup
  closePopup = () => {
    const { map } = this.state;
    var overlay = map.getOverlayById(111)
    overlay.setPosition(undefined);
  }

  showDrawer = () => {
    this.setState({
      drawVisible: !this.state.drawVisible,
    });
  };
  onClose = () => {
    this.setState({
      drawVisible: false,
    });
  };

  searchLonlat = value => {
    const { map } = this.state
    let mapv = value.split(',').map(v => parseFloat(v))
    map.getView().fit(new Point(mapv).transform("EPSG:4326", "EPSG:3857"), {
      maxZoom: 10,
      duration: 1000
    })
  }

  handleProvinceChange = value => {
    this.setState({
      cities: cityData[value],
      secondCity: cityData[value][0],
    });
  };

  onSecondCityChange = value => {
    this.setState({
      secondCity: value,
    });
  };

  doSure = ()=>{
    const {map,secondCity } = this.state

    map.getView().fit(new Point(cityLnglatData[secondCity]).transform("EPSG:4326", "EPSG:3857"), {
      maxZoom: 12,
      duration: 1000
    })
  }

  //渲染页面html模块
  render() {
    const { map, showPopup, popHtml, drawVisible, cities, secondCity } = this.state
    return (
      <div style={{ width: '100%', left: 0, top: 80, bottom: 0, right: 0, position: 'absolute', zIndex: 999 }}>
        <div className={styles.map} id="map">
          <div className={styles.toolbar}>
            <div className={styles.bar} onClick={this.osg}>
              <p>OSG</p>
            </div>
            <div className={styles.bar} onClick={this.anhei}>
              <p>mapbox</p>
            </div>
            <div className={styles.bar} onClick={this.luwang}>
              <p>路网</p>
            </div>
            <div className={styles.bar} onClick={this.weixing}>
              <p>卫星</p>
            </div>
          </div>
        </div>
        <div id="chart" ref="chart" style={{ display: 'none' }}></div>

        <div style={{ position: 'fixed', bottom: 0 }}><Button icon='double-right' type="primary" onClick={this.showDrawer}>
          打开查询
        </Button></div>
        <Drawer
          width={800}
          title="影像查询"
          placement={'left'}
          closable={true}
          maskClosable={false}
          mask={false}
          onClose={this.onClose}
          visible={this.state.drawVisible}
          style={{ height: '672px', top: '80px' }}
        >
          <Row>
            <Col span={24}><Input.Search addonBefore="坐标：" defaultValue={'121,31'} onSearch={value => this.searchLonlat(value)} /></Col>
          </Row>

          <Row style={{ marginTop: 8 }}>
            <Col span={4}>
              <label>空间位置：</label>
            </Col>
            <Col span={6}>
              <Select
                defaultValue={provinceData[0]}
                style={{ width: 150 }}
                onChange={this.handleProvinceChange}
              >
                {provinceData.map(province => (
                  <Option key={province}>{province}</Option>
                ))}
              </Select>
            </Col>
            <Col span={6} >
              <Select
                style={{ width: 150 }}
                value={this.state.secondCity}
                onChange={this.onSecondCityChange}
              >
                {cities.map(city => (
                  <Option key={city}>{city}</Option>
                ))}
              </Select>
            </Col>
            <Col span={4}>
              <Button onClick={this.doSure}>确定</Button>
            </Col>
          </Row>

          <Image_search locateLayer={this.locateLayer} hideLayer={this.hideLayer} />

        </Drawer>
      </div>
    )
  }

}

export default Ol_image_search
