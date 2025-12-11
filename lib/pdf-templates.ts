/**
 * PDF Report Templates Configuration
 * Define multiple professional templates for reports
 */

export interface PDFTemplate {
  id: string;
  name: string;
  description: string;
  preview: string; // Preview description/style
  colors: {
    primary: [number, number, number];
    secondary: [number, number, number];
    accent: [number, number, number];
    dark: [number, number, number];
    light: [number, number, number];
  };
  style: 'modern' | 'classic' | 'minimal' | 'executive' | 'technical';
  features: string[];
}

export const PDF_TEMPLATES: PDFTemplate[] = [
  {
    id: 'modern-cyan',
    name: 'Modern Cyan',
    description: 'Clean, modern design with cyan accents. Perfect for tech companies.',
    preview: 'Modern gradient header with cyan accent lines and card-based findings layout.',
    colors: {
      primary: [6, 182, 212],      // cyan-500
      secondary: [15, 23, 42],     // slate-900
      accent: [139, 92, 246],      // violet-500
      dark: [2, 6, 23],            // slate-950
      light: [248, 250, 252],      // slate-50
    },
    style: 'modern',
    features: ['Gradient Header', 'Security Score Badge', 'Color-coded Findings', 'AI Assessment Section']
  },
  {
    id: 'executive-blue',
    name: 'Executive Blue',
    description: 'Professional blue theme ideal for executive presentations and board reports.',
    preview: 'Corporate blue header with executive summary focus and clean tables.',
    colors: {
      primary: [37, 99, 235],      // blue-600
      secondary: [30, 41, 59],     // slate-800
      accent: [59, 130, 246],      // blue-500
      dark: [15, 23, 42],          // slate-900
      light: [241, 245, 249],      // slate-100
    },
    style: 'executive',
    features: ['Executive Summary', 'KPI Dashboard', 'Risk Matrix', 'Management Recommendations']
  },
  {
    id: 'minimal-dark',
    name: 'Minimal Dark',
    description: 'Sleek dark theme with minimal design. Great for technical reports.',
    preview: 'Dark background with high contrast text and subtle accent colors.',
    colors: {
      primary: [16, 185, 129],     // emerald-500
      secondary: [17, 24, 39],     // gray-900
      accent: [34, 197, 94],       // green-500
      dark: [3, 7, 18],            // gray-950
      light: [229, 231, 235],      // gray-200
    },
    style: 'minimal',
    features: ['Dark Theme', 'Minimal Design', 'High Contrast', 'Code-style Findings']
  },
  {
    id: 'classic-red',
    name: 'Classic Security',
    description: 'Traditional security report style with red accents. Industry standard look.',
    preview: 'Classic header with red accent stripe and traditional table layouts.',
    colors: {
      primary: [220, 38, 38],      // red-600
      secondary: [31, 41, 55],     // gray-800
      accent: [239, 68, 68],       // red-500
      dark: [17, 24, 39],          // gray-900
      light: [249, 250, 251],      // gray-50
    },
    style: 'classic',
    features: ['Classic Layout', 'Traditional Tables', 'Severity Indicators', 'Compliance Ready']
  },
  {
    id: 'technical-purple',
    name: 'Technical Purple',
    description: 'Detailed technical report with purple theme. Best for development teams.',
    preview: 'Technical layout with code blocks, detailed findings, and purple accents.',
    colors: {
      primary: [147, 51, 234],     // purple-600
      secondary: [24, 24, 27],     // zinc-900
      accent: [168, 85, 247],      // purple-500
      dark: [9, 9, 11],            // zinc-950
      light: [250, 250, 250],      // zinc-50
    },
    style: 'technical',
    features: ['Technical Details', 'Code References', 'CVE Links', 'Remediation Steps']
  }
];

export function getTemplateById(id: string): PDFTemplate | undefined {
  return PDF_TEMPLATES.find(t => t.id === id);
}

export function getDefaultTemplate(): PDFTemplate {
  return PDF_TEMPLATES[0];
}

