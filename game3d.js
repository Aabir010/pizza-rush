// ==========================================
// 1. THE 3D ENVIRONMENT SETUP
// ==========================================

// Create the empty 3D universe container
const scene = new THREE.Scene();

// Set up the Camera (Field of View, Aspect Ratio, Near plane clipping, Far plane clipping)
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Set up the WebGL engine renderer hardware loader
const renderer = new THREE.WebGLRenderer();

// Match the engine canvas to the full size of the user's browser window
renderer.setSize(window.innerWidth, window.innerHeight);

// Append the newly generated 3D canvas into the HTML page body
document.body.appendChild(renderer.domElement);

// ==========================================
// 2. CREATING THE CUBE MESH
// ==========================================

// Define the mathematical shape: A standard 3D Box (Width: 1, Height: 1, Depth: 1)
const geometry = new THREE.BoxGeometry(1, 1, 1);

// Define the surface look: Basic solid color material (Neon Cyan) that doesn't require light
const material = new THREE.MeshBasicMaterial({ color: 0x00ffcc });

// Combine shape + material into a single solid 3D entity called a Mesh
const cube = new THREE.Mesh(geometry, material);

// Insert our newly minted cube into the empty universe scene
scene.add(cube);

// ==========================================
// 3. SPATIAL POSITIONING & RENDERING
// ==========================================

// CRITICAL FIX: Pull the camera back along the Z-axis (towards your chest)
// By default, everything spawns at (0,0,0). Moving to Z=5 avoids being stuck INSIDE the cube!
camera.position.z = 5;

// ==========================================
// 4. THE 3D RENDER LOOP ANIMATION ENGINE
// ==========================================
function animate() {
    // 1. Request the browser to cycle this function on the next frame refresh
    requestAnimationFrame(animate);

    // 2. Incremental Rotation Math: Spin the cube slightly on the X and Y axes
    // This alters the object vectors over time to reveal perspective depth!
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    // 3. Redraw the universe using our active coordinates
    // (This automatically handles clearing the frame buffer internally!)
    renderer.render(scene, camera);
}

// Kickstart the 3D loop execution
animate();
