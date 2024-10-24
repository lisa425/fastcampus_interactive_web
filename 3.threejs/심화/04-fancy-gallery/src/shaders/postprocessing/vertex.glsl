varying vec2 vUv;

void main(){
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
    vUv = uv;
}