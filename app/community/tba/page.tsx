import ArticlePage from "@/components/ArticlePage";

export default function TBAPage() {
  return (
    <ArticlePage
      crumbs={[
        { label: "Home", href: "/" },
        { label: "Community", href: "/community" },
        { label: "Turkish Informatics Association" },
      ]}
      title="Turkish Informatics Association"
      date="2024–present"
      tags={[
        { label: "tech", variant: "tech" },
        { label: "education", variant: "tech" },
        { label: "community", variant: "default" },
      ]}
      tocItems={[
        { id: "about", label: "About TBA", level: 2 },
        { id: "membership", label: "Active Membership", level: 2 },
        { id: "why", label: "Why It Matters", level: 2 },
      ]}
    >
      <h2 id="about">About TBA</h2>
      <p>
        The Turkish Informatics Association (Türkiye Bilişim Derneği — TBD) is a
        national non-profit organization that has been promoting computer science
        education, digital literacy, and technology policy in Turkey since 1971. It
        is one of the most established technical communities in the country,
        representing students, academics, and industry professionals.
      </p>

      <h2 id="membership">Active Membership</h2>
      <p>
        As an active member, I participate in local chapter events, workshops, and
        hackathons organized by TBA. Membership provides access to a network of
        engineers and researchers across industry and academia, and direct
        involvement in discussions around technology education curriculum and
        digital transformation policy.
      </p>
      <ul>
        <li>Participation in CS education working groups</li>
        <li>Access to industry mentor network</li>
        <li>Involvement in technology policy discussions</li>
        <li>Local chapter events and technical workshops</li>
      </ul>

      <h2 id="why">Why It Matters</h2>
      <p>
        Being part of TBA is a deliberate choice to stay connected to the broader
        Turkish tech ecosystem — beyond a single university or company. It grounds
        my technical work in a community context and gives me perspective on how
        technology education is evolving at a national scale.
      </p>
    </ArticlePage>
  );
}
