uniform sampler2D map;
uniform vec3 fresnelColor;
uniform vec3 ambientLightColor;
uniform float fresnelPower;

#include<external>

#if NUM_DIR_LIGHTS>0
struct DirectionalLight{
    vec3 direction;
    vec3 color;
};
uniform DirectionalLight directionalLights[NUM_DIR_LIGHTS];
void getDirectionalLightInfo(const in DirectionalLight directionalLight,const in GeometricContext geometry,out IncidentLight light){
    light.color=directionalLight.color;
    light.direction=directionalLight.direction;
    light.visible=true;
}
#endif

varying vec2 vUv;
varying vec3 vNormal;

void main(){
    vec3 normal=normalize(vNormal);
    vec3 color=texture2D(map,vUv).rgb;
    vec3 dirDiffuse=vec3(0.);
    for(int i=0;i<NUM_DIR_LIGHTS;i++){
        float nDotL=clamp(dot(directionalLights[i].direction,(viewMatrix*vec4(normal,0.)).xyz),0.,1.);
        dirDiffuse+=directionalLights[i].color*nDotL;
    }
    vec3 fresnel=fresnelColor*pow(1.-clamp(dot((viewMatrix*vec4(normal,0)).xyz,vec3(0,0,1)),0.,1.),fresnelPower);
    gl_FragColor=vec4(dirDiffuse*color+color*ambientLightColor+fresnel,1.);
}