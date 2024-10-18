import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

import firefliesVertexShader from './shaders/fireflies/vertex.glsl';
import firefliesFragmentShader from './shaders/fireflies/fragment.glsl';
import portalVertexShader from './shaders/portal/vertex.glsl';
import portalFragmentShader from './shaders/portal/fragment.glsl';

export class PortalScene {
    constructor(renderer, switchBackCallback) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 10, 30); // Adjust for your portal scene view

        this.renderer = renderer;
        this.switchBackCallback = switchBackCallback;

        // Draco loader for optimized model loading
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('draco/');

        // GLTF loader to load the portal model
        const gltfLoader = new GLTFLoader();
        gltfLoader.setDRACOLoader(dracoLoader);

        // Set up your portal scene (using the same setup from your existing code)
        this.initPortalScene(gltfLoader);

        // Add controls (if necessary)
        const controls = new OrbitControls(this.camera, renderer.domElement);
        controls.enableDamping = true;

        // Add interaction to switch back to the world scene
        window.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                // Switch back to the sky world scene
                this.switchBackCallback();
            }
        });
    }

    initPortalScene(gltfLoader) {
        // Texture loader
        const textureLoader = new THREE.TextureLoader();
        const bakedTexture = textureLoader.load('baked.jpg');
        bakedTexture.flipY = false;
        bakedTexture.colorSpace = THREE.SRGBColorSpace;

        // Materials
        const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture });
        const poleLightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffe5 });

        // Portal light material with shader
        const portalLightMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uColorStart: { value: new THREE.Color('#78f0f2') },
                uColorEnd: { value: new THREE.Color('#e7a4f4') }
            },
            vertexShader: portalVertexShader,
            fragmentShader: portalFragmentShader
        });

        // Load the portal model
        gltfLoader.load('portal.glb', (gltf) => {
            const bakedMesh = gltf.scene.children.find((child) => child.name === 'Cube011');
            const portalLightMesh = gltf.scene.children.find((child) => child.name === 'portalLight');
            const poleLightAMesh = gltf.scene.children.find((child) => child.name === 'poleLightA');
            const poleLightBMesh = gltf.scene.children.find((child) => child.name === 'poleLightB');

            // Apply materials
            bakedMesh.material = bakedMaterial;
            portalLightMesh.material = portalLightMaterial;
            poleLightAMesh.material = poleLightMaterial;
            poleLightBMesh.material = poleLightMaterial;

            this.scene.add(gltf.scene);
        });

        // Fireflies setup
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

        const fireflies = new THREE.Points(firefliesGeometry, firefliesMaterial);
        this.scene.add(fireflies);

        // Animation loop for the fireflies and portal light
        const clock = new THREE.Clock();
        const animate = () => {
            const elapsedTime = clock.getElapsedTime();
            firefliesMaterial.uniforms.uTime.value = elapsedTime;
            portalLightMaterial.uniforms.uTime.value = elapsedTime;

            this.renderer.render(this.scene, this.camera);
            requestAnimationFrame(animate);
        };

        animate();
    }

    resize() {
        // Resize the portal scene
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    update() {
        // Render the portal scene
        this.renderer.render(this.scene, this.camera);
    }
}

