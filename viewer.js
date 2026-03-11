// This code doesn't sort raycast hits by box size, so larger meshes override smaller ones
// Useful for simpler modeling 

// import * as THREE from "three";
// import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
// import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// const scene = new THREE.Scene()
// const camera = new THREE.PerspectiveCamera(75, window.innerWidth / 600, 0.1, 1000)
// const renderer = new THREE.WebGLRenderer({antialias:true})
// renderer.setSize(window.innerWidth,600)
// document.getElementById("viewer").appendChild(renderer.domElement)

// const ambient = new THREE.AmbientLight(0xffffff,0.6)
// scene.add(ambient)
// const light = new THREE.DirectionalLight(0xffffff,1)
// light.position.set(5,5,5)
// scene.add(light)

// const controls = new OrbitControls(camera,renderer.domElement)
// controls.target.set(0, 0.85, 0)

// const raycaster = new THREE.Raycaster()
// const pointer = new THREE.Vector2()

// // Track all body meshes for raycasting
// const bodyMeshes = []

// const loader = new GLTFLoader()

// loader.load("assets/human-body2.glb",(gltf)=>{

//   scene.add(gltf.scene)

//   gltf.scene.traverse((child)=>{
//     if(child.isMesh){
//       const mat = child.material
//       const matName = Array.isArray(mat) ? mat[0]?.name : mat?.name

//       if(matName === "Text"){
//         const applyTransparent = (m) => {
//           m.transparent = true
//           m.opacity = 0
//           m.depthWrite = false
//           m.needsUpdate = true
//         }
//         Array.isArray(mat) ? mat.forEach(applyTransparent) : applyTransparent(mat)
//       } else {
//         // Only add non-text meshes to raycaster targets
//         bodyMeshes.push(child)
//       }

//       // Fix any low-opacity meshes
//       const checkMat = (m) => {
//         if(m.opacity < 0.5 && matName !== "Text"){
//           m.opacity = 1
//           m.transparent = false
//           m.needsUpdate = true
//         }
//       }
//       Array.isArray(mat) ? mat.forEach(checkMat) : checkMat(mat)
//     }
//   })

// })

// // Highlight material for selected mesh
// const highlightMat = new THREE.MeshStandardMaterial({
//   color: 0xff6600,
//   emissive: 0xff3300,
//   emissiveIntensity: 0.3
// })

// let selectedMesh = null
// let originalMat = null

// renderer.domElement.addEventListener("click", (e) => {

//   // Convert click to normalized device coordinates
//   const rect = renderer.domElement.getBoundingClientRect()
//   pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
//   pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

//   raycaster.setFromCamera(pointer, camera)
//   const hits = raycaster.intersectObjects(bodyMeshes, false)

//   // Restore previous selection
//   if(selectedMesh && originalMat){
//     selectedMesh.material = originalMat
//     selectedMesh = null
//     originalMat = null
//   }

//   if(hits.length > 0){
//     const mesh = hits[0].object
//     const mat = mesh.material
//     const matName = Array.isArray(mat) ? mat[0]?.name : mat?.name

//     console.log("Selected mesh:", mesh.name)
//     console.log("Material:", matName)

//     // Highlight selected mesh
//     originalMat = mesh.material
//     selectedMesh = mesh
//     mesh.material = highlightMat

//     // Update info panel
//     document.getElementById("partTitle").textContent = mesh.name.replace(/_/g, " ")
//     document.getElementById("partDescription").textContent = `Material: ${matName}`
//   }

// })

// camera.position.set(0, 0.85, 2)

// function animate(){
//   requestAnimationFrame(animate)
//   controls.update()
//   renderer.render(scene,camera)
// }

// animate()

import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / 600, 0.1, 1000)
const renderer = new THREE.WebGLRenderer({antialias:true})
renderer.setSize(window.innerWidth,600)
document.getElementById("viewer").appendChild(renderer.domElement)

const ambient = new THREE.AmbientLight(0xffffff,0.6)
scene.add(ambient)
const light = new THREE.DirectionalLight(0xffffff,1)
light.position.set(5,5,5)
scene.add(light)

const controls = new OrbitControls(camera,renderer.domElement)
controls.target.set(0, 0.85, 0)
controls.enableDamping = true
controls.dampingFactor = 0.05

const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()
const bodyMeshes = []
const meshVolume = new Map()

// Vertical spine axis — camera direction is computed horizontally
// from this line, preserving the mesh's Y height for target
const SPINE_X = 0
const SPINE_Z = 0

const loader = new GLTFLoader()

loader.load("assets/human-body2.glb",(gltf)=>{

  scene.add(gltf.scene)

  gltf.scene.traverse((child)=>{
    if(child.isMesh){
      const mat = child.material
      const matName = Array.isArray(mat) ? mat[0]?.name : mat?.name

      if(matName === "Text"){
        const applyTransparent = (m) => {
          m.transparent = true
          m.opacity = 0
          m.depthWrite = false
          m.needsUpdate = true
        }
        Array.isArray(mat) ? mat.forEach(applyTransparent) : applyTransparent(mat)
        return
      }

      const checkMat = (m) => {
        if(m.opacity < 0.5){
          m.opacity = 1
          m.transparent = false
          m.needsUpdate = true
        }
      }
      Array.isArray(mat) ? mat.forEach(checkMat) : checkMat(mat)

      bodyMeshes.push(child)
      child.geometry.computeBoundingBox()
      const box = child.geometry.boundingBox
      const size = new THREE.Vector3()
      box.getSize(size)
      meshVolume.set(child.uuid, size.x * size.y * size.z)
    }
  })

})

