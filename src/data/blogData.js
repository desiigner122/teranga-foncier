// DEPRECATED MODULE
// This file previously contained static sample blog posts. All blog content must now
// be loaded from Supabase (`blog_posts` table) via `SupabaseDataService.getBlogPosts`.
// Intentionally throwing to surface any lingering imports quickly.
const blogData = () => {
    throw new Error('DEPRECATED: src/data/blogData.js was removed. Use SupabaseDataService.getBlogPosts().');
}

export default blogData;
