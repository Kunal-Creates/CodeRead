// --- DOM Elements ---
const codeInput = document.getElementById("code-input");
const highlightingCode = document.getElementById("highlighting-code");
const highlightingArea = document.getElementById("highlighting-area");
const analyzeButton = document.getElementById("analyze-button");
const convertButton = document.getElementById("convert-button");
const testButton = document.getElementById("test-button");
const outputArea = document.getElementById("output-area");
const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("file-input");
const imagePreview = document.getElementById("image-preview");
const previewImg = document.getElementById("preview-img");
const previewText = document.getElementById("preview-text");
const themeToggle = document.getElementById("theme-toggle-checkbox");
const htmlEl = document.documentElement;
const modalOverlay = document.getElementById("modal-overlay");
const modalConfirm = document.getElementById("modal-confirm");
const modalCancel = document.getElementById("modal-cancel");
const languageSelect = document.getElementById("language-select");

// --- State ---
let isLoading = false;
let currentAnalysisType = "text";
let imageBase64 = null;

// API Key is now loaded from .env.js file
const USER_API_KEY = window.CONFIG?.GEMINI_API_KEY;

// --- Icon Definitions ---
const icons = {
  Story: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
  Logic: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20v-4"/><path d="M12 10V4"/><path d="M12 16a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2z"/><path d="M20 12h-4"/><path d="M8 12H4"/></svg>`,
  Issues: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  Improvements: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18M21.2 12.8H2.8"/><path d="m3 9 9-7 9 7"/><path d="m3 15 9 7 9-7"/></svg>`,
  Tests: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>`,
  Conversion: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="8 21 3 21 3 16"/><line x1="20" y1="4" x2="3" y2="21"/></svg>`,
};

// --- Theme Logic ---
const applyTheme = (theme) => {
  htmlEl.setAttribute("data-theme", theme);
  themeToggle.checked = theme === "dark";
};
const toggleTheme = () => {
  const newTheme =
    htmlEl.getAttribute("data-theme") === "dark" ? "light" : "dark";
  localStorage.setItem("theme", newTheme);
  applyTheme(newTheme);
};
themeToggle.addEventListener("change", toggleTheme);
const savedTheme = localStorage.getItem("theme") || "light";
applyTheme(savedTheme);

// --- Syntax Highlighting Logic ---
const updateHighlighting = () => {
  const code = codeInput.value;
  highlightingCode.textContent = code;
  Prism.highlightElement(highlightingCode);
};

const syncScroll = () => {
  highlightingArea.scrollTop = codeInput.scrollTop;
  highlightingArea.scrollLeft = codeInput.scrollLeft;
};

codeInput.addEventListener("input", updateHighlighting);
codeInput.addEventListener("scroll", syncScroll);
updateHighlighting(); // Initial highlight

// --- Keyboard Shortcuts ---
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.metaKey) {
    switch (e.key) {
      case "Enter":
        e.preventDefault();
        if (!isLoading) analyzeButton.click();
        break;
      case "k":
        e.preventDefault();
        codeInput.focus();
        break;
      case "t":
        e.preventDefault();
        if (!isLoading) testButton.click();
        break;
    }
  }
});

// --- Utility Functions ---
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const renderLoader = (message) => {
  outputArea.innerHTML = `
        <div class="loader">
            <div class="spinner"></div>
            <p><strong>${message}</strong></p>
            <p class="loader-subtext">This usually takes 10-15 seconds</p>
        </div>
    `;
};

const renderError = (message) => {
  outputArea.innerHTML = `
        <div class="error-message">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            <p><strong>Oops!</strong> ${message}</p>
            <button onclick="location.reload()" class="retry-btn">Try Again</button>
        </div>
    `;
};

