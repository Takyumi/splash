// eslint-disable-next-line no-unused-vars
import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import '../tailwind.css'

let year = 0
let bce = 'CE'

export const updateYear = (newYear: number, newBCE: string) => {
  year = newYear
  bce = newBCE
}

const windowWidth = window.innerWidth
const windowHeight = window.innerHeight

const TargetYear: React.FC = () => {
  const targetYearRef = useRef<HTMLDivElement>(null)

  const width = 200
  const height = 92

  let divX = windowWidth - 250
  let divY = windowHeight / 2 + height / 2

  let drag = false
  let mouseX = 0
  let mouseY = 0
  let prevX = 0
  let prevY = 0

  // const fontColor = (str: string | number, color: string) => {
  //  return '<span style="color: ' + color + '">' + str + '</span>'
  // }

  const fontColorDiv = (str: string | number, color: string) => {
    return <span style={{ color }}>{str}</span>
  }

  useEffect(() => {
    const targetYear = targetYearRef.current
    if (!targetYear) return

    gsap.set(targetYear, {
      x: divX,
      y: divY
    })

    const handleMouseDown = (event: MouseEvent) => {
      event.preventDefault()
      mouseX = event.clientX
      mouseY = event.clientY
      prevX = mouseX
      prevY = mouseY
      drag = true
    }

    const handleMouseMove = (event: MouseEvent) => {
      event.preventDefault()
      mouseX = event.clientX
      mouseY = event.clientY
      if (drag) {
        divX += mouseX - prevX
        if (divX < 0) {
          divX = 0
        } else if (divX > window.innerWidth - width) {
          divX = window.innerWidth - width
        }
        divY += mouseY - prevY
        if (divY < 0) {
          divY = 0
        } else if (divY > window.innerHeight - height) {
          divY = window.innerHeight - height
        }
        prevX = mouseX
        prevY = mouseY
        gsap.set(targetYear, {
          x: divX,
          y: divY
        })
      }
      targetYear.innerHTML = `${fontColorDiv(year, 'black').props.children}${fontColorDiv('|', 'black').props.children}${fontColorDiv(bce, 'black').props.children}`
    }

    const handleMouseUp = (event: MouseEvent) => {
      event.preventDefault()
      mouseX = event.clientX
      mouseY = event.clientY
      drag = false
    }

    const resize = (event: UIEvent) => {
      event.preventDefault()
      if (divX > window.innerWidth - width) {
        divX = window.innerWidth - width
      }
      if (divY > window.innerHeight - height) {
        divY = window.innerHeight - height
      }
      gsap.set(targetYear, {
        x: divX,
        y: divY
      })
    }

    targetYear.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('resize', resize)

    return () => {
      targetYear.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('resize', resize)
    }
  }, [divX, divY])

  return (
    <div
      ref={targetYearRef}
      className="fixed bg-white rounded-2xl shadow-lg"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        lineHeight: `${height}px`,
        textAlign: 'center',
        verticalAlign: 'middle',
        fontSize: '36px',
        fontFamily: 'Spline Sans Mono, sans-serif',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        outline: '1.5px solid black',
        borderRadius: '25px'
      }}
    >
      <h2>
        {fontColorDiv(year, 'black')} {fontColorDiv('|', 'black')} {fontColorDiv(bce, 'black')}
      </h2>
    </div>
  )
}

export default TargetYear
