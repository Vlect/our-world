import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.19/+esm';
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
gltfLoader.load('our.glb', (gltf) => {
    gltf.scene.traverse(child => {
        if (child.name === 'Node') {
            console.log({child});
            const GunHiveTurrent1Texture = textureLoader.load('hobbies/couch.jpg');
            GunHiveTurrent1Texture.flipY = false;
            GunHiveTurrent1Texture.colorSpace = THREE.SRGBColorSpace;
            child.children[0].material =  new THREE.MeshBasicMaterial({
                    map: GunHiveTurrent1Texture
                });
            //child.traverse(innerChild => {
            //    innerChild.material = new THREE.MeshBasicMaterial({
            //        map: GunHiveTurrent1Texture
            //    });
            //});
        }
        if (child.name === 'Cylinder001') {
            console.log({child});
            const GunHiveTurrent1Texture = textureLoader.load('hobbies/island-1.jpg');
            GunHiveTurrent1Texture.flipY = false;
            GunHiveTurrent1Texture.colorSpace = THREE.SRGBColorSpace;
            child.traverse(innerChild => {
                innerChild.material = new THREE.MeshBasicMaterial({
                    map: GunHiveTurrent1Texture
                });
            });
        }
    });
    //gltf.scene.traverse(child => {
    //    //console.log({ name: child.name })
    //    if (child.name === 'kitchentable_A_large_decorated') {
    //        gsap
    //            .to(child.position, {
    //                y: -5,
    //                duration: 2,
    //            }).repeat(-1).yoyo(true);

    //    }

    //    if (child.name === 'GunHiveTurret1') {
    //        console.log({ child });
    //        // Set child's material
    //        const GunHiveTurrent1Texture = textureLoader.load('test1.jpg');
    //        GunHiveTurrent1Texture.flipY = false;
    //        GunHiveTurrent1Texture.colorSpace = THREE.SRGBColorSpace;
    //        child.traverse(innerChild => {
    //            innerChild.material = new THREE.MeshBasicMaterial({
    //                map: GunHiveTurrent1Texture
    //            });
    //        });
    //    }

    //    if (child.name === 'Plane002') {
    //        const screenLight = new THREE.MeshBasicMaterial({
    //            color: "#C06BFF"
    //        });

    //        child.material = screenLight;
    //    }
    //})
    //console.log({ gltf });
    //const bakedMesh = gltf.scene.children.find((child) => child.name === 'portal');
    //portalLightMesh = gltf.scene.children.find((child) => child.name === 'portalLight');
    //const poleLightAMesh = gltf.scene.children.find((child) => child.name === 'poleLightA');
    //const poleLightBMesh = gltf.scene.children.find((child) => child.name === 'poleLightB');

    //// Apply materials
    //bakedMesh.material = bakedMaterial;
    //portalLightMesh.material = portalLightMaterial;
    //poleLightAMesh.material = poleLightMaterial;
    //poleLightBMesh.material = poleLightMaterial;
    scene.add(gltf.scene);
});

const loadHobbiesIsland = (gltf) => {
    gltf.scene.traverse(child => {

    });
}

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

//window.addEventListener('resize', () => {
//    sizes.width = window.innerWidth;
//    sizes.height = window.innerHeight;
//
//    // Update camera
//    camera.aspect = sizes.width / sizes.height;
//    camera.updateProjectionMatrix();
//
//    // Update renderer
//    renderer.setSize(sizes.width, sizes.height);
//    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
//
//    // Update fireflies
//    firefliesMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
//});

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(50, sizes.width / sizes.height, 10, 1000);
camera.position.x = 1;
camera.position.y = 40;
camera.position.z = 100;
//camera.position.set(0, 2, 5);  // Position the camera further away to ensure it captures the model.
//camera.lookAt(0, 0, 0);  // Ensure the camera looks at the center of the scene.
//camera.rotateY(40 * (Math.PI / 180));
//camera.rotateX(-35 * (Math.PI / 180));
scene.add(camera);



// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.minDistance = 50;   // Minimum zoom level to prevent zooming too close
controls.maxDistance = 120;  // Maximum zoom level to avoid zooming too far
//controls.dampingFactor = 0.05; // Adjust for smoother/slower response


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
//window.addEventListener('mousemove', (event) => {
//    mouseX = event.clientX;
//    mouseY = event.clientY;
//
//    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
//    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1; // Y is inverted in WebGL
//});

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
hemiLight.position.set(0, 20, 0);
scene.add(hemiLight);

//const pointLight = new THREE.PointLight(0xffffff, 1);
//pointLight.position.set(10, 10, 10);
//scene.add(pointLight);

