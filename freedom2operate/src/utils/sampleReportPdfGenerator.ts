import jsPDF from 'jspdf';
import { sampleReport } from '../data/sampleReport';
import { RiskLevel } from '../types';

const getRiskColor = (riskLevel: RiskLevel) => {
  switch (riskLevel) {
    case 'High':
      return '#ff0000';
    case 'Medium':
      return '#ffa500';
    case 'Low':
      return '#008000';
    default:
      return '#000000';
  }
};

export const generateSampleReportPdf = () => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;
  const lineHeight = 7;

  // Title
  doc.setFontSize(20);
  doc.text('Freedom to Operate (FTO) Search Report', pageWidth / 2, y, { align: 'center' });
  y += lineHeight * 2;

  // Project Details
  doc.setFontSize(12);
  doc.text('Project: Smart Irrigation Control System', 20, y);
  y += lineHeight;
  doc.text('Reference: SAMPLE-001', 20, y);
  y += lineHeight;
  doc.text('Type: FTO Search', 20, y);
  y += lineHeight;
  doc.text(`Client Reference: ${sampleReport.clientReference || 'N/A'}`, 20, y);
  y += lineHeight;
  doc.text(`Search Date: ${sampleReport.searchDate?.toLocaleDateString() || 'N/A'}`, 20, y);
  y += lineHeight * 2;

  // Examiner Information
  doc.setFontSize(14);
  doc.text('Patent Examiner', 20, y);
  y += lineHeight;
  doc.setFontSize(12);
  doc.text(`Name: ${sampleReport.examiner?.name || 'N/A'}`, 30, y);
  y += lineHeight;
  doc.text(`Title: ${sampleReport.examiner?.title || 'N/A'}`, 30, y);
  if (sampleReport.examiner?.qualifications?.length) {
    y += lineHeight;
    doc.text('Qualifications:', 30, y);
    y += lineHeight;
    sampleReport.examiner.qualifications.forEach(qual => {
      doc.text(`• ${qual}`, 35, y);
      y += lineHeight;
    });
  }
  y += lineHeight;

  // Executive Summary
  doc.setFontSize(16);
  doc.text('Executive Summary', 20, y);
  y += lineHeight;
  doc.setFontSize(12);
  const summaryLines = doc.splitTextToSize(sampleReport.executiveSummary?.text || '', pageWidth - 40);
  doc.text(summaryLines, 20, y);
  y += summaryLines.length * lineHeight + lineHeight;

  // Key Findings
  doc.setFontSize(14);
  doc.text('Key Findings', 20, y);
  y += lineHeight;
  doc.setFontSize(12);
  sampleReport.executiveSummary?.keyFindings?.forEach(finding => {
    doc.text(`• ${finding}`, 25, y);
    y += lineHeight;
  });
  y += lineHeight;

  // Risk Summary
  doc.setFontSize(14);
  doc.text('Risk Summary', 20, y);
  y += lineHeight;
  doc.setFontSize(12);
  const overallRisk = sampleReport.executiveSummary?.riskSummary?.overall;
  if (overallRisk) {
    doc.setTextColor(getRiskColor(overallRisk));
    doc.text(`Overall Risk Level: ${overallRisk}`, 25, y);
    doc.setTextColor('#000000');
    y += lineHeight;
  }
  
  if (sampleReport.executiveSummary?.riskSummary?.byFeature) {
    Object.entries(sampleReport.executiveSummary.riskSummary.byFeature).forEach(([feature, risk]) => {
      doc.setTextColor(getRiskColor(risk));
      doc.text(`• ${feature}: ${risk}`, 25, y);
      doc.setTextColor('#000000');
      y += lineHeight;
    });
  }
  y += lineHeight;

  // Features Analysis
  if (y > 200) {
    doc.addPage();
    y = 20;
  }

  doc.setFontSize(16);
  doc.text('Feature Analysis', 20, y);
  y += lineHeight;
  doc.setFontSize(12);

  sampleReport.features.forEach((feature) => {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.text(`Feature: ${feature.description}`, 20, y);
    y += lineHeight;
    
    if (feature.riskSummary) {
      doc.setTextColor(getRiskColor(feature.riskSummary.overallRisk));
      doc.text(`Risk Level: ${feature.riskSummary.overallRisk}`, 25, y);
      doc.setTextColor('#000000');
      y += lineHeight;

      if (feature.riskSummary.keyRisks.length) {
        doc.text('Key Risks:', 25, y);
        y += lineHeight;
        feature.riskSummary.keyRisks.forEach(risk => {
          doc.text(`• ${risk}`, 30, y);
          y += lineHeight;
        });
      }

      if (feature.riskSummary.mitigationStrategies.length) {
        doc.text('Mitigation Strategies:', 25, y);
        y += lineHeight;
        feature.riskSummary.mitigationStrategies.forEach(strategy => {
          doc.text(`• ${strategy}`, 30, y);
          y += lineHeight;
        });
      }
    }
    
    doc.setFont('helvetica', 'normal');
    feature.citations.forEach((citation) => {
      doc.text(`Patent: ${citation.patentNumber}`, 30, y);
      y += lineHeight;
      doc.setTextColor(getRiskColor(citation.riskLevel));
      doc.text(`Risk Level: ${citation.riskLevel}`, 30, y);
      doc.setTextColor('#000000');
      y += lineHeight;
      doc.text(`Analysis:`, 30, y);
      y += lineHeight;
      const analysisLines = doc.splitTextToSize(citation.analysis, pageWidth - 60);
      doc.text(analysisLines, 30, y);
      y += analysisLines.length * lineHeight + lineHeight;
    });
  });

  // Points for Consideration
  if (y > 200) {
    doc.addPage();
    y = 20;
  }

  doc.setFontSize(16);
  doc.text('Points for Consideration', 20, y);
  y += lineHeight;
  doc.setFontSize(12);
  const considerationLines = doc.splitTextToSize(sampleReport.considerations || '', pageWidth - 40);
  doc.text(considerationLines, 20, y);
  y += considerationLines.length * lineHeight + lineHeight;

  // Technology Landscape
  if (y > 200) {
    doc.addPage();
    y = 20;
  }

  doc.setFontSize(16);
  doc.text('Technology Landscape', 20, y);
  y += lineHeight;
  doc.setFontSize(12);

  if (sampleReport.technologyLandscape?.overview) {
    doc.setFont('helvetica', 'bold');
    doc.text('Overview', 20, y);
    y += lineHeight;
    doc.setFont('helvetica', 'normal');
    const overviewLines = doc.splitTextToSize(sampleReport.technologyLandscape.overview, pageWidth - 40);
    doc.text(overviewLines, 20, y);
    y += overviewLines.length * lineHeight + lineHeight;
  }

  if (sampleReport.technologyLandscape?.trends?.length) {
    doc.setFont('helvetica', 'bold');
    doc.text('Technology Trends', 20, y);
    y += lineHeight;
    doc.setFont('helvetica', 'normal');
    sampleReport.technologyLandscape.trends.forEach(trend => {
      doc.text(`• ${trend}`, 25, y);
      y += lineHeight;
    });
    y += lineHeight;
  }

  if (sampleReport.technologyLandscape?.emergingTechnologies?.length) {
    doc.setFont('helvetica', 'bold');
    doc.text('Emerging Technologies', 20, y);
    y += lineHeight;
    doc.setFont('helvetica', 'normal');
    sampleReport.technologyLandscape.emergingTechnologies.forEach(tech => {
      doc.text(`• ${tech}`, 25, y);
      y += lineHeight;
    });
    y += lineHeight;
  }

  // Search Strategy
  if (y > 200) {
    doc.addPage();
    y = 20;
  }

  doc.setFontSize(16);
  doc.text('Search Strategy', 20, y);
  y += lineHeight;
  doc.setFontSize(12);
  const strategyLines = doc.splitTextToSize(sampleReport.searchStrategy || '', pageWidth - 40);
  doc.text(strategyLines, 20, y);
  y += strategyLines.length * lineHeight + lineHeight;

  // Claim Charts
  if (sampleReport.appendices?.claimCharts?.length) {
    if (y > 200) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(16);
    doc.text('Claim Charts', 20, y);
    y += lineHeight * 2;
    doc.setFontSize(12);

    sampleReport.appendices.claimCharts.forEach(chart => {
      doc.setFont('helvetica', 'bold');
      doc.text(`Patent: ${chart.patentNumber}`, 20, y);
      y += lineHeight * 1.5;

      Object.entries(chart.claims).forEach(([claimNumber, claim]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(`Claim ${claimNumber}`, 25, y);
        y += lineHeight;

        doc.setFont('helvetica', 'normal');
        doc.text('Text:', 30, y);
        y += lineHeight;
        const textLines = doc.splitTextToSize(claim.text, pageWidth - 70);
        doc.text(textLines, 35, y);
        y += textLines.length * lineHeight;

        doc.text('Analysis:', 30, y);
        y += lineHeight;
        const analysisLines = doc.splitTextToSize(claim.analysis, pageWidth - 70);
        doc.text(analysisLines, 35, y);
        y += analysisLines.length * lineHeight;

        doc.setTextColor(getRiskColor(claim.riskLevel));
        doc.text(`Risk Level: ${claim.riskLevel}`, 30, y);
        doc.setTextColor('#000000');
        y += lineHeight * 2;

        if (y > 250) {
          doc.addPage();
          y = 20;
        }
      });
    });
  }

  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(
      `Sample Report - For Demonstration Purposes Only - Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  return doc;
};

export const downloadSampleReport = () => {
  const doc = generateSampleReportPdf();
  doc.save('freedom2operate-sample-report.pdf');
};

export default generateSampleReportPdf;
