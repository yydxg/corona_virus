/* global mars3d Cesium*/
import React, { Component } from 'react';
import { Divider, Checkbox, Button, Row, Col, Tooltip, Modal, Select, Card, Radio, Input, Collapse, Table } from 'antd'
import styles from './style.less'
import echarts from 'echarts'
import { connect } from 'dva'

/* openlayers */
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import Feature from 'ol/Feature';
import { OSM, XYZ } from 'ol/source';
import { LineString, Point, Polygon } from 'ol/geom';
import { defaults as defaultInteractions, Pointer as PointerInteraction, Select as SelectInteraction } from 'ol/interaction';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { TileJSON, Vector as VectorSource } from 'ol/source';
import { Fill, Icon, Stroke, Style } from 'ol/style';
import { toLonLat, fromLonLat } from 'ol/proj';
import { FullScreen } from 'ol/control';
import GeoJSON from 'ol/format/GeoJSON';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';


//https://www.csvjson.com/csv2json
const layer1_json = require("./file/xian.json")
const { Option, OptGroup } = Select;
const { Panel } = Collapse;
var selectedFeature = null;

@connect(({ Login }) => ({
  Login
}))

class OpenLayersClass extends Component {

  constructor(props) {
    super(props)
    this.state = {
      map: null,
      chart: null,
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

      layer1: new VectorLayer({
        source: new VectorSource(
          {
            format: new GeoJSON(),
            url: `http://localhost:8081/geoserver/topp/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=topp%3Astates&maxFeatures=50&outputFormat=application%2Fjson`,
            strategy: bboxStrategy
          }
        ),
        style: new Style({
          fill: new Fill({
            color: 'rgba(0, 88,0 , .6)',
          }),
          stroke: new Stroke({
            color: 'rgba(0, 0, 255, 1.0)',
            width: 2
          })
        })
      }),

      layer2: new VectorLayer({
        source: new VectorSource(
          {
            format: new GeoJSON(),
            url: `http://localhost:8081/geoserver/dbmanage/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=dbmanage%3Axianjie_region&maxFeatures=50&outputFormat=application%2Fjson`,
            strategy: bboxStrategy
          }
        ),
        style: new Style({
          stroke: new Stroke({
            color: 'rgba(0, 0, 255, 1.0)',
            width: 2
          })
        })
      }),
      layer3: new VectorLayer({
        source: new VectorSource(
          {
            format: new GeoJSON(),
            url: `http://localhost:8081/geoserver/dbmanage/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=dbmanage%3Axianjie_region&maxFeatures=50&outputFormat=application%2Fjson`,
            strategy: bboxStrategy
          }
        ),
        style: new Style({
          fill: new Fill({
            color: 'rgba(88, 44,0 , .6)',
          }),
          stroke: new Stroke({
            color: 'rgba(0, 255, 0, 1.0)',
            width: 2
          })
        })
      }),

      ModalText: 'Content of the modal',
      chartVisible: false,
      sourceVisible: false,
      confirmLoading: false,

      value: 1,

      layer1_colums: [],
      layer2_colums: [],
      layer3_colums: [],
      layerNames: [{
        flag: 'layer1',
        value: '图层1',
        key_property: 'AdminName',
        downUrl: `http://localhost:8081/geoserver/dbmanage/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=dbmanage%3Axianjie_region&maxFeatures=50&outputFormat=SHAPE-ZIP`,
        colums: [
          {
            title: '姓名',
            dataIndex: 'Name',
            key: 'Name',
          },
          {
            title: 'AdminCode',
            dataIndex: 'AdminCode',
            key: 'AdminCode',
          },
          {
            title: 'AdminName',
            dataIndex: 'AdminName',
            key: 'AdminName',
          },
          {
            title: 'Kind',
            dataIndex: 'Kind',
            key: 'Kind'
          },
        ],
        datas: layer1_json,
      }, {
        flag: 'layer2',
        value: '图层2',
        key_property: 'AdminCode',
        downUrl: `http://localhost:8081/geoserver/tiger/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=tiger%3Agiant_polygon&maxFeatures=50&outputFormat=SHAPE-ZIP`,
        colums: [
          {
            title: '姓名',
            dataIndex: 'Name',
            key: 'Name',
          },
          {
            title: 'Kind',
            dataIndex: 'Kind',
            key: 'Kind'
          },
        ],
        datas: layer1_json,
      }, {
        flag: 'layer3',
        value: '图层3',
        key_property: 'Name',
        colums: [
          {
            title: '姓名',
            dataIndex: 'Name',
            key: 'Name',
          },
          {
            title: 'AdminName',
            dataIndex: 'AdminName',
            key: 'AdminName',
          },
          {
            title: 'Kind',
            dataIndex: 'Kind',
            key: 'Kind'
          },
        ],
        datas: layer1_json,
      }],
      colums: [],
      datas: [],
      activeLayerName: '',
      activeLayer: null,
      key_property: '',
      activeIndex: 0,
    }
  }

