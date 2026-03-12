export type NodeType = "tech" | "math" | "personal" | "root";

export interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  url?: string;
  description?: string;
}

export interface GraphLink {
  source: string;
  target: string;
}

export const graphNodes: GraphNode[] = [
  { id: "home", label: "Home", type: "root", url: "/" },
  { id: "projects", label: "Projects", type: "tech", url: "/projects" },
  { id: "secureexam", label: "SecureExam", type: "tech", url: "/projects/secureexam-generator", description: "Tamper-proof exam generation" },
  { id: "notepadio", label: "NotePadIo", type: "tech", url: "/projects/notepadio", description: "Low-code collaborative notes" },
  { id: "math", label: "Mathematics", type: "math", url: "/math" },
  { id: "gametheory", label: "Game Theory", type: "math", url: "/math/game-theory", description: "Ali Nesin Mathematics Village" },
  { id: "izmir", label: "Math Festival", type: "math", url: "/math/izmir-festival", description: "Izmir Mathematics Festival" },
  { id: "community", label: "Community", type: "personal", url: "/community" },
  { id: "tba", label: "TBA", type: "personal", url: "/community/tba", description: "Turkish Informatics Association" },
  { id: "volunteering", label: "Volunteering", type: "personal", url: "/community/volunteering", description: "AFAD & LÖSEV" },
];

export const graphLinks: GraphLink[] = [
  // Tree spine
  { source: "home", target: "projects" },
  { source: "home", target: "math" },
  { source: "home", target: "community" },
  { source: "projects", target: "secureexam" },
  { source: "projects", target: "notepadio" },
  { source: "math", target: "gametheory" },
  { source: "math", target: "izmir" },
  { source: "community", target: "tba" },
  { source: "community", target: "volunteering" },
  // Cross-links — what makes this a graph, not a tree
  { source: "secureexam", target: "notepadio" },   // sibling projects
  { source: "gametheory", target: "izmir" },        // both math events
  { source: "tba", target: "volunteering" },        // sibling community
  { source: "secureexam", target: "tba" },          // project tied to informatics community
];
