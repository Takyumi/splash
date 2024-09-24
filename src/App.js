/* eslint-disable no-unused-vars */
import React from 'react'
import Globe from './components/Globe.tsx'
import SearchBar from './components/SearchBar.tsx'
import Timeline from './components/Timeline.tsx'
import TargetYear from './components/TargetYear.tsx'

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
