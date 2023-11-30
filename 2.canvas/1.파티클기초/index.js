const canvas = document.querySelector('canvas')

const dpr = window.devicePixelRatio;
//dpr이 높을수록 선명한 그래픽 보여줄 수 있음.

//그리기 도구, 2d 도구를 사용
const ctx = canvas.getContext('2d');
const canvasWidth = 300;
const canvasHeight = 300;

//css의 캔버스 사이즈 변경
canvas.style.width = canvasWidth + 'px';
canvas.style.height = canvasHeight + 'px';

//js에서 캔버스 사이즈 설정, dpr을 곱해서 선명하게 보이도록 처리
canvas.width = canvasWidth * dpr;
canvas.height = canvasHeight * dpr;
ctx.scale(dpr, dpr) //scale에 dpr 값을 곱하면 dpr 비율에 맞춰 ctx 크기도 늘어남.

ctx.fillRect(10,10,50,50) //x,y 10 위치, 가로세로 50인 rect 생성

