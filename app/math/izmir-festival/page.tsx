import ArticlePage from "@/components/ArticlePage";
import LinkedTerm from "@/components/LinkedTerm";

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
        { label: "volunteer", variant: "default" },
      ]}
      tocItems={[
        { id: "about", label: "About the Festival", level: 2 },
        { id: "format", label: "Format & Events", level: 2 },
        { id: "involvement", label: "My Involvement", level: 2 },
        { id: "reflection", label: "Reflection", level: 2 },
      ]}
    >
      <h2 id="about">About the Festival</h2>
      <p>
        The Izmir Mathematics Festival is an annual regional event celebrating
        mathematical thinking for K–12 students and university undergraduates.
        It is one of the few public mathematics events in the region that
        deliberately blends competition mathematics with accessible, curiosity-driven
        content — making it equally appealing to olympiad competitors and students
        who have never entered a competition.
      </p>
      <p>
        The festival draws participants from schools across İzmir and surrounding
        provinces. It is organized by a consortium of universities, mathematics
        educators, and student clubs, with volunteer coordinators handling most
        of the operational work on the day.
      </p>

      <h2 id="format">Format &amp; Events</h2>
      <p>
        The festival runs across a full day and is divided into parallel tracks:
      </p>
      <ul>
        <li>
          <strong>Competition rounds</strong> — individual and team problem-solving
          rounds covering combinatorics, number theory, algebra, and geometry.
          Problems are tiered by difficulty and age group. Speed rounds use
          buzzer-format answer submission; the main round is written.
        </li>
        <li>
          <strong>Puzzle relay</strong> — teams of four work through a chain of
          interconnected puzzles where the answer to one unlocks the next. Designed
          to reward collaborative thinking over raw computation.
        </li>
        <li>
          <strong>Workshops</strong> — hands-on sessions covering topics like
          mathematical origami, graph theory puzzles, and recreational logic.
          These are deliberately non-competitive and aimed at reducing the anxiety
          students associate with mathematics.
        </li>
        <li>
          <strong>Invited talks</strong> — short lectures by researchers and
          educators on topics chosen for their accessibility: the mathematics of
          voting, infinity, randomness, and computational thinking.
        </li>
      </ul>

      <h2 id="involvement">My Involvement</h2>
      <p>
        I participated as a volunteer organizer with a specific focus on the
        competition infrastructure. My responsibilities included:
      </p>
      <ul>
        <li>
          <strong>Problem set coordination</strong> — collating and formatting
          competition problems from contributing educators, checking for
          consistency in notation and difficulty calibration across age groups
        </li>
        <li>
          <strong>Workshop facilitation</strong> — running a graph theory puzzle
          station during the workshop track, introducing concepts through
          hands-on coloring and path problems rather than formal definitions
        </li>
        <li>
          <strong>Puzzle relay logistics</strong> — managing the physical handoff
          of puzzle packets between teams, tracking completion times, and
          verifying answers in real time during the relay rounds
        </li>
        <li>
          <strong>Participant mentorship</strong> — supporting students during
          the non-competitive sessions, particularly those who had self-selected
          away from the competition track
        </li>
      </ul>
      <p>
        This was my first large-scale experience bridging mathematics and community
        organizing — the logistics of running a live event for hundreds of
        participants under time pressure is a distinct skill set from mathematics
        itself.
      </p>

      <h2 id="reflection">Reflection</h2>
      <p>
        What struck me most was how effective well-designed puzzles are at
        reaching students who have already decided they &quot;don&apos;t like
        math.&quot; The puzzle relay sessions, in particular, consistently drew
        in students who had avoided the competition tracks — because the format
        made collaboration the primary mode and individual performance secondary.
      </p>
      <p>
        The festival reaffirmed a conviction I hold strongly: the barrier to
        mathematics is almost never ability — it is almost always presentation
        and context. A student who avoids algebra worksheets will spend forty
        minutes trying to solve a graph coloring puzzle without prompting.
      </p>
      <p>
        This experience sits alongside the more formal side of mathematical
        training I pursued through{" "}
        <LinkedTerm
          href="/math/game-theory"
          variant="math"
          title="Game Theory — Ali Nesin"
          content="An intensive training program at Ali Nesin Mathematics Village covering Nash equilibria, minimax theorem, Shapley value, and mechanism design."
        >
          Game Theory at Ali Nesin Mathematics Village
        </LinkedTerm>
        {" "}— two very different contexts united by the same belief that
        mathematics is worth making accessible.
      </p>
    </ArticlePage>
  );
}
