import { getAllPosts } from "@/lib/posts";

export const dynamic = "force-static";

export async function GET() {
  const posts = getAllPosts();
  const siteUrl = "https://ogulcantokmak.me";

  const items = posts
    .map((post) => {
      const url = `${siteUrl}/posts/${post.slug}`;
      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description><![CDATA[${post.description}]]></description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Ogulcan — Digital Garden</title>
    <link>${siteUrl}</link>
    <description>Writing and essays on software, mathematics, and ideas.</description>
    <language>en</language>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
