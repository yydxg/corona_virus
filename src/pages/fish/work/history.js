/* global mars3d Cesium*/
import React, { Component } from 'react';
import {
  Divider, Checkbox, Button, Row, Col, Tooltip, DatePicker, Progress, Drawer, Comment, Avatar,
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

//工作记录
@connect(({ Fish, F_Login }) => ({
  Fish, F_Login
}))
class History extends Component {

  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      drawerVisible: false,
      name: '',
      operateType: 'add',
      products: [],//保存的是个人计划
      dateString: [],//日期搜索保存的起始截止日期
      datas_yutang: [],
    }
  }

  componentDidMount() {
    let { dispatch, history } = this.props;
    const login = this.props.F_Login;
    dispatch({
      type: 'Fish/getAllByModule',
      payload: {
        data: 'history',
      },
      callback: res => {
        console.log(res);
      }
    })
    if (login && login.username !== '') {
    } else {
      history.push('/fish/user/login')
    }

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

  findByNameAndDate = () => {
    const { name, dateString } = this.state
    const { dispatch } = this.props
    console.log(name, dateString)
    if (!dateString || dateString.length === 0) {
      message.warn('请选择日期范围！')
      return;
    }
    dispatch({
      type: 'Fish/findByV2AndDate',
      payload: {//v1:计划名称。v3:规格
        module: 'history',
        v1: name === '' ? 'ALL' : name,
        startDate: dateString[0],
        endDate: dateString[1]
      }
    })
  }

  showAddModal = () => {
    this.formRef.props.form.resetFields();
    const { dispatch } = this.props;

    dispatch({
      type: 'Fish/getAllByModule3',
      payload: {
        data: 'yutang',
      }
    }).then(r => {
      console.log(r);
      const { success, data } = r
      success && this.setState({
        datas_yutang: data,
        visible: true,
        operateType: 'add'
      });
    })
  };

  handleCancel = () => {
    this.setState({ visible: false, xiadaVisible: false });
  };

  handleCreate = () => {
    const { form } = this.formRef.props;
    const { dispatch, } = this.props;
    const { tempdata } = this.props.F_Login
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
      console.log('Received values of form: ', values);
      const { id } = values;
      if (values && values.id) { //编辑模式
        dispatch({
          type: 'Fish/update',
          payload: {
            data: { ...values, module: 'history' }
          }
        }).then(r => {
          console.log(r);
          r.success && dispatch({
            type: 'Fish/getAllByModule',
            payload: {
              data: 'history'
            }
          })
          form.resetFields();
          this.setState({ visible: false });
        })
      } else { //新增模式
        this.isV1Unique(values.v1).then(r => {
          const { success, data } = r
          if (success && data) {
            dispatch({
              type: 'Fish/save',
              payload: {
                data: { ...values, v2:values.v2.join(','), module: 'history', v6: tempdata.v1, v7: moment().format('YYYY-MM-DD') }
              }
            }).then(r => {
              console.log(r);
              r.success && dispatch({
                type: 'Fish/getAllByModule',
                payload: {
                  data: 'history'
                }
              })
              form.resetFields();
              this.setState({ visible: false });
            })
          }
        })
      }
    });
  };

  isV1Unique = (v1) => {
    const { dispatch } = this.props;
    return new Promise((resolve, reject) => {
      dispatch({
        type: 'Fish/isV1Unique',
        payload: {
          module: 'history',
          v1
        }
      }).then(r => {
        resolve(r)
      })
    })
  }
  saveFormRef = formRef => {
    this.formRef = formRef;
  };

  showUpdateModal = (vid) => {
    const { history } = this.props;
    const { datas } = this.props.Fish;
    const { form } = this.formRef.props;
    // history.push("./movie/comments?name=" + name)
    this.setState({ visible: true, operateType: 'update' });
    let da = datas.find(d => d.id == vid)
    const { id, v1, v2, v3, v4, v5, v6, v7, v8 } = da
    form.setFieldsValue({
      id, v1, v2, v3, v5, v6, v7, v8
    })
  }

  showDrawer = () => {
    console.log(this.props.F_Login.tempdata.v1)
    this.props.dispatch({
      type: 'Fish/findV7Like',
      payload: {
        module: 'productPlan',
        account: this.props.F_Login.tempdata.v1
      }
    }).then(res => {
      if (res && res.success) {

        this.setState({
          drawVisible: !this.state.drawVisible,
          products: res.data
        });
      }
    })

  };
  onClose = () => {
    this.setState({
      drawVisible: false,
    });
  };

  onNameChange = e => {
    this.setState({
      name: e.target.value
    })
  }
  onChangeDate = (date, dateString) => {
    console.log(date, dateString);
    this.setState({
      dateString,
    })
  }

  render() {
    const { datas } = this.props.Fish
    const { tempdata, role } = this.props.F_Login
    const { operateType, products } = this.state
    return (
      <div className={styles.Fish} style={{ paddingTop: 100 }}>
        <Row style={{ marginBottom: 10 }}>
          <Col offset={2} span={10}>
            <Breadcrumb>
              <Breadcrumb.Item><Icon type="home" />位置：</Breadcrumb.Item>
              <Breadcrumb.Item>
                <a href="#">信息管理模块</a>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                工作记录
              </Breadcrumb.Item>
            </Breadcrumb>
          </Col>
        </Row>
        <Row style={{ marginBottom: 10 }}>
          <Col offset={2} span={6}>
            {role === '养殖人员' ? (<><Button type="primary" shape="round" onClick={this.showDrawer}><Icon type="vertical-left" />工作计划看板</Button><Button type="primary" shape="round" onClick={this.showAddModal}><Icon type="plus" />添加</Button></>) : ''}
          </Col>
          <Col offset={6} span={16}>
            <Form layout={"inline"}>
              <Form.Item label="鱼塘名称" style={{ height: 20 }}>
                <Input
                  placeholder="鱼塘名称"
                  onChange={this.onNameChange}
                />,
              </Form.Item>
              <Form.Item label="日期范围" style={{ height: 20 }}>
                <DatePicker.RangePicker renderExtraFooter={() => 'extra footer'} onChange={this.onChangeDate} />
              </Form.Item>
              <Form.Item>
                <Button type="primary" onClick={this.findByNameAndDate}><Icon type="search" />搜索</Button>
              </Form.Item>
            </Form>
          </Col>
        </Row>

        <Card>
          <Table
            rowKey={record => record.id}
            columns={[
              {
                title: '所属计划名称',
                dataIndex: 'v1',
                key: 'v1',
              },
              {
                title: '养殖人员',
                dataIndex: 'v6',
                key: 'v6',
              },
              {
                title: '所属鱼塘',
                dataIndex: 'v2',
                key: 'v2',
              },
              {
                title: '类型',
                dataIndex: 'v3',
                key: 'v3'
              },
              {
                title: '子项',
                dataIndex: 'v4',
                key: 'v4'
              },
              {
                title: '数量',
                dataIndex: 'v5',
                key: 'v5',
              },
              {
                title: '单价',
                dataIndex: 'v8',
                key: 'v8',
              },
              {
                title: '日期',
                dataIndex: 'v7',
                key: 'v7',
              },
              {
                title: '操作',
                key: 'action',
                width: 300,
                render: (text, record) => {
                  if (this.props.F_Login.role === '养殖人员' && moment().diff(moment(record.v7)) > 0) {
                    return <span>
                      <Button type="danger" style={{ marginRight: 16 }} onClick={() => this.delete(record.id)} >删除</Button>
                      <Button type="primary" style={{ marginRight: 16 }} onClick={() => this.showUpdateModal(record.id)} >修改</Button>
                    </span>
                  }
                },
              },
            ]} dataSource={role === '养殖主管' ? datas : datas.filter(d => d.v6 === tempdata.v1)} pagination={{ pageSize: 5 }} />
        </Card>

        <CollectionCreateForm
          wrappedComponentRef={this.saveFormRef}
          visible={this.state.visible}
          onCancel={this.handleCancel}
          onCreate={this.handleCreate}
          okText={operateType === 'add' ? '添加' : '修改'}
          title={operateType === 'add' ? '添加' : '修改'}
          datas_yutang={this.state.datas_yutang}
        />

        <Drawer
          width={800}
          title="个人工作计划"
          placement={'left'}
          closable={true}
          maskClosable={false}
          mask={false}
          onClose={this.onClose}
          visible={this.state.drawVisible}
          style={{ height: '672px', top: '80px' }}
        >
          {
            products.map((p, idx) => {
              return <Comment
                key={idx}
                actions={[
                  <span key="comment-basic-like">
                    <Tooltip title="Like">
                      <Icon
                        type="like"
                        theme={'filled'}
                      />
                    </Tooltip>
                    <span style={{ paddingLeft: 8, cursor: 'auto' }}>{parseInt(Math.random() * 10)}</span>
                  </span>,
                  <span key=' key="comment-basic-dislike"'>
                    <Tooltip title="Dislike">
                      <Icon
                        type="dislike"
                        theme={'outlined'}
                      />
                    </Tooltip>
                    <span style={{ paddingLeft: 8, cursor: 'auto' }}>{parseInt(Math.random() * 10)}</span>
                  </span>,
                  <span key="comment-basic-reply-to">Reply to</span>,
                ]}
                author={<a>{p.v5}</a>}
                avatar={
                  <Avatar
                    src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
                    alt="Han Solo"
                  />
                }
                content={
                  <p>
                    {p.v2}
                  </p>
                }
                datetime={
                  <Tooltip title={moment(p.v4).fromNow()}>
                    <span>截止日期：{moment(p.v4).format('YYYY-MM-DD')}</span>
                  </Tooltip>
                }
              />
            })
          }

        </Drawer>
      </div>
    )
  }
}


