const canvas = document.getElementById('car_webgl');
const gl = canvas.getContext('webgl');

if (!gl) {
    console.error('WebGL not supported');
}

// ===========================
// TRANSFORMATION MATRICES
// ===========================

function xRot(angle)
{
    var c = Math.cos(angle);
    var s = Math.sin(angle);

    return new Float32Array([
        1, 0, 0, 0,
        0, c, -s, 0,
        0, s, c, 0,
        0, 0, 0, 1
    ]);
}

function yRot(angle)
{
    var c = Math.cos(angle);
    var s = Math.sin(angle);

    return new Float32Array([
        c, 0, s, 0,
        0, 1, 0, 0,
        -s, 0, c, 0,
        0, 0, 0, 1
    ]);
}

function zRot(angle)
{
    var c = Math.cos(angle);
    var s = Math.sin(angle);

    return new Float32Array([
        c, -s, 0, 0,
        s, c, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]);
}

function multiplyMatrices(a, b)
{
    var result = new Float32Array(16);

    for (var col = 0; col < 4; col++)
    {
        for (var row = 0; row < 4; row++)
        {
            var sum = 0;

            for (var k = 0; k < 4; k++)
            {
                sum += a[k * 4 + row] * b[col * 4 + k];
            }

            result[col * 4 + row] = sum;
        }
    }

    return result;
}

function scaling(sx, sy, sz)
{
    return new Float32Array([
        sx, 0, 0, 0,
        0, sy, 0, 0,
        0, 0, sz, 0,
        0, 0, 0, 1
    ]);
}

function translation(tx, ty, tz)
{
    return new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        tx, ty, tz, 1
    ]);
}

// ===========================
// VERTICES — same labeled coordinates as before
// ===========================

