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

// 降雨量信息管理

@connect(({ Fish, F_Login }) => ({
  Fish, F_Login
}))
class Shuizhi extends Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      zhuangtai: 'ALL',
      name: '',
      operateType: 'add',
      dateString: [],
      datas: [],//过滤后加工的数据
      datas_yutang: [],
    }
  }

  componentDidMount() {
    let { dispatch, history } = this.props;
    const login = this.props.F_Login;
    console.log(this.props.F_Login.role)
    this.initTable();

    if (login && login.username !== '') {

    } else {
      history.push('/jiangshui/user/login')
    }

  }

  initTable = () => {
    this.props.dispatch({
      type: 'Fish/getAllByModule',
      payload: {
        data: 'shuizhi'
      },
      callback: res => {
        const { success, data } = res;
        if (success && data) {
          this.setState({
            datas: data
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
    console.log(name)
    dispatch({
      type: 'Fish/findByV2',
      payload: {
        module: 'shuizhi',
        v2: name === '' ? 'ALL' : name,
      },
      callback: res => {
        const { success, data } = res;
        if (success && data) {
          this.setState({
            datas: data
          })
        }
      }
    })
  }


  exportTable = () => {
    const datas = this.state.datas ? this.state.datas : '';//表格数据
    console.log(1,datas)
    var option = {};
    let dataTable = [];
    dataTable = datas
    option.fileName = '降雨量信息'
    console.log(2,dataTable)
    option.datas = [
      {
        sheetData: dataTable,
        sheetName: 'sheet',
        sheetFilter: ['v1','v2','v3','v4','v5','v6','v7','v8','v9','v10','v11','v12','v13','v14'],
        sheetHeader: ['编号', '站点编号', '1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
      }
    ];
    var toExcel = new ExportJsonExcel(option);
    toExcel.saveExcel();
  }

  showAddModal = () => {
    this.formRef.props.form.resetFields();
    const { dispatch } = this.props;
    dispatch({
      type: 'Fish/getAllByModule3',
      payload: {
        data: 'miaozhong',
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
            data: { ...values, module: 'shuizhi' }
          }
        }).then(r => {
          console.log(r);
          r.success && this.initTable()
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
                data: { ...values, module: 'shuizhi' }
              }
            }).then(r => {
              console.log(r);
              r.success && this.initTable()

              form.resetFields();
              this.setState({ visible: false });
            })
          } else {
            message.warn("已存在相同水质检测批次，请重新设置！")
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
          module: 'shuizhi',
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
    const { id, v1, v2, v3, v4, v5, v6, v7, v8, v9, v10 ,v11,v12,v13,v14} = da
    form.setFieldsValue({
      id, v1, v2, v3, v4, v5, v6, v7, v8, v9, v10,v11,v12,v13,v14
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
                <a href="#">数据管理模块</a>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                降雨量信息管理
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
              <Form.Item label="站点编号" style={{ height: 20 }}>
                <Input
                  placeholder="站点编号"
                  onChange={this.onNameChange}
                />,
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
                title: '编号',
                dataIndex: 'v1',
                key: 'v1',
              },
              {
                title: '站点编号',
                dataIndex: 'v2',
                key: 'v2',
              },
              {
                title: '1月',
                dataIndex: 'v3',
                key: 'v3',
              },
              {
                title: '2月',
                dataIndex: 'v4',
                key: 'v4',
              },
              {
                title: '3月',
                dataIndex: 'v5',
                key: 'v5'
              },
              {
                title: '4月',
                dataIndex: 'v6',
                key: 'v6',
              },
              {
                title: '5月',
                dataIndex: 'v7',
                key: 'v7',
              },
              {
                title: '6月',
                dataIndex: 'v8',
                key: 'v8',
              },
              {
                title: '7月',
                dataIndex: 'v9',
                key: 'v9',
              },
              {
                title: '8月',
                dataIndex: 'v10',
                key: 'v10',
              },
              {
                title: '9月',
                dataIndex: 'v11',
                key: 'v11',
              },
              {
                title: '10月',
                dataIndex: 'v12',
                key: 'v12',
              },
              {
                title: '11月',
                dataIndex: 'v13',
                key: 'v13',
              },
              {
                title: '12月',
                dataIndex: 'v14',
                key: 'v14',
              },
              {
                title: '操作',
                key: 'action',
                width: 200,
                render: (text, record) => {
                  return <span>
                    <Button type="danger" style={{ marginRight: 16 }} onClick={() => this.delete(record.id)} >删除</Button>
                    <Button type="primary" style={{ marginRight: 16 }} onClick={() => this.showUpdateModal(record.id)} >修改</Button>
                  </span>
                },
              },
            ]} dataSource={datas} pagination={{ pageSize: 5 }} />
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
      </div>
    )
  }
}

const CollectionCreateForm = Form.create({ name: 'form_in_addFangyang' })(
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
            <Form.Item label="id" {...formItemLayout} style={{ display: 'none' }}>
              {getFieldDecorator('id')(<Input />)}
            </Form.Item>
            <Form.Item label="编号" {...formItemLayout}>
              {getFieldDecorator('v1', {
                rules: [{ required: true, message: 'please enter 编号 !' }],
              })(<Input disabled={title === '修改' ? true : false} />)}
            </Form.Item>
            <Form.Item label="站点编号（名称）" {...formItemLayout}>
              {getFieldDecorator('v2', {
                rules: [{ required: true, message: 'please enter 站点编号（名称） !' }],
              })(<Select
                showSearch
                style={{ width: 200 }}
                placeholder="Select a 站点编号（名称）"
                optionFilterProp="children"
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
            <Form.Item label="1月" {...formItemLayout}>
              {getFieldDecorator('v3', {
                rules: [{ required: true, message: 'please enter 1月 !' }],
              })(<InputNumber min={0} />)}
            </Form.Item>
            <Form.Item label="2月" {...formItemLayout}>
              {getFieldDecorator('v4', {
                rules: [{ required: true, message: 'please enter 2月 !' }],
              })(<InputNumber min={0} />)}
            </Form.Item>
            <Form.Item label="3月" {...formItemLayout}>
              {getFieldDecorator('v5', {
                rules: [{ required: true, message: 'please enter 3月 !' }],
              })(<InputNumber min={0} />)}
            </Form.Item>
            <Form.Item label="4月" {...formItemLayout}>
              {getFieldDecorator('v6', {
                rules: [{ required: true, message: 'please enter !' }],
              })(<InputNumber min={0} />)}
            </Form.Item>
            <Form.Item label="5月" {...formItemLayout}>
              {getFieldDecorator('v7', {
                rules: [{ required: true, message: 'please enter !' }],
              })(<InputNumber min={0} />)}
            </Form.Item>
            <Form.Item label="6月" {...formItemLayout}>
              {getFieldDecorator('v8', {
                rules: [{ required: true, message: 'please enter  !' }],
              })(<InputNumber min={0} />)}
            </Form.Item>
            <Form.Item label="7月" {...formItemLayout}>
              {getFieldDecorator('v9', {
                rules: [{ required: true, message: 'please enter  !' }],
              })(<InputNumber min={0} />)}
            </Form.Item>
            <Form.Item label="8月" {...formItemLayout}>
              {getFieldDecorator('v10', {
                rules: [{ required: true, message: 'please enter  !' }],
              })(<InputNumber min={0} />)}
            </Form.Item>
            <Form.Item label="9月" {...formItemLayout}>
              {getFieldDecorator('v11', {
                rules: [{ required: true, message: 'please enter  !' }],
              })(<InputNumber min={0} />)}
            </Form.Item>
            <Form.Item label="10月" {...formItemLayout}>
              {getFieldDecorator('v12', {
                rules: [{ required: true, message: 'please enter  !' }],
              })(<InputNumber min={0} />)}
            </Form.Item>
            <Form.Item label="11月" {...formItemLayout}>
              {getFieldDecorator('v13', {
                rules: [{ required: true, message: 'please enter  !' }],
              })(<InputNumber min={0} />)}
            </Form.Item>
            <Form.Item label="12月" {...formItemLayout}>
              {getFieldDecorator('v14', {
                rules: [{ required: true, message: 'please enter  !' }],
              })(<InputNumber min={0} />)}
            </Form.Item>
          </Form>
        </Modal>
      );
    }
  }

);
export default connect()(Form.create()(Shuizhi))
/**
 * 编号、站点名称、1月 。。。
 * */