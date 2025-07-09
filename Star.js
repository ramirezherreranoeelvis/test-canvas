/**
 * Clase para representar una estrella de fondo.
 */
export class Star {
      STAR_RADIUS = 0.8;
      STAR_COLOR = "rgba(255, 255, 255, 0.8)";
      constructor(x, y) {
            this.x = x;
            this.y = y;
            this.radius = this.STAR_RADIUS;
      }

      /**
       * Dibuja la estrella en el canvas.
       * @param {CanvasRenderingContext2D} ctx - Contexto de renderizado del canvas.
       */
      draw(ctx) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.STAR_COLOR;
            ctx.fill();
      }
}
