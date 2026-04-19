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
if(!viewerContainer) throw new Error('Viewer container "#viewer" not found')

const getContainerSize = () => {
  const width = Math.max(1, viewerContainer.clientWidth)
  const height = Math.max(1, viewerContainer.clientHeight || 600)
  return { width, height }
}

const { width, height } = getContainerSize()
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
const renderer = new THREE.WebGLRenderer({antialias:true, alpha:true})
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
renderer.setSize(width, height)
renderer.domElement.style.display = "block"
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.1
renderer.outputColorSpace = THREE.SRGBColorSpace
viewerContainer.appendChild(renderer.domElement)

const resizeRenderer = () => {
  const { width, height } = getContainerSize()
  if (renderer.domElement.width !== width || renderer.domElement.height !== height) {
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
  }
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

const infoPanel = document.getElementById("infoPanel")
const panelToggle = document.getElementById("panelToggle")
const partTitle = document.getElementById("partTitle")
const partDescription = document.getElementById("partDescription")
const searchInput = document.getElementById("searchInput")
const searchResults = document.getElementById("searchResults")

const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()
const bodyMeshes = []
const meshVolume = new Map()
const meshMatName = new Map()

let mouseDown = false
let mouseStart = { x: 0, y: 0 }

const expandPanel = () => {
  if (infoPanel) infoPanel.classList.remove("collapsed")
  if (panelToggle) panelToggle.textContent = "‹"
  if (panelToggle) panelToggle.title = "Collapse info panel"
}

const collapsePanel = () => {
  if (infoPanel) infoPanel.classList.add("collapsed")
  if (panelToggle) panelToggle.textContent = "›"
  if (panelToggle) panelToggle.title = "Expand info panel"
  if (searchInput) searchInput.value = ""
  if (searchResults) searchResults.innerHTML = ""
}

if (panelToggle) panelToggle.addEventListener("click", (event) => {
  event.stopPropagation()
  if (!infoPanel) return
  infoPanel.classList.toggle("collapsed")
  if (infoPanel.classList.contains("collapsed")) {
    panelToggle.textContent = "›"
    panelToggle.title = "Expand info panel"
  } else {
    panelToggle.textContent = "‹"
    panelToggle.title = "Collapse info panel"
  }
})

if (searchInput) searchInput.addEventListener("input", (event) => {
  const query = event.target.value.toLowerCase().trim()
  searchResults.innerHTML = ""
  if (query.length < 2) return // Minimum 2 characters
  const matches = bodyMeshes.filter(mesh => 
    !cleanMeshName(mesh.name).toLowerCase().includes("fascia") &&
    cleanMeshName(mesh.name).toLowerCase().includes(query)
  ).sort((a, b) => cleanMeshName(a.name).length - cleanMeshName(b.name).length)
  .slice(0, 10) // Limit to 10 results
  if (matches.length > 0) {
    expandPanel()
  }
  matches.forEach(mesh => {
    const li = document.createElement("li")
    li.textContent = cleanMeshName(mesh.name)
    li.addEventListener("click", () => {
      selectMesh(mesh)
      searchInput.value = ""
      searchResults.innerHTML = ""
    })
    searchResults.appendChild(li)
  })
})

function deselectMesh() {
  if (selectedMesh && originalMat) {
    selectedMesh.material = originalMat
    selectedMesh.renderOrder = originalRenderOrder
    selectedMesh = null
    originalMat = null
    const { camPos, target } = getZoomOutPosition(lastHorizDir)
    startCameraAnim(camPos, target, ZOOM_OUT_DURATION)
    if (partTitle) partTitle.textContent = "Search or select a body part"
    if (partDescription) partDescription.textContent = ""
    collapsePanel()
  }
}

function selectMesh(mesh) {
  deselectMesh() // Deselect any current selection
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
  // Raised from 1.40 to 1.41 — rhomboid minor at y:1.410 now falls to chest/back band
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
loader.load("assets/human-body2.glb",(gltf)=>{
  scene.add(gltf.scene)
  gltf.scene.traverse((child)=>{
    if(!child.isMesh) return
    child.castShadow = true
    child.receiveShadow = true
    const mat = child.material
    const matName = Array.isArray(mat) ? mat[0]?.name : mat?.name
    if(matName === "Text"){
      const t = (m) => { m.transparent=true; m.opacity=0; m.depthWrite=false; m.needsUpdate=true }
      Array.isArray(mat) ? mat.forEach(t) : t(mat)
      // Prevent hidden text planes from casting shadows on the body
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
})

const highlightMat = new THREE.MeshPhysicalMaterial({
  color: 0xff9900, emissive: 0xff6600, emissiveIntensity: 0.4,
  roughness: 0.4, metalness: 0.1, depthTest: false, depthWrite: false, transparent: true, opacity: 0.95
})

let selectedMesh = null, originalMat = null, originalRenderOrder = 0

// Separate durations for zoom in and zoom out
const ZOOM_IN_DURATION  = 90
const ZOOM_OUT_DURATION = 60

let animating = false
let animFrom = { pos: new THREE.Vector3(), target: new THREE.Vector3() }
let animTo   = { pos: new THREE.Vector3(), target: new THREE.Vector3() }
let animT = 0
let animDuration = ZOOM_IN_DURATION  // set per animation

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
    // Remove trailing digits used for duplicates: "muscler" → "muscle", "musclek" etc
    .replace(/_+\d+$/, "")           // remove trailing _1, _2 etc
    .replace(/([a-z])l$/i, "$1")     // remove stray trailing 'l' e.g. "muscler" → no, handle below
    .replace(/_/g, " ")              // underscores to spaces
    // Fix common GLB typos
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
    // Capitalise each word
    .replace(/\b\w/g, c => c.toUpperCase())
    // Clean up any double spaces
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
  if (partTitle) partTitle.textContent = displayName

  if (partDescription) {
    if(diagnoses && areaLabel) {
      partDescription.innerHTML = `<strong>Common ${areaLabel} Diagnoses:</strong><br>` +
        diagnoses.map(d => `• ${d}`).join("<br>")
    } else {
      partDescription.textContent = ""
    }
  }

  expandPanel()
}

renderer.domElement.addEventListener("mousedown", (e) => {
  mouseDown = true
  mouseStart.x = e.clientX
  mouseStart.y = e.clientY
})

renderer.domElement.addEventListener("mouseup", (e) => {
  if (!mouseDown) return
  mouseDown = false
  const dx = e.clientX - mouseStart.x
  const dy = e.clientY - mouseStart.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  if (distance > 5) return // Ignore if dragged

  const rect = renderer.domElement.getBoundingClientRect()
  pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
  pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
  raycaster.setFromCamera(pointer, camera)
  const hits = raycaster.intersectObjects(bodyMeshes, false)

  if (selectedMesh) {
    deselectMesh()
    return
  }

  const filteredHits = hits.filter(hit => !cleanMeshName(hit.object.name).toLowerCase().includes("fascia"))
  if (filteredHits.length > 0) {
    const mesh = filteredHits[0].object
    selectMesh(mesh)
  }
})

camera.position.copy(defaultCamPos)

function animate(){
  requestAnimationFrame(animate)
  resizeRenderer()
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