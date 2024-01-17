import { useEffect, useState } from "react";

const defaultOptions = {
  maxColors: 3,
  format: "rgba",
  maxSize: 10,
}

function useExtractColor(imageUrl, optionsCustom = {}) {

  const options = { ...defaultOptions, ...optionsCustom };

  const [colors, setColors] = useState([]);
  const [dominantColor, setDominantColor] = useState(null);
  const [darkerColor, setDarkerColor] = useState(null);
  const [lighterColor, setLighterColor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchDominantColor() {
      
      try {
        const colors = await extractDominantColors(imageUrl, options.maxSize);
        if (isMounted) {
          const formatedColors = formatColors(colors, options.format, options.maxColors);
          setDominantColor(formatedColors.dominantColor);
          setDarkerColor(formatedColors.darkerColor);
          setLighterColor(formatedColors.lighterColor);
          setColors(formatedColors.colors);
        }
      } catch (error) {
        if (isMounted) {
          setError(error);
        }
      }
      finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchDominantColor();

    return () => {
      isMounted = false;
    };
  }, [imageUrl]);

  return { dominantColor, darkerColor, lighterColor, loading, error, colors };
}

async function extractDominantColors(imageUrl, maxSize) {

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";

    img.onload = function() {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const { width, height } = img;
      const scaleFactor = Math.min(1, maxSize / Math.max(width, height));

      canvas.width = width * scaleFactor;
      canvas.height = height * scaleFactor;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;

      const colorMap = {};
      

      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const a = pixels[i + 3];

        if (a >= 125) {
          const color = `rgba(${r},${g},${b},${a})`;
          if (!colorMap[color]) {
            colorMap[color] = 0;
          }
          colorMap[color]++;
        }
      }


      const colors = Object.keys(colorMap).sort((a, b) => colorMap[b] - colorMap[a]);

      let dominantColor = null;
      let darkerColor = null;
      let lighterColor = null;

      if (colors.length > 0) {
        dominantColor = colors[0];
        darkerColor = getDarkerColor(dominantColor);
        lighterColor = getLighterColor(dominantColor);
      }

      resolve({ dominantColor: dominantColor, darkerColor: darkerColor, lighterColor: lighterColor, colors: colors });
    };

    img.onerror = function(error) {
      reject(error);
    };

    img.src = imageUrl;
  });
}



function formatColors(colors, format, maxColors) {
  switch (format) {
    case "hex":
      return {
        dominantColor: rgbToHex(colors.dominantColor),
        darkerColor: rgbToHex(colors.darkerColor),
        lighterColor: rgbToHex(colors.lighterColor),
        colors: colors.colors.slice(0, maxColors).map(color => rgbToHex(color)),
      };
    case "rgb":
      return {
        dominantColor: rgbaToRgb(colors.dominantColor),
        darkerColor: rgbaToRgb(colors.darkerColor),
        lighterColor: rgbaToRgb(colors.lighterColor),
        colors: colors.colors.slice(0, maxColors).map(color => rgbaToRgb(color)),
      };
    case "hsl":
      return {
        dominantColor: rgbaToHsl(colors.dominantColor),
        darkerColor: rgbaToHsl(colors.darkerColor),
        lighterColor: rgbaToHsl(colors.lighterColor),
        colors: colors.colors.slice(0, maxColors).map(color => rgbaToHsl(color)),
      };
    case "hsv":
      return {
        dominantColor: rgbaToHsv(colors.dominantColor),
        darkerColor: rgbaToHsv(colors.darkerColor),
        lighterColor: rgbaToHsv(colors.lighterColor),
        colors: colors.colors.slice(0, maxColors).map(color => rgbaToHsv(color)),
      };
    default:
      return {
        dominantColor: colors.dominantColor,
        darkerColor: colors.darkerColor,
        lighterColor: colors.lighterColor,
        colors: colors.colors.slice(0, maxColors),
      };
  }
}





function getDarkerColor(color) {
  const rgb = color.match(/\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(\.\d+)?))?\)/);
  if (!rgb) return null;

  const r = parseInt(rgb[1]);
  const g = parseInt(rgb[2]);
  const b = parseInt(rgb[3]);

  const darkerRed = Math.max(0, r - 50);
  const darkerGreen = Math.max(0, g - 50);
  const darkerBlue = Math.max(0, b - 50);

  return `rgb(${darkerRed},${darkerGreen},${darkerBlue})`;
}


function getLighterColor(color) {
  const rgb = color.match(/\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(\.\d+)?))?\)/);
  if (!rgb) return null;

  const r = parseInt(rgb[1]);
  const g = parseInt(rgb[2]);
  const b = parseInt(rgb[3]);

  const lighterRed = Math.min(255, r + 30);
  const lighterGreen = Math.min(255, g + 30);
  const lighterBlue = Math.min(255, b + 30);

  return `rgb(${lighterRed},${lighterGreen},${lighterBlue})`;
}



// funciones para convertir colores
function rgbToHex(rgb) {
  const rgbaRegex = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(\.\d+)?))?\)/;
  const match = rgb.match(rgbaRegex);
  if (!match) return null;

  const r = parseInt(match[1]);
  const g = parseInt(match[2]);
  const b = parseInt(match[3]);

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function rgbaToRgb(rgba) {
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(\.\d+)?))?\)/);
  if (!match) return null;

  const r = parseInt(match[1]);
  const g = parseInt(match[2]);
  const b = parseInt(match[3]);

  return `rgb(${r},${g},${b})`;
}

function rgbaToHsl(rgba) {
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(\.\d+)?))?\)/);
  if (!match) return null;

  const r = parseInt(match[1]) / 255;
  const g = parseInt(match[2]) / 255;
  const b = parseInt(match[3]) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }

  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}


// Función para convertir RGB a HSV
function rgbaToHsv(rgba) {
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(\.\d+)?))?\)/);
  if (!match) return null;

  const r = parseInt(match[1]) / 255;
  const g = parseInt(match[2]) / 255;
  const b = parseInt(match[3]) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h, s = (max === 0 ? 0 : d / max), v = max;

  if (max !== 0) {
    s = d / max;
  }

  if (max === min) {
    h = 0; // achromatic
  } else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }

  return `hsv(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(v * 100)}%)`;
}

export default useExtractColor;