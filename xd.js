import { Star } from "./Star.js";
import { NetworkPoint } from "./NetworkPoint.js";

const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

let animationFrameId;
let waveTime = 0; // Un contador para animar las ondas

// --- Configuraciones de los elementos del Canvas ---
const NUM_STARS = 2000000;

const TRIANGLE_POINTS_DENSITY = 0.00005; // Ajusta para más/menos puntos en el triángulo
const TRIANGLE_LINE_MAX_DIST = 70; // Distancia máxima para conectar puntos del triángulo
const TRIANGLE_POINT_RADIUS = 1.2;
const TRIANGLE_COLOR = "rgba(255, 255, 255, 0.9)";

const WAVE_NUM_CIRCLES = 10; // Cantidad de círculos en la onda
const WAVE_POINTS_PER_CIRCLE = 60; // Puntos por cada círculo
const WAVE_RADIUS_INCREMENT = 30; // Incremento del radio entre círculos
const WAVE_AMPLITUDE = 10; // Cuánto oscilan los puntos de la onda
const WAVE_SPEED = 0.05; // Velocidad de la oscilación de la onda
const WAVE_LINE_MAX_DIST = 30; // Distancia máxima para conectar puntos de la onda
const WAVE_POINT_RADIUS = 1;
const WAVE_COLOR = "rgba(255, 255, 255, 0.7)";

// Arrays para almacenar nuestros elementos animados
let stars = [];
let trianglePoints = [];
let wavePoints = [];

/**
 * Configura las dimensiones del canvas y maneja el redimensionamiento de la ventana.
 */
function setupCanvas() {
      canvas.width = window.innerWidth * 0.8; // 80% del ancho de la ventana
      canvas.height = window.innerHeight * 0.8; // 80% del alto de la ventana
      initElements(); // Reinicializa los elementos al cambiar el tamaño
}

/**
 * Inicializa las estrellas de fondo con posiciones aleatorias.
 */
function initStars() {
      stars = [];
      for (let i = 0; i < NUM_STARS; i++) {
            stars.push(
                  new Star(
                        Math.random() * canvas.width,
                        Math.random() * canvas.height
                  )
            );
      }
}

/**
 * Comprueba si un punto está dentro de un triángulo.
 * Utiliza el método de coordenadas baricéntricas.
 * @param {object} p - El punto a verificar {x, y}.
 * @param {object} p1 - Primer vértice del triángulo {x, y}.
 * @param {object} p2 - Segundo vértice del triángulo {x, y}.
 * @param {object} p3 - Tercer vértice del triángulo {x, y}.
 * @returns {boolean} Verdadero si el punto está dentro del triángulo, falso en caso contrario.
 */
function isPointInTriangle(p, p1, p2, p3) {
      // Cálculos para coordenadas baricéntricas o método de la misma dirección de la línea
      // Fuente: https://blackpawn.com/texts/pointinpoly/
      function sign(p1, p2, p3) {
            return (
                  (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y)
            );
      }

      const d1 = sign(p, p1, p2);
      const d2 = sign(p, p2, p3);
      const d3 = sign(p, p3, p1);

      const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
      const hasPos = d1 > 0 || d2 > 0 || d3 > 0;

      return !(hasNeg && hasPos); // True si no hay negativos y positivos mezclados
}

/**
 * Inicializa los puntos que forman la red del triángulo.
 */
function initTriangle() {
      trianglePoints = [];
      // Definir los vértices del triángulo en relación al tamaño del canvas
      // Ajustado para que el triángulo esté en la mitad izquierda del canvas derecho
      const v1 = {
            x: canvas.width * 0.4,
            y: canvas.height * 0.2,
      };
      const v2 = {
            x: canvas.width * 0.65,
            y: canvas.height * 0.8,
      };
      const v3 = {
            x: canvas.width * 0.15,
            y: canvas.height * 0.8,
      };

      // Añadir los vértices explícitamente para asegurar que siempre estén presentes
      trianglePoints.push(new NetworkPoint(v1.x, v1.y));
      trianglePoints.push(new NetworkPoint(v2.x, v2.y));
      trianglePoints.push(new NetworkPoint(v3.x, v3.y));

      // Generar puntos aleatorios dentro del cuadro delimitador del triángulo
      const minX = Math.min(v1.x, v2.x, v3.x);
      const maxX = Math.max(v1.x, v2.x, v3.x);
      const minY = Math.min(v1.y, v2.y, v3.y);
      const maxY = Math.max(v1.y, v2.y, v3.y);

      // Calcular el número de puntos basándose en la densidad y el área del triángulo
      const triangleArea =
            0.5 *
            Math.abs(
                  v1.x * (v2.y - v3.y) +
                        v2.x * (v3.y - v1.y) +
                        v3.x * (v1.y - v2.y)
            );
      const numPoints = Math.floor(triangleArea * TRIANGLE_POINTS_DENSITY);

      // Generar y añadir puntos que caigan dentro del triángulo
      for (let i = 0; i < numPoints; i++) {
            const x = minX + Math.random() * (maxX - minX);
            const y = minY + Math.random() * (maxY - minY);
            if (isPointInTriangle({ x, y }, v1, v2, v3)) {
                  trianglePoints.push(new NetworkPoint(x, y));
            }
      }
}

