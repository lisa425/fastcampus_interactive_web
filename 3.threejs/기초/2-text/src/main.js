import * as THREE from 'three'
//facetype.js : 원하는 폰트를 typeface 형식으로 변환해주는 사이트
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import typeface from './assets/fonts/Gmarket Sans TTF Medium_Regular.json'

window.addEventListener('load', function () {
  init()
})

function init() {
  const options = {
    color: 0x00ffff,
  }

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
  })

  renderer.setSize(window.innerWidth, window.innerHeight)

  document.body.appendChild(renderer.domElement)

  const scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 500)

  camera.position.set(0, 0, 5)

  scene.add(camera)

  const controls = new OrbitControls(camera, renderer.domElement)

  const light = new THREE.DirectionalLight(0xffffff, 1)

  scene.add(light)

  const clock = new THREE.Clock()

  //FONT
  const fontLoader = new FontLoader()

  //폰트 가져오기 방법 1: load()
  // fontLoader.load(
  //   './assets/fonts/Gmarket Sans TTF Medium_Regular.json',
  //   (font) => {
  //     //로드 완료
  //     console.log('load', font)
  //   },
  //   (event) => {
  //     //font를 불러오는 동안 실행
  //     console.log('progress', event)
  //   },
  //   (error) => {
  //     //에러 시 실행
  //     console.log('err', error)
  //   }
  // )

  //폰트 가져오기 방법 2: parse()
  fontLoader.parse(typeface)

  render()

  function render() {
    const elapsedTime = clock.getElapsedTime()

    renderer.render(scene, camera)

    requestAnimationFrame(render)
  }

  function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight

    camera.updateProjectionMatrix()

    renderer.setSize(window.innerWidth, window.innerHeight)

    renderer.render(scene, camera)
  }

  // 이벤트
  window.addEventListener('resize', handleResize)
}
