/* global mars3d Cesium*/
import React, { Component } from 'react';
import {
  Divider, Checkbox, Button, Row, Col, DatePicker, Progress, Drawer, Comment, Avatar,
  Modal, Select, InputNumber, Table, Tag, Card, Form, Input, Icon, Radio, Breadcrumb
} from 'antd'
import styles from './style.less'
import echarts from 'echarts'
import { connect } from 'dva';
import { Link } from 'umi'
import { getCookie, setCookie } from '@/utils/cookie'
import { none } from 'ol/centerconstraint';
import zhCN from 'antd/es/date-picker/locale/zh_CN';
import moment from 'moment';
import {
  G2,
  Chart,
  Geom,
  Axis,
  Tooltip,
  Coord,
  Label,
  Legend,
  View,
  Annotation,
  Shape,
  Facet,
  Util,
  Slider
} from "bizcharts";

//工作记录
@connect(({ Fish, F_Login }) => ({
  Fish, F_Login
}))
class Cost extends Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      allHistory: [
        {"zhan":"蔡甸","month":"month1","val":"50.2"},
        {"zhan":"蔡甸","month":"month2","val":"72.5"},
        {"zhan":"蔡甸","month":"month3","val":"103.1"},
        {"zhan":"蔡甸","month":"month4","val":"140.7"},
        {"zhan":"蔡甸","month":"month5","val":"158.9"},
        {"zhan":"蔡甸","month":"month6","val":"225.7"},
        {"zhan":"蔡甸","month":"month7","val":"155.2"},
        {"zhan":"蔡甸","month":"month8","val":"34.1"},
        {"zhan":"蔡甸","month":"month9","val":"6"},
        {"zhan":"蔡甸","month":"month10","val":"35.8"},
        {"zhan":"蔡甸","month":"month11","val":"41.7"},
        {"zhan":"蔡甸","month":"month12","val":"29.9"},
        {"zhan":"新洲","month":"month1","val":"52.3"},
        {"zhan":"新洲","month":"month2","val":"81.8"},
        {"zhan":"新洲","month":"month3","val":"103.3"},
        {"zhan":"新洲","month":"month4","val":"148.3"},
        {"zhan":"新洲","month":"month5","val":"153.4"},
        {"zhan":"新洲","month":"month6","val":"242.8"},
        {"zhan":"新洲","month":"month7","val":"195.1"},
        {"zhan":"新洲","month":"month8","val":"36.7"},
        {"zhan":"新洲","month":"month9","val":"8.4"},
        {"zhan":"新洲","month":"month10","val":"30.6"},
        {"zhan":"新洲","month":"month11","val":"41.6"},
        {"zhan":"新洲","month":"month12","val":"33.8"},
        {"zhan":"武汉","month":"month1","val":"47.8"},
        {"zhan":"武汉","month":"month2","val":"71.8"},
        {"zhan":"武汉","month":"month3","val":"103.2"},
        {"zhan":"武汉","month":"month4","val":"141"},
        {"zhan":"武汉","month":"month5","val":"158.3"},
        {"zhan":"武汉","month":"month6","val":"228.5"},
        {"zhan":"武汉","month":"month7","val":"157.4"},
        {"zhan":"武汉","month":"month8","val":"34.1"},
        {"zhan":"武汉","month":"month9","val":"6.1"},
        {"zhan":"武汉","month":"month10","val":"35.5"},
        {"zhan":"武汉","month":"month11","val":"41.7"},
        {"zhan":"武汉","month":"month12","val":"29.2"},
        {"zhan":"汉口","month":"month1","val":"44.5"},
        {"zhan":"汉口","month":"month2","val":"65.9"},
        {"zhan":"汉口","month":"month3","val":"90.1"},
        {"zhan":"汉口","month":"month4","val":"135"},
        {"zhan":"汉口","month":"month5","val":"144.9"},
        {"zhan":"汉口","month":"month6","val":"211.8"},
        {"zhan":"汉口","month":"month7","val":"180.7"},
        {"zhan":"汉口","month":"month8","val":"35.7"},
        {"zhan":"汉口","month":"month9","val":"6.9"},
        {"zhan":"汉口","month":"month10","val":"34.5"},
        {"zhan":"汉口","month":"month11","val":"39.8"},
        {"zhan":"汉口","month":"month12","val":"25.9"},
        {"zhan":"江夏","month":"month1","val":"52.7"},
        {"zhan":"江夏","month":"month2","val":"80.9"},
        {"zhan":"江夏","month":"month3","val":"107"},
        {"zhan":"江夏","month":"month4","val":"146.2"},
        {"zhan":"江夏","month":"month5","val":"156.7"},
        {"zhan":"江夏","month":"month6","val":"243.9"},
        {"zhan":"江夏","month":"month7","val":"184.8"},
        {"zhan":"江夏","month":"month8","val":"35.8"},
        {"zhan":"江夏","month":"month9","val":"7.5"},
        {"zhan":"江夏","month":"month10","val":"32.7"},
        {"zhan":"江夏","month":"month11","val":"41.9"},
        {"zhan":"江夏","month":"month12","val":"34.4"},
        {"zhan":"汉南","month":"month1","val":"51.1"},
        {"zhan":"汉南","month":"month2","val":"75.8"},
        {"zhan":"汉南","month":"month3","val":"105.9"},
        {"zhan":"汉南","month":"month4","val":"143.5"},
        {"zhan":"汉南","month":"month5","val":"159.7"},
        {"zhan":"汉南","month":"month6","val":"238.8"},
        {"zhan":"汉南","month":"month7","val":"166.5"},
        {"zhan":"汉南","month":"month8","val":"35.1"},
        {"zhan":"汉南","month":"month9","val":"6.4"},
        {"zhan":"汉南","month":"month10","val":"34.9"},
        {"zhan":"汉南","month":"month11","val":"42.2"},
        {"zhan":"汉南","month":"month12","val":"32"},
        {"zhan":"黄陂","month":"month1","val":"46"},
        {"zhan":"黄陂","month":"month2","val":"67.8"},
        {"zhan":"黄陂","month":"month3","val":"85.7"},
        {"zhan":"黄陂","month":"month4","val":"136.2"},
        {"zhan":"黄陂","month":"month5","val":"141.8"},
        {"zhan":"黄陂","month":"month6","val":"216.1"},
        {"zhan":"黄陂","month":"month7","val":"191.8"},
        {"zhan":"黄陂","month":"month8","val":"40.5"},
        {"zhan":"黄陂","month":"month9","val":"8.2"},
        {"zhan":"黄陂","month":"month10","val":"34"},
        {"zhan":"黄陂","month":"month11","val":"40"},
        {"zhan":"黄陂","month":"month12","val":"26.3"},
        {"zhan":"洪山","month":"month1","val":"49.9"},
        {"zhan":"洪山","month":"month2","val":"77.9"},
        {"zhan":"洪山","month":"month3","val":"102.3"},
        {"zhan":"洪山","month":"month4","val":"144.8"},
        {"zhan":"洪山","month":"month5","val":"153"},
        {"zhan":"洪山","month":"month6","val":"238.5"},
        {"zhan":"洪山","month":"month7","val":"190.4"},
        {"zhan":"洪山","month":"month8","val":"36.2"},
        {"zhan":"洪山","month":"month9","val":"7.6"},
        {"zhan":"洪山","month":"month10","val":"32.1"},
        {"zhan":"洪山","month":"month11","val":"41.2"},
        {"zhan":"洪山","month":"month12","val":"31.8"},
        {"zhan":"华容","month":"month1","val":"50.3"},
        {"zhan":"华容","month":"month2","val":"82"},
        {"zhan":"华容","month":"month3","val":"99.8"},
        {"zhan":"华容","month":"month4","val":"147.3"},
        {"zhan":"华容","month":"month5","val":"148.9"},
        {"zhan":"华容","month":"month6","val":"239.2"},
        {"zhan":"华容","month":"month7","val":"191.1"},
        {"zhan":"华容","month":"month8","val":"35.6"},
        {"zhan":"华容","month":"month9","val":"8.9"},
        {"zhan":"华容","month":"month10","val":"29.3"},
        {"zhan":"华容","month":"month11","val":"41.4"},
        {"zhan":"华容","month":"month12","val":"33.6"},
        {"zhan":"东西湖","month":"month1","val":"50.7"},
        {"zhan":"东西湖","month":"month2","val":"70.6"},
        {"zhan":"东西湖","month":"month3","val":"95.5"},
        {"zhan":"东西湖","month":"month4","val":"138.4"},
        {"zhan":"东西湖","month":"month5","val":"152.8"},
        {"zhan":"东西湖","month":"month6","val":"226.2"},
        {"zhan":"东西湖","month":"month7","val":"188.2"},
        {"zhan":"东西湖","month":"month8","val":"37.2"},
        {"zhan":"东西湖","month":"month9","val":"6.4"},
        {"zhan":"东西湖","month":"month10","val":"34.2"},
        {"zhan":"东西湖","month":"month11","val":"39.9"},
        {"zhan":"东西湖","month":"month12","val":"29.8"},
        {"zhan":"青山","month":"month1","val":"51.5"},
        {"zhan":"青山","month":"month2","val":"75.4"},
        {"zhan":"青山","month":"month3","val":"97"},
        {"zhan":"青山","month":"month4","val":"142.3"},
        {"zhan":"青山","month":"month5","val":"148.8"},
        {"zhan":"青山","month":"month6","val":"235.3"},
        {"zhan":"青山","month":"month7","val":"195.2"},
        {"zhan":"青山","month":"month8","val":"36"},
        {"zhan":"青山","month":"month9","val":"7.9"},
        {"zhan":"青山","month":"month10","val":"32.1"},
        {"zhan":"青山","month":"month11","val":"41.3"},
        {"zhan":"青山","month":"month12","val":"31.7"},
        {"zhan":"团风","month":"month1","val":"47.8"},
        {"zhan":"团风","month":"month2","val":"80.5"},
        {"zhan":"团风","month":"month3","val":"87.6"},
        {"zhan":"团风","month":"month4","val":"143.6"},
        {"zhan":"团风","month":"month5","val":"138.4"},
        {"zhan":"团风","month":"month6","val":"241.7"},
        {"zhan":"团风","month":"month7","val":"207.4"},
        {"zhan":"团风","month":"month8","val":"45.9"},
        {"zhan":"团风","month":"month9","val":"12.4"},
        {"zhan":"团风","month":"month10","val":"27.9"},
        {"zhan":"团风","month":"month11","val":"42.1"},
        {"zhan":"团风","month":"month12","val":"34.5"},
        ],
    }
  }

  componentDidMount() {
    let { dispatch, history } = this.props;
    const login = this.props.F_Login;

    if (login && login.username !== '') {
    } else {
      history.push('/jiangshui/user/login')
    }
  }

  componentWillUnmount = () => {
    this.setState = (state, callback) => {
      return;
    };
  }

  delete = (id) => {
    const { dispatch } = this.props
    Modal.confirm({
      title: '删除数据 ?',
      onCancel: () => { },
      onOk: () => {
        console.log(id)
        dispatch({
          type: 'Fish/delete',
          payload: {
            id
          }
        }).then((re) => {
          if (re.success) {
            dispatch({
              type: 'Fish/getAllByModule',
              payload: {
                data: 'history'
              }
            })
          }
        })
      }
    })
  }

  render() {
    const { tempdata, role } = this.props.F_Login
    const { allHistory } = this.state

    return (
      <div className={styles.cost} style={{ paddingTop: 100 }}>
        <Card style={{minWidth:1000,height: 560,margin: '0 auto',width: '80%'}} hoverable={true} >
          {allHistory.length > 0 &&
            <Chart height={550} data={allHistory} scale={{
              val: {
                min: 0,
              },
            }} autoFit>
              <Legend position='top-left' />
              < Axis name="month" />
              <Axis
                name="val"
                label={{
                  formatter: (val) => `${val}mm`,
                }}
              />
              < Geom type="line" position="month*val" size={2} color={"zhan"} />
              <Geom
                type="point"
                position="month*val"
                size={4}
                shape={"circle"}
                color={"zhan"}
                style={{
                  stroke: "#fff",
                  lineWidth: 1,
                }}
              />
              {/* <Annotation.Text
                position={["50%", "50%"]}
                content="?"
                style={{ fill: 'red' }}
              /> */}
              <Slider />
            </Chart>
          }
        </Card>
      </div>
    )
  }
}


export default connect()(Form.create()(Cost))


/**
 * v1:account,v2:用户名，v3:打卡日期，v4：月份
 */