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

const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()
const bodyMeshes = []
const meshVolume = new Map()

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
      } else {
        bodyMeshes.push(child)
        child.geometry.computeBoundingBox()
        const box = child.geometry.boundingBox
        const size = new THREE.Vector3()
        box.getSize(size)
        meshVolume.set(child.uuid, size.x * size.y * size.z)
      }

      const checkMat = (m) => {
        if(m.opacity < 0.5 && matName !== "Text"){
          m.opacity = 1
          m.transparent = false
          m.needsUpdate = true
        }
      }
      Array.isArray(mat) ? mat.forEach(checkMat) : checkMat(mat)
    }
  })

})

// Highlight material renders on top of everything
const highlightMat = new THREE.MeshStandardMaterial({
  color: 0xff6600,
  emissive: 0xff3300,
  emissiveIntensity: 0.5,
  depthTest: false,
  depthWrite: false,
  transparent: true,
  opacity: 0.95
})
highlightMat.renderOrder = 999

let selectedMesh = null
let originalMat = null
let originalRenderOrder = 0

renderer.domElement.addEventListener("click", (e) => {

  const rect = renderer.domElement.getBoundingClientRect()
  pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
  pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

  raycaster.setFromCamera(pointer, camera)
  const hits = raycaster.intersectObjects(bodyMeshes, false)

  // Restore previous selection
  if(selectedMesh && originalMat){
    selectedMesh.material = originalMat
    selectedMesh.renderOrder = originalRenderOrder
    selectedMesh = null
    originalMat = null
  }

  if(hits.length > 0){

    // Smallest mesh wins
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
    console.log("Volume:", meshVolume.get(mesh.uuid)?.toFixed(6))

    originalMat = mesh.material
    originalRenderOrder = mesh.renderOrder
    selectedMesh = mesh

    // Bump render order so it draws over surrounding meshes
    mesh.material = highlightMat
    mesh.renderOrder = 999

    document.getElementById("partTitle").textContent = mesh.name.replace(/_/g, " ")
    document.getElementById("partDescription").textContent = `Material: ${matName}`
  }

})

camera.position.set(0, 0.85, 2)

function animate(){
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene,camera)
}

animate()