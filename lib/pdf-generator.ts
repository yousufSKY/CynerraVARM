/**
 * Professional PDF Report Generator
 * Generates branded, professional security scan reports
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ScanResponse, Finding, SCAN_PROFILE_CONFIGS } from '@/types/api';
import { PDFTemplate, getTemplateById, getDefaultTemplate } from './pdf-templates';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: { finalY: number };
  }
}

// Company/Brand Configuration
const COMPANY_CONFIG = {
  name: 'CYNERRA',
  tagline: 'Vulnerability Assessment & Risk Management',
  website: 'www.cynerra.com',
};

// Get colors from template or default
function getColors(template?: PDFTemplate) {
  return template?.colors || {
    primary: [6, 182, 212] as [number, number, number],
    secondary: [15, 23, 42] as [number, number, number],
    accent: [139, 92, 246] as [number, number, number],
    dark: [2, 6, 23] as [number, number, number],
    light: [248, 250, 252] as [number, number, number],
  };
}

interface PDFOptions {
  title?: string;
  includeFindings?: boolean;
  includeRecommendations?: boolean;
  companyName?: string;
  templateId?: string;
}

/**
 * Format date for display
 */
function formatDate(dateString?: string): string {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString();
}

/**
 * Format date short
 */
function formatDateShort(dateString?: string): string {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Get profile display name
 */
function getProfileName(profile: string): string {
  const config = SCAN_PROFILE_CONFIGS[profile as keyof typeof SCAN_PROFILE_CONFIGS];
  return config?.name || profile;
}

/**
 * Get severity color for PDF
 */
function getSeverityColor(severity: string): [number, number, number] {
  switch (severity?.toLowerCase()) {
    case 'critical': return [220, 38, 38];
    case 'high': return [234, 88, 12];
    case 'medium': return [234, 179, 8];
    case 'low': return [59, 130, 246];
    default: return [100, 116, 139];
  }
}

/**
 * Get risk level color
 */
function getRiskLevelColor(score: number): [number, number, number] {
  if (score >= 80) return [220, 38, 38];      // Critical - Red
  if (score >= 60) return [234, 88, 12];      // High - Orange
  if (score >= 40) return [234, 179, 8];      // Medium - Yellow
  return [34, 197, 94];                        // Low - Green
}

/**
 * Draw professional header with company branding
 */
function drawHeader(doc: jsPDF, title: string, companyName: string = COMPANY_CONFIG.name, template?: PDFTemplate): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const colors = getColors(template);
  
  // Gradient-like header background
  doc.setFillColor(...colors.dark);
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  // Accent line
  doc.setFillColor(...colors.primary);
  doc.rect(0, 45, pageWidth, 3, 'F');
  
  // Company name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(companyName, 14, 20);
  
  // Tagline
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.primary);
  doc.text(COMPANY_CONFIG.tagline, 14, 28);
  
  // Report title (truncate if too long to avoid badge overlap)
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  const truncatedTitle = title.length > 45 ? title.substring(0, 45) + '...' : title;
  doc.text(truncatedTitle, 14, 40);
  
  // Date
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 200, 200);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`, pageWidth - 14, 15, { align: 'right' });
  
  // Template badge (if not default) - positioned on right side, row 1
  if (template && template.id !== 'modern-cyan') {
    doc.setFillColor(...colors.accent);
    doc.roundedRect(pageWidth - 60, 22, 46, 10, 2, 2, 'F');
    doc.setFontSize(6);
    doc.setTextColor(255, 255, 255);
    doc.text(template.name.toUpperCase(), pageWidth - 37, 29, { align: 'center' });
  }
  
  // Classification badge - positioned on right side, row 2
  doc.setFillColor(220, 38, 38);
  doc.roundedRect(pageWidth - 60, 34, 46, 10, 2, 2, 'F');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text('CONFIDENTIAL', pageWidth - 37, 41, { align: 'center' });
}

/**
 * Draw professional footer
 */
function drawFooter(doc: jsPDF, pageNum: number, totalPages: number, template?: PDFTemplate): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const colors = getColors(template);
  
  // Footer line
  doc.setDrawColor(...colors.primary);
  doc.setLineWidth(0.5);
  doc.line(14, pageHeight - 18, pageWidth - 14, pageHeight - 18);
  
  // Footer text
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`© ${new Date().getFullYear()} ${COMPANY_CONFIG.name} | ${COMPANY_CONFIG.website}`, 14, pageHeight - 10);
  doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  doc.text('Confidential Security Report', pageWidth - 14, pageHeight - 10, { align: 'right' });
}

/**
 * Draw section header
 */
function drawSectionHeader(doc: jsPDF, title: string, yPos: number, template?: PDFTemplate, icon?: string): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const colors = getColors(template);
  
  // Section background
  doc.setFillColor(...colors.light);
  doc.roundedRect(14, yPos - 6, pageWidth - 28, 14, 2, 2, 'F');
  
  // Accent bar
  doc.setFillColor(...colors.primary);
  doc.rect(14, yPos - 6, 3, 14, 'F');
  
  // Section title
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.secondary);
  doc.text(`${icon ? icon + ' ' : ''}${title}`, 22, yPos + 2);
  
  return yPos + 16;
}

/**
 * Generate a professional single scan report PDF
 */
export function generateScanReportPDF(scan: ScanResponse, options: PDFOptions = {}): void {
  const {
    title = 'Security Vulnerability Assessment Report',
    includeFindings = true,
    includeRecommendations = true,
    companyName = COMPANY_CONFIG.name,
    templateId
  } = options;

  const template = templateId ? getTemplateById(templateId) : getDefaultTemplate();
  const colors = getColors(template);
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 60;

  // Draw header
  drawHeader(doc, title, companyName, template);

  // Executive Summary Box
  yPos = 60;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, yPos, pageWidth - 28, 35, 3, 3, 'F');
  doc.setDrawColor(...colors.primary);
  doc.setLineWidth(0.5);
  doc.roundedRect(14, yPos, pageWidth - 28, 35, 3, 3, 'S');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.secondary);
  doc.text('EXECUTIVE SUMMARY', 20, yPos + 10);
  
  const summary = scan.parsed_results?.summary;
  const riskScore = summary?.risk_score || 0;
  const securityScore = 100 - riskScore;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Target: ${scan.target || 'N/A'}`, 20, yPos + 20);
  doc.text(`Profile: ${getProfileName(scan.profile || '')}`, 20, yPos + 28);
  
  // Risk Score indicator
  doc.setFillColor(...getRiskLevelColor(riskScore));
  doc.roundedRect(pageWidth - 70, yPos + 8, 50, 20, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`${securityScore}%`, pageWidth - 45, yPos + 22, { align: 'center' });
  doc.setFontSize(7);
  doc.text('SECURITY SCORE', pageWidth - 45, yPos + 8 + 22, { align: 'center' });

  yPos += 45;

  // Scan Details Section
  yPos = drawSectionHeader(doc, 'Scan Details', yPos, template);

  const scanDetails = [
    ['Target', scan.target || scan.targets || 'N/A'],
    ['Scan Profile', getProfileName(scan.profile || scan.scan_profile || '')],
    ['Scanner Type', scan.profile?.startsWith('ai-') ? '🤖 AI-Powered Web Scanner' : '🔍 Network Scanner (Nmap)'],
    ['Status', scan.status || 'N/A'],
    ['Started', formatDate(scan.started_at)],
    ['Completed', formatDate(scan.finished_at || scan.completed_at)],
    ['Scan ID', scan.scan_id || scan.id || 'N/A']
  ];

  autoTable(doc, {
    startY: yPos,
    body: scanDetails,
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 40, fontStyle: 'bold', textColor: colors.secondary },
      1: { cellWidth: 140 }
    },
    margin: { left: 14, right: 14 }
  });

  yPos = doc.lastAutoTable.finalY + 10;

  // Vulnerability Summary Section
  if (summary) {
    yPos = drawSectionHeader(doc, 'Vulnerability Summary', yPos, template);

    // Severity boxes
    const severities = [
      { label: 'Critical', count: summary.critical || 0, color: [220, 38, 38] as [number, number, number] },
      { label: 'High', count: summary.high || 0, color: [234, 88, 12] as [number, number, number] },
      { label: 'Medium', count: summary.medium || 0, color: [234, 179, 8] as [number, number, number] },
      { label: 'Low', count: summary.low || 0, color: [59, 130, 246] as [number, number, number] },
      { label: 'Info', count: summary.info || 0, color: [100, 116, 139] as [number, number, number] }
    ];

    const boxWidth = (pageWidth - 28 - 16) / 5;
    severities.forEach((sev, idx) => {
      const x = 14 + idx * (boxWidth + 4);
      
      doc.setFillColor(...sev.color);
      doc.roundedRect(x, yPos, boxWidth, 28, 2, 2, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(String(sev.count), x + boxWidth / 2, yPos + 14, { align: 'center' });
      
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text(sev.label.toUpperCase(), x + boxWidth / 2, yPos + 23, { align: 'center' });
    });

    yPos += 38;

    // Risk metrics
    doc.setFontSize(10);
    doc.setTextColor(...colors.secondary);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Findings: ${summary.total_findings || 0}`, 14, yPos);
    doc.text(`Risk Score: ${riskScore}/100`, 100, yPos);
    if (summary.risk_level) {
      doc.text(`Risk Level: ${summary.risk_level}`, pageWidth - 60, yPos);
    }
    yPos += 10;

    // AI-Enhanced Network Scan - Combined Risk Assessment
    if (summary.ai_enhanced) {
      yPos += 5;
      doc.setFillColor(6, 182, 212, 20);
      doc.roundedRect(14, yPos - 4, pageWidth - 28, 35, 2, 2, 'F');
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(6, 182, 212);
      doc.text('🤖 AI-Enhanced Network Scan', 20, yPos + 4);
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      
      // Risk comparison
      doc.text(`Nmap Risk: ${summary.risk_level} (${summary.risk_score})`, 20, yPos + 12);
      doc.text(`AI Risk: ${summary.ai_risk_assessment || 'N/A'}`, 80, yPos + 12);
      doc.text(`Combined: ${summary.combined_risk_level} (${summary.combined_risk_score})`, 140, yPos + 12);
      
      if (summary.ai_findings_count) {
        doc.text(`AI Findings: ${summary.ai_findings_count}`, 20, yPos + 20);
      }
      
      if (summary.ai_error) {
        doc.setTextColor(234, 179, 8);
        doc.text(`Warning: ${summary.ai_error}`, 20, yPos + 28);
      }
      
      yPos += 40;
    }
    // AI Web Scan Risk Assessment
    else if (summary.ai_risk_assessment) {
      yPos += 5;
      doc.setFillColor(139, 92, 246, 20);
      doc.roundedRect(14, yPos - 4, pageWidth - 28, 25, 2, 2, 'F');
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(139, 92, 246);
      doc.text('🤖 AI Risk Assessment', 20, yPos + 4);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...colors.secondary);
      const assessmentLines = doc.splitTextToSize(summary.ai_risk_assessment, pageWidth - 40);
      doc.text(assessmentLines.slice(0, 2), 20, yPos + 12);
      yPos += 30;
    }
  }

  // Findings Section
  const findings = scan.parsed_results?.parsed_json?.findings;
  if (includeFindings && findings && findings.length > 0) {
    if (yPos > 220) {
      doc.addPage();
      yPos = 20;
    }

    yPos = drawSectionHeader(doc, `Findings (${findings.length} total)`, yPos, template);

    // Findings summary table
    const findingsData = findings.slice(0, 15).map((finding: Finding, index: number) => [
      String(index + 1),
      (finding.title || 'N/A').substring(0, 50),
      (finding.severity?.toUpperCase() || 'N/A'),
      (finding.affected_component || 'N/A').substring(0, 40)
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['#', 'Vulnerability', 'Severity', 'Affected Component']],
      body: findingsData,
      theme: 'grid',
      headStyles: { 
        fillColor: colors.secondary, 
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9
      },
      styles: { fontSize: 8, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 70 },
        2: { cellWidth: 22, halign: 'center' },
        3: { cellWidth: 70 }
      },
      margin: { left: 14, right: 14 },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 2) {
          const severity = (data.cell.raw as string)?.toLowerCase();
          data.cell.styles.textColor = getSeverityColor(severity);
          data.cell.styles.fontStyle = 'bold';
        }
      }
    });

    yPos = doc.lastAutoTable.finalY + 10;

    // Detailed findings on new page
    if (findings.length > 0) {
      doc.addPage();
      yPos = 20;
      
      yPos = drawSectionHeader(doc, 'Detailed Findings', yPos, template);

      findings.forEach((finding: Finding, index: number) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        // Finding card header
        doc.setFillColor(...getSeverityColor(finding.severity));
        doc.roundedRect(14, yPos - 2, pageWidth - 28, 10, 2, 2, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        // Truncate title to leave space for severity badge
        const maxTitleLen = 55;
        const findingTitle = (finding.title || 'Unknown').substring(0, maxTitleLen);
        doc.text(`${index + 1}. ${findingTitle}`, 18, yPos + 5);
        
        // Severity badge
        doc.setFontSize(8);
        doc.text(finding.severity?.toUpperCase() || 'N/A', pageWidth - 20, yPos + 5, { align: 'right' });
        
        yPos += 14;
        doc.setTextColor(60, 60, 60); // Dark gray for better readability
        doc.setFont('helvetica', 'normal');

        // Description
        if (finding.description) {
          doc.setFontSize(8);
          doc.setTextColor(50, 50, 50);
          const descLines = doc.splitTextToSize(finding.description, pageWidth - 36);
          doc.text(descLines.slice(0, 4), 18, yPos);
          yPos += Math.min(descLines.length, 4) * 4 + 4;
        }

        // Details grid
        const details: string[][] = [];
        if (finding.affected_component) details.push(['Affected:', finding.affected_component]);
        if (finding.cwe_id) details.push(['CWE:', finding.cwe_id]);
        if (finding.cvss_score) details.push(['CVSS:', String(finding.cvss_score)]);
        
        if (details.length > 0) {
          doc.setFontSize(8);
          details.forEach(([label, value]) => {
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(80, 80, 80);
            doc.text(label, 18, yPos);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(50, 50, 50);
            doc.text(value.substring(0, 70), 48, yPos);
            yPos += 5;
          });
        }

        // Solution
        if (finding.solution) {
          yPos += 4;
          const solLines = doc.splitTextToSize(finding.solution, pageWidth - 55);
          const boxHeight = Math.max(16, solLines.length * 4 + 10);
          
          // Solution box background
          doc.setFillColor(34, 197, 94);
          doc.roundedRect(18, yPos - 3, pageWidth - 36, boxHeight, 2, 2, 'F');
          
          // Solution label
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(255, 255, 255);
          doc.text('SOLUTION:', 22, yPos + 4);
          
          // Solution text
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(255, 255, 255);
          doc.text(solLines.slice(0, 3), 50, yPos + 4);
          yPos += boxHeight + 4;
        }

        yPos += 8;
      });
    }
  }

  // Recommendations Section
  const recommendations = scan.parsed_results?.parsed_json?.recommendations;
  if (includeRecommendations && recommendations && recommendations.length > 0) {
    if (yPos > 220) {
      doc.addPage();
      yPos = 20;
    }

    yPos = drawSectionHeader(doc, 'Recommendations', yPos, template);

    recommendations.forEach((rec: string, index: number) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFillColor(...colors.primary);
      doc.circle(20, yPos + 1, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.text(String(index + 1), 20, yPos + 2.5, { align: 'center' });
      
      doc.setTextColor(...colors.secondary);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const recLines = doc.splitTextToSize(rec, pageWidth - 45);
      doc.text(recLines, 28, yPos + 2);
      yPos += recLines.length * 5 + 6;
    });
  }

  // AI Vulnerability Analysis for AI-Enhanced Network Scans
  const aiAnalysis = scan.parsed_results?.parsed_json?.ai_vulnerability_analysis;
  if (aiAnalysis?.ai_analysis_available && aiAnalysis.standardized_findings?.length > 0) {
    if (yPos > 220) {
      doc.addPage();
      yPos = 20;
    }

    yPos = drawSectionHeader(doc, '🤖 AI Vulnerability Analysis', yPos, template);

    // Analysis info
    doc.setFontSize(8);
    doc.setTextColor(...colors.secondary);
    doc.text(`Model: ${aiAnalysis.model} | Confidence: ${aiAnalysis.analysis_summary?.confidence_level || 'N/A'}`, 14, yPos);
    yPos += 8;

    // AI findings
    aiAnalysis.standardized_findings.slice(0, 10).forEach((finding: any, index: number) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      // Finding header
      doc.setFillColor(6, 182, 212);
      doc.roundedRect(14, yPos - 2, pageWidth - 28, 10, 2, 2, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      const maxTitleLen = 50;
      const findingTitle = (finding.title || 'Unknown').substring(0, maxTitleLen);
      doc.text(`${index + 1}. ${findingTitle}`, 18, yPos + 5);
      
      // Severity and confidence
      doc.setFontSize(7);
      doc.text(`${finding.severity?.toUpperCase() || 'N/A'}`, pageWidth - 50, yPos + 5);
      if (finding.confidence) {
        doc.text(`${finding.confidence}`, pageWidth - 20, yPos + 5, { align: 'right' });
      }
      
      yPos += 14;
      doc.setTextColor(50, 50, 50);
      doc.setFont('helvetica', 'normal');

      // Description
      if (finding.description) {
        doc.setFontSize(8);
        const descLines = doc.splitTextToSize(finding.description, pageWidth - 36);
        doc.text(descLines.slice(0, 3), 18, yPos);
        yPos += Math.min(descLines.length, 3) * 4 + 4;
      }

      // Affected component
      if (finding.affected_component || finding.affected_service) {
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(80, 80, 80);
        doc.text('Affected:', 18, yPos);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(50, 50, 50);
        doc.text((finding.affected_component || finding.affected_service).substring(0, 60), 35, yPos);
        yPos += 5;
      }

      // CVE IDs
      if (finding.cve_ids && finding.cve_ids.length > 0) {
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(80, 80, 80);
        doc.text('CVEs:', 18, yPos);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(220, 38, 38);
        doc.text(finding.cve_ids.slice(0, 3).join(', '), 32, yPos);
        yPos += 5;
      }

      // Solution
      if (finding.solution || finding.remediation) {
        yPos += 2;
        const solText = finding.solution || finding.remediation;
        const solLines = doc.splitTextToSize(solText, pageWidth - 55);
        const boxHeight = Math.max(14, solLines.length * 4 + 8);
        
        // Solution box background
        doc.setFillColor(34, 197, 94);
        doc.roundedRect(18, yPos - 3, pageWidth - 36, boxHeight, 2, 2, 'F');
        
        // Solution label
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(255, 255, 255);
        doc.text('SOLUTION:', 22, yPos + 3);
        
        // Solution text
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(255, 255, 255);
        doc.text(solLines.slice(0, 2), 50, yPos + 3);
        yPos += boxHeight + 4;
      }

      yPos += 6;
    });

    // Security Recommendations from AI
    if (aiAnalysis.security_recommendations && aiAnalysis.security_recommendations.length > 0) {
      if (yPos > 220) {
        doc.addPage();
        yPos = 20;
      }

      yPos = drawSectionHeader(doc, 'AI Security Recommendations', yPos, template);

      aiAnalysis.security_recommendations.slice(0, 8).forEach((rec: string, index: number) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFillColor(6, 182, 212);
        doc.circle(20, yPos + 1, 3, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text(String(index + 1), 20, yPos + 2.5, { align: 'center' });
        
        doc.setTextColor(50, 50, 50);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        const recLines = doc.splitTextToSize(rec, pageWidth - 45);
        doc.text(recLines.slice(0, 2), 28, yPos + 2);
        yPos += Math.min(recLines.length, 2) * 5 + 6;
      });
    }
  }

  // Add footers to all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    drawFooter(doc, i, pageCount, template);
  }

  // Save the PDF
  const targetName = (scan.target || 'unknown').replace(/[^a-zA-Z0-9]/g, '-').substring(0, 30);
  const fileName = `${companyName.toLowerCase()}-security-report-${targetName}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

/**
 * Generate professional executive summary PDF from multiple scans
 */
export function generateExecutiveSummaryPDF(scans: ScanResponse[], companyName: string = COMPANY_CONFIG.name, templateId?: string): void {
  const template = templateId ? getTemplateById(templateId) : getDefaultTemplate();
  const colors = getColors(template);
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 60;

  const completedScans = scans.filter(s => s.status === 'COMPLETED');

  // Draw header
  drawHeader(doc, 'Executive Security Summary', companyName, template);

  // Calculate metrics
  const totalFindings = completedScans.reduce((sum, s) => sum + (s.parsed_results?.summary?.total_findings || 0), 0);
  const criticalCount = completedScans.reduce((sum, s) => sum + (s.parsed_results?.summary?.critical || 0), 0);
  const highCount = completedScans.reduce((sum, s) => sum + (s.parsed_results?.summary?.high || 0), 0);
  const mediumCount = completedScans.reduce((sum, s) => sum + (s.parsed_results?.summary?.medium || 0), 0);
  const lowCount = completedScans.reduce((sum, s) => sum + (s.parsed_results?.summary?.low || 0), 0);
  const avgRiskScore = completedScans.length > 0 
    ? Math.round(completedScans.reduce((sum, s) => sum + (s.parsed_results?.summary?.risk_score || 0), 0) / completedScans.length)
    : 0;
  const securityScore = 100 - avgRiskScore;

  // Executive Summary Box
  yPos = 60;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, yPos, pageWidth - 28, 45, 3, 3, 'F');
  doc.setDrawColor(...colors.primary);
  doc.roundedRect(14, yPos, pageWidth - 28, 45, 3, 3, 'S');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.secondary);
  doc.text('EXECUTIVE OVERVIEW', 20, yPos + 10);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Scans Performed: ${scans.length}`, 20, yPos + 22);
  doc.text(`Completed Scans: ${completedScans.length}`, 20, yPos + 30);
  doc.text(`Total Vulnerabilities Identified: ${totalFindings}`, 20, yPos + 38);
  
  // Overall Security Score
  doc.setFillColor(...getRiskLevelColor(avgRiskScore));
  doc.roundedRect(pageWidth - 80, yPos + 8, 60, 32, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(`${securityScore}%`, pageWidth - 50, yPos + 28, { align: 'center' });
  doc.setFontSize(8);
  doc.text('OVERALL SECURITY', pageWidth - 50, yPos + 36, { align: 'center' });

  yPos += 55;

  // Vulnerability Distribution
  yPos = drawSectionHeader(doc, 'Vulnerability Distribution', yPos, template);

  const severities = [
    { label: 'Critical', count: criticalCount, color: [220, 38, 38] as [number, number, number] },
    { label: 'High', count: highCount, color: [234, 88, 12] as [number, number, number] },
    { label: 'Medium', count: mediumCount, color: [234, 179, 8] as [number, number, number] },
    { label: 'Low', count: lowCount, color: [59, 130, 246] as [number, number, number] }
  ];

  const boxWidth = (pageWidth - 28 - 12) / 4;
  severities.forEach((sev, idx) => {
    const x = 14 + idx * (boxWidth + 4);
    
    doc.setFillColor(...sev.color);
    doc.roundedRect(x, yPos, boxWidth, 30, 2, 2, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(String(sev.count), x + boxWidth / 2, yPos + 16, { align: 'center' });
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(sev.label.toUpperCase(), x + boxWidth / 2, yPos + 25, { align: 'center' });
  });

  yPos += 42;

  // Scans Summary
  yPos = drawSectionHeader(doc, 'Scan Summary', yPos, template);

  const scanData = completedScans.map(scan => [
    (scan.target || 'N/A').substring(0, 35),
    getProfileName(scan.profile || '').substring(0, 20),
    String(scan.parsed_results?.summary?.total_findings || 0),
    String(scan.parsed_results?.summary?.critical || 0),
    String(scan.parsed_results?.summary?.high || 0),
    formatDateShort(scan.created_at)
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Target', 'Profile', 'Total', 'Crit', 'High', 'Date']],
    body: scanData,
    theme: 'grid',
    headStyles: { 
      fillColor: colors.secondary, 
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8
    },
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 55 },
      1: { cellWidth: 40 },
      2: { cellWidth: 18, halign: 'center' },
      3: { cellWidth: 15, halign: 'center' },
      4: { cellWidth: 15, halign: 'center' },
      5: { cellWidth: 30 }
    },
    margin: { left: 14, right: 14 },
    didParseCell: (data) => {
      if (data.section === 'body') {
        if (data.column.index === 3) {
          const count = parseInt(data.cell.raw as string);
          if (count > 0) {
            data.cell.styles.textColor = [220, 38, 38];
            data.cell.styles.fontStyle = 'bold';
          }
        }
        if (data.column.index === 4) {
          const count = parseInt(data.cell.raw as string);
          if (count > 0) {
            data.cell.styles.textColor = [234, 88, 12];
            data.cell.styles.fontStyle = 'bold';
          }
        }
      }
    }
  });

  yPos = doc.lastAutoTable.finalY + 15;

  // Key Recommendations
  if (yPos < 230) {
    yPos = drawSectionHeader(doc, 'Key Recommendations', yPos, template);
    
    const defaultRecs = [
      'Address all critical and high severity vulnerabilities within 7 days',
      'Implement regular vulnerability scanning schedule (weekly recommended)',
      'Review and update security policies based on identified gaps',
      'Conduct security awareness training for development team',
      'Establish incident response procedures for vulnerability remediation'
    ];

    defaultRecs.forEach((rec, index) => {
      doc.setFillColor(...colors.primary);
      doc.circle(20, yPos + 1, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.text(String(index + 1), 20, yPos + 2.5, { align: 'center' });
      
      doc.setTextColor(...colors.secondary);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(rec, 28, yPos + 2);
      yPos += 10;
    });
  }

  // Add footers to all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    drawFooter(doc, i, pageCount, template);
  }

  const fileName = `${companyName.toLowerCase()}-executive-summary-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
