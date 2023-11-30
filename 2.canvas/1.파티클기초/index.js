const canvas = document.querySelector('canvas')
//그리기 도구, 2d 도구를 사용
const ctx = canvas.getContext('2d');
//dpr이 높을수록 선명한 그래픽 보여줄 수 있음.
const dpr = window.devicePixelRatio;

let canvasWidth;
let canvasHeight;
let particles;

function init(){
    canvasWidth = innerWidth;
    canvasHeight = innerHeight;

    //css의 캔버스 사이즈 변경
    canvas.style.width = canvasWidth + 'px';
    canvas.style.height = canvasHeight + 'px';

    //js에서 캔버스 사이즈 설정, dpr을 곱해서 선명하게 보이도록 처리
    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;
    ctx.scale(dpr, dpr) //scale에 dpr 값을 곱하면 dpr 비율에 맞춰 ctx 크기도 늘어남.

    particles = [];
    
    for(let i=0; i<TOTAL;i++){
        const x = randomNumBetween(0, canvasWidth)
        const y = randomNumBetween(0, canvasHeight)
        const radius = randomNumBetween(50, 100) 
        const vy = randomNumBetween(1,5)
        const particle = new Particle(x,y,radius,vy);
        particles.push(particle);
    }
}

// ctx.fillRect(10,10,50,50) //x,y 10 위치, 가로세로 50인 rect 생성

const feGaussianBlur = document.querySelector('feGaussianBlur')
const feColorMatrix = document.querySelector('feColorMatrix')

const controls = new function(){
    this.blurValue = 40
    this.alphaChannel = 100
    this.alphaOffset = -23
    this.acc = 1.03
}

let gui = new dat.GUI()
const f1 = gui.addFolder('Gooey Effect')
const f2 = gui.addFolder('Particle')
f2.open()

f1.add(controls, 'blurValue', 0, 100).onChange(value => {
    feGaussianBlur.setAttribute('stdDeviation', value)
})
f1.add(controls, 'alphaChannel', 1, 200).onChange(value => {
    feColorMatrix.setAttribute('values', `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${value} ${controls.alphaOffset}`)
})
f1.add(controls, 'alphaOffset', -40, 40).onChange(value => {
    feColorMatrix.setAttribute('values', `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${controls.alphaChannel} ${value}`)
})
f2.add(controls, 'acc', 1, 1.5, 0.01).onChange(value => {
    particles.forEach(particle => particle.acc = value)
})

class Particle{
    constructor(x,y,radius,vy){
        this.x = x
        this.y = y
        this.radius = radius
        this.vy = vy //속도 보정
        this.acc = 1.03 //가속도, 1보다 작으면 멈춰가고, 크면 빨라짐
    }

    update(){
        this.vy *= this.acc
        this.y += this.vy
    }

    draw(){
        ctx.beginPath()//path 시작을 알림
        //x,y,반지름,시작각도(0~360, radian각 사용), 끝각도(0~360, radian각 사용), 시계방향or반시계방향
        ctx.arc(this.x, this.y, this.radius, 0, (Math.PI / 180) * 360)
        ctx.fillStyle = 'orange' //색채우기(red,기본값: black)
        ctx.fill()//색 채우기
        ctx.closePath()//path 닫기
    }
}

const TOTAL = 15;
const randomNumBetween = (min, max) => {
    return Math.random() * (max - min + 1) + min 
}


let interval = 1000 / 60 //60fps 목표
let now, delta;
let then = Date.now();//초기화

function animate(){
    window.requestAnimationFrame(animate) 
    // -> 주사율 기반으로 움직임이 바뀜, fps(frame per second) 값을 이용하여 1초에 몇 번 코드를 실행할 지 조절.
    now = Date.now()
    delta = now - then;
    if(delta < interval) return 

    //ctx 초기화
    ctx.clearRect(0,0,canvasWidth,canvasHeight)
    //x를 1px 이동시키기
    particles.forEach(particle => {
        particle.update()
        particle.draw()
        
        if(particle.y - particle.radius > canvasHeight){
            particle.y = -particle.radius;
            particle.x = randomNumBetween(0,canvasWidth)
            particle.radius = randomNumBetween(50,100)
            particle.vy = randomNumBetween(1,5)
        }
    })

    then = now - (delta % interval);
}

window.addEventListener('load',() => {
    init();
    animate();
})

window.addEventListener('resize',() => {
    init();
})