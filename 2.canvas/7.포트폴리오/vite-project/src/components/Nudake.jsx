import { useEffect, useRef } from 'react'
import '../style/components/Nudake.css'
import image1 from '../assets/nudake-1.jpg'
import image2 from '../assets/nudake-2.jpg'
import image3 from '../assets/nudake-3.jpg'
import { drawImageCenter, getAngle, getDistance, getScrupedPercent } from '../utils/utils'
import throttle from 'lodash/throttle'
import gsap from 'gsap'

const Nudake = () => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const canvasParent = canvas.parentNode
    const ctx = canvas.getContext('2d')
    const imageSrcs = [image1, image2, image3]
    const loadedImages = []
    let currIndex = 0
    let prevPos = { x: 0, y: 0 }
    let isChanging = false

    let canvasWidth, canvasHeight

    function resize() {
      canvasWidth = canvasParent.clientWidth
      canvasHeight = canvasParent.clientHeight
      canvas.style.width = canvasWidth + 'px'
      canvas.style.height = canvasHeight + 'px'
      canvas.width = canvasWidth
      canvas.height = canvasHeight
      //dpr값은 필요없음. 이미지만 렌더링하면 되서.

      function preloadImage() {
        return new Promise((resolve, reject) => {
          let loaded = 0
          imageSrcs.forEach((src) => {
            const img = new Image()
            img.src = src
            img.onload = () => {
              loaded += 1
              loadedImages.push(img)
              if (loaded == imageSrcs.length) return resolve()
            }
          })
        })
      }

      //이미지 먼저 로드 후 캔버스 함수 생성, 네트워킹 지연 최적화
      preloadImage().then(() => drawImage())
    }

    function drawImage() {
      isChanging = true

      const image = loadedImages[currIndex]
      const firstDrawing = ctx.globalCompositeOperation === 'source-over'

      gsap.to(canvas, {
        opacity: 0,
        duration: firstDrawing ? 0 : 1,
        onComplete: () => {
          canvas.style.opacity = 1
          ctx.globalCompositeOperation = 'source-over'
          drawImageCenter(canvas, ctx, image)
          const nextImage = imageSrcs[(currIndex + 1) % imageSrcs.length]
          canvasParent.style.backgroundImage = `url(${nextImage})`
          prevPos = null

          isChanging = false
        },
      })
    }

    //마우스 클릭 누른 상태
    function onMousedown(e) {
      //눌르면 마우스무브 이벤트 활성화
      if (isChanging) return
      canvas.addEventListener('mouseup', onMouseUp)
      canvas.addEventListener('mouseleave', onMouseUp)
      canvas.addEventListener('mousemove', onMouseMove)
      prevPos = { x: e.offsetX, y: e.offsetY }
    }
    //마우스 클릭 뗀 상태
    function onMouseUp() {
      //떼면 마우스무브 이벤트 제거
      canvas.removeEventListener('mouseup', onMouseUp)
      canvas.removeEventListener('mouseleave', onMouseUp)
      canvas.removeEventListener('mousemove', onMouseMove)
    }
    //마우스 움직이는 중
    function onMouseMove(e) {
      //마우스 안눌렸으면 move 이벤트 실행 안됨
      if (isChanging) return
      drawCircles(e)
      checkPercent()
    }

    //피타고라스 정의: 두 점 사이의 거리를 구하는 공식
    function drawCircles(e) {
      const nextPos = { x: e.offsetX, y: e.offsetY }
      if (!prevPos) prevPos = nextPos
      const dist = getDistance(prevPos, nextPos)
      const angle = getAngle(prevPos, nextPos)

      for (let i = 0; i < dist; i++) {
        //두 점 사이를 1픽셀씩 돌면서 아크로 채운다.
        const x = prevPos.x + Math.cos(angle) * i
        const y = prevPos.y + Math.sin(angle) * i

        ctx.globalCompositeOperation = 'destination-out' //이게 지우는 효과! 차집합같은 효과
        ctx.beginPath()
        ctx.arc(x, y, 100, 0, Math.PI * 2)
        ctx.fill()
        ctx.closePath()
      }

      prevPos = nextPos
    }

    const checkPercent = throttle(() => {
      const percent = getScrupedPercent(ctx, canvasWidth, canvasHeight)
      if (percent > 50) {
        currIndex = (currIndex + 1) % imageSrcs.length
        drawImage()
      }
    }, 500)

    canvas.addEventListener('mousedown', onMousedown)
    window.addEventListener('resize', resize)
    resize()

    //unmount시 실행
    return () => {
      canvas.removeEventListener('mousedown', onMousedown)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div className="nudake">
      <canvas ref={canvasRef}></canvas>
    </div>
  )
}

export default Nudake
