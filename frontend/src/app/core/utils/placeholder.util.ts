/**
 * Inline SVG placeholder images to avoid external requests (e.g. via.placeholder.com)
 * and ERR_NAME_NOT_RESOLVED when offline or DNS is blocked.
 */
export function placeholderImage(width: number, height: number, text = '', bgColor = '667eea'): string {
  const t = text ? encodeURIComponent(text.substring(0, 2).toUpperCase()) : '%3F';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="#${bgColor}"/><text x="50%" y="50%" font-size="${Math.min(width, height) / 3}" fill="white" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif">${t}</text></svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

export const PLACEHOLDERS = {
  avatar40: placeholderImage(40, 40, '?'),
  avatar100: placeholderImage(100, 100, 'Photo'),
  avatar140: placeholderImage(140, 140, '?'),
  course300x200: (text: string) => placeholderImage(300, 200, text),
  course300x150: (text: string) => placeholderImage(300, 150, text),
} as const;
