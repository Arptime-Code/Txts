/**
 * txts Documentation Engine
 * ==========================
 * Markdown parser + syntax highlighter + sidebar renderer + SPA router.
 * All in vanilla JS — no dependencies.
 */

(function () {
  "use strict";

  // ──────────────────────────────────────────────
  // Config
  // ──────────────────────────────────────────────

  const SIDEBAR_URL = "sidebar.json";
  const CONTENT_DIR = "content/";
  const MD_EXT = ".md";
  const DEFAULT_PAGE = "index";
  const SITE_NAME = "txts docs";

  // ──────────────────────────────────────────────
  // Markdown Parser
  // ──────────────────────────────────────────────

  const MarkdownParser = {
    /**
     * Parse a full markdown string into an HTML string.
     */
    render(md) {
      if (!md) return "";
      const lines = md.split("\n");
      const blocks = this._parseBlocks(lines);
      return blocks.map((b) => this._renderBlock(b)).join("\n");
    },

    /**
     * Parse lines into block-level tokens.
     */
    _parseBlocks(lines) {
      const blocks = [];
      let i = 0;

      while (i < lines.length) {
        const line = lines[i];

        // ── Fenced code block ──
        if (/^```(\w*)/.test(line)) {
          const lang = line.match(/^```(\w*)/)[1];
          const codeLines = [];
          i++;
          while (i < lines.length && !/^```/.test(lines[i])) {
            codeLines.push(lines[i]);
            i++;
          }
          i++; // skip closing ```
          blocks.push({ type: "code", lang, code: codeLines.join("\n") });
          continue;
        }

        // ── Horizontal rule ──
        if (/^(?:---|___|\*\*\*)\s*$/.test(line)) {
          blocks.push({ type: "hr" });
          i++;
          continue;
        }

        // ── Heading ──
        const headingMatch = line.match(/^(#{1,6})\s+(.+?)(?:\s+#+)?$/);
        if (headingMatch) {
          const level = headingMatch[1].length;
          let text = headingMatch[2];
          // Check for custom anchor id
          let anchor = "";
          const anchorMatch = text.match(/\s*\{#([\w-]+)\}\s*$/);
          if (anchorMatch) {
            anchor = anchorMatch[1];
            text = text.replace(/\s*\{#[\w-]+\}\s*$/, "");
          }
          blocks.push({ type: "heading", level, text: text.trim(), anchor });
          i++;
          continue;
        }

        // ── Table ──
        if (/^\|.+\|$/.test(line)) {
          const tableRows = [];
          while (i < lines.length && /^\|.+\|$/.test(lines[i])) {
            tableRows.push(lines[i]);
            i++;
          }
          blocks.push(this._parseTable(tableRows));
          continue;
        }

        // ── Blockquote ──
        if (/^>/.test(line)) {
          const quoteLines = [];
          while (i < lines.length && /^>/.test(lines[i])) {
            quoteLines.push(lines[i].replace(/^>\s?/, ""));
            i++;
          }
          const content = quoteLines.join("\n");
          // Check for GitHub-style alerts
          const alertMatch = content.match(/^\[!(\w+)\]\s*\n?([\s\S]*)$/);
          if (alertMatch) {
            const type = alertMatch[1].toLowerCase();
            const rest = alertMatch[2].trim();
            blocks.push({ type: "alert", alertType: type, content: rest });
          } else {
            blocks.push({ type: "blockquote", content });
          }
          continue;
        }

        // ── Unordered list ──
        if (/^[\s]*[-*+]\s/.test(line)) {
          const items = [];
          while (i < lines.length && /^[\s]*[-*+]\s/.test(lines[i])) {
            items.push(lines[i].replace(/^[\s]*[-*+]\s/, ""));
            i++;
          }
          blocks.push({ type: "list", ordered: false, items });
          continue;
        }

        // ── Ordered list ──
        if (/^\s*\d+\.\s/.test(line)) {
          const items = [];
          while (i < lines.length && /^\s*\d+\.\s/.test(lines[i])) {
            items.push(lines[i].replace(/^\s*\d+\.\s/, ""));
            i++;
          }
          blocks.push({ type: "list", ordered: true, items });
          continue;
        }

        // ── Blank line → skip ──
        if (/^\s*$/.test(line)) {
          i++;
          continue;
        }

        // ── Paragraph (collect until blank line or block-level marker) ──
        const paraLines = [];
        while (
          i < lines.length &&
          !/^\s*$/.test(lines[i]) &&
          !/^#{1,6}\s/.test(lines[i]) &&
          !/^```/.test(lines[i]) &&
          !/^>/.test(lines[i]) &&
          !/^[\s]*[-*+]\s/.test(lines[i]) &&
          !/^\s*\d+\.\s/.test(lines[i]) &&
          !/^---/.test(lines[i]) &&
          !/^\|.+\|$/.test(lines[i])
        ) {
          paraLines.push(lines[i]);
          i++;
        }
        if (paraLines.length > 0) {
          blocks.push({ type: "paragraph", content: paraLines.join("\n") });
        }
      }

      return blocks;
    },

    /**
     * Parse a table from pipe-delimited rows.
     */
    _parseTable(rows) {
      if (rows.length === 0) return { type: "paragraph", content: "" };
      const headers = rows[0]
        .split("|")
        .map((s) => s.trim())
        .filter(Boolean);
      // Skip separator row (|---|) if present
      let dataStart = 1;
      if (rows.length > 1 && /^[\s|:-]+$/.test(rows[1])) {
        dataStart = 2;
      }
      const bodyRows = [];
      for (let r = dataStart; r < rows.length; r++) {
        const cells = rows[r]
          .split("|")
          .map((s) => s.trim())
          .filter(Boolean);
        if (cells.length > 0) {
          bodyRows.push(cells);
        }
      }
      return { type: "table", headers, rows: bodyRows };
    },

    /**
     * Render a block token to HTML.
     */
    _renderBlock(block) {
      switch (block.type) {
        case "heading": {
          const id = block.anchor || block.text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
          return `<h${block.level} id="${id}">${this._parseInline(block.text)}</h${block.level}>`;
        }
        case "paragraph":
          return `<p>${this._parseInline(block.content)}</p>`;
        case "code": {
          let html = "";
          if (block.lang) {
            html += `<span class="code-lang">${this._escapeHtml(block.lang)}</span>`;
          }
          html += this._highlightCode(block.code, block.lang);
          return `<div class="code-block">${html}</div>`;
        }
        case "list": {
          const tag = block.ordered ? "ol" : "ul";
          const items = block.items
            .map((item) => `<li>${this._parseInline(item)}</li>`)
            .join("\n");
          return `<${tag}>\n${items}\n</${tag}>`;
        }
        case "blockquote": {
          const inner = this.render(block.content);
          return `<blockquote>${inner}</blockquote>`;
        }
        case "alert": {
          const type = block.alertType;
          const cls = type === "tip" ? "info-box tip" :
                      type === "warning" ? "info-box warning" :
                      "info-box";
          const inner = this._parseInline(block.content);
          return `<div class="${cls}">${inner}</div>`;
        }
        case "table": {
          let html = "<table>\n<thead>\n<tr>";
          block.headers.forEach((h) => {
            html += `<th>${this._parseInline(h)}</th>`;
          });
          html += "</tr>\n</thead>\n<tbody>\n";
          block.rows.forEach((row) => {
            html += "<tr>";
            row.forEach((cell) => {
              html += `<td>${this._parseInline(cell)}</td>`;
            });
            html += "</tr>\n";
          });
          html += "</tbody>\n</table>";
          return html;
        }
        case "hr":
          return "<hr>";
        default:
          return "";
      }
    },

    /**
     * Parse inline formatting: bold, italic, code, links, images, line breaks.
     */
    _parseInline(text) {
      if (!text) return "";
      // Escape HTML first, then apply markdown formatting
      let result = this._escapeHtml(text);

      // Images: ![alt](url)
      result = result.replace(
        /!\[([^\]]*)\]\(([^)]+)\)/g,
        '<img src="$2" alt="$1" loading="lazy">'
      );

      // Links: [text](url)
      result = result.replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2">$1</a>'
      );

      // Bold + Italic combined: ***text***
      result = result.replace(
        /\*\*\*([^*]+)\*\*\*/g,
        '<strong><em>$1</em></strong>'
      );

      // Bold: **text**
      result = result.replace(
        /\*\*([^*]+)\*\*/g,
        '<strong>$1</strong>'
      );

      // Italic: *text*
      result = result.replace(
        /\*([^*]+)\*/g,
        '<em>$1</em>'
      );

      // Inline code: `text`
      result = result.replace(
        /`([^`]+)`/g,
        '<code class="inline-code">$1</code>'
      );

      // Line breaks within a paragraph
      result = result.replace(/  \n/g, "<br>\n");
      result = result.replace(/\\\n/g, "<br>\n");

      return result;
    },

    /**
     * Syntax-highlight code content based on language.
     */
    _highlightCode(code, lang) {
      if (!lang || lang === "txts") {
        return this._highlightTxts(code);
      }
      // Generic: just escape HTML
      return this._escapeHtml(code);
    },

    /**
     * Highlight txts code.
     */
    _highlightTxts(code) {
      const lines = code.split("\n");
      const kwPattern = /^(IMPORT|CALL|ADD|REPLACE)\b/;
      const libVarPattern = /([a-zA-Z_][\w.]*)\.([a-zA-Z_][\w]*)/g;
      const stringPattern = /("[^"\\]*(?:\\.[^"\\]*)*")/g;
      const builtinPattern = /\b(OUTPUT|CLEAR)\b/g;

      return lines
        .map((line) => {
          const escaped = this._escapeHtml(line);

          // Blank line
          if (/^\s*$/.test(line)) {
            return escaped;
          }

          // Comment (doesn't start with a keyword)
          if (!kwPattern.test(line.trim())) {
            return `<span class="cmt">${escaped}</span>`;
          }

          // Keyword line — highlight pieces
          let result = escaped;

          // Highlight strings
          result = result.replace(
            /("[^"\\]*(?:\\.[^"\\]*)*")/g,
            '<span class="str">$1</span>'
          );

          // Highlight builtins (OUTPUT, CLEAR) — must not be inside a string
          result = result.replace(
            /\b(OUTPUT|CLEAR)\b/g,
            '<span class="builtin">$1</span>'
          );

          // Highlight library.variable patterns
          // Library is before last dot, variable after
          result = result.replace(
            /([a-zA-Z_][\w.]*)\.([a-zA-Z_][\w]*)/g,
            (match, lib, v) => {
              // Don't highlight inside strings
              const fullMatch = match;
              // Check if this part is inside an already-highlighted string
              if (/<span class="str">/.test(result) && result.indexOf(fullMatch) > result.lastIndexOf('<span class="str">') && result.indexOf(fullMatch) < result.indexOf('</span>', result.lastIndexOf('<span class="str">'))) {
                return fullMatch;
              }
              return `<span class="lib">${lib}</span>.<span class="var">${v}</span>`;
            }
          );

          // Highlight keyword at start
          result = result.replace(
            kwPattern,
            (m) => `<span class="kw">${m}</span>`
          );

          return result;
        })
        .join("\n");
    },

    /**
     * Escape HTML special characters.
     */
    _escapeHtml(text) {
      return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    },
  };

  // ──────────────────────────────────────────────
  // Documentation App
  // ──────────────────────────────────────────────

  const DocApp = {
    config: null,
    currentPage: null,

    /**
     * Initialize the app.
     */
    async init() {
      // Render the static header
      this._renderHeader();

      try {
        // Load sidebar config
        const resp = await fetch(SIDEBAR_URL);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        this.config = await resp.json();

        // Render sidebar
        this._renderSidebar();

        // Update theme toggle icon to reflect current state
        this._updateThemeIcon();

        // Determine initial page from hash
        const page = this._getPageFromHash();
        await this._navigate(page, false);

        // Listen for hash changes and sidebar clicks
        window.addEventListener("hashchange", () => {
          const p = this._getPageFromHash();
          this._navigate(p, true);
        });

        // Listen for clicks on sidebar / pager links (for smooth transitions)
        document.addEventListener("click", (e) => {
          const link = e.target.closest("[data-nav]");
          if (link) {
            e.preventDefault();
            const page = link.getAttribute("data-nav");
            window.location.hash = page;
          }
        });

      } catch (err) {
        console.error("Failed to initialize docs app:", err);
        document.getElementById("content-area").innerHTML =
          `<div class="error-message">
            <strong>Failed to load documentation.</strong><br>
            Could not load sidebar configuration. Make sure
            <code>sidebar.json</code> is accessible.
          </div>`;
      }
    },

    /**
     * Render the static header.
     */
    _renderHeader() {
      const header = document.querySelector(".top-header");
      header.innerHTML = `
        <a href="#${DEFAULT_PAGE}" class="logo" data-nav="${DEFAULT_PAGE}">txts<span>docs</span></a>
        <div class="nav-links">
          <a data-nav="index">Home</a>
          <a data-nav="examples">Examples</a>
          <a data-nav="developer">Dev Docs</a>
          <button class="theme-toggle" id="themeToggle" title="Toggle dark mode">☾</button>
        </div>
      `;

      // Theme toggle
      const toggle = document.getElementById("themeToggle");
      toggle.addEventListener("click", () => {
        const html = document.documentElement;
        const isDark = html.classList.contains("dark-mode");
        if (isDark) {
          // Switch to light mode — must override prefers-color-scheme
          html.classList.remove("dark-mode");
          html.classList.add("light-mode");
          localStorage.setItem("txts-dark-mode", "0");
          toggle.textContent = "☾";
        } else {
          // Switch to dark mode
          html.classList.remove("light-mode");
          html.classList.add("dark-mode");
          localStorage.setItem("txts-dark-mode", "1");
          toggle.textContent = "☀";
        }
      });
    },

    /**
     * Render the sidebar from config.
     */
    _renderSidebar() {
      const sidebar = document.querySelector(".sidebar");
      if (!this.config) return;

      let html = "";
      this.config.sections.forEach((section) => {
        html += `<div class="sidebar-section">\n`;
        html += `  <div class="sidebar-section-title">${this._escapeAttr(section.title)}</div>\n`;
        section.pages.forEach((page) => {
          html += `  <a data-nav="${this._escapeAttr(page.id)}" href="#${this._escapeAttr(page.id)}">${this._escapeAttr(page.label)}</a>\n`;
        });
        html += `</div>\n`;
      });
      sidebar.innerHTML = html;
    },

    /**
     * Navigate to a page.
     */
    async _navigate(pageId, pushState) {
      if (pageId === this.currentPage && pageId !== DEFAULT_PAGE) return;
      this.currentPage = pageId;

      // Show loading state
      document.getElementById("app").classList.add("loading");

      // Update sidebar active state
      this._setActivePage(pageId);

      // Update document title
      const pageLabel = this._getPageLabel(pageId);
      document.title = pageLabel
        ? `txts - ${pageLabel}`
        : `txts Language Tutorial`;

      // Fetch and render markdown
      try {
        const mdResp = await fetch(`${CONTENT_DIR}${pageId}${MD_EXT}`);
        if (!mdResp.ok) {
          if (mdResp.status === 404) {
            this._show404(pageId);
          } else {
            throw new Error(`HTTP ${mdResp.status}`);
          }
        } else {
          const md = await mdResp.text();
          const html = MarkdownParser.render(md);
          document.getElementById("content-area").innerHTML = html;

          // Render pager
          this._renderPager(pageId);

          // Scroll to top
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      } catch (err) {
        console.error("Failed to load page:", err);
        document.getElementById("content-area").innerHTML =
          `<div class="error-message">
            <strong>Failed to load page.</strong><br>
            Could not fetch <code>${pageId}${MD_EXT}</code>. Make sure it exists in the <code>content/</code> folder.
          </div>`;
      }

      // Remove loading state
      document.getElementById("app").classList.remove("loading");
    },

    /**
     * Show a 404 page.
     */
    _show404(pageId) {
      document.getElementById("content-area").innerHTML = `
        <h1>Page Not Found</h1>
        <p>The page <strong>"${pageId}"</strong> does not exist yet.</p>
        <p>Try creating <code>${pageId}${MD_EXT}</code> in the <code>docs2/content/</code> directory.</p>
        <p><a data-nav="index" href="#${DEFAULT_PAGE}">Return to Home</a></p>
      `;
    },

    /**
     * Set the active page in the sidebar.
     */
    _setActivePage(pageId) {
      const sidebar = document.querySelector(".sidebar");
      if (!sidebar) return;
      const links = sidebar.querySelectorAll("a");
      links.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("data-nav") === pageId);
      });
    },

    /**
     * Render prev/next pagers.
     */
    _renderPager(pageId) {
      const allPages = [];
      this.config.sections.forEach((s) => {
        s.pages.forEach((p) => allPages.push(p));
      });

      const idx = allPages.findIndex((p) => p.id === pageId);
      const contentArea = document.getElementById("content-area");

      const pager = document.createElement("div");
      pager.className = "pager";

      // Previous
      if (idx > 0) {
        const prev = allPages[idx - 1];
        const prevLink = document.createElement("a");
        prevLink.setAttribute("data-nav", prev.id);
        prevLink.href = `#${prev.id}`;
        prevLink.innerHTML = `&laquo; ${prev.label}`;
        pager.appendChild(prevLink);
      } else {
        const span = document.createElement("span");
        pager.appendChild(span);
      }

      // Next
      if (idx >= 0 && idx < allPages.length - 1) {
        const next = allPages[idx + 1];
        const nextLink = document.createElement("a");
        nextLink.setAttribute("data-nav", next.id);
        nextLink.href = `#${next.id}`;
        nextLink.className = "next";
        nextLink.innerHTML = `${next.label} &raquo;`;
        pager.appendChild(nextLink);
      }

      contentArea.appendChild(pager);

      // Footer
      const footer = document.createElement("div");
      footer.className = "footer";
      footer.textContent = "txts Language Documentation — Built with care";
      contentArea.appendChild(footer);
    },

    /**
     * Get page ID from URL hash.
     */
    _getPageFromHash() {
      const hash = window.location.hash.replace(/^#/, "");
      return hash || DEFAULT_PAGE;
    },

    /**
     * Update the theme toggle icon to reflect current state.
     */
    _updateThemeIcon() {
      const toggle = document.getElementById("themeToggle");
      if (toggle) {
        toggle.textContent = document.documentElement.classList.contains("dark-mode") ? "☀" : "☾";
      }
    },

    /**
     * Get the label for a page ID.
     */
    _getPageLabel(pageId) {
      if (!this.config) return null;
      for (const section of this.config.sections) {
        for (const page of section.pages) {
          if (page.id === pageId) return page.label;
        }
      }
      return null;
    },

    /**
     * Escape HTML attribute value.
     */
    _escapeAttr(str) {
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    },
  };

  // ──────────────────────────────────────────────
  // Boot
  // ──────────────────────────────────────────────

  // Restore theme preference
  const html = document.documentElement;
  const savedTheme = localStorage.getItem("txts-dark-mode");
  if (savedTheme === "1") {
    html.classList.add("dark-mode");
  } else if (savedTheme === "0") {
    // User explicitly chose light mode — force it to override prefers-color-scheme
    html.classList.add("light-mode");
  } else {
    // First visit — auto-detect system preference
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      html.classList.add("dark-mode");
    }
  }
  // Once user manually toggles, preference is saved and takes priority over system

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => DocApp.init());
  } else {
    DocApp.init();
  }
})();
