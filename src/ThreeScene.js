import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import gsap from 'gsap';

const ThreeScene = forwardRef((props, ref) => {
  const mountRef = useRef(null);
  const cameraRef = useRef();
  // Store scene, renderer, etc. in refs if they need to persist without causing re-renders
  // or if they are accessed by cleanup functions or imperative handles.
  const sceneRef = useRef(new THREE.Scene());
  const rendererRef = useRef();

  useImperativeHandle(ref, () => ({
    moveCamera: () => {
      if (cameraRef.current) {
        gsap.to(cameraRef.current.position, {
          duration: 2,
          x: 1,
          y: 2,
          z: 0.5,
          ease: "power2.inOut",
          onUpdate: () => {
            if (cameraRef.current) {
              cameraRef.current.lookAt(0, 1.5, 0);
            }
          }
        });
      }
    }
  }));

  useEffect(() => {
    const currentMount = mountRef.current;

    // Scene setup from original script.js
    const scene = sceneRef.current;
    cameraRef.current = new THREE.PerspectiveCamera(
      50, currentMount.clientWidth / currentMount.clientHeight, 0.1, 100
    );
    cameraRef.current.position.set(3, 2, 6);

    rendererRef.current = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current.setSize(currentMount.clientWidth, currentMount.clientHeight);
    rendererRef.current.setPixelRatio(window.devicePixelRatio);
    rendererRef.current.shadowMap.enabled = true;
    currentMount.appendChild(rendererRef.current.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xfff5cc, 1, 100); // Increased range for pointlight
    pointLight.position.set(2, 3, 2);
    pointLight.castShadow = true; // Enable shadows for the point light
    scene.add(pointLight);

    const loader = new GLTFLoader();
    loader.load(
      'https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf',
      (gltf) => {
        const model = gltf.scene;
        model.traverse((node) => {
          if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
          }
        });
        scene.add(model);
      },
      undefined,
      (error) => console.error(error)
    );

    // Handle window resize
    const handleResize = () => {
      if (cameraRef.current && rendererRef.current && currentMount) {
        cameraRef.current.aspect = currentMount.clientWidth / currentMount.clientHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(currentMount.clientWidth, currentMount.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    // Animate
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (rendererRef.current && cameraRef.current) {
        rendererRef.current.render(scene, cameraRef.current);
      }
    };
    animate();

    // Cleanup on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (rendererRef.current) {
        rendererRef.current.dispose(); // Dispose renderer
      }
      if (currentMount && rendererRef.current) {
         // Check if rendererRef.current.domElement is still a child before removing
        if (currentMount.contains(rendererRef.current.domElement)) {
            currentMount.removeChild(rendererRef.current.domElement);
        }
      }
      // Dispose geometries, materials, textures in the scene
      scene.traverse(object => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => {
              // Dispose textures within materials
              if (material.map) material.map.dispose();
              if (material.lightMap) material.lightMap.dispose();
              if (material.bumpMap) material.bumpMap.dispose();
              if (material.normalMap) material.normalMap.dispose();
              if (material.specularMap) material.specularMap.dispose();
              if (material.envMap) material.envMap.dispose();
              material.dispose();
            });
          } else {
            // Dispose textures within the material
            if (object.material.map) object.material.map.dispose();
            if (object.material.lightMap) object.material.lightMap.dispose();
            if (object.material.bumpMap) object.material.bumpMap.dispose();
            if (object.material.normalMap) object.material.normalMap.dispose();
            if (object.material.specularMap) object.material.specularMap.dispose();
            if (object.material.envMap) object.material.envMap.dispose();
            object.material.dispose();
          }
        }
      });
    };
  }, []); // Empty dependency array ensures this runs once on mount and cleans up on unmount

  return <div ref={mountRef} className="three-canvas-container" />;
});

export default ThreeScene; 