const renderMarkdown = (markdown) => {
  const codeBlocks = [];
  let processedMarkdown = markdown.replace(/``````/g, (match, lang, code) => {
    const language = lang || "plaintext";
    const escapedCode = code.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const highlightedCode = Prism.highlight(
      escapedCode,
      Prism.languages[language] || Prism.languages.clike,
      language,
    );
    const codeHtml = `<div class="code-wrapper">
                        <div class="code-header">
                            <span class="lang">${language}</span>
                            <button class="copy-btn">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                Copy
                            </button>
                        </div>
                        <pre class="language-${language}"><code class="language-${language}">${highlightedCode}</code></pre>
                    </div>`;
    codeBlocks.push(codeHtml);
    return `%%CODE_BLOCK_${codeBlocks.length - 1}%%`;
  });

  // Enhanced inline code with syntax highlighting
  processedMarkdown = processedMarkdown.replace(
    /`([^`]+)`/g,
    (match, codeContent) => {
      const trimmed = codeContent.trim();
      let highlightedContent = codeContent;

      // Basic syntax highlighting for common patterns
      if (trimmed.includes("(") && trimmed.includes(")")) {
        // Function call pattern
        highlightedContent = trimmed.replace(
          /(\w+)(\()/g,
          '<span class="token function">$1</span><span class="token punctuation">$2</span>',
        );
      } else if (trimmed.includes("=")) {
        // Assignment pattern
        highlightedContent = trimmed.replace(
          /(\w+)\s*=\s*(.+)/g,
          '<span class="token keyword">$1</span> <span class="token operator">=</span> <span class="token string">$2</span>',
        );
      }

      return `<code class="inline-code">${highlightedContent}</code>`;
    },
  );

  let html = processedMarkdown
    .replace(
      /### ICON:(\w+)\s(.*)/g,
      (match, iconKey, title) =>
        `<h3>${icons[iconKey] || ""}<span>${title}</span></h3>`,
    )
    .replace(
      /This code is like (.*)\./g,
      '<p class="analogy">This code is like $1.</p>',
    )
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .split("\n\n")
    .map((paragraph) => {
      if (paragraph.trim().startsWith("%%CODE_BLOCK_")) return paragraph;

      // Remove bullet point asterisks but preserve emphasis
      let p = paragraph.replace(/\n\s*-\s+/g, "</li><li>").trim();

      if (p.startsWith("</li><li>")) {
        p = '<ul class="enhanced-list">' + p + "</ul>";
        p = p.replace("</li><li>", "<li>");
      } else if (p.includes("</li><li>")) {
        p = '<ul class="enhanced-list"><li>' + p + "</ul>";
      }

      return p
        ? `<p class="enhanced-paragraph">${p.replace(/\n/g, "<br>")}</p>`
        : "";
    })
    .join("");

  html = html
    .replace(
      /<p[^>]*>%%CODE_BLOCK_(\d+)%%<\/p>/g,
      (match, index) => codeBlocks[parseInt(index, 10)],
    )
    .replace(
      /%%CODE_BLOCK_(\d+)%%/g,
      (match, index) => codeBlocks[parseInt(index, 10)],
    );

  outputArea.innerHTML = `<div class="analysis-content">${html}</div>`;

  outputArea.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const code = btn
        .closest(".code-wrapper")
        .querySelector("pre code").innerText;
      navigator.clipboard.writeText(code).then(() => {
        btn.innerHTML = "Copied!";
        setTimeout(() => {
          btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copy`;
        }, 2000);
      });
    });
  });
};

// --- API Call Logic ---
const generateWithBackoff = async (payload, loadingMessage) => {
  if (!USER_API_KEY && !window.frameElement) {
    renderError(
      "API Key not found. Please add your Gemini API key to the .env.js file to run this locally.",
    );
    return;
  }
  isLoading = true;
  [analyzeButton, convertButton, testButton].forEach(
    (btn) => (btn.disabled = true),
  );
  renderLoader(loadingMessage);

  let delay = 1000;
  for (let i = 0; i < 3; i++) {
    try {
      const apiKey = USER_API_KEY;
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      const result = await response.json();
      if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
        renderMarkdown(result.candidates[0].content.parts[0].text);
        break;
      } else {
        throw new Error(
          `Analysis failed. Reason: ${result.candidates?.[0]?.finishReason || "No content"}.`,
        );
      }
    } catch (e) {
      if (i === 2) {
        renderError(e.message);
        break;
      }
      await sleep(delay);
      delay *= 2;
    }
  }
  isLoading = false;
  [analyzeButton, convertButton, testButton].forEach(
    (btn) => (btn.disabled = false),
  );
};

const getBasePayload = () => {
  if (currentAnalysisType === "image" && imageBase64) {
    return {
      parts: [
        { text: "" }, // Placeholder for prompt
        { inlineData: { mimeType: "image/png", imageBase64 } },
      ],
    };
  } else {
    const code = codeInput.value.trim();
    if (!code) {
      renderError("Please provide some code to analyze.");
      return null;
    }
    return {
      parts: [{ text: `\n\nHere is the code:\n\`\`\`\n${code}\n\`\`\`` }],
    };
  }
};

