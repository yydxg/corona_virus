/* global mars3d Cesium*/
import React, { Component } from 'react';
import { Divider, Checkbox, Button, Row, Col, Tooltip, Modal, Select, Table, Tag, Card, Form, Input, Icon, Radio } from 'antd'
import styles from './style.less'
import echarts from 'echarts'
import { connect } from 'dva';
import { getCookie, setCookie } from '@/utils/cookie'


let grids =[{
  level:0,
  size:0.703125,
  scale:'1:279,541,132.0143589',
  tiles:'2 x 1'
},{
  level:1,
  size:0.3515625,
  scale:'1:139,770,566.00717944',
  tiles:'4 x 2'
},{
  level:2,
  size:0.17578125,
  scale:'1:69,885,283.00358972',
  tiles:'8 x 4'
},{
  level:3,
  size:0.087890625,
  scale:'1:34,942,641.50179486',
  tiles:'18 x 8'
},{
  level:4,
  size:0.0439453125,
  scale:'1:156.94754464285717',
  tiles:'32 x 16'
},{
  level:5,
  size:0.02197265625,
  scale:'1:78.47377232142858',
  tiles:'64 x 32'
},{
  level:6,
  size:0.010986328125,
  scale:'1:4,367,830.1877243575',
  tiles:'128 x 64'
}];

class GridSet extends Component {

  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      semester: 'ALL',
    }
  }

  componentDidMount() {
    
  }

  delete = (id) => {
    const { dispatch } = this.props
    Modal.confirm({
      title: '删除当前数据吗？',
      onCancel: () => { },
      onOk: () => {
        console.log(id)
        dispatch({
          type: 'Imagery/deleteStudent',
          payload: {
            id
          }
        }).then((re) => {
          if (re.success) {
            dispatch({ type: 'Imagery/getAllStudents' })
          }
        })
      }
    })
  }

  findBySemester = () => {
    const { semester } = this.state
    const { dispatch } = this.props
    console.log(semester)
    if (semester === "ALL") {
     
    } else {
      
    }

  }

  handleChange = (value) => {
    console.log(`selected ${value}`);
    this.setState({
      semester: value
    })
  }


  showModal = () => {
    this.setState({ visible: true });
  };

  handleCancel = () => {
    this.setState({ visible: false });
  };

  handleCreate = () => {
    const { form } = this.formRef.props;
    const { dispatch } = this.props;
    form.validateFields((err, values) => {
      
    });
  };

  saveFormRef = formRef => {
    this.formRef = formRef;
  };

  render() {
    let role = '' ;
    this.props.Login != undefined ? role = this.props.Login.role : role = 'STUDENT'
    return (
      <div className={styles.student}>

        <WrappedAdvancedSearchForm showModal={this.showModal}/>

        <Card>
          <Table
            rowKey={record => record.id}
            columns={[
              {
                title: '层级level',
                dataIndex: 'level',
                key: 'level',
              },
              {
                title: '像素大小',
                dataIndex: 'size',
                key: 'size',
              },
              {
                title: '比例尺',
                dataIndex: 'scale',
                key: 'scale',
              },
              {
                title:'Tiles',
                dataIndex:'tiles',
                key: 'tiles'
              },
              {
                title: '操作',
                key: 'action',
                render: (text, record) => (
                  <span>
                    <a style={{ marginRight: 16 }} onClick={() => this.delete(record.id)}>删除</a> 
                  </span>
                ),
              },
            ]} dataSource={grids} pagination={true} />
        </Card>

        <CollectionCreateForm
          wrappedComponentRef={this.saveFormRef}
          visible={this.state.visible}
          onCancel={this.handleCancel}
          onCreate={this.handleCreate}
        />

      </div>
    )
  }
}

const CollectionCreateForm = Form.create({ name: 'form_in_addStudent' })(
  // eslint-disable-next-line
  class extends React.Component {
    render() {
      const { visible, onCancel, onCreate, form } = this.props;
      const { getFieldDecorator } = form;
      return (
        <Modal
          visible={visible}
          title="创建一个新切片任务"
          okText="Create"
          onCancel={onCancel}
          onOk={onCreate}
        >
          <Form layout="horizontal">
            <Form.Item label="任务执行线程数">
              {getFieldDecorator('name', {
                rules: [{ required: true, message: '请输入!' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item className="collection-create-form_last-form-item" label="瓦片格式">
              {getFieldDecorator('semester', {
                initialValue: 'DAYI',
              })(
                <Radio.Group>
                  <Radio value="DAYI">image/png</Radio>
                  <Radio value="DASI">image/jpeg</Radio>
                </Radio.Group>,
              )}
            </Form.Item>
            <Form.Item className="collection-create-form_last-form-item" label="切片开始层级">
              {getFieldDecorator('start', {
                initialValue: '',
              })(
                <Radio.Group>
                  <Radio value="DAYI">00</Radio>
                </Radio.Group>,
              )}
            </Form.Item>
            <Form.Item className="collection-create-form_last-form-item" label="切片结束层级">
              {getFieldDecorator('start', {
                initialValue: '',
              })(
                <Radio.Group>
                  <Radio value="DAYI">12</Radio>
                </Radio.Group>,
              )}
            </Form.Item>
            <Form.Item label="四至范围">
              {getFieldDecorator('records')(<Input type="textarea" value={'102.54 30.05 104.53 31.26'} />)}
            </Form.Item>
          </Form>
        </Modal>
      );
    }
  },
);


//form表单
class AdvancedSearchForm extends React.Component {
  state = {
    expand: false,
  };

  // To generate mock Form.Item
  getFields() {
    const count = this.state.expand ? 10 : 6;
    const { getFieldDecorator } = this.props.form;
    let fields = [{label:'名称',place:'gridset—test1'},{label:'描述',place:'测试1'},
    {label:'坐标系',place:'EPSG 4326'},{label:'Gridset',place:'-180,-90,180,90'}
    ,{label:'切片宽（像素）',place:'256'},{label:'切片高（像素）',place:'256'}]
    const children = [];
    for (let i = 0; i < 6; i++) {
      children.push(
        <Col span={8} key={i} style={{ display: i < count ? 'block' : 'none' }}>
          <Form.Item label={fields[i]['label']}>
            {getFieldDecorator(`field-${i}`, {
              rules: [
                {
                  required: true,
                  message: 'Input something!',
                },
              ],
            })(<Input placeholder={fields[i]['place']} />)}
          </Form.Item>
        </Col>,
      );
    }
    return children;
  }

  handleSearch = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      console.log('Received values of form: ', values);
    });
  };

  handleReset = () => {
    this.props.form.resetFields();
  };

  toggle = () => {
    const { expand } = this.state;
    this.setState({ expand: !expand });
  };

  render() {
    return (
      <Form className="ant-advanced-search-form" onSubmit={this.handleSearch}>
        <Row gutter={24}>{this.getFields()}</Row>
        <Row>
          <Col span={24} style={{ textAlign: 'right' }}>
            <Button type="primary" onClick={this.props.showModal}>
              执行
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={this.handleReset}>
              重置
            </Button>
            <a style={{ marginLeft: 8, fontSize: 12 }} onClick={this.toggle}>
              展开 <Icon type={this.state.expand ? 'up' : 'down'} />
            </a>
          </Col>
        </Row>
      </Form>
    );
  }
}
const WrappedAdvancedSearchForm = Form.create({ name: 'advanced_search' })(AdvancedSearchForm);


export default connect()(Form.create()(GridSet))