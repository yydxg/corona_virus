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
      allHistory: [],
    }
  }

  componentDidMount() {
    let { dispatch, history } = this.props;
    const login = this.props.F_Login;
    dispatch({
      type: 'Fish/getAllByModule2',
      payload: {
        data: 'history',
      },
      callback: res => {
        console.log(res)
        if (res.success) {
          let datas = res.data
          let a = datas.map(d => {
            return { ...d, val: parseInt(d.v5) * parseFloat(d.v8) }
          })

          var b = []//记录数组a中的id 相同的下标
          for (var i = 0; i < a.length; i++) {
            for (var j = a.length - 1; j > i; j--) {
              if (a[i].v3 == a[j].v3 && a[i].v7 == a[j].v7) {
                a[i].val = (a[i].val * 1 + a[j].val * 1)
                b.push(j)
              }
            }
          }
          console.log(b)
          for (var k = 0; k < b.length; k++) {
            a.splice(b[k], 1)
          }
          console.log(a)

          this.setState({
            allHistory: a
          })
          return;
        }

      }
    })

    if (login && login.username !== '') {
    } else {
      history.push('/fish/user/login')
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
    const { datas } = this.props.Fish
    const { tempdata, role } = this.props.F_Login
    const { allHistory } = this.state

    return (
      <div className={styles.cost} style={{ paddingTop: 100 }}>
        <Card style={{minWidth:1000,height: 500,margin: '0 auto',width: '80%'}} hoverable={true} >
          {allHistory.length > 0 &&
            <Chart height={400} data={allHistory} scale={{
              val: {
                min: 0,
              },
            }} autoFit>
              <Legend position='top-left' />
              < Axis name="v7" />
              <Axis
                name="val"
                label={{
                  formatter: (val) => `${val}元`,
                }}
              />
              < Geom type="line" position="v7*val" size={2} color={"v3"} />
              <Geom
                type="point"
                position="v7*val"
                size={4}
                shape={"circle"}
                color={"v3"}
                style={{
                  stroke: "#fff",
                  lineWidth: 1,
                }}
              />
              <Annotation.Text
                position={["50%", "50%"]}
                content="?"
                style={{ fill: 'red' }}
              />
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