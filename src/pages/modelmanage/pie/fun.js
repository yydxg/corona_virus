import echarts from 'echarts'

var arrPoint =[];

function _addMark(id,lon,lat,name){
  return new Promise((resolve)=>{
    var divpoint = new mars3d.DivPoint(viewer, {
      html: `<div class="divpoint2" style={width: 50px;height: 50px;}>
              <div class="title">`+name+`</div>
              <div class="content" id="`+id+`"></div> 
            </div >`,
      position: Cesium.Cartesian3.fromDegrees(lon,lat, 424+Math.random()),
      anchor: [0, 0],
    });
    arrPoint.push(divpoint)
    resolve()
  })
}

export function clearDraw() {
  for (var i = 0, len = arrPoint.length; i < len; i++) {
      arrPoint[i].destroy();
  }
  arrPoint = [];
}

export function addPie({id,lat,lon,name,data}){
  _addMark(id,lon,lat,name).then(()=>{
    let canvasDom = document.createElement('canvas');
    var bodyFa = document.getElementById(id)//通过id号获取frameDiv 的父类（也就是上一级的节点）
    bodyFa .appendChild(canvasDom);
    canvasDom.width = 50;
    canvasDom.height = 50;
    let myChart = echarts.init(canvasDom);
    let option = {
      tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
      },
      series: [
          {
              name: '姓名',
              type: 'pie',
              radius: '80%',
              center: ['50%', '50%'],
              data: data,
              emphasis: {
                  itemStyle: {
                      shadowBlur: 10,
                      shadowOffsetX: 0,
                      shadowColor: 'rgba(0, 0, 0, 0.5)'
                  }
              },
              color : [ '#fb6767', '#28da6f', '#949fa5'],
              label:{
                normal:{
                  show:true,
                  position:'inside', //标签的位置
                  textStyle : {
                    fontWeight : 10 ,
                    fontSize : 10, //文字的字体大小
                  },
                  formatter:'{d}%' //{c}
                },
              }
          }
      ]
    };
  myChart.setOption(option);
  })
}





//////////////////////////////////////////////////////
export function draw(radius, lon, lat){
  let canvasDom = document.createElement('canvas');
  canvasDom.width = 10000;
  canvasDom.height = 10000;
  let myChart = echarts.init(canvasDom);
  let option = option = {
    backgroundColor: '#12cf96',
    tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)'
    },
    series: [
        {
            name: '姓名',
            type: 'pie',
            radius: '50%',
            center: ['50%', '50%'],
            data: [{
                name: "a",
                value: Math.round(Math.random() * 100000)
            },{
                name: "b",
                value: Math.round(Math.random() * 100000)
            },{
                name: "c",
                value: Math.round(Math.random() * 100000)
            }],
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            },
            label:{
              normal:{
                show:true,
                position:'inside', //标签的位置
                textStyle : {
                  fontWeight : 100 ,
                  fontSize : 100, //文字的字体大小
                  // fontWeight:'blod',
                },
                formatter:'{d}%'
              },
              /* show:true,
              position:'inside',
              fontSize:8000,
              color:'red',
               */
            }
        }
    ]
  };
  
  myChart.setOption(option);
  myChart.on('finished', () => {
      let criclePrimitive = _getCriclePrimitive(myChart, { radius, lon, lat })
      viewer.scene.primitives.add(criclePrimitive)
      myChart.dispose();
      myChart = null;
      canvasDom = null;
  })
}

function _getCriclePrimitive(chart,options){
  let {radius, lon, lat } = options
  console.log(radius,lon,lat)
  let circle = new Cesium.CircleGeometry({
    center: Cesium.Cartesian3.fromDegrees(lon, lat),
    radius: radius
  });
  let circleGeometry = Cesium.CircleGeometry.createGeometry(circle);
  let circleGeometryInstance = new Cesium.GeometryInstance({
    geometry: circleGeometry,
    attributes: {
        color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.ORANGE)
    }
  });
  let criclePrimitive = new Cesium.Primitive({
    geometryInstances: [
        circleGeometryInstance
    ],
    appearance: new Cesium.MaterialAppearance({
        material:
            new Cesium.Material({
                fabric: {
                    type: 'Image',
                    uniforms: {
                        image: chart.getDataURL()
                    }
                }
            })
    })
  })
  return criclePrimitive
}
