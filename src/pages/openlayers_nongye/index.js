/* global mars3d Cesium*/
import React, { Component } from 'react';
import { connect } from 'dva';
import { Divider, Checkbox, Button, Row, Col, Tooltip, Modal, Select, Tree, Icon } from 'antd'
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
import { Fill, Stroke, Style } from 'ol/style';
import { toLonLat, fromLonLat, get, getTransform } from 'ol/proj';
import { FullScreen } from 'ol/control';
import filter, { or, like, and, equalTo } from 'ol/format/filter';
import GeoJSON from 'ol/format/GeoJSON';
import { none } from 'ol/centerconstraint';
import { click, pointerMove } from 'ol/events/condition';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';

const { Option, OptGroup } = Select;

var myVectorSource = new VectorSource({
  format: new GeoJSON(),
  loader: function (extent, resolution, projection) {
    var proj = projection.getCode();
    var url = '/nongye/geoserver/nongye/ows?service=WFS&' +
      'version=1.1.0&request=GetFeature&typename=nongye:wusugd&' +
      'outputFormat=application/json&srsname=' + proj + '&' +
      'bbox=' + extent.join(',') + ',' + proj;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    var onError = function () {
      myVectorSource.removeLoadedExtent(extent);
    }
    xhr.onerror = onError;
    xhr.onload = function () {
      if (xhr.status == 200) {
        myVectorSource.addFeatures(
          myVectorSource.getFormat().readFeatures(xhr.responseText));
      } else {
        onError();
      }
    }
    xhr.send();
  },
  strategy: bboxStrategy
});

@connect(({ nongye }) => ({
  nongye
}))

class Nongye extends Component {

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
      //业务图层
      wushuImage: new ImageLayer({
        source: new ImageWMS({
          url: '/nongye/geoserver/nongye/wms',
          params: { 'LAYERS': 'nongye:geotiff_coverage' },
          ratio: 1,
          serverType: 'geoserver',
          crossOrigin: 'anonymous',
        }),
      }),
      wushuBoundary: new ImageLayer({
        source: new ImageWMS({
          url: '/nongye/geoserver/nongye/wms',
          params: { 'LAYERS': 'nongye:wusubound' },
          ratio: 1,
          serverType: 'geoserver',
          crossOrigin: 'anonymous',
        }),
      }),
      wushuCrops: new ImageLayer({
        source: new ImageWMS({
          url: '/nongye/geoserver/nongye/wms',
          params: {
            'LAYERS': 'nongye:wusugd',
            // 'CQL_FILTER': `kind='mianhua'`
          },
          ratio: 1,
          serverType: 'geoserver',
          crossOrigin: 'anonymous',
        }),
      }),
      myVectorLayer: new VectorLayer({
        style: new Style({
          fill: new Fill({ color: 'rgba(0,0,0,0.001)' }),
          // stroke:,
        }),
        source: myVectorSource
      }),


