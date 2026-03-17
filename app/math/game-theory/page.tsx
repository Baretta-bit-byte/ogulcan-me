import ArticlePage from "@/components/ArticlePage";
import LinkedTerm from "@/components/LinkedTerm";
import HoverTooltip from "@/components/HoverTooltip";

export default function GameTheoryPage() {
  return (
    <ArticlePage
      nodeId="gametheory"
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
        { id: "worked-example", label: "Worked Example", level: 2 },
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
        pure mathematics and software engineering. The club also participated in the{" "}
        <LinkedTerm
          href="/math/izmir-festival"
          variant="math"
          title="Izmir Mathematics Festival"
          content="A regional celebration of mathematical thinking for K–12 students and undergraduates, combining olympiad competitions, puzzle workshops, and research lectures."
        >
          Izmir Mathematics Festival
        </LinkedTerm>
        {" "}that same season.
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
        The{" "}
        <HoverTooltip
          variant="math"
          label="minimax theorem"
          content="In any finite two-player zero-sum game, max(min) = min(max) — the value you can guarantee by maximizing your minimum gain equals the value your opponent can guarantee by minimizing your maximum gain."
        >
          minimax theorem
        </HoverTooltip>
        {" "}— the cornerstone of zero-sum game theory — asserts
        that in any finite two-player zero-sum game, the maximum of the minimums
        equals the minimum of the maximums. This duality underpins everything from
        chess engines to auction design.
      </p>
      <p>
        The{" "}
        <HoverTooltip
          variant="math"
          label="Shapley value"
          content="A cooperative game theory concept that fairly distributes payoffs based on each player's average marginal contribution across all possible coalition orderings. Used in cost-sharing, voting analysis, and ML feature attribution."
        >
          Shapley value
        </HoverTooltip>
        {" "}provides a principled way to distribute payoffs in
        cooperative games based on each player&apos;s marginal contribution across
        all possible coalitions — with direct applications in cost-sharing,
        voting power analysis, and ML feature attribution.
      </p>

      <h2 id="worked-example">Worked Example — Prisoner&apos;s Dilemma</h2>
      <p>
        The canonical illustration of Nash equilibrium. Two suspects are
        interrogated separately. Each can either <strong>cooperate</strong> (stay
        silent) or <strong>defect</strong> (testify against the other). The
        payoff matrix, in years of prison time avoided:
      </p>
      <pre><code>{`               B: Cooperate   B: Defect
A: Cooperate      (3, 3)        (0, 5)
A: Defect         (5, 0)        (1, 1)`}</code></pre>
      <p>
        Reading the matrix: if both cooperate, both avoid 3 years. If A defects
        while B cooperates, A avoids 5 years and B avoids none.
      </p>
      <p>
        The Nash equilibrium is <strong>(Defect, Defect)</strong> — not because
        it is the best collective outcome, but because it is the only strategy
        profile where neither player can improve their outcome by unilaterally
        switching. If A is defecting, B&apos;s best response is also to defect
        (1 &gt; 0). If B is defecting, A&apos;s best response is to defect
        (1 &gt; 0). The equilibrium is stable even though (Cooperate, Cooperate)
        gives both players a better result — a result known as a{" "}
        <strong>Pareto-superior outcome</strong> that is unreachable without
        binding coordination.
      </p>
      <p>
        This tension — individual rationality producing collectively suboptimal
        outcomes — is the central insight game theory exports to fields from
        economics to security protocol design.
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
