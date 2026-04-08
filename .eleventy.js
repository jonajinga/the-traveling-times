const pluginRss = require("@11ty/eleventy-plugin-rss");
const { DateTime } = require("luxon");

module.exports = function (eleventyConfig) {

  // ─── Plugins ────────────────────────────────────────────────────────────────
  eleventyConfig.addPlugin(pluginRss);

  // ─── Passthrough Copies ─────────────────────────────────────────────────────
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy({ "src/humans.txt": "humans.txt" });
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });
  eleventyConfig.addPassthroughCopy({ "src/_redirects": "_redirects" });

  // ─── Watch Targets ──────────────────────────────────────────────────────────
  eleventyConfig.addWatchTarget("src/assets/css/");
  eleventyConfig.addWatchTarget("src/assets/js/");

  // ─── Date Filters ───────────────────────────────────────────────────────────
  eleventyConfig.addFilter("readableDate", (dateObj) => {
    const dt = typeof dateObj === "string"
      ? DateTime.fromISO(dateObj, { zone: "utc" })
      : DateTime.fromJSDate(dateObj, { zone: "utc" });
    return dt.toFormat("LLLL d, yyyy");
  });

  eleventyConfig.addFilter("htmlDateString", (dateObj) => {
    const dt = typeof dateObj === "string"
      ? DateTime.fromISO(dateObj, { zone: "utc" })
      : DateTime.fromJSDate(dateObj, { zone: "utc" });
    return dt.toFormat("yyyy-LL-dd");
  });

  eleventyConfig.addFilter("shortDate", (dateObj) => {
    const dt = typeof dateObj === "string"
      ? DateTime.fromISO(dateObj, { zone: "utc" })
      : DateTime.fromJSDate(dateObj, { zone: "utc" });
    return dt.toFormat("LLL d");
  });

  eleventyConfig.addFilter("isoDate", (dateObj) => {
    const dt = typeof dateObj === "string"
      ? DateTime.fromISO(dateObj, { zone: "utc" })
      : DateTime.fromJSDate(dateObj, { zone: "utc" });
    return dt.toISO();
  });

  eleventyConfig.addFilter("readingTime", (content) => {
    const text = content.replace(/(<([^>]+)>)/gi, "");
    const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    const mins = Math.max(1, Math.ceil(words / 200));
    return `${mins} min read`;
  });

  eleventyConfig.addFilter("readingMins", (content) => {
    if (!content) return 1;
    const text = content.replace(/(<([^>]+)>)/gi, "");
    const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    return Math.max(1, Math.ceil(words / 200));
  });

  eleventyConfig.addFilter("wordCount", (content) => {
    if (!content) return '0';
    const text = content.replace(/(<([^>]+)>)/gi, "");
    const count = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    return count.toLocaleString('en-US');
  });

  eleventyConfig.addFilter("relatedByTags", (allContent, currentTags, currentUrl, limit = 3) => {
    const tags = (currentTags || []).filter(t => t !== "post" && t !== "all");
    if (!tags.length) return [];
    return allContent
      .filter(item => item.url !== currentUrl)
      .map(item => {
        const itemTags = (item.data.tags || []).filter(t => t !== "post" && t !== "all");
        const shared = itemTags.filter(t => tags.includes(t)).length;
        return { item, shared };
      })
      .filter(({ shared }) => shared > 0)
      .sort((a, b) => b.shared - a.shared)
      .slice(0, limit)
      .map(({ item }) => item);
  });

  // Group allContent into [{date, label, articles}] for archives
  eleventyConfig.addFilter("groupByDate", (allContent) => {
    const groups = {};
    allContent.forEach(item => {
      const dateStr = DateTime.fromJSDate(item.date, { zone: "utc" }).toFormat("yyyy-LL-dd");
      if (!groups[dateStr]) groups[dateStr] = { date: dateStr, articles: [] };
      groups[dateStr].articles.push(item);
    });
    return Object.values(groups).sort((a, b) => b.date.localeCompare(a.date));
  });

  // ─── String Filters ─────────────────────────────────────────────────────────
  eleventyConfig.addFilter("excerpt", (content, length = 160) => {
    const stripped = content.replace(/(<([^>]+)>)/gi, "");
    return stripped.length > length ? stripped.substring(0, length).trim() + "…" : stripped;
  });

  eleventyConfig.addFilter("slugify", (str) => {
    return (str || '').toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  });

  eleventyConfig.addFilter("limit", (arr, limit) => arr.slice(0, limit));

  eleventyConfig.addFilter("urlencode", (str) => encodeURIComponent(str || ""));

  eleventyConfig.addFilter("where", (arr, key, value) => {
    return arr.filter(item => item.data[key] === value);
  });

  // ─── Collections ─────────────────────────────────────────────────────────────
  const sections = ["travel", "poetry", "entertainment", "fashion", "art", "music", "dance"];

  // All content across every section, newest first
  eleventyConfig.addCollection("allContent", (collectionApi) => {
    return collectionApi
      .getFilteredByGlob("src/content/**/*.md")
      .filter(item => !item.data.draft)
      .sort((a, b) => b.date - a.date);
  });

  // Featured content for front page
  eleventyConfig.addCollection("featured", (collectionApi) => {
    return collectionApi
      .getFilteredByGlob("src/content/**/*.md")
      .filter(item => item.data.featured && !item.data.draft)
      .sort((a, b) => b.date - a.date);
  });

  // Per-section collections
  sections.forEach(section => {
    eleventyConfig.addCollection(section, (collectionApi) => {
      return collectionApi
        .getFilteredByGlob(`src/content/${section}/*.md`)
        .filter(item => !item.data.draft)
        .sort((a, b) => b.date - a.date);
    });
  });

  // All tags across all content (for tag pages)
  eleventyConfig.addCollection("tagList", (collectionApi) => {
    const tagSet = new Set();
    collectionApi.getFilteredByGlob("src/content/**/*.md").forEach(item => {
      (item.data.tags || []).forEach(tag => {
        if (!["post", "all"].includes(tag)) tagSet.add(tag);
      });
    });
    return [...tagSet].sort();
  });

  // Per-author collections
  eleventyConfig.addCollection("authorList", (collectionApi) => {
    const authorSet = new Set();
    collectionApi.getFilteredByGlob("src/content/**/*.md").forEach(item => {
      if (item.data.author) authorSet.add(item.data.author);
    });
    return [...authorSet].sort();
  });

  // ─── Shortcodes ──────────────────────────────────────────────────────────────

  // Pull quote
  eleventyConfig.addShortcode("pullquote", (quote, attribution = "") => {
    return `<blockquote class="pullquote">
      <p>${quote}</p>
      ${attribution ? `<cite>${attribution}</cite>` : ""}
    </blockquote>`;
  });

  // Section label badge
  eleventyConfig.addShortcode("sectionBadge", (section) => {
    return `<span class="section-badge section-badge--${section.toLowerCase().replace(/\s+/g, "-")}">${section}</span>`;
  });

  // ─── Markdown Config ─────────────────────────────────────────────────────────
  const markdownIt = require("markdown-it");
  const markdownItAnchor = require("markdown-it-anchor");

  const md = markdownIt({
    html: true,
    breaks: false,
    linkify: true,
    typographer: true,
  });

  md.use(markdownItAnchor, {
    permalink: false,
    slugify: s => s.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-'),
  });

  eleventyConfig.setLibrary("md", md);

  eleventyConfig.addFilter("md", (content) => {
    if (!content) return '';
    return md.render(String(content));
  });

  // ─── Layout Aliases ──────────────────────────────────────────────────────────
  eleventyConfig.addLayoutAlias("base", "layouts/base.njk");
  eleventyConfig.addLayoutAlias("article", "layouts/article.njk");
  eleventyConfig.addLayoutAlias("section", "layouts/section.njk");
  eleventyConfig.addLayoutAlias("home", "layouts/home.njk");
  eleventyConfig.addLayoutAlias("author", "layouts/author.njk");
  eleventyConfig.addLayoutAlias("tag", "layouts/tag.njk");

  // ─── Global Data
  eleventyConfig.addGlobalData("currentYear", () => new Date().getFullYear());
  eleventyConfig.addGlobalData("buildTime", () => Date.now());

  // ─── Build Config ────────────────────────────────────────────────────────────
  return {
    templateFormats: ["md", "njk", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
  };
};
