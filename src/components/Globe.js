// eslint-disable-next-line no-unused-vars
import React, { useState, useRef, useEffect } from 'react'
// eslint-disable-next-line no-unused-vars
import PinWindow, { setVisibility } from './PinWindow'
import plusIcon from '../image/plusIcon.png'
import * as THREE from 'three'
import Two from 'two.js'
import { collection, addDoc, GeoPoint } from 'firebase/firestore'
import { db } from './connection'
import gsap from 'gsap'
import countries from './countries.json'
import globeTexture from '../image/globe.jpg' // ../image/globe-highRes-white.png
import '../tailwind.css'

const vertexShader = `varying vec2 vertexUV;
varying vec3 vertexNormal;
void main() {
    vertexUV = uv;
    vertexNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`

const fragmentShader = `uniform sampler2D globeTexture;
varying vec2 vertexUV;
varying vec3 vertexNormal;
void main() {
    float intensity = 1.05 - dot(vertexNormal, vec3(0.0, 0.0, 1.0));
    vec3 atmosphere = vec3(0.3, 0.6, 1.0) * pow(intensity, 1.5);
    gl_FragColor = vec4(atmosphere + texture2D(globeTexture, vertexUV).xyz, 1.0);
}`

const coneVertexShader = `varying vec3 vertexNormal;
void main() {
    vertexNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 0.9);
}`

const coneFragmentShader = `varying vec3 vertexNormal;
void main() {
    float intensity = pow(-dot(vertexNormal, vec3(0.0, 0.0, 1.0)), 2.0)/1.25;
    gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * (1.0 - intensity);
}`

let year = 0
let bce = 'CE'

export const updateYear = (newYear, newBCE) => {
  year = newYear
  bce = newBCE
}

const group = new THREE.Group()

const centerPoint = new THREE.Mesh(
  new THREE.SphereGeometry(1, 24, 12),
  new THREE.MeshBasicMaterial({
    color: 0xffff00
  })
)
centerPoint.position.set(0, 0, 0)
group.add(centerPoint)

let tempPin

export const createPinFromCoords = (lat, lng) => {
  if (tempPin) {
    group.remove(tempPin)
    tempPin = undefined
  }

  tempPin = new THREE.Mesh(
    new THREE.ConeGeometry(0.2, 0.5, 6, 1, false, 0.5),
    new THREE.ShaderMaterial({
      vertexShader: coneVertexShader,
      fragmentShader: coneFragmentShader
    })
  )

  const radius = 5.25

  const latitude = (lat * Math.PI) / 180
  const longitude = (lng * Math.PI) / 180 + Math.PI / 2

  const x = radius * Math.cos(latitude) * Math.sin(longitude)
  const y = radius * Math.sin(latitude)
  const z = radius * Math.cos(latitude) * Math.cos(longitude)

  const pos = new THREE.Vector3(x, y, z)

  tempPin.position.copy(pos)

  tempPin.geometry.rotateX(Math.PI / 2)
  tempPin.lookAt(centerPoint)
  group.add(tempPin)
}

let divX = 15
let divY = 70

