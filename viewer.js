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

const viewerContainer = document.getElementById("viewer")
const VIEWER_HEIGHT = 500

const getContainerWidth = () => Math.max(1, viewerContainer.clientWidth || viewerContainer.offsetWidth || 300)

const camera = new THREE.PerspectiveCamera(75, getContainerWidth() / VIEWER_HEIGHT, 0.1, 1000)
const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true})
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
renderer.setSize(getContainerWidth(), VIEWER_HEIGHT)
renderer.domElement.style.display = "block"
renderer.domElement.style.width = "100%"
renderer.domElement.style.height = VIEWER_HEIGHT + "px"
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.1
renderer.outputColorSpace = THREE.SRGBColorSpace
viewerContainer.appendChild(renderer.domElement)

const resizeRenderer = () => {
  const w = getContainerWidth()
  renderer.setSize(w, VIEWER_HEIGHT, false)
  camera.aspect = w / VIEWER_HEIGHT
  camera.updateProjectionMatrix()
}

if (typeof ResizeObserver !== 'undefined') {
  new ResizeObserver(resizeRenderer).observe(viewerContainer)
}
window.addEventListener("resize", resizeRenderer)

const ambient = new THREE.AmbientLight(0xffe0cc, 0.35)
scene.add(ambient)
const keyLight = new THREE.DirectionalLight(0xfff0e0, 2.2)
keyLight.position.set(2, 4, 3)
keyLight.castShadow = true
keyLight.shadow.mapSize.width = 2048
keyLight.shadow.mapSize.height = 2048
keyLight.shadow.camera.near = 0.1
keyLight.shadow.camera.far = 20
keyLight.shadow.camera.left = -2
keyLight.shadow.camera.right = 2
keyLight.shadow.camera.top = 2
keyLight.shadow.camera.bottom = -2
keyLight.shadow.bias = -0.001
scene.add(keyLight)
const fillLight = new THREE.DirectionalLight(0xc0d8ff, 0.4)
fillLight.position.set(-3, 2, 1)
scene.add(fillLight)
const rimLight = new THREE.DirectionalLight(0xff9966, 0.6)
rimLight.position.set(0, 3, -4)
scene.add(rimLight)
const bounceLight = new THREE.DirectionalLight(0xff6633, 0.15)
bounceLight.position.set(0, -3, 2)
scene.add(bounceLight)

const controls = new OrbitControls(camera, renderer.domElement)
controls.target.set(0, 0.85, 0)
controls.enableDamping = true
controls.dampingFactor = 0.05

const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()
const bodyMeshes = []
const meshVolume = new Map()
const meshMatName = new Map()

const SPINE_X = 0
const SPINE_Z = 0

const DIAGNOSES = {
  head:      ["Tension headaches", "Migraine headaches", "Concussion", "Temporomandibular joint disorder (TMJ)"],
  neck:      ["Cervical strain or sprain", "Cervical radiculopathy", "Cervical spondylosis", "Herniated cervical disc"],
  shoulder:  ["Rotator cuff tear or tendinitis", "Shoulder impingement syndrome", "Frozen shoulder (adhesive capsulitis)", "Shoulder bursitis"],
  elbow:     ["Tennis elbow (lateral epicondylitis)", "Golfer's elbow (medial epicondylitis)", "Olecranon bursitis", "Ulnar nerve entrapment"],
  forearm:   [],
  wrist:     ["Carpal tunnel syndrome", "Wrist sprain", "De Quervain's tenosynovitis", "Ganglion cyst"],
  hand:      ["Trigger finger", "Arthritis in the hand", "Tendon injuries", "Dupuytren's contracture"],
  chest:     ["Costochondritis", "Pectoralis strain", "Intercostal muscle strain", "Sternoclavicular joint sprain"],
  abdomen:   [],
  back:      ["Strain", "Herniated disc", "Sciatica", "Degenerative disc disease", "Spinal stenosis"],
  hip:       ["Hip bursitis", "Hip arthritis", "Hip impingement", "Labral tear"],
  thigh:     ["Hamstring strain", "Quadriceps strain", "IT band syndrome", "Femoral stress fracture"],
  knee:      ["ACL tear", "Meniscus tear", "Patellar tendonitis", "Knee arthritis", "Patellofemoral pain syndrome"],
  calf:      ["Calf strain", "Deep vein thrombosis", "Compartment syndrome", "Shin splints"],
  lowerleg:  [],
  ankle:     ["Ankle sprain", "Achilles tendonitis", "Ankle instability", "Stress fracture"],
  foot:      ["Plantar fasciitis", "Tarsal tunnel syndrome", "Bunions", "Morton's neuroma"],
  upperarm:  ["Biceps tendon rupture", "Triceps strain", "Humerus fracture", "Referred shoulder pain"],
}

