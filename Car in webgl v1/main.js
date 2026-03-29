const canvas = document.getElementById('car_webgl');
const gl = canvas.getContext('webgl');

if (!gl) {
    console.error('WebGL not supported');
}

var vertices = [
    // Body — rectangle made of 2 triangles
    //   Triangle 1: A → B → C
    -0.75, -0.20, 0.0,   // A (bottom-left)
     0.75, -0.20, 0.0,   // B (bottom-right)
     0.75,  0.20, 0.0,   // C (top-right)
    //   Triangle 2: A → C → D
    -0.75, -0.20, 0.0,   // A (bottom-left)
     0.75,  0.20, 0.0,   // C (top-right)
    -0.75,  0.20, 0.0,   // D (top-left)

    // Roof — trapezoid made of 2 triangles
    //   Triangle 1: E → F → G
    -0.35,  0.20, 0.0,   // E (bottom-left of roof)
     0.35,  0.20, 0.0,   // F (bottom-right of roof)
     0.20,  0.45, 0.0,   // G (top-right of roof)
    //   Triangle 2: E → G → H
    -0.35,  0.20, 0.0,   // E (bottom-left of roof)
     0.20,  0.45, 0.0,   // G (top-right of roof)
    -0.20,  0.45, 0.0,   // H (top-left of roof)
];

var colors = [
    // Body — red (same color for all 6 vertices)
    0.85, 0.15, 0.15,
    0.85, 0.15, 0.15,
    0.85, 0.15, 0.15,
    0.85, 0.15, 0.15,
    0.85, 0.15, 0.15,
    0.85, 0.15, 0.15,

    // Roof — darker red (same color for all 6 vertices)
    0.65, 0.10, 0.10,
    0.65, 0.10, 0.10,
    0.65, 0.10, 0.10,
    0.65, 0.10, 0.10,
    0.65, 0.10, 0.10,
    0.65, 0.10, 0.10,
];

var vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

var colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

var vertexShaderSource = `
    attribute vec3 aPosition;
    attribute vec3 aColor;
    varying vec3 vColor;

    void main() 
    {
        gl_Position = vec4(aPosition, 1.0);
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

gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
var aPosition = gl.getAttribLocation(shaderProgram, 'aPosition');
gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(aPosition);

gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
var aColor = gl.getAttribLocation(shaderProgram, 'aColor');
gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(aColor);

function renderScene() 
{
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 3);
    requestAnimationFrame(renderScene);
}
renderScene();