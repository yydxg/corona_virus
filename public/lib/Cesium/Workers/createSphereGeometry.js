define(["./when-cbf8cd21","./Check-35e1a91d","./Math-e66fad2a","./Cartesian2-44433f55","./Transforms-23521d7e","./RuntimeError-f4c64df1","./WebGLConstants-95ceb4e9","./ComponentDatatype-7ee14e67","./GeometryAttribute-b1aaa48a","./GeometryAttributes-90846c5f","./IndexDatatype-66caba23","./GeometryOffsetAttribute-84f7eff3","./VertexFormat-cc24f342","./EllipsoidGeometry-45d8e8eb"],function(a,e,t,o,r,i,n,s,c,d,l,m,u,f){"use strict";function p(e){var t=a.defaultValue(e.radius,1),r={radii:new o.Cartesian3(t,t,t),stackPartitions:e.stackPartitions,slicePartitions:e.slicePartitions,vertexFormat:e.vertexFormat};this._ellipsoidGeometry=new f.EllipsoidGeometry(r),this._workerName="createSphereGeometry"}p.packedLength=f.EllipsoidGeometry.packedLength,p.pack=function(e,t,r){return f.EllipsoidGeometry.pack(e._ellipsoidGeometry,t,r)};var y=new f.EllipsoidGeometry,G={radius:void 0,radii:new o.Cartesian3,vertexFormat:new u.VertexFormat,stackPartitions:void 0,slicePartitions:void 0};return p.unpack=function(e,t,r){var i=f.EllipsoidGeometry.unpack(e,t,y);return G.vertexFormat=u.VertexFormat.clone(i._vertexFormat,G.vertexFormat),G.stackPartitions=i._stackPartitions,G.slicePartitions=i._slicePartitions,a.defined(r)?(o.Cartesian3.clone(i._radii,G.radii),r._ellipsoidGeometry=new f.EllipsoidGeometry(G),r):(G.radius=i._radii.x,new p(G))},p.createGeometry=function(e){return f.EllipsoidGeometry.createGeometry(e._ellipsoidGeometry)},function(e,t){return a.defined(t)&&(e=p.unpack(e,t)),p.createGeometry(e)}});