// Click event to handle interaction
//window.addEventListener('click', () => {
//    if (intersectedObject) {
//        // Action when portal is clicked
//        console.log('Portal clicked!');
//        // Example: Change portal colors on click
//        //portalLightMaterial.uniforms.uColorStart.value.set('#ff0000');
//        //portalLightMaterial.uniforms.uColorEnd.value.set('#00ff00');
//        // Zoom in animation using GSAP
//        //camera.position.x = 0.1;
//        //camera.position.y = 0.6;
//        //camera.position.z = 3;
//        gsap
//            .to(camera.position, {
//                duration: 1.5,
//                z: 3,
//                y: 0.9,
//                x: 0.1,
//                onComplete: () => {
//                    gsap.to(camera.position, {
//                        duration: 2, // Duration of the zoom in seconds
//                        z: -1.5, // Adjust the value to zoom closer to the portal (smaller z means closer)
//                        y: 0.9,
//                        x: -0.0001,
//                        onComplete: () => {
//                            // Navigate to another page when animation is complete
//                            window.location.href = 'http://localhost:5173/world.html'; // Change this to your desired URL
//                        }
//                    });
//                }
//            });
//
//        // You can also animate other properties like rotation if needed
//        gsap.to(camera.rotation, {
//            duration: 1.5,
//            x: 0,
//            y: 0,
//        });
//    }
//});

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    // Update controls
    controls.update()

    // Update fireflies
    firefliesMaterial.uniforms.uTime.value = elapsedTime;

    // Update portal
    portalLightMaterial.uniforms.uTime.value = elapsedTime;

    // Raycaster to detect mouse intersections
    //raycaster.setFromCamera(mouse, camera);

    //// Check for intersection with the portal mesh
    //if (portalLightMesh) {
    //    const intersects = raycaster.intersectObject(portalLightMesh);

    //    if (intersects.length > 0) {
    //        // Hover effect: change color if hovering over the portal
    //        if (intersectedObject !== portalLightMesh) {
    //            portalLightMaterial.uniforms.uColorStart.value.set('#ffffff');
    //            intersectedObject = portalLightMesh;

    //            // Show the card and position it using the stored mouseX and mouseY
    //            cardView.style.display = 'block';
    //            cardView.style.top = `${mouseY + 10}px`; // Use the stored mouse position
    //            cardView.style.left = `${mouseX + 10}px`;
    //            cardView.style.zIndex = 1;
    //        }
    //    } else {
    //        // Reset hover effect if not hovering over the portal
    //        if (intersectedObject) {
    //            portalLightMaterial.uniforms.uColorStart.value.set(debugObject.portalColorStart);
    //            intersectedObject = null;

    //            // Hide the card
    //            cardView.style.display = 'none';
    //        }
    //    }
    //}

    // Render the scene
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};

tick();


