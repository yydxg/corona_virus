/* global mars3d Cesium*/
import React, { Component } from 'react';
import {
  Divider, Checkbox, Button, Row, Col,
  DatePicker, Tooltip, Modal, Select, Table, Tag, Card, Form, Input, Icon, Radio, message
} from 'antd'
import styles from './style.less'
import echarts from 'echarts'
import { connect } from 'dva';
import { getCookie, setCookie } from '@/utils/cookie'
import moment from 'moment';

@connect(({ PigDisease, Login }) => ({
  PigDisease, Login
}))
class Cesium_pig_search extends Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      datas: [],
      operateType: 'add',
    }
  }

  componentDidMount() {
    let { dispatch, history } = this.props;
    const login = this.props.Login;
    console.log(this.props)
    this.props.form.resetFields();
    this.props.form.setFieldsValue({
      date: moment("2019-04"), binming: 'ALL'
    })
  }

  delete = (id) => {
    const { dispatch } = this.props
    Modal.confirm({
      title: '删除当前数据吗？',
      onCancel: () => { },
      onOk: () => {
        console.log(id)
        dispatch({
          type: 'PigDisease/deleteImage',
          payload: {
            id
          }
        }).then((re) => {
          if (re.success) {
            dispatch({ type: 'PigDisease/getAllImages' })
          }
        })
      }
    })
  }

  showModal = () => {
    this.setState({ visible: true });
  };
  showUpdateModal = (vid) => {
    const { history } = this.props;
    const { datas } = this.state;
    const { form } = this.formRef.props;
    this.setState({ visible: true, operateType: 'update' });
    let da = datas.find(d => d.id == vid)
    const { id, year, month, shi, xian, binming, yidianzongshu, yigandongwushu, fabinshu, binsishu
      , bushashu, xiaohuishu, jinjimianyishu, zhiliaoshu, yidianleibie, yidianbiaoshi, yangzhiguimo, xinyidianzongshu, fabindongwuzonglei } = da
    form.setFieldsValue({
      id, year, month, shi, xian, binming, yidianzongshu, yigandongwushu, fabinshu, binsishu
      , bushashu, xiaohuishu, jinjimianyishu, zhiliaoshu, yidianleibie, yidianbiaoshi, yangzhiguimo, xinyidianzongshu, fabindongwuzonglei
    })
  }

  handleCancel = () => {
    this.setState({ visible: false });
  };

  handleCreate = () => {
    const { form } = this.formRef.props;
    const { dispatch } = this.props;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
      console.log('Received values of form: ', values);
      const { id } = values;
      if (values && values.id) { //编辑模式
        dispatch({
          type: 'PigDisease/update',
          payload: {
            data: { ...values }
          }
        }).then(r => {
          console.log(r);
          // r.success && dispatch({
          //   type: 'PigDisease/getAllByModule',
          //   payload: {
          //     data: 'shebei'
          //   }
          // })
          form.resetFields();
          this.setState({ visible: false });
        })
      } { //新增模式
        dispatch({
          type: 'PigDisease/save',
          payload: {
            data: { ...values }
          }
        }).then(r => {
          console.log(r);
          // r.success && dispatch({
          //   type: 'Fish/getAllByModule',
          //   payload: {
          //     data: 'shebei'
          //   }
          // })

          form.resetFields();
          this.setState({ visible: false });
        })
      }

    });
  };

  saveFormRef = formRef => {
    this.formRef = formRef;
  };

  showAddModal = () => {
    this.formRef.props.form.resetFields();
    this.setState({ visible: true, operateType: 'add' });
  };

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        this.props.dispatch({
          type: 'PigDisease/findByDateAndBinming',
          payload: {
            ...values,
            date: values.date.format('YYYY-MM')
          }
        }).then(res => {
          const { success, data } = res;
          if (success) {
            this.setState({
              datas: data,
            })

            //绘制柱状图
            this.props.load3DFeatures(data)
          }
        })

      } else {
        message.error('输入参数非法错误！')
      }
    });
  };
  drawZhu = () => {
    const { data } = this.state;

  }

  render() {
    const { datas, operateType } = this.state
    const { getFieldDecorator } = this.props.form;
    return (
      <div>
        <Row style={{ marginBottom: 10 }}>
          <Col span={4} style={{ marginBottom: 20 }}>
            <Button type="primary" shape="round" onClick={this.showAddModal}><Icon type="plus" />添加</Button>
          </Col>
          <Col span={24}>
            <Form layout={'inline'} onSubmit={this.handleSubmit}>
              <Form.Item label="日期：" >
                {getFieldDecorator(`date`, {
                  rules: [
                    {
                      required: true,
                      message: '请输入年月!',
                    },
                  ],
                })(<DatePicker.MonthPicker />)}
              </Form.Item>
              <Form.Item label="病名：" >
                {getFieldDecorator('binming', {
                  rules: [{ required: true, message: '请选择病名!' }],
                })(
                  <Select style={{ width: 150 }}
                    placeholder="请选择病名！"
                  >
                    <Select.Option value="ALL">所有</Select.Option>
                    <Select.Option value="传染性胃肠炎">传染性胃肠炎</Select.Option>
                    <Select.Option value="猪流行性腹泻">猪流行性腹泻</Select.Option>
                    <Select.Option value="布鲁氏菌病">布鲁氏菌病</Select.Option>
                  </Select>
                )}
              </Form.Item>
              <Form.Item >
                <Button type="primary" htmlType="submit">搜索</Button>
              </Form.Item>
            </Form>
          </Col>
        </Row>

        <Card>
          <Table
            rowKey={record => record.id}
            scroll={{ x: 2000, y: 300 }}
            columns={[
              // {
              //   title: '年',
              //   dataIndex: 'year',
              //   fixed: 'left',
              //   key: 'year',
              // },
              // {
              //   title: '月',
              //   dataIndex: 'month',
              //   fixed: 'left',
              //   key: 'month',
              // },
              {
                title: '市',
                dataIndex: 'shi',
                fixed: 'left',
                key: 'shi',
              },
              {
                title: '县',
                dataIndex: 'xian',
                fixed: 'left',
                key: 'xian'
              },
              {
                title: '病名',
                dataIndex: 'binming',
                key: 'binming',
                render: function (text, record) {
                  if (text.indexOf("传染性胃肠炎") > -1) {
                    return <Tag color={'geekblue'} key={'geekblue'}> {text} </Tag>
                  } else if (text.indexOf("猪流行性腹泻") > -1) {
                    return <Tag color={'green'} key={'green'}> {text} </Tag>
                  } else if (text.indexOf("布鲁氏菌病") > -1) {
                    return <Tag color={'yellow'} key={'yellow'}> {text} </Tag>
                  }
                }
              },
              {
                title: '疫点总数',
                dataIndex: 'yidianzongshu',
                key: 'yidianzongshu'
              },
              {
                title: '易感动物数',
                dataIndex: 'yigandongwushu',
                key: 'yigandongwushu',
              },
              {
                title: '发病数',
                dataIndex: 'fabinshu',
                key: 'fabinshu'
              },
              {
                title: '病死数',
                dataIndex: 'binsishu',
                key: 'binsishu'
              },
              {
                title: '扑杀数',
                dataIndex: 'bushashu',
                key: 'bushashu'
              },
              {
                title: '销毁数',
                dataIndex: 'xiaohuishu',
                key: 'xiaohuishu'
              },
              {
                title: '紧急免疫数',
                dataIndex: 'jinjimianyishu',
                key: 'jinjimianyishu'
              },
              {
                title: '治疗数',
                dataIndex: 'zhiliaoshu',
                key: 'zhiliaoshu'
              },
              {
                title: '疫点类别',
                dataIndex: 'yidianleibie',
                key: 'yidianleibie'
              },
              {
                title: '疫点标识',
                dataIndex: 'yidianbiaoshi',
                key: 'yidianbiaoshi'
              },
              {
                title: '养殖规模',
                dataIndex: 'yangzhiguimo',
                key: 'yangzhiguimo'
              },
              {
                title: '新疫点总数',
                dataIndex: 'xinyidianzongshu',
                key: 'xinyidianzongshu'
              },
              {
                title: '发病动物种类',
                dataIndex: 'fabindongwuzonglei',
                key: 'fabindongwuzonglei'
              },
              {
                title: '操作',
                key: 'action',
                fixed: 'right',
                width: 130,
                render: (text, record) => (
                  <span>
                    <a style={{ marginRight: 16 }} onClick={() => this.showUpdateModal(record.id)}>修改</a>
                    <a style={{ marginRight: 16 }} onClick={() => this.delete(record.id)}>删除</a>
                  </span>
                ),
              },
            ]} dataSource={datas} pagination={true} />
        </Card>

        <CollectionCreateForm
          wrappedComponentRef={this.saveFormRef}
          visible={this.state.visible}
          onCancel={this.handleCancel}
          onCreate={this.handleCreate}
          okText={operateType === 'add' ? '添加' : '修改'}
          title={operateType === 'add' ? '添加' : '修改'}
          operateType={operateType}
        />
      </div>
    )
  }
}

