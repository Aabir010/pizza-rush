// ==========================================
// 1. GLOBAL STATE & PHYSICS VARIABLES
// ==========================================
let movingLeft = false;
let movingRight = false;
const playerSpeed = 0.15; // Sideways steering response increment

// --- 3D FORWARD VELOCITY STATS ---
let forwardSpeed = 0.2;   // The velocity pushing the player ahead along the Z-axis

// --- TREADMILL CONFIGURATION ---
const segmentLength = 50;  // How long each tile is along the Z axis
const numSegments = 4;     // Total number of tiles in rotation (Total road pool = 200 units)
let roadSegments = [];     // Array to store our active plane meshes

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
// 3. DICTIONARY GENERATION: RAINBOW TRACK SECTIONS
// ==========================================
// FIXED: Removed duplicate 'segmentLength', 'numSegments', and 'roadSegments' redeclarations!

const roadGeometry = new THREE.PlaneGeometry(10, segmentLength);

// Array of distinct test colors to label each individual tile segment
const trackColors = [0xff4444, 0x44ff44, 0x4444ff, 0xffff44]; // Red, Green, Blue, Yellow

for (let i = 0; i < numSegments; i++) {
    // Dynamic material assignment per iteration using our color dictionary
    const roadMaterial = new THREE.MeshBasicMaterial({ 
        color: trackColors[i], 
        side: THREE.DoubleSide 
    });
    
    const roadSegment = new THREE.Mesh(roadGeometry, roadMaterial);
    roadSegment.rotation.x = -Math.PI / 2;
    
    // Initial edge alignment stacking layout
    roadSegment.position.z = -i * segmentLength;
    
    scene.add(roadSegment);
    roadSegments.push(roadSegment); 
}

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
// 6. THE ANIMATED VIEWPORT LOOP WITH RECYCLING
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
    playerCube.position.z -= forwardSpeed;

    // --- 3D SEGMENT RECYCLING LOGIC ---
    for (let i = 0; i < roadSegments.length; i++) {
        let segment = roadSegments[i];
        
        // If a segment's Z value is greater than the player's Z position plus a safe trailing margin...
        if (segment.position.z > playerCube.position.z + 25) {
            
            // Teleport the tile forward to the absolute front of the queue seamlessly
            segment.position.z -= numSegments * segmentLength;
        }
    }

    // C. Live Chase-Cam Matrix Updates
    camera.position.x = playerCube.position.x;       
    camera.position.y = 3.0; 
    camera.position.z = playerCube.position.z + 6.0; 

    // Point the lens cleanly at the player object position vector
    camera.lookAt(playerCube.position);

    // D. Render update matrix context values frame-by-frame
    renderer.render(scene, camera);
}

// Kickstart engine execution
animate();