  componentDidMount() {
    let { dispatch, history } = this.props;
    const login = this.props.Login;

    if (login && login.username !== '') {
      this.start()
      this.setState({
        chart: this.refs.chart
      })
    } else {
      history.push('/')
    }
  }

  start = () => {
    this.initMap({
    }).then(() => {
    })
  }

  initMap = () => {
    const { arcgisLayer, imagesLayer, digitalLayer, layer1, layer2, layer3 } = this.state
    arcgisLayer.set('id', 'arcgisLayer')
    arcgisLayer.setVisible(false)
    imagesLayer.set('id', 'imagesLayer')
    imagesLayer.setVisible(true)
    digitalLayer.set('id', 'digitalLayer')
    digitalLayer.setVisible(false)
    //业务图层
    layer1.set('id', 'layer1')
    layer1.setVisible(false)
    layer2.set('id', 'layer2')
    layer2.setVisible(false)
    layer3.set('id', 'layer3')
    layer3.setVisible(false)


    return new Promise(resolve => {
      var fullScreenControl = new FullScreen()
      var map = new Map({
        interactions: defaultInteractions().extend([new Drag()]),
        view: new View({
          center: fromLonLat([113.661163, 34.749473]), //郑州
          zoom: 7
        }),
        layers: [
          arcgisLayer,
          imagesLayer,
          digitalLayer,
          layer1,
          layer2,
          layer3,
        ],
        target: 'map'
      });
      map.addControl(fullScreenControl)

      var select = new SelectInteraction();
      map.addInteraction(select);//map加载该控件，默认是激活可用的
      select.on('select', (e) => {
        this._interactionTable(e.selected)
      });

      this.setState({
        map
      })
      resolve()
    })
  };

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

  _interactionTable = (selected) => {
    const { key_property, layerNames } = this.state
    console.log(selected)
    if (selected.length === 0) return;
    var value = selected[0].get(key_property.toLowerCase());
    let item = layerNames.filter(i => i.key_property === key_property)
    console.log(item)
    let selectItem = item[0].datas.filter((i) => {
      return i[key_property] + '' === value
    })
    console.log(selectItem)
    if (selectItem.length > 0) {
      var datas = item[0].datas;
      datas.splice(datas.findIndex(item => item === selectItem[0]), 1);
      datas.unshift(selectItem[0]);
      this.setState({
        datas,
        activeIndex: selectItem[0][key_property]
      })
    }
  }
  onChange = e => {
    const { map, layer1, layer2, layer3, layerNames } = this.state
    console.log('radio checked', e.target.value);
    this.setState({
      value: e.target.value,
    });
    layer1.setVisible(false)
    layer2.setVisible(false)
    layer3.setVisible(false)

    var layers = map.getLayers()
    for (let i = 0; i < layers.getLength(); i++) {
      var id = layers.item(i).get('id')
      if (id === e.target.value) {
        layers.item(i).setVisible(true)
        this.setState({
          activeLayerName: id,
          activeLayer: layers.item(i)
        })
      }
    }
    var item = layerNames.filter((i) => {
      return i.flag === e.target.value
    })
    this.setState({
      colums: item[0].colums,
      datas: item[0].datas,
      key_property: item[0].key_property
    })
    console.log(item)
  };