//import * as THREE from 'three';
//import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
//import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
//
//var vertexShader = `
//#define SCALE 10.0 // Adjust this scale as needed
//
//varying vec2 vUv;
//
//uniform float uTime;
//
//float calculateSurface(float x, float z) {
//    float y = 0.0;
//    y += (sin(x * 1.0 / SCALE + uTime * 1.0) + sin(x * 2.3 / SCALE + uTime * 1.5) + sin(x * 3.3 / SCALE + uTime * 0.4)) / 3.0;
//    y += (sin(z * 0.2 / SCALE + uTime * 1.8) + sin(z * 1.8 / SCALE + uTime * 1.8) + sin(z * 2.8 / SCALE + uTime * 0.8)) / 3.0;
//    return y;
//}
//
//void main() {
//    vUv = uv * SCALE;  // Apply a scaling factor to the UV coordinates
//    
//    vec3 pos = position;
//    
//    float strength = 1.0;
//    pos.y += strength * calculateSurface(pos.x, pos.z);
//    pos.y -= strength * calculateSurface(0.0, 0.0);
//
//    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
//}  
//`;
//
//var fragmentShader = `
//varying vec2 vUv;
//
//uniform sampler2D uMap;
//uniform float uTime;
//uniform vec3 uColor;
//
//void main() {
//    vec2 uv = vUv * 10.0 + vec2(uTime * -0.05);
//
//    uv.y += 0.01 * (sin(uv.x * 3.5 + uTime * 0.35) + sin(uv.x * 4.8 + uTime * 1.05) + sin(uv.x * 7.3 + uTime * 0.45)) / 3.0;
//    uv.x += 0.12 * (sin(uv.y * 4.0 + uTime * 0.5) + sin(uv.y * 6.8 + uTime * 0.75) + sin(uv.y * 11.3 + uTime * 0.2)) / 3.0;
//    uv.y += 0.12 * (sin(uv.x * 4.2 + uTime * 0.64) + sin(uv.x * 6.3 + uTime * 1.65) + sin(uv.x * 8.2 + uTime * 0.45)) / 3.0;
//
//    vec4 tex1 = texture2D(uMap, uv * 1.0);
//    vec4 tex2 = texture2D(uMap, uv * 1.0 + vec2(0.2));
//
//    vec3 blue = uColor;
//
//    gl_FragColor = vec4(blue + vec3(tex1.a * 0.9 - tex2.a * 0.02), 1.0);
//}
//`;
//
//var _renderer, _scene, _camera, _controls;
//var _geometry, _shader, _mesh;
//
//let raycaster = new THREE.Raycaster(); // For drag and drop functionality
//let mouse = new THREE.Vector2();
//let selectedObject = null;
//let isDragging = false;
//let isCameraMoving = false;
//
//const mapLimit = {
//    xMin: -250,
//    xMax: 250,
//    zMin: -250,
//    zMax: 250
//};
//
//const zoomLimit = {
//    minDistance: 10,
//    maxDistance: 100
//};
//
//// Camera movement speed
//const cameraSpeed = 0.5;
//
//// Store initial positions for dragging
//let dragOffset = new THREE.Vector3();
//let startDragging = false;
//
////=====// World //========================================//     
//
//function initWorld() {
//    _renderer = new THREE.WebGLRenderer();
//    _renderer.setPixelRatio(2);
//    _renderer.setSize(window.innerWidth, window.innerHeight);
//    _renderer.setClearColor(0xffffff);
//    document.body.appendChild(_renderer.domElement);
//
//    // Enable shadow maps
//    _renderer.shadowMap.enabled = true; // Ensure this is after the renderer is initialized
//    _renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Optional: Choose a shadow map type
//
//    _scene = new THREE.Scene();
//
//    // Adjust the camera position for a "bird's-eye" view from the sky
//    _camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
//    _camera.position.set(0, 200, 250); // Set camera high and a bit far
//    _camera.lookAt(new THREE.Vector3(0, 0, 0)); // Make the camera look at the center of the plane
//
//    window.addEventListener('resize', resize, false);
//    window.addEventListener('mousemove', onMouseMove, false);
//    window.addEventListener('mousedown', onMouseDown, false);
//    window.addEventListener('mouseup', onMouseUp, false);
//    window.addEventListener('wheel', onMouseWheel, false);
//    resize();
//    requestAnimationFrame(render);
//}
//
//function resize() {
//    _renderer.setSize(window.innerWidth, window.innerHeight);
//    _camera.aspect = window.innerWidth / window.innerHeight;
//    _camera.updateProjectionMatrix();
//}
//
//
////=====// Load GLB models //========================================//     
//let loadedModel; // Store the loaded model reference
////=====// Load GLB Model and Position on Waves //==========//
//
//function calculateWaveHeight(x, z) {
//    const SCALE = 10.0;
//    let y = 0.0;
//    y += (Math.sin(x * 1.0 / SCALE) + Math.sin(x * 2.3 / SCALE) + Math.sin(x * 3.3 / SCALE)) / 3.0;
//    y += (Math.sin(z * 0.2 / SCALE) + Math.sin(z * 1.8 / SCALE) + Math.sin(z * 2.8 / SCALE)) / 3.0;
//    return y;
//}
//
//function loadGLBModel() {
//    const loader = new GLTFLoader();
//    loader.load('Small Platformer Kit-glb/Medium Island.glb', (gltf) => {
//        loadedModel = gltf.scene;
//        loadedModel.scale.set(100, 100, 50);
//
//        const x = 50, z = 50;
//        const y = calculateWaveHeight(x, z);
//        loadedModel.position.set(x, y, z);
//
//        loadedModel.traverse((child) => {
//            if (child.isMesh) {
//                child.castShadow = true;
//                child.receiveShadow = true;
//            }
//        });
//
//        _scene.add(loadedModel);
//    });
//}
////function loadGLBModel() {
////    for (let i = 1; i < 4; i++) {
////        const loader = new GLTFLoader();
////
////        // Replace the URL with the path to your GLB model
////        loader.load('Small Platformer Kit-glb/Medium Island.glb', (gltf) => {
////            loadedModel = gltf.scene;
////            loadedModel.scale.set(100, 100, 50); // Adjust scale if necessary
////            loadedModel.position.set(0, -50, 50); // Place the model slightly above the plane
////            // RotateX 45 degrees to make it look like a platform
////            loadedModel.rotateX(25 * (Math.PI / 180));
////
////            // Enable shadow casting and receiving
////            loadedModel.traverse((child) => {
////                if (child.isMesh) {
////                    child.castShadow = true; // Enable shadow casting for the model
////                    child.receiveShadow = true; // Enable shadow receiving if needed
////                }
////            });
////
////            _scene.add(loadedModel); // Add the model to the scene
////        },
////            undefined,
////            (error) => {
////                console.error('An error occurred while loading the GLB model:', error);
////            });
////    }
////}
//
////=====// Scene //========================================//     
//
//function initScene() {
//    initGeometry();
//    initShader();
//    initMesh();
//    loadGLBModel(); // Load the GLB model
//    requestAnimationFrame(loop);
//}
//
//function initGeometry() {
//    _geometry = new THREE.PlaneGeometry(5000, 5000, 100, 100);
//    _geometry.rotateX(-Math.PI / 2);
//}
//
//function initShader() {
//    var uniforms = {
//        uMap: { type: 't', value: null },
//        uTime: { type: 'f', value: 0 },
//        uColor: { type: 'f', value: new THREE.Color('#0051da') },
//    };
//
//    _shader = new THREE.ShaderMaterial({
//        uniforms: uniforms,
//        vertexShader: vertexShader,
//        fragmentShader: fragmentShader,
//        side: THREE.DoubleSide,
//    });
//
//    var textureLoader = new THREE.TextureLoader();
//    textureLoader.load('https://cinemont.com/tutorials/zelda/water.png', function(texture) {
//        _shader.uniforms.uMap.value = texture;
//        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
//    });
//}
//
//function initMesh() {
//    _mesh = new THREE.Mesh(_geometry, _shader);
//    _scene.add(_mesh);
//}
//
//// Main render loop, apply map limit and mouse movement
//function render() {
//    requestAnimationFrame(render);
//
//    // Apply the map limit to restrict camera movement
//    if (_camera.position.x < mapLimit.xMin) _camera.position.x = mapLimit.xMin;
//    if (_camera.position.x > mapLimit.xMax) _camera.position.x = mapLimit.xMax;
//    if (_camera.position.z < mapLimit.zMin) _camera.position.z = mapLimit.zMin;
//    if (_camera.position.z > mapLimit.zMax) _camera.position.z = mapLimit.zMax;
//
//    if (isDragging && selectedObject) {
//        if (loadedModel) {
//            const x = loadedModel.position.x;
//            const z = loadedModel.position.z;
//            const y = calculateWaveHeight(x, z);
//            loadedModel.position.y = y;
//        }
//
//        // Raycasting to get the new mouse position during dragging
//        raycaster.setFromCamera(mouse, _camera);
//        const intersects = raycaster.intersectObject(_mesh);
//
//        if (intersects.length > 0 && startDragging) {
//            let intersect = intersects[0];
//            // Set the object position to the mouse intersection, plus the drag offset to avoid position jump
//            selectedObject.position.copy(intersect.point).add(dragOffset);
//        }
//    }
//
//    _renderer.render(_scene, _camera);
//}
//
//// Shader loop for time-dependent water movement
//function loop(e) {
//    requestAnimationFrame(loop);
//    _shader.uniforms.uTime.value = e * 0.001;
//}
//
//// Mousemove handler for camera movement or dragging
//function onMouseMove(event) {
//    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
//    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
//
//    // If dragging an object, update its position
//    if (isDragging && selectedObject) {
//        // Set a flag that dragging has started
//        startDragging = true;
//    }
//
//    // Move the camera only if the mouse is pressed and not dragging an object
//    if (isCameraMoving) {
//        _camera.position.x += (mouse.x * cameraSpeed);
//        _camera.position.z += (mouse.y * cameraSpeed);
//        _camera.lookAt(new THREE.Vector3(0, 0, 0)); // Ensure the camera keeps looking at the center
//    }
//}
//
//// Mousedown handler for picking objects or starting camera movement
//function onMouseDown(event) {
//    raycaster.setFromCamera(mouse, _camera);
//    let intersects = raycaster.intersectObject(_mesh);
//
//    if (intersects.length > 0) {
//        // If the user clicks on an object, start dragging
//        selectedObject = _mesh;
//        isDragging = true;
//
//        // Calculate the offset between the mouse click and the object’s position
//        let intersect = intersects[0];
//        dragOffset.subVectors(selectedObject.position, intersect.point);
//        startDragging = false;  // Reset the dragging start flag to prevent jumping
//    } else {
//        // If the user clicks on empty space, start moving the camera
//        isCameraMoving = true;
//    }
//}
//
//// Mouseup handler for releasing objects or stopping camera movement
//function onMouseUp(event) {
//    // Stop dragging or moving the camera when the mouse is released
//    isDragging = false;
//    selectedObject = null;
//    isCameraMoving = false;
//    startDragging = false; // Reset the drag start flag
//}
//
//// Mousewheel handler to limit zoom in and out
//function onMouseWheel(event) {
//    const zoomAmount = event.deltaY * 0.05;
//    _camera.position.y += zoomAmount;
//
//    if (_camera.position.y < 200) {
//        _camera.position.y = 200; // Prevent getting too close to the plane
//    }
//
//    if (_camera.position.y > 300) {
//        _camera.position.y = 300; // Prevent zooming too far out
//    }
//}
//
//function addLights() {
//    // Ambient Light (provides overall light)
//    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); // Color, Intensity
//    _scene.add(ambientLight);
//
//    // Directional Light (like the sun, casting shadows)
//    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
//    directionalLight.position.set(50, 100, 50); // Position the light
//    directionalLight.castShadow = true; // Enable shadows if needed
//    directionalLight.shadow.mapSize.width = 1024; // Optional: Increase shadow resolution
//    directionalLight.shadow.mapSize.height = 1024;
//    _scene.add(directionalLight);
//}
//
//// Initialize the world and scene
//initWorld();
//initScene();
//addLights(); // Add lights after initializing the scene

