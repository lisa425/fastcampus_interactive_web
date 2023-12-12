import Vector from "./Vector.js";

export default class Mouse{
    constructor(canvas){
        this.pos = new Vector(-1000, -1000)
        this.radius = 100 

        canvas.onmousemove = (e) => this.pos.setXY(e.clientX, e.clientY)
        canvas.ontouchmove = (e) => this.pos.setXY(e.touches[0].clientX, e.touches[0].clientY)
    }
}