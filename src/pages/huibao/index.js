import React, { Component, Fragment } from 'react';
import { Link, withRouter } from 'umi';
import styles from './style.less';
import { Modal, Button, Checkbox, Row, Col, Message, Select, InputNumber, Divider, Tooltip, Table, Tag, Card, Form, Input, Icon, Radio } from 'antd';
import { connect } from 'dva';
import MainCesium from './mainCesium'
import { ModalDrag } from '@/utils/ModalDrag.js';
import { _addDixingtu, _removeDixingtu, _addQiukuaituPolygon, _addQiukuaituLine, _removeQiukuaitu, _removeYanmotu, _addZhujitu, _removeZhujitu, _addYanmotuPolygon, _addYanmotuLine } from './layer'
import ColorPicker from './colorPicker';
import SliderInput from './sliderInput';
import { none } from 'ol/centerconstraint';

const { Option } = Select;

@connect(({ Login, HUIBAO }) => ({
  Login, HUIBAO
}))
class Huibao extends Component {

  state = {
    firstMenu: '首页',
    secondMenu: '',
    scrollTop: 0,

    //模态框显示控制
    dixingtu_visible: false,
    yanmotu_visible: false,
    qiukuaitu_visible: false,
    playRoute_visible: false,
    playDraw_visible: false,
    //丘块图渲染参数
    qiukuaiFillColor: { r: 232, g: 188, b: 39, a: 0 },
    qiukuaiStrokeColor: { r: 255, g: 255, b: 255, a: 1 },
    qiukuaiStrokeWidth: 1,
    qiukuaituDixing_checked: false,
    //淹没图渲染参数
    yanmoFillColor: { r: 30, g: 144, b: 255, a: 0.5 },
    yanmoStrokeColor: { r: 232, g: 188, b: 39, a: 1 },
    yanmoStrokeWidth: 1,
    yanmotuDixing_checked: true,
    //放映模块
    playRoute_speed: 3,
    playRoute_height: 100,
    routeName: '',
    selectRouteId: '',

  };

  componentDidMount() {

    this.props.history.listen(route => {
      this.setState({
        firstMenu: route.pathname.split('\/')[1],
        secondMenu: route.pathname.split('\/')[2],
      });
      //路由变化回到顶部
      document.body.scrollTop = 0;
    })
  }

  exist = () => {
    const { dispatch, history } = this.props
    dispatch({
      type: 'Login/exist'
    }).then(() => {
      history.push('/')
    })
  }
  /** 图层模块 */
  //地形图层控制
  handleDixingOk = e => {
    Pace.start()
    console.log(e);
    const { dixingtu_checked } = this.props.HUIBAO;
    if (dixingtu_checked) {
      _addDixingtu().then(() => {
        Message.info("地形图添加成功！")
        Pace.stop()
      })
    } else {
      _removeDixingtu().then(() => {
        Message.info("地形图已移除！")
        Pace.stop()
      })
    }
    this.setState({
      dixingtu_visible: false,
    });
  };

  handleDixingCancel = e => {
    this.setState({
      dixingtu_visible: false,
    });
  };
  //淹没图层
  handleYanmotuOk = e => {
    Pace.start()
    const { yanmoFillColor, yanmoStrokeColor, yanmoStrokeWidth, yanmotuDixing_checked } = this.state
    const { yanmotu_checked } = this.props.HUIBAO;
    if (yanmotu_checked) {
      _addYanmotuPolygon(
        {
          fillColor: yanmoFillColor,
          strokeColor: yanmoStrokeColor,
          strokeWidth: yanmoStrokeWidth,
          clampToGround: true
        }).then(() => {
          return _addYanmotuLine({
            fillColor: yanmoFillColor,
            strokeColor: yanmoStrokeColor,
            strokeWidth: yanmoStrokeWidth,
            clampToGround: true
          })
        }).then(() => {
          Message.info("淹没图添加成功！")
        })
    } else {
      _removeYanmotu().then(() => {
        Message.info("淹没图已移除！")
      })
    }
    this.setState({
      yanmotu_visible: false,
    }, () => {
      Pace.stop()
    })
  }

