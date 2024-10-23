import * as THREE from 'three'
import vertexShader from '../shaders/vertex.glsl?raw'
import fragmentShader from '../shaders/fragment.glsl?raw'
import ASScroll from '@ashthornton/asscroll'
import gsap from 'gsap'

const asscroll = new ASScroll({
  disableRaf: true,
})
asscroll.enable()

export default function () {
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
  })
  const container = document.querySelector('#container')

  container.appendChild(renderer.domElement)

  const canvasSize = {
    width: window.innerWidth,
    height: window.innerHeight,
  }

  const clock = new THREE.Clock()
  const textureLoader = new THREE.TextureLoader()
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(75, canvasSize.width / canvasSize.height, 0.1, 100)
  camera.position.set(0, 0, 50)
  //html이랑 단위 맞추는 시야각 설정 공식이 잇다함...밑에꺼
  camera.fov = Math.atan(canvasSize.height / 2 / 50) * (180 / Math.PI) * 2

  const imageRepository = []

  const loadImages = async () => {
    const images = [...document.querySelectorAll('main .content img')]
    const fetchImages = images.map(
      (image) =>
        new Promise((resolve, reject) => {
          image.onload = resolve(image)
          image.onerror = reject
        })
    )
    const loadedImages = await Promise.all(fetchImages) //안의 모든 이미지들이 Resolve 됬는지 체크
    return loadedImages
  }

  const createImages = (images) => {
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: {
          value: null,
        },
        uTime: {
          value: 0,
        },
        uHover: {
          value: 0,
        },
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: THREE.DoubleSide,
    })

    const imageMeshes = images.map((image) => {
      const { width, height } = image.getBoundingClientRect()
      const clonedMaterial = material.clone()
      clonedMaterial.uniforms.uTexture.value = textureLoader.load(image.src)

      const geometry = new THREE.PlaneGeometry(width, height, 16, 16)
      const mesh = new THREE.Mesh(geometry, clonedMaterial)

      imageRepository.push({ img: image, mesh })

      return mesh
    })

    return imageMeshes
  }

  const create = async () => {
    const loadedImages = await loadImages()
    const images = createImages([...loadedImages])
    scene.add(...images)
  }

  const resize = () => {
    canvasSize.width = window.innerWidth
    canvasSize.height = window.innerHeight

    camera.aspect = canvasSize.width / canvasSize.height
    camera.fov = Math.atan(canvasSize.height / 2 / 50) * (180 / Math.PI) * 2
    camera.updateProjectionMatrix()

    renderer.setSize(canvasSize.width, canvasSize.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  }

  const retransform = () => {
    imageRepository.forEach(({ img, mesh }) => {
      const { width, height, top, left } = img.getBoundingClientRect()
      const { width: originWidth } = mesh.geometry.parameters
      const scale = width / originWidth
      mesh.scale.x = scale
      mesh.scale.y = scale
      //html이랑 좌표값 체계 맞추는 공식 적용
      //three.js는 0,0이 가운데 포지션, Html은 0,0이면 우측 상단이 포지션
      //세로:캔버스 사이즈를 2로 나눈 만큼 올리고(y축은 +면 위로/-면 아래로 이동, mesh 정중앙이 최상단이 됨), 높이/2만큼 내리면 mesh의 꼭대기 == html 꼭대기가 됨.
      //가로:캔버스 사이즈를 2로 나눈 만큼 좌측으로 옮기고(x축은 -여야 좌측 이동, mesh 정중앙이 좌측에 붙음), 가로/2만큼 더하면 mesh의 왼쪽 == html 왼쪽이 됨.
      //이제 위에서 구한 가로세로 값에 top, left를 빼거나 더하면 원하는 위치로 이동 가능
      mesh.position.y = canvasSize.height / 2 - height / 2 - top
      mesh.position.x = -canvasSize.width / 2 + width / 2 + left
    })
  }

  const addEvent = () => {
    window.addEventListener('resize', resize)
    imageRepository.forEach(({ img, mesh }) => {
      img.addEventListener('mouseenter', () => {
        gsap.to(mesh.material.uniforms.uHover, {
          value: 1,
          duration: 0.4,
          ease: 'power1.inOut',
        })
      })
      img.addEventListener('mouseout', () => {
        gsap.to(mesh.material.uniforms.uHover, {
          value: 0,
          duration: 0.4,
          ease: 'power1.inOut',
        })
      })
    })
  }

  const draw = () => {
    renderer.render(scene, camera)
    retransform()

    asscroll.update()
    imageRepository.forEach(({ img, mesh }) => {
      mesh.material.uniforms.uTime.value = clock.getElapsedTime()
    })

    requestAnimationFrame(() => {
      draw()
    })
  }

  const initialize = async () => {
    await create()
    addEvent()
    resize()
    draw()
  }

  initialize().then()
}
