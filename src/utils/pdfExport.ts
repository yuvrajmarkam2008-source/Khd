import jsPDF from 'jspdf';
import { Message, ChatSession, Bookmark, SubjectId } from '../types';
import { SUBJECTS } from '../data/subjects';

// Clean markdown tags for clean PDF rendering
function cleanMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
    .replace(/\*(.*?)\*/g, '$1')     // Italic
    .replace(/`([^`]+)`/g, '$1')     // Inline code
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Links
    .replace(/\$\$(.*?)\$\$/g, '$1') // Block math
    .replace(/\$(.*?)\$/g, '$1')     // Inline math
    .replace(/^###\s*/gm, '')        // H3
    .replace(/^##\s*/gm, '')         // H2
    .replace(/^#\s*/gm, '')          // H1
    .replace(/```[a-z]*\n([\s\S]*?)\n```/g, '$1'); // Code block
}

// Add standardized header to a page
function addHeader(doc: jsPDF, subjectName: string, title: string) {
  doc.setFillColor(79, 70, 229); // Indigo 600
  doc.rect(0, 0, doc.internal.pageSize.width, 18, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Kumhud AI Study Assistant', 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(subjectName.toUpperCase(), doc.internal.pageSize.width - 14, 12, { align: 'right' });
}

// Add standardized footer to a page
function addFooter(doc: jsPDF, pageNum: number, totalPages: number) {
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;

  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text(
    'Kumhud Educational Study Notes • Always verify with your teacher or textbook',
    14,
    pageHeight - 6
  );

  doc.setFont('helvetica', 'normal');
  doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - 14, pageHeight - 6, { align: 'right' });
}

/**
 * Export a complete chat session to formatted PDF
 */
export function exportChatSessionToPDF(session: ChatSession): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 14;
  const maxLineWidth = pageWidth - margin * 2;
  let yPos = 26;

  const subjectInfo = SUBJECTS.find((s) => s.id === session.subject);
  const subjectName = subjectInfo?.name || 'General Studies';

  addHeader(doc, subjectName, session.title);

  // Document Title Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, yPos, maxLineWidth, 18, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, yPos, maxLineWidth, 18, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(30, 41, 59); // Slate 800
  doc.text(session.title || 'Study Session Notes', margin + 4, yPos + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139); // Slate 500
  const dateStr = new Date(session.updatedAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.text(`Subject: ${subjectName}  •  Date: ${dateStr}  •  Language: ${session.language}`, margin + 4, yPos + 13);

  yPos += 24;

  const checkPageBreak = (neededHeight: number) => {
    if (yPos + neededHeight > pageHeight - 20) {
      doc.addPage();
      yPos = 26;
      addHeader(doc, subjectName, session.title);
    }
  };

  // Render each message
  session.messages.forEach((msg, idx) => {
    const isUser = msg.role === 'user';
    const cleanedText = cleanMarkdown(msg.content);

    if (isUser) {
      // Question block
      checkPageBreak(20);
      doc.setFillColor(238, 242, 255); // Indigo 50
      doc.setDrawColor(199, 210, 254); // Indigo 200

      const questionLines = doc.splitTextToSize(`Q: ${cleanedText}`, maxLineWidth - 8);
      const boxHeight = questionLines.length * 5 + 6;

      checkPageBreak(boxHeight + 4);
      doc.roundedRect(margin, yPos, maxLineWidth, boxHeight, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(67, 56, 202); // Indigo 700
      doc.text(questionLines, margin + 4, yPos + 5);

      yPos += boxHeight + 4;
    } else {
      // AI Solution block
      checkPageBreak(15);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42); // Slate 900
      doc.text('Step-by-Step Solution & Explanations:', margin, yPos);
      yPos += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85); // Slate 700

      const answerLines = doc.splitTextToSize(cleanedText, maxLineWidth);

      for (let i = 0; i < answerLines.length; i++) {
        checkPageBreak(5);
        const line = answerLines[i];

        // Highlight step lines or headings
        if (line.startsWith('Step ') || line.startsWith('Key Concept') || line.startsWith('Final Answer')) {
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(30, 41, 59);
        } else {
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(51, 65, 85);
        }

        doc.text(line, margin, yPos);
        yPos += 4.6;
      }

      yPos += 6;

      // Small separator line between Q&A pairs
      if (idx < session.messages.length - 1) {
        checkPageBreak(6);
        doc.setDrawColor(241, 245, 249);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 6;
      }
    }
  });

  // Apply footers to all pages
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    addFooter(doc, p, totalPages);
  }

  // Sanitize filename
  const cleanTitle = (session.title || 'kumhud-study-notes')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 30);
  doc.save(`${cleanTitle}.pdf`);
}

/**
 * Export a single bookmarked question and answer to formatted PDF
 */
export function exportBookmarkToPDF(bookmark: Bookmark): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 14;
  const maxLineWidth = pageWidth - margin * 2;
  let yPos = 26;

  const subjectInfo = SUBJECTS.find((s) => s.id === bookmark.subject);
  const subjectName = subjectInfo?.name || 'Study Notes';

  addHeader(doc, subjectName, bookmark.question);

  // Document Title Box
  doc.setFillColor(254, 243, 199); // Amber 100
  doc.setDrawColor(251, 191, 36);  // Amber 400
  doc.roundedRect(margin, yPos, maxLineWidth, 14, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(180, 83, 9); // Amber 800
  doc.text(`BOOKMARKED REVISION NOTE • ${subjectName.toUpperCase()}`, margin + 4, yPos + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(146, 64, 14);
  const dateStr = new Date(bookmark.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc.text(`Saved on: ${dateStr}`, margin + 4, yPos + 10.5);

  yPos += 19;

  // Question Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  const cleanedQuestion = cleanMarkdown(bookmark.question);
  const qLines = doc.splitTextToSize(`Question: ${cleanedQuestion}`, maxLineWidth - 8);
  const qBoxHeight = qLines.length * 5 + 6;

  doc.roundedRect(margin, yPos, maxLineWidth, qBoxHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text(qLines, margin + 4, yPos + 5.5);

  yPos += qBoxHeight + 6;

  const checkPageBreak = (neededHeight: number) => {
    if (yPos + neededHeight > pageHeight - 20) {
      doc.addPage();
      yPos = 26;
      addHeader(doc, subjectName, bookmark.question);
    }
  };

  // Solution Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(79, 70, 229); // Indigo 600
  doc.text('Step-by-Step Solution & Concept Breakdown:', margin, yPos);
  yPos += 6;

  const cleanedAnswer = cleanMarkdown(bookmark.answer);
  const answerLines = doc.splitTextToSize(cleanedAnswer, maxLineWidth);

  for (let i = 0; i < answerLines.length; i++) {
    checkPageBreak(5);
    const line = answerLines[i];

    if (line.startsWith('Step ') || line.startsWith('Key Concept') || line.startsWith('Final Answer')) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
    }

    doc.text(line, margin, yPos);
    yPos += 4.6;
  }

  // Apply footers
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    addFooter(doc, p, totalPages);
  }

  const cleanQ = bookmark.question
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 28);
  doc.save(`revision-note-${cleanQ || 'kumhud'}.pdf`);
}
