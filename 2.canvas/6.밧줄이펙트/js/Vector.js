export default class Vector{
    constructor(x, y){
        this.x = x || 0
        this.y = y || 0
    }

    static add(v1, v2){
        return new Vector(v1.x + v2.x, v1.y + v2.y)
    }

    static sub(v1, v2){
        return new Vector(v1.x - v2.x, v1.y - v2.y)
    }

    add(x, y){
        if(arguments.length === 1) {
            this.x += x.x 
            this.y += x.y 
        }else if(arguments.length === 2){
            this.x += x
            this.y += y
        }
        return this
    }

    sub(x, y){
        if(arguments.length === 1) {
            this.x -= x.x 
            this.y -= x.y 
        }else if(arguments.length === 2){
            this.x -= x
            this.y -= y
        }
        return this
    }

    mult(v){
        if(typeof v === 'number'){
            this.x *= v 
            this.y *= v
        }else{
            //숫자가 아니면 벡터
            this.x *= v.x 
            this.y *= v.y 
        }
        return this
    }

    setXY(x,y){
        this.x = x 
        this.y = y 
        return this 
    }

    dist(v){
        //한 벡터로부터 다른 벡터와의 떨어진 거리 
        //두 점의 거리는 피타고라스 정의로 구할 수 있음. dx제곱 + dy제곱에 루트를 씌우면 두 점의 거리를 구할 수 있다.
        //sqrt = 루트씌우기
        const dx = this.x - v.x 
        const dy = this.y - v.y 
        return Math.sqrt(dx*dx + dy*dy)
    }
}