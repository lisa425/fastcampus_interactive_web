import CanvasOption from "./CanvasOption.js";

export default class Particle extends CanvasOption{
    constructor(x,y,vx,vy,opacity,color){
        super();
        this.x = x
        this.y = y
        this.vx = vx 
        this.vy = vy
        this.opacity = opacity
        this.gravity = 0.12
        this.friction = 0.9
        this.color = color
    }

    update(){
        this.vy += this.gravity

        this.vx *= this.friction
        this.vy *= this.friction

        this.x += this.vx;
        this.y += this.vy;

        this.opacity -= 0.01
    }

    draw(){
        //원 그리기
        this.ctx.fillStyle = `hsla(${this.color}, 100%, 65%, ${this.opacity})`
        this.ctx.beginPath()
        this.ctx.arc(this.x, this.y, 2, 0, Math.PI * 2)
        this.ctx.fill()
        this.ctx.closePath()
    }
}