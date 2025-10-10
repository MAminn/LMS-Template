import jsPDF from "jspdf";

export interface CertificateData {
  studentName: string;
  courseTitle: string;
  instructorName: string;
  completionDate: string;
  certificateId: string;
  courseDuration?: string;
  organizationName?: string;
}

export class CertificateGenerator {
  private pdf: jsPDF;
  private pageWidth: number;
  private pageHeight: number;

  constructor() {
    this.pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });
    this.pageWidth = this.pdf.internal.pageSize.getWidth();
    this.pageHeight = this.pdf.internal.pageSize.getHeight();
  }

  generateCertificate(data: CertificateData): Blob {
    // Background and border
    this.drawBackground();
    this.drawBorder();

    // Header
    this.drawHeader();

    // Main content
    this.drawMainContent(data);

    // Footer
    this.drawFooter(data);

    // Return as blob for download
    return this.pdf.output("blob");
  }

  private drawBackground(): void {
    // Light background color
    this.pdf.setFillColor(248, 250, 252); // Tailwind gray-50
    this.pdf.rect(0, 0, this.pageWidth, this.pageHeight, "F");
  }

  private drawBorder(): void {
    // Outer border
    this.pdf.setDrawColor(59, 130, 246); // Tailwind blue-500
    this.pdf.setLineWidth(2);
    this.pdf.rect(10, 10, this.pageWidth - 20, this.pageHeight - 20);

    // Inner decorative border
    this.pdf.setDrawColor(30, 64, 175); // Tailwind blue-800
    this.pdf.setLineWidth(0.5);
    this.pdf.rect(15, 15, this.pageWidth - 30, this.pageHeight - 30);
  }

  private drawHeader(): void {
    // Organization logo/text
    this.pdf.setFontSize(24);
    this.pdf.setFont("helvetica", "bold");
    this.pdf.setTextColor(59, 130, 246); // Blue
    this.pdf.text("The Academy", this.pageWidth / 2, 35, { align: "center" });

    // Subtitle
    this.pdf.setFontSize(12);
    this.pdf.setFont("helvetica", "normal");
    this.pdf.setTextColor(100, 116, 139); // Gray
    this.pdf.text("Learning Management System", this.pageWidth / 2, 45, {
      align: "center",
    });

    // Main title
    this.pdf.setFontSize(36);
    this.pdf.setFont("helvetica", "bold");
    this.pdf.setTextColor(30, 41, 59); // Dark gray
    this.pdf.text("Certificate of Completion", this.pageWidth / 2, 70, {
      align: "center",
    });
  }

  private drawMainContent(data: CertificateData): void {
    const centerX = this.pageWidth / 2;

    // "This certifies that" text
    this.pdf.setFontSize(16);
    this.pdf.setFont("helvetica", "normal");
    this.pdf.setTextColor(100, 116, 139);
    this.pdf.text("This certifies that", centerX, 95, { align: "center" });

    // Student name (prominent)
    this.pdf.setFontSize(28);
    this.pdf.setFont("helvetica", "bold");
    this.pdf.setTextColor(30, 41, 59);
    this.pdf.text(data.studentName, centerX, 115, { align: "center" });

    // Underline for student name
    const studentNameWidth = this.pdf.getTextWidth(data.studentName);
    this.pdf.setDrawColor(59, 130, 246);
    this.pdf.setLineWidth(0.5);
    this.pdf.line(
      centerX - studentNameWidth / 2 - 10,
      120,
      centerX + studentNameWidth / 2 + 10,
      120
    );

    // "has successfully completed" text
    this.pdf.setFontSize(16);
    this.pdf.setFont("helvetica", "normal");
    this.pdf.setTextColor(100, 116, 139);
    this.pdf.text("has successfully completed the course", centerX, 135, {
      align: "center",
    });

    // Course title (prominent)
    this.pdf.setFontSize(24);
    this.pdf.setFont("helvetica", "bold");
    this.pdf.setTextColor(59, 130, 246);

    // Handle long course titles by wrapping
    const maxWidth = this.pageWidth - 80;
    const courseLines = this.pdf.splitTextToSize(data.courseTitle, maxWidth);
    // Certificate details
    const startY = 155;

    courseLines.forEach((line: string, index: number) => {
      this.pdf.text(line, centerX, startY + index * 10, { align: "center" });
    });

    // Decorative elements
    this.drawDecorations(startY + courseLines.length * 10 + 10);
  }

  private drawDecorations(y: number): void {
    const centerX = this.pageWidth / 2;

    // Award icon representation (using text)
    this.pdf.setFontSize(24);
    this.pdf.setTextColor(255, 215, 0); // Gold color
    this.pdf.text("🏆", centerX - 30, y, { align: "center" });
    this.pdf.text("🏆", centerX + 30, y, { align: "center" });

    // Decorative lines
    this.pdf.setDrawColor(59, 130, 246);
    this.pdf.setLineWidth(1);
    this.pdf.line(50, y - 5, centerX - 40, y - 5);
    this.pdf.line(centerX + 40, y - 5, this.pageWidth - 50, y - 5);
  }

  private drawFooter(data: CertificateData): void {
    const leftX = 50;
    const rightX = this.pageWidth - 50;
    const footerY = this.pageHeight - 50;

    // Left side - Date
    this.pdf.setFontSize(12);
    this.pdf.setFont("helvetica", "normal");
    this.pdf.setTextColor(100, 116, 139);
    this.pdf.text("Date of Completion:", leftX, footerY);
    this.pdf.setFont("helvetica", "bold");
    this.pdf.setTextColor(30, 41, 59);
    this.pdf.text(data.completionDate, leftX, footerY + 8);

    // Right side - Instructor
    this.pdf.setFont("helvetica", "normal");
    this.pdf.setTextColor(100, 116, 139);
    this.pdf.text("Instructor:", rightX, footerY, { align: "right" });
    this.pdf.setFont("helvetica", "bold");
    this.pdf.setTextColor(30, 41, 59);
    this.pdf.text(data.instructorName, rightX, footerY + 8, { align: "right" });

    // Center - Certificate ID
    const centerX = this.pageWidth / 2;
    this.pdf.setFontSize(10);
    this.pdf.setFont("helvetica", "normal");
    this.pdf.setTextColor(156, 163, 175);
    this.pdf.text(
      `Certificate ID: ${data.certificateId}`,
      centerX,
      this.pageHeight - 25,
      { align: "center" }
    );

    // Verification URL
    this.pdf.text(
      "Verify at: academy.com/verify",
      centerX,
      this.pageHeight - 15,
      { align: "center" }
    );
  }

  downloadCertificate(data: CertificateData): void {
    const pdfBlob = this.generateCertificate(data);
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${data.courseTitle.replace(
      /[^a-z0-9]/gi,
      "_"
    )}_Certificate.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  }

  previewCertificate(data: CertificateData): string {
    const pdfBlob = this.generateCertificate(data);
    return URL.createObjectURL(pdfBlob);
  }
}

// Utility function to generate unique certificate ID
export function generateCertificateId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `CERT-${timestamp}-${randomStr}`.toUpperCase();
}

// Factory function for easy usage
export function createCertificate(): CertificateGenerator {
  return new CertificateGenerator();
}
