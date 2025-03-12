class StrokeText extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['text', 'stroke-color', 'background-color', 'font-family', 'font-size'];
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
    const text = this.getAttribute('text') || 'WELCOME';
    const strokeColor = this.getAttribute('stroke-color') || '#FFFFFF';
    const backgroundColor = this.getAttribute('background-color') || 'radial-gradient(#1A1A1A, #333333)'; // Default dark gradient
    const fontFamily = this.getAttribute('font-family') || 'Poppins';
    const fontSize = this.getAttribute('font-size') || '10'; // In vw

    // Create an off-screen canvas to measure text width
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.font = `${fontSize}vw ${fontFamily}, sans-serif`;
    const textWidth = ctx.measureText(text).width;

    // Define SVG dimensions based on text width
    const svgWidth = textWidth + 20; // Reduced padding since no red dot
    const svgHeight = parseFloat(fontSize) * 20; // Approximate height based on font size

    // Approximate path length for animation
    const pathLength = textWidth * 1.2;

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
          background: ${backgroundColor};
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

        @keyframes stroke-draw {
          0% { stroke-dashoffset: ${pathLength}px; }
          80% { stroke-dashoffset: 0px; }
          100% { stroke-dashoffset: 0px; }
        }
      </style>
      <svg class="stroke-container" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">
        <text x="10" y="${svgHeight / 2}" dy=".35em" class="stroke-text">${text}</text>
      </svg>
    `;
  }
}

// Define the custom element
customElements.define('stroke-text', StrokeText);
