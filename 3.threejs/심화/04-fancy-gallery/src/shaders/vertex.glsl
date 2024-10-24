varying vec2 vUv;
uniform float uTime;
uniform float uHover;
uniform float uHoverX;
uniform float uHoverY;

void main(){
    vec2 toCenter = uv - 0.5;
    float dist = length(toCenter);
    float dir = dot(toCenter, vec2(uHoverX,uHoverY));
    float strength = 0.5;

    float wave = sin(dist * 20.0 - uTime * 5.0);
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    modelPosition.z += wave * dist * dir * strength * uHover;

    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
    vUv = uv;
}