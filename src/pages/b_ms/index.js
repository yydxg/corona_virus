/* global mars3d Cesium coordtransform$*/
import React, { Component } from 'react';
import {Card,} from 'antd'
import echarts from 'echarts'

class B_ms extends Component {
  constructor(props) {
    super(props)
    this.state = {
      myChart: null,
    }
  }

  componentDidMount() {
    const myChart = echarts.init(this.chartsDiv);
    myChart && this.createGraph(myChart)
  }


  createGraph = (myChart) => {
    const option = this.getOption()
    myChart.setOption(option);
  }

  getOption = () => {
    var categories = ["类", "函数", "变量", "对象", "权限"];

    return {
      // 图的标题
      title: {
        text: '模式图'
      },
      // 提示框的配置
      tooltip: {
        formatter: function (x) {
          return x.data.des;
        }
      },
      // 工具箱
      toolbox: {
        // 显示工具箱
        show: true,
        feature: {
          mark: {
            show: true
          },
          // 还原
          restore: {
            show: true
          },
          // 保存为图片
          saveAsImage: {
            show: true
          }
        }
      },
      legend: [{
        // selectedMode: 'single',
        data: categories.map(function (a) {
          return a.name;
        })
      }],
      series: [{
        type: 'graph', // 类型:关系图
        layout: 'force', //图的布局，类型为力导图
        symbolSize: 40, // 调整节点的大小
        roam: true, // 是否开启鼠标缩放和平移漫游。默认不开启。如果只想要开启缩放或者平移,可以设置成 'scale' 或者 'move'。设置成 true 为都开启
        edgeSymbol: ['circle', 'arrow'],
        edgeSymbolSize: [2, 10],
        edgeLabel: {
          normal: {
            textStyle: {
              fontSize: 20
            }
          }
        },
        force: {
          repulsion: 2500,
          edgeLength: [10, 50]
        },
        draggable: true,
        lineStyle: {
          normal: {
            width: 2,
            color: '#4b565b',
          }
        },
        edgeLabel: {
          normal: {
            show: true,
            formatter: function (x) {
              return x.data.name;
            }
          }
        },
        label: {
          normal: {
            show: true,
            textStyle: {}
          }
        },
        // 数据["类","对象","函数","变量","权限"];
        data: [{
          name: '类1',
          des: '类1',
          symbolSize: 70,
          category: 0,
        }, {
          name: '类2',
          des: '类2',
          symbolSize: 70,
          category: 0,
        }, {
          name: '对象',
          des: '对象',
          symbolSize: 50,
          category: 1,
        }, {
          name: '函数',
          des: '函数',
          symbolSize: 50,
          category: 2,
        }, {
          name: '变量',
          des: '变量',
          symbolSize: 50,
          category: 3,
        }, {
          name: 'public_1',
          des: 'public_1',
          symbolSize: 50,
          category: 4,
        }, {
          name: 'private_1',
          des: 'private_1',
          symbolSize: 50,
          category: 4,
        },{
          name: 'public_2',
          des: 'public_2',
          symbolSize: 50,
          category: 4,
        },{
          name: 'private_2',
          des: 'private_2',
          symbolSize: 50,
          category: 4,
        }],
        links: [{
          source: '类1',
          target: '对象',
          name: 'new',
          des: '类实例化对象'
        }, {
          source: '类1',
          target: '函数',
          name: 'has',
          des: '类中含有的成员函数'
        }, {
          source: '类1',
          target: '变量',
          name: 'has',
          des: '类中含有的成员变量'
        },{
          source: '类1',
          target: '类2',
          name: 'extends',
          des: '类1继承类2'
        }, {
          source: '函数',
          target: 'public_1',
          name: '访问权限',
          des: '成员函数的public访问权限'
        },{
          source: '函数',
          target: 'private_1',
          name: '访问权限',
          des: '成员函数的private访问权限'
        }, {
          source: '变量',
          target: 'public_2',
          name: '访问权限',
          des: '成员变量的public访问权限'
        },{
          source: '变量',
          target: 'private_2',
          name: '访问权限',
          des: '成员变量的private访问权限',
          label:{
            show:false
          }
        }],
        categories: categories,
      }]
    };

  }
  componentWillUnmount() {
  }

  render() {

    return (
      <div style={{ paddingTop: 100 }}>
        <Card>
          <div style={{ width: '100%' }}>
            <div id="main" style={{ width: '100%', height: '600px' }} ref={(chartsDiv) => { this.chartsDiv = chartsDiv }} />
          </div>
        </Card>
      </div>
    )
  }
}

export default B_ms