var vertices = [

    // ===========================
    // BODY — rectangle (2 triangles)
    // ===========================
    //   Triangle 1: A → B → C
    -0.75, -0.20, 0.0,   // A (bottom-left)
     0.75, -0.20, 0.0,   // B (bottom-right)
     0.75,  0.20, 0.0,   // C (top-right)
    //   Triangle 2: A → C → D
    -0.75, -0.20, 0.0,   // A (bottom-left)
     0.75,  0.20, 0.0,   // C (top-right)
    -0.75,  0.20, 0.0,   // D (top-left)

    // ===========================
    // ROOF — trapezoid (2 triangles)
    // ===========================
    //   Triangle 1: E → F → G
    -0.35,  0.20, 0.0,   // E (bottom-left of roof)
     0.35,  0.20, 0.0,   // F (bottom-right of roof)
     0.20,  0.45, 0.0,   // G (top-right of roof)
    //   Triangle 2: E → G → H
    -0.35,  0.20, 0.0,   // E (bottom-left of roof)
     0.20,  0.45, 0.0,   // G (top-right of roof)
    -0.20,  0.45, 0.0,   // H (top-left of roof)

    // ===========================
    // LEFT WHEEL — hexagon at center (-0.45, -0.25)
    // ===========================
    //   Triangle 1: Center → W1 → W2
    -0.45, -0.25, 0.0,
    -0.32, -0.25, 0.0,
    -0.38, -0.14, 0.0,
    //   Triangle 2: Center → W2 → W3
    -0.45, -0.25, 0.0,
    -0.38, -0.14, 0.0,
    -0.52, -0.14, 0.0,
    //   Triangle 3: Center → W3 → W4
    -0.45, -0.25, 0.0,
    -0.52, -0.14, 0.0,
    -0.58, -0.25, 0.0,
    //   Triangle 4: Center → W4 → W5
    -0.45, -0.25, 0.0,
    -0.58, -0.25, 0.0,
    -0.52, -0.36, 0.0,
    //   Triangle 5: Center → W5 → W6
    -0.45, -0.25, 0.0,
    -0.52, -0.36, 0.0,
    -0.38, -0.36, 0.0,
    //   Triangle 6: Center → W6 → W1
    -0.45, -0.25, 0.0,
    -0.38, -0.36, 0.0,
    -0.32, -0.25, 0.0,

    // ===========================
    // RIGHT WHEEL — hexagon at center (0.45, -0.25)
    // ===========================
    //   Triangle 1: Center → W7 → W8
     0.45, -0.25, 0.0,
     0.58, -0.25, 0.0,
     0.52, -0.14, 0.0,
    //   Triangle 2: Center → W8 → W9
     0.45, -0.25, 0.0,
     0.52, -0.14, 0.0,
     0.38, -0.14, 0.0,
    //   Triangle 3: Center → W9 → W10
     0.45, -0.25, 0.0,
     0.38, -0.14, 0.0,
     0.32, -0.25, 0.0,
    //   Triangle 4: Center → W10 → W11
     0.45, -0.25, 0.0,
     0.32, -0.25, 0.0,
     0.38, -0.36, 0.0,
    //   Triangle 5: Center → W11 → W12
     0.45, -0.25, 0.0,
     0.38, -0.36, 0.0,
     0.52, -0.36, 0.0,
    //   Triangle 6: Center → W12 → W7
     0.45, -0.25, 0.0,
     0.52, -0.36, 0.0,
     0.58, -0.25, 0.0,

    // ===========================
    // LEFT WINDOW — quad inside the roof (2 triangles)
    // ===========================
    //   Triangle 1: I → J → K
    -0.28,  0.23, 0.0,
    -0.04,  0.23, 0.0,
    -0.06,  0.42, 0.0,
    //   Triangle 2: I → K → L
    -0.28,  0.23, 0.0,
    -0.06,  0.42, 0.0,
    -0.18,  0.42, 0.0,

    // ===========================
    // RIGHT WINDOW — quad inside the roof (2 triangles)
    // ===========================
    //   Triangle 1: M → N → O
     0.04,  0.23, 0.0,
     0.28,  0.23, 0.0,
     0.18,  0.42, 0.0,
    //   Triangle 2: M → O → P
     0.04,  0.23, 0.0,
     0.18,  0.42, 0.0,
     0.06,  0.42, 0.0,

    // ===========================
    // HEADLIGHT — small quad at the front (2 triangles)
    // ===========================
    //   Triangle 1: Q → R → S
     0.62, -0.08, 0.0,
     0.75, -0.08, 0.0,
     0.75,  0.08, 0.0,
    //   Triangle 2: Q → S → T
     0.62, -0.08, 0.0,
     0.75,  0.08, 0.0,
     0.62,  0.08, 0.0,
];

