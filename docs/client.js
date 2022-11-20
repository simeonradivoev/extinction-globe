import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { GUI } from 'lil-gui';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { BloomPass } from 'three/examples/jsm/postprocessing/BloomPass.js';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js';

THREE.Cache.enabled = true;
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 2;

const renderer = new THREE.WebGLRenderer();
renderer.outputEncoding = THREE.LinearEncoding;
renderer.autoClear = false;
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const composer = new EffectComposer(renderer);

const renderPass = new RenderPass(scene, camera, undefined, undefined, undefined);
const bloomPass = new BloomPass(0.75);
const effectFilm = new FilmPass(0.1, 0.5, 1448, false);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
directionalLight.position.set(2, 0, 10).normalize();
scene.add(directionalLight);

composer.addPass(renderPass);
composer.addPass(bloomPass);
composer.addPass(effectFilm);

const controls = new OrbitControls(camera, renderer.domElement);
controls.rotateSpeed = 0.3;
controls.enablePan = false;

const world = {
    time: 0,
    mapIndex: 0,
    lightAngle: Math.PI * 0.75,
    ambientLight: "#101213",
    ambientLightIntensity: 0.2,
    fresnelPower: 2,
    fresnelColor: "#2a4d6f",
    fresnelHDR: 1
};

const ambient = new THREE.AmbientLight(world.ambientLight, world.ambientLightIntensity);
scene.add(ambient);

const timeRange = document.getElementById("timeRange");
const geometry = new THREE.SphereGeometry(1, 64, 32);
const textureLoader = new THREE.TextureLoader();
const maps = [];
for (let i = 0; i < 90; i++)
{
    maps.push(textureLoader.load(`./images/earth/map (${i + 1}).jpg`));
}
const video = document.getElementById('video');
video.play();
video.playbackRate = 0.5;
timeRange.oninput = e =>
{
    world.time = e.target.value;
    video.currentTime = e.target.value * video.duration;
};
timeRange.onmousedown = e =>
{
    video.pause();
};
video.ontimeupdate = e =>
{
    timeRange.value = video.currentTime / video.duration;
};
const videoTexture = new THREE.VideoTexture(video);
const fileLoader = new THREE.FileLoader();
const earthFragmentShader = await fileLoader.loadAsync("./shaders/earth.frag");
const earthVertexShader = await fileLoader.loadAsync("./shaders/earth.vert");
const uniforms = {
    map: { type: 't', value: videoTexture },
    fresnelPower: { type: 'float', value: 2 },
    fresnelColor: { type: 'vec3', value: new THREE.Color(world.fresnelColor).multiplyScalar(world.fresnelHDR) },
    ambientColor: { type: 'vec3', value: new THREE.Color(world.ambientLight) }
};

const material = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([

        THREE.UniformsLib.common,
        THREE.UniformsLib.lights,
        uniforms

    ]),
    vertexShader: earthVertexShader,
    fragmentShader: earthFragmentShader.replace("#include<external>", THREE.ShaderChunk.common),
    lights: true
});

console.log(THREE.ShaderChunk.lights_pars_begin);

const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
const time = new THREE.Clock();

window.onkeydown = e =>
{
    switch (e.keyCode)
    {
        case 32:
            video.paused ? video.play() : video.pause();
    }
};

window.addEventListener(
    'resize',
    () =>
    {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        render(0);
    },
    false
);

const stats = Stats();
document.body.appendChild(stats.dom);

const gui = new GUI();
const worldFolder = gui.addFolder('World');
worldFolder.add(world, "lightAngle", 0, Math.PI * 2);

worldFolder.addColor(world, "ambientLight")._onChange = updateUniforms;
worldFolder.add(world, "ambientLightIntensity", 0, 1)._onChange = updateUniforms;
worldFolder.add(world, "fresnelPower", 1, 4)._onChange = updateUniforms;
worldFolder.addColor(world, "fresnelColor")._onChange = updateUniforms;
worldFolder.add(world, "fresnelHDR")._onChange = updateUniforms;

function updateUniforms()
{
    ambient.color = new THREE.Color(world.ambientLight);
    ambient.intensity = world.ambientLightIntensity;
    material.uniforms.fresnelPower.value = world.fresnelPower;
    material.uniforms.fresnelColor.value = new THREE.Color(world.fresnelColor).multiplyScalar(world.fresnelHDR);
}

function animate()
{
    const delta = time.getDelta();
    requestAnimationFrame(animate);
    controls.update();
    render(delta);
    stats.update();
}

function render(deltaTime)
{
    renderer.clear();
    composer.render(deltaTime);
    //renderer.render(scene, camera);
}

animate();