const CollectionCreateForm = Form.create({ name: 'form_in_addMovie' })(
  // eslint-disable-next-line
  class extends React.Component {

    render() {
      const { visible, onCancel, onCreate, form, title, okText, operateType } = this.props;
      const { getFieldDecorator } = form;
      const formItemLayout = {
        labelCol: { span: 4 },
        wrapperCol: { span: 18 },
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
            <Form.Item label="年" {...formItemLayout}>
              {getFieldDecorator('year')(<Input disabled={operateType === "add" ? false : true} />)}
            </Form.Item>
            <Form.Item label="月" {...formItemLayout} >
              {getFieldDecorator('month')(<Input disabled={operateType === "add" ? false : true} />)}
            </Form.Item>
            <Form.Item label="市" {...formItemLayout}>
              {getFieldDecorator('shi')(
                <Select defaultValue="兰州市" disabled={operateType === "add" ? false : true}>
                  <Select.Option value="白银市">白银市</Select.Option>
                  <Select.Option value="定西市">定西市</Select.Option>
                  <Select.Option value="甘南州">甘南州</Select.Option>
                  <Select.Option value="嘉峪关市">嘉峪关市</Select.Option>
                  <Select.Option value="金昌市">金昌市</Select.Option>
                  <Select.Option value="酒泉市">酒泉市</Select.Option>
                  <Select.Option value="兰州市">兰州市</Select.Option>
                  <Select.Option value="临夏州">临夏州</Select.Option>
                  <Select.Option value="陇南市">陇南市</Select.Option>
                  <Select.Option value="平凉市">平凉市</Select.Option>
                  <Select.Option value="庆阳市">庆阳市</Select.Option>
                  <Select.Option value="天水市">天水市</Select.Option>
                  <Select.Option value="武威市">武威市</Select.Option>
                  <Select.Option value="张掖市">张掖市</Select.Option>
                </Select>
              )}
            </Form.Item>
            <Form.Item label="县" {...formItemLayout} >
              {getFieldDecorator('xian')(<Input disabled={operateType === "add" ? false : true} />)}
            </Form.Item>
            <Form.Item label="病名" {...formItemLayout} >
              {getFieldDecorator('binming')(
                <Select defaultValue="传染性胃肠炎" disabled={operateType === "add" ? false : true}>
                  <Select.Option value="传染性胃肠炎">传染性胃肠炎</Select.Option>
                  <Select.Option value="猪流行性腹泻">猪流行性腹泻</Select.Option>
                </Select>
              )}
            </Form.Item>
            <Form.Item label="疫点总数" {...formItemLayout}>
              {getFieldDecorator('yidianzongshu', {
                rules: [{ required: true, message: 'please enter 疫点总数 !' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="易感动物数" {...formItemLayout}>
              {getFieldDecorator('yigandongwushu', {
                rules: [{ required: true, message: 'please enter 易感动物数 !' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="发病数" {...formItemLayout}>
              {getFieldDecorator('fabinshu', {
                rules: [{ required: true, message: 'please enter 发病数 !' }],
              })(<Input />)}
            </Form.Item><Form.Item label="病死数" {...formItemLayout}>
              {getFieldDecorator('binsishu', {
                rules: [{ required: true, message: 'please enter 病死数 !' }],
              })(<Input />)}
            </Form.Item><Form.Item label="捕杀数" {...formItemLayout}>
              {getFieldDecorator('bushashu', {
                rules: [{ required: true, message: 'please enter 捕杀数 !' }],
              })(<Input />)}
            </Form.Item>

            <Form.Item label="销毁数" {...formItemLayout}>
              {getFieldDecorator('xiaohuishu', {
                rules: [{ required: true, message: 'please enter 销毁数 !' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="紧急免疫数" {...formItemLayout}>
              {getFieldDecorator('jinjimianyishu', {
                rules: [{ required: true, message: 'please enter 紧急免疫数 !' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="治疗数" {...formItemLayout}>
              {getFieldDecorator('zhiliaoshu', {
                rules: [{ required: true, message: 'please enter 治疗数 !' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="疫点标识" {...formItemLayout}>
              {getFieldDecorator('yidianbiaoshi', {
                rules: [{ required: true, message: 'please enter 治疗数 !' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="养殖规模" {...formItemLayout}>
              {getFieldDecorator('yangzhiguimo', {
                rules: [{ required: true, message: 'please enter 养殖规模 !' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="新疫点总数" {...formItemLayout}>
              {getFieldDecorator('xinyidianzongshu', {
                rules: [{ required: true, message: 'please enter 新疫点总数 !' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="发病动物种类" {...formItemLayout}>
              {getFieldDecorator('fabindongwuzonglei', {
                rules: [{ required: true, message: 'please enter 发病动物种类 !' }],
              })(<Input />)}
            </Form.Item>
          </Form>
        </Modal>
      );
    }
  },
);

export default connect()(Form.create({ name: 'home_form' })(Cesium_pig_search))