      showChart: false,
      crop_prop: null,//点击地块详细信息
    }
  }

  componentDidMount() {
    this.start()
    this.setState({
      chart: this.refs.chart,
    })
  }

  start = () => {
    this.initMap({
    }).then(() => {
      const { map, wushuCrops, myVectorLayer } = this.state

      //监听动作
      let that = this
      map.on('singleclick', function (evt) {
        var viewResolution = /** @type {number} */ (map.getView().getResolution());
        var url = wushuCrops.getSource().getFeatureInfoUrl(
          evt.coordinate,
          viewResolution,
          'EPSG:3857',
          { 'INFO_FORMAT': 'application/json' }
        );
        if (url) {
          fetch(url)
            .then(function (response) { return response.text(); })
            .then(function (result) {
              let json = JSON.parse(result)
              console.log(json)
              that.setState({
                showChart: false,
                crop_prop: json.features.length > 0 ? json.features[0].properties : null
              })
            });
        }
      });

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

      /** legend部分 */
      // // Update the legend when the resolution changes
      // map.getView().on('change:resolution', (event)=> {
      //   var resolution = event.target.getResolution();
      //   this.updateLegend(resolution);
      // });

    })
  }

  initMap = () => {
    const { arcgisLayer, imagesLayer, digitalLayer, wushuBoundary, wushuImage, wushuCrops, myVectorLayer } = this.state
    arcgisLayer.set('id', 'arcgisLayer')
    arcgisLayer.setVisible(false)
    imagesLayer.set('id', 'imagesLayer')
    imagesLayer.setVisible(true)
    digitalLayer.set('id', 'digitalLayer')
    digitalLayer.setVisible(false)
    wushuImage.set("id", 'wushuImage')
    wushuImage.setVisible(false)
    wushuBoundary.set("id", 'wushuBoundary')
    wushuBoundary.setVisible(false)
    wushuCrops.set("id", 'wushuCrops')
    wushuCrops.setVisible(true)
    return new Promise(resolve => {
      var fullScreenControl = new FullScreen()
      var map = new Map({
        interactions: defaultInteractions().extend([new Drag()]),
        view: new View({
          center: fromLonLat([84.41, 44.60]),
          zoom: 9
        }),
        layers: [
          arcgisLayer,
          imagesLayer,
          digitalLayer,
          wushuImage,
          wushuBoundary,
          wushuCrops,
          myVectorLayer
        ],
        target: 'map'
      });
      map.addControl(fullScreenControl)

      //监听单击选择
      var select = new SelectInteraction({
        condition: click,
      });
      map.addInteraction(select);
      select.on('select', function (e) {
        console.log(e.target.getFeatures())
      })

      this.setState({
        map
      }, () => {
        resolve()
      })
    })
  };

  //定位
  location = () => {
    const { map } = this.state
    let bmap = new BMap.Map("allmap");

    var geolocation = new BMap.Geolocation();
    geolocation.getCurrentPosition(function (r) {
      if (this.getStatus() == BMAP_STATUS_SUCCESS) {
        // alert('您的位置：'+r.point.lng+','+r.point.lat);
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
    const { wushuCrops, wushuImage, wushuBoundary } = this.state
    //显示隐藏图层数据
    if (checkedKeys.includes("wushu")) {//两者皆有
      wushuImage.setVisible(true)
      wushuBoundary.setVisible(true)
    } else if (checkedKeys.includes("image")) { //只有影像
      wushuImage.setVisible(true)
      wushuBoundary.setVisible(false)
    } else if (checkedKeys.includes("boundary")) { //只有边界
      wushuImage.setVisible(false)
      wushuBoundary.setVisible(true)
    } else {
      wushuImage.setVisible(false)
      wushuBoundary.setVisible(false)
    }

    //过滤crops业务图层要素数据
    let p = ''
    checkedKeys.forEach(element => {
      p += "'" + element + "' ,"
    });

    wushuCrops.getSource().updateParams({
      'CQL_FILTER': `kind in ${'(' + p.substr(0, p.length - 1) + ')'}`
    })
    wushuCrops.getSource().refresh()
  };

  getArrDifference = (arr1, arr2) => {
    return arr1.concat(arr2).filter(function (v, i, arr) {
      return arr.indexOf(v) === arr.lastIndexOf(v);
    });
  }

  tongji = () => {
    const { crop_prop } = this.state
    this.setState({
      showChart: true
    }, () => {
      getFromCache("tongjiArea").then(data => {
        if (!data) {
          let result2 = {
            'code': 200,
            'data': {
              'fanqie': 82746210.5222185,
              'mianhua': 1818566061.3177006,
              'qita': 111503912.3123505,
              'shucai': 1997773.6818451101,
              'xiaomai': 42622832.28992709,
              'yumi': 448919835.8091601,
            },
            'message': "",
            'result': "success"
          }
          try {
            this.props.dispatch({
              type: 'nongye/getTongjiArea',
              payload: {},
            }).then(result => {
              setToCache("tongjiArea", result || result2)
              let data = result ? result.data : result2.data
              this.initBar(data)
            })
          } catch {

            setToCache("tongjiArea", result)
            this.initBar(result.data)
          }
        } else {
          this.initBar(data.data)
        }
      })
    })
  }
  wendu = () => {
    this.setState({
      showChart: true
    }, () => {
      echarts.init(document.getElementById('chart')).dispose();
      var myChart = echarts.init(document.getElementById('chart'));
      var timeData = ['2019年1月','2019年2月','2019年3月','2019年4月','2019年5月','2019年6月','2019年7月','2019年8月','2019年9月','2019年10月','2019年11月','2019年12月'
    ,'2020年1月','2020年2月','2020年3月','2020年4月','2020年5月','2020年6月','2020年7月','2020年8月','2020年9月','2020年10月','2020年11月','2020年12月'];

      let option = {
        title: {
          text: '温度/降水量关系图',
          subtext: '',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            animation: false
          }
        },
        legend: {
          data: ['最高温度','最低温度','平均温度', '降水量'],
          left: 10,
          top: 17
        },
        toolbox: {
          feature: {
            dataZoom: {
              yAxisIndex: 'none'
            },
            restore: {},
            saveAsImage: {}
          }
        },
        axisPointer: {
          link: { xAxisIndex: 'all' }
        },
        dataZoom: [
          {
            show: true,
            realtime: true,
            start: 0,
            end: 100,
            xAxisIndex: [0, 1]
          },
          {
            type: 'inside',
            realtime: true,
            start: 0,
            end: 100,
            xAxisIndex: [0, 1]
          }
        ],
        grid: [{
          left: 50,
          right: 50,
          height: '35%'
        }, {
          left: 50,
          right: 50,
          top: '55%',
          height: '35%'
        }],
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            axisLine: { onZero: true },
            data: timeData
          },
          {
            gridIndex: 1,
            type: 'category',
            boundaryGap: false,
            axisLine: { onZero: true },
            data: timeData,
            position: 'top'
          }
        ],
        yAxis: [
          {
            name: '温度(℃)',
            type: 'value',
            max: 35
          },
          {
            gridIndex: 1,
            name: '降水量(M)',
            type: 'value',
            inverse: true
          }
        ],
        series: [
          {
            name: '最高温度',
            type: 'line',
            symbolSize: 8,
            hoverAnimation: false,
            data: [
              -5.143,-1.6,15.424,23.74,27.699,29.518,31.944,33.099,28.327,20.23,13.933,-0.931,-2.019,5.234,16.504,29.025,30.124,31.117,27.66,26.432,23.647,11.364,5.261,-7.768
            ]
          },
          {
            name: '最低温度',
            type: 'line',
            symbolSize: 8,
            hoverAnimation: false,
            data: [
              -25.547,-22.879,-13.833,-0.075,1.856,11.194,13.904,12.322,4.124,-6.822,-18.329,-20.016,-21.141,-18.408,-14.682,0.158,3.23,7.252,10.67,8.48,-1.479,-6.647,-18.861,-24.478,
            ]
          },
          {
            name: '平均温度',
            type: 'line',
            symbolSize: 8,
            hoverAnimation: false,
            data: [
              -14.386,-12.031,1.39,11.619,13.876,19.895,23.219,22.101,16.149,7.318,-4.009,-10.119,-12.331,-6.171,1.407,13.691,17.996,19.314,17.74,17.06,10.344,1.912,-6.546,-15.455
            ]
          },
          {
            name: '降水量',
            type: 'line',
            xAxisIndex: 1,
            yAxisIndex: 1,
            symbolSize: 8,
            hoverAnimation: false,
            data: [
              0.7,1.3,1.5,12.9,11.6,8.7,7,10.8,8.7,3.8,3.5,1.3,0.6,1,3.4,4.1,6.8,9.3,2.79,1.37,3.16,0.4,0.54,0.11
            ]
          }
        ]
      };
      myChart.setOption(option);
    })

  }
  jiangshui = () => {

  }

  initBar = (data) => {
    echarts.init(document.getElementById('chart')).dispose();
    var myChart = echarts.init(document.getElementById('chart'));
    var option = {
      title: {
        text: '农作物面积统计(平方米)'
      },
      tooltip: {},
      xAxis: {
        type: 'category',
        data: ['棉花', '番茄', '蔬菜', '小麦', '玉米', '其他']
      },
      yAxis: {
        type: 'value'
      },
      grid: {
        bottom: '10%',
        left: '3%',
        containLabel: true
      },
      series: [{
        data: [data['mianhua'], data['fanqie'], data['shucai'], data['xiaomai'], data['yumi'], data['qita']],
        type: 'bar'
      }]
    };
    myChart.setOption(option);
  }

  zhangshi = () => {
    const { crop_prop } = this.state
    this.setState({
      showChart: true
    }, () => {
      var myChart = echarts.init(document.getElementById('chart'));
      var option = {
        title: {
          text: '长势'
        },
        tooltip: {},
        xAxis: {
          type: 'category',
          data: ['3月', '5月', '6月', '7月', '8月', '9月', '10月']
        },
        yAxis: {
          type: 'value'
        },
        grid: {
          bottom: '10%',
          containLabel: true
        },
        series: [{
          data: [crop_prop.b1_all_tif, crop_prop.b2_all_tif, crop_prop.b3_all_tif, crop_prop.b4_all_tif
            , crop_prop.b5_all_tif, crop_prop.b6_all_tif, crop_prop.b7_all_tif],
          type: 'line'
        }]
      };
      myChart.setOption(option);
    })

  }

  NDVI = () => {
    const { crop_prop } = this.state
    this.setState({
      showChart: true
    }, () => {
      echarts.init(document.getElementById('chart')).dispose();
      var myChart = echarts.init(document.getElementById('chart'));
      var option = {
        title: {
          text: 'NDVI'
        },
        tooltip: {},
        grid: {
          bottom: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: ['3月12', '4月11', '5月26', '6月20', '7月10', '8月24', '9月3', '10月18']
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          data: [crop_prop.b1_ndvi202, crop_prop.b2_ndvi202, crop_prop.b3_ndvi202, crop_prop.b4_ndvi202
            , crop_prop.b5_ndvi202, crop_prop.b6_ndvi202, crop_prop.b7_ndvi202, crop_prop.b8_ndvi202],
          type: 'line'
        }]
      };
      myChart.setOption(option);
    })
  }

  /* updateLegend1 = () =>{
    const { map } = this.state
    var resolution = map.getView().getResolution();
    this.updateLegend(resolution);
  }

  updateLegend = (resolution) => {
    console.log('legend')
    const { wushuImage } = this.state
    var graphicUrl = wushuImage.getSource().getLegendUrl(resolution);
    var img = document.getElementById('legend');
    img.src = graphicUrl;
  }; */

  render() {
    const { map, chart, crop_prop, showChart } = this.state
    return (
      <div style={{ width: '100%', paddingTop: '80px' }}>
        <div className={styles.layer}>
          <Tree
            checkable
            defaultExpandedKeys={['wushu', 'crops']}
            defaultSelectedKeys={['crops']}
            defaultCheckedKeys={['crops']}
            // onSelect={this.onSelect}
            onCheck={this.onCheck}
          >
            <TreeNode title="乌苏区位图" key="wushu">
              <TreeNode title="影像" key="image"></TreeNode>
              <TreeNode title="边界" key="boundary"></TreeNode>
            </TreeNode>
            <TreeNode title="全部农作物" key="crops">
              <TreeNode title="番茄" key="fanqie"></TreeNode>
              <TreeNode title="棉花" key="mianhua"></TreeNode>
              <TreeNode title="蔬菜" key="shucai"></TreeNode>
              <TreeNode title="小麦" key="xiaomai"></TreeNode>
              <TreeNode title="玉米" key="yumi"></TreeNode>
              <TreeNode title="其他" key="qita"></TreeNode>
            </TreeNode>
          </Tree>
          <Divider orientation="right"><a onClick={this.tongji}>统计面积</a></Divider>
          <Divider orientation="right"><a onClick={this.wendu}>温度降水走势</a></Divider>
          {/* <Divider orientation="right"><a onClick={this.jiangshui}>降水走势</a></Divider> */}
          <div className={styles.desc}>
            {crop_prop && (
              <>
                {/* <div className={styles.title}>农作物详情</div> */}
                <Divider orientation="left">农作物详情</Divider>
                <div className={styles.item}><label>乡镇：</label><span>{crop_prop.xiangzhen}</span></div>
                <div className={styles.item}><label>土地：</label><span>{crop_prop.classname}</span></div>
                <div className={styles.item}><label>类型：</label><span>{crop_prop.kind}</span></div>
                <div className={styles.item}><label>面积：</label><span>{crop_prop.Shape_Area}</span></div>
                <div className={styles.item}><label>编码：</label><span>{crop_prop.code}</span></div>
                <Divider orientation="right"><a onClick={this.zhangshi}>查看长势</a></Divider>
                <Divider orientation="right"><a onClick={this.NDVI}>查看NDVI</a></Divider>
              </>
            )
            }
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

          <div className={styles.legend}><img src={require('./img/legend.png')}></img></div>
        </div>
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



export default Nongye