const CollectionCreateForm = Form.create({ name: 'form_in_addMovie' })(
  // eslint-disable-next-line
  class extends React.Component {

    render() {
      const { visible, onCancel, onCreate, form, title, okText, datas_yutang } = this.props;
      const { getFieldDecorator } = form;
      const formItemLayout = {
        labelCol: { span: 6 },
        wrapperCol: { span: 16 },
      };
      return (
        <Modal
          visible={visible}
          title={title}
          okText={okText}
          cancelText="取消"
          onCancel={onCancel}
          onOk={onCreate}
        >
          <Form layout="horizontal">
            <Form.Item label="保存user" {...formItemLayout} style={{ display: 'none' }}>
              {getFieldDecorator('v6')(<Input />)}
            </Form.Item>
            <Form.Item label="保存日期" {...formItemLayout} style={{ display: 'none' }}>
              {getFieldDecorator('v7')(<Input />)}
            </Form.Item>
            <Form.Item label="id" {...formItemLayout} style={{ display: 'none' }}>
              {getFieldDecorator('id')(<Input />)}
            </Form.Item>
            <Form.Item label="所属工作计划" {...formItemLayout}>
              {getFieldDecorator('v1', {
                rules: [{ required: true, message: 'please enter 所属工作计划名称 !' }],
              })(<Input disabled={title === '修改' ? true : false} />)}
            </Form.Item>
            <Form.Item label="工作的鱼塘" {...formItemLayout}>
              {getFieldDecorator('v2', {
                rules: [{ required: true, message: 'please enter 鱼塘名称 !' }],
              })(<Select
                showSearch
                style={{ width: 315 }}
                placeholder="Select a 鱼塘编号（名称）"
                optionFilterProp="children"
                mode="multiple"
                filterOption={(input, option) =>
                  option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                disabled={title === '修改' ? true : false}
              >
                {
                  datas_yutang.map((d, idx) => (
                    <Select.Option key={idx} value={d.v1}>{'编号：' + d.v1 + ' 名称：' + d.v2}</Select.Option>
                  ))
                }
              </Select>)}
            </Form.Item>
            <Form.Item label="工作类型" {...formItemLayout}>
              {getFieldDecorator('v3', {
                rules: [{ required: true, message: 'please enter 工作类型 !' }],
              })(
                <Select style={{ width: 120 }}>
                  <Select.Option value="放养">放养</Select.Option>
                  <Select.Option value="投料">投料</Select.Option>
                  <Select.Option value="投药">投药</Select.Option>
                  <Select.Option value="捕获">捕获</Select.Option>
                  <Select.Option value="检测水质">检测水质</Select.Option>
                  <Select.Option value="使用设备">使用设备</Select.Option>
                </Select>
              )}
            </Form.Item>
            <Form.Item label="子项" {...formItemLayout}>
              {getFieldDecorator('v4', {
                rules: [{ required: true, message: 'please enter 子项 !' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="数量" {...formItemLayout}>
              {getFieldDecorator('v5', {
                rules: [{ required: true, message: 'please enter 数量 !' }],
              })(<InputNumber min={1} max={10000} />)}
            </Form.Item>
            <Form.Item label="单价（元）" {...formItemLayout}>
              {getFieldDecorator('v8', {
                rules: [{ required: true, message: 'please enter 单价 !' }],
              })(<InputNumber min="0" max="100000000" step="0.01" />)}
            </Form.Item>
            {/* <Form.Item label="截止日期" {...formItemLayout}>
              {getFieldDecorator('v4', {
                rules: [{ type: 'object', required: true, message: 'Please select time!' }],
              })(<DatePicker locale={zhCN} />)}
            </Form.Item> */}
          </Form>
        </Modal>
      );
    }
  },
);

export default connect()(Form.create()(History))


/**
 * v1:所属工作计划名称，鱼塘，类型，子项，数量，v6:userAccount，日期，价格
 */