import * as THREE from 'three'
import vertexShader from '../shaders/vertex.glsl?raw'
import fragmentShader from '../shaders/fragment.glsl?raw'
import ASScroll from '@ashthornton/asscroll'
import gsap from 'gsap'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import postVertexShader from '../shaders/postprocessing/vertex.glsl?raw'
import postFragmentShader from '../shaders/postprocessing/fragment.glsl?raw'
import Swup from 'swup'
import SwupJsPlugin from '@swup/js-plugin'

let asscroll = new ASScroll({
  disableRaf: true,
})
asscroll.enable()

export default function () {
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
  })
  const composer = new EffectComposer(renderer)

  const canvasSize = {
    width: window.innerWidth,
    height: window.innerHeight,
  }

  const raycaster = new THREE.Raycaster()
  const clock = new THREE.Clock()
  const textureLoader = new THREE.TextureLoader()
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(75, canvasSize.width / canvasSize.height, 0.1, 100)
  camera.position.set(0, 0, 50)
  //html이랑 단위 맞추는 시야각 설정 공식이 잇다함...밑에꺼
  camera.fov = Math.atan(canvasSize.height / 2 / 50) * (180 / Math.PI) * 2

  let imageRepository = []
  let animationId = ''

  const swup = new Swup({
    plugins: [
      new SwupJsPlugin([
        {
          from: '(.*)',
          to: '(.*)',
          out: async (next, infos) => {
            //기존 데이터 청소
            asscroll.disable()
            imageRepository.forEach(({ mesh }) => {
              scene.remove(mesh)
            })
            imageRepository = []
            window.removeEventListener('resize', resize)

            await gsap.to('#swup', {
              opacity: 0,
              duration: 0.25,
            })
          },
          in: async (next, infos) => {
            await gsap.to('#swup', {
              opacity: 1,
              duration: 0.25,
              onComplete: () => {
                //다시 initialize
                next()
                window.cancelAnimationFrame(animationId)
                asscroll = new ASScroll({
                  disableRaf: true,
                })
                asscroll.enable()
                initialize().then()
              },
            })
          },
        },
      ]),
    ],
  })

  const loadImages = async () => {
    const images = [...document.querySelectorAll('main .content img')]
    const fetchImages = images.map(
      (image) =>
        new Promise((resolve, reject) => {
          const img = new Image()
          img.src = image.src
          img.onload = resolve(image)
          img.onerror = reject
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
        uHoverX: {
          value: 0.5, //중앙
        },
        uHoverY: {
          value: 0.5,
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

    composer.setSize(canvasSize.width, canvasSize.height)
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

  const addPostEffects = () => {
    const renderPass = new RenderPass(scene, camera)
    composer.addPass(renderPass)

    const customShader = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: {
          value: null,
        },
        uTime: {
          value: 0,
        },
        uScrolling: {
          value: 0,
        },
      },
      vertexShader: postVertexShader,
      fragmentShader: postFragmentShader,
    })
    const customPass = new ShaderPass(customShader)

    composer.addPass(customPass)
    return {
      customShader,
    }
  }

  const addEvent = (effects) => {
    const { customShader } = effects
    asscroll.on('update', ({ targetPos, currentPos }) => {
      const speed = Math.abs(targetPos - currentPos) //scroll 동작여부, 음수일 수도 있으니까 절대값으로 변환
      if (speed > 5) {
        //스크롤을 했다면
        gsap.to(customShader.uniforms.uScrolling, {
          value: 1,
          duration: 0.4,
        })
      } else {
        gsap.to(customShader.uniforms.uScrolling, {
          value: 0,
          duration: 0.4,
        })
      }
    })

    //mousemove
    window.addEventListener('mousemove', (e) => {
      const pointer = {
        x: (e.clientX / canvasSize.width) * 2 - 1,
        y: -(e.clientY / canvasSize.height) * 2 + 1,
      }
      raycaster.setFromCamera(pointer, camera)

      const intersects = raycaster.intersectObjects(scene.children)
      if (intersects.length > 0) {
        //교차하는 메시가 있다
        let mesh = intersects[0].object
        mesh.material.uniforms.uHoverX.value = intersects[0].uv.x - 0.5
        mesh.material.uniforms.uHoverY.value = intersects[0].uv.y - 0.5
      }
    })

    //resize
    window.addEventListener('resize', resize)

    //hover wave
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

  const draw = (effects) => {
    const { customShader } = effects

    composer.render()
    // renderer.render(scene, camera)
    retransform()

    asscroll.update()
    customShader.uniforms.uTime.value = clock.getElapsedTime()

    imageRepository.forEach(({ img, mesh }) => {
      mesh.material.uniforms.uTime.value = clock.getElapsedTime()
    })

    animationId = requestAnimationFrame(() => {
      draw(effects)
    })
  }

  const initialize = async () => {
    const container = document.querySelector('#container')

    container.appendChild(renderer.domElement)

    await create()
    const effects = addPostEffects()
    addEvent(effects)
    resize()
    draw(effects)
  }

  initialize().then()
}