const Globe = () => {
  const globeRef = useRef(null)
  const pinWindowRef = useRef(null)
  const [pin, setPin] = useState(null)
  let scene, camera, renderer, canvas

  const windowHeight = window.innerHeight
  const width = 425
  const height = 2 * windowHeight / 3

  const textPadding = '50px'
  const bottomPadding = '30px'

  useEffect(() => {
    scene = new THREE.Scene()
    scene.background = new THREE.Color(0x111516) // 0xeeeee4

    camera = new THREE.PerspectiveCamera(75, innerWidth / (innerHeight * 0.8), 0.1, 1000)

    renderer = new THREE.WebGLRenderer({
      antialias: true
    })

    canvas = renderer.domElement
    canvas.id = 'globeCanvas'
    document.body.appendChild(canvas)

    renderer.setSize(innerWidth, innerHeight * 0.8)
    renderer.setPixelRatio(devicePixelRatio)

    globeRef.current.appendChild(renderer.domElement)

    const geometry = new THREE.SphereGeometry(5, 50, 50)
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        globeTexture: {
          value: new THREE.TextureLoader().load(globeTexture)
        }
      }
    })
    const sphere = new THREE.Mesh(geometry, material)

    let pinDrag = false
    let click = false

    group.add(sphere)
    scene.add(group)

    const starGeometry = new THREE.BufferGeometry()
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff
    })

    const starVertices = []
    for (let i = 0; i < 10000; i++) {
      const x = (Math.random() - 0.5) * 2000
      const y = (Math.random() - 0.5) * 2000
      const z = -Math.random() * 3000
      starVertices.push(x, y, z)
    }

    starGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(
        starVertices, 3)
    )

    const stars = new THREE.Points(starGeometry, starMaterial)
    const starGroup = new THREE.Group()
    starGroup.add(stars)
    scene.add(starGroup)

    camera.position.z = 12

    const createBoxes = (countries) => {
      countries.forEach((country) => {
        const scale = country.population / 1000000000
        const lat = country.latlng[0]
        const lng = country.latlng[1]
        const zScale = 0.8 * scale

        const box = new THREE.Mesh(
          new THREE.BoxGeometry(
            Math.max(0.1, 0.2 * scale),
            Math.max(0.1, 0.2 * scale),
            Math.max(zScale, 0.4 * Math.random())),
          new THREE.MeshBasicMaterial({
            color: 'rgb(43, 227, 255)', // #FF9EFD
            opacity: 0.4,
            transparent: true
          })
        )

        const latitude = (lat / 180) * Math.PI
        const longitude = (lng / 180) * Math.PI + Math.PI / 2
        const radius = 5

        const x = radius * Math.cos(latitude) * Math.sin(longitude)
        const y = radius * Math.sin(latitude)
        const z = radius * Math.cos(latitude) * Math.cos(longitude)

        box.position.x = x
        box.position.y = y
        box.position.z = z

        box.lookAt(0, 0, 0)
        box.geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0, -zScale / 2))

        group.add(box)

        gsap.to(box.scale, {
          z: 1.4,
          duration: 2,
          yoyo: true,
          repeat: -1,
          ease: 'linear',
          delay: Math.random()
        })

        box.country = country.name.common
        box.population = new Intl.NumberFormat().format(country.population)
      })
    }

    createBoxes(countries)

    group.rotation.offset = {
      x: 0,
      y: 0
    }

    starGroup.rotation.offset = {
      x: 0,
      y: 0
    }

    const mouse = {
      x: undefined,
      y: undefined,
      down: false,
      xPrev: undefined,
      yPrev: undefined
    }

    const raycaster = new THREE.Raycaster()
    const popUpEl = document.querySelector('#popUpEl')
    const populationEl = document.querySelector('#populationEl')
    const populationValueEl = document.querySelector('#populationValueEl')

    const scaleFactor = 8
    const scaleVector = new THREE.Vector3()

    const animate = () => {
      requestAnimationFrame(animate)
      renderer.render(scene, camera)

      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObjects(group.children.filter(mesh => {
        return mesh.geometry.type === 'BoxGeometry'
      }))

      group.children.forEach(mesh => {
        mesh.material.opacity = 0.4
      })

      gsap.set(popUpEl, {
        display: 'none'
      })

      for (let i = 0; i < intersects.length; i++) {
        const box = intersects[i].object
        box.material.opacity = 1
        gsap.set(popUpEl, {
          display: 'block'
        })

        populationEl.innerHTML = box.country
        populationValueEl.innerHTML = box.population
      }

      if (tempPin) {
        const scale = scaleVector.subVectors(tempPin.position, camera.position).length() / scaleFactor
        tempPin.scale.set(scale, scale, scale)
      }

      renderer.render(scene, camera)
    }

    animate()

    const getMouseSpherePos = (intersects) => {
      const pos = new THREE.Vector3()
      sphere.worldToLocal(pos.copy(intersects[0].point))

      const spherical = new THREE.Spherical()
      spherical.setFromVector3(pos)

      const latitude = Math.PI / 2 - spherical.phi
      const longitude = spherical.theta
      const radius = 5.25

      const x = radius * Math.cos(latitude) * Math.sin(longitude)
      const y = radius * Math.sin(latitude)
      const z = radius * Math.cos(latitude) * Math.cos(longitude)

      return new THREE.Vector3(x, y, z)
    }

    const createPin = (event) => {
      const offset = globeRef.current.getBoundingClientRect().top
      mouse.x = (event.clientX / innerWidth) * 2 - 1
      mouse.y = -((event.clientY - offset) / innerHeight) * 2 + 1

      const intersects = raycaster.intersectObject(sphere)
      if (intersects.length > 0) {
        tempPin = new THREE.Mesh(
          new THREE.ConeGeometry(0.2, 0.5, 6, 1, false, 0.5),
          new THREE.ShaderMaterial({
            vertexShader: coneVertexShader,
            fragmentShader: coneFragmentShader
          })
        )

        tempPin.position.copy(getMouseSpherePos(intersects))
        tempPin.geometry.rotateX(Math.PI / 2)
        tempPin.lookAt(centerPoint.position)
        group.add(tempPin)

        setPin({ year, bce, lat: tempPin.position.y, lng: tempPin.position.x })
      }
    }

    const inPin = () => {
      return tempPin ? raycaster.intersectObject(tempPin).length > 0 : false
    }

    const pinWindowDiv = pinWindowRef.current
    if (!pinWindowDiv) return
    const windowDel = document.getElementById('windowDel')
    const publishButton = document.getElementById('publishButton')

    pinWindowDiv.style.visibility = pin ? 'visible' : 'hidden'

    let drag = false
    let mouseX = 0
    let mouseY = 0
    let prevX = 0
    let prevY = 0

    if (pin) {
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
      return (x > divX && x < divX + width * 0.95 && y > divY && y < divY + 100)
    }

    const handleMouseDown = (event) => {
      event.preventDefault()

      mouseX = event.clientX
      mouseY = event.clientY
      if (withinPinWindowBounds(mouseX, mouseY)) {
        console.log('hi down')
        prevX = mouseX
        prevY = mouseY
        drag = true
        return
      }

      click = true
      const { clientX, clientY } = event
      if (inPin()) {
        pinDrag = true
      } else {
        mouse.down = true
      }
      mouse.xPrev = clientX
      mouse.yPrev = clientY
    }

    const handleMouseMove = (event) => {
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
        } else if (divY > windowHeight - height) {
          divY = windowHeight - height
        }
        prevX = mouseX
        prevY = mouseY

        gsap.set(pinWindowDiv, {
          x: divX,
          y: divY
        })
        return
      }

      click = false
      if (innerWidth >= 1280) {
        mouse.x = ((event.clientX) / (innerWidth)) * 2 - 1
        mouse.y = -(event.clientY / (innerHeight * 4 / 5)) * 2 + 1
      } else {
        const offset = globeRef.current.getBoundingClientRect().top
        mouse.x = (event.clientX / innerWidth) * 2 - 1
        mouse.y = -((event.clientY - offset) / (innerHeight * 4 / 5)) * 2 + 1
      }

      gsap.set(popUpEl, {
        x: event.clientX,
        y: event.clientY
      })

      if (pinDrag) {
        const intersects = raycaster.intersectObject(sphere)
        if (intersects.length > 0) {
          tempPin.position.copy(getMouseSpherePos(intersects))
          tempPin.lookAt(centerPoint.position)
          setPin({ year: pin ? pin.year : year, bce: pin ? pin.bce : bce, lat: tempPin.position.y, lng: tempPin.position.x })
        }
      }

      if (mouse.down) {
        event.preventDefault()

        const deltaX = event.clientX - mouse.xPrev
        const deltaY = event.clientY - mouse.yPrev

        group.rotation.offset.x += deltaY * 0.005
        group.rotation.offset.y += deltaX * 0.005

        gsap.to(group.rotation, {
          y: group.rotation.offset.y,
          x: group.rotation.offset.x
        })

        starGroup.rotation.offset.x -= deltaY * 0.005
        starGroup.rotation.offset.y -= deltaX * 0.005

        gsap.to(starGroup.rotation, {
          y: starGroup.rotation.offset.y,
          x: starGroup.rotation.offset.x
        })

        mouse.xPrev = event.clientX
        mouse.yPrev = event.clientY
      }
    }

    const handleMouseUp = (event) => {
      event.preventDefault()
      mouse.down = false
      pinDrag = false

      if (click && !tempPin) {
        createPin(event)
      }

      click = false

      mouseX = event.clientX
      mouseY = event.clientY
      drag = false
    }

    const handleTouchMove = (event) => {
      event.clientX = event.touches[0].clientX
      event.clientY = event.touches[0].clientY

      const doesIntersect = raycaster.intersectObject(sphere)

      if (doesIntersect.length > 0) mouse.down = true

      if (mouse.down) {
        const offset = globeRef.current.getBoundingClientRect().top
        mouse.x = (event.clientX / innerWidth) * 2 - 1
        mouse.y = -((event.clientY - offset) / innerHeight) * 2 + 1

        gsap.set(popUpEl, {
          x: event.clientX,
          y: event.clientY
        })

        event.preventDefault()

        const deltaX = event.clientX - mouse.xPrev
        const deltaY = event.clientY - mouse.yPrev

        group.rotation.offset.x += deltaY * 0.005
        group.rotation.offset.y += deltaX * 0.005

        gsap.to(group.rotation, {
          y: group.rotation.offset.y,
          x: group.rotation.offset.x
        })
        mouse.xPrev = event.clientX
        mouse.yPrev = event.clientY
      }
    }

    const handleTouchEnd = (event) => {
      event.preventDefault()
      mouse.down = false
    }

    const zoom = (event) => {
      event.preventDefault()
      camera.position.z -= event.deltaY * -0.005
      if (camera.position.z < 5.6) {
        camera.position.z = 5.6
      } else if (camera.position.z > 20) {
        camera.position.z = 20
      }
    }

    const resize = (event) => {
      event.preventDefault()
      renderer.setSize(innerWidth, innerHeight * 0.8)
      renderer.setPixelRatio(devicePixelRatio)
      const prevZ = camera.position.z
      camera = new THREE.PerspectiveCamera(75, innerWidth / (innerHeight * 0.8), 0.1, 1000)
      camera.position.z = prevZ

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

    const deleteWindow = () => {
      group.remove(tempPin)
      tempPin = undefined
      setPin(null)
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
      const location = new GeoPoint(pin?.lat, pin?.lng)

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

    canvas.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleTouchEnd)
    canvas.addEventListener('wheel', zoom)
    window.addEventListener('resize', resize)
    windowDel.addEventListener('click', deleteWindow)
    publishButton.addEventListener('click', publish)

    return () => {
      scene.remove(group)
      scene.remove(starGroup)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      canvas.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchmove', handleTouchMove, { passive: false })
      window.removeEventListener('touchend', handleTouchEnd)
      canvas.removeEventListener('wheel', zoom)
      window.removeEventListener('resize', resize)
      windowDel.removeEventListener('click', deleteWindow)
      publishButton.removeEventListener('click', publish)
    }
  }, [divX, divY])

  return <div>
    <div id="popUpEl" className="bg-black bg-opacity-75 fixed px-3 py-2 rounded-lg">
      <h2 className="text-white text-xs">
        <span id = "populationEl"></span>
        <span> Population</span>
      </h2>
      <p id = "populationValueEl" className="text-white font-bold text-lg">300mil</p>
    </div>
    <div ref={globeRef}>
      {/* {<PinWindow year={pin?.year} bce={pin?.bce} lat={pin?.lat} lng={pin?.lng} visible={(pin !== null)}/>} */}
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
          visibility: `${pin ? 'visible' : 'hidden'}`
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
          {pin?.year} {pin?.bce}
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
    </div>
  </div>
}

export default Globe
