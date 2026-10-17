const ANSI_COLORS = {
  cyan: 36,
  yellow: 33,
  green: 32,
  red: 31,
  underline: 4,
} as const;

const supportsColor = Boolean(process.stdout.isTTY) && !("NO_COLOR" in process.env);

function applyStyle(text: string, code: number, resetCode = 0): string {
  return supportsColor ? `\u001b[${code}m${text}\u001b[${resetCode}m` : text;
}

export const cyan = (text: string) => applyStyle(text, ANSI_COLORS.cyan);
export const yellow = (text: string) => applyStyle(text, ANSI_COLORS.yellow);
export const green = (text: string) => applyStyle(text, ANSI_COLORS.green);
export const red = (text: string) => applyStyle(text, ANSI_COLORS.red);
export const underline = (text: string) => applyStyle(text, ANSI_COLORS.underline, 24);
