import React, { Component } from 'react';

import {
  G2,
  Chart,
  Geom,
  Axis,
  Tooltip,
  Coord,
  Label,
  Interval,
  Line,
  Legend,
  View,
  Annotation,
  Shape,
  Facet,
  Util,
  Slider,
  getTheme
} from "bizcharts";

const data = [
  { year: '1951 年', sales: 38 },
  { year: '1952 年', sales: 52 },
  { year: '1956 年', sales: 61 },
  { year: '1957 年', sales: 45 },
  { year: '1958 年', sales: 48 },
  { year: '1959 年', sales: 38 },
  { year: '1960 年', sales: 38 },
  { year: '1962 年', sales: 38 },
];

const theme = getTheme();


class StaticWorkTime extends Component {

  render() {
    const { daka } = this.props
    return (
      <Chart height={400} padding="auto" data={daka} autoFit>
        <Axis
          name="days"
          label={{
            formatter: (val) => `${val}天`,
          }}
        />
        <Interval
          adjust={[
            {
              type: 'dodge',
              marginRatio: 0,
            },
          ]}
          color="v2"
          position="v5*days"
        />
        <Tooltip shared />
      </Chart>
    )
  }
}

export default StaticWorkTime