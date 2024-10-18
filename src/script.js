import GUI from 'lil-gui';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

import firefliesVertexShader from './shaders/fireflies/vertex.glsl';
import firefliesFragmentShader from './shaders/fireflies/fragment.glsl';

import portalVertexShader from './shaders/portal/vertex.glsl';
import portalFragmentShader from './shaders/portal/fragment.glsl';
import { gsap } from 'gsap';

/**
 * Base
 */
// Debug
const debugObject = {};
const gui = new GUI({
    width: 400
});

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader();

// Draco loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('draco/');

// GLTF loader
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

/**
 * Texture
 */
const bakedTexture = textureLoader.load('baked.jpg');
bakedTexture.flipY = false;
bakedTexture.colorSpace = THREE.SRGBColorSpace;

/**
 * Materials
 */
// Baked material
const bakedMaterial = new THREE.MeshBasicMaterial({
    map: bakedTexture
});

// Pole light material
const poleLightMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffe5
});

/**
 * Portal
 */
debugObject.portalColorStart = '#78f0f2';
debugObject.portalColorEnd = '#e7a4f4';

gui.addColor(debugObject, 'portalColorStart').onChange(() => {
    portalLightMaterial.uniforms.uColorStart.value.set(debugObject.portalColorStart);
});

gui.addColor(debugObject, 'portalColorEnd').onChange(() => {
    portalLightMaterial.uniforms.uColorEnd.value.set(debugObject.portalColorEnd);
});

// Portal light material 
const portalLightMaterial = new THREE.ShaderMaterial({
    uniforms: {
        uTime: { value: 0 },
        uColorStart: { value: new THREE.Color(debugObject.portalColorStart) },
        uColorEnd: { value: new THREE.Color(debugObject.portalColorEnd) }
    },
    vertexShader: portalVertexShader,
    fragmentShader: portalFragmentShader
});

/**
 * Load model
 */
let portalLightMesh;
gltfLoader.load('portal.glb', (gltf) => {
    const bakedMesh = gltf.scene.children.find((child) => child.name === 'portal');
    portalLightMesh = gltf.scene.children.find((child) => child.name === 'portalLight');
    const poleLightAMesh = gltf.scene.children.find((child) => child.name === 'poleLightA');
    const poleLightBMesh = gltf.scene.children.find((child) => child.name === 'poleLightB');

    // Apply materials
    bakedMesh.material = bakedMaterial;
    portalLightMesh.material = portalLightMaterial;
    poleLightAMesh.material = poleLightMaterial;
    poleLightBMesh.material = poleLightMaterial;
    scene.add(gltf.scene);
});

/**
 * Fireflies
 */
const firefliesGeometry = new THREE.BufferGeometry();
const firefliesCount = 30;
const positionArray = new Float32Array(firefliesCount * 3);
const scaleArray = new Float32Array(firefliesCount);

for (let i = 0; i < firefliesCount; i++) {
    positionArray[i * 3 + 0] = (Math.random() - 0.5) * 4;
    positionArray[i * 3 + 1] = Math.random() * 2;
    positionArray[i * 3 + 2] = (Math.random() - 0.5) * 4;
    scaleArray[i] = Math.random();
}

firefliesGeometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3));
firefliesGeometry.setAttribute('aScale', new THREE.BufferAttribute(scaleArray, 1));

// Material
const firefliesMaterial = new THREE.ShaderMaterial({
    uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uSize: { value: 200 }
    },
    vertexShader: firefliesVertexShader,
    fragmentShader: firefliesFragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
});

gui.add(firefliesMaterial.uniforms.uSize, 'value').min(0).max(500).step(1).name('firefliesSize');

// Points
const fireflies = new THREE.Points(firefliesGeometry, firefliesMaterial);
scene.add(fireflies);

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Update fireflies
    firefliesMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
});

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100);
camera.position.x = 4;
camera.position.y = 4.2;
camera.position.z = 4.4;
camera.rotateY(40 * (Math.PI / 180));
camera.rotateX(-35 * (Math.PI / 180));
scene.add(camera);

// Controls
//const controls = new OrbitControls(camera, canvas)
//controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

debugObject.clearColor = '#261208';
renderer.setClearColor(debugObject.clearColor);
gui.addColor(debugObject, 'clearColor').onChange(() => {
    renderer.setClearColor(debugObject.clearColor);
});

/**
 * CardView Interaction
 */
const cardView = document.getElementById('cardView');

/**
 * Raycaster and Mouse for interaction
 */
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let intersectedObject = null;

// Variables to store the mouse position
let mouseX = 0;
let mouseY = 0;

// Mouse move event
window.addEventListener('mousemove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1; // Y is inverted in WebGL
});

// Click event to handle interaction
window.addEventListener('click', () => {
    if (intersectedObject) {
        // Action when portal is clicked
        console.log('Portal clicked!');
        // Example: Change portal colors on click
        //portalLightMaterial.uniforms.uColorStart.value.set('#ff0000');
        //portalLightMaterial.uniforms.uColorEnd.value.set('#00ff00');
        // Zoom in animation using GSAP
        //camera.position.x = 0.1;
        //camera.position.y = 0.6;
        //camera.position.z = 3;
        gsap
            .to(camera.position, {
                duration: 1.5,
                z: 3,
                y: 0.9,
                x: 0.1,
                onComplete: () => {
                    gsap.to(camera.position, {
                        duration: 2, // Duration of the zoom in seconds
                        z: -1.5, // Adjust the value to zoom closer to the portal (smaller z means closer)
                        y: 0.9,
                        x: -0.0001,
                        onComplete: () => {
                            // Navigate to another page when animation is complete
                            window.location.href = 'https://our-world-17-10-24.netlify.app/world.html'; // Change this to your desired URL
                        }
                    });
                }
            });

        // You can also animate other properties like rotation if needed
        gsap.to(camera.rotation, {
            duration: 1.5,
            x: 0,
            y: 0,
        });
    }
});

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    // Update controls
    //controls.update()

    // Update fireflies
    firefliesMaterial.uniforms.uTime.value = elapsedTime;

    // Update portal
    portalLightMaterial.uniforms.uTime.value = elapsedTime;

    // Raycaster to detect mouse intersections
    raycaster.setFromCamera(mouse, camera);

    // Check for intersection with the portal mesh
    if (portalLightMesh) {
        const intersects = raycaster.intersectObject(portalLightMesh);

        if (intersects.length > 0) {
            // Hover effect: change color if hovering over the portal
            if (intersectedObject !== portalLightMesh) {
                portalLightMaterial.uniforms.uColorStart.value.set('#ffffff');
                intersectedObject = portalLightMesh;

                // Show the card and position it using the stored mouseX and mouseY
                cardView.style.display = 'block';
                cardView.style.top = `${mouseY + 10}px`; // Use the stored mouse position
                cardView.style.left = `${mouseX + 10}px`;
                cardView.style.zIndex = 1;
            }
        } else {
            // Reset hover effect if not hovering over the portal
            if (intersectedObject) {
                portalLightMaterial.uniforms.uColorStart.value.set(debugObject.portalColorStart);
                intersectedObject = null;

                // Hide the card
                cardView.style.display = 'none';
            }
        }
    }

    // Render the scene
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};

tick();