  handleYanmoCancel = e => {
    this.setState({
      yanmotu_visible: false,
    })
  }
  //丘块
  handleQiukuaiOk = e => {
    Pace.start()
    const { qiukuaiFillColor, qiukuaiStrokeColor, qiukuaiStrokeWidth, qiukuaituDixing_checked } = this.state
    const { qiukuaitu_checked, zhujitu_checked } = this.props.HUIBAO;
    console.log(zhujitu_checked);
    if (qiukuaitu_checked) {
      _addQiukuaituPolygon(
        {
          fillColor: qiukuaiFillColor,
          strokeColor: qiukuaiStrokeColor,
          strokeWidth: qiukuaiStrokeWidth,
          clampToGround: true
        }).then(() => {
          return _addQiukuaituLine({
            fillColor: qiukuaiFillColor,
            strokeColor: qiukuaiStrokeColor,
            strokeWidth: qiukuaiStrokeWidth,
            clampToGround: true
          })
        }).then(() => {
          Message.info("丘块图添加成功！")
          Pace.stop()
        })
    } else {
      _removeQiukuaitu().then(() => {
        Message.info("丘块图已移除！")
        Pace.stop()
      })
    }
    if (zhujitu_checked) {
      _addZhujitu().then(() => {
        Message.info("注记添加成功！")
        Pace.stop()
      })
    } else {
      _removeZhujitu().then(() => {
        Message.info("注记已移除！")
        Pace.stop()
      })
    }
    this.setState({
      qiukuaitu_visible: false,
    });
  };

  handleQiukuaiCancel = e => {
    console.log(e);
    this.setState({
      qiukuaitu_visible: false,
    });
  };

  onDixingChange = (e) => {
    console.log(`checked = ${e.target.checked}`);
    this.props.dispatch({
      type: 'HUIBAO/setCommon',
      payload: {
        dixingtu_checked: e.target.checked
      }
    })
  }

  onQiukuaiChange = (e) => {
    this.props.dispatch({
      type: 'HUIBAO/setCommon',
      payload: {
        qiukuaitu_checked: e.target.checked
      }
    })
  }

  onZhujiChange = e => {
    this.props.dispatch({
      type: 'HUIBAO/setCommon',
      payload: {
        zhujitu_checked: e.target.checked
      }
    })
  }

  onYanmoChange = (e) => {
    this.props.dispatch({
      type: 'HUIBAO/setCommon',
      payload: {
        yanmotu_checked: e.target.checked
      }
    })
  }

  onQiukuaiDixingChange = (e) => {
    this.setState({
      qiukuaituDixing_checked: e.target.checked,
    })
  }
  setQiukuaiStrokeWidth = val => {
    this.setState({
      qiukuaiStrokeWidth: val
    })
  }
  setQiukuaiStrokeColor = val => {
    this.setState({
      qiukuaiStrokeColor: val
    })
  }
  setQiukuaiFillColor = val => {
    this.setState({
      qiukuaiFillColor: val
    })
  }

  onYanmoDixingChange = (e) => {
    this.setState({
      yanmotuDixing_checked: e.target.checked,
    })
  }
  setYanmoStrokeWidth = val => {
    this.setState({
      yanmoStrokeWidth: val
    })
  }
  setYanmoStrokeColor = val => {
    this.setState({
      yanmoStrokeColor: val
    })
  }
  setYanmoFillColor = val => {
    this.setState({
      yanmoFillColor: val
    })
  }

  /** 放映模块 */
  handlePlayRouteOk = e => {
    const { selectRouteId, playRoute_height, playRoute_speed } = this.state
    const { flyDataArr } = this.props.HUIBAO
    if (selectRouteId.trim() !== '') {
      let draw3DObj = flyDataArr.filter(f => f.id === selectRouteId)[0]
      bxmap.FlyCesium.draw3DObj = draw3DObj.geojson
      bxmap.FlyCesium.showFly3DPathsBy(bxmap.FlyCesium.draw3DObj, playRoute_height, playRoute_speed);
    } else {
      Modal.warning({
        content: '飞行路线不存在！'
      })
    }
  }
  handlePlayRoutePause = e => { //暂停飞行
    // this.setState({ playRoute_visible: false })
    bxmap.FlyCesium.pauseFly3DPaths();
  }
  handlePlayRouteGoon = e => {
    bxmap.FlyCesium.playForwardFly3DPaths();
  }
  handlePlayRouteCancel = e => {
    this.setState({ playRoute_visible: false })
    bxmap.FlyCesium.stopFly3DPaths();//退出飞行
  }
  handlePlayDrawCancel = e => this.setState({ playDraw_visible: false })
  onPlayRouteSpeedChange = val => this.setState({ playRoute_speed: val })
  onPlayRouteHeightChange = val => this.setState({ playRoute_height: val })

