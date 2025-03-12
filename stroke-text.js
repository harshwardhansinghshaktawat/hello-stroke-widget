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
    const backgroundColor = this.getAttribute('background-color') || 'radial-gradient(#1A1A1A, #333333)';
    const fontFamily = this.getAttribute('font-family') || 'Poppins';
    const fontSize = this.getAttribute('font-size') || '10'; // In vw

    // Create an off-screen canvas to measure text width
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.font = `${fontSize}vw ${fontFamily}, sans-serif`;
    const textWidth = ctx.measureText(text).width;

    // Define SVG dimensions
    const svgWidth = 800; // Fixed width to allow wrapping within bounds
    const svgHeight = parseFloat(fontSize) * 40; // Increased height to accommodate wrapped lines

    // Split text into words for wrapping
    const words = text.split(' ');
    const lineHeight = parseFloat(fontSize) * 1.2; // Approximate line height in vw
    let lines = [];
    let currentLine = '';
    let currentWidth = 0;

    words.forEach(word => {
      const wordWidth = ctx.measureText(word + ' ').width;
      if (currentWidth + wordWidth > svgWidth - 20) { // 20px padding
        lines.push(currentLine.trim());
        currentLine = word + ' ';
        currentWidth = wordWidth;
      } else {
        currentLine += word + ' ';
        currentWidth += wordWidth;
      }
    });
    if (currentLine) lines.push(currentLine.trim());

    // Generate SVG text elements for each line
    const textElements = lines.map((line, index) => `
      <text x="10" y="${svgHeight / 4 + index * lineHeight}" dy=".35em" class="stroke-text">${line}</text>
    `).join('');

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
          animation: stroke-draw 5s ease forwards;
        }

        @keyframes stroke-draw {
          0% { stroke-dashoffset: 100%; }
          80% { stroke-dashoffset: 0%; }
          100% { stroke-dashoffset: 0%; }
        }
      </style>
      <svg class="stroke-container" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">
        ${textElements}
      </svg>
    `;

    // Dynamically set stroke-dash properties after rendering
    const textNodes = this.shadowRoot.querySelectorAll('.stroke-text');
    textNodes.forEach(textNode => {
      const length = textNode.getComputedTextLength();
      textNode.style.strokeDasharray = `${length}px`;
      textNode.style.strokeDashoffset = `${length}px`;
    });
  }
}

// Define the custom element
customElements.define('stroke-text', StrokeText);
