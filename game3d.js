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

// --- 3D HOUSE TREADMILL POOL CONFIGURATION ---
const houseSpacing = 30; // Spaced out every 30 units along the Z axis
const numHouses = 8;     // A fixed pool of 8 houses active in rotation
let housePool = [];      // Array to store our active house meshes

// --- 3D PIZZA PROJECTILE ENGINE STATE ---
let pizzas3D = []; // Dynamic list tracking active pizza meshes in flight

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
        color: 0x333333, 
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
// 3.5 GENERATING THE RECYCLING HOUSE POOL 🏡
// ==========================================
const houseGeometry = new THREE.BoxGeometry(1.5, 1.5, 1.5); // A simple placeholder 3D box

for (let i = 0; i < numHouses; i++) {
    // We create individual materials per house so they can toggle color independently!
    const houseMaterial = new THREE.MeshBasicMaterial({ color: 0xff6b6b }); 
    const houseMesh = new THREE.Mesh(houseGeometry, houseMaterial);
    
    // Pick a side randomly for the initial layout setup: Left shoulder (-6.5) or Right shoulder (6.5)
    let initialSideX = Math.random() < 0.5 ? -6.5 : 6.5;
    
    // Position it: sit on top of the ground (Y = 0.75) and stagger down the road Z line
    houseMesh.position.set(initialSideX, 0.75, -i * houseSpacing - 15);
    
    // THE GENUINELY NEW IDEA: Inject custom game state variables into userData slot
    houseMesh.userData = {
        hasDelivered: false
    };
    
    scene.add(houseMesh);
    housePool.push(houseMesh); // Push into our tracking roster pool
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

 // --- 3D PIZZA LAUNCH SEQUENCE ON SPACEBAR TAP ---
    if ((e.key === ' ' || e.code === 'Space') && !e.repeat) {
        
        // 1. Define the 3D projectile shape and cheese-yellow material
        const pizzaGeo = new THREE.BoxGeometry(0.4, 0.4, 0.4);
        const pizzaMat = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
        const pizzaMesh = new THREE.Mesh(pizzaGeo, pizzaMat);
        
        // 2. Spawn it centered right at the hood of the player car (elevated at Y=0.8)
        pizzaMesh.position.set(playerCube.position.x, 0.8, playerCube.position.z - 0.5);
        
        // 3. Trajectory Math: Determine multi-axis flight vectors
        let vx = 0;
        if (movingLeft) vx = -0.15;  // Arc left if steering left
        if (movingRight) vx = 0.15;  // Arc right if steering right
        
        pizzaMesh.userData = {
            vx: vx,
            vy: 0.15,               // Upward toss impulse lift
            vz: -forwardSpeed - 0.3, // Match player speed PLUS extra forward velocity pop!
            toRemove: false
        };
        
        scene.add(pizzaMesh);
        pizzas3D.push(pizzaMesh);
    }
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
        
        // REPAIRED: Threshold increased from 25 to 35 to give the trailing camera 
        // plenty of clearance room before the tile teleports to the front!
        if (segment.position.z > playerCube.position.z + 35) {
            
            // Teleport the tile forward to the absolute front of the queue seamlessly
            segment.position.z -= numSegments * segmentLength;
        }
    }

        // --- 3D HOUSE POOL RECYCLING & STATE RENDERING LOGIC ---
    for (let i = 0; i < housePool.length; i++) {
        let house = housePool[i];

        // 1. STATE-BASED COLORING: Read the custom data state and set the visual hex color
        if (house.userData.hasDelivered) {
            house.material.color.setHex(0x66bb6a); // Lawn Green on delivery success
        } else {
            house.material.color.setHex(0xff6b6b); // Coral Red for active targets
        }

        // 2. RECYCLING CHECK: Clear using the exact same camera trailing algebra (+35 clearance margin)
        if (house.position.z > playerCube.position.z + 35) {
            
            // Teleport the house to the very front of the active house generation horizon line
            house.position.z -= numHouses * houseSpacing;
            
            // Randomize its track shoulder position for the next lap encounter!
            house.position.x = Math.random() < 0.5 ? -6.5 : 6.5;
            
            // CRITICAL RESET: Re-arm the target so it stands ready as a fresh delivery node
            house.userData.hasDelivered = false;
        }
    }


    // C. Live Chase-Cam Matrix Updates
    camera.position.x = playerCube.position.x;       
    camera.position.y = 3.0; 
    camera.position.z = playerCube.position.z + 6.0; 

    // Point the lens cleanly at the player object position vector
    camera.lookAt(playerCube.position);

        // ==========================================
    // LAYER 7: 3D PIZZAS (PHYSICS, GRAVITY, COLLISIONS) 🍕
    // ==========================================
    const gravity = 0.006; // Constant downward acceleration vector pull

    for (let i = 0; i < pizzas3D.length; i++) {
        let pizza = pizzas3D[i];
        
        // 1. Apply active gravitational drag down on the vertical Y axis
        pizza.userData.vy -= gravity;
        
        // 2. Update multi-axis position coordinates based on live velocities
        pizza.position.x += pizza.userData.vx;
        pizza.position.y += pizza.userData.vy;
        pizza.position.z += pizza.userData.vz;
        
        // 3. Bounce / Splat floor limit safety (stop it from falling through the world floor mesh)
        if (pizza.position.y < 0.1) {
            pizza.position.y = 0.1;
            pizza.userData.vy = 0;  // Kill upward momentum
            pizza.userData.vx *= 0.5; // Friction slowdown on impact
        }

        // 4. SCAN FOR 3D TARGET INTERSECTIONS
        for (let j = 0; j < housePool.length; j++) {
            let house = housePool[j];
            
            if (!house.userData.hasDelivered && isColliding3D(pizza, house)) {
                house.userData.hasDelivered = true; // Target turns Green!
                pizza.userData.toRemove = true;      // Flag pizza to be vaporized
            }
        }
    }

    // 5. DECOUPLED GARBAGE COLLECTION CLEANUP
    // Filter out spent ammo blocks or things that fly too far down the highway
    pizzas3D.forEach(p => {
        if (p.userData.toRemove || p.position.z < playerCube.position.z - 150) {
            scene.remove(p); // Erase physical body geometry node out of the active scene map
        }
    });
    
    pizzas3D = pizzas3D.filter(p => !p.userData.toRemove && p.position.z >= playerCube.position.z - 150);

    // D. Render update matrix context values frame-by-frame
    renderer.render(scene, camera);
}

// --- UNIVERSAL 3D BOX AABB COLLISION DETECTION ---
function isColliding3D(meshA, meshB) {
    // Generate bounding boxes manually using position scales
    // (Assuming boxes are sized symmetrically from their center coordinates)
    const boxA = {
        minX: meshA.position.x - 0.2, maxX: meshA.position.x + 0.2,
        minY: meshA.position.y - 0.2, maxY: meshA.position.y + 0.2,
        minZ: meshA.position.z - 0.2, maxZ: meshA.position.z + 0.2
    };
    
    // Houses are 1.5 units across (BoxGeometry(1.5, 1.5, 1.5))
    const boxB = {
        minX: meshB.position.x - 0.75, maxX: meshB.position.x + 0.75,
        minY: meshB.position.y - 0.75, maxY: meshB.position.y + 0.75,
        minZ: meshB.position.z - 0.75, maxZ: meshB.position.z + 0.75
    };

    return (
        boxA.minX <= boxB.maxX && boxA.maxX >= boxB.minX &&
        boxA.minY <= boxB.maxY && boxA.maxX >= boxB.minY &&
        boxA.minZ <= boxB.maxZ && boxA.maxZ >= boxB.minZ
    );
}

// Kickstart engine execution
animate();
