ctx.strokeStyle = "white";
const simplex = new SimplexNoise();

function centerToTriangle(center, maxY = 1) {
  const height = (maxY - center.y) / 1.3;
  return [
    new Vector(center.x - height, maxY),
    center,
    new Vector(center.x + height, maxY),
  ];
}

function drawVertices(vertices) {
  ctx.beginPath();
  vertices.forEach((vertex) =>
    ctx.lineTo(vertex.x * canvas.width, vertex.y * canvas.height)
  );
  ctx.fill();
}

const mountainCenters = new Array(5)
  .fill()
  .map(
    (_, i, arr) =>
      new Vector(
        (Math.random() / 2 + i + 0.25) / arr.length,
        (Math.random() + 2) / 4
      )
  );

const mountains = new Monad(mountainCenters)
  .map((arr) => arr.sort((a, b) => b.y - a.y))
  .map((arr) =>
    arr.map((center) => ({
      mountain: centerToTriangle(center),
      snow: centerToTriangle(center, 1 - (1 - center.y) * 0.8),
    }))
  )
  .value();

const rotationCenter = new Vector(0.7, 0.3);
const inverseRotationCenter = Vector.ONE.sub(rotationCenter);
const maxMag = new Vector(
  Math.max(rotationCenter.x, inverseRotationCenter.x),
  Math.max(rotationCenter.y, inverseRotationCenter.y)
).getMagnitude();
const stars = new Array(400)
  .fill()
  .map(() =>
    new Vector(0, Math.random() * maxMag)
      .setAngle(Math.random() * 2 * Math.PI)
      .add(rotationCenter)
  )
  .filter(
    (center) => center.x > 0 && center.x < 1 && center.y > 0 && center.y < 1
  )
  .map((center) => ({ center, sizeMultiplier: Math.random() }));

const auroraPath = [
  new Vector(0, mountainCenters[0].y - Math.random() / 15),
  ...mountainCenters.sort((a, b) => a.x - b.x),
  new Vector(
    1,
    mountainCenters[mountainCenters.length - 1].y - Math.random() / 15
  ),
].map((center) => new Vector(center.x, 0.1 + center.y / 2));

const startTime = new Date().getTime();

function draw() {
  ctx.fillStyle = "#0c1445";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const timeSoFar = (new Date().getTime() - startTime) / 1000;

  ctx.globalCompositeOperation = "lighten";
  stars.forEach(({ center, sizeMultiplier }) => {
    const x = center.x * canvas.width;
    const y = center.y * canvas.height;
    const radius = sizeMultiplier * 3 + 3;

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, "white");
    gradient.addColorStop(1, "#0c1445");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fill();
  });

  ctx.globalCompositeOperation = "source-over";
  mountains.forEach(({ mountain, snow }, i) => {
    ctx.fillStyle = `hsl(0,0%,${25 - i * 3}%)`;
    drawVertices(mountain);
    ctx.fillStyle = "white";
    drawVertices(snow);
  });

  const auroraHeight = 0.2 * canvas.height;
  const getY = (y, noiseOffset) =>
    y + simplex.noise2D(y + noiseOffset, timeSoFar / 10) * 0.05;
  for (let i = 1; i < auroraPath.length; i++) {
    const prevPoint = new Vector(
      auroraPath[i - 1].x * canvas.width,
      getY(auroraPath[i - 1].y, i - 1) * canvas.height
    );
    const currPoint = new Vector(
      auroraPath[i].x * canvas.width + 1,
      getY(auroraPath[i].y, i) * canvas.height
    );

    const gradStart = prevPoint.lerp(currPoint, 0.5);
    const gradEnd = gradStart
      .copy()
      .sub(prevPoint.copy().rotate(gradStart, -Math.PI / 2))
      .normalise()
      .multiply(auroraHeight)
      .add(gradStart);

    const gradient = ctx.createLinearGradient(
      gradStart.x,
      gradStart.y,
      gradEnd.x,
      gradEnd.y
    );
    gradient.addColorStop(0, "rgba(0,0,0,0)");
    gradient.addColorStop(0.2, "#36BA34");
    gradient.addColorStop(1, "rgba(0,0,0,0)");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(prevPoint.x, prevPoint.y);
    ctx.lineTo(currPoint.x, currPoint.y);
    ctx.lineTo(currPoint.x, currPoint.y - 0.2 * canvas.height);
    ctx.lineTo(prevPoint.x, prevPoint.y - 0.2 * canvas.height);
    ctx.fill();
  }

  requestAnimationFrame(draw);
}

draw();