  clickRow = (e, record) => {
    console.log(e, record)
    const { map, activeLayer, key_property } = this.state
    var features = activeLayer.getSource().getFeatures();
    //console.log(features);
    var value = record[key_property];
    var property = key_property.toLowerCase();
    this._clearSelectByAttribute()
    //实际应用中设置成全局变量
    for (var i = 0, ii = features.length; i < ii; i++) {
      if (features[i].get(property) === value + '') {
        selectedFeature = features[i];
        break;
      }
    }

    selectedFeature && selectedFeature.setStyle(new Style({
      fill: new Fill({
        color: 'rgba(255, 0, 0 , 1)',
      }),
      stroke: new Stroke({
        color: 'rgba(0, 255, 0, 1.0)',
        width: 2
      })
    }));//高亮查询到的feature
    //console.log(selectedFeature.getGeometry().A);//后台输出发现，geometry属性中有一个属性A其实是中心点坐标，但是没有提供获取中心点的方法，.getGeometry().A也可获得中心点
    //console.log(getCenterOfExtent(selectedFeature.getGeometry().getExtent()));//结果同上

    /* var my_view = new View({
        center: this._getCenterOfExtent(selectedFeature.getGeometry().getExtent()),
        zoom: 5
    }); 

    map.setView(my_view);*/
    this.setState({
      activeIndex: record[key_property]//获取点击行的索引
    })
  }

  delete = flag => {
    const { layerNames, activeLayerName, activeLayer } = this.state
    console.log(flag)
    layerNames.splice(layerNames.findIndex(item => item.flag === flag), 1);
    if (flag === activeLayerName) {
      activeLayer.setVisible(false)
      this.setState({
        colums: [],
        datas: [],
      })
    }
    this.setState({
      layerNames,
    })
  }
  download = flag => {
    const { layerNames } = this.state

    let item = layerNames.filter(i => i.flag === flag)
    console.log(item)
    const aElement = document.createElement('a');
    document.body.appendChild(aElement);
    aElement.style.display = 'none';
    aElement.href = item[0].downUrl;
    aElement.download = 'hihi'
    aElement.click();
    document.body.removeChild(aElement);

  }

  _getCenterOfExtent = (Extent) => {
    var X = Extent[0] + (Extent[2] - Extent[0]) / 2;
    var Y = Extent[1] + (Extent[3] - Extent[1]) / 2;
    return [X, Y];
  }

  _clearSelectByAttribute = () => {
    if (selectedFeature != null) {
      selectedFeature.setStyle(null);
      selectedFeature = null;
    }
  }


  render() {
    const { map, datas, colums, layerNames, key_property } = this.state
    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '30px',
    };
    return (
      <div style={{ width: '100%', padding: '100px 0 10px' }}>
        <div className={styles.map} id="map">
          <div className={styles.buttons}>
            <Card>
              <Radio.Group onChange={this.onChange} value={this.state.value}>
                {
                  layerNames.map((item, idx) => {
                    return (
                      <Radio key={idx} style={radioStyle} value={item.flag}>
                        {item.value} &nbsp; &nbsp;
                        <Tooltip placement="top" title={"删除"}>
                          <Button shape="circle" icon="minus" size='small' onClick={() => this.delete(item.flag)} />
                        </Tooltip>
                        <Tooltip placement="top" title={"下载"}>
                          <Button shape="circle" icon="download" size='small' onClick={() => this.download(item.flag)} />
                        </Tooltip>
                      </Radio>
                    )
                  })
                }
              </Radio.Group>
            </Card>
          </div>
          <div className={styles.tables}>
            <Collapse bordered={false}>
              <Panel header="表格" key="1">
                <Table
                  onRow={record => {
                    return {
                      onClick: event => { this.clickRow(event, record) },
                    };
                  }}
                  className={`${styles['l-table-td']}`} //给表格列添加不换行样式
                  rowClassName={(record, index) => {//record代表表格行的内容，index代表行索引
                    //判断索引相等时添加行的高亮样式
                    return record[key_property] === this.state.activeIndex ? `${styles['l-table-row-active']}` : "";
                  }} //表格行点击高亮 
                  rowKey={(record, index) => record.id + index}
                  columns={colums} dataSource={datas} pagination={{ pageSize: 5 }} />
              </Panel>
            </Collapse>
          </div>
          <div className={styles.toolbar}>
            <div className={styles.bar} onClick={this.weixing}>
              {/* <span className="icon iconfont icon-zoomout"></span> */}
              <p>影像</p>
            </div>
            <div className={styles.bar} onClick={this.anhei}>
              {/* <span className="icon iconfont icon-zoomin"></span> */}
              <p>蓝黑</p>
            </div>
            <div className={styles.bar} onClick={this.luwang}>
              {/* <span className="icon iconfont icon-zoomin"></span> */}
              <p>百度</p>
            </div>
          </div>
        </div>
        <div id="chart" ref="chart" style={{ display: 'none' }}></div>
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



export default OpenLayersClass
