import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { convertLatLngToPos, getGradientCanvas } from './utils'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js'
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js'
export default function () {
  const canvasSize = {
    width: window.innerWidth,
    height: window.innerHeight,
  }

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
  })
  renderer.outputEncoding = THREE.sRGBEncoding

  const renderTarget = new THREE.WebGLRenderTarget(canvasSize.width, canvasSize.height, {
    samples: 2,
  }) //안티앨리어싱

  const effectComposer = new EffectComposer(renderer, renderTarget)

  const textureLoader = new THREE.TextureLoader()
  const cubeTextureLoader = new THREE.CubeTextureLoader()
  const environmentMap = cubeTextureLoader.load(['assets/environments/px.png', 'assets/environments/nx.png', 'assets/environments/py.png', 'assets/environments/ny.png', 'assets/environments/pz.png', 'assets/environments/nz.png'])
  environmentMap.encoding = THREE.sRGBEncoding

  const container = document.querySelector('#container')

  container.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  scene.background = environmentMap
  scene.environment = environmentMap

  const camera = new THREE.PerspectiveCamera(75, canvasSize.width / canvasSize.height, 0.1, 100)
  camera.position.set(0, 0, 3)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.1

  const addLight = () => {
    const light = new THREE.DirectionalLight(0xffffff)
    light.position.set(2.65, 2.13, 1.02)
    scene.add(light)
  }

  const addPostEffects = (obj) => {
    const { earthGroup } = obj
    const renderPass = new RenderPass(scene, camera) //pass = 효과같은 것. renderPass는 렌더링 기본 적용
    effectComposer.addPass(renderPass) //effectComposer에 등록해줘야 효과 적용됨.

    const flimPass = new FilmPass(1, 1, 4096, false)
    // effectComposer.addPass(flimPass)

    const unrealBloomPass = new UnrealBloomPass(new THREE.Vector2(canvasSize.width, canvasSize.height))
    // unrealBloomPass.strength = 1
    // unrealBloomPass.threshold = 0.1
    // unrealBloomPass.radius = 1
    // effectComposer.addPass(unrealBloomPass)

    const shaderPass = new ShaderPass(GammaCorrectionShader)
    // const customShaderPass = new ShaderPass({
    //   vertexShader: `
    //     void main(){
    //       gl_Positon = vec4(position.x, position.y, 0.0, 1.0)
    //     }
    //   `,
    //   fragmentShaver: `
    //     void main(){
    //       gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0)
    //     }
    //   `,
    // })
    effectComposer.addPass(shaderPass) //감마쉐이더를 어느 위치에서 적용하냐에 따라 효과가 달라짐.
    // effectComposer.addPass(customShaderPass)
    const smaaPass = new SMAAPass()
    effectComposer.addPass(smaaPass)
  }

  const createEarth1 = () => {
    const material = new THREE.MeshStandardMaterial({
      map: textureLoader.load('assets/earth-night-map.jpg'),
      side: THREE.FrontSide,
      opacity: 0.9,
      transparent: true,
    })
    const geometry = new THREE.SphereGeometry(1.3, 30, 30)
    const mesh = new THREE.Mesh(geometry, material)
    mesh.rotation.y = (Math.PI / 2) * -1

    return mesh
  }

  const createEarth2 = () => {
    const material = new THREE.MeshStandardMaterial({
      map: textureLoader.load('assets/earth-night-map.jpg'),
      opacity: 0.6,
      transparent: true,
      side: THREE.BackSide, //뒤쪽만 렌더링, 안쪽이 다 보이게 됨
    })
    const geometry = new THREE.SphereGeometry(1.5, 30, 30)
    const mesh = new THREE.Mesh(geometry, material)
    mesh.rotation.y = (Math.PI / 2) * -1

    return mesh
  }

  const createStar = (count = 500) => {
    const particleGeometry = new THREE.BufferGeometry()
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i] = (Math.random() - 0.5) * 5
      positions[i + 1] = (Math.random() - 0.5) * 5
      positions[i + 2] = (Math.random() - 0.5) * 5
    }
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.01,
      transparent: true,
      depthWrite: false,
      map: textureLoader.load('assets/particle.png'),
      alphaMap: textureLoader.load('assets/particle.png'), //알파 배경 적용
      color: 0xbcc6c6,
    })

    const star = new THREE.Points(particleGeometry, particleMaterial)
    return star
  }

  const createPoint1 = () => {
    const point = {
      lat: 37.566535 * (Math.PI / 100),
      lng: 126.9779692 * (Math.PI / 100),
    }

    const position = convertLatLngToPos(point, 1.3)

    const mesh = new THREE.Mesh(new THREE.TorusGeometry(0.02, 0.002, 20, 20), new THREE.MeshBasicMaterial({ color: 0x263d64 }))
    mesh.position.set(position.x, position.y, position.z)

    return mesh
  }

  const createPoint2 = () => {
    const point = {
      lat: 5.55363 * (Math.PI / 100),
      lng: -0.196481 * (Math.PI / 100),
    }

    const position = convertLatLngToPos(point, 1.3)

    const mesh = new THREE.Mesh(new THREE.TorusGeometry(0.02, 0.002, 20, 20), new THREE.MeshBasicMaterial({ color: 0x263d64 }))
    mesh.position.set(position.x, position.y, position.z)
    return mesh
  }

  const createCurve = (pos1, pos2) => {
    const points = []
    for (let i = 0; i <= 100; i++) {
      const pos = new THREE.Vector3().lerpVectors(pos1, pos2, i / 100) //두 좌표 사이의 i번째 정점을 반환
      pos.normalize() //1미만으로 정규화
      const wave = Math.sin((Math.PI * i) / 100)

      pos.multiplyScalar(1.3 + 0.2 * wave) //정규화된 값을 확대
      points.push(pos)
    }
    const curve = new THREE.CatmullRomCurve3(points) //3d curve 생성용
    const geometry = new THREE.TubeGeometry(curve, 20, 0.003)
    const gradientCanvas = getGradientCanvas('#757f94', '#263d74')
    const texture = new THREE.CanvasTexture(gradientCanvas)

    const material = new THREE.MeshBasicMaterial({ map: texture })

    const mesh = new THREE.Mesh(geometry, material)

    return mesh
  }

  const create = () => {
    const earthGroup = new THREE.Group()

    const earth1 = createEarth1()
    const earth2 = createEarth2()
    const star = createStar()
    const point1 = createPoint1()
    const point2 = createPoint2()
    const curve = createCurve(point1.position, point2.position)

    earthGroup.add(earth1, earth2, point1, point2, curve)
    scene.add(earthGroup, star)
    return {
      earthGroup,
      star,
    }
  }

  const resize = () => {
    canvasSize.width = window.innerWidth
    canvasSize.height = window.innerHeight

    camera.aspect = canvasSize.width / canvasSize.height
    camera.updateProjectionMatrix()

    renderer.setSize(canvasSize.width, canvasSize.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    effectComposer.setSize(canvasSize.width, canvasSize.height)
  }

  const addEvent = () => {
    window.addEventListener('resize', resize)
  }

  const draw = (obj) => {
    const { earthGroup, star } = obj
    earthGroup.rotation.x += 0.0005
    earthGroup.rotation.y += 0.0005
    star.rotation.x += 0.001
    star.rotation.y += 0.001

    controls.update()
    effectComposer.render()
    // renderer.render(scene, camera)
    requestAnimationFrame(() => {
      draw(obj)
    })
  }

  const initialize = () => {
    const obj = create()

    addLight()
    addPostEffects(obj)
    addEvent()
    resize()
    draw(obj)
  }

  initialize()
}
