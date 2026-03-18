export type NodeType = "tech" | "math" | "personal" | "root";
export type Maturity = "seedling" | "sapling" | "evergreen";

export interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  url?: string;
  description?: string;
  maturity?: Maturity;
  lastTended?: string; // ISO date — when the page was last meaningfully updated
}

export interface GraphLink {
  source: string;
  target: string;
}

export const graphNodes: GraphNode[] = [
  { id: "home", label: "Home", type: "root", url: "/", maturity: "evergreen", lastTended: "2026-03-18" },
  { id: "projects", label: "Projects", type: "tech", url: "/projects", maturity: "evergreen", lastTended: "2026-03-18" },
  { id: "secureexam", label: "SecureExam", type: "tech", url: "/projects/secureexam-generator", description: "Tamper-proof exam generation with SHA-256 QR codes and filigree watermarks", maturity: "sapling", lastTended: "2026-03-18" },
  { id: "notepadio", label: "NotePadIo", type: "tech", url: "/projects/notepadio", description: "Low-code collaborative notes with CRDT sync and event-sourced architecture", maturity: "seedling", lastTended: "2026-03-18" },
  { id: "math", label: "Mathematics", type: "math", url: "/math", maturity: "evergreen", lastTended: "2026-03-15" },
  { id: "gametheory", label: "Game Theory", type: "math", url: "/math/game-theory", description: "Nash equilibria, minimax, Shapley value — Ali Nesin Mathematics Village", maturity: "sapling", lastTended: "2026-03-10" },
  { id: "izmir", label: "Math Festival", type: "math", url: "/math/izmir-festival", description: "Izmir Mathematics Festival — olympiad rounds and research lectures", maturity: "evergreen", lastTended: "2026-03-05" },
  { id: "community", label: "Community", type: "personal", url: "/community", maturity: "evergreen", lastTended: "2026-03-15" },
  { id: "tba", label: "TBA", type: "personal", url: "/community/tba", description: "Turkish Informatics Association — CS education and digital literacy since 1971", maturity: "sapling", lastTended: "2026-03-12" },
  { id: "volunteering", label: "Volunteering", type: "personal", url: "/community/volunteering", description: "AFAD & LÖSEV — disaster relief and childhood leukemia foundation", maturity: "seedling", lastTended: "2026-03-12" },
  { id: "github",  label: "GitHub",  type: "tech", url: "/github",  description: "Repos, contributions, and pull requests", maturity: "evergreen", lastTended: "2026-03-18" },
  { id: "spotify", label: "Spotify", type: "personal", url: "/spotify", description: "Top tracks over the last 4 weeks", maturity: "sapling", lastTended: "2026-03-18" },
  { id: "books",   label: "Books",   type: "personal", url: "/books",   description: "The last 12 books I read and finished", maturity: "sapling", lastTended: "2026-03-14" },
  { id: "vinyl",   label: "Vinyl",   type: "personal", url: "/vinyl",   description: "My owned vinyl records from Discogs", maturity: "seedling", lastTended: "2026-03-10" },
  { id: "now", label: "/now", type: "personal", url: "/now", description: "What I am doing right now", maturity: "evergreen", lastTended: "2026-03-18" },
  { id: "topics", label: "Maps of Content", type: "root", url: "/topics", description: "Directory of all notes", lastTended: "2026-03-18" },
  { id: "uses", label: "/uses", type: "tech", url: "/uses", description: "Developer environment & gear", maturity: "evergreen", lastTended: "2026-03-16" },
  { id: "posts", label: "Blog", type: "root", url: "/posts", description: "Polished essays", lastTended: "2026-03-17" },
  { id: "flickr", label: "Photography", type: "personal", url: "/flickr", description: "Photo gallery from Flickr", maturity: "sapling", lastTended: "2026-03-17" },
  { id: "steam", label: "Gaming", type: "personal", url: "/steam", description: "Steam library and recent activity", maturity: "sapling", lastTended: "2026-03-17" },
  { id: "til", label: "TIL", type: "tech", url: "/til", description: "Today I Learned — micro-notes", maturity: "seedling", lastTended: "2026-03-17" },
  { id: "stats", label: "/stats", type: "tech", url: "/stats", description: "Site metrics and analytics", maturity: "seedling", lastTended: "2026-03-18" },
  { id: "about", label: "/about", type: "personal", url: "/about", description: "Narrative biography, timeline, and projects", maturity: "evergreen", lastTended: "2026-03-18" },
  { id: "tags", label: "Tags", type: "tech", url: "/tags", description: "Browse all content by tag", maturity: "seedling", lastTended: "2026-03-16" },
  { id: "bookmarks", label: "/bookmarks", type: "personal", url: "/bookmarks", description: "YouTube channels, daily puzzles, curated resources", maturity: "seedling", lastTended: "2026-03-15" },
  { id: "changelog", label: "/changelog", type: "tech", url: "/changelog", description: "Site version history", maturity: "evergreen", lastTended: "2026-03-18" },
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
  { source: "secureexam", target: "github" },       // source code lives on GitHub
  { source: "notepadio", target: "github" },        // source code lives on GitHub
  { source: "secureexam", target: "uses" },         // built with tools documented in /uses
  { source: "notepadio", target: "uses" },          // built with tools documented in /uses
  { source: "notepadio", target: "gametheory" },    // mechanism design parallels
  { source: "about", target: "projects" },          // biography references projects
  { source: "about", target: "now" },               // about links to current status
  { source: "about", target: "community" },         // about references community work
  { source: "now", target: "spotify" },             // /now shows live Spotify data
  { source: "now", target: "books" },               // /now shows last book
  { source: "now", target: "github" },              // /now shows active repos
  { source: "home", target: "topics" },
  { source: "home", target: "uses" },
  { source: "home", target: "posts" },
  { source: "home", target: "flickr" },
  { source: "home", target: "steam" },
  { source: "home", target: "til" },
  { source: "posts", target: "til" },           // blog and TIL are siblings
  { source: "home", target: "stats" },
  { source: "home", target: "about" },
  { source: "posts", target: "tags" },
  { source: "til", target: "tags" },
  { source: "home", target: "bookmarks" },
  { source: "home", target: "changelog" },
  { source: "stats", target: "changelog" },
];
