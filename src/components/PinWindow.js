// eslint-disable-next-line no-unused-vars
import React, { useRef, useEffect } from 'react'
import plusIcon from '../image/plusIcon.png'
import Two from 'two.js'
import gsap from 'gsap'
import { collection, addDoc, GeoPoint } from 'firebase/firestore'
import { db } from './connection'
import PropTypes from 'prop-types'
import '../tailwind.css'

let divX = 10
let divY = 50

const PinWindow = ({ year, bce, lat, lng, visible }) => {
  const pinWindowRef = useRef(null)

  const windowHeight = window.innerHeight
  const width = 425
  const height = 2 * windowHeight / 3

  const textPadding = '50px'
  const bottomPadding = '30px'

  const latitude = 180 * lat / Math.PI
  const longitude = 180 * (lng - Math.PI / 2) / Math.PI

  let moveClick = false

  useEffect(() => {
    const pinWindowDiv = pinWindowRef.current
    if (!pinWindowDiv) return
    const windowMove = document.getElementById('windowMove')
    const windowDel = document.getElementById('windowDel')
    const publishButton = document.getElementById('publishButton')

    pinWindowDiv.style.visibility = visible ? 'visible' : 'hidden'

    let drag = false
    let mouseX = 0
    let mouseY = 0
    let prevX = 0
    let prevY = 0

    if (visible) {
      gsap.set(pinWindowDiv, {
        x: divX,
        y: divY
      })

      const two = new Two({
        type: Two.Types.svg,
        width,
        height
      }).appendTo(pinWindowDiv)

      const square = two.makeRectangle(30, 40, 12, 12)
      square.fill = '#B0A3FF'
      square.stroke = 'none'
      square.rotation = Math.PI / 4

      two.update()
    }

    const withinPinWindowBounds = (x, y) => {
      return (x > divX && x < divX + width && y > divY && y < divY + height)
    }

    const handleMouseDown = (event) => {
      event.stopPropagation()
      mouseX = event.clientX
      mouseY = event.clientY
      if (withinPinWindowBounds(mouseX, mouseY)) {
        prevX = mouseX
        prevY = mouseY
        drag = true
      }
    }

    const handleMouseMove = (event) => {
      event.preventDefault()
      event.stopPropagation()
      mouseX = event.clientX
      mouseY = event.clientY
      if (drag && moveClick) {
        divX += mouseX - prevX
        if (divX < 0) {
          divX = 0
        } else if (divX > window.innerWidth - width) {
          divX = window.innerWidth - width
        }
        divY += mouseY - prevY
        if (divY < 0) {
          divY = 0
        } else if (divY > windowHeight - height) {
          divY = windowHeight - height
        }
        prevX = mouseX
        prevY = mouseY

        gsap.set(pinWindowDiv, {
          x: divX,
          y: divY
        })
      }
    }

    const handleMouseUp = (event) => {
      event.preventDefault()
      event.stopPropagation()
      mouseX = event.clientX
      mouseY = event.clientY
      drag = false
    }

    const resize = (event) => {
      event.preventDefault()
      if (divX > window.innerWidth - width) {
        divX = window.innerWidth - width
      }
      if (divY > windowHeight - height) {
        divY = windowHeight - height
      }
      gsap.set(pinWindowDiv, {
        x: divX,
        y: divY
      })
    }

    const handleMoveMD = () => {
      moveClick = true
    }

    const handleMoveMU = () => {
      moveClick = false
    }

    const deleteWindow = () => {
      // deletePin()
      visible = false
    }

    const publish = async () => {
      const eventData = document.getElementById('eventTitle').value
      if (!eventData) {
        console.error('Event title is required')
        return
      }

      const yearText = document.getElementById('inputYear').textContent.split(' ')
      const year = parseInt(yearText[0])
      const bce = (yearText[1] === 'BCE') ? 1 : 0
      const location = new GeoPoint(latitude, longitude)

      const data = {
        title: eventData,
        header: document.getElementById('header').value,
        description: document.getElementById('description').value,
        year,
        bce,
        location
      }

      const archive = collection(db, 'archive')
      await addDoc(archive, data)

      deleteWindow()
    }

    if (visible) {
      pinWindowDiv.addEventListener('mousedown', handleMouseDown)
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('resize', resize)
      windowMove.addEventListener('mousedown', handleMoveMD)
      windowMove.addEventListener('mouseup', handleMoveMU)
      windowDel.addEventListener('click', deleteWindow)
      publishButton.addEventListener('click', publish)

      return () => {
        pinWindowDiv.removeEventListener('mousedown', handleMouseDown)
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
        window.removeEventListener('resize', resize)
        windowMove.removeEventListener('mousedown', handleMoveMD)
        windowMove.removeEventListener('mouseup', handleMoveMU)
        windowDel.removeEventListener('click', deleteWindow)
        publishButton.removeEventListener('click', publish)
      }
    }
  }, [divX, divY])

  return (
    <div
      ref={pinWindowRef}
      className="fixed rounded-xl"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        top: `${divY}px`,
        left: `${divX}px`,
        fontFamily: 'arial',
        backgroundColor: 'rgb(0,0,0,0.8)',
        border: '1px solid white',
        overflow: 'hidden',
        visibility: 'hidden'
      }}
    >
      <button
        id='windowMove'
        style={{
          position: 'absolute',
          width: `${width * 0.95}px`,
          height: '100px',
          top: '0px',
          left: '0px',
          backgroundColor: 'transparent',
          cursor: 'default',
          boxSizing: 'border-box'
        }}
      />
      <button
        id='windowDel'
        style={{
          position: 'absolute',
          width: '20px',
          height: '20px',
          top: '30px',
          right: '17px',
          backgroundColor: 'transparent',
          cursor: 'pointer',
          boxSizing: 'border-box',
          borderRadius: '10px'
        }}
      >
        <img
          src={plusIcon}
          style={{
            width: '100%',
            height: '100%',
            opacity: '0.9',
            transform: 'rotate(45deg)'
          }}
          alt="Save"
        />
      </button>
      <input
        type='text'
        id='eventTitle'
        placeholder='Event Title'
        style={{
          position: 'absolute',
          width: '270px',
          maxHeight: '20px',
          top: '30px',
          left: `${textPadding}`,
          fontSize: '24px',
          fontWeight: 'bold',
          letterSpacing: '0px',
          fontFamily: 'arial',
          color: 'white',
          backgroundColor: 'transparent',
          outline: 'none'
        }}
      />
      <input
        type='text'
        id='header'
        placeholder='Enter Header'
        style={{
          position: 'absolute',
          width: '350px',
          maxHeight: '25px',
          top: '110px',
          left: `${textPadding}`,
          fontSize: '18px',
          fontWeight: 'bold',
          letterSpacing: '0px',
          fontFamily: 'arial',
          color: 'white',
          backgroundColor: 'transparent',
          outline: 'none'
        }}
      />
      <input
        type='text'
        id='description'
        placeholder='Enter Description'
        style={{
          position: 'absolute',
          width: '350px',
          maxHeight: `${windowHeight / 3}px`,
          top: '150px',
          left: `${textPadding}`,
          fontSize: '12px',
          letterSpacing: '1px',
          fontFamily: 'arial',
          color: 'white',
          backgroundColor: 'transparent',
          outline: 'none',
          resize: 'none'
        }}
      />
      <div
        id='inputYear'
        style={{
          position: 'absolute',
          top: '25px',
          right: '50px',
          width: '110px',
          height: '30px',
          paddingTop: '2px',
          fontSize: '18px',
          fontWeight: 'bold',
          fontFamily: 'arial',
          textAlign: 'center',
          color: 'white',
          backgroundColor: 'transparent',
          borderRadius: '20px',
          border: '1.2px solid white'
        }}
      >
        {year} {bce}
      </div>
      <button
        id='heightResize'
        style={{
          position: 'absolute',
          width: `${width}px`,
          height: '2px',
          bottom: '0px',
          left: '0px',
          cursor: 'n-resize',
          backgroundColor: 'transparent',
          boxSizing: 'border-box'
        }}
      />
      <button
        id='publishButton'
        type='submit'
        style={{
          position: 'absolute',
          width: '100px',
          height: '40px',
          bottom: `${bottomPadding}`,
          right: '20px',
          fontSize: '16px',
          fontWeight: 'bold',
          color: 'white',
          backgroundColor: '#1bbfb4',
          borderRadius: '12px',
          cursor: 'pointer',
          boxSizing: 'border-box'
        }}
      >
        Publish
      </button>
    </div>
  )
}

export const createPinWindow = (year, bce, lat, lng) => {
  const pinWindow = PinWindow(year, bce, lat, lng)
  return pinWindow
}

PinWindow.propTypes = {
  year: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.any
  ]),
  bce: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.any
  ]),
  lat: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.any
  ]),
  lng: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.any
  ]),
  visible: PropTypes.bool.isRequired
}

export default PinWindow
