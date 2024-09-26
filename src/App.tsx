/* eslint-disable no-unused-vars */
import React from 'react'
import Globe from './components/Globe'
import SearchBar from './components/SearchBar'
import TargetYear from './components/TargetYear'
import Timeline from './components/Timeline'

const App = () => {
  return (
    <div>
      <SearchBar />
      <TargetYear />
      <Globe />
      <Timeline />
    </div>
  )
}

export default App
