import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

export default function ThreeScene({ tasks, onToggle }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const fontRef = useRef(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const taskGroupRef = useRef(new THREE.Group());

  useEffect(() => {
    const init = async () => {
      const { FontLoader } = await import('three/examples/jsm/loaders/FontLoader.js');
      const loader = new FontLoader();
      loader.load(
        'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/fonts/helvetiker_regular.typeface.json',
        (font) => { fontRef.current = font; renderTasks(); },
        undefined,
        (err) => console.error('Font load error', err)
      );
    };
    init();
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.set(0, 5, 15);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 5;
    controls.maxDistance = 50;
    controls.maxPolarAngle = Math.PI / 2;
    controlsRef.current = controls;

    scene.add(new THREE.AmbientLight(0x404040, 2));
    const dir = new THREE.DirectionalLight(0xffffff, 1);
    dir.position.set(5, 10, 7.5);
    dir.castShadow = true;
    scene.add(dir);

    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(50, 50),
      new THREE.MeshStandardMaterial({ color: 0x00ffff, transparent: true, opacity: 0.1, side: THREE.DoubleSide })
    );
    plane.rotation.x = -Math.PI / 2;
    plane.receiveShadow = true;
    scene.add(plane);

    scene.add(new THREE.AxesHelper(10));
    scene.add(new THREE.GridHelper(50, 50, 0x888888, 0x444444));

    taskGroupRef.current.name = 'taskGroup';
    scene.add(taskGroupRef.current);

    let stop = false
    const animate = () => {
      if (stop) return;
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const ro = new ResizeObserver(() => {
      const w = mount.clientWidth, h = mount.clientHeight;
      camera.aspect = w / h; camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    ro.observe(mount);

    const onClick = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(taskGroupRef.current.children, true);
      const hit = intersects.find(i => i.object?.userData?.taskId);
      if (hit) onToggle?.(hit.object.userData.taskId);
    };
    mount.addEventListener('click', onClick);

    return () => {
      stop = true;
      ro.disconnect();
      mount.removeEventListener('click', onClick);
      controls.dispose();
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj.isMesh) {
          obj.geometry?.dispose?.();
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material?.dispose?.();
        }
      });
      mount.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => { renderTasks(); }, [tasks]);

  function renderTasks() {
    const scene = sceneRef.current;
    const font = fontRef.current;
    if (!scene || !font) return;

    const group = taskGroupRef.current;
    for (let i = group.children.length - 1; i >= 0; i--) {
      const child = group.children[i];
      if (child.isMesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
        else child.material.dispose();
      }
      group.remove(child);
    }

    tasks.forEach((task, index) => {
      const material = new THREE.MeshStandardMaterial({
        color: task.completed ? 0x00ff00 : 0x00ffff,
        transparent: true,
        opacity: 0.75,
        emissive: task.completed ? 0x00ff00 : 0x00ffff,
        emissiveIntensity: 0.35,
      });

      const textGeometry = new TextGeometry(task.text, {
        font,
        size: 0.8,
        height: 0.2,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelOffset: 0,
        bevelSegments: 5,
      });
      textGeometry.center();

      const mesh = new THREE.Mesh(textGeometry, material);
      mesh.position.set((index % 3 - 1) * 5, Math.floor(index / 3) * -2 + 3, (index % 2) * -1);
      mesh.castShadow = true;
      mesh.userData.isTask = true;
      mesh.userData.taskId = task.id;
      group.add(mesh);
    });
  }

  return <div ref={mountRef} className="flex-grow bg-gradient-to-br from-gray-900 to-blue-900 relative rounded-lg m-4 shadow-inner" />;
}
