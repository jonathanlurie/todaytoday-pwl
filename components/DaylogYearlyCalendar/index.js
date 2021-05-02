import React from 'react'
import { ResponsiveCalendar } from '@nivo/calendar'


const data = [
  {
    "day": "2021-05-23",
    "value": 0
  },
  {
    "day": "2021-04-13",
    "value": 1
  },
  
]


const CustomTooltip = data => {
  if (Object.keys(data.data).length === 0) {
    return null
  }

  return (
      <span style={{ color: 'white', backgroundColor: '#333', padding: '10px', borderRadius: 2 }}>
        {data.day}
        {
          !data.data.value ?
          <span> (private)</span>:
          null
        }
      </span>
  )
}





export default class DaylogYearlyCalendar extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      year: new Date().getFullYear()
    }
  }

  onDayClick = (day) => {
    console.log('day: ', day)
  }

  render() {

    return (
      <div style={{ height: 200, marginTop: 20, marginBottom: 20 }}>
        <ResponsiveCalendar
          tooltip={CustomTooltip}
          data={data}
          from={`${this.state.year}-01-01`}
          to={`${this.state.year}-12-31`}
          emptyColor="#eeeeee"
          minValue={0}
          maxValue={1}
          colors={[ '#ffcb25', '#5ce200']}
          monthBorderColor="#ffffff"
          dayBorderWidth={2}
          dayBorderColor="#ffffff"
          // monthSpacing={10}
          onClick={this.onDayClick}
        />
      </div>
    )
  }
}