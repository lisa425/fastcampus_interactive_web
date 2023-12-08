import CanvasOption from "./CanvasOption.js";
import { randomNumBetween } from "./utils.js";

export default class Tail extends CanvasOption{
    constructor(x, vy, color){
        super()
        this.x = x 
        this.y = this.canvasHeight
        this.vy = vy 
        this.color = color 
        this.angle = randomNumBetween(0,2)
        this.friction = 0.985
        this.opacity
    }

    update(){
        this.vy *= this.friction
        this.y += this.vy

        this.angle += 1
        this.x += Math.cos(this.angle)

        this.opacity = -this.vy * 0.1
    }

    draw(){
        this.ctx.fillStyle = `hsla(${this.color}, 100%, 65%, ${this.opacity})`
        this.ctx.beginPath()
        this.ctx.arc(this.x, this.y , 1, 0, Math.PI * 2)
        this.ctx.fill()
        this.ctx.closePath()
    }
}