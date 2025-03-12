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

    // Define SVG dimensions
    const svgWidth = 800; // Fixed width for wrapping
    const svgHeight = parseFloat(fontSize) * 40; // Height for wrapped lines

    // Split text into lines for wrapping
    const words = text.split(' ');
    const lineHeight = parseFloat(fontSize) * 1.2; // Line height in vw
    let lines = [];
    let currentLine = '';
    let currentWidth = 0;

    words.forEach(word => {
      const wordWidth = ctx.measureText(word + ' ').width;
      if (currentWidth + wordWidth > svgWidth - 20) {
        lines.push(currentLine.trim());
        currentLine = word + ' ';
        currentWidth = wordWidth;
      } else {
        currentLine += word + ' ';
        currentWidth += wordWidth;
      }
    });
    if (currentLine) lines.push(currentLine.trim());

    // Generate SVG text elements, centered
    const totalLines = lines.length;
    const verticalCenter = svgHeight / 2 - ((totalLines - 1) * lineHeight) / 2; // Center vertically
    const textElements = lines.map((line, index) => {
      const lineWidth = ctx.measureText(line).width;
      const xPos = (svgWidth - lineWidth) / 2; // Center horizontally
      return `
        <text x="${xPos}" y="${verticalCenter + index * lineHeight}" dy=".35em" class="stroke-text">${line}</text>
      `;
    }).join('');

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
        }

        @keyframes stroke-draw {
          from {
            stroke-dashoffset: var(--text-length);
          }
          to {
            stroke-dashoffset: 0px;
          }
        }
      </style>
      <svg class="stroke-container" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">
        ${textElements}
      </svg>
    `;

    // Apply animation with correct stroke length
    requestAnimationFrame(() => {
      const textNodes = this.shadowRoot.querySelectorAll('.stroke-text');
      textNodes.forEach(textNode => {
        const length = textNode.getComputedTextLength() * 1.1; // 10% buffer for font variations
        textNode.style.strokeDasharray = `${length}px`;
        textNode.style.strokeDashoffset = `${length}px`;
        textNode.style.setProperty('--text-length', `${length}px`);
        // Force reflow and apply animation
        textNode.getBoundingClientRect();
        textNode.style.animation = 'stroke-draw 5s ease forwards';
      });
    });
  }
}

// Define the custom element
customElements.define('stroke-text', StrokeText);
