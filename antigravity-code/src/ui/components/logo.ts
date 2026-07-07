import { uid } from "../../utils/dom";

const SVG_NS = "http://www.w3.org/2000/svg";

/** Inline SVG version of media/icons/logo.svg, sized for in-app use (wizard hero, chat top bar). */
export function createLogoMark(size = 32): SVGSVGElement {
  const gradId = uid("ag-logo-mark");
  const bgId = uid("ag-logo-bg");

  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 512 512");
  svg.setAttribute("width", String(size));
  svg.setAttribute("height", String(size));
  svg.setAttribute("class", "ag-logo-mark");

  svg.innerHTML = `
    <defs>
      <linearGradient id="${bgId}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1b1030"/>
        <stop offset="100%" stop-color="#0d0f14"/>
      </linearGradient>
      <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#9d85ff"/>
        <stop offset="55%" stop-color="#7c5cff"/>
        <stop offset="100%" stop-color="#22d3c7"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="512" height="512" rx="112" fill="url(#${bgId})"/>
    <ellipse cx="256" cy="256" rx="176" ry="70" fill="none" stroke="url(#${gradId})" stroke-width="10" stroke-linecap="round" opacity="0.55" transform="rotate(-18 256 256)"/>
    <g fill="none" stroke="url(#${gradId})" stroke-width="34" stroke-linecap="round" stroke-linejoin="round">
      <path d="M 196 190 L 128 256 L 196 322"/>
      <path d="M 316 190 L 384 256 L 316 322"/>
    </g>
    <path d="M 288 172 L 224 340" fill="none" stroke="url(#${gradId})" stroke-width="26" stroke-linecap="round" opacity="0.9"/>
    <circle cx="256" cy="120" r="16" fill="url(#${gradId})"/>
  `;

  return svg;
}
