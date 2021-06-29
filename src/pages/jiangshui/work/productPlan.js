/* global mars3d Cesium*/
import React, { Component } from 'react';
import {
  Divider, Checkbox, Button, Row, Col, Tooltip, DatePicker, Progress,
  Modal, Select, InputNumber, Table, Tag, Card, Form, Input, Icon, Radio, Breadcrumb
} from 'antd'
import styles from './style.less'
import echarts from 'echarts'
import { connect } from 'dva';
import { Link } from 'umi'
import { getCookie, setCookie } from '@/utils/cookie'
import { none } from 'ol/centerconstraint';
import zhCN from 'antd/es/date-picker/locale/zh_CN';


@connect(({ Fish, F_Login }) => ({
  Fish, F_Login
}))

class ProductPlan extends Component {

  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      xiadaVisible: false,
      record: null, //点击下达时，保存当前实体
      yangZhiUsers:[],//所有养殖人员
      guige: 'ALL',
      name: '',
      operateType: 'add',
    }
  }

  componentDidMount() {
    let { dispatch, history } = this.props;
    const login = this.props.F_Login;
    dispatch({
      type: 'Fish/getAllByModule',
      payload: {
        data: 'productPlan',
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
                data: 'productPlan'
              }
            })
          }
        })
      }
    })
  }
  songshen = (record, text) => {
    const { dispatch, } = this.props;
    dispatch({
      type: 'Fish/update',
      payload: {
        data: { ...record, module: 'productPlan', v6: text }
      }
    }).then(r => {
      console.log(r);
      r.success && dispatch({
        type: 'Fish/getAllByModule',
        payload: {
          data: 'productPlan'
        }
      })
    })
  }

  xiadaModal = record => {
    const { yangZhiUsers } = this.state
    if(yangZhiUsers.length > 0){
      this.setState({ xiadaVisible: true, record })
      return;
    }

    this.props.dispatch({
      type:'Fish/findByModuleAndV5',
      payload:{
        module:'users',
        v5:'养殖人员'
      },
    }).then(res=>{
      console.log(res)
      res && this.setState({ xiadaVisible: true, record, yangZhiUsers: res.data });
    })
  }

  findByGuige = () => {
    const { guige, name } = this.state
    const { dispatch } = this.props
    console.log(name, guige)

    dispatch({
      type: 'Fish/findByV2AndV3',
      payload: {//v2:姓名。v3:规格
        module: 'productPlan',
        v2: name === '' ? 'ALL' : name,
        v3: guige,
      }
    })
  }

  showAddModal = () => {
    this.formRef.props.form.resetFields();
    this.setState({ visible: true, operateType: 'add' });
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
            data: { ...values, module: 'productPlan', v4: values.v4.format('YYYY-MM-DD') }
          }
        }).then(r => {
          console.log(r);
          r.success && dispatch({
            type: 'Fish/getAllByModule',
            payload: {
              data: 'productPlan'
            }
          })
          form.resetFields();
          this.setState({ visible: false });
        })
      } else { //新增模式
        dispatch({
          type: 'Fish/save',
          payload: {
            data: { ...values, module: 'productPlan', v4: values.v4.format('YYYY-MM-DD'), v5: tempdata.v1, v6: '已创建待送审' }
          }
        }).then(r => {
          console.log(r);
          r.success && dispatch({
            type: 'Fish/getAllByModule',
            payload: {
              data: 'productPlan'
            }
          })

          form.resetFields();
          this.setState({ visible: false });
        })
      }
    });
  };

  xiadaCreate = () => {
    const { record } = this.state;
    const { form } = this.props;
    const { dispatch, } = this.props;
    const { tempdata } = this.props.F_Login
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
      console.log('Received values of form: ', values);
      dispatch({
        type: 'Fish/update',
        payload: {
          data: { ...record, module: 'productPlan', v6: '已下达待完成', v7: values.v7.join(',') }
        }
      }).then(r => {
        console.log(r);
        r.success && dispatch({
          type: 'Fish/getAllByModule',
          payload: {
            data: 'productPlan'
          }
        })
        form.resetFields();
        this.setState({ xiadaVisible: false });
      })
    });
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
    console.log(da)
    const { id, v1, v2, v3, v4, v5, v6,v7 } = da
    form.setFieldsValue({
      id, v1, v2, v3, v5, v6,v7
    })

  }

  onNameChange = e => {
    this.setState({
      name: e.target.value
    })
  }
  onChangeDate = (date, dateString) => {
    console.log(date, dateString);
  }

  render() {
    const { datas } = this.props.Fish
    const { tempdata, role } = this.props.F_Login
    const { operateType, xiadaVisible,yangZhiUsers } = this.state
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
                生产计划
              </Breadcrumb.Item>
            </Breadcrumb>
          </Col>
        </Row>
        <Row style={{ marginBottom: 10 }}>
          <Col offset={2} span={2}>
            {role === '养殖主管'?<Button type="primary" shape="round" onClick={this.showAddModal}><Icon type="plus" />添加</Button>:''}
          </Col>
          <Col offset={10} span={8}>
            <Form layout={"inline"}>
              <Form.Item label="名称" style={{ height: 20 }}>
                <Input
                  placeholder="名称"
                  onChange={this.onNameChange}
                />,
              </Form.Item>
              {/* <Form.Item label="日期范围" style={{ height: 20 }}>
                <DatePicker.RangePicker renderExtraFooter={() => 'extra footer'} onChange={this.onChangeDate} />
              </Form.Item> */}
              <Form.Item>
                <Button type="primary" onClick={this.findByGuige}><Icon type="search" />搜索</Button>
              </Form.Item>
            </Form>
          </Col>
        </Row>

        <Card>
          <Table
            rowKey={record => record.id}
            columns={[
              {
                title: '计划名称',
                dataIndex: 'v1',
                key: 'v1',
              },
              {
                title: '事项',
                dataIndex: 'v2',
                key: 'v2',
              },
              {
                title: '人数（人）',
                dataIndex: 'v3',
                key: 'v3'
              },
              {
                title: '下派人员',
                dataIndex: 'v7',
                key: 'v7',
              },
              {
                title: '截止日期',
                dataIndex: 'v4',
                key: 'v4',
              },
              {
                title: '计划状态',
                dataIndex: 'v6',
                key: 'v6',
                render: function (text, record) {
                  //已创建待审批0，已审批待下达1，已下达待完成2，已完成3
                  if (text === "已创建待送审") {
                    return <Progress width={80} type="circle" strokeColor={{ '0%': '#108ee9', '100%': '#87d068', }} format={percent => `待送审`} percent={10} />
                  } else if (text === "已送审待审批") {
                    return <Progress width={80} type="circle" strokeColor={{ '0%': '#108ee9', '100%': '#87d068', }} format={percent => '待审批'} percent={25} />
                  } else if (text === "已审批待下达") {
                    return <Progress width={80} type="circle" strokeColor={{ '0%': '#108ee9', '100%': '#87d068', }} format={percent => '待下达'} percent={50} />
                  } else if (text === "已下达待完成") {
                    return <Progress width={80} type="circle" strokeColor={{ '0%': '#108ee9', '100%': '#87d068', }} format={percent => '待完成'} percent={75} />
                  } else if (text === "已完成") {
                    return <Progress width={80} type="circle" strokeColor={{ '0%': '#108ee9', '100%': '#87d068', }}  percent={100} />
                  }
                }
              },
              {
                title: '操作',
                key: 'action',
                width: 300,
                render: (text, record) => {
                  if (this.props.F_Login.role === '养殖厂长') {
                    return <span>
                      {record.v6 === "已送审待审批" ? <Button type="link" style={{ marginRight: 16 }} onClick={() => this.songshen(record, '已审批待下达')} >审批</Button> : ''}
                    </span>
                  } else if (this.props.F_Login.role === '养殖主管') {
                    return <span>
                      <Button type="danger" style={{ marginRight: 16 }} onClick={() => this.delete(record.id)} >删除</Button>
                      <Button type="primary" style={{ marginRight: 16 }} onClick={() => this.showUpdateModal(record.id)} >修改</Button>
                      {record.v6 === "已创建待送审" ? <Button type="link" style={{ marginRight: 16 }} onClick={() => this.songshen(record, '已送审待审批')} >送审</Button> : ''}
                      {record.v6 === "已审批待下达" ? <Button type="link" style={{ marginRight: 16 }} onClick={() => this.xiadaModal(record)} >下达</Button> : ''}
                      {record.v6 === "已下达待完成" ? <Button type="link" style={{ marginRight: 16 }} onClick={() => this.songshen(record, '已完成')} >完成</Button> : ''}
                    </span>
                  }
                },
              },
            ]} dataSource={role === '养殖厂长' ? datas.filter(d => d.v6 !== '已创建待送审') : datas.filter(d => d.v5 === tempdata.v1)} pagination={{ pageSize: 5 }} />
        </Card>

        <CollectionCreateForm
          wrappedComponentRef={this.saveFormRef}
          visible={this.state.visible}
          onCancel={this.handleCancel}
          onCreate={this.handleCreate}
          okText={operateType === 'add' ? '添加' : '修改'}
          title={operateType === 'add' ? '添加' : '修改'}
        />

        <Modal
          visible={xiadaVisible}
          title='指派人员'
          okText='确定'
          cancelText="取消"
          onCancel={this.handleCancel}
          onOk={this.xiadaCreate}
        >
          <Form layout="horizontal">
            <Form.Item label="派工给" wrapperCol={{span:18}} labelCol={{ span: 4 }}>
              {this.props.form.getFieldDecorator('v7')(
                <Select
                  mode="tags"
                  size={'default'}
                  placeholder="Please select"
                  // defaultValue={[]}
                  // onChange={handleChange}
                  style={{ width: '100%' }}
                >
                  {
                    yangZhiUsers.map((u,i)=>(
                      <Select.Option key={i} value={u.v1}>{u.v2}</Select.Option>
                    ))
                  }
                </Select>
              )}
            </Form.Item>
          </Form>
        </Modal>
      </div>
    )
  }
}


