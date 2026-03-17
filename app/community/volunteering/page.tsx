import ArticlePage from "@/components/ArticlePage";
import LinkedTerm from "@/components/LinkedTerm";

export default function VolunteeringPage() {
  return (
    <ArticlePage
      nodeId="volunteering"
      crumbs={[
        { label: "Home", href: "/" },
        { label: "Community", href: "/community" },
        { label: "AFAD & LÖSEV Volunteering" },
      ]}
      title="Volunteering — AFAD & LÖSEV"
      date="March 2026–present"
      tags={[
        { label: "volunteering", variant: "default" },
        { label: "social", variant: "default" },
        { label: "community", variant: "default" },
      ]}
      tocItems={[
        { id: "afad", label: "AFAD", level: 2 },
        { id: "losev", label: "LÖSEV", level: 2 },
        { id: "why", label: "Why I Volunteer", level: 2 },
      ]}
    >
      <h2 id="afad">AFAD — Disaster & Emergency Management</h2>
      <p>
        AFAD (Afet ve Acil Durum Yönetimi Başkanlığı) is Turkey&apos;s national
        disaster and emergency management authority. Volunteers support AFAD in
        preparedness training, community awareness campaigns, and logistics
        coordination during emergency response operations.
      </p>
      <p>
        My involvement began in March 2026. Volunteering with AFAD has given me
        direct experience in coordinating under pressure and working within
        structured, high-stakes organizations — skills that translate directly into
        engineering team environments.
      </p>

      <h2 id="losev">LÖSEV — Foundation for Children with Leukemia</h2>
      <p>
        LÖSEV (Lösemili Çocuklar Vakfı) provides social, psychological, and
        financial support to children with leukemia and their families across
        Turkey. Volunteers assist with awareness events, fundraising campaigns,
        and direct family support programs.
      </p>
      <p>
        Contributing to LÖSEV is a reminder that technology and community work are
        not separate domains — the same organizational and communication skills
        that make a good engineer make a good volunteer.
      </p>

      <h2 id="why">Why I Volunteer</h2>
      <p>
        I volunteer because building useful things should not stop at software.
        Both AFAD and LÖSEV address problems at a scale and urgency that no single
        technology can solve — they require coordinated human effort. Being part of
        that effort keeps my sense of purpose grounded. The same instinct drives my
        membership in the{" "}
        <LinkedTerm
          href="/community/tba"
          variant="tech"
          title="Turkish Informatics Association"
          content="A national non-profit promoting CS education and digital literacy in Turkey since 1971. Active membership, not just affiliation."
        >
          Turkish Informatics Association
        </LinkedTerm>
        {" "}— both are about showing up consistently, not just when it is convenient.
      </p>
    </ArticlePage>
  );
}
