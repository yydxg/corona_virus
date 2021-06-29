/* global mars3d Cesium*/
import React, { Component } from 'react';
import {
  Divider, Checkbox, Button, Row, Col, Tooltip, message,
  Modal, InputNumber, Select, Table, DatePicker, Tag, Card, Form, Input, Icon, Radio, Breadcrumb
} from 'antd'
import styles from './style.less'
import echarts from 'echarts'
import { connect } from 'dva';
import { Link } from 'umi'
import { getCookie, setCookie } from '@/utils/cookie'
import { none } from 'ol/centerconstraint';
import moment from 'moment';


@connect(({ Fish, F_Login }) => ({
  Fish, F_Login
}))
class Fangyang extends Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      zhuangtai: 'ALL',
      name: '',
      operateType: 'add',
      dateString: [],
      datas: [],//过滤后加工的数据
      datas_yutang:[],//鱼塘
      datas_miaozhong:[],//苗种

    }
  }

  componentDidMount() {
    let { dispatch, history } = this.props;
    const login = this.props.F_Login;

    this.initTable();

    if (login && login.username !== '') {

    } else {
      history.push('/fish/user/login')
    }

  }

  initTable = () => {
    this.props.dispatch({
      type: 'Fish/getAllByModule',
      payload: {
        data: 'fangyang'
      },
      callback: res => {
        const { success, data } = res;
        if (success && data) {
          let dataArr = data.map(d => {
            return { ...d, tem1: moment(d.v7).fromNow() }
          })
          console.log(dataArr)
          this.setState({
            datas: dataArr
          })
        }
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
            this.initTable();
          }
        })
      }
    })
  }

  findBy = () => {
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
        module: 'fangyang',
        v2: name === '' ? 'ALL' : name,
        startDate: dateString[0],
        endDate: dateString[1]
      },
      callback: res => {
        const { success, data } = res;
        if (success && data) {
          let dataArr = data.map(d => {
            return { ...d, tem1: moment(d.v7).fromNow() }
          })
          console.log(dataArr)
          this.setState({
            datas: dataArr
          })
        }
      }
    })
  }

  showAddModal = () => {
    this.formRef.props.form.resetFields();
    const { dispatch } = this.props;
    dispatch({
      type: 'Fish/findModule1AndV1NotInModule2AndV2',
      payload: {
        module1: 'yutang',
        module2: 'fangyang'
      }
    }).then(r => {
      console.log(r);
      const {success:success1, data:data1} = r
      if(success1){
        dispatch({
          type: 'Fish/findByModuleAndV4GreaterThanZero',
          payload: {
            module: 'miaozhong'
          }
        }).then(res => {
          const {success:success2,data:data2} = res
          
          success2 && this.setState({ 
            datas_miaozhong:data2,
            datas_yutang:data1,
            visible: true, 
            operateType: 'add' 
          });
        })
      }
    })
  };

  handleCancel = () => {
    this.setState({ visible: false });
  };

  handleCreate = () => {
    const { form } = this.formRef.props;
    const { dispatch } = this.props;
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
            data: { ...values, module: 'fangyang' }
          }
        }).then(r => {
          console.log(r);
          r.success && this.initTable()
          form.resetFields();
          this.setState({ visible: false });
        })
      } else { //新增模式
        //品种总数
        let total = values.v3.split(',')[1]
        if(total < values.v4){
          message.warn('该鱼苗仓库数量已不足！')
          return;
        }
        let miaozhong_v4 = total-values.v4
        this.isV1Unique(values.v1).then(r => {
          const { success, data } = r
          if (success && data) {
            dispatch({
              type: 'Fish/save',
              payload: {
                data: { ...values, v3: values.v3.split(',')[0], module: 'fangyang', v7: moment().format('YYYY-MM-DD'), v9: tempdata.v2 }
              }
            }).then(r => {
              console.log(r);
              r.success && dispatch({
                type: 'Fish/updateV4',
                payload: {
                  id:values.v3.split(',')[2],
                  v4:miaozhong_v4,
                }
              })

              r.success && this.initTable()

              form.resetFields();
              this.setState({ visible: false });
            })
          } else {
            message.warn("已存在相同放养批次，请重新设置！")
            return;
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
          module: 'fangyang',
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
    this.setState({ visible: true, operateType: 'update' });
    let da = datas.find(d => d.id == vid)
    const { id, v1, v2, v3, v4, v5, v6, v7, v8, v9 } = da
    form.setFieldsValue({
      id, v1, v2, v3, v4, v5, v6, v7, v8, v9
    })

  }
  onChangeDate = (date, dateString) => {
    console.log(date, dateString);
    this.setState({
      dateString,
    })
  }
  onNameChange = e => {
    this.setState({
      name: e.target.value
    })
  }
  render() {
    const { operateType, datas } = this.state
    const { tempdata, role } = this.props.F_Login
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
                放养管理
              </Breadcrumb.Item>
            </Breadcrumb>
          </Col>
        </Row>
        <Row style={{ marginBottom: 10 }}>
          <Col offset={2} span={2}>
            {role === '养殖人员' ? <Button type="primary" shape="round" onClick={this.showAddModal}><Icon type="plus" />添加</Button> : ''}
          </Col>
          <Col offset={4} span={16}>
            <Form layout={"inline"}>
              <Form.Item label="鱼塘编号" style={{ height: 20 }}>
                <Input
                  placeholder="鱼塘编号"
                  onChange={this.onNameChange}
                />,
              </Form.Item>
              <Form.Item label="日期范围" style={{ height: 20 }}>
                <DatePicker.RangePicker renderExtraFooter={() => 'extra footer'} onChange={this.onChangeDate} />
              </Form.Item>
              <Form.Item>
                <Button type="primary" onClick={this.findBy}><Icon type="search" />搜索</Button>
              </Form.Item>
            </Form>
          </Col>
        </Row>

        <Card>
          <Table
            rowKey={record => record.id}
            columns={[
              {
                title: '养殖批次',
                dataIndex: 'v1',
                key: 'v1',
              },
              {
                title: '鱼塘编号',
                dataIndex: 'v2',
                key: 'v2',
              },
              {
                title: '养殖品种',
                dataIndex: 'v3',
                key: 'v3',
              },
              {
                title: '数量',
                dataIndex: 'v4',
                key: 'v4',
              },
              {
                title: '规格',
                dataIndex: 'v5',
                key: 'v5',
              },
              {
                title: '预计放养天数',
                dataIndex: 'v6',
                key: 'v6',
              },
              {
                title: '放养时间',
                dataIndex: 'v7',
                key: 'v7',
              },
              {
                title: '放养人',
                dataIndex: 'v9',
                key: 'v9',
              },
              {
                title: '已放养天数',
                dataIndex: 'tem1',
                key: 'tem1',
              },
              {
                title: '备注信息',
                dataIndex: 'v8',
                key: 'v8',
              },
              {
                title: '操作',
                key: 'action',
                width: 200,
                render: (text, record) => {
                  if (this.props.F_Login.role === '养殖人员') {
                    return <span>
                      <Button type="danger" style={{ marginRight: 16 }} onClick={() => this.delete(record.id)} >删除</Button>
                      <Button type="primary" style={{ marginRight: 16 }} onClick={() => this.showUpdateModal(record.id)} >修改</Button>
                    </span>
                  }
                },
              },
            ]} dataSource={role === '养殖人员' ? datas.filter(d => d.v9 === tempdata.v2) : datas} pagination={{ pageSize: 5 }} />
        </Card>

        <CollectionCreateForm
          wrappedComponentRef={this.saveFormRef}
          visible={this.state.visible}
          onCancel={this.handleCancel}
          onCreate={this.handleCreate}
          okText={operateType === 'add' ? '添加' : '修改'}
          title={operateType === 'add' ? '添加' : '修改'}
          datas_yutang = {this.state.datas_yutang}
          datas_miaozhong = {this.state.datas_miaozhong}
        />
      </div>
    )
  }
}

const CollectionCreateForm = Form.create({ name: 'form_in_addFangyang' })(
  // eslint-disable-next-line
  class extends React.Component {
    render() {
      const { visible, onCancel, onCreate, form, title, okText,datas_yutang,datas_miaozhong } = this.props;
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
            <Form.Item label="id" {...formItemLayout} style={{ display: 'none' }}>
              {getFieldDecorator('id')(<Input />)}
            </Form.Item>
            <Form.Item label="养殖批次" {...formItemLayout}>
              {getFieldDecorator('v1', {
                rules: [{ required: true, message: 'please enter 养殖批次 !' }],
              })(<Input disabled={title === '修改' ? true : false} />)}
            </Form.Item>
            <Form.Item label="鱼塘编号（名称）" {...formItemLayout}>
              {getFieldDecorator('v2', {
                rules: [{ required: true, message: 'please enter 鱼塘编号（名称） !' }],
              })(
                <Select
                  showSearch
                  style={{ width: 200 }}
                  placeholder="Select a 鱼塘编号（名称）"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  disabled={title === '修改' ? true : false}
                >
                  {
                    datas_yutang.map((d,idx)=>(
                      <Option key={idx} value={d.v1}>{'编号：'+d.v1+' 名称：'+ d.v2}</Option>
                    ))
                  }
                </Select>
              )}

            </Form.Item>
            <Form.Item label="养殖品种" {...formItemLayout}>
              {getFieldDecorator('v3', {
                rules: [{ required: true, message: 'please enter 养殖品种 !' }],
              })(
                <Select
                  showSearch
                  style={{ width: 300 }}
                  placeholder="Select a 养殖品种"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  disabled={title === '修改' ? true : false}
                >
                  {
                    datas_miaozhong.map((d,idx)=>(
                      <Option key={idx} value={d.v1+","+d.v4+","+d.id}>{'编号：'+d.v1+' 名称：'+ d.v2+'数量：'+d.v4}</Option>
                    ))
                  }
                </Select>
              )}
            </Form.Item>
            <Form.Item label="数量" {...formItemLayout}>
              {getFieldDecorator('v4', {
                rules: [{ required: true, message: 'please enter 数量 !' }],
              })(<InputNumber min={1} step={1} disabled={title === '修改' ? true : false} />)}
            </Form.Item>
            <Form.Item label="规格" {...formItemLayout}>
              {getFieldDecorator('v5', {
                rules: [{ required: true, message: 'please enter 规格 !' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="预计放养天数" {...formItemLayout}>
              {getFieldDecorator('v6', {
                rules: [{ required: true, message: 'please enter 预计放养天数 !' }],
              })(<InputNumber min={1} step={1} />)}
            </Form.Item>
            <Form.Item label="放养时间" {...formItemLayout} style={{ display: 'none' }}>
              {getFieldDecorator('v7', {
              })(<Input />)}
            </Form.Item>
            <Form.Item label="备注信息" {...formItemLayout}>
              {getFieldDecorator('v8', {
                rules: [{ required: true, message: 'please enter 备注信息 !' }],
              })(<Input.TextArea />)}
            </Form.Item>
            <Form.Item label="放养人" {...formItemLayout} style={{ display: 'none' }}>
              {getFieldDecorator('v9', {
              })(<Input />)}
            </Form.Item>
          </Form>
        </Modal>
      );
    }
  }

);
export default connect()(Form.create()(Fangyang))
/**
 * v1: 养殖批次、鱼塘编号、养殖品种、数量、规格、预计放养天数，备注信息 , [放养人], [放养时间], [已放养天数]
 */