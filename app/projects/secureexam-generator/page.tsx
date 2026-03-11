import ArticlePage from "@/components/ArticlePage";

export default function SecureExamPage() {
  return (
    <ArticlePage
      crumbs={[
        { label: "Home", href: "/" },
        { label: "Projects", href: "/projects" },
        { label: "SecureExam-Generator" },
      ]}
      title="SecureExam-Generator"
      date="2025"
      tags={[
        { label: "Python", variant: "tech" },
        { label: "security", variant: "tech" },
        { label: "education", variant: "tech" },
      ]}
      tocItems={[
        { id: "overview", label: "Overview", level: 2 },
        { id: "features", label: "Features", level: 2 },
        { id: "tech-stack", label: "Tech Stack", level: 2 },
        { id: "motivation", label: "Motivation", level: 2 },
      ]}
    >
      <h2 id="overview">Overview</h2>
      <p>
        SecureExam-Generator is a Python tool designed to produce tamper-proof,
        verifiable exam papers for educators. Each generated document is embedded
        with a unique QR code and a cryptographic filigree watermark, making
        unauthorized duplication immediately detectable.
      </p>

      <h2 id="features">Features</h2>
      <p>
        The tool supports customizable question banks, randomized question ordering
        per student, and automatic PDF generation. Each exam sheet includes a
        student-specific QR code that encodes a hash of the exam content —
        allowing instant integrity verification during grading.
      </p>
      <ul>
        <li>Per-student randomized question order</li>
        <li>QR code embedding with content hash</li>
        <li>Background filigree watermark (custom pattern per institution)</li>
        <li>Batch PDF generation via CLI</li>
        <li>Offline-first — no external services required</li>
      </ul>

      <h2 id="tech-stack">Tech Stack</h2>
      <p>
        Built in <code>Python 3</code> using <code>reportlab</code> for PDF
        generation, <code>qrcode</code> for QR embedding, and <code>Pillow</code>{" "}
        for watermark compositing. CLI interface via <code>argparse</code>.
      </p>

      <h2 id="motivation">Motivation</h2>
      <p>
        Exam fraud is a persistent challenge in educational institutions. Existing
        solutions either require expensive software licenses or lack cryptographic
        integrity guarantees. SecureExam-Generator was built to be free, offline,
        and auditable — prioritizing trust through transparency.
      </p>
    </ArticlePage>
  );
}
