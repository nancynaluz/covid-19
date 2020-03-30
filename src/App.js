import React, {useState, useEffect} from 'react';
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend} from 'recharts'
import './App.css';

const useFetchData = url => {
  const [data, setData] = useState()
  useEffect(() => {
    async function fetchStats() {
      const data = await fetch(url).then(res => res.json())
      setData(data)
    }
    fetchStats()
  },[url])
  return data

}

const Dropdown = ({label, labelDisplay, currentValue, onChange, data}) => (
  <div className="dropdown">
    <label htmlFor={label}>{labelDisplay}</label>
    <select 
      name={label} 
      value={currentValue} 
      onChange={onChange}
    >
    {data.map(value => 
      <option key={value} value={value}>{value.replace(/\+/g,' ')}</option>)
    }
    </select>
  </div>
)



const Graph = ({data, confirmed, deaths, recovered}) => (
  <LineChart 
    data={data}
    width={900}
    height={400}
    margin={{
      top: 5, right: 30, left: 20, bottom: 5,
    }}
  >
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="date" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Line type="monotone" dataKey="confirmed" stroke="#00ccff" />
    {deaths && <Line type="monotone" dataKey="deaths" stroke="#ff6d6d" /> }
    {recovered &&<Line type="monotone" dataKey="recovered" stroke="#74ff66" /> }
  </LineChart>
)

const Country = () => {
  const GLOBAL_COVID_URL = 'https://pomber.github.io/covid19/timeseries.json'
  const data = useFetchData(GLOBAL_COVID_URL)
  const [currentCountry, setCurrentCountry] = useState('Canada')

  if (!data) return null 
  
  const getCountries = data => Object.keys(data)
  const currentCountryData = data[currentCountry]
  const onChange = e => 
    setCurrentCountry(e.target.value)

  return (
    <div className="wrapper">
      <h1>Covid-19 in {currentCountry}</h1> 
      <Dropdown 
        label="countries-select"
        labelDisplay="Choose a country:"
        currentValue={currentCountry}
        onChange={onChange}
        data={getCountries(data)}
      />
      <Graph data={currentCountryData} deaths recovered/>
    </div>
  )

}

const Province = () => {
  const [currentProvince, setCurrentProvince] = useState('Quebec')
  const CANADA_COVID_URL = `https://api.trackingcovid.com/api/confirmed?regions=${currentProvince}`
  const canadaData = useFetchData(CANADA_COVID_URL)
  const currentProvinceDisplay = currentProvince.replace(/\+/g,' ')
  if (!canadaData || !canadaData.regions[currentProvinceDisplay]) return null

  const currentProvinceCases = {...canadaData.regions[currentProvinceDisplay].cases}
  const days = canadaData.regions[currentProvinceDisplay].cases.length
  const startDate = Date.parse(canadaData.regions[currentProvinceDisplay].start)

  const getDates = () => {
    let results =[]
    for(let i = 0; i < days; i++) {
      const newDate = new Date(startDate)
      newDate.setDate(newDate.getDate() + i)
      results.push(newDate.toISOString().substring(0, 10))
    }
    return results
  }
  
  const getCurrentProvinceData = () => 
    getDates().reduce((acc, value, i) => {
      acc.push({date: value, confirmed: currentProvinceCases[i]})
      return acc
    }, [])
  

  const CANADIAN_PROVINCES = [
    'Ontario', 
    'Quebec', 
    'British+Columbia', 
    'Nova+Scotia', 
    'Alberta', 
    'Manitoba', 
    'Prince+Edward+Island',
    'Saskatchewan',
    'Northwest+Territories',
    'New+Brunswick'
  ]

  const onChange = e => 
    setCurrentProvince(e.target.value)

  return (
    <div className="wrapper">
      <h1>Covid-19 in {currentProvinceDisplay}</h1>
      <Dropdown
        label="province-select"
        labelDisplay="Choose a province:"
        currentValue={currentProvince}
        onChange={onChange}
        data={CANADIAN_PROVINCES}
      />
      <Graph data={getCurrentProvinceData()} />
    </div>

  )
}


const App = () => (
  <div className="App">
    <Country />
    <Province />
  </div>
);



export default App;

