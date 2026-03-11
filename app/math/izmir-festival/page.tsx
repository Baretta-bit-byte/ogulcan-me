import ArticlePage from "@/components/ArticlePage";

export default function IzmirFestivalPage() {
  return (
    <ArticlePage
      crumbs={[
        { label: "Home", href: "/" },
        { label: "Mathematics", href: "/math" },
        { label: "Izmir Mathematics Festival" },
      ]}
      title="Izmir Mathematics Festival"
      date="2025"
      tags={[
        { label: "festival", variant: "math" },
        { label: "olympiad", variant: "math" },
        { label: "community", variant: "default" },
      ]}
      tocItems={[
        { id: "about", label: "About the Festival", level: 2 },
        { id: "involvement", label: "My Involvement", level: 2 },
        { id: "reflection", label: "Reflection", level: 2 },
      ]}
    >
      <h2 id="about">About the Festival</h2>
      <p>
        The Izmir Mathematics Festival is a regional celebration of mathematical
        thinking aimed at K–12 students and university undergraduates. It combines
        competition mathematics, puzzle workshops, and lectures by researchers —
        making advanced mathematics accessible and exciting for young minds.
      </p>
      <p>
        The festival covers topics from combinatorics and number theory to
        mathematical logic and recreational mathematics, with an emphasis on
        problem-solving intuition over rote computation.
      </p>

      <h2 id="involvement">My Involvement</h2>
      <p>
        I participated as a volunteer organizer, helping coordinate workshop
        sessions, manage problem sets for the competition rounds, and mentor
        participants during the puzzle relay events. This was my first large-scale
        experience bridging mathematics and community organizing.
      </p>

      <h2 id="reflection">Reflection</h2>
      <p>
        What struck me most was how effective well-designed mathematical puzzles
        are at teaching patience and structured thinking to students who &quot;don&apos;t
        like math.&quot; The festival reaffirmed my belief that the barrier to
        mathematics is rarely ability — it is almost always presentation.
      </p>
    </ArticlePage>
  );
}
