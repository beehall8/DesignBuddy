import * as THREE from 'three'

/**
 * Computes the enclosed volume of a (closed, manifold) triangle mesh using
 * the signed-tetrahedron-volume method: for each triangle we form a
 * tetrahedron with the origin and sum its signed volume. For a properly
 * closed mesh the signs cancel out everywhere except the true interior,
 * leaving the mesh's volume. Works regardless of where the mesh sits
 * relative to the origin.
 *
 * Units: whatever units the geometry's coordinates are in, cubed.
 * STL/glTF files most commonly use millimeters, so the result is
 * typically mm^3 -- see mm3ToCm3 below.
 *
 * If the mesh is not watertight (open edges, flipped normals, etc.) this
 * will still return a number, but it may not correspond to a physically
 * meaningful enclosed volume. We surface that risk in the UI rather than
 * trying to silently "fix" the mesh (that would need real repair tooling).
 */
export function computeMeshVolume(geometry) {
  const position = geometry.attributes.position
  if (!position) return 0

  const index = geometry.index
  let volume = 0

  const pA = new THREE.Vector3()
  const pB = new THREE.Vector3()
  const pC = new THREE.Vector3()

  const signedVolumeOfTriangle = (p1, p2, p3) => p1.dot(p2.clone().cross(p3)) / 6

  if (index) {
    for (let i = 0; i < index.count; i += 3) {
      const a = index.getX(i)
      const b = index.getX(i + 1)
      const c = index.getX(i + 2)
      pA.fromBufferAttribute(position, a)
      pB.fromBufferAttribute(position, b)
      pC.fromBufferAttribute(position, c)
      volume += signedVolumeOfTriangle(pA, pB, pC)
    }
  } else {
    for (let i = 0; i < position.count; i += 3) {
      pA.fromBufferAttribute(position, i)
      pB.fromBufferAttribute(position, i + 1)
      pC.fromBufferAttribute(position, i + 2)
      volume += signedVolumeOfTriangle(pA, pB, pC)
    }
  }

  return Math.abs(volume)
}

export function mm3ToCm3(mm3) {
  return mm3 / 1000
}

/**
 * Applies a uniform scale correction (e.g. if the model was exported in
 * a different unit than mm) to a volume already computed in mm^3, and
 * converts to cm^3. Scale is linear, so it applies cubed to volume.
 */
export function scaledVolumeCm3(rawMm3, scaleFactor) {
  const correctedMm3 = rawMm3 * Math.pow(scaleFactor, 3)
  return mm3ToCm3(correctedMm3)
}

export function weightGrams(volumeCm3, densityGPerCm3) {
  return volumeCm3 * densityGPerCm3
}

export function gramsToTroyOunces(grams) {
  return grams / 31.1035
}

export function gramsToOunces(grams) {
  return grams / 28.3495
}

export function gramsToPennyweight(grams) {
  return grams / 1.55517
}