  drawRoute = () => {
    if (!bxmap.FlyCesium.drawHelper) {
      // bxmap.FlyCesium.drawHelper = new DrawHelper(bxmap.FlyCesium.cesiumViewer);
      bxmap.FlyCesium.drawHelper = new DrawHelper(window.viewer);
    }
    bxmap.FlyCesium.draw3DObj = bxmap.FlyCesium.DrawFly3DPaths(bxmap.FlyCesium.drawHelper);
    console.log(bxmap.FlyCesium.draw3DObj)
  }
  onRouteNameInputChange = (e) => {
    console.log(e)
    this.setState({
      routeName: e.target.value
    })
  }
  saveNew = () => {
    const { dispatch } = this.props
    const { routeName } = this.state
    if (bxmap.FlyCesium.draw3DObj && bxmap.FlyCesium.isDrawFly) {
      if (routeName.trim() === '') {
        Modal.warning({
          content: '请输入路线名称！'
        })
      } else {
        // var draw3DObj = JSON.stringify(); //将JSON对象转化为JSON字符
        var draw3DObj = bxmap.FlyCesium.draw3DObj
        var flyData = { id: Math.random().toString(36).substr(2), name: routeName, geojson: draw3DObj };
        bxmap.FlyCesium.clearFly3DPaths();
        dispatch({
          type: 'HUIBAO/addFlyData',
          payload: {
            flyData: flyData
          }
        }).then(() => {
          Message.info("保存成功!")
        })
      }
    } else {
      Modal.warning({
        // title: 'This is a warning message',
        content: '设定的漫游路线不存在，请绘制再保存',
      });
    }
  }
  handlePlayRouteChange = val => {
    this.setState({
      selectRouteId: val
    })
  }
  removeRoute = () => {
    const { dispatch } = this.props
    const { flyDataArr } = this.props.HUIBAO
    const { selectRouteId } = this.state
    if (selectRouteId.trim() === '') {
      Message.info("无路线选择！")
    } else {
      Modal.confirm({
        title: '确认删除？',
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          dispatch({
            type: 'HUIBAO/removeFlyData',
            payload: {
              flyDataId: selectRouteId,
            }
          }).then(() => {
            this.setState({
              selectRouteId: flyDataArr.length > 0 ? flyDataArr[0].id : ''
            })
            Message.info("保存成功!")
          })
        }
      });
    }
  }
  removeNew = () => {
    bxmap.FlyCesium.clearFly3DPaths();
  }

  render() {
    // const { username } = this.props.Login
    // const title = <ModalDrag title="标题" />
    const { dixingtu_visible, yanmotu_visible, qiukuaitu_visible,
      qiukuaiStrokeWidth, qiukuaiFillColor, qiukuaiStrokeColor, qiukuaituDixing_checked,
      yanmoStrokeWidth, yanmoFillColor, yanmoStrokeColor, yanmotuDixing_checked,
      playDraw_visible, playRoute_visible, playRoute_speed, playRoute_height, selectRouteId
    } = this.state
    const { dixingtu_checked, yanmotu_checked, qiukuaitu_checked, zhujitu_checked, drawHelper, flyDataArr } = this.props.HUIBAO
    const menuList = [
      {
        key: 'huibao_layer',
        name: '图层',
        disabled: false,
        children: [
          {
            key: 'hb_dixingtu',
            name: '地形图',
            disabled: false,
            callback: () => {
              this.setState({
                dixingtu_visible: true,
              });
            }
          },
          {
            key: 'hb_yanmotu',
            name: '淹没图',
            disabled: false,
            callback: () => {
              this.setState({
                yanmotu_visible: true,
              });
            }
          },
          {
            key: 'hb_qiukuaitu',
            name: '丘块图',
            disabled: false,
            callback: () => {
              this.setState({
                qiukuaitu_visible: true,
              });
            }
          }
        ]
      },
      /* {
        key: 'huibao_model',
        name: '模型库',
        disabled: false,
        children: [
          {
            key: 'build',
            name: '房屋',
            disabled: false,
          }
        ]
      }, */
      {
        key: 'huibao_playRoute',
        name: '放映',
        disabled: false,
        children: [
          {
            key: 'playRoute',
            name: '放映路线',
            disabled: false,
            callback: () => {
              this.setState({
                playRoute_visible: true,
              });
            }
          },
          {
            key: 'playDraw',
            name: '放映绘制',
            disabled: false,
            callback: () => {
              console.log(bxmap.FlyCesium)
              if (!bxmap.FlyCesium.cesiumViewer) {
                bxmap.FlyCesium.Init(window.viewer, drawHelper, 'box');
              }
              this.setState({
                playDraw_visible: true,
              });
            }
          }
        ]
      }
    ];


    return (
      <>
        <div className={styles.box}>
          <div className={styles.nav}>
            <div className={styles.titBox}>
              <p>汇报系统</p>
            </div>
            <ul className={styles.menu}>
              {
                menuList.map((item, key) => (
                  <li key={key} className={this.state.firstMenu === item.key ? styles.active : ''}>
                    <Link className={styles.first} disabled={item.disabled}>{item.name}</Link>
                    {
                      item.children &&
                      <Fragment>
                        {/* style={{height: item.children.length * 50 + 'px'}} */}
                        <div className={styles.secondMenuBg}
                          style={{ height: 60 + 'px' }} />
                        <div className={styles.secondMenu}>
                          {
                            item.children.map((v, k) => (
                              <div className={styles.secondMenuItem} key={k}>
                                {
                                  v.callback &&
                                  <a onClick={v.callback}>{v.name}</a>
                                }
                                {
                                  !v.callback &&
                                  <Link className={this.state.secondMenu === v.key ? styles.active : ''}
                                    disabled={v.disabled}
                                  >{v.name}</Link>
                                }
                              </div>
                            ))
                          }
                        </div>
                      </Fragment>
                    }
                  </li>
                ))
              }
            </ul>
            <div className={styles.personal}>
              <i />
              <p>{this.props.Login ? this.props.Login.username : ''}</p>
              {/* <Button type="link" onClick={this.exist}>退出</Button> */}
            </div>
          </div>
          {/* 图层模块 */}
          <Modal
            title={"地形图层属性"}
            style={{ marginLeft: 10, marginTop: -10 }}
            visible={dixingtu_visible}
            cancelText={'取消'}
            okText={'确定'}
            mask={false}
            maskClosable={false}
            onOk={this.handleDixingOk}
            onCancel={this.handleDixingCancel}
          >
            <p><Checkbox onChange={this.onDixingChange} style={{ paddingLeft: 20 }} checked={dixingtu_checked}> 地形图 </Checkbox></p>
          </Modal>

          <Modal
            title={"淹没图层属性"}
            style={{ marginLeft: 10, marginTop: -10 }}
            bodyStyle={{ height: 230 }}
            visible={yanmotu_visible}
            cancelText={'取消'}
            okText={'确定'}
            mask={false}
            maskClosable={false}
            onOk={this.handleYanmotuOk}
            onCancel={this.handleYanmoCancel}
          >
            <Row>
              <Col offset={1} span={5}>淹没图：</Col>
              <Col span={2}><Checkbox onChange={this.onYanmoChange} checked={yanmotu_checked}></Checkbox></Col>
            </Row>
            {/* <Row style={{marginTop:10}}>
              <Col offset={1} span={5}>是否显示地形：</Col>
              <Col span={2}><Checkbox onChange={this.onYanmoDixingChange} checked={yanmotuDixing_checked}></Checkbox></Col>
            </Row> */}
            <Row style={{ marginTop: 10 }}>
              <Col offset={1} span={5}><span>填充颜色：</span></Col>
              <Col span={15}><ColorPicker onChange={this.setYanmoFillColor} defaultColor={yanmoFillColor} /></Col>
            </Row>

            <Row style={{ marginTop: 10 }}>
              <Col offset={1} span={5}><span>边框颜色：</span></Col>
              <Col span={15}><ColorPicker onChange={this.setYanmoStrokeColor} defaultColor={yanmoStrokeColor} /></Col>
            </Row>
            <Row style={{ marginTop: 10 }}>
              <Col offset={1} span={5}><span>边框宽度：</span></Col>
              <Col span={15}><SliderInput min={0} max={10} step={1} onChange={this.setYanmoStrokeWidth} defaultValue={yanmoStrokeWidth} /></Col>
            </Row>
          </Modal>

          <Modal
            title={"丘块图层属性"}
            style={{ marginLeft: 10, marginTop: -10 }}
            bodyStyle={{ height: 230 }}
            visible={qiukuaitu_visible}
            cancelText={'取消'}
            okText={'确定'}
            mask={false}
            maskClosable={false}
            onOk={this.handleQiukuaiOk}
            onCancel={this.handleQiukuaiCancel}
          >
            <Row>
              <Col offset={1} span={5}>丘块图：</Col>
              <Col span={2}><Checkbox onChange={this.onQiukuaiChange} checked={qiukuaitu_checked}></Checkbox></Col>
            </Row>
            <Row>
              <Col offset={1} span={5}>注 记：</Col>
              <Col span={2}><Checkbox onChange={this.onZhujiChange} checked={zhujitu_checked}></Checkbox></Col>
            </Row>
            {/* <Row style={{ marginTop: 10 }}>
              <Col offset={1} span={5}>是否显示地形：</Col>
              <Col span={2}><Checkbox onChange={this.onQiukuaiDixingChange} checked={qiukuaituDixing_checked}></Checkbox></Col>
            </Row> */}
            <Row style={{ marginTop: 10 }}>
              <Col offset={1} span={5}><span>填充颜色：</span></Col>
              <Col span={15}><ColorPicker onChange={this.setQiukuaiFillColor} defaultColor={qiukuaiFillColor} /></Col>
            </Row>

            <Row style={{ marginTop: 10 }}>
              <Col offset={1} span={5}><span>边框颜色：</span></Col>
              <Col span={15}><ColorPicker onChange={this.setQiukuaiStrokeColor} defaultColor={qiukuaiStrokeColor} /></Col>
            </Row>
            <Row style={{ marginTop: 10 }}>
              <Col offset={1} span={5}><span>边框宽度：</span></Col>
              <Col span={15}><SliderInput min={0} max={10} step={1} onChange={this.setQiukuaiStrokeWidth} defaultValue={qiukuaiStrokeWidth} /></Col>
            </Row>

          </Modal>
          {/* 放映模块 */}
          <Modal
            title={"放映播放属性"}
            style={{ marginLeft: 10, marginTop: -10 }}
            bodyStyle={{ height: 230 }}
            visible={playRoute_visible}
            cancelText={'取消'}
            okText={'确定'}
            mask={false}
            maskClosable={false}
            footer={<><Button onClick={this.handlePlayRoutePause}>暂停</Button>
              <Button onClick={this.handlePlayRouteGoon}>继续</Button>
              <Button type="primary" onClick={this.handlePlayRouteOk}>确定</Button></>}
            onCancel={this.handlePlayRouteCancel}
          >
            <Row>
              <Col offset={1} span={5}>路线选择：</Col>
              <Col span={10}>
                <Select value={selectRouteId} style={{ width: 120 }} onChange={this.handlePlayRouteChange}>
                  {flyDataArr.map(f => {
                    return <Option key={f.id} value={f.id}>{f.name}</Option>
                  })}
                </Select>
              </Col>
            </Row>
            <Row style={{ marginTop: 10 }}>
              <Col offset={1} span={5}>路线高度：</Col>
              <Col span={5}><InputNumber min={0} max={5000} defaultValue={playRoute_height} step={50} onChange={this.onPlayRouteHeightChange} /></Col>
              <Col span={1}>米</Col>
            </Row>
            <Row style={{ marginTop: 10 }}>
              <Col offset={1} span={5}><span>放映速度：</span></Col>
              <Col span={5}><InputNumber min={1} max={50} defaultValue={playRoute_speed} step={1} onChange={this.onPlayRouteSpeedChange} /></Col>
              <Col span={1}>倍</Col>
            </Row>
          </Modal>
          <Modal
            title={"放映绘制属性"}
            className={styles.playDraw}
            style={{ marginLeft: 10, marginTop: -10 }}
            bodyStyle={{ height: 200 }}
            visible={playDraw_visible}
            cancelText={'取消'}
            okText={'确定'}
            mask={false}
            maskClosable={false}
            footer={null}
            onCancel={this.handlePlayDrawCancel}
          >
            <Row>
              <Col offset={1} span={5}>路线选择：</Col>
              <Col span={10}>
                <Select value={selectRouteId} style={{ width: 120 }} onChange={this.handlePlayRouteChange}>
                  {flyDataArr.map(f => {
                    return <Option key={f.id} value={f.id}>{f.name}</Option>
                  })}
                </Select>
              </Col>
              <Col span={8}>
                <Button type="primary" onClick={this.removeRoute}>删除</Button>
              </Col>
            </Row>
            <Row style={{ marginTop: 10 }}>
              <Col offset={1} span={5}>路线名称：</Col>
              <Col span={15}>
                <Input onChange={this.onRouteNameInputChange} />
              </Col>
            </Row>
            <Row>
              <Col offset={3} span={18} style={{ marginTop: 10 }}>
                <Button onClick={this.drawRoute}>新增路线</Button>
                <Button onClick={this.saveNew}>保存新增</Button>
                <Button onClick={this.removeNew}>取消新增</Button>
              </Col>
            </Row>
          </Modal>
          {/* 放开display，可以查看飞行插件功能 */}
          <div id='box' style={{ display: "none" }}></div>
        </div>
        <MainCesium />
      </>
    );
  }
}

export default withRouter(Huibao);

