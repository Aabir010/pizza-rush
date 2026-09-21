// ==========================================
// 1. THE 3D ENVIRONMENT SETUP
// ==========================================

// Create the empty 3D universe container
const scene = new THREE.Scene();

// We angle the camera downward slightly so you can look ahead down the road
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 3, 6); // Position: X=0 (centered), Y=3 (elevated), Z=6 (pulled back)
camera.lookAt(0, 0, 0);       // Force camera view to point back at the center point

// Set up the WebGL engine renderer hardware loader
const renderer = new THREE.WebGLRenderer();

// Match the engine canvas to the full size of the user's browser window
renderer.setSize(window.innerWidth, window.innerHeight);

// Append the newly generated 3D canvas into the HTML page body
document.body.appendChild(renderer.domElement);

// ==========================================
// 2. CREATING THE HORIZONTAL ROAD GROUND PLANE
// ==========================================
// A massive rectangle: 10 units wide, 200 units deep stretching into the distance
const roadGeometry = new THREE.PlaneGeometry(10, 200);
const roadMaterial = new THREE.MeshBasicMaterial({ color: 0x333333, side: THREE.DoubleSide });
const road = new THREE.Mesh(roadGeometry, roadMaterial);

// CRITICAL STEP: Rotate it flat! PlaneGeometry stands straight up by default.
// Rotating by negative 90 degrees (-Math.PI / 2) lays it perfectly flat like a floor.
road.rotation.x = -Math.PI / 2;
scene.add(road);

// ==========================================
// 3. CREATING THE CONTROLLABLE PLAYER OBJECT
// ==========================================
const playerGeometry = new THREE.BoxGeometry(1, 1, 1);
const playerMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffcc });
const playerCube = new THREE.Mesh(playerGeometry, playerMaterial);

// POSITIONING OVER THE FLOOR: Since the cube height is 1, placing it at Y = 0.5 
// stops it from being embedded halfway through the floor plane mesh!
playerCube.position.set(0, 0.5, 2); 
scene.add(playerCube);

// ==========================================
// 4. INTERACTIVE KEYBOARD FLAG CONTROLLER SYSTEM
// ==========================================
let movingLeft = false;
let movingRight = false;
const playerSpeed = 0.15; // Adjusted scale for a 3D environment space

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') movingLeft = true;
    if (e.key === 'ArrowRight') movingRight = true;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') movingLeft = false;
    if (e.key === 'ArrowRight') movingRight = false;
});

// ==========================================
// 5. THE ANIMATED VIEWPORT LOOP
// ==========================================
function animate() {
    requestAnimationFrame(animate);

    // Read input flags and adjust your player object's structural 3D X position vector
    if (movingLeft) playerCube.position.x -= playerSpeed;
    if (movingRight) playerCube.position.x += playerSpeed;

    // --- OPTIONAL BOUNDARY CLAMPS ---
    // Keep player boxed safely inside the 10-unit wide track limits (-5 to +5)
    if (playerCube.position.x < -4.5) playerCube.position.x = -4.5;
    if (playerCube.position.x > 4.5) playerCube.position.x = 4.5;

    // Paint the active update matrix context values frame-by-frame
    renderer.render(scene, camera);
}

// Start the 3D game loop
animate();