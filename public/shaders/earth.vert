varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;

void main(){
    vUv=uv;
    vNormal=normal;
    
    vec4 modelViewPosition=modelViewMatrix*vec4(position,1.);
    vViewPosition=-modelViewPosition.xyz;
    gl_Position=projectionMatrix*modelViewPosition;
}