const ARM_X_THRESHOLD = 0.14

function getBodyArea(center) {
  const { x, y, z } = center
  const absX = Math.abs(x)
  const isArm = absX > ARM_X_THRESHOLD
  const isHandWidth = absX > 0.26
  const isLateralHip = absX > 0.11

  if(y > 1.55)  return "head"
  if(y > 1.42)  return isArm ? "shoulder" : "neck"
  if(y > 1.25)  return isArm ? "shoulder" : (z > 0 ? "chest" : "back")
  if(y > 1.10)  return isArm ? "upperarm" : (z > 0 ? "chest" : "back")
  if(y > 1.06)  return isArm ? "elbow" : (z > 0 ? "abdomen" : "back")
  if(y > 0.84)  return isArm ? (isHandWidth ? "wrist" : "forearm") : (!isLateralHip && z > 0.02 ? "abdomen" : "hip")
  if(y > 0.70)  return isArm ? (isHandWidth ? "hand" : "wrist") : (!isLateralHip && z > 0.02 ? "abdomen" : "hip")
  if(y > 0.62)  return isArm ? "hand" : "hip"
  if(y > 0.50)  return "thigh"
  if(y > 0.40)  return "knee"
  if(y > 0.18)  return z > -0.03 ? "lowerleg" : "calf"
  if(y > 0.08)  return "ankle"
  return "foot"
}

const MATERIAL_COLORS = {
  "Fascia":                  { color: 0xcc3322, roughness: 0.65, metalness: 0.05 },
  "Superficial":             { color: 0xbb2d1e, roughness: 0.70, metalness: 0.03 },
  "Internal rotator":        { color: 0xc0392b, roughness: 0.60, metalness: 0.05 },
  "External rotation":       { color: 0xbe3024, roughness: 0.60, metalness: 0.05 },
  "Flexion":                 { color: 0xb83225, roughness: 0.62, metalness: 0.05 },
  "Extension":               { color: 0xc13428, roughness: 0.62, metalness: 0.05 },
  "Biarticular":             { color: 0xba2f22, roughness: 0.63, metalness: 0.05 },
  "Abductor":                { color: 0xc43d30, roughness: 0.60, metalness: 0.05 },
  "Adductor":                { color: 0xbf3528, roughness: 0.60, metalness: 0.05 },
  "Trapezius":               { color: 0xc83e30, roughness: 0.58, metalness: 0.06 },
  "Diaphragm":               { color: 0xd04535, roughness: 0.55, metalness: 0.06 },
  "Masticator":              { color: 0xb52e22, roughness: 0.65, metalness: 0.04 },
  "Depressor":               { color: 0xb83020, roughness: 0.65, metalness: 0.04 },
  "Levator":                 { color: 0xba3122, roughness: 0.65, metalness: 0.04 },
  "Phonation":               { color: 0xc03828, roughness: 0.62, metalness: 0.04 },
  "Ingestion":               { color: 0xbc3425, roughness: 0.64, metalness: 0.04 },
  "Orbicularis/Constrictor": { color: 0xb52e20, roughness: 0.66, metalness: 0.04 },
  "Extension hand/foot":     { color: 0xbf3626, roughness: 0.62, metalness: 0.05 },
  "Flexion hand/foot":       { color: 0xba3124, roughness: 0.62, metalness: 0.05 },
  "Flexion fingers":         { color: 0xb83022, roughness: 0.63, metalness: 0.05 },
  "Extensor extremities":    { color: 0xc03827, roughness: 0.61, metalness: 0.05 },
  "Ligament":                { color: 0xe8c4a0, roughness: 0.75, metalness: 0.02 },
  "Tendon":                  { color: 0xf0d4b0, roughness: 0.72, metalness: 0.02 },
  "Cartilage":               { color: 0xe8e0d0, roughness: 0.55, metalness: 0.08 },
  "Articular capsule":       { color: 0xd4b896, roughness: 0.70, metalness: 0.02 },
  "Bursa":                   { color: 0xc8d8e8, roughness: 0.40, metalness: 0.10, opacity: 0.75 },
}
const DEFAULT_MUSCLE = { color: 0xc03828, roughness: 0.62, metalness: 0.05 }

