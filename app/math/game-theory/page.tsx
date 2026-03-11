import ArticlePage from "@/components/ArticlePage";

export default function GameTheoryPage() {
  return (
    <ArticlePage
      crumbs={[
        { label: "Home", href: "/" },
        { label: "Mathematics", href: "/math" },
        { label: "Game Theory — Ali Nesin" },
      ]}
      title="Game Theory at Ali Nesin Mathematics Village"
      date="Summer 2025"
      tags={[
        { label: "gametheory", variant: "math" },
        { label: "nesin", variant: "math" },
        { label: "combinatorics", variant: "math" },
      ]}
      tocItems={[
        { id: "about-village", label: "About the Village", level: 2 },
        { id: "curriculum", label: "Curriculum", level: 2 },
        { id: "key-concepts", label: "Key Concepts", level: 2 },
        { id: "takeaways", label: "Takeaways", level: 2 },
      ]}
    >
      <h2 id="about-village">About Ali Nesin Mathematics Village</h2>
      <p>
        Matematik Köyü (Mathematics Village) is an internationally recognized
        mathematics research and education center located in Şirince, İzmir. Founded
        by mathematician Ali Nesin, it hosts intensive workshops, summer schools, and
        research seminars for students and researchers from around the world.
      </p>

      <h2 id="curriculum">Curriculum</h2>
      <p>
        I attended the Game Theory training program as part of the{" "}
        <strong>Mathematics and Technology Club</strong>. The program combined
        classical game-theoretic frameworks with computational approaches — bridging
        pure mathematics and software engineering.
      </p>
      <ul>
        <li>Normal form games and Nash equilibrium</li>
        <li>Extensive form games and backward induction</li>
        <li>Zero-sum games and minimax theorem</li>
        <li>Cooperative game theory — Shapley value</li>
        <li>Mechanism design fundamentals</li>
      </ul>

      <h2 id="key-concepts">Key Concepts</h2>
      <p>
        The minimax theorem — the cornerstone of zero-sum game theory — asserts
        that in any finite two-player zero-sum game, the maximum of the minimums
        equals the minimum of the maximums. This duality underpins everything from
        chess engines to auction design.
      </p>
      <p>
        The Shapley value provides a principled way to distribute payoffs in
        cooperative games based on each player&apos;s marginal contribution across
        all possible coalitions — with direct applications in cost-sharing,
        voting power analysis, and ML feature attribution.
      </p>

      <h2 id="takeaways">Takeaways</h2>
      <p>
        The most enduring insight from the program was that game theory is not about
        games — it is a language for reasoning about strategic interaction under
        constraints. It sharpened my ability to model adversarial systems, which
        directly informs how I think about security and algorithm design.
      </p>
    </ArticlePage>
  );
}
