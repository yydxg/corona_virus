/*关系型数据库管理多张表，提供数据添加，删除，表删除，下载excel*/
import React, { Component } from 'react';
import { Divider, Checkbox, Button, Row, Col, Tooltip, Modal, Select, Table, Tag, Card, Form, Input,Icon,Radio  } from 'antd'
import styles from './style.less'
import echarts from 'echarts'
import { connect } from 'dva';
import {getCookie,setCookie} from '@/utils/cookie'

@connect(({ Student,Login }) => ({
  Student,Login
}))

class Student extends Component {

  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      semester:'ALL',
    }
  }

  componentDidMount() {
    let { dispatch,history } = this.props;
    const login = this.props.Login;
    
    if(login && login.username !==''){
      dispatch({
        type: 'Student/getAllStudents',
        callback: res => {
          console.log(res);
        }
      })
    }else{
      history.push('/')
    }

  }

  delete = (id) => {
    const {dispatch} = this.props
    Modal.confirm({
      title:'删除当前数据吗？',
      onCancel:()=>{},
      onOk:()=>{
        console.log(id)
        dispatch({
          type:'Student/deleteStudent',
          payload:{
            id
          }
        }).then((re)=>{
          if(re.success){
            dispatch({type: 'Student/getAllStudents'})
          }
        })
      }
    })
  }

  findBySemester = ()=>{
    const {semester} = this.state
    const {dispatch } = this.props
    console.log(semester)
    if(semester === "ALL"){
      dispatch({
        type:'Student/getAllStudents',
      })
    }else{
      dispatch({
        type:'Student/findBySemester',
        payload:{
          data:semester
        }
      })
    }
    
  }

  handleChange=(value) =>{
    console.log(`selected ${value}`);
    this.setState({
      semester:value
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
      if (err) {
        return;
      }
      console.log('Received values of form: ', values);
      dispatch({
        type:'Student/save',
        payload:{
          data:{...values}
        }
      }).then(r=>{
        console.log(r);
        r.success && dispatch({
          type:'Student/getAllStudents'})
        
        form.resetFields();
        this.setState({ visible: false });
      })
    });
  };

  saveFormRef = formRef => {
    this.formRef = formRef;
  };

  rollback = e =>{
    this.props.history.goBack()
  }

  download = () => {
    const aElement = document.createElement('a');
    document.body.appendChild(aElement);
    aElement.style.display = 'none';
    aElement.href = `/api/student/download`;
    aElement.download = 'hihi'
    aElement.click();
    document.body.removeChild(aElement);
  }

  render() {
    const { students } = this.props.Student
    let role = '';
    this.props.Login !=undefined? role =  this.props.Login.role:role='COMMON'
    return (
      <div className={styles.student}>
        <Row>
          <Col span={2}>
          {role==='ADMIN'?<Button type="primary" shape="round" onClick={this.showModal}><Icon type="plus" />添加</Button>:''}
          </Col>
          <Col span={2}>
            <Button type="primary" shape="round" onClick={this.download}><Icon type="download" />下载</Button>
          </Col>
          <Col span={2}>
            <Button type="primary" shape="round" onClick={this.rollback}><Icon type="rollback" />返回</Button>
          </Col>
          <Col offset={18} span={6}>
            <Form layout={"inline"}>
            <Form.Item label="学期">
            <Select defaultValue="All" style={{ width: 120 }} onChange={this.handleChange}>
              <Select.Option value="DAYI">大一</Select.Option>
              <Select.Option value="DAER">大二</Select.Option>
              <Select.Option value="DASAN">大三</Select.Option>
              <Select.Option value="DASI">大四</Select.Option>
            </Select>
            </Form.Item>
            <Form.Item>
              <Button type="primary" onClick={this.findBySemester}><Icon type="search" />确定</Button>
            </Form.Item>
          </Form>
          </Col>
        </Row>
        
    
        <Card>
          <Table
          rowKey = {record =>record.id} 
          columns={[
            {
              title: '姓名',
              dataIndex: 'name',
              key: 'name',
            },
            {
              title: '学期',
              dataIndex: 'semester',
              key: 'semester',
              render:function(text,record) {
                if(text === "DAYI"){
                  return <Tag color={'geekblue'} key={'geekblue'}> 大一 </Tag>
                }else if(text === "DAER"){
                  return <Tag color={'green'} key={'green'}> 大二 </Tag>
                }else if(text === "DASAN"){
                  return <Tag color={'pink'} key={'pink'}> 大三 </Tag>
                }else if(text === "DASI"){
                  return <Tag color={'red'} key={'red'}> 大四 </Tag>
                }
              }
            },
            {
              title: '成绩',
              dataIndex: 'records',
              key: 'records',
              render: (text, record) => (
                <span>
                  <a style={{ marginRight: 16 }}>{text}</a>
                </span>
              ),
            },
            {
              title: '操作',
              key: 'action',
              render: (text, record) => (
                <span>
                 {role==='ADMIN'?<a style={{ marginRight: 16 }} onClick={()=>this.delete(record.id)}>删除</a>:''}
                </span>
              ),
            },
          ]} dataSource={students} pagination={true}/>
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
          title="添加学生信息"
          okText="Create"
          onCancel={onCancel}
          onOk={onCreate}
        >
          <Form layout="vertical">
            <Form.Item label="姓名">
              {getFieldDecorator('name', {
                rules: [{ required: true, message: '请输入姓名!' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item className="collection-create-form_last-form-item" label="学期">
              {getFieldDecorator('semester', {
                initialValue: 'DAYI',
              })(
                <Radio.Group>
                  <Radio value="DAYI">大一</Radio>
                  <Radio value="DAER">大二</Radio>
                  <Radio value="DASAN">大三</Radio>
                  <Radio value="DASI">大四</Radio>
                  <Radio value="ALL">ALL</Radio>
                </Radio.Group>,
              )}
            </Form.Item>
            <Form.Item label="课程成绩">
              {getFieldDecorator('records')(<Input type="textarea" />)}
            </Form.Item>
          </Form>
        </Modal>
      );
    }
  },
);

export default connect()(Form.create()(Student))