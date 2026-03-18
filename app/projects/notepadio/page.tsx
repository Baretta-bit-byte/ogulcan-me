import ArticlePage from "@/components/ArticlePage";
import LinkedTerm from "@/components/LinkedTerm";

export default function NotePadIoPage() {
  return (
    <ArticlePage
      nodeId="notepadio"
      crumbs={[
        { label: "Home", href: "/" },
        { label: "Projects", href: "/projects" },
        { label: "NotePadIo" },
      ]}
      title="NotePadIo"
      date="2025"
      tags={[
        { label: "lowcode", variant: "tech" },
        { label: "collaboration", variant: "tech" },
        { label: "architecture", variant: "tech" },
        { label: "real-time", variant: "tech" },
      ]}
      tocItems={[
        { id: "overview", label: "Overview", level: 2 },
        { id: "problem", label: "The Problem", level: 2 },
        { id: "architecture", label: "Architecture", level: 2 },
        { id: "sync-model", label: "Sync Model", level: 2 },
        { id: "tech-stack", label: "Tech Stack", level: 2 },
        { id: "design-decisions", label: "Design Decisions", level: 2 },
      ]}
    >
      <h2 id="overview">Overview</h2>
      <p>
        NotePadIo is a low-code collaborative note-taking platform designed around
        frictionless capture and real-time editing. The core thesis: structured
        notes should be as fast to start as a blank text file, and as easy to
        share as a link. Every architectural decision flows from that constraint.
      </p>

      <h2 id="problem">The Problem</h2>
      <p>
        Most note-taking tools make you choose between speed and structure. Plain
        text files are fast but unstructured. Rich editors (Notion, Confluence)
        are structured but slow to start — they front-load decisions about
        document type, workspace, permissions. NotePadIo eliminates that
        front-loading: you start typing immediately, and structure is applied
        incrementally via drag-and-drop content blocks.
      </p>
      <p>
        Collaboration is a first-class concern, not an add-on. Two people editing
        the same note simultaneously should see each other&apos;s changes in
        under 100ms, with no conflicts visible to the user.
      </p>

      <h2 id="architecture">Architecture</h2>
      <p>
        The system separates the editing surface from the storage layer via an
        event-sourced document model. A document is not a blob of text — it is
        an ordered log of discrete operations: <code>insert</code>,{" "}
        <code>delete</code>, <code>move-block</code>, <code>set-property</code>.
        The current document state is always the deterministic result of replaying
        that log from the beginning.
      </p>
      <ul>
        <li>
          <strong>Block editor</strong> — the UI is a vertically stacked list of
          typed blocks (paragraph, heading, code, checklist, image). Blocks are
          reordered via drag-and-drop; type is changed inline with a{" "}
          <code>/command</code> menu.
        </li>
        <li>
          <strong>Event log</strong> — every edit appends an immutable operation
          record with a logical timestamp and author ID. This gives full revision
          history without any additional bookkeeping.
        </li>
        <li>
          <strong>Derived views</strong> — the rendered document, word count,
          block index, and diff view are all derived from the same event log,
          ensuring a single source of truth.
        </li>
        <li>
          <strong>Markdown export</strong> — blocks serialize to CommonMark with
          YAML front-matter metadata (title, tags, created, last-modified).
        </li>
      </ul>

      <h2 id="sync-model">Sync Model</h2>
      <p>
        Real-time collaboration is built on a WebSocket pub/sub channel per
        document. When a client applies an operation locally (optimistic update),
        it immediately broadcasts that operation to the server, which fans it out
        to all other connected clients.
      </p>
      <p>
        Conflict resolution follows a CRDT-inspired approach: operations carry
        logical timestamps derived from a Lamport clock, so concurrent edits on
        different clients can be deterministically merged regardless of arrival
        order. The mathematical guarantee here echoes the kind of formal reasoning
        I explored in{" "}
        <LinkedTerm
          href="/math/game-theory"
          nodeId="gametheory"
          variant="math"
        >
          Game Theory training
        </LinkedTerm>
        {" "}— both rely on proving that a well-defined set of rules produces
        deterministic, fair outcomes regardless of agent ordering.
        The user never sees a conflict dialog — the merge is automatic and
        the result is mathematically consistent across all clients.
        This pattern is explored in depth in my{" "}
        <LinkedTerm
          href="/til"
          nodeId="til"
          variant="tech"
        >
          garden note on CRDT Lamport clocks
        </LinkedTerm>
        .
      </p>
      <p>
        Offline support works via the same mechanism: while disconnected, the
        client accumulates a local operation queue. On reconnect, the queue is
        replayed against the server log, and any divergence is resolved with the
        same Lamport-clock merge. Eventual consistency is guaranteed by the
        commutativity of the operation algebra.
      </p>

      <h2 id="tech-stack">Tech Stack</h2>
      <p>
        The platform is built with a deliberately minimal set of dependencies to
        keep the architecture auditable. Source code is on{" "}
        <LinkedTerm
          href="/github"
          nodeId="github"
          variant="tech"
        >
          GitHub
        </LinkedTerm>
        , and the full development setup is documented in{" "}
        <LinkedTerm
          href="/uses"
          nodeId="uses"
          variant="tech"
        >
          /uses
        </LinkedTerm>
        :
      </p>
      <ul>
        <li>
          <strong>Editor surface</strong> — low-code block editor built on a
          headless framework, extended with custom block types
        </li>
        <li>
          <strong>Real-time layer</strong> — WebSocket server with per-document
          rooms and operation fan-out
        </li>
        <li>
          <strong>Storage</strong> — append-only operation log persisted to a
          document store; snapshots written periodically to bound replay time
        </li>
        <li>
          <strong>Export</strong> — server-side Markdown serializer with
          CommonMark compliance and front-matter injection
        </li>
      </ul>

      <h2 id="design-decisions">Design Decisions</h2>
      <p>
        Choosing a low-code block editor over building a custom rich-text engine
        from scratch eliminated roughly 60% of the implementation surface while
        covering 95% of the intended use cases. The trade-off is less fine-grained
        control over typography — acceptable here because content takes clear
        priority over presentation in a note-taking context.
      </p>
      <p>
        Event sourcing over a mutable document model was a deliberate choice made
        early. It costs more upfront in design complexity but pays back
        compounding returns: revision history, offline sync, conflict resolution,
        and audit logging all become natural byproducts rather than features that
        need to be engineered separately. I documented the core insight in a{" "}
        <LinkedTerm
          href="/til"
          nodeId="til"
          variant="tech"
        >
          garden note on event sourcing replay
        </LinkedTerm>
        .
      </p>
      <p>
        Where NotePadIo prioritizes fluid capture and collaboration,{" "}
        <LinkedTerm
          href="/projects/secureexam-generator"
          variant="tech"
          title="SecureExam-Generator"
          content="A Python tool for generating tamper-proof exam papers with QR codes and cryptographic watermarks — the harder-edged sibling project."
        >
          SecureExam-Generator
        </LinkedTerm>{" "}
        sits at the opposite end of the same spectrum: rigid, verifiable, and
        intentionally hostile to modification. Both projects address trust in
        document workflows from opposite directions.
      </p>
    </ArticlePage>
  );
}
