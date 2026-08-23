import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Grid, Center, Bounds } from '@react-three/drei'
import * as THREE from 'three'

function Model({ geometry, wireframe, color }) {
  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial
        color={color}
        metalness={0.65}
        roughness={0.3}
        wireframe={wireframe}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

const VIEW_PRESETS = {
  top: [0, 10, 0.001],
  front: [0, 0, 10],
  left: [10, 0, 0],
  iso: [7, 6, 7],
}

function CameraRig({ preset, controlsRef }) {
  const { camera } = useThree()
  useEffect(() => {
    if (!preset) return
    const dir = VIEW_PRESETS[preset] || VIEW_PRESETS.iso
    const dist = camera.position.length() || 10
    camera.position.set(dir[0], dir[1], dir[2]).normalize().multiplyScalar(Math.max(dist, 3))
    camera.updateProjectionMatrix()
    controlsRef.current?.update()
  }, [preset]) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}

export default function Viewer3D({
  geometry,
  wireframe,
  showGrid,
  background,
  color,
  viewPreset,
}) {
  const controlsRef = useRef()

  const empty = !geometry

  const bg = useMemo(() => background || '#030407', [background])

  return (
    <div className="viewer-canvas-wrap" style={{ background: bg }}>
      <Canvas shadows camera={{ position: [7, 6, 7], fov: 45, near: 0.01, far: 5000 }}>
        <color attach="background" args={[bg]} />
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={1.4}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-5, -3, -5]} intensity={0.4} />
        {showGrid && (
          <Grid
            args={[50, 50]}
            cellColor="#182039"
            sectionColor="#3157d6"
            fadeDistance={40}
            infiniteGrid
            position={[0, -0.001, 0]}
          />
        )}
        <Suspense fallback={null}>
          {!empty && (
            <Bounds fit clip observe margin={1.4}>
              <Center>
                <Model geometry={geometry} wireframe={wireframe} color={color} />
              </Center>
            </Bounds>
          )}
        </Suspense>
        <OrbitControls ref={controlsRef} makeDefault enableDamping dampingFactor={0.1} />
        <CameraRig preset={viewPreset} controlsRef={controlsRef} />
      </Canvas>
      {empty && (
        <div className="viewer-empty-overlay">
          <span className="viewer-empty-icon" aria-hidden="true">◇</span>
          <p>Upload an STL or glTF/GLB file to preview it here</p>
        </div>
      )}
    </div>
  )
}
