import ArticlePage from "@/components/ArticlePage";
import LinkedTerm from "@/components/LinkedTerm";

export default function SecureExamPage() {
  return (
    <ArticlePage
      nodeId="secureexam"
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
        { label: "CLI", variant: "tech" },
      ]}
      tocItems={[
        { id: "overview", label: "Overview", level: 2 },
        { id: "how-it-works", label: "How It Works", level: 2 },
        { id: "features", label: "Features", level: 2 },
        { id: "tech-stack", label: "Tech Stack", level: 2 },
        { id: "usage", label: "Usage", level: 2 },
        { id: "motivation", label: "Motivation", level: 2 },
        { id: "related-concepts", label: "Related Concepts", level: 2 },
      ]}
    >
      <h2 id="overview">Overview</h2>
      <p>
        SecureExam-Generator is a Python CLI tool that produces tamper-proof,
        cryptographically verifiable exam papers. Each output PDF is uniquely
        bound to a specific student via an embedded QR code and a per-institution
        filigree watermark pattern — making unauthorized duplication or content
        substitution immediately detectable without any server infrastructure.
      </p>
      <p>
        The tool is fully offline-first. Verification requires no internet
        connection, no proprietary software, and no subscription. An examiner
        with the original question bank and the student&apos;s sheet can verify
        integrity in under three seconds.
      </p>

      <h2 id="how-it-works">How It Works</h2>
      <p>
        Each exam sheet is generated through a three-stage pipeline built on
        deterministic hashing — the same cryptographic primitives that underpin
        version control and blockchain consensus, applied to educational
        document integrity:
      </p>
      <ol>
        <li>
          <strong>Shuffle and seed.</strong> Questions are drawn from the
          question bank and shuffled using a deterministic PRNG seeded with a
          hash of <code>(student_id + exam_id + secret_salt)</code>. The same
          seed always produces the same ordering — shuffle is verifiable, not
          random noise.
        </li>
        <li>
          <strong>Hash and encode.</strong> A SHA-256 digest is computed over
          the ordered question set and the student metadata. This hash is encoded
          into a QR code and embedded in the header of the PDF, alongside the
          student&apos;s name and exam ID.
        </li>
        <li>
          <strong>Watermark and render.</strong> A custom filigree pattern —
          supplied per institution as an SVG or raster asset — is composited
          beneath the content layer at low opacity. The watermark encodes
          institutional identity without obscuring readability.
        </li>
      </ol>
      <p>
        Verification works in reverse: recompute the hash from the question
        bank and student ID, compare against the QR code. Any modification to
        the printed content — a changed question, a reordered answer, a replaced
        image — produces a different hash and fails verification instantly.
      </p>

      <h2 id="features">Features</h2>
      <ul>
        <li>Per-student deterministic question ordering (reproducible shuffle)</li>
        <li>SHA-256 content hash embedded as QR code in the document header</li>
        <li>Configurable filigree watermark per institution (SVG or PNG)</li>
        <li>Batch generation — an entire class cohort in a single CLI invocation</li>
        <li>Question bank defined in YAML — structured, version-controllable, diffable</li>
        <li>Offline verification — no server, no API, no dependency on external services</li>
        <li>Answer key generation with the same shuffle seed for fast grading</li>
      </ul>

      <h2 id="tech-stack">Tech Stack</h2>
      <p>
        The tool is built in <code>Python 3</code> with a deliberately small
        dependency surface to keep it auditable and portable. The full source is
        on{" "}
        <LinkedTerm
          href="/github"
          nodeId="github"
          variant="tech"
        >
          GitHub
        </LinkedTerm>
        , and the development environment is documented in{" "}
        <LinkedTerm
          href="/uses"
          nodeId="uses"
          variant="tech"
        >
          /uses
        </LinkedTerm>
        .
      </p>
      <ul>
        <li>
          <code>reportlab</code> — programmatic PDF generation with precise
          layout control for headers, question blocks, and answer grids
        </li>
        <li>
          <code>qrcode</code> — QR encoding of the SHA-256 hash; version and
          error correction level are configurable
        </li>
        <li>
          <code>Pillow</code> — watermark compositing; handles both SVG-rasterized
          and native raster inputs with opacity control
        </li>
        <li>
          <code>PyYAML</code> — question bank parsing; supports multi-line
          questions, image references, and metadata tags
        </li>
        <li>
          <code>argparse</code> — CLI interface with subcommands for{" "}
          <code>generate</code>, <code>verify</code>, and <code>batch</code>
        </li>
        <li>
          <code>hashlib</code> (stdlib) — SHA-256 digest; no third-party
          cryptography dependency
        </li>
      </ul>

      <h2 id="usage">Usage</h2>
      <p>
        Generating a single exam sheet:
      </p>
      <pre><code>{`python secureexam.py generate \\
  --bank questions.yaml \\
  --student-id A2024001 \\
  --exam-id MATH101-FINAL \\
  --watermark logo.png \\
  --out exams/`}</code></pre>
      <p>
        Batch generation for an entire class roster:
      </p>
      <pre><code>{`python secureexam.py batch \\
  --bank questions.yaml \\
  --roster students.csv \\
  --exam-id MATH101-FINAL \\
  --watermark logo.png \\
  --out exams/ \\
  --jobs 4`}</code></pre>
      <p>
        Verifying a printed sheet (after scanning the QR code):
      </p>
      <pre><code>{`python secureexam.py verify \\
  --bank questions.yaml \\
  --student-id A2024001 \\
  --exam-id MATH101-FINAL \\
  --hash 3a7f9c2b...`}</code></pre>

      <h2 id="motivation">Motivation</h2>
      <p>
        Exam fraud is a persistent problem in educational institutions. The
        existing tools that address it fall into two categories: expensive
        proprietary platforms with vendor lock-in, or ad-hoc solutions (coloured
        paper, sequential numbering) that provide no cryptographic guarantee.
      </p>
      <p>
        The problem space was shaped by conversations within the{" "}
        <LinkedTerm
          href="/community/tba"
          variant="tech"
          title="Turkish Informatics Association"
          content="A national non-profit promoting CS education and digital literacy in Turkey since 1971 — where exam integrity was a recurring concern among educator members."
        >
          Turkish Informatics Association
        </LinkedTerm>
        , where educators consistently raised concerns about document integrity
        and the cost of existing solutions. SecureExam-Generator was built to
        be free, offline, and auditable — prioritizing trust through
        transparency rather than obscurity.
      </p>
      <p>
        The deterministic shuffle algorithm uses the same principles documented in my{" "}
        <LinkedTerm
          href="/til"
          nodeId="til"
          variant="tech"
        >
          garden note on SHA-256 deterministic shuffling
        </LinkedTerm>
        {" "}&mdash; a technique where a cryptographic hash function produces a
        repeatable-yet-unpredictable ordering. The formal reasoning behind
        why this approach guarantees fairness connects directly to concepts
        from{" "}
        <LinkedTerm
          href="/math/game-theory"
          nodeId="gametheory"
          variant="math"
        >
          mechanism design
        </LinkedTerm>
        .
      </p>
      <p>
        For a complementary approach to document tooling focused on capture and
        collaboration rather than security, see{" "}
        <LinkedTerm
          href="/projects/notepadio"
          variant="tech"
          title="NotePadIo"
          content="A low-code collaborative note-taking platform with real-time sync and event-sourced document model."
        >
          NotePadIo
        </LinkedTerm>
        .
      </p>
      <h2 id="related-concepts">Related Concepts</h2>
      <p>
        This project connects to several ideas explored elsewhere in this garden:
      </p>
      <ul>
        <li>
          <LinkedTerm
            href="/til"
            nodeId="til"
            variant="tech"
          >
            SHA-256 Deterministic Shuffle
          </LinkedTerm>{" "}
          — the core algorithm behind per-student question ordering
        </li>
        <li>
          <LinkedTerm
            href="/math/game-theory"
            nodeId="gametheory"
            variant="math"
          >
            Mechanism Design
          </LinkedTerm>{" "}
          — formal frameworks for designing tamper-resistant systems
        </li>
        <li>
          <LinkedTerm
            href="/community/tba"
            nodeId="tba"
            variant="default"
          >
            Turkish Informatics Association
          </LinkedTerm>{" "}
          — where the problem space was first identified
        </li>
      </ul>
    </ArticlePage>
  );
}
