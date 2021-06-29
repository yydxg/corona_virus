/* global mars3d Cesium*/
import React, { Component } from 'react';
import {
  Divider, Checkbox, Button, Row, Col, DatePicker, Progress, Drawer, Comment, Avatar, Calendar, Badge,
  Modal, Select, InputNumber, Table, Tag, Card, Form, Input, Icon, Radio, Breadcrumb, message
} from 'antd'
import styles from './style.less'
import echarts from 'echarts'
import { connect } from 'dva';
import { Link } from 'umi'
import { getCookie, setCookie } from '@/utils/cookie'
import { none } from 'ol/centerconstraint';
import zhCN from 'antd/es/date-picker/locale/zh_CN';
import moment from 'moment';
import StaticWorkTime from './staticWorkTime';

//工作记录
@connect(({ Fish, F_Login }) => ({
  Fish, F_Login
}))
class Worktime extends Component {
  constructor(props) {
    super(props)
    this.state = {
      times: moment().format("YYYY-MM-DD HH:mm:ss"),
      visible: false,
      myDaka: [],//个人打卡数据
      staticDaka: [],//所有人的本月打卡数据
    }
  }

  componentDidMount() {
    let { dispatch, history } = this.props;
    const login = this.props.F_Login;
    dispatch({
      type: 'Fish/getAllDakaByModuleAndV1',
      payload: {
        module: 'worktime',
        v1: login.tempdata.v1
      }
    }).then(res => {
      const { success, data } = res;
      if (res.success) {
        this.setState({
          myDaka: data
        })

        if (login.tempdata.v5 === '养殖人员') {
          return;
        }
        //所有人本月打卡数据
        dispatch({
          type: 'Fish/findByV4',
          payload: {
            module: 'worktime',
            v4: login.tempdata.v5 === '养殖厂长' ? '养殖主管' : (login.tempdata.v5 === '养殖主管' ? '养殖人员' : '')
          }
        }).then(res => {
          const { success, data: { v5Distinct, v2Distinct, common } } = res;
          console.log(v5Distinct, v2Distinct, common)

          if (res.success) {
            let arr = [];
            for (let i = 0; i < v5Distinct.length; i++) {
              let f = common.filter(c => c.v5 === v5Distinct[i])
              if (f.length > 0) {
                for (let j = 0; j < v2Distinct.length; j++) {
                  let p = f.filter(c => c.v2 === v2Distinct[j])
                  if(p.length>0){
                    let t = p[0]
                    t.days = p.length;
                    arr.push(t)
                  }
                }
              }
            }
            console.log(arr)
            this.setState({
              staticDaka: arr
            })
          }
        })
      }
    })

    if (login && login.username !== '') {
    } else {
      history.push('/fish/user/login')
    }

    setInterval(() => {
      this.setState({
        times: moment().format('YYYY-MM-DD HH:mm:ss')
      })
    }, 1000)
  }

  daka = () => {
    const { dispatch } = this.props
    const { tempdata } = this.props.F_Login;
    dispatch({
      type: 'Fish/getHasNot',
      payload: {
        data: {
          module: 'worktime',
          v1: tempdata.v1,
          v2: tempdata.v2,
          v3: moment().format("YYYY-MM-DD")
        }
      }
    }).then(res => {
      console.log(res)
      if (res.success) {
        if (res.data && res.data.length > 0) {
          message.warn('今日已打卡了哦！')
          return;
        }
        dispatch({
          type: 'Fish/save',
          payload: {
            data: {
              module: 'worktime',
              v1: tempdata.v1,
              v2: tempdata.v2,
              v3: moment().format("YYYY-MM-DD"),
              v4: tempdata.v5,
              v5: moment().format("YYYY-MM"),
            }
          }
        }).then(res => {
          if (res.success) {
            message.info('打卡成功，祝你有个愉快的一天！')
          }
        })
      } else {
        message.error('服务器错误！')
      }
    })

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

  dateCellRender = value => {
    const { myDaka } = this.state
    let str = value.format('YYYY-MM-DD')
    let has = myDaka.filter(r => r.v3 === str);
    if (has.length > 0) {
      return (
        <Icon type="smile" theme="twoTone" />
        // <Icon type="close-circle" theme="twoTone" />
      );
    }
  }

  monthCellRender = value => {
    return 123 ? (
      <div className="notes-month">
        <span>Backlog number</span>
      </div>
    ) : null;
  }

  render() {
    const { datas } = this.props.Fish
    const { tempdata, role } = this.props.F_Login
    const { times, staticDaka } = this.state
    return (
      <div className={styles.worktime} style={{ paddingTop: 100 }}>
        <Card style={{ width: 600, left: 25, height: 500, position: 'absolute' }} hoverable={true} bodyStyle={{}}>
          <div className={styles.circle} onClick={this.daka}>
            <div className={styles.times}>当前时间：{times}</div>
            <div className={styles.daka}>打卡</div>
          </div>
        </Card>
        <Card style={{ width: 840, right: 25, height: 500, position: 'absolute' }} hoverable={true} bodyStyle={{}}>
          <Calendar dateCellRender={this.dateCellRender} monthCellRender={this.monthCellRender} fullscreen={true} />,
        </Card>
        {
          staticDaka.length > 0 &&
          <Card style={{ marginTop: 500 }}>
            <StaticWorkTime daka={staticDaka} />
          </Card>
        }
      </div>
    )
  }
}


export default connect()(Form.create()(Worktime))


/**
 * v1:account,v2:用户名，v3:打卡日期
 */