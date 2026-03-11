import ArticlePage from "@/components/ArticlePage";

export default function NotePadNeoPage() {
  return (
    <ArticlePage
      crumbs={[
        { label: "Home", href: "/" },
        { label: "Projects", href: "/projects" },
      { label: "NotePadNeo" },
      ]}
      title="NotePadNeo"
      date="2025"
      tags={[
        { label: "lowcode", variant: "tech" },
        { label: "collaboration", variant: "tech" },
        { label: "architecture", variant: "tech" },
      ]}
      tocItems={[
        { id: "overview", label: "Overview", level: 2 },
        { id: "architecture", label: "Architecture", level: 2 },
        { id: "design-decisions", label: "Design Decisions", level: 2 },
      ]}
    >
      <h2 id="overview">Overview</h2>
      <p>
        NotePadNeo is a low-code note-taking platform designed around collaborative
        editing and frictionless capture. The goal was to reduce the barrier to
        structured thinking — making it as fast to write a structured note as it
        is to open a blank text file.
      </p>

      <h2 id="architecture">Architecture</h2>
      <p>
        The architecture separates the editing surface from the storage layer via
        an event-sourced model. Every keystroke is recorded as a discrete event,
        enabling real-time collaborative sync, full revision history, and offline
        support with eventual consistency on reconnect.
      </p>
      <ul>
        <li>Event-sourced document model (CRDT-inspired)</li>
        <li>Low-code block editor — drag-and-drop content blocks</li>
        <li>Real-time sync via WebSocket pub/sub</li>
        <li>Markdown export with front-matter metadata</li>
      </ul>

      <h2 id="design-decisions">Design Decisions</h2>
      <p>
        Choosing a low-code approach over a full custom editor reduced implementation
        complexity by ~60% while covering 95% of the intended use cases. The trade-off
        is less fine-grained control over typography — an acceptable constraint for a
        note-taking context where content takes priority over presentation.
      </p>
    </ArticlePage>
  );
}
