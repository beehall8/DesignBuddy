import * as THREE from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

const stlLoader = new STLLoader()
const gltfLoader = new GLTFLoader()

function readAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error || new Error('Failed to read file'))
    reader.readAsArrayBuffer(file)
  })
}

/** Collects all mesh geometries out of a loaded glTF scene graph and merges
 * them into a single BufferGeometry (in world space) so volume/weight and
 * the viewer only have to deal with one mesh. */
function extractGeometryFromScene(sceneRoot) {
  const geometries = []
  sceneRoot.updateWorldMatrix(true, true)
  sceneRoot.traverse((child) => {
    if (child.isMesh && child.geometry) {
      const geom = child.geometry.clone()
      geom.applyMatrix4(child.matrixWorld)
      // Only position attribute is needed downstream; drop others to keep merge simple.
      const posOnly = new THREE.BufferGeometry()
      posOnly.setAttribute('position', geom.getAttribute('position'))
      if (geom.index) posOnly.setIndex(geom.index)
      geometries.push(posOnly)
    }
  })
  if (geometries.length === 0) return null
  if (geometries.length === 1) return geometries[0]
  return mergeGeometries(geometries, false)
}

export async function loadModelFile(file) {
  const name = file.name || 'model'
  const ext = name.split('.').pop().toLowerCase()
  const buffer = await readAsArrayBuffer(file)

  if (ext === 'stl') {
    const geometry = stlLoader.parse(buffer)
    geometry.computeVertexNormals()
    return { geometry, format: 'stl', name }
  }

  if (ext === 'glb' || ext === 'gltf') {
    const gltf = await new Promise((resolve, reject) => {
      gltfLoader.parse(buffer, '', resolve, reject)
    })
    const geometry = extractGeometryFromScene(gltf.scene)
    if (!geometry) throw new Error('No mesh geometry found in glTF/GLB file')
    geometry.computeVertexNormals()
    return { geometry, format: ext, name }
  }

  throw new Error(`Unsupported file type ".${ext}" — please upload an STL or glTF/GLB file`)
}
