import Vector from "./Vector.js";

export default class Dot{
    constructor(x, y){
        this.pos = new Vector(x, y);
        this.oldPos = new Vector(x, y);
        
        this.gravity = new Vector(0, 1);
        this.friction = 0.97 //마찰력

        this.pinned = false
        this.mass = 1
        this.lightImg = document.querySelector('#light-img')
        this.lightSize = 15
    }

    update(mouse){
        if(this.pinned) return 

        let vel = Vector.sub(this.pos, this.oldPos)

        this.oldPos.setXY(this.pos.x, this.pos.y) //이전위치
        
        // vel.x += 0.1 //x 방향으로 이동 및 속도를 0.1씩 증가, 속도가 일정하지 않고 가속도가 붙는 효과
        vel.mult(this.friction) //속도가 어느시점이 되면 수렴
        vel.add(this.gravity)//위와 동일한 원리
        

        //방향벡터를 이용해 마우스쪽으로 공을 끌어당긴다.
        let {x:dx, y: dy} = Vector.sub(mouse.pos, this.pos)
        const dist = Math.sqrt(dx*dx + dy*dy)
        
        const direction = new Vector(dx / dist, dy / dist) //방향벡터
        const force = Math.max((mouse.radius - dist) / mouse.radius, 0) //마우스 반경이 0 이하면 무조건 0으로 유지
        
        if(force > 0.6){
            this.pos.setXY(mouse.pos.x, mouse.pos.y)
        }else{
            this.pos.add(vel)
            this.pos.add(direction.mult(force).mult(5))
        }
    }

    draw(ctx){
        ctx.fillStyle = '#999'
        ctx.fillRect(this.pos.x - this.mass, this.pos.y - this.mass, this.mass*2, this.mass*2)
    }

    drawLight(ctx){
        ctx.drawImage(
            this.lightImg,
            this.pos.x - this.lightSize / 2,
            this.pos.y - this.lightSize / 2,
            this.lightSize, 
            this.lightSize
        )
    }
}