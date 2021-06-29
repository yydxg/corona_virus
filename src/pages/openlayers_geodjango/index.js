/* global mars3d Cesium*/
import React, { Component } from 'react';
import { connect } from 'dva';
import { Divider, Checkbox, Button, Row, Col, Tooltip, Modal, Select, Tree, Icon, Input, message } from 'antd'
import styles from './style.less'
import echarts from 'echarts'

const { TreeNode } = Tree;

/* openlayers */
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import Feature from 'ol/Feature';
import { OSM, XYZ } from 'ol/source';
import { LineString, Point, Polygon } from 'ol/geom';
import { defaults as defaultInteractions, Pointer as PointerInteraction, Select as SelectInteraction } from 'ol/interaction';
import { Image as ImageLayer, Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { ImageWMS, TileJSON, Vector as VectorSource } from 'ol/source';
import { Fill, Stroke, Style, Circle, Image as ImageStyle, Icon as IconStyle } from 'ol/style';
import { toLonLat, fromLonLat, get, getTransform, transform } from 'ol/proj';
import { FullScreen } from 'ol/control';
import filter, { or, like, and, equalTo } from 'ol/format/filter';
import GeoJSON from 'ol/format/GeoJSON';
import { none } from 'ol/centerconstraint';
import { click, pointerMove } from 'ol/events/condition';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';

const { Option, OptGroup } = Select;
const { Search } = Input;

//配置图层数据
const layerData = ['poi', '道路', '建筑物'];
//配置字段数据
const fieldData = {
  poi: ['id', '类型', '名称'],
  道路: ['id',],
  建筑物: ['id', '名称'],
};

//初始填充面样式
var fill = new Fill({
  color: 'rgba(255,255,255,0.4)'
});
//初始填充线样式
var stroke = new Stroke({
  color: '#3399CC',
  width: 1.25
});

@connect(({ geodjango, Login }) => ({
  geodjango, Login
}))

class Geodjango extends Component {
  constructor(props) {
    super(props)
    this.state = {
      map: null,
      chart: null,
      //底图
      digitalLayer: new TileLayer({
        //source: new OSM()
        source: new XYZ({
          url: 'https://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}'
        })
      }),
      imagesLayer: new TileLayer({
        //source: new OSM()
        source: new XYZ({
          url: 'https://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=6&x={x}&y={y}&z={z}'
        })
      }),
      arcgisLayer: new TileLayer({
        source: new XYZ({
          //url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          url: 'http://cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}'
        })
      }),

      poiLayer: null, //初始化poi图层
      roadLayer: null, //初始化道路图层
      buildingLayer: null, //初始化building图层
      highLightLayer: null,//初始化高亮缓存图层

      showChart: false,
      featureDetails: null,//点击地块详细信息
      showSearch: true, //是否展示搜索面板
      layers: fieldData[layerData[0]], //当前选中的图层字段组
      field: fieldData[layerData[0]][0], //选中的字段 
      selectLayer: layerData[0],//选中的图层 
      schoolVisible: false, //学校详细信息面板
      showBuilding: '',//显示详情楼的标识
    }
  }

  //react 生命周期的didMount函数，在组件初始化后立即执行
  componentDidMount() {
    let { dispatch, history } = this.props;
    const login = this.props.Login;
    //判断是否登录，未登录做跳转
    // if(login && login.tempdata !==''){
    if (1 == 1) {
      //先初始化所有的图层数据，从pg库表里取数据
      this.props.dispatch({
        type: 'geodjango/getAllData',
        callback: () => { //这里是回调函数，请求成功后执行
          const { poiData, roadData, buildingData } = this.props.geodjango
          let mm = setInterval(() => {
            console.log(JSON.parse(buildingData))
            if (poiData && roadData && buildingData) {
              this.start()
              window.clearInterval(mm)
            }
          }, 2000) //给一个2秒的延迟
        }
      })
      this.setState({
        chart: this.refs.chart,
      })
    } else {
      history.push('/user/login')
    }
  }

  start = () => {
    //初始化地图模块
    this.initMap({
    }).then(() => {
      const { map,pickDangqian } = this.state

      //监听地图点击动作，此处作废，只为控制台输出坐标来做测试使用
      let that = this
      map.on('singleclick', function (evt) {
        var viewResolution = /** @type {number} */ (map.getView().getResolution());
        //输出经纬度
        var x = evt.coordinate[0] / 20037508.34 * 180;
        var y = evt.coordinate[1] / 20037508.34 * 180;
        y = 180 / Math.PI * (2 * Math.atan(Math.exp(y * Math.PI / 180)) - Math.PI / 2);
        console.log(x, y)

        if(pickDangqian){
          var iconFeature = new Feature({
            geometry: new Point(transform([x, y], 'EPSG:4326', 'EPSG:3857')),
          });
          var iconStyle = new Style({
            image: new Icon(({
              anchor: [0.5, 0.5], // 锚点 默认值为图片中心
              src: require('./img/point.png'), // 图标路径
            }))
          });
          iconFeature.setStyle(iconStyle);
          var vectorSource = new ol.source.Vector({
            features: [iconFeature]
          });
          var vectorLayer = new ol.layer.Vector({
            source: vectorSource
          });
          vectorLayer.set('id','dangqian')
          //找到前面添加的删掉
          var layers = map.getLayers()
          for (let i = 0; i < layers.getLength(); i++) {
            var id = layers.item(i).get('id')
            if (id === 'arcgisLayer' || id === 'digitalLayer') {
              layers.item(i).setVisible(false)
            }
          }
          map.addLayer(vectorLayer);
        }
        
      });
      //end

      //监听鼠标移入移出手型指针效果
      map.on('pointermove', function (evt) {
        if (evt.dragging) {
          return;
        }
        var pixel = map.getEventPixel(evt.originalEvent);
        var hit = map.forEachLayerAtPixel(pixel, function () {
          return true;
        });
        map.getTargetElement().style.cursor = hit ? 'pointer' : '';
      });

    })
  }

  initMap = () => {
    const { arcgisLayer, imagesLayer, digitalLayer } = this.state
    const { poiData, roadData, buildingData } = this.props.geodjango
    //先初始化电子地图图层，设置是否默认隐藏，赋值id标识
    arcgisLayer.set('id', 'arcgisLayer')
    arcgisLayer.setVisible(false)
    imagesLayer.set('id', 'imagesLayer')
    imagesLayer.setVisible(false)
    digitalLayer.set('id', 'digitalLayer')
    digitalLayer.setVisible(true)

    //五角星poi点矢量图层
    let poiLayer = new VectorLayer({
      style: new Style({
        image: new IconStyle({
          src: require('./img/point.png'),
          scale: 0.1
        }),
        fill: fill,
        stroke: stroke
      }),
      source: new VectorSource({
        projection: 'EPSG:3857',
        format: new GeoJSON(),
        features: (new GeoJSON()).readFeatures(JSON.parse(poiData), { defaultDataProjection: "EPSG:4326", featureProjection: "EPSG:3857" }),
        strategy: bboxStrategy
      })
    })
    //道路矢量图层
    let roadLayer = new VectorLayer({
      style: new Style({
        stroke: new Stroke({
          color: 'rgb(255,170,0)',
          width: 3
        })
      }),
      source: new VectorSource({
        projection: 'EPSG:3857',
        format: new GeoJSON(),
        features: (new GeoJSON()).readFeatures(JSON.parse(roadData), { defaultDataProjection: "EPSG:4326", featureProjection: "EPSG:3857" }),
        strategy: bboxStrategy
      })
    })
    //建筑物矢量图层
    let buildingLayer = new VectorLayer({
      source: new VectorSource({
        projection: 'EPSG:3857',
        format: new GeoJSON(),
        features: (new GeoJSON()).readFeatures(JSON.parse(buildingData), { defaultDataProjection: "EPSG:4326", featureProjection: "EPSG:3857" }),
        strategy: bboxStrategy
      })
    })

    //返回一个promise对象
    return new Promise(resolve => {
      var fullScreenControl = new FullScreen()
      var map = new Map({
        // interactions: defaultInteractions().extend([new Drag()]),
        view: new View({
          center: fromLonLat([116.39988, 39.963860]),
          zoom: 18
        }),
        layers: [
          arcgisLayer,
          imagesLayer,
          digitalLayer,
          buildingLayer,
          roadLayer,
          poiLayer,
        ],
        target: 'map'
      });
      map.addControl(fullScreenControl)

      //监听单击选择 弹框展示
      var select = new SelectInteraction({
        condition: click,
      });
      map.addInteraction(select);
      select.on('select', (e) => {
        console.log(e.target.getFeatures())
        let feature = e.target.getFeatures().getArray()[0]
        feature && this.covertRender(feature)
      })

      window.myMap = map

      //设置building 图片样式 ！！！很重要
      var cnv = document.createElement('canvas');
      var ctx = cnv.getContext('2d');
      var img = new Image();
      img.src = require('./img/mian.png');
      img.onload = function () {
        var pattern = ctx.createPattern(img, 'repeat');
        buildingLayer.setStyle(new Style({
          stroke: new Stroke({
            color: 'red',
            lineDash: [5],
            width: 2
          }),
          fill: new Fill({
            color: pattern
          })
        }));
      };

      this.setState({
        map,
        poiLayer,
        roadLayer,
        buildingLayer,
      }, () => {
        resolve()
      })
    })
  };

  covertRender = feature => {
    console.log(feature)
    let type = feature.getGeometry().getType()
    let properties = feature.getProperties()
    let flag = '', geoType = '';
    if (type.includes('Polygon')) { //建筑
      flag = 'building'; geoType = '面';
    } else if (type.includes('Point')) { //poi
      flag = 'poi'; geoType = '点';
    } else if (type.includes('LineString')) { //road
      flag = 'road'; geoType = '线';
    }
    this.setState({
      ...this.state,
      featureDetails: { ...properties, flag, geoType }
    })
  }

  covertRender2 = feature => {
    if (!feature) {
      message.warning('木有找到!')
      return;
    };
    let type = feature.geometry.type
    let properties = feature.properties
    let flag = '', geoType = '';
    if (type.includes('Polygon')) { //建筑
      flag = 'building'; geoType = '面';
    } else if (type.includes('Point')) { //poi
      flag = 'poi'; geoType = '点';
    } else if (type.includes('LineString')) { //road
      flag = 'road'; geoType = '线';
    }
    this.setState({
      ...this.state,
      featureDetails: { ...properties, flag, geoType }
    })
  }

  //定位
  location = () => {
    const { map } = this.state
    let bmap = new BMap.Map("allmap");

    var geolocation = new BMap.Geolocation();
    geolocation.getCurrentPosition(function (r) {
      if (this.getStatus() == BMAP_STATUS_SUCCESS) {
        console.log('您的位置：'+ r.point.lng+','+r.point.lat);
        map.setView(new View({
          center: fromLonLat([r.point.lng, r.point.lat]),
          zoom: 10
        }))
      }
      else {
        alert('failed' + this.getStatus());
      }
    });
  }
  //影像和电子地图切换
  anhei = () => {
    const { map, arcgisLayer } = this.state
    var layers = map.getLayers()
    for (let i = 0; i < layers.getLength(); i++) {
      var id = layers.item(i).get('id')
      if (id === 'imagesLayer' || id === 'digitalLayer') {
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
      if (id === 'arcgisLayer' || id === 'digitalLayer') {
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
      if (id === 'arcgisLayer' || id === 'imagesLayer') {
        layers.item(i).setVisible(false)
      }
    }
    digitalLayer.setVisible(true)
  }


  onCheck = (checkedKeys, info) => {
    const { poiLayer, roadLayer, buildingLayer } = this.state
    console.log(checkedKeys)
    //显示隐藏图层数据
    poiLayer.setVisible(false)
    roadLayer.setVisible(false)
    buildingLayer.setVisible(false)
    if (checkedKeys.includes("poi")) {
      poiLayer.setVisible(true)
    }
    if (checkedKeys.includes("road")) {
      roadLayer.setVisible(true)
    }
    if (checkedKeys.includes("building")) {
      buildingLayer.setVisible(true)
    }
  };

  getArrDifference = (arr1, arr2) => {
    return arr1.concat(arr2).filter(function (v, i, arr) {
      return arr.indexOf(v) === arr.lastIndexOf(v);
    });
  }

  searchFavors = () => {
    this.setState({
      ...this.state,
      showSearch: !this.state.showSearch
    })
  }

  locationPerson = () =>{}

  searchFavors2 = (value) => {
    const { map, layers, selectLayer, field, poiLayer } = this.state
    const { poiData, roadData, buildingData } = this.props.geodjango;
    console.log(selectLayer, field, value)
    console.log(JSON.parse(poiData))
    let fieldMap = {
      'id': 'pk',
      '类型': 'type',
      '名称': 'name'
    }, features = [];
    switch (selectLayer) {
      case 'poi':
        features = JSON.parse(poiData).features.filter(v => v.properties[fieldMap[field]].includes(value))
        this.covertRender2(features[0])
        break;
      case '道路':
        features = JSON.parse(roadData).features.filter(v => v.properties[fieldMap[field]].includes(value))
        this.covertRender2(features[0])
        break;
      case '建筑物':
        features = JSON.parse(buildingData).features.filter(v => v.properties[fieldMap[field]].includes(value))
        this.covertRender2(features[0])
        break;
    }
  }

  handleLayerChange = value => {
    this.setState({
      selectLayer: value,
      layers: fieldData[value],
      field: fieldData[value][0],
    });
  };

  onfieldChange = value => {
    this.setState({
      field: value,
    });
  };

  showModal = () => {
    this.setState({
      schoolVisible: true,
    });
  };

  hideModal = () => {
    this.setState({
      schoolVisible: false,
    });
  };

  infoBuilding = () => {
    const { featureDetails } = this.state
    console.log(featureDetails)
    this.setState({
      schoolVisible: !this.state.schoolVisible,
      // showBuilding:
    })
  }

  render() {
    const { featureDetails, showChart, showBuilding } = this.state
    return (
      <div style={{ width: '100%', paddingTop: '80px' }}>
        <div className={styles.layer}>
          <Tree
            checkable
            defaultExpandedKeys={['xiaoyuan']}
            defaultSelectedKeys={['xiaoyuan']}
            defaultCheckedKeys={['xiaoyuan']}
            // onSelect={this.onSelect}
            onCheck={this.onCheck}
          >
            <TreeNode title="校园地图图层" key="xiaoyuan">
              <TreeNode title="poi" key="poi"></TreeNode>
              <TreeNode title="道路" key="road"></TreeNode>
              <TreeNode title="建筑" key="building"></TreeNode>
            </TreeNode>
          </Tree>
          <Divider orientation="right"><a onClick={this.searchFavors}>搜索</a></Divider>
          <Divider orientation="right"><a onClick={this.locationPerson}>指定当前所在位置</a></Divider>
          <div className={styles.desc}>
            {featureDetails && featureDetails.flag === 'road' && (
              <>
                <Divider orientation="left">要素详情</Divider>
                <div className={styles.item}><label>id：</label><span>{featureDetails.pk}</span></div>
                <div className={styles.item}><label>几何类型：</label><span>{featureDetails.geoType}</span></div>
              </>
            )}
            {featureDetails && featureDetails.flag === 'poi' && (
              <>
                <Divider orientation="left">要素详情</Divider>
                <div className={styles.item}><label>id：</label><span>{featureDetails.pk}</span></div>
                <div className={styles.item}><label>几何类型：</label><span>{featureDetails.geoType}</span></div>
                <div className={styles.item}><label>类型：</label><span>{featureDetails.type}</span></div>
                <div className={styles.item}><label>名称：</label><span>{featureDetails.name}</span></div>
              </>
            )}
            {featureDetails && featureDetails.flag === 'building' && (
              <>
                {/* <div className={styles.title}>农作物详情</div> */}
                <Divider orientation="left">要素详情</Divider>
                <div className={styles.item}><label>id：</label><span>{featureDetails.pk}</span></div>
                <div className={styles.item}><label>几何类型：</label><span>{featureDetails.geoType}</span></div>
                <div className={styles.item}><label>名称：</label><span>{featureDetails.name}</span></div>
                <div className={styles.item}><Button type="dashed" icon="info-circle" onClick={this.infoBuilding}>详情</Button></div>
              </>
            )}
          </div>
          {
            showChart && (
              <div className={styles.chart}>
                <div id="chart" ref="chart" style={{ width: '100%', height: '100%' }}></div>
              </div>

            )
          }
        </div>
        <div className={styles.map} id="map">
          {
            this.state.showSearch && (
              <div className={styles.searchFavors}>
                <Search placeholder="请选择查询条件并输入关键字" onSearch={value => this.searchFavors2(value)} enterButton />

                <Select
                  defaultValue={layerData[0]}
                  style={{ width: 120, marginTop: 12 }}
                  onChange={this.handleLayerChange}
                >
                  {layerData.map((province, index) => (
                    <Option key={index} value={province}>{province}</Option>
                  ))}
                </Select>
                <Select
                  style={{ width: 120 }}
                  value={this.state.field}
                  onChange={this.onfieldChange}
                >
                  {this.state.layers.map((city, index) => (
                    <Option key={index} value={city}>{city}</Option>
                  ))}
                </Select>
              </div>
            )
          }
          <div className={styles.toolbar}>
            <div className={styles.bar} onClick={this.location}>
              <div id="allmap" style={{ display: none }}></div>
              <p><Icon type="environment" /></p>
            </div>
            <div className={styles.bar} onClick={this.anhei}>
              <p>暗黑</p>
            </div>
            <div className={styles.bar} onClick={this.luwang}>
              <p>路网</p>
            </div>
            <div className={styles.bar} onClick={this.weixing}>
              <p>卫星</p>
            </div>
          </div>
        </div>
        {/* <div className={styles.schoolInfo}> */}
        <Modal
          title="详情"
          style={{ top: 20, zIndex: 9999999 }}
          width={800}
          visible={this.state.schoolVisible}
          onOk={this.hideModal}
          onCancel={this.hideModal}
          okText="确认"
          cancelText="取消"
        >
          {
            featureDetails && featureDetails.name === '1号楼' && (
              <>
                <p style={{ textIndent: '2em' }}>1号楼：师范学院1号楼与食堂相连，一层为小食堂，旁边隔着的楼为大食堂。二三四层主要是一些自主实践教室，主要供心理系和教育信息技术系学习。五六层几乎都为计算机教室。主要供教育信息技术系学习以及其他专业计算机的学习。同样1号楼可以直通大阶梯教室，是全校开办晚会的大礼堂。大阶梯教室位于食堂上方，同样可以想通。</p>
                <hr />
                <img style={{ width: '100%' }} src={require('./img/1haolou.jpg')} ></img>
              </>
            )
          }
          {
            featureDetails && featureDetails.name === '2号楼' && (
              <>
                <p style={{ textIndent: '2em' }}>2号楼：师范学院2号楼分为东西两楼，在三层的处以上都是相连的。东侧的2号楼有大舞美教室和小阶梯教室。其余都是教务处和办公室。2号楼西侧主要是供各系上课的地点，三层、四层为图书馆，五层为电子借阅室，六七八九十层为教室，有适应大班讲课的大教室，也有适应小班的小教室，还有适应艺术系的艺术教室，同样还有各系教室办公室。</p>
                <hr />
                <img style={{ width: '100%' }} src={require('./img/2haolou.jpg')} ></img>
              </>
            )
          }
          {
            featureDetails && featureDetails.name === '职工宿舍楼' && (
              <>
                <p style={{ textIndent: '2em' }}>3号楼：师范学院3号楼最顶层是一间乒乓球教室，可以供教师和学生们在乒乓球教室进行体育锻炼，大学体育选择乒乓球的同学通常就在此间教室学习。除此之外，学校也会举行一些乒乓球比赛，丰富我们的日常生活。</p>
                <hr />
                <img style={{ width: '100%' }} src={require('./img/3haolou.jpg')} ></img>
              </>
            )
          }
          {
            featureDetails && featureDetails.name === '师生服务部' && (
              <>
                <p style={{ textIndent: '2em' }}>4号楼：师范学院4号楼一层主要有小超市，方便同学们下课后买些小零食放松，同样也有一些生活学习用具，大大减少了同学们的不便。同时一层还有一个医务室，可以快速的解决同学们身体上的不舒服，不用因为身体上的小问题去医院。上层教室多为党课教室，方便党员们开会交流时使用。</p>
                <hr />
                <img style={{ width: '100%' }} src={require('./img/4haolou.jpg')} ></img>
              </>
            )
          }
          {
            featureDetails && featureDetails.name === '宿舍楼' && (
              <>
                <p style={{ textIndent: '2em' }}>5号楼：师范学院5号楼为男生宿舍，男生宿舍一共三层，整体设计的简洁漂亮，为师范学院所有男生居住。在累的时候就可以回到宿舍小憩一会。同样，宿舍里还有自习室，可以供晚上回宿舍还想学习的同学去自习室学习。男生宿舍出口处就挨着学校的小门。</p>
                <hr />
                <img style={{ width: '100%' }} src={require('./img/5haolou.jpg')} ></img>
              </>
            )
          }
          {
            featureDetails && featureDetails.name === '创意实验楼' && (
              <>
                <p style={{ textIndent: '2em' }}>操场：师范学院的操场位于整个学校的中间，但是面积不大，主要由两个篮球场以及外侧一道直线跑道组成。这里除了进行体育课的训练外，很多同学都会在操场进行一些篮球比赛和其他运动训练，可以说，篮球场也是每个学校最具有热血的地方。</p>
                <hr />
                <img style={{ width: '100%' }} src={require('./img/chaochang.jpg')} ></img>
              </>
            )
          }
          {
            featureDetails && featureDetails.name === '安华西里三区交通部宿舍' && (
              <>
                <p style={{ textIndent: '2em' }}>无。</p>
              </>
            )
          }
        </Modal>
        {/* </div> */}
      </div>
    )
  }
}


var Drag = /*@__PURE__*/(function (PointerInteraction) {
  function Drag() {
    PointerInteraction.call(this, {
      handleDownEvent: handleDownEvent,
      handleDragEvent: handleDragEvent,
      handleMoveEvent: handleMoveEvent,
      handleUpEvent: handleUpEvent
    });

    /**
     * @type {import("../src/ol/coordinate.js").Coordinate}
     * @private
     */
    this.coordinate_ = null;

    /**
     * @type {string|undefined}
     * @private
     */
    this.cursor_ = 'pointer';

    /**
     * @type {Feature}
     * @private
     */
    this.feature_ = null;

    /**
     * @type {string|undefined}
     * @private
     */
    this.previousCursor_ = undefined;
  }

  if (PointerInteraction) Drag.__proto__ = PointerInteraction;
  Drag.prototype = Object.create(PointerInteraction && PointerInteraction.prototype);
  Drag.prototype.constructor = Drag;

  return Drag;
}(PointerInteraction));

/**
 * @param {import("../src/ol/MapBrowserEvent.js").default} evt Map browser event.
 * @return {boolean} `true` to start the drag sequence.
 */
function handleDownEvent(evt) {
  var map = evt.map;

  var feature = map.forEachFeatureAtPixel(evt.pixel,
    function (feature) {
      return feature;
    });

  if (feature) {
    this.coordinate_ = evt.coordinate;
    this.feature_ = feature;
  }

  return !!feature;
}


/**
 * @param {import("../src/ol/MapBrowserEvent.js").default} evt Map browser event.
 */
function handleDragEvent(evt) {
  var deltaX = evt.coordinate[0] - this.coordinate_[0];
  var deltaY = evt.coordinate[1] - this.coordinate_[1];

  var geometry = this.feature_.getGeometry();
  geometry.translate(deltaX, deltaY);

  this.coordinate_[0] = evt.coordinate[0];
  this.coordinate_[1] = evt.coordinate[1];
}


/**
 * @param {import("../src/ol/MapBrowserEvent.js").default} evt Event.
 */
function handleMoveEvent(evt) {
  if (this.cursor_) {
    var map = evt.map;
    var feature = map.forEachFeatureAtPixel(evt.pixel,
      function (feature) {
        return feature;
      });
    var element = evt.map.getTargetElement();
    if (feature) {
      if (element.style.cursor != this.cursor_) {
        this.previousCursor_ = element.style.cursor;
        element.style.cursor = this.cursor_;
      }
    } else if (this.previousCursor_ !== undefined) {
      element.style.cursor = this.previousCursor_;
      this.previousCursor_ = undefined;
    }
  }
}


/**
 * @return {boolean} `false` to stop the drag sequence.
 */
function handleUpEvent() {
  this.coordinate_ = null;
  this.feature_ = null;
  return false;
}



export default Geodjango
