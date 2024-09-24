// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState, useRef } from 'react'
import searchIcon from '../image/searchIcon.png'
// import Two from 'https://cdn.skypack.dev/two.js@latest'
import { collection, getDocs } from 'firebase/firestore'
import { db } from './connection.tsx'
// import { createPinFromCoords, deletePin } from './Globe'

const SearchBar: React.FC = () => {
  const searchBarRef = useRef<HTMLDivElement | null>(null)
  const textInputRef = useRef<HTMLInputElement | null>(null)

  const divX = 15
  const divY = 15
  const width = 480
  const height = 35

  // const [searchClick, setSearchClick] = useState(false)
  // const [addSearchDiv, setAddSearchDiv] = useState(false)
  // const twoRef = useRef(null)

  useEffect(() => {
    const handleClick = async (event: MouseEvent) => {
      if (
        event.target === searchBarRef.current ||
        event.target === textInputRef.current ||
        (event.target instanceof Element && event.target.closest('img') === searchBarRef.current?.querySelector('img'))
      ) {
        console.log('clicked')
        const displayArchive = async () => {
          const archive = collection(db, 'archive')
          const querySnapshot = await getDocs(archive)
          const moments = querySnapshot.docs
          console.log('archive size:', moments.length)
          moments.forEach((moment) => {
            console.log(moment.data().location.latitude, moment.data().location.longitude)
            console.log(moment.data().year, moment.data().bce ? 'BCE' : 'CE')
            console.log(moment.data().title)
            console.log(moment.data().header)
            console.log(moment.data().description)
            console.log()
          })
        }
        await displayArchive()
        textInputRef.current?.focus()
      } else {
        textInputRef.current?.blur()
      }
    }

    window.addEventListener('click', handleClick)

    return () => {
      window.removeEventListener('click', handleClick)
    }
  }, [])

  return (
    <div
      ref={searchBarRef}
      className="fixed bg-white rounded-2xl"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        top: `${divY}px`,
        left: `${divX}px`,
        fontFamily: 'arial',
        fontSize: '36px',
        textAlign: 'center',
        verticalAlign: 'middle',
        paddingLeft: '20px',
        backgroundColor: 'white',
        outline: '1.2px solid white',
        overflow: 'hidden'
      }}>
      <img
        src={searchIcon}
        width={30}
        height={30}
        style={{
          position: 'absolute',
          left: '5px',
          top: '3px'
        }}
        alt="Search Icon"
      />
      <input
        ref={textInputRef}
        type="text"
        id="textInput"
        placeholder="Search"
        style={{
          position: 'absolute',
          fontSize: '18px',
          left: '40px',
          top: '5px',
          width: '300px',
          height: '25px',
          outline: 'none',
          fontFamily: 'Arial',
          backgroundColor: 'transparent',
          color: 'white'
        }}
      />
    </div>
  )
}

export default SearchBar
