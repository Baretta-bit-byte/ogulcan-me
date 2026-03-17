export type NodeType = "tech" | "math" | "personal" | "root";
export type Maturity = "seedling" | "sapling" | "evergreen";

export interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  url?: string;
  description?: string;
  maturity?: Maturity;
}

export interface GraphLink {
  source: string;
  target: string;
}

export const graphNodes: GraphNode[] = [
  { id: "home", label: "Home", type: "root", url: "/", maturity: "evergreen" },
  { id: "projects", label: "Projects", type: "tech", url: "/projects", maturity: "evergreen" },
  { id: "secureexam", label: "SecureExam", type: "tech", url: "/projects/secureexam-generator", description: "Tamper-proof exam generation", maturity: "sapling" },
  { id: "notepadio", label: "NotePadIo", type: "tech", url: "/projects/notepadio", description: "Low-code collaborative notes", maturity: "seedling" },
  { id: "math", label: "Mathematics", type: "math", url: "/math", maturity: "evergreen" },
  { id: "gametheory", label: "Game Theory", type: "math", url: "/math/game-theory", description: "Ali Nesin Mathematics Village", maturity: "sapling" },
  { id: "izmir", label: "Math Festival", type: "math", url: "/math/izmir-festival", description: "Izmir Mathematics Festival", maturity: "evergreen" },
  { id: "community", label: "Community", type: "personal", url: "/community", maturity: "evergreen" },
  { id: "tba", label: "TBA", type: "personal", url: "/community/tba", description: "Turkish Informatics Association", maturity: "sapling" },
  { id: "volunteering", label: "Volunteering", type: "personal", url: "/community/volunteering", description: "AFAD & LÖSEV", maturity: "seedling" },
  { id: "github",  label: "GitHub",  type: "tech", url: "/github",  description: "Repos, contributions, and pull requests", maturity: "evergreen" },
  { id: "spotify", label: "Spotify", type: "personal", url: "/spotify", description: "Top tracks over the last 4 weeks", maturity: "sapling" },
  { id: "books",   label: "Books",   type: "personal", url: "/books",   description: "The last 12 books I read and finished", maturity: "sapling" },
  { id: "vinyl",   label: "Vinyl",   type: "personal", url: "/vinyl",   description: "My owned vinyl records from Discogs", maturity: "seedling" },
  { id: "now", label: "/now", type: "personal", url: "/now", description: "What I am doing right now", maturity: "evergreen" },
  { id: "topics", label: "Maps of Content", type: "root", url: "/topics", description: "Directory of all notes" },
  { id: "uses", label: "/uses", type: "tech", url: "/uses", description: "Developer environment & gear", maturity: "evergreen" },
  { id: "posts", label: "Blog", type: "root", url: "/posts", description: "Polished essays" },
  { id: "flickr", label: "Photography", type: "personal", url: "/flickr", description: "Photo gallery" },
  { id: "steam", label: "Gaming", type: "personal", url: "/steam", description: "Steam activity" },
  { id: "til", label: "TIL", type: "tech", url: "/til", description: "Today I Learned — micro-notes", maturity: "seedling" },
  { id: "stats", label: "/stats", type: "tech", url: "/stats", description: "Site metrics and analytics", maturity: "seedling" },
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
  { source: "home", target: "github" },
  { source: "home", target: "spotify" },
  { source: "home", target: "books" },
  { source: "home", target: "vinyl" },
  { source: "home", target: "now" },
  // Cross-links — what makes this a graph, not a tree
  { source: "secureexam", target: "notepadio" },   // sibling projects
  { source: "gametheory", target: "izmir" },        // both math events
  { source: "tba", target: "volunteering" },        // sibling community
  { source: "secureexam", target: "tba" },          // project tied to informatics community
  { source: "home", target: "topics" },
  { source: "home", target: "uses" },
  { source: "home", target: "posts" },
  { source: "home", target: "flickr" },
  { source: "home", target: "steam" },
  { source: "home", target: "til" },
  { source: "posts", target: "til" },           // blog and TIL are siblings
  { source: "home", target: "stats" },
];