var colors = [
    // Body — red (6 vertices)
    0.85, 0.15, 0.15,
    0.85, 0.15, 0.15,
    0.85, 0.15, 0.15,
    0.85, 0.15, 0.15,
    0.85, 0.15, 0.15,
    0.85, 0.15, 0.15,

    // Roof — darker red (6 vertices)
    0.65, 0.10, 0.10,
    0.65, 0.10, 0.10,
    0.65, 0.10, 0.10,
    0.65, 0.10, 0.10,
    0.65, 0.10, 0.10,
    0.65, 0.10, 0.10,

    // Left wheel — dark gray (18 vertices)
    0.15, 0.15, 0.15,
    0.15, 0.15, 0.15,
    0.15, 0.15, 0.15,
    0.15, 0.15, 0.15,
    0.15, 0.15, 0.15,
    0.15, 0.15, 0.15,
    0.15, 0.15, 0.15,
    0.15, 0.15, 0.15,
    0.15, 0.15, 0.15,
    0.15, 0.15, 0.15,
    0.15, 0.15, 0.15,
    0.15, 0.15, 0.15,
    0.15, 0.15, 0.15,
    0.15, 0.15, 0.15,
    0.15, 0.15, 0.15,
    0.15, 0.15, 0.15,
    0.15, 0.15, 0.15,
    0.15, 0.15, 0.15,

    // Right wheel — dark gray (18 vertices)
    0.15, 0.15, 0.15,
    0.15, 0.15, 0.15,
    0.15, 0.15, 0.15,
    0.15, 0.15, 0.15,
    0.15, 0.15, 0.15,
    0.15, 0.15, 0.15,
    0.15, 0.15, 0.15,
    0.15, 0.15, 0.15,
    0.15, 0.15, 0.15,
    0.15, 0.15, 0.15,
    0.15, 0.15, 0.15,
    0.15, 0.15, 0.15,
    0.15, 0.15, 0.15,
    0.15, 0.15, 0.15,
    0.15, 0.15, 0.15,
    0.15, 0.15, 0.15,
    0.15, 0.15, 0.15,
    0.15, 0.15, 0.15,

    // Left window — light blue (6 vertices)
    0.60, 0.85, 1.00,
    0.60, 0.85, 1.00,
    0.60, 0.85, 1.00,
    0.60, 0.85, 1.00,
    0.60, 0.85, 1.00,
    0.60, 0.85, 1.00,

    // Right window — light blue (6 vertices)
    0.60, 0.85, 1.00,
    0.60, 0.85, 1.00,
    0.60, 0.85, 1.00,
    0.60, 0.85, 1.00,
    0.60, 0.85, 1.00,
    0.60, 0.85, 1.00,

    // Headlight — yellow (6 vertices)
    1.00, 0.90, 0.20,
    1.00, 0.90, 0.20,
    1.00, 0.90, 0.20,
    1.00, 0.90, 0.20,
    1.00, 0.90, 0.20,
    1.00, 0.90, 0.20,
];

// ===========================
// BUFFERS
// ===========================

var vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

var colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

// ===========================
// SHADERS — now with a uTransform uniform matrix
// ===========================

var vertexShaderSource = `
    attribute vec3 aPosition;
    attribute vec3 aColor;
    varying vec3 vColor;

    uniform mat4 uTransform;

    void main() 
    {
        gl_Position = uTransform * vec4(aPosition, 1.0);
        vColor = aColor;
    }
`;

var vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vertexShaderSource);
gl.compileShader(vertexShader);

var fragmentShaderSource = `
    precision mediump float;
    varying vec3 vColor;

    void main()
    {
        gl_FragColor = vec4(vColor, 1.0);
    }
`;

var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fragmentShaderSource);
gl.compileShader(fragmentShader);

var shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vertexShader);
gl.attachShader(shaderProgram, fragmentShader);
gl.linkProgram(shaderProgram);
gl.useProgram(shaderProgram);

// ===========================
// ATTRIBUTE + UNIFORM SETUP
// ===========================

gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
var aPosition = gl.getAttribLocation(shaderProgram, 'aPosition');
gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(aPosition);

gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
var aColor = gl.getAttribLocation(shaderProgram, 'aColor');
gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(aColor);

var uTransform = gl.getUniformLocation(shaderProgram, 'uTransform');

// ===========================
// ANIMATION LOOP
// The car drives right, then loops back from the left
// with a small bounce to feel alive
// ===========================

var angle = 0;

function renderScene() 
{
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, canvas.width, canvas.height);

    angle += 0.01;

    // Drive across the screen: x goes from -2 to +2, then wraps
    var driveX = ((angle * 0.5) % 4.0) - 2.0;

    // Small bounce on y using sin
    var bounceY = Math.sin(angle * 4.0) * 0.02;

    // Combine: first scale down a bit, then translate
    var transform = multiplyMatrices(
        translation(driveX, bounceY, 0.0),
        scaling(0.6, 0.6, 1.0)
    );

    gl.uniformMatrix4fv(uTransform, false, transform);

    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 3);
    requestAnimationFrame(renderScene);
}
renderScene();
