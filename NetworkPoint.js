/**
 * Clase para representar un punto en las redes (triángulo o ondas).
 * Guarda la posición original para aplicar efectos como las ondas.
 */
export class NetworkPoint {
      constructor(x, y) {
            this.x = x;
            this.y = y;
            this.originalX = x; // Guarda la posición original
            this.originalY = y;
      }

      /**
       * Dibuja el punto de la red en el canvas.
       * @param {CanvasRenderingContext2D} ctx - Contexto de renderizado del canvas.
       * @param {number} radius - Radio del punto.
       * @param {string} color - Color del punto.
       */
      draw(ctx, radius, color) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
      }
}