const highlightMat = new THREE.MeshStandardMaterial({
  color: 0xff6600,
  emissive: 0xff3300,
  emissiveIntensity: 0.5,
  depthTest: false,
  depthWrite: false,
  transparent: true,
  opacity: 0.95
})

let selectedMesh = null
let originalMat = null
let originalRenderOrder = 0

// Camera animation
let animating = false
let animFrom = { pos: new THREE.Vector3(), target: new THREE.Vector3() }
let animTo   = { pos: new THREE.Vector3(), target: new THREE.Vector3() }
let animT = 0
const ANIM_DURATION = 60

// Default zoom distance from spine
const DEFAULT_DIST = 2

const defaultCamPos = new THREE.Vector3(0, 0.85, DEFAULT_DIST)
const defaultTarget = new THREE.Vector3(0, 0.85, 0)

function startCameraAnim(toPos, toTarget) {
  animFrom.pos.copy(camera.position)
  animFrom.target.copy(controls.target)
  animTo.pos.copy(toPos)
  animTo.target.copy(toTarget)
  animT = 0
  animating = true
}

function getCameraPositionForMesh(mesh) {
  const box = new THREE.Box3().setFromObject(mesh)
  const meshCenter = new THREE.Vector3()
  box.getCenter(meshCenter)

  const meshSize = new THREE.Vector3()
  box.getSize(meshSize)
  const maxDim = Math.max(meshSize.x, meshSize.y, meshSize.z)

  // Horizontal direction from spine axis to mesh center (ignore Y)
  const horizDir = new THREE.Vector3(
    meshCenter.x - SPINE_X,
    0,
    meshCenter.z - SPINE_Z
  )

  // Fall back to forward if mesh is on the spine
  if(horizDir.length() < 0.001){
    horizDir.set(0, 0, 1)
  } else {
    horizDir.normalize()
  }

  // Camera sits at mesh's Y height, pushed outward along horizontal direction
  const zoomDist = Math.max(maxDim * 3, 0.08)
  const camPos = new THREE.Vector3(
    meshCenter.x + horizDir.x * zoomDist,
    meshCenter.y,                           // match mesh height, no vertical angle
    meshCenter.z + horizDir.z * zoomDist
  )

  // Target is the mesh center
  return { camPos, meshCenter, horizDir }
}

function getZoomOutPosition(horizDir, meshCenter) {
  // Keep the same horizontal angle as the zoomed view
  // but pull back to default distance from spine
  // and return to default vertical height (y = 0.85)
  const camPos = new THREE.Vector3(
    SPINE_X + horizDir.x * DEFAULT_DIST,
    defaultCamPos.y,
    SPINE_Z + horizDir.z * DEFAULT_DIST
  )
  const target = new THREE.Vector3(
    SPINE_X,
    defaultTarget.y,
    SPINE_Z
  )
  return { camPos, target }
}

// Store last used horizontal direction for zoom-out
let lastHorizDir = new THREE.Vector3(0, 0, 1)

renderer.domElement.addEventListener("click", (e) => {

  const rect = renderer.domElement.getBoundingClientRect()
  pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
  pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

  raycaster.setFromCamera(pointer, camera)
  const hits = raycaster.intersectObjects(bodyMeshes, false)

  // Deselect — zoom out maintaining horizontal angle
  if(selectedMesh && originalMat){
    selectedMesh.material = originalMat
    selectedMesh.renderOrder = originalRenderOrder
    selectedMesh = null
    originalMat = null

    const { camPos, target } = getZoomOutPosition(lastHorizDir, defaultTarget)
    startCameraAnim(camPos, target)

    document.getElementById("partTitle").textContent = "Select a body part"
    document.getElementById("partDescription").textContent = ""
    return
  }

  if(hits.length > 0){
    hits.sort((a, b) => {
      const volA = meshVolume.get(a.object.uuid) ?? Infinity
      const volB = meshVolume.get(b.object.uuid) ?? Infinity
      return volA - volB
    })

    const mesh = hits[0].object
    const mat = mesh.material
    const matName = Array.isArray(mat) ? mat[0]?.name : mat?.name

    console.log("Selected mesh:", mesh.name)
    console.log("Material:", matName)

    originalMat = mesh.material
    originalRenderOrder = mesh.renderOrder
    selectedMesh = mesh
    mesh.material = highlightMat
    mesh.renderOrder = 999

    const { camPos, meshCenter, horizDir } = getCameraPositionForMesh(mesh)
    lastHorizDir.copy(horizDir)
    startCameraAnim(camPos, meshCenter)

    document.getElementById("partTitle").textContent = mesh.name.replace(/_/g, " ")
    document.getElementById("partDescription").textContent = `Material: ${matName}`
  }

})

camera.position.copy(defaultCamPos)

function animate(){
  requestAnimationFrame(animate)

  if(animating){
    animT++
    const t = Math.min(animT / ANIM_DURATION, 1)
    const ease = t < 0.5 ? 2*t*t : -1+(4-2*t)*t
    camera.position.lerpVectors(animFrom.pos, animTo.pos, ease)
    controls.target.lerpVectors(animFrom.target, animTo.target, ease)
    if(t >= 1) animating = false
  }

  controls.update()
  renderer.render(scene,camera)
}

animate()