// --- Event Handlers ---
analyzeButton.addEventListener("click", () => {
  if (isLoading) return;
  const basePayload = getBasePayload();
  if (!basePayload) return;

  const prompt = `You are CodeRead, an AI code analysis expert with a knack for storytelling. Your goal is to make code intuitive and easy to understand.

First, identify the programming language of the code snippet. Then, explain the code by framing it as a story or a simple analogy.

Structure your response in Markdown with these EXACT sections, using the 'ICON:' prefix:

### ICON:Story The Story of this Code
Start with the phrase "This code is like a..." and provide a simple, creative analogy. Then, give a high-level summary of its purpose.

### ICON:Logic Step-by-Step Logic
Walk through the code's logic as if you are the computer executing it.

- Use bullet points for clarity
- Mention the detected programming language
- Use **bold** for key terms or variable names
- Use \`backticks\` for inline code references
- Leave blank lines between major steps

### ICON:Issues Potential Plot Twists
Point out any potential bugs, edge cases, or vulnerabilities. If none, state "The story looks solid, with no unexpected plot twists."

- List each issue clearly
- Provide specific examples when possible
- Leave blank lines between different issues

### ICON:Improvements A Better Draft
Suggest specific, actionable improvements for efficiency, readability, or modern best practices.

- Each suggestion should be on a separate line
- Use \`backticks\` for code references
- Leave blank lines between different improvements

Important formatting rules:
- Never use asterisks (*) for bullet points - use hyphens (-) instead
- Always leave blank lines between sections and major points
- Use backticks for all code references, variable names, and function names
- Keep paragraphs well-spaced for readability`;

  basePayload.parts[0].text = prompt + (basePayload.parts[0].text || "");
  generateWithBackoff({ contents: [basePayload] }, "Unraveling the story...");
});

testButton.addEventListener("click", () => {
  if (isLoading) return;
  const basePayload = getBasePayload();
  if (!basePayload) return;

  const prompt = `You are an expert test generation AI. Your task is to write a suite of unit tests for the provided code. First, detect the language and a popular testing framework for it (e.g., Jest for JS/TS, PyTest for Python, JUnit for Java). Then, generate the test code. Structure your response in Markdown with these EXACT sections, using the 'ICON:' prefix:

### ICON:Tests Generating Unit Tests
State the detected language and the testing framework you've chosen. Briefly explain the purpose of the test suite.

### ICON:Logic Code
Provide the complete, runnable unit test code inside a single code block.`;
  basePayload.parts[0].text = prompt + (basePayload.parts[0].text || "");
  generateWithBackoff({ contents: [basePayload] }, "Generating unit tests...");
});

convertButton.addEventListener("click", () => {
  if (isLoading) return;
  modalOverlay.classList.add("visible");
});

modalCancel.addEventListener("click", () =>
  modalOverlay.classList.remove("visible"),
);
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) modalOverlay.classList.remove("visible");
});

modalConfirm.addEventListener("click", () => {
  modalOverlay.classList.remove("visible");
  const targetLanguage = languageSelect.value;
  const basePayload = getBasePayload();
  if (!basePayload) return;

  const prompt = `You are an expert code conversion AI. Your task is to convert the given code snippet to ${targetLanguage}. Structure your response in Markdown with this EXACT section header, using the 'ICON:' prefix:

### ICON:Conversion Conversion to ${targetLanguage}
First, provide the complete, converted code in ${targetLanguage} inside a single code block. Below the code block, state the detected source language and mention any important caveats or differences.`;
  basePayload.parts[0].text = prompt + (basePayload.parts[0].text || "");
  generateWithBackoff(
    { contents: [basePayload] },
    `Converting to ${targetLanguage}...`,
  );
});

// --- Drag and Drop Logic ---
const body = document.body;
body.addEventListener("dragover", (e) => {
  e.preventDefault();
  e.stopPropagation();
  dropZone.classList.add("visible");
});
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  e.stopPropagation();
  dropZone.classList.add("drag-over");
});
dropZone.addEventListener("dragleave", (e) => {
  e.preventDefault();
  e.stopPropagation();
  dropZone.classList.remove("drag-over");
});
body.addEventListener("dragleave", (e) => {
  if (!e.relatedTarget || e.relatedTarget.nodeName === "HTML") {
    dropZone.classList.remove("visible");
    dropZone.classList.remove("drag-over");
  }
});
dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  e.stopPropagation();
  dropZone.classList.remove("visible");
  dropZone.classList.remove("drag-over");
  if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
});
fileInput.addEventListener("change", (e) => {
  if (e.target.files.length > 0) handleFile(e.target.files[0]);
});
const handleFile = (file) => {
  if (file && file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imageBase64 = e.target.result.split(",")[1];
      previewImg.src = e.target.result;
      previewText.textContent = `Ready to analyze: ${file.name}`;
      imagePreview.style.display = "flex";
      currentAnalysisType = "image";
      codeInput.disabled = true;
    };
    reader.readAsDataURL(file);
  } else {
    renderError("Please upload a valid image file.");
  }
};
imagePreview.addEventListener("click", () => {
  imagePreview.style.display = "none";
  previewImg.src = "";
  fileInput.value = "";
  imageBase64 = null;
  currentAnalysisType = "text";
  codeInput.disabled = false;
});