const loader = new GLTFLoader()
loader.load(
  "assets/human-body2.glb",
  (gltf) => {
    scene.add(gltf.scene)
    gltf.scene.traverse((child) => {
      if(!child.isMesh) return
      child.castShadow = true
      child.receiveShadow = true
      const mat = child.material
      const matName = Array.isArray(mat) ? mat[0]?.name : mat?.name
      if(matName === "Text"){
        const t = (m) => { m.transparent=true; m.opacity=0; m.depthWrite=false; m.needsUpdate=true }
        Array.isArray(mat) ? mat.forEach(t) : t(mat)
        child.castShadow = false
        child.receiveShadow = false
        return
      }
      meshMatName.set(child.uuid, matName)
      const preset = MATERIAL_COLORS[matName] || DEFAULT_MUSCLE
      child.material = new THREE.MeshPhysicalMaterial({
        color: preset.color, roughness: preset.roughness, metalness: preset.metalness,
        transparent: preset.opacity !== undefined, opacity: preset.opacity ?? 1.0,
        depthWrite: preset.opacity === undefined,
        sheen: 0.15, sheenColor: new THREE.Color(0xff8866), sheenRoughness: 0.8, envMapIntensity: 0.3,
      })
      bodyMeshes.push(child)
      child.geometry.computeBoundingBox()
      const box = child.geometry.boundingBox
      const size = new THREE.Vector3()
      box.getSize(size)
      meshVolume.set(child.uuid, size.x * size.y * size.z)
    })

    // Hide loading overlay
    const overlay = document.getElementById("loadingOverlay")
    overlay.style.transition = "opacity 0.4s ease"
    overlay.style.opacity = "0"
    setTimeout(() => overlay.style.display = "none", 400)
  },
  (xhr) => {
    if(xhr.lengthComputable) {
      const pct = Math.round((xhr.loaded / xhr.total) * 100)
      document.getElementById("loadingBarFill").style.width = pct + "%"
      document.getElementById("loadingPercent").textContent = pct + "%"
    }
  },
  (error) => {
    console.error("GLB load error:", error)
    document.getElementById("loadingLabel").textContent = "Failed to load model"
  }
)

const highlightMat = new THREE.MeshPhysicalMaterial({
  color: 0xff9900, emissive: 0xff6600, emissiveIntensity: 0.4,
  roughness: 0.4, metalness: 0.1, depthTest: false, depthWrite: false, transparent: true, opacity: 0.95
})

let selectedMesh = null, originalMat = null, originalRenderOrder = 0

const ZOOM_IN_DURATION  = 90
const ZOOM_OUT_DURATION = 60

let animating = false
let animFrom = { pos: new THREE.Vector3(), target: new THREE.Vector3() }
let animTo   = { pos: new THREE.Vector3(), target: new THREE.Vector3() }
let animT = 0
let animDuration = ZOOM_IN_DURATION

const DEFAULT_DIST = 2
const defaultCamPos = new THREE.Vector3(0, 0.85, DEFAULT_DIST)
const defaultTarget = new THREE.Vector3(0, 0.85, 0)
let lastHorizDir = new THREE.Vector3(0, 0, 1)

function startCameraAnim(toPos, toTarget, duration) {
  animFrom.pos.copy(camera.position)
  animFrom.target.copy(controls.target)
  animTo.pos.copy(toPos)
  animTo.target.copy(toTarget)
  animT = 0
  animDuration = duration
  animating = true
}

function getCameraPositionForMesh(mesh) {
  const box = new THREE.Box3().setFromObject(mesh)
  const meshCenter = new THREE.Vector3()
  box.getCenter(meshCenter)
  const meshSize = new THREE.Vector3()
  box.getSize(meshSize)
  const maxDim = Math.max(meshSize.x, meshSize.y, meshSize.z)
  const horizDir = new THREE.Vector3(meshCenter.x - SPINE_X, 0, meshCenter.z - SPINE_Z)
  if(horizDir.length() < 0.001) horizDir.set(0, 0, 1)
  else horizDir.normalize()
  const zoomDist = Math.max(maxDim * 3, 0.08)
  const camPos = new THREE.Vector3(
    meshCenter.x + horizDir.x * zoomDist, meshCenter.y, meshCenter.z + horizDir.z * zoomDist
  )
  return { camPos, meshCenter, horizDir }
}

function getZoomOutPosition(horizDir) {
  return {
    camPos: new THREE.Vector3(SPINE_X + horizDir.x * DEFAULT_DIST, defaultCamPos.y, SPINE_Z + horizDir.z * DEFAULT_DIST),
    target: new THREE.Vector3(SPINE_X, defaultTarget.y, SPINE_Z)
  }
}

