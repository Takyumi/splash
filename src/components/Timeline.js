// eslint-disable-next-line no-unused-vars
import React, { useRef, useEffect } from 'react'
import Two from 'two.js'
import { updateYear } from './TargetYear'
import { updateYear as updateGlobeYear } from './Globe'
import '../tailwind.css'

const Timeline = () => {
  const timelineContainerRef = useRef(null)
  let width = innerWidth
  let height = innerHeight / 5 // Hardcoded, change based on index.html
  let frameY = innerHeight - height

  let currentDate = new Date()
  let currentYear = currentDate.getFullYear()

  const tickSize = 2
  const tickWidth = 1.7
  let spcBtwn = 50
  let numTick = width / spcBtwn
  const tickYears = [1, 10, 100, 1000, 1000000]
  let tickYearIdx = 0
  const minSpcBtwns = [40, 40, 40, 40, width / 5]
  const maxSpcBtwns = [width / 4, 300, 300, 300, width / 2]

  let prevX = 0
  let mouseX = 0
  let mouseY = 0
  let leftX = 0
  let leftYear = currentYear - (width / spcBtwn) + 1
  let bce = false

  let timelineDrag = false
  let targetDrag = false
  let targetPosition = 100
  let targetDotSize
  const targetSize = 20

  globalThis.yearString = Math.floor(leftYear + (targetPosition / spcBtwn)) + (bce ? ' BCE' : ' CE')

  let tickBuffer = 0

  let zoomRatio = -0.01

  let amplitudeCounter = 0
  let amplitudePink = 0
  let amplitudeBlue = 8
  let amplitudeWhite = 5
  const frequency = 10
  const points = 100

  let counterPink = 0
  let counterBlue = 0
  let counterWhite = 0

  let amplitudePinkIncrease = true
  let amplitudeBlueIncrease = true
  let amplitudeWhiteIncrease = true

  let two

  useEffect(() => {
    const timelineContainer = timelineContainerRef.current

    const handleMouseDown = (event) => {
      event.preventDefault()
      mouseX = event.clientX
      mouseY = event.clientY
      mouseY -= frameY
      prevX = mouseX
      if (inTarget(mouseX, mouseY)) {
        targetDrag = true
      } else {
        timelineDrag = true
      }
    }

    const inTarget = (x, y) => {
      return (x - targetPosition) ** 2 + (y - height / 2) ** 2 < targetSize ** 2
    }

    const handleMouseMove = (event) => {
      event.preventDefault()
      mouseX = event.clientX
      mouseY = event.clientY - frameY
      if (timelineDrag) {
        const tempX = leftX + mouseX - prevX
        if (!(!bce && tempX < 0 && currentYear < leftYear + numTick * tickYears[tickYearIdx])) {
          leftX = tempX
          counterPink += Math.abs(tempX)
          counterBlue += Math.abs(tempX)
          counterWhite += Math.abs(tempX)
        }
        prevX = mouseX
      }
    }

    const handleMouseUp = (event) => {
      event.preventDefault()
      mouseX = event.clientX
      mouseY = event.clientY - frameY
      timelineDrag = false
      targetDrag = false
    }

    const zoom = (event) => {
      event.preventDefault()
      zoomRatio = spcBtwn * -0.0002 - 0.01

      const prevSpcBtwn = spcBtwn
      const prevLeftYear = leftYear
      let change = event.deltaY * zoomRatio
      if (prevSpcBtwn + change < minSpcBtwns[tickYearIdx] && change < 0) {
        tickYearIdx++
        if (tickYearIdx < tickYears.length - 1) {
          spcBtwn = (prevSpcBtwn) * 10
          leftYear = Math.ceil(leftYear / tickYears[tickYearIdx]) * tickYears[tickYearIdx]
          leftX += (leftYear - prevLeftYear) / tickYears[tickYearIdx - 1] * prevSpcBtwn
          if (leftYear <= 0 && tickYearIdx === 1) {
            leftX += prevSpcBtwn
          }
          return
        }
        if (tickYearIdx === tickYears.length - 1) {
          spcBtwn = width / 4.5
        } else {
          tickYearIdx--
          spcBtwn = minSpcBtwns[tickYearIdx]
        }
      } else if (prevSpcBtwn + change > maxSpcBtwns[tickYearIdx] && change > 0) {
        if (tickYearIdx > 0) {
          tickYearIdx--
          spcBtwn = (prevSpcBtwn) / 10
          leftYear -= Math.floor(leftX / spcBtwn) * tickYears[tickYearIdx]
          if (prevLeftYear <= 0 && tickYearIdx === 0) {
            leftYear += tickYears[tickYearIdx]
          }
          leftX %= spcBtwn
          return
        }
        spcBtwn = maxSpcBtwns[tickYearIdx]
      } else {
        spcBtwn += event.deltaY * zoomRatio
      }
      leftYear = Math.ceil(leftYear / tickYears[tickYearIdx]) * tickYears[tickYearIdx]
      change = spcBtwn - prevSpcBtwn

      const dshift = change * (event.clientX - leftX) / prevSpcBtwn
      leftX -= dshift
    }

    const resize = () => {
      width = innerWidth
      height = innerHeight / 5 // Hardcoded, change based on index.html
      frameY = innerHeight - height

      two.width = width
      two.height = height

      bce = (tickYearIdx === 0) ? (leftYear <= 0) : (leftYear < 0)

      numTick = width / spcBtwn
    }

    const draw = () => {
      two.clear()
      resize()
      currentDate = new Date()
      currentYear = currentDate.getFullYear()

      while (leftX < 0) {
        leftX += spcBtwn
        leftYear += tickYears[tickYearIdx]
      }
      while (leftX >= spcBtwn) {
        leftX -= spcBtwn
        leftYear -= tickYears[tickYearIdx]
      }
      leftYear = Math.floor(leftYear / tickYears[tickYearIdx]) * tickYears[tickYearIdx]
      bce = (tickYearIdx === 0) ? (leftYear <= 0) : (leftYear < 0)

      tickBuffer = 0
      for (let i = 0; i <= numTick; i++) {
        drawTick(leftX + (i * spcBtwn), i)
      }

      const amplitudeOffset = Math.random()

      const wavePink = new Two.Path([], false, false)
      wavePink.noFill()

      const wavePink2 = new Two.Path([], false, false)
      wavePink2.noFill()

      const waveBlue = new Two.Path([], false, false)
      waveBlue.noFill()

      const waveBlue2 = new Two.Path([], false, false)
      waveBlue2.noFill()

      const waveWhite = new Two.Path([], false, false)
      waveWhite.noFill()

      const waveWhite2 = new Two.Path([], false, false)
      waveWhite2.noFill()

      amplitudeCounter += 1
      counterPink += 0.1
      counterBlue += 0.3
      counterWhite += 0.4

      if (amplitudeCounter === 5) {
        if (amplitudePink <= -10) {
          amplitudePinkIncrease = true
        } else if (amplitudePink >= 10) {
          amplitudePinkIncrease = false
        }

        if (amplitudeBlue <= -10) {
          amplitudeBlueIncrease = true
        } else if (amplitudeBlue >= 10) {
          amplitudeBlueIncrease = false
        }

        if (amplitudeWhite <= -10) {
          amplitudeWhiteIncrease = true
        } else if (amplitudeWhite >= 10) {
          amplitudeWhiteIncrease = false
        }

        if (amplitudePinkIncrease) {
          amplitudePink += amplitudeOffset
        } else {
          amplitudePink -= amplitudeOffset
        }

        if (amplitudeBlueIncrease) {
          amplitudeBlue += amplitudeOffset
        } else {
          amplitudeBlue -= amplitudeOffset
        }

        if (amplitudeWhiteIncrease) {
          amplitudeWhite += amplitudeOffset
        } else {
          amplitudeWhite -= amplitudeOffset
        }

        amplitudeCounter = 0
      }

      for (let i = 0; i <= points; i++) {
        const x = (i / points) * (width * 2) + counterPink
        const y = height / 2 + amplitudePink * Math.sin((i / points) * Math.PI * frequency)
        wavePink.vertices.push(new Two.Anchor(x, y))
      }

      for (let i = 0; i <= points; i++) {
        const x = -(i / points) * (width * 2) + counterPink
        const y = height / 2 + amplitudePink * -Math.sin((i / points) * Math.PI * frequency)
        wavePink2.vertices.push(new Two.Anchor(x, y))
      }

      for (let i = 0; i <= points; i++) {
        const x = (i / points) * (width * 2) + (counterBlue)
        const y = height / 2 + amplitudeBlue * Math.sin((i / points) * Math.PI * frequency)
        waveBlue.vertices.push(new Two.Anchor(x, y))
      }

      for (let i = 0; i <= points; i++) {
        const x = -(i / points) * (width * 2) + (counterBlue)
        const y = height / 2 + amplitudeBlue * -Math.sin((i / points) * Math.PI * frequency)
        waveBlue2.vertices.push(new Two.Anchor(x, y))
      }

      for (let i = 0; i <= points; i++) {
        const x = (i / points) * (width * 2) + (counterWhite)
        const y = height / 2 + amplitudeWhite * Math.sin((i / points) * Math.PI * frequency)
        waveWhite.vertices.push(new Two.Anchor(x, y))
      }

      for (let i = 0; i <= points; i++) {
        const x = -(i / points) * (width * 2) + (counterWhite)
        const y = height / 2 + amplitudeWhite * -Math.sin((i / points) * Math.PI * frequency)
        waveWhite2.vertices.push(new Two.Anchor(x, y))
      }

      if (counterPink >= width) {
        counterPink = 0
      }

      if (counterBlue >= width) {
        counterBlue = 0
      }

      if (counterWhite >= width) {
        counterWhite = 0
      }

      const linewidth = 1

      wavePink.stroke = '#30e3e0'
      wavePink.linewidth = linewidth

      wavePink2.stroke = '#30e3e0'
      wavePink2.linewidth = linewidth

      waveBlue.stroke = '#3098e3'
      waveBlue.linewidth = linewidth

      waveBlue2.stroke = '#3098e3'
      waveBlue2.linewidth = linewidth

      waveWhite.stroke = '#51d115'
      waveWhite.linewidth = linewidth

      waveWhite2.stroke = '#51d115'
      waveWhite2.linewidth = linewidth

      two.add(wavePink)
      two.add(wavePink2)
      two.add(waveBlue)
      two.add(waveBlue2)
      two.add(waveWhite)
      two.add(waveWhite2)

      target()
    }

    const drawTick = (x, ticksDrawn) => {
      let tickYear = leftYear + ticksDrawn * tickYears[tickYearIdx] - tickBuffer
      if (tickYear === 0) {
        tickYear = (tickYearIdx === 0) ? -1 : 1
      } else if (tickYear < 0 && tickYearIdx === 0) {
        tickYear -= tickYears[tickYearIdx]
      }

      if (tickYear <= currentYear) {
        const tick = two.makeLine(x, (height / 2 - 25) + tickSize, x, (height / 2 - 25) - tickSize)
        tick.stroke = 'transparent'
        tick.linewidth = tickWidth

        const text = two.makeText(Math.abs(tickYear), x, height / 2 - 40)
        text.fill = 'white'
        text.family = 'Spline Sans Mono, sans-serif'
      }
    }

    const target = () => {
      const targetCenter = two.makeCircle(targetPosition, height / 2, targetSize, targetSize)
      targetCenter.fill = 'transparent'
      targetCenter.stroke = '#fcf8d4'
      targetCenter.linewidth = 1.5
      targetCenter.rotation = Math.PI / 4

      const targetDot = two.makeCircle(targetPosition, height / 2, targetDotSize, targetDotSize)
      targetDot.fill = '#fcf8d480'
      targetDot.stroke = 'transparent'
      targetDotSize = 0

      if (targetDrag) {
        targetPosition = mouseX
        targetDotSize = 15
      }

      if (targetPosition > width) {
        targetPosition = width
      } else if (targetPosition < 0) {
        targetPosition = 0
      }

      const yearDiff = Math.floor((targetPosition - leftX) * tickYears[tickYearIdx] / spcBtwn)
      let targetYear = leftYear + yearDiff
      if (targetYear === 0) {
        targetYear = (tickYearIdx === 0) ? -1 : 1
      } else if (targetYear < 0 && tickYearIdx === 0) {
        targetYear -= tickYears[tickYearIdx]
      }
      const targetBCE = (tickYearIdx === 0) ? (targetYear <= 0) : (targetYear < 0)
      updateYear(Math.abs(targetYear), targetBCE ? 'BCE' : 'CE')
      updateGlobeYear(Math.abs(targetYear), targetBCE ? 'BCE' : 'CE')
    }

    const initTimeline = () => {
      two = new Two({
        type: Two.Types.svg,
        width,
        height
      }).appendTo(timelineContainer)

      two.renderer.domElement.style.background = '#111516' // rgb(238,238,228)

      resize()

      two.bind('update', draw)

      two.play()
    }

    initTimeline()
    timelineContainer.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    timelineContainer.addEventListener('wheel', zoom)
    window.addEventListener('resize', resize)

    return () => {
      timelineContainer.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      timelineContainer.removeEventListener('wheel', zoom)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <div ref={timelineContainerRef}></div>
}

export default Timeline
