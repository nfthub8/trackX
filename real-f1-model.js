/* REAL F1 MODEL HERO
   This replaces the fake SVG/block car with a real 3D GLB model.
   Put your model at: assets/f1-car.glb
*/

import * as THREE from "https://esm.sh/three@0.160.0";
import { GLTFLoader } from "https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "https://esm.sh/three@0.160.0/examples/jsm/loaders/DRACOLoader.js";

const stage = document.querySelector('.real-model-stage');
const canvas = document.querySelector('#realF1Canvas');
const loaderText = document.querySelector('.f1-model-loader');
const glow = document.querySelector('.f1-hero-glow');
const shadow = document.querySelector('.f1-hero-shadow');

if (stage && canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  camera.position.set(0.15, 0.55, 6.1);

  // Premium studio lights. No floor, no box, transparent background.
  scene.add(new THREE.HemisphereLight(0xffffff, 0x260006, 1.65));

  const key = new THREE.DirectionalLight(0xffffff, 3.1);
  key.position.set(4, 5, 6);
  scene.add(key);

  

  const redRim = new THREE.PointLight(0xff0022, 4.5, 12);
  redRim.position.set(-3.8, 1.2, 2.4);
  scene.add(redRim);

  const goldRim = new THREE.PointLight(0xffc45a, 2.1, 10);
  goldRim.position.set(2.8, 1.8, 3.2);
  scene.add(goldRim);

  const carGroup = new THREE.Group();
  scene.add(carGroup);

  let carModel = null;
  let mixer = null;
  let targetScroll = 0;
  let currentScroll = 0;
  const clock = new THREE.Clock();

  function resize() {
    const rect = stage.getBoundingClientRect();
    renderer.setSize(rect.width, rect.height, false);
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  function fitModelToHero(model) {
    // Normalize whatever GLB you use so it fits the hero automatically.
    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    model.position.sub(center);
    const longest = Math.max(size.x, size.y, size.z);
    model.scale.setScalar((4.2 / longest) * 1.35);

    // Side/front premium angle. Change these if your GLB faces another direction.
    model.rotation.set(0.03, 4, 0);
    model.position.set(0.47, -0.15, 0);
  }

  function improveMaterials(root) {
    root.traverse((child) => {
      if (!child.isMesh) return;
      child.castShadow = false;
      child.receiveShadow = false;

      if (child.material) {
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach((mat) => {
          mat.envMapIntensity = 1.25;
          mat.needsUpdate = true;

          // If model has dull plain material, give it a richer car-paint response.
          if (mat.isMeshStandardMaterial || mat.isMeshPhysicalMaterial) {
            mat.roughness = Math.min(mat.roughness ?? 0.45, 0.42);
            mat.metalness = Math.max(mat.metalness ?? 0.25, 0.28);
          }
        });
      }
    });
  }

  function createFallbackRealisticPlaceholder() {
    // Only appears if you have not added assets/f1-car.glb yet.
    // It is intentionally simple so you know the real GLB is missing.
    const bodyMat = new THREE.MeshPhysicalMaterial({ color: 0xe9001d, metalness: 0.45, roughness: 0.28, clearcoat: 1 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.55 });
    const car = new THREE.Group();

    const body = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.28, 0.55), bodyMat);
    body.position.y = 0.1;
    car.add(body);

    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.28, 2.5, 4), bodyMat);
    nose.rotation.z = Math.PI / 2;
    nose.scale.z = 0.34;
    nose.position.x = -2.45;
    car.add(nose);

    const cockpit = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.42, 0.6), darkMat);
    cockpit.position.set(0.35, 0.46, 0);
    car.add(cockpit);

    [-1.25, 1.45].forEach((x) => {
      [-0.45, 0.45].forEach((z) => {
        const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.24, 48), darkMat);
        tire.rotation.x = Math.PI / 2;
        tire.position.set(x, -0.2, z);
        car.add(tire);
      });
    });

    fitModelToHero(car);
    return car;
  }

  const draco = new DRACOLoader();
  draco.setDecoderPath('https://unpkg.com/three@0.160.0/examples/jsm/libs/draco/');

  const gltfLoader = new GLTFLoader();
  gltfLoader.setDRACOLoader(draco);

  // IMPORTANT: put your realistic F1 GLB here.
  const MODEL_URL = 'assets/f1-car.glb';

  gltfLoader.load(
    MODEL_URL,
    (gltf) => {
      carModel = gltf.scene;
      improveMaterials(carModel);
      fitModelToHero(carModel);
      carGroup.add(carModel);

      if (gltf.animations?.length) {
        mixer = new THREE.AnimationMixer(carModel);
        gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
      }

      if (loaderText) loaderText.remove();
    },
    undefined,
    () => {
      carModel = createFallbackRealisticPlaceholder();
      carGroup.add(carModel);
      if (loaderText) loaderText.textContent = 'ADD assets/f1-car.glb';
    }
  );

  function updateScroll() {
    const hero = document.querySelector('.hero');
    const max = hero ? Math.min(hero.offsetHeight * 0.9, 950) : 900;
    targetScroll = Math.max(0, Math.min(window.scrollY / max, 1));
  }
  window.addEventListener('scroll', updateScroll, { passive: true });
  updateScroll();

  function animate() {
    requestAnimationFrame(animate);
    const dt = clock.getDelta();
    currentScroll += (targetScroll - currentScroll) * 0.075;

    if (mixer) mixer.update(dt);

    // Smooth Apple-style scroll movement: whole car glides/turns, not only tires popping.
    // Scroll animation: move toward top view of the car
    carGroup.position.x = THREE.MathUtils.lerp(0.25, -0.05, currentScroll);

    carGroup.position.y =
  THREE.MathUtils.lerp(-0.02, 0.08, currentScroll) +
  Math.sin(clock.elapsedTime * 1.25) * 0.012;

    // Small side rotation only
    carGroup.rotation.y = THREE.MathUtils.lerp(-0.04, 0.06, currentScroll);

    // Positive X rotation = top view for your model
    carGroup.rotation.x = THREE.MathUtils.lerp(0.03, 0.32, currentScroll);

    // Slight zoom
    carGroup.scale.setScalar(THREE.MathUtils.lerp(1, 1.05, currentScroll));

    // Camera moves slightly closer
    camera.position.y = THREE.MathUtils.lerp(0.55, 0.95, currentScroll);
    camera.position.z = THREE.MathUtils.lerp(6.1, 5.25, currentScroll);
    camera.lookAt(0, 0, 0);

    redRim.intensity = THREE.MathUtils.lerp(3.2, 5.4, currentScroll);
    goldRim.intensity = THREE.MathUtils.lerp(1.4, 2.5, currentScroll);

    if (glow) {
      glow.style.opacity = String(0.45 + currentScroll * 0.45);
      glow.style.transform = `translate(-50%, -50%) scale(${1 + currentScroll * 0.15})`;
    }
    if (shadow) {
      shadow.style.opacity = String(0.32 + currentScroll * 0.18);
      shadow.style.transform = `translateX(${-currentScroll * 40}px) scaleX(${1 - currentScroll * 0.08})`;
    }

    renderer.render(scene, camera);
  }

  animate();
}
