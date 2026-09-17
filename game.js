const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Player position (Centered horizontally, 3/4 down the 720px tall canvas)
const playerSize = 30;

// Player position (Fixed: Centered horizontally, 3/4 down vertically)
const playerX = (canvas.width / 2) - 15; // Centered (Canvas width 400 / 2 - half of player width)
const playerY = (canvas.height * 3/4);   // 3/4 down the screen (Y = 540)

// The infinite scrolling tracker
let scrolly = 0;

function gameloop(){
    // 1. Clear the  canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. Advance the infinite scroll  tracker
    scrolly += 4; // This is scroll speed

    // 3. The Modulo  Trick: Keeps offset resetting between 0 and 399
    let offset = scrolly % canvas.height;

    // 4. Draw Street Segment 1 (Slides down from the top)
    ctx.fillStyle = '#333333'; // Dark grey street color
    ctx.fillRect(50, offset, 380, canvas.height);

    // 5. Draw Street Segment 2 (Stacked directly ABOVE Segment 1)
    // Subtracking canvas.height positions it perfectly above the first segment
    ctx.fillStyle = '#274de644'
    ctx.fillRect(50, offset - canvas.height, 380, canvas.height);

    // --- SCROLLING ROAD DASHES ---
    ctx.fillStyle = '#ffffff'; 
    const lineWidth = 6;
    const lineHeight = 40;
    const gap = 30; 
    const lineX = (canvas.width / 2) - (lineWidth / 2); // Center of the road

    // Draw a column of dashes starting above the screen all the way to the bottom
    for (let drawY = -canvas.height; drawY < canvas.height * 2; drawY += (lineHeight + gap)) {
        ctx.fillRect(lineX, drawY + offset, lineWidth, lineHeight);
    }
    
    // 6. Draw the fixed Player on top of the moving street
    ctx.fillStyle = '#00ffcc'; // Neon player square
    ctx.fillRect(playerX, playerY, playerSize, playerSize,);

    requestAnimationFrame(gameloop);
}

gameloop();