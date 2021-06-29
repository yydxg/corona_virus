import React, { Component, Fragment } from 'react';
import styles from './style.less';
import MuduleTitle from '@/component/moduleTitle';
import { connect } from 'dva';
import { router } from 'umi';
import {Table, Modal } from 'antd';

@connect(({ Home }) => ({
  Home
}))


class HomePage extends Component{
  constructor(props){
    super(props)
    this.state = {
      expandedRows:null,
      columns : [{
        title: 'Bom Line',
        dataIndex: 'Element_ID',
        key: 'Element_ID',
        width: '40%',
      }, {
        title: 'Item Description',
        dataIndex: 'Item_Description',
        key: 'Item_Description',
        width: '30%',
      }, {
        title: 'Part Name',
        dataIndex: 'Part_Name',
        key: 'Part_Name',
        width: '10%',
      }, {
        title: 'Part Number',
        dataIndex: 'Part_Number',
        key: 'Part_Number',
        width: '20%',
      }],
    }
  }

  componentDidMount() {
    let { dispatch,history } = this.props;
    /* dispatch({
      type: 'Home/init',
    }) */
    // history.push('/manage/')
  }

  rowExpand = (expanded,record) => {
    console.log(expanded,record)
    const {dispatch} = this.props
    const {key} = record
    if(expanded)
      dispatch({
        type:'Home/getNodes',
        payload: {
          id: record.key||101609,
        },
      })

  };

  render () {
    const {columns } = this.state
    let { rowSelection, data ,expandedRows,rowExpand,changeExpandedRows } = this.props.Home

    return (
      <Fragment>
        <div className={styles.banner}>
          <p className={styles.tit}></p>
          <p className={styles.intro}></p>
        </div>
        
        <Fragment>
          <MuduleTitle titleDe='关于我的作品' titleEn='ABOUT MY FRUIT' />
          <ul className={styles.myWork}>
            <li></li>
            <li>
              <div className={styles.tit}>XXXXXXXXXXXX</div>
              <div className={styles.txt}>XXXXXXXXXXXX</div>
              <div>
                <a onClick={() => router.push('/system/visualization')}
                   className={styles.btn}>走你！</a>
              </div>
            </li>
          </ul>
        </Fragment>
      </Fragment>
    );
  }
}

export default HomePage;

