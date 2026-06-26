// Verification script for handleMouseMove calculation logic
function calculateTilt(event, rect) {
    if (!rect || rect.width === 0 || rect.height === 0) {
        return { percentX: NaN, percentY: NaN };
    }
    const percentX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const percentY = -((event.clientY - rect.top) / rect.height - 0.5) * 2;
    return {
        percentX,
        percentY,
        rotateX: percentY * 1.4,
        rotateY: percentX * 1.4
    };
}

// Test cases
const tests = [
    {
        name: "Standard center hover",
        event: { clientX: 200, clientY: 150 },
        rect: { left: 100, top: 100, width: 200, height: 100 },
        expected: { rotateX: 0, rotateY: 0 }
    },
    {
        name: "Top-left edge hover",
        event: { clientX: 100, clientY: 100 },
        rect: { left: 100, top: 100, width: 200, height: 100 },
        expected: { rotateX: 1.4, rotateY: -1.4 }
    },
    {
        name: "Bottom-right edge hover",
        event: { clientX: 300, clientY: 200 },
        rect: { left: 100, top: 100, width: 200, height: 100 },
        expected: { rotateX: -1.4, rotateY: 1.4 }
    },
    {
        name: "Zero width (division by zero risk)",
        event: { clientX: 200, clientY: 150 },
        rect: { left: 100, top: 100, width: 0, height: 100 },
        expected: { percentX: NaN, percentY: NaN }
    },
    {
        name: "Undefined event coordinates (touch event risk)",
        event: { clientX: undefined, clientY: undefined },
        rect: { left: 100, top: 100, width: 200, height: 100 },
        expected: { percentX: NaN, percentY: NaN }
    }
];

console.log("=== RUNNING CALCULATION VERIFICATION ===");
let passed = true;
for (const tc of tests) {
    const res = calculateTilt(tc.event, tc.rect);
    const isNaNExpected = Number.isNaN(tc.expected.percentX);
    const isNaNActual = Number.isNaN(res.percentX);
    
    let match = false;
    if (isNaNExpected && isNaNActual) {
        match = true;
    } else if (!isNaNExpected && !isNaNActual) {
        match = Math.abs(res.rotateX - tc.expected.rotateX) < 1e-5 && 
                Math.abs(res.rotateY - tc.expected.rotateY) < 1e-5;
    }
    
    if (match) {
        console.log(`[PASS] ${tc.name}`);
    } else {
        console.log(`[FAIL] ${tc.name} | Expected: ${JSON.stringify(tc.expected)}, Got: ${JSON.stringify(res)}`);
        passed = false;
    }
}

if (!passed) {
    process.exit(1);
}
