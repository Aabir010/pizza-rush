// ==========================================
// 1. GLOBAL STATE & PHYSICS VARIABLES
// ==========================================
let movingLeft = false;
let movingRight = false;
const playerSpeed = 0.15; // Sideways steering response increment

// --- 3D FORWARD VELOCITY STATS ---
let forwardSpeed = 0.2;   // The velocity pushing the player ahead along the Z-axis

// ==========================================
// 2. THE 3D ENVIRONMENT SETUP
// ==========================================
const scene = new THREE.Scene();

// Set up perspective viewport lens
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ==========================================
// 3. CREATING THE HORIZONTAL ROAD GROUND PLANE
// ==========================================
const roadGeometry = new THREE.PlaneGeometry(10, 200);
const roadMaterial = new THREE.MeshBasicMaterial({ color: 0x333333, side: THREE.DoubleSide });
const road = new THREE.Mesh(roadGeometry, roadMaterial);

// Rotate it flat so it lays horizontally like an asphalt surface floor
road.rotation.x = -Math.PI / 2;
scene.add(road);

// ==========================================
// 4. CREATING THE CONTROLLABLE PLAYER OBJECT
// ==========================================
const playerGeometry = new THREE.BoxGeometry(1, 1, 1);
const playerMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffcc });
const playerCube = new THREE.Mesh(playerGeometry, playerMaterial);

// Elevated at Y=0.5 so its center rests cleanly on top of the asphalt surface floor mesh
playerCube.position.set(0, 0.5, 2); 
scene.add(playerCube);

// ==========================================
// 5. INTERACTIVE KEYBOARD EVENT LISTENERS
// ==========================================
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') movingLeft = true;
    if (e.key === 'ArrowRight') movingRight = true;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') movingLeft = false;
    if (e.key === 'ArrowRight') movingRight = false;
});

// ==========================================
// 6. THE ANIMATED VIEWPORT LOOP WITH CHASE-CAM
// ==========================================
function animate() {
    requestAnimationFrame(animate);

    // A. Sideways Steering Input Math
    if (movingLeft) playerCube.position.x -= playerSpeed;
    if (movingRight) playerCube.position.x += playerSpeed;

    // Track asphalt shoulder boundaries
    if (playerCube.position.x < -4.5) playerCube.position.x = -4.5;
    if (playerCube.position.x > 4.5) playerCube.position.x = 4.5;

    // B. Forward Progression Movement
    // In Three.js coordinates, subtracting Z drives the entity forward into the screen distance
    playerCube.position.z -= forwardSpeed;

    // C. Live Chase-Cam Matrix Updates (Calculated every single frame)
    camera.position.x = playerCube.position.x;       // Stay horizontally tracked behind player's spine
    camera.position.y = playerCube.position.y + 3.0; // Stay elevated at a 3-unit altitude looking down
    camera.position.z = playerCube.position.z + 6.0; // Stay trailing exactly 6 units behind the player's position

    // Force the camera focal point to track the cube's dynamic coordinates
    camera.lookAt(playerCube.position.x, playerCube.position.y, playerCube.position.z);

    // D. Render update matrix context values frame-by-frame
    renderer.render(scene, camera);
}

// Kickstart engine execution
animate();
