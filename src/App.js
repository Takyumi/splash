/* eslint-disable no-unused-vars */
import React from 'react'
import Globe from './components/Globe'
import SearchBar from './components/SearchBar'
import Timeline from './components/Timeline'
import TargetYear from './components/TargetYear'

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
