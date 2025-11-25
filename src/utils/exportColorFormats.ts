interface ColorPalette {
  name: string;
  hex: string;
  usage: string;
}

export const exportAsCSS = (colors: ColorPalette[], brandName: string): string => {
  const cssVars = colors.map(color => {
    const varName = color.name.toLowerCase().replace(/\s+/g, '-');
    return `  --color-${varName}: ${color.hex};`;
  }).join('\n');

  return `:root {
  /* ${brandName} Color Palette */
${cssVars}
}`;
};

export const exportAsTailwind = (colors: ColorPalette[], brandName: string): string => {
  const tailwindColors: Record<string, string> = {};
  
  colors.forEach(color => {
    const colorKey = color.name.toLowerCase().replace(/\s+/g, '-');
    tailwindColors[colorKey] = color.hex;
  });

  return `// ${brandName} Color Palette
// Add this to your tailwind.config.js file under theme.extend.colors

module.exports = {
  theme: {
    extend: {
      colors: ${JSON.stringify(tailwindColors, null, 8).replace(/"([^"]+)":/g, '$1:')}
    }
  }
}`;
};