//import GUI from 'lil-gui'
//import * as THREE from 'three'
//import { MapControls } from 'three/addons/controls/MapControls.js';
//
//// Set up scene, camera, and renderer
//const scene = new THREE.Scene();
//const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
//const renderer = new THREE.WebGLRenderer({ antialias: true });
//renderer.setSize(window.innerWidth, window.innerHeight);
//document.body.appendChild(renderer.domElement);
//
//// Add a simple light source
//const light = new THREE.DirectionalLight(0xffffff, 1);
//light.position.set(10, 20, 10);
//scene.add(light);
//
//// Add ambient light
//const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
//scene.add(ambientLight);
//
//// Ocean-style vertex shader
//const vertexShader = `
//#define SCALE 10.0
//
//varying vec2 vUv;
//
//uniform float uTime;
//
//float calculateSurface(float x, float z) {
//    float y = 0.0;
//    y += (sin(x * 1.0 / SCALE + uTime * 1.0) + sin(x * 2.3 / SCALE + uTime * 1.5) + sin(x * 3.3 / SCALE + uTime * 0.4)) / 3.0;
//    y += (sin(z * 0.2 / SCALE + uTime * 1.8) + sin(z * 1.8 / SCALE + uTime * 1.8) + sin(z * 2.8 / SCALE + uTime * 0.8)) / 3.0;
//    return y;
//}
//
//void main() {
//    vUv = uv;
//    vec3 pos = position;
//    
//    float strength = 1.0;
//    pos.y += strength * calculateSurface(pos.x, pos.z);
//    pos.y -= strength * calculateSurface(0.0, 0.0);
//
//    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
//}`;
//
//// Ocean-style fragment shader
//const fragmentShader = `
//varying vec2 vUv;
//
//uniform sampler2D uMap;
//uniform float uTime;
//uniform vec3 uColor;
//
//void main() {
//    vec2 uv = vUv * 10.0 + vec2(uTime * -0.05);
//
//    uv.y += 0.01 * (sin(uv.x * 3.5 + uTime * 0.35) + sin(uv.x * 4.8 + uTime * 1.05) + sin(uv.x * 7.3 + uTime * 0.45)) / 3.0;
//    uv.x += 0.12 * (sin(uv.y * 4.0 + uTime * 0.5) + sin(uv.y * 6.8 + uTime * 0.75) + sin(uv.y * 11.3 + uTime * 0.2)) / 3.0;
//    uv.y += 0.12 * (sin(uv.x * 4.2 + uTime * 0.64) + sin(uv.x * 6.3 + uTime * 1.65) + sin(uv.x * 8.2 + uTime * 0.45)) / 3.0;
//
//    vec4 tex1 = texture2D(uMap, uv * 1.0);
//    vec4 tex2 = texture2D(uMap, uv * 1.0 + vec2(0.2));
//
//    vec3 blue = uColor;
//
//    gl_FragColor = vec4(blue + vec3(tex1.a * 0.9 - tex2.a * 0.02), 1.0);
//}`;
//
//// Load texture for water effect
//const textureLoader = new THREE.TextureLoader();
//const waterTexture = textureLoader.load('https://cinemont.com/tutorials/zelda/water.png');
//
//// Create the ocean shader material
//const oceanMaterial = new THREE.ShaderMaterial({
//    uniforms: {
//        uMap: { type: 't', value: waterTexture },
//        uTime: { type: 'f', value: 0 },
//        uColor: { type: 'f', value: new THREE.Color('#0051da') },
//    },
//    vertexShader: vertexShader,
//    fragmentShader: fragmentShader,
//    side: THREE.DoubleSide
//});
//
//waterTexture.wrapS = waterTexture.wrapT = THREE.RepeatWrapping; // Ensure texture repeats
//
//// Create plane geometry and apply the ocean shader
//const oceanGeometry = new THREE.PlaneGeometry(5000, 5000, 100, 100); // Normal size plane
//oceanGeometry.rotateX(-Math.PI / 2);  // Flat plane
//const oceanMesh = new THREE.Mesh(oceanGeometry, oceanMaterial);
//scene.add(oceanMesh);
//
//// Set the camera position for a down-left view
//camera.position.set(0, 500, 1500);  // Move camera diagonally up and to the right
//camera.lookAt(new THREE.Vector3(0, 0, 0));  // Look at the center of the plane
//
//// Define the boundaries for the camera position (map limits)
//const mapLimit = 2400;
//
//// Mouse dragging variables
//let isDragging = false;
//let previousMousePosition = {
//    x: 0,
//    y: 0
//};
//
//// Add event listeners for mouse dragging
//document.addEventListener('mousedown', function(event) {
//    isDragging = true;
//    previousMousePosition = {
//        x: event.clientX,
//        y: event.clientY
//    };
//});
//
//document.addEventListener('mouseup', function() {
//    isDragging = false;
//});
//
//document.addEventListener('mousemove', function(event) {
//    if (isDragging) {
//        const deltaMove = {
//            x: event.clientX - previousMousePosition.x,
//            y: event.clientY - previousMousePosition.y
//        };
//
//        // Apply movement to the camera based on mouse movement
//        const moveFactor = 0.5;  // Adjust the movement sensitivity
//        const velocity = {
//            x: deltaMove.x * moveFactor,
//            z: deltaMove.y * -moveFactor
//        };
//
//        // Update the camera position
//        camera.position.x -= velocity.x;
//        camera.position.z += velocity.z;
//
//        // Clamp the camera's position within the map limits
//        camera.position.x = THREE.MathUtils.clamp(camera.position.x, -mapLimit, mapLimit);
//        camera.position.z = THREE.MathUtils.clamp(camera.position.z, -mapLimit, mapLimit);
//
//        // Update the previous mouse position
//        previousMousePosition = {
//            x: event.clientX,
//            y: event.clientY
//        };
//    }
//});
//
//// Render loop
//function animate(time) {
//    requestAnimationFrame(animate);
//
//    // Update shader time
//    oceanMaterial.uniforms.uTime.value = time * 0.001;
//
//    // Render the scene
//    renderer.render(scene, camera);
//}
//
//animate();
//
//window.addEventListener('wheel', function(event) {
//    const zoomAmount = event.deltaY * 0.05;
//    camera.position.y += zoomAmount;
//
//    if (camera.position.y < 200) {
//        camera.position.y = 200; // Prevent getting too close to the plane
//    }
//
//    if (camera.position.y > 500) {
//        camera.position.y = 500; // Prevent zooming too far out
//    }
//});
//
//// Listen for window resize
//window.addEventListener('resize', () => {
//    renderer.setSize(window.innerWidth, window.innerHeight);
//    camera.aspect = window.innerWidth / window.innerHeight;
//    camera.updateProjectionMatrix();
//});
//import GUI from 'lil-gui'
//import * as THREE from 'three'
//import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
//import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
//import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
//
//// Draco loader
//const dracoLoader = new DRACOLoader();
//dracoLoader.setDecoderPath('draco/');
//
//const gltfLoader = new GLTFLoader();
//gltfLoader.setDRACOLoader(dracoLoader);
//
//// Set up scene, camera, and renderer
//const scene = new THREE.Scene();
//const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
//const renderer = new THREE.WebGLRenderer({ antialias: true });
//renderer.setSize(window.innerWidth, window.innerHeight);
//document.body.appendChild(renderer.domElement);
//
//// Add a simple light source
//const light = new THREE.DirectionalLight(0xffffff, 1);
//light.position.set(100, 20, 10);
//scene.add(light);
//
//// Add ambient light
//const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
//scene.add(ambientLight);
//
//// Add fog to the scene (optional to hide the far edges of the map)
//scene.fog = new THREE.Fog(0xcce0ff, 200, 800); // Set fog color, start distance, end distance
//
//// Load a texture for the plane
//const textureLoader = new THREE.TextureLoader();
//const texture = textureLoader.load('baked_grass.jpg');
//const heightMap = textureLoader.load('https://threejsfundamentals.org/threejs/resources/images/heightmap-96x96.png');
//
//// Create the plane geometry
//const planeGeometry = new THREE.PlaneGeometry(5000, 5000, 100, 100);
//
//// Create the plane material with height map and texture
//const planeMaterial = new THREE.ShaderMaterial({
//    vertexShader: `
//        uniform sampler2D displacementMap;
//        varying vec2 vUv;
//        void main() {
//            vUv = uv;
//            vec3 newPosition = position;
//            newPosition.z += texture2D(displacementMap, uv).r * 20.0; // Apply displacement from height map
//            gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
//        }
//    `,
//    fragmentShader: `
//        uniform sampler2D textureMap; // Add uniform for texture
//        varying vec2 vUv;
//        void main() {
//            vec3 color = texture2D(textureMap, vUv).rgb; // Use texture for color
//            gl_FragColor = vec4(color, 1.0);
//        }
//    `,
//    uniforms: {
//        displacementMap: { value: heightMap },
//        textureMap: { value: texture }, // Pass the texture to the shader
//    }
//});
//
//const plane = new THREE.Mesh(planeGeometry, planeMaterial);
//plane.rotation.x = -Math.PI / 2; // Rotate plane to lay flat
//scene.add(plane);
//
//// Function to randomly place trees (simple cones as trees)
//function addRandomRocks001(count) {
//    // Function to randomly place rocks
//    const rocksTexture = textureLoader.load('rocks001.jpg');
//    rocksTexture.flipY = false;
//    rocksTexture.colorSpace = THREE.SRGBColorSpace;
//
//    /**
//     * Materials
//     */
//    // Rocks Baked material
//    const rocksBakedMaterial = new THREE.MeshBasicMaterial({
//        map: rocksTexture
//    });
//
//    for (let i = 0; i < count; i++) {
//        gltfLoader.load('rocks001.glb', (gltf) => {
//            const bakedMesh = gltf.scene.children.find((child) => child.name === 'Cube015');
//            // Apply materials
//            bakedMesh.material = rocksBakedMaterial;
//            bakedMesh.position.set(
//                Math.random() * 3000 - 500, // Random X position
//                10, // Slightly above the plane
//                Math.random() * 3000 - 500  // Random Z position
//            );
//            // Random rotation between 45 and -45 degrees
//            bakedMesh.rotation.y = (Math.random() - 0.5) * Math.PI / 4;
//            // Random scale
//            bakedMesh.scale.set(20, 20, 20);
//            scene.add(gltf.scene);
//        });
//    }
//}
//
//// Add 100 random rocks
//addRandomRocks001(100);
//
//// Function to randomly place trees (simple cones as trees)
//function addRandomTrees(count) {
//    const treeGeometry = new THREE.ConeGeometry(10, 20, 8);
//    const treeMaterial = new THREE.MeshBasicMaterial({ color: 0x228B22 });
//
//    for (let i = 0; i < count; i++) {
//        const tree = new THREE.Mesh(treeGeometry, treeMaterial);
//        tree.position.set(
//            Math.random() * 2000 - 500, // Random X position
//            10, // Slightly above the plane
//            Math.random() * 2000 - 500  // Random Z position
//        );
//        scene.add(tree);
//    }
//}
//
//// Add 100 random trees
////addRandomTrees(100);
//
///**
// * Camera
// */
//camera.position.x = 4;
//camera.position.y = 8;
//camera.position.z = 4.4;
////camera.rotateY(40 * (Math.PI / 180));
//camera.rotateX(-45 * (Math.PI / 180));
//camera.position.set(0, 100, 300);
//
//// Variables to track dragging
////
//// Define the boundaries of the map
//const mapLimit = 300; // Adjust this value to match the size of your map
//
//let isDragging = false;
//let previousMousePosition = { x: 0, y: 0 };
//let velocity = { x: 0, z: 0 };
//let decelerationFactor = 0.95; // Controls how quickly the movement slows down
//let isDecelerating = false;
//
//// Listen for mouse events to implement drag functionality
//document.addEventListener('mousedown', function(event) {
//    isDragging = true;
//    isDecelerating = false; // Stop decelerating when a new drag starts
//    previousMousePosition = {
//        x: event.clientX,
//        y: event.clientY
//    };
//});
//
//document.addEventListener('mouseup', function() {
//    isDragging = false;
//    isDecelerating = true; // Start decelerating when mouse is released
//});
//
//document.addEventListener('mousemove', function(event) {
//    if (isDragging) {
//        const deltaMove = {
//            x: event.clientX - previousMousePosition.x,
//            y: event.clientY - previousMousePosition.y
//        };
//
//        //const deltaX = deltaMove.x * 0.1;
//        //const deltaZ = deltaMove.y * -0.1;
//        velocity.x = deltaMove.x * 0.1;
//        velocity.z = deltaMove.y * -0.1;
//
//        // Update the camera position based on mouse movement
//        camera.position.x -= velocity.x;
//        camera.position.z += velocity.z;
//
//        // Clamp the camera's position within the map limits
//        camera.position.x = Math.max(-mapLimit, Math.min(mapLimit, camera.position.x));
//        camera.position.z = Math.max(-mapLimit, Math.min(mapLimit, camera.position.z));
//
//        // Also update the camera's target if needed
//        previousMousePosition = {
//            x: event.clientX,
//            y: event.clientY
//        };
//    }
//});
//
//// Apply deceleration in the animation loop
//function applyDeceleration() {
//    if (isDecelerating) {
//        // Apply deceleration to the velocity
//        velocity.x *= decelerationFactor;
//        velocity.z *= decelerationFactor;
//
//        // Move the camera based on decelerating velocity
//        camera.position.x -= velocity.x;
//        camera.position.z += velocity.z;
//
//        // Clamp the camera's position within the map limits
//        camera.position.x = Math.max(-mapLimit, Math.min(mapLimit, camera.position.x));
//        camera.position.z = Math.max(-mapLimit, Math.min(mapLimit, camera.position.z));
//
//        // Stop deceleration when the velocity is very small
//        if (Math.abs(velocity.x) < 0.01 && Math.abs(velocity.z) < 0.01) {
//            isDecelerating = false;
//        }
//    }
//}
//
//// Prevent the user from zooming too far out or too close
//window.addEventListener('wheel', function(event) {
//    const zoomAmount = event.deltaY * 0.05;
//    camera.position.y += zoomAmount;
//
//    if (camera.position.y < 50) {
//        camera.position.y = 50; // Prevent getting too close to the plane
//    }
//
//    if (camera.position.y > 100) {
//        camera.position.y = 100; // Prevent zooming too far out
//    }
//});
//
//// Resize handler
//window.addEventListener('resize', () => {
//    renderer.setSize(window.innerWidth, window.innerHeight);
//    camera.aspect = window.innerWidth / window.innerHeight;
//    camera.updateProjectionMatrix();
//});
//
//// Animation loop
//function animate() {
//    requestAnimationFrame(animate);
//
//    // Apply deceleration
//    applyDeceleration();
//
//    renderer.render(scene, camera);
//}
//
//animate();

