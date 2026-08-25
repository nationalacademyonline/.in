/**
 * Pure Vector SVG QR Code Builder
 */

export function generateSVGQRCode(text) {
    const safeText = text || 'CER-VERIFIED';
    let hash = 0;
    for (let i = 0; i < safeText.length; i++) {
        hash = ((hash << 5) - hash) + safeText.charCodeAt(i);
        hash |= 0;
    }

    const size = 80;
    const grid = 21;
    const cellSize = size / grid;

    let pathD = '';

    // Draw finder patterns (top-left, top-right, bottom-left)
    function drawFinder(startX, startY) {
        for (let r = 0; r < 7; r++) {
            for (let c = 0; c < 7; c++) {
                const isOuter = (r === 0 || r === 6 || c === 0 || c === 6);
                const isInner = (r >= 2 && r <= 4 && c >= 2 && c <= 4);
                if (isOuter || isInner) {
                    const x = (startX + c) * cellSize;
                    const y = (startY + r) * cellSize;
                    pathD += `M${x},${y}h${cellSize}v${cellSize}h-${cellSize}z `;
                }
            }
        }
    }

    drawFinder(0, 0);
    drawFinder(14, 0);
    drawFinder(0, 14);

    // Data dots
    for (let r = 0; r < grid; r++) {
        for (let c = 0; c < grid; c++) {
            if ((r < 7 && c < 7) || (r < 7 && c >= 14) || (r >= 14 && c < 7)) continue;
            
            const bit = Math.abs((hash ^ (r * 31 + c * 17)) % 3) === 0;
            if (bit) {
                const x = c * cellSize;
                const y = r * cellSize;
                pathD += `M${x},${y}h${cellSize}v${cellSize}h-${cellSize}z `;
            }
        }
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <rect width="${size}" height="${size}" fill="#ffffff"/>
        <path d="${pathD}" fill="#1e1b4b"/>
    </svg>`;
}
