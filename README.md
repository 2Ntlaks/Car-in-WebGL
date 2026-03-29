# Car in WebGL

A beginner-friendly, step-by-step guide to building a 2D car using **raw WebGL** — no libraries, no frameworks, just vertices on a Cartesian plane.

This project shows how to go from plotting points on a grid to rendering and animating shapes in the browser using WebGL.

---

## 🗂️ Project Structure

```
Car in WebGL/
├── README.md
├── assets/
│   ├── sketch.jpeg    ← Cartesian plane construction diagram
│   ├── v1.png         ← Screenshot of v1
│   ├── v2.png         ← Screenshot of v2
│   └── v3.mp4         ← Video of the car moving
├── Car in webgl v1/   ← Body + Roof only
│   ├── index.html
│   ├── main.js
│   └── style.css
└── car in webgl v2/   ← Wheels, Windows, Headlight + Animation
    ├── index.html
    ├── main.js
    └── style.css
```

---

## Step 1: Sketch It on the Cartesian Plane

Before writing any code, plot your points on a grid. WebGL uses a coordinate system from **-1 to 1** on both axes. Every shape is just a set of (x, y) coordinates.

![Cartesian plane construction diagram](assets/sketch.jpeg)

The car is built from simple shapes:
- **Body** → Rectangle (points A, B, C, D)
- **Roof** → Trapezoid (points E, F, G, H)

Each shape is split into **triangles** because that's the only primitive WebGL can draw.

---

## Step 2: V1 — Body + Roof

With the coordinates from the sketch, write them directly into a `vertices` array. No helper functions — just raw numbers that map 1:1 to the diagram.

```js
var vertices = [
    // Body — Triangle 1: A → B → C
    -0.75, -0.20, 0.0,   // A (bottom-left)
     0.75, -0.20, 0.0,   // B (bottom-right)
     0.75,  0.20, 0.0,   // C (top-right)
    // Body — Triangle 2: A → C → D
    -0.75, -0.20, 0.0,   // A
     0.75,  0.20, 0.0,   // C
    -0.75,  0.20, 0.0,   // D (top-left)
    // ...
];
```

**Result:**

![V1 — Body and Roof](assets/v1.png)

📂 Full code: [`Car in webgl v1/`](Car%20in%20webgl%20v1/)

---

## Step 3: V2 — Wheels, Windows & Headlight

Using the same approach — plot, label, split into triangles — we add more parts:

| Part | Shape | Method |
|------|-------|--------|
| **Wheels** | Hexagons | 6 triangles from center to edge points |
| **Windows** | Quads inside the roof | 2 triangles each |
| **Headlight** | Small quad at the front | 2 triangles |

**Result:**

![V2 — Full car with details](assets/v2.png)

📂 Full code: [`car in webgl v2/`](car%20in%20webgl%20v2/)

---

## Step 4: Make It Move!

Using **transformation matrices** (translation, scaling, rotation), we multiply every vertex by a transform in the vertex shader:

```glsl
uniform mat4 uTransform;

void main() {
    gl_Position = uTransform * vec4(aPosition, 1.0);
}
```

Each frame, the car translates across the screen with a subtle bounce:

```js
var driveX = ((angle * 0.5) % 4.0) - 2.0;
var bounceY = Math.sin(angle * 4.0) * 0.02;
var transform = multiplyMatrices(
    translation(driveX, bounceY, 0.0),
    scaling(0.6, 0.6, 1.0)
);
```

**Result:**

https://github.com/user-attachments/assets/v3.mp4

> *If the video doesn't play above, see [`assets/v3.mp4`](assets/v3.mp4)*

---

## Key Takeaways

1. **Sketch first, code second** — Plot your points on a Cartesian plane before touching any code
2. **Everything is triangles** — WebGL only draws triangles, so every rectangle, trapezoid, or hexagon is split into triangles
3. **Coordinates map directly** — The numbers in your `vertices` array are the exact (x, y) values from your sketch
4. **Transformations = matrices** — Moving, scaling, and rotating shapes is done by multiplying vertices by a 4×4 matrix

---

## How to Run

1. Clone this repo
2. Open `Car in webgl v1/index.html` or `car in webgl v2/index.html` in your browser
3. No build step, no npm — just open and go!

---

## License

Feel free to use, modify, and learn from this project.