//// Set up scene, camera, and renderer
//const scene = new THREE.Scene();
//const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
//const renderer = new THREE.WebGLRenderer({ antialias: true });
//renderer.setSize(window.innerWidth, window.innerHeight);
//document.body.appendChild(renderer.domElement);
//
//// Add orbit controls with damping
//const controls = new OrbitControls(camera, renderer.domElement);
//controls.enableDamping = true; // Smooth camera movement
//
//// Camera movement restrictions
//controls.minDistance = 80; // Min zoom distance
//controls.maxDistance = 80; // Max zoom distance
//controls.minPolarAngle = Math.PI / 4; // Prevent the camera from rotating below the plane
//controls.maxPolarAngle = Math.PI / 4; // Prevent the camera from rotating below the plane
//
//// Optionally restrict panning movement by monitoring camera position
//const mapLimit = 500;
//controls.addEventListener('change', () => {
//  // Limit camera movement within the bounds of the map
//  camera.position.x = Math.max(-mapLimit, Math.min(mapLimit, camera.position.x));
//  camera.position.z = Math.max(-mapLimit, Math.min(mapLimit, camera.position.z));
//});
//
//// Add a simple light source
//const light = new THREE.DirectionalLight(0xffffff, 1);
//light.position.set(10, 20, 10);
//scene.add(light);
//
//// Add ambient light
//const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
//scene.add(ambientLight);
//
//// Add fog to the scene (optional to hide the far edges of the map)
//scene.fog = new THREE.Fog(0xcce0ff, 200, 800); // Set fog color, start distance, end distance
//
//// Load a texture for the plane
//const textureLoader = new THREE.TextureLoader();
//const texture = textureLoader.load('https://threejsfundamentals.org/threejs/resources/images/wall.jpg');
//const heightMap = textureLoader.load('https://threejsfundamentals.org/threejs/resources/images/heightmap-96x96.png');
//
//// Create the plane geometry
//const planeGeometry = new THREE.PlaneGeometry(1000, 1000, 100, 100);
//
//// Create the plane material with height map and custom shader for color
//const planeMaterial = new THREE.ShaderMaterial({
//  vertexShader: `
//    uniform sampler2D displacementMap;
//    varying vec2 vUv;
//    void main() {
//      vUv = uv;
//      vec3 newPosition = position;
//      newPosition.z += texture2D(displacementMap, uv).r * 20.0; // Apply displacement from height map
//      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
//    }
//  `,
//  fragmentShader: `
//    varying vec2 vUv;
//    void main() {
//      vec3 color = mix(vec3(0.8, 0.8, 1.0), vec3(0.2, 0.6, 0.8), vUv.y); // Simple color gradient
//      gl_FragColor = vec4(color, 1.0);
//    }
//  `,
//  uniforms: {
//    displacementMap: { value: heightMap },
//  }
//});
//
//const plane = new THREE.Mesh(planeGeometry, planeMaterial);
//plane.rotation.x = -Math.PI / 2; // Rotate plane to lay flat
//scene.add(plane);
//
//// Function to randomly place trees (simple cones as trees)
//function addRandomTrees(count) {
//  const treeGeometry = new THREE.ConeGeometry(10, 20, 8);
//  const treeMaterial = new THREE.MeshBasicMaterial({ color: 0x228B22 });
//
//  for (let i = 0; i < count; i++) {
//    const tree = new THREE.Mesh(treeGeometry, treeMaterial);
//    tree.position.set(
//      Math.random() * 1000 - 500, // Random X position
//      10, // Slightly above the plane
//      Math.random() * 1000 - 500  // Random Z position
//    );
//    scene.add(tree);
//  }
//}
//
//// Add 100 random trees
//addRandomTrees(100);
//
//// Set up camera position
//camera.position.set(0, 100, 300);
//controls.update();
//
//// Resize handler
//window.addEventListener('resize', () => {
//  renderer.setSize(window.innerWidth, window.innerHeight);
//  camera.aspect = window.innerWidth / window.innerHeight;
//  camera.updateProjectionMatrix();
//});
//
//// Animation loop
//function animate() {
//  requestAnimationFrame(animate);
//  controls.update();
//  renderer.render(scene, camera);
//}
//
//animate();

