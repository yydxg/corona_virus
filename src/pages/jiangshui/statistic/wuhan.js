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
  Interval,
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
      data: [
        {"station":"武汉","year":"2016","month":"8","day":"1","val":"0"},
        {"station":"武汉","year":"2016","month":"8","day":"2","val":"13.9"},
        {"station":"武汉","year":"2016","month":"8","day":"3","val":"2.6"},
        {"station":"武汉","year":"2016","month":"8","day":"4","val":"43.6"},
        {"station":"武汉","year":"2016","month":"8","day":"5","val":"0.5"},
        {"station":"武汉","year":"2016","month":"8","day":"6","val":"68.2"},
        {"station":"武汉","year":"2016","month":"8","day":"7","val":"0.1"},
        {"station":"武汉","year":"2016","month":"8","day":"8","val":"16.5"},
        {"station":"武汉","year":"2016","month":"8","day":"9","val":"0.3"},
        {"station":"武汉","year":"2016","month":"8","day":"10","val":"0"},
        {"station":"武汉","year":"2016","month":"8","day":"11","val":"0"},
        {"station":"武汉","year":"2016","month":"8","day":"12","val":"0"},
        {"station":"武汉","year":"2016","month":"8","day":"13","val":"0"},
        {"station":"武汉","year":"2016","month":"8","day":"14","val":"0"},
        {"station":"武汉","year":"2016","month":"8","day":"15","val":"0"},
        {"station":"武汉","year":"2016","month":"8","day":"16","val":"0"},
        {"station":"武汉","year":"2016","month":"8","day":"17","val":"0"},
        {"station":"武汉","year":"2016","month":"8","day":"18","val":"0"},
        {"station":"武汉","year":"2016","month":"8","day":"19","val":"0"},
        {"station":"武汉","year":"2016","month":"8","day":"20","val":"6.1"},
        {"station":"武汉","year":"2016","month":"8","day":"21","val":"0"},
        {"station":"武汉","year":"2016","month":"8","day":"22","val":"0"},
        {"station":"武汉","year":"2016","month":"8","day":"23","val":"0"},
        {"station":"武汉","year":"2016","month":"8","day":"24","val":"6.7"},
        {"station":"武汉","year":"2016","month":"8","day":"25","val":"4.4"},
        {"station":"武汉","year":"2016","month":"8","day":"26","val":"0.9"},
        {"station":"武汉","year":"2016","month":"8","day":"27","val":"0"},
        {"station":"武汉","year":"2016","month":"8","day":"28","val":"0"},
        {"station":"武汉","year":"2016","month":"8","day":"29","val":"0"},
        {"station":"武汉","year":"2016","month":"8","day":"30","val":"0"},
        {"station":"武汉","year":"2016","month":"8","day":"31","val":"0"},
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

  render() {
    const { tempdata, role } = this.props.F_Login
    const { data } = this.state

    return (
      <div className={styles.cost} style={{ paddingTop: 100 }}>
        <Card style={{ minWidth: 1000, height: 550, margin: '0 auto', width: '80%' }} hoverable={true} >
          {data.length > 0 &&
            <Chart height={500} autoFit data={data} interactions={['active-region']} padding={[30, 30, 30, 50]} >
              <Interval position="day*val" />
              <Axis
                name="day"
                label={{
                  formatter: (val) => `2016-8-${val}`,
                }}
              />
              <Axis
                name="val"
                label={{
                  formatter: (val) => `${val}mm`,
                }}
              />
              <Tooltip shared />
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