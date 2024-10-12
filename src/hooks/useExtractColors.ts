import { useEffect, useState } from "react";

type ColorMap = { [key: string]: number };
type SortBy = "vibrance" | "dominance";
type Format = "hex" | "rgb" | "hsl" | "hsv" | "rgba";

interface Color {
	r: number;
	g: number;
	b: number;
	a: number;
	count?: number;
	saturation?: number;
}

interface FormattedColors {
	dominantColor: string | null;
	darkerColor: string | null;
	lighterColor: string | null;
	colors: string[];
}

interface ExtractedColors {
	dominantColor: Color | null;
	darkerColor: Color | null;
	lighterColor: Color | null;
	colors: Color[];
}

interface UseExtractColorReturn {
	dominantColor: string | null;
	darkerColor: string | null;
	lighterColor: string | null;
	loading: boolean;
	error: Error | null;
	colors: string[];
}

interface Options {
	maxColors: number;
	format: Format;
	maxSize: number;
	colorSimilarityThreshold: number;
	sortBy: SortBy;
}

const defaultOptions: Options = {
	maxColors: 3,
	format: "rgba",
	maxSize: 18,
	colorSimilarityThreshold: 50,
	sortBy: "dominance",
};

export const useExtractColors = (
	imageUrl: string,
	customOptions: Partial<Options> = {},
): UseExtractColorReturn => {
	const options: Options = { ...defaultOptions, ...customOptions };

	const [colors, setColors] = useState<string[]>([]);
	const [dominantColor, setDominantColor] = useState<string | null>(null);
	const [darkerColor, setDarkerColor] = useState<string | null>(null);
	const [lighterColor, setLighterColor] = useState<string | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		let isMounted = true;

		(async () => {
			try {
				if (isMounted) {
					const colors = await extractDominantColors(imageUrl, options);
					const formattedColors = formatColors(colors, options);

					setDominantColor(formattedColors.dominantColor);
					setDarkerColor(formattedColors.darkerColor);
					setLighterColor(formattedColors.lighterColor);
					setColors(formattedColors.colors);
				}
			} catch (error) {
				if (isMounted) {
					setError(error as Error);
				}
			} finally {
				if (isMounted) {
					setLoading(false);
				}
			}
		})();

		return () => {
			isMounted = false;
		};
	}, [imageUrl]);

	return { dominantColor, darkerColor, lighterColor, loading, error, colors };
};

async function extractDominantColors(
	imageUrl: string,
	options: Options,
): Promise<ExtractedColors> {
	const { maxSize, colorSimilarityThreshold, sortBy } = options;

	return new Promise((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = "Anonymous";

		img.onload = function () {
			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d");

			if (!ctx) {
				reject(new Error("Failed to get canvas context"));
				return;
			}

			const { width, height } = img;
			const scaleFactor = Math.min(1, maxSize / Math.max(width, height));

			canvas.width = width * scaleFactor;
			canvas.height = height * scaleFactor;

			ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

			const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
			const pixels = imageData.data;

			const colorMap: ColorMap = countColors(
				pixels,
				colorSimilarityThreshold,
				sortBy,
			);

			const colors: Color[] = Object.keys(colorMap)
				.map((color) => {
					const [r, g, b, a] = color.split(",").map(Number);
					const hsvToString = formatToHsv({ r, g, b, a });
					const { s, v } = parseHsvString(hsvToString);
					return { r, g, b, a, count: colorMap[color], saturation: s * v };
				})
				.sort((a, b) =>
					sortBy === "dominance"
						? b.count - a.count
						: b.saturation - a.saturation,
				);

			let dominantColor: Color | null = null;
			let darkerColor: Color | null = null;
			let lighterColor: Color | null = null;

			if (colors.length > 0) {
				dominantColor = colors[0];
				darkerColor = getDarkerColor(dominantColor);
				lighterColor = getLighterColor(dominantColor);
			}

			resolve({
				dominantColor: dominantColor,
				darkerColor: darkerColor,
				lighterColor: lighterColor,
				colors: colors,
			});
		};

		img.onerror = function (error) {
			reject(error);
		};

		img.src = imageUrl;
	});
}

function formatColors(
	colors: ExtractedColors,
	options: Options,
): FormattedColors {
	const { format, maxColors } = options;

	switch (format) {
		case "hex":
			return {
				dominantColor: formatToHex(colors.dominantColor),
				darkerColor: formatToHex(colors.darkerColor),
				lighterColor: formatToHex(colors.lighterColor),
				colors: colors.colors
					.slice(0, maxColors)
					.map((color) => formatToHex(color)),
			};
		case "rgb":
			return {
				dominantColor: formatToRgb(colors.dominantColor),
				darkerColor: formatToRgb(colors.darkerColor),
				lighterColor: formatToRgb(colors.lighterColor),
				colors: colors.colors
					.slice(0, maxColors)
					.map((color) => formatToRgb(color)),
			};
		case "hsl":
			return {
				dominantColor: formatToHsl(colors.dominantColor),
				darkerColor: formatToHsl(colors.darkerColor),
				lighterColor: formatToHsl(colors.lighterColor),
				colors: colors.colors
					.slice(0, maxColors)
					.map((color) => formatToHsl(color)),
			};
		case "hsv":
			return {
				dominantColor: formatToHsv(colors.dominantColor),
				darkerColor: formatToHsv(colors.darkerColor),
				lighterColor: formatToHsv(colors.lighterColor),
				colors: colors.colors
					.slice(0, maxColors)
					.map((color) => formatToHsv(color)),
			};
		default:
			return {
				dominantColor: formatToRgba(colors.dominantColor),
				darkerColor: formatToRgba(colors.darkerColor),
				lighterColor: formatToRgba(colors.lighterColor),
				colors: colors.colors
					.slice(0, maxColors)
					.map((color) => formatToRgba(color)),
			};
	}
}