//import GUI from 'lil-gui'
//import * as THREE from 'three'
//import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
//import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
//import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
//
///**
// * Base
// */
//// Debug
//const gui = new GUI({
//    width: 400
//})
//
//// Canvas
//const canvas = document.querySelector('canvas.webgl')
//
//// Scene
//const scene = new THREE.Scene()
//
///**
// * Loaders
// */
//// Texture loader
//const textureLoader = new THREE.TextureLoader()
//
//// Draco loader
//const dracoLoader = new DRACOLoader()
//dracoLoader.setDecoderPath('draco/')
//
//// GLTF loader
//const gltfLoader = new GLTFLoader()
//gltfLoader.setDRACOLoader(dracoLoader)
//
///**
// * Object
// */
//const cube = new THREE.Mesh(
//    new THREE.BoxGeometry(1, 1, 1),
//    new THREE.MeshBasicMaterial()
//)
//
//scene.add(cube)
//
///**
// * Sizes
// */
//const sizes = {
//    width: window.innerWidth,
//    height: window.innerHeight
//}
//
//window.addEventListener('resize', () =>
//{
//    // Update sizes
//    sizes.width = window.innerWidth
//    sizes.height = window.innerHeight
//
//    // Update camera
//    camera.aspect = sizes.width / sizes.height
//    camera.updateProjectionMatrix()
//
//    // Update renderer
//    renderer.setSize(sizes.width, sizes.height)
//    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
//})
//
///**
// * Camera
// */
//// Base camera
//const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
//camera.position.x = 4
//camera.position.y = 2
//camera.position.z = 4
//scene.add(camera)
//
//// Controls
//const controls = new OrbitControls(camera, canvas)
//controls.enableDamping = true
//
///**
// * Renderer
// */
//const renderer = new THREE.WebGLRenderer({
//    canvas: canvas,
//    antialias: true
//})
//renderer.setSize(sizes.width, sizes.height)
//renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
//
///**
// * Animate
// */
//const clock = new THREE.Clock()
//
//const tick = () =>
//{
//    const elapsedTime = clock.getElapsedTime()
//
//    // Update controls
//    controls.update()
//
//    // Render
//    renderer.render(scene, camera)
//
//    // Call tick again on the next frame
//    window.requestAnimationFrame(tick)
//}
//
//tick()
