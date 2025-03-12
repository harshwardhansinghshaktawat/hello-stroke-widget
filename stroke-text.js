class StrokeText extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['text', 'stroke-color', 'font-family', 'font-size'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }

  connectedCallback() {
    this.render();
  }

  render() {
    // Get attribute values with fallbacks
    const text = this.getAttribute('text') || 'WELCOME'; // New default text
    const strokeColor = this.getAttribute('stroke-color') || '#FFFFFF';
    const fontFamily = this.getAttribute('font-family') || 'Poppins';
    const fontSize = this.getAttribute('font-size') || '10'; // In vw

    // Create an off-screen canvas to measure text width
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.font = `${fontSize}vw ${fontFamily}, sans-serif`;
    const textWidth = ctx.measureText(text).width;

    // Define SVG dimensions based on text width
    const svgWidth = textWidth + 50; // Add padding for red dot
    const svgHeight = parseFloat(fontSize) * 20; // Approximate height based on font size

    // Create a path for the text (this requires a trick since SVG doesn’t directly stroke text)
    // We’ll use a simplified stroke animation on a single path
    const pathLength = textWidth * 1.2; // Approximate path length for animation

    // Inject HTML and CSS into shadow DOM
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          width: 100vw;
          height: 100vh;
          margin: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          background: radial-gradient(#1A1A1A, #333333);
          overflow: hidden;
        }

        .stroke-container {
          width: 100%;
          max-width: ${svgWidth}px;
          height: auto;
          margin: auto;
        }

        .stroke-text {
          font-family: ${fontFamily}, sans-serif;
          font-size: ${fontSize}vw;
          fill: none;
          stroke: ${strokeColor};
          stroke-width: 4px;
          stroke-dasharray: ${pathLength}px;
          stroke-dashoffset: ${pathLength}px;
          animation: stroke-draw 5s ease forwards;
        }

        .red-dot {
          stroke-width: 20px;
          stroke-linecap: round;
          animation: red-dot-grow 2s ease-out forwards 4s; /* Delay to sync with text */
        }

        @keyframes stroke-draw {
          0% { stroke-dashoffset: ${pathLength}px; }
          80% { stroke-dashoffset: 0px; }
          100% { stroke-dashoffset: 0px; }
        }

        @keyframes red-dot-grow {
          0% { stroke-width: 0px; }
          100% { stroke-width: 20px; }
        }
      </style>
      <svg class="stroke-container" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">
        <text x="10" y="${svgHeight / 2}" dy=".35em" class="stroke-text">${text}</text>
        <line x1="${svgWidth - 20}" y1="${svgHeight / 2}" x2="${svgWidth - 20}" y2="${svgHeight / 2}" stroke="#FF5851" class="red-dot" />
      </svg>
    `;
  }
}

// Define the custom element
customElements.define('stroke-text', StrokeText);