function getDarkerColor(color: Color): Color {
	const { r, g, b, a } = color;
	const darkerRed = Math.max(0, r - 50);
	const darkerGreen = Math.max(0, g - 50);
	const darkerBlue = Math.max(0, b - 50);

	return { r: darkerRed, g: darkerGreen, b: darkerBlue, a, count: color.count };
}

function getLighterColor(color: Color): Color {
	const { r, g, b, a } = color;
	const lighterRed = Math.min(255, r + 30);
	const lighterGreen = Math.min(255, g + 30);
	const lighterBlue = Math.min(255, b + 30);

	return {
		r: lighterRed,
		g: lighterGreen,
		b: lighterBlue,
		a,
		count: color.count,
	};
}

const formatToRgba = (color: Color | null): string => {
	if (!color) return "rgba(0,0,0,0)";
	const { r, g, b, a } = color;
	return `rgba(${r},${g},${b},${a})`;
};

const formatToHex = (color: Color | null): string => {
	if (!color) return "#000000";
	const { r, g, b } = color;
	return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

const formatToRgb = (color: Color | null): string => {
	if (!color) return "rgb(0,0,0)";
	const { r, g, b } = color;
	return `rgb(${r},${g},${b})`;
};

const formatToHsl = (rgba: Color | null): string => {
	if (!rgba) return "hsl(0,0%,0%)";

	const r = rgba.r / 255;
	const g = rgba.g / 255;
	const b = rgba.b / 255;

	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const delta = max - min;

	let h = 0;
	let s = 0;
	const l = (max + min) / 2;

	if (delta !== 0) {
		s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

		switch (max) {
			case r:
				h = (g - b) / delta + (g < b ? 6 : 0);
				break;
			case g:
				h = (b - r) / delta + 2;
				break;
			case b:
				h = (r - g) / delta + 4;
				break;
		}

		h /= 6;
	}

	return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
};

const formatToHsv = (rgba: Color | null): string => {
	if (!rgba) return "hsv(0,0%,0%)";

	const r = rgba.r / 255;
	const g = rgba.g / 255;
	const b = rgba.b / 255;

	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const d = max - min;

	let h: number, s: number;
	const v = max;

	if (max !== 0) {
		s = d / max;
	} else {
		s = 0;
		h = 0;
		return `hsv(${h}, ${s}%, ${v * 100}%)`;
	}

	if (max === min) {
		h = 0;
	} else {
		switch (max) {
			case r:
				h = (g - b) / d + (g < b ? 6 : 0);
				break;
			case g:
				h = (b - r) / d + 2;
				break;
			case b:
				h = (r - g) / d + 4;
				break;
			default:
				h = 0;
		}

		h /= 6;
	}

	return `hsv(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(v * 100)}%)`;
};

const colorDistance = (
	color1: [number, number, number, number],
	color2: [number, number, number, number],
): number => {
	const [r1, g1, b1] = color1;
	const [r2, g2, b2] = color2;
	return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
};

const parseHsvString = (
	hsvString: string,
): { h: number; s: number; v: number } => {
	const hsvRegex = /hsv\((\d+),\s*(\d+)%?,\s*(\d+)%?\)/;
	const match = hsvString.match(hsvRegex);

	if (!match) {
		throw new Error("Invalid HSV string format");
	}

	const h = parseInt(match[1], 10) / 360;
	const s = parseInt(match[2], 10) / 100;
	const v = parseInt(match[3], 10) / 100;

	return { h, s, v };
};

function countColors(
	pixels: Uint8ClampedArray,
	colorSimilarityThreshold: number,
	sortBy: "vibrance" | "dominance",
): ColorMap {
	const colorMap: ColorMap = {};
	const uniqueColors: { [key: string]: [number, number, number, number] } = {};

	for (let i = 0; i < pixels.length; i += 4) {
		const r = pixels[i];
		const g = pixels[i + 1];
		const b = pixels[i + 2];
		const a = pixels[i + 3];

		if (a >= 125) {
			const newColor: [number, number, number, number] = [r, g, b, a];
			let foundSimilar = false;

			for (const key in uniqueColors) {
				const existingColor = uniqueColors[key];
				if (colorDistance(newColor, existingColor) < colorSimilarityThreshold) {
					if (sortBy === "dominance") {
						colorMap[key]++;
					}
					foundSimilar = true;
					break;
				}
			}

			if (!foundSimilar) {
				const colorKey = `${r},${g},${b},${a}`;
				uniqueColors[colorKey] = newColor;
				colorMap[colorKey] = 1;
			}
		}
	}

	return colorMap;
}

