const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// --- HOUSE SPAWNING ENGINE STATE ---
let houses = [];          // Our dynamic list of active houses
let houseSpawnTimer = 0; // TRacks frames passed since the last spawn

// --- PIZZA PROJETILE ENGINE STATE ---
let pizzas = []; //Our dynamic list of active pizzas in flight

// Player position (Centered horizontally, 3/4 down the 720px tall canvas)
const playerSize = 30;

// Player position (Fixed: Centered horizontally, 3/4 down vertically)
let playerX = (canvas.width / 2) - 15; // Centered (Canvas width 400 / 2 - half of player width)
const playerY = (canvas.height * 3/4);   // 3/4 down the screen (Y = 540)

const playerSpeed = 5;     // Speed variable for handling adjustments

// Pattern: Movement Flags
let movingLeft = false;
let movingRight = false;
let accelerating = false;
let braking = false;

// --- BOUNDARY CLAMPS ---
// Picks limits based on the 50px left margin and 380px road width
const leftLimit = 50;
const rightLimit = 430; // 50 + 380

// Clamp speed limits
const minSpeed = 2;  // Keep a base movement speed, so it never drops to 0 or negative
const maxSpeed = 12; // A reasonable safe top velocity limit

// The mutable scrolling engine variables
let scrolly = 0;
let scrollSpeed = 4;      // Turned into a mutable variable to persist over time

// Pattern: Keyboard Event Listeners
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') movingLeft = true;
    if (e.key === 'ArrowRight') movingRight = true;
    if (e.key === 'ArrowUp') accelerating = true;     // Track acceleration press
    if (e.key === 'ArrowDown') braking = true;        // Track brake press

    // SPAWN PIZZA ON SPACEBAR TAP
    if ((e.key === ' ' || e.code === 'Space') && !e.repeat){
        // Determine horizontal velocity based on player's current steering direction
        let pizzaVx = 0;
        if (movingLeft) pizzaVx = -4;
        if (movingRight) pizzaVx = 4;

        let newPizza = {
            // Spawn the pizza perfectly centered right at the front edge of our player box
            x: playerX + (playerSize / 2) - 6,
            y: playerY,
            width: 12,
            height: 12,
            vx: pizzaVx, // Horizontal flight speed
            vy: -8       // Upward flight speed (flies faster that the  world scrolls)
        };
        pizzas.push(newPizza);
    }
});

// --- KEYUP LISTENER ---
document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') movingLeft = false;
    if (e.key === 'ArrowRight') movingRight = false;
    if (e.key === 'ArrowUp') accelerating = false;    // Track acceleration release
    if (e.key === 'ArrowDown') braking = false;       // Track brake release
});


function gameloop(){
    // Clear the  canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Pattern: Inside the loop, adjust playerX based on the flags
    if (movingLeft) playerX -= playerSpeed;
    if (movingRight) playerX += playerSpeed;

    // Prevent player's from moving past the left edge of the road
    if (playerX < leftLimit) playerX = leftLimit;

    // Prevent player's  right edge from moving past the right edge of the road
    if (playerX + playerSize > rightLimit) playerX = rightLimit - playerSize;

    // READ FLAGS & CHANGE VALUE 
    // We use a small fraction step size (0.1) so acceleration builds up smoothly over multiple frames
    if (accelerating) scrollSpeed += 0.1; 
    if (braking) scrollSpeed -= 0.1;     

    // Clamp speed
    if (scrollSpeed < minSpeed) scrollSpeed = minSpeed;
    if (scrollSpeed > maxSpeed) scrollSpeed = maxSpeed;

    // Advance the infinite scroll tracker using your mutable speed variable
    scrolly += scrollSpeed; // This is scroll speed

     // ==========================================
    // ---: HOUSES (SPAWN, UPDATE, DRAW) ---
    // ==========================================

    // 1. SPAWN: Advance timer and check if it;s time to generate a house
    houseSpawnTimer++;
    if (houseSpawnTimer >= 120) {  // Every 120 frames (approx. 2 seconds at 60fps)
        
        // Randomly pick a lane side: Left side grass (10px) or Right side grass (440px)
        // Road starts at 50 and ends at 430. Houses sit on the grass borders!
        let randomX = Math.random() < 0.5 ? 10 :  440;

        let newHouse = {
            x: randomX,
            y: -60,              // Start fully hidden above the visible canvas
            width:  30,
            height: 40,
            hasDelivered: false
        };

        houses.push(newHouse); // Insert into our tracking roster
        houseSpawnTimer = 0; // Reset the timer back to zero
    }

    // 2. Update: Move every active house down at the world's scroll speed
    for (let i = 0; i < houses.length; i++) {
        houses[i].y += scrollSpeed;  // Makes them look perfectly anchored to the moving street
    }

    // --- GARBAGE COLLECTION CLEANUP ---
    // Keep only houses that are still on or above the canvas screen area
    houses = houses.filter(h => h.y < canvas.height);

    // 3. DRAW: Render every  house currently inside our array
    ctx.fillStyle = '#ff6b6b' // Coral/Red color for delivery target houses
    for (let i = 0; i < houses.length; i++) {
        let h = houses[i];
        ctx.fillRect(h.x, h.y, h.width, h.height);
    }

    // ==========================================
    // --- STEP 6: PIZZAS (UPDATE, CLEAN, DRAW) ---
    // ==========================================
    
    //  1. UPDATE: Move every pizza along its trajectory vectors
    for (let i = 0; i < pizzas.length; i++) {
        pizzas[i].x += pizzas[i].vx;
        pizzas[i].y += pizzas[i].vy;
    }

    // 2. GARBAGE COLLECTION: Delete pizzas  that fly off the top or sides of the screen
    pizzas = pizzas.filter(p => p.y > -20 && p.x > 0 && p.x < canvas.width);

    // 3. DRAW: Render every active pizza as a small yellow/orange box
    ctx.fillStyle = '#ffcc00'; // Cheesy pizza yellow
    for (let i = 0; i < pizzas.length; i++) {
        let p = pizzas[i];
        ctx.fillRect(p.x, p.y, p.width, p.height);
    }

    // The Modulo  Trick: Keeps offset resetting between 0 and 399
    let offset = scrolly % canvas.height;

    // Draw Street Segment 1 (Slides down from the top)
    ctx.fillStyle = '#333333'; // Dark grey street color
    ctx.fillRect(50, offset, 380, canvas.height);

    // Draw Street Segment 2 (Stacked directly ABOVE Segment 1)
    // Subtracking canvas.height positions it perfectly above the first segment
    ctx.fillStyle = '#333333'
    ctx.fillRect(50, offset - canvas.height, 380, canvas.height);

    // --- SCROLLING ROAD DASHES ---
    ctx.fillStyle = '#ffffff'; 
    const lineWidth = 6;
    const lineHeight = 40;
    const gap = 30; 
    const lineX = (canvas.width / 2) - (lineWidth / 2); // Center of the road

    // Draw a column of dashes starting above the screen all the way to the bottom
    for (
        let drawY = -canvas.height;
            drawY < canvas.height * 2; 
            drawY += (lineHeight + gap)) {
        ctx.fillRect(lineX, drawY + offset, lineWidth, lineHeight);
    }

    // 6. Draw the fixed Player on top of the moving street
    ctx.fillStyle = '#00ffcc'; // Neon player square
    ctx.fillRect(playerX, playerY, playerSize, playerSize,);

    requestAnimationFrame(gameloop);
}

gameloop();