/**
 * Inicializa los puntos que forman los círculos de la onda concéntrica.
 */
function initWaves() {
      wavePoints = [];
      // Origen de la onda (lado derecho del canvas, centrado verticalmente)
      const waveOriginX = canvas.width * 0.85;
      const waveOriginY = canvas.height * 0.5;

      for (let i = 0; i < WAVE_NUM_CIRCLES; i++) {
            const radius = (i + 1) * WAVE_RADIUS_INCREMENT;
            for (let j = 0; j < WAVE_POINTS_PER_CIRCLE; j++) {
                  const angle = (j / WAVE_POINTS_PER_CIRCLE) * Math.PI * 2;
                  const x = waveOriginX + radius * Math.cos(angle);
                  const y = waveOriginY + radius * Math.sin(angle);
                  // Solo añade puntos si están dentro de los límites del canvas
                  if (
                        x >= 0 &&
                        x <= canvas.width &&
                        y >= 0 &&
                        y <= canvas.height
                  ) {
                        wavePoints.push(new NetworkPoint(x, y));
                  }
            }
      }
}

/**
 * Inicializa todos los elementos (estrellas, triángulo, ondas).
 */
function initElements() {
      initStars();
      initTriangle();
      initWaves();
}

/**
 * Dibuja conexiones (líneas) entre puntos cercanos.
 * @param {CanvasRenderingContext2D} ctx - Contexto de renderizado del canvas.
 * @param {Array<NetworkPoint>} points - Array de puntos a conectar.
 * @param {number} maxDist - Distancia máxima para que dos puntos se conecten.
 * @param {string} color - Color de las líneas.
 */
function drawConnections(ctx, points, maxDist, color) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 0.5;
      for (let i = 0; i < points.length; i++) {
            for (let j = i + 1; j < points.length; j++) {
                  // Calcula la distancia euclidiana entre dos puntos
                  const dist = Math.sqrt(
                        Math.pow(points[i].x - points[j].x, 2) +
                              Math.pow(points[i].y - points[j].y, 2)
                  );
                  if (dist < maxDist) {
                        // Si están lo suficientemente cerca, dibuja una línea
                        ctx.beginPath();
                        ctx.moveTo(points[i].x, points[i].y);
                        ctx.lineTo(points[j].x, points[j].y);
                        ctx.stroke();
                  }
            }
      }
}

/**
 * El bucle principal de la animación.
 */
function animate() {
      animationFrameId = requestAnimationFrame(animate); // Llama a `animate` en el siguiente cuadro

      ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpia todo el canvas

      // Dibuja las estrellas de fondo
      stars.forEach((star) => star.draw(ctx));

      // Actualiza el contador de tiempo de la onda
      waveTime += WAVE_SPEED;

      // Actualiza y dibuja los puntos de la onda
      wavePoints.forEach((point) => {
            // Calcula la distancia del punto a un punto de referencia para la onda
            // Esto crea un efecto de onda que se propaga desde el origen
            const distFromWaveSource = Math.sqrt(
                  Math.pow(point.originalX - canvas.width * 0.85, 2) +
                        Math.pow(point.originalY - canvas.height * 0.5, 2)
            );
            // Aplica una oscilación sinusoidal a la posición del punto
            // El factor 0.02 y WAVE_AMPLITUDE controlan la forma y la fuerza de la onda
            point.x =
                  point.originalX +
                  Math.sin(distFromWaveSource * 0.02 + waveTime) *
                        WAVE_AMPLITUDE;
            point.y =
                  point.originalY +
                  Math.cos(distFromWaveSource * 0.02 + waveTime) *
                        WAVE_AMPLITUDE;
            point.draw(ctx, WAVE_POINT_RADIUS, WAVE_COLOR);
      });
      // Dibuja las conexiones entre los puntos de la onda
      drawConnections(ctx, wavePoints, WAVE_LINE_MAX_DIST, WAVE_COLOR);

      // Dibuja los puntos del triángulo
      trianglePoints.forEach((point) => {
            point.draw(ctx, TRIANGLE_POINT_RADIUS, TRIANGLE_COLOR);
      });
      // Dibuja las conexiones entre los puntos del triángulo
      drawConnections(
            ctx,
            trianglePoints,
            TRIANGLE_LINE_MAX_DIST,
            TRIANGLE_COLOR
      );
}

// --- Manejadores de eventos ---
// Vuelve a configurar el canvas cuando la ventana se redimensiona
window.addEventListener("resize", setupCanvas);

// Cuando la página carga, configura el canvas y comienza la animación
window.onload = function () {
      setupCanvas(); // Configuración inicial
      animate(); // Inicia el bucle de animación
};