const CollectionCreateForm = Form.create({ name: 'form_in_addMovie' })(
  // eslint-disable-next-line
  class extends React.Component {

    render() {
      const { visible, onCancel, onCreate, form, title, okText } = this.props;
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
            <Form.Item label="创建的用户userid" {...formItemLayout} style={{ display: 'none' }}>
              {getFieldDecorator('v5')(<Input />)}
            </Form.Item>
            <Form.Item label="状态" {...formItemLayout} style={{ display: 'none' }}>
              {getFieldDecorator('v6')(<Input />)}
            </Form.Item>
            <Form.Item label="下发的人员账号" {...formItemLayout} style={{ display: 'none' }}>
              {getFieldDecorator('v7')(<Input />)}
            </Form.Item>
            <Form.Item label="id" {...formItemLayout} style={{ display: 'none' }}>
              {getFieldDecorator('id')(<Input />)}
            </Form.Item>
            <Form.Item label="计划名称" {...formItemLayout}>
              {getFieldDecorator('v1', {
                rules: [{ required: true, message: 'please enter 计划名称 !' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="事项" {...formItemLayout}>
              {getFieldDecorator('v2', {
                rules: [{ required: true, message: 'please enter 事项 !' }],
              })(<Input.TextArea />)}
            </Form.Item>
            <Form.Item label="人数" {...formItemLayout}>
              {getFieldDecorator('v3', {
                rules: [{ required: true, message: 'please enter 人数 !' }],
              })(<InputNumber min={1} max={20} />)}
            </Form.Item>
            <Form.Item label="截止日期" {...formItemLayout}>
              {getFieldDecorator('v4', {
                rules: [{ type: 'object', required: true, message: 'Please select time!' }],
              })(<DatePicker locale={zhCN} />)}
            </Form.Item>
          </Form>
        </Modal>
      );
    }
  },
);

export default connect()(Form.create()(ProductPlan))


/**
 * v1:计划名称，事项（所属鱼塘，类型，子项，数量），人数，截止日期，userid，状态（已创建待审批0，已审批待下达1，已下达待完成2，已完成3）,v7人员：[account1...]
 */