function cleanMeshName(raw) {
  return raw
    .replace(/_+\d+$/, "")
    .replace(/([a-z])l$/i, "$1")
    .replace(/_/g, " ")
    .replace(/\bmusclel\b/gi, "muscle")
    .replace(/\bmuscler\b/gi, "muscle")
    .replace(/\bmusclek\b/gi, "muscle")
    .replace(/\bwristl\b/gi, "wrist")
    .replace(/\bwristr\b/gi, "wrist")
    .replace(/\bhandl\b/gi, "hand")
    .replace(/\bhandr\b/gi, "hand")
    .replace(/\bbursall?\b/gi, "bursal")
    .replace(/\bbursalr\b/gi, "bursal")
    .replace(/\bligamentl\b/gi, "ligament")
    .replace(/\bligamentr\b/gi, "ligament")
    .replace(/\btendonl\b/gi, "tendon")
    .replace(/\btendonr\b/gi, "tendon")
    .replace(/\bfascial\b/gi, "fascia")
    .replace(/\bfasciar\b/gi, "fascia")
    .replace(/\bnervel\b/gi, "nerve")
    .replace(/\bnervesr\b/gi, "nerves")
    .replace(/\bveinl\b/gi, "vein")
    .replace(/\bveinr\b/gi, "vein")
    .replace(/\barteryl\b/gi, "artery")
    .replace(/\barteryр\b/gi, "artery")
    .replace(/\bSupinatorl\b/gi, "Supinator")
    .replace(/\bSupinatorr\b/gi, "Supinator")
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace(/\s+/g, " ")
    .trim()
}

function updateInfoPanel(mesh, matName) {
  const box = new THREE.Box3().setFromObject(mesh)
  const center = new THREE.Vector3()
  box.getCenter(center)

  const area = getBodyArea(center)
  const diagnoses = DIAGNOSES[area]
  const areaLabel = area ? area.charAt(0).toUpperCase() + area.slice(1) : null

  console.log("Selected mesh:", mesh.name)
  console.log("Material:", matName)
  console.log("Area:", area, `| y:${center.y.toFixed(3)} x:${center.x.toFixed(3)} z:${center.z.toFixed(3)}`)

  const displayName = cleanMeshName(mesh.name)
  document.getElementById("partTitle").textContent = displayName

  const descEl = document.getElementById("partDescription")
  if(diagnoses && areaLabel) {
    descEl.innerHTML = `<strong>Common ${areaLabel} Diagnoses:</strong><br>` +
      diagnoses.map(d => `• ${d}`).join("<br>")
  } else {
    descEl.textContent = ""
  }

  // Notify the intake form of the selected body area
  document.dispatchEvent(new CustomEvent('bodyAreaSelected', { detail: { area, label: areaLabel, meshName: cleanMeshName(mesh.name) } }))
}

renderer.domElement.addEventListener("click", (e) => {
  const rect = renderer.domElement.getBoundingClientRect()
  pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
  pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
  raycaster.setFromCamera(pointer, camera)
  const hits = raycaster.intersectObjects(bodyMeshes, false)

  if(selectedMesh && originalMat){
    selectedMesh.material = originalMat
    selectedMesh.renderOrder = originalRenderOrder
    selectedMesh = null; originalMat = null
    const { camPos, target } = getZoomOutPosition(lastHorizDir)
    startCameraAnim(camPos, target, ZOOM_OUT_DURATION)
    document.getElementById("partTitle").textContent = "Select a body part"
    document.getElementById("partDescription").textContent = ""
    return
  }

  if(hits.length > 0){
    hits.sort((a, b) => (meshVolume.get(a.object.uuid) ?? Infinity) - (meshVolume.get(b.object.uuid) ?? Infinity))
    const mesh = hits[0].object
    const matName = meshMatName.get(mesh.uuid) ?? "Unknown"

    originalMat = mesh.material
    originalRenderOrder = mesh.renderOrder
    selectedMesh = mesh
    mesh.material = highlightMat
    mesh.renderOrder = 999

    const { camPos, meshCenter, horizDir } = getCameraPositionForMesh(mesh)
    lastHorizDir.copy(horizDir)
    startCameraAnim(camPos, meshCenter, ZOOM_IN_DURATION)

    updateInfoPanel(mesh, matName)
  }
})

camera.position.copy(defaultCamPos)

// Purple mode — triggered by secret button chain
document.addEventListener('purpleMode', () => {
  bodyMeshes.forEach(mesh => {
    const matName = meshMatName.get(mesh.uuid) ?? ""
    const isRed = !["Ligament","Tendon","Cartilage","Articular capsule","Bursa"].includes(matName)
    if(isRed && mesh.material.color) {
      mesh.material.color.setHex(0x7b2d8b)
      if(mesh.material.emissive) mesh.material.emissive.setHex(0x3d0052)
      mesh.material.emissiveIntensity = 0.15
      mesh.material.needsUpdate = true
    }
  })
})

function animate(){
  requestAnimationFrame(animate)
  if(animating){
    animT++
    const t = Math.min(animT / animDuration, 1)
    const ease = t < 0.5 ? 2*t*t : -1+(4-2*t)*t
    camera.position.lerpVectors(animFrom.pos, animTo.pos, ease)
    controls.target.lerpVectors(animFrom.target, animTo.target, ease)
    if(t >= 1) animating = false
  }
  controls.update()
  renderer.render(scene,camera)
}

animate()