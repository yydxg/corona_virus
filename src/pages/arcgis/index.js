/* global mars3d Cesium coordtransform$*/
import React, { Component } from 'react';
import esriLoader from 'esri-loader';
import {
  Divider, Checkbox, Button, Row, Col, Tooltip, Modal, Select, Table, Tag, Card, Form,
  Input, Icon, Radio, Collapse, Slider, Carousel
} from 'antd'
import styles from './style.less'
import echarts from 'echarts'
import Item from 'antd/lib/list/Item';
import { connect } from 'dva';
import { router } from 'umi';

const { Panel } = Collapse;
const { Option, OptGroup } = Select;

@connect(({ Arcgis }) => ({
  Arcgis
}))

class ArcgisWrap extends Component {
  constructor(props) {
    super(props)
    this.state = {

    }
  }

  componentDidMount() {
    this.initMap()
  }

  componentWillUnmount() {
  }

  initMap = () => {
    esriLoader.loadCss('/js/4.11/main.css');
    // esriLoader.loadCss();
    esriLoader.loadModules([
      'esri/config',
      'esri/Map',
      'esri/views/MapView',
      "esri/layers/FeatureLayer",
      "esri/layers/GraphicsLayer",
      "esri/geometry/geometryEngine",
      "esri/Graphic",
      "esri/geometry/Polygon",
      "esri/geometry/Polyline",
      "esri/views/2d/draw/Draw",
      "esri/views/layers/support/FeatureFilter",
      "esri/tasks/support/Query",
      "esri/identity/IdentityManager",
      "esri/widgets/Zoom",
      "dojo/dom",
      "dojo/domReady"
    // ])
    ], { url: '/js/4.11/dojo/dojo.js'})
      .then(([
              config,
               Map,
               MapView,
               FeatureLayer,
               GraphicsLayer,
               geometryEngine,
               Graphic,
               Polygon,
               Polyline,
               Draw,
               FeatureFilter,
               Query,
               IdentityManager,
               Zoom,
               dom
             ]) => {
        // 配置内部门户的地址
        config.portalUrl = "https://portal.dev.anhouse.com.cn/arcgis"
        let layer = new GraphicsLayer();
        let map = new Map({
          basemap: 'topo-vector',
          //layers: [layer]
        });

        let view = new MapView({ //显示Map实例的2D视图
          container: 'view',
          map: map,
          center: [114.10000, 22.20000],
          zoom: 10,//缩放
          ui: {
            components: []
          },
          popup: {
            autoCloseEnabled: true,
            autoOpenEnabled: false,
            dockEnabled: false,
            dockOptions: {
              buttonEnabled: false,
              breakpoint: false
            },
            actions: []
          }
        });
        let zoom = new Zoom({
          view: view
        });
      }).catch(err => {
          console.error('地图初始化失败', err);
      })
  }

  render() {
    return (
      <div>
        <div id="viewDiv" ref={(viewDiv) => { this.refdiv = viewDiv }}></div>
      </div>
    )
  }
}

export default ArcgisWrap