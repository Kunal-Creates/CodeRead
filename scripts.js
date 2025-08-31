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
const newSnippetButton = document.getElementById("new-snippet-button");

// Store the initial placeholder content to restore it later
const originalPlaceholderHTML =
  document.getElementById("output-placeholder").innerHTML;

// --- State ---
let isLoading = false;
let currentAnalysisType = "text";
let imageBase64 = null;

// API Key is now loaded from config.js file
const USER_API_KEY = window.CONFIG?.GEMINI_API_KEY;

// --- Icon Definitions ---
const icons = {
  Story: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
  Logic: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20v-4"/><path d="M12 10V4"/><path d="M12 16a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2z"/><path d="M20 12h-4"/><path d="M8 12H4"/></svg>`,
  Why: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
  Complexity: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>`,
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

// --- IDE-like Input Enhancements ---
codeInput.addEventListener("keydown", (e) => {
  if (e.key === "Tab") {
    e.preventDefault();
    const start = codeInput.selectionStart;
    document.execCommand("insertText", false, "  ");
    codeInput.selectionStart = codeInput.selectionEnd = start + 2;
    updateHighlighting();
    return;
  }

  const bracketMap = { "(": ")", "{": "}", "[": "]" };
  const openingBracket = e.key;
  const closingBracket = bracketMap[openingBracket];

  if (closingBracket) {
    e.preventDefault();
    const start = codeInput.selectionStart;
    document.execCommand("insertText", false, openingBracket + closingBracket);
    codeInput.selectionStart = codeInput.selectionEnd = start + 1;
    updateHighlighting();
  }

  if (openingBracket === "{" && e.key === "Enter") {
    const start = codeInput.selectionStart;
    if (codeInput.value.substring(start - 1, start + 1) === "{}") {
      e.preventDefault();
      document.execCommand("insertText", false, "\n  \n");
      codeInput.selectionStart = codeInput.selectionEnd = start + 3;
      updateHighlighting();
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
  let processedMarkdown = markdown.replace(
    /```(\w+)?\n([\s\S]*?)(?:\n```|$)/g,
    (match, lang, code) => {
      const language = lang || "plaintext";
      // --- FIX #2: Trim whitespace from the beginning and end of the code ---
      const trimmedCode = code.trim();
      const escapedCode = trimmedCode
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      const highlightedCode = Prism.highlight(
        escapedCode,
        Prism.languages[language] || Prism.languages.clike,
        language,
      );

      // --- FIX #1: Removed class="language-..." from the <pre> tag ---
      const codeHtml = `<pre>
                            <div class="code-header">
                                <span class="lang">${language}</span>
                                <button class="copy-btn" title="Copy code">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                </button>
                            </div>
                            <code class="language-${language}">${highlightedCode}</code>
                        </pre>`;
      codeBlocks.push(codeHtml);
      return `%%CODE_BLOCK_${codeBlocks.length - 1}%%`;
    },
  );

  processedMarkdown = processedMarkdown.replace(
    /`([^`]+)`/g,
    " <code>$1</code>",
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
      if (paragraph.trim().startsWith("%%CODE_BLOCK_")) {
        return paragraph;
      }
      if (paragraph.trim().startsWith("- ")) {
        const items = paragraph.split(/\n(?=- )/g);
        const listItems = items
          .map((item) => {
            const content = item.trim().substring(2).replace(/\n/g, " ");
            return `<li>${content}</li>`;
          })
          .join("");
        return `<ul>${listItems}</ul>`;
      }
      return paragraph.trim() ? `<p>${paragraph.replace(/\n/g, " ")}</p>` : "";
    })
    .join("");

  html = html.replace(
    /<p>%%CODE_BLOCK_(\d+)%%<\/p>|%%CODE_BLOCK_(\d+)%%/g,
    (match, index1, index2) => {
      const index = index1 || index2;
      return codeBlocks[parseInt(index, 10)];
    },
  );

  outputArea.innerHTML = `<div class="analysis-content">${html}</div>`;

  outputArea.querySelectorAll(".copy-btn").forEach((btn) => {
    const originalIcon = btn.innerHTML;
    btn.addEventListener("click", () => {
      const code = btn.closest(".code-header").nextElementSibling.innerText;
      navigator.clipboard.writeText(code).then(() => {
        btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
        setTimeout(() => {
          btn.innerHTML = originalIcon;
        }, 2000);
      });
    });
  });
};

const resetAll = () => {
  codeInput.value = "";
  updateHighlighting();
  imagePreview.style.display = "none";
  previewImg.src = "";
  fileInput.value = "";
  imageBase64 = null;
  currentAnalysisType = "text";
  codeInput.disabled = false;
  outputArea.innerHTML = `<div id="output-placeholder" class="placeholder">${originalPlaceholderHTML}</div>`;
  codeInput.focus();
};

// --- API Call Logic ---
const generateWithBackoff = async (payload, loadingMessage) => {
  if (!USER_API_KEY && !window.frameElement) {
    renderError(
      "API Key not found. Please add your Gemini API key to the config.js file to run this locally.",
    );
    return;
  }
  isLoading = true;
  [analyzeButton, convertButton, testButton].forEach(
    (btn) => (btn.disabled = true),
  );
  renderLoader(loadingMessage);

  try {
    const apiKey = USER_API_KEY;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:streamGenerateContent?key=${apiKey}&alt=sse`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error(`API Error: ${response.status}`);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const jsonStr = line.substring(6);
          try {
            const parsed = JSON.parse(jsonStr);
            const textPart = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
            if (textPart) {
              accumulatedText += textPart;
            }
          } catch (e) {
            // Ignore parsing errors
          }
        }
      }
      if (accumulatedText) {
        renderMarkdown(accumulatedText);
        outputArea.scrollTop = outputArea.scrollHeight;
      }
    }
  } catch (e) {
    renderError(e.message);
  } finally {
    isLoading = false;
    [analyzeButton, convertButton, testButton].forEach(
      (btn) => (btn.disabled = false),
    );
  }
};

const getBasePayload = () => {
  if (currentAnalysisType === "image" && imageBase64) {
    return [{ inlineData: { mimeType: "image/jpeg", data: imageBase64 } }];
  }

  const code = codeInput.value.trim();
  if (!code) {
    renderError("Please provide some code to analyze.");
    return null;
  }
  return [{ text: `\n\nHere is the code:\n\`\`\`\n${code}\n\`\`\`` }];
};

// --- Event Handlers ---
analyzeButton.addEventListener("click", () => {
  if (isLoading) return;
  const dataParts = getBasePayload();
  if (!dataParts) return;

  const prompt = `You are CodeRead, a world-class programming expert and teacher. Your goal is to explain code so deeply and clearly that even a non-coder can understand the core concepts. Imagine you're explaining it to a curious friend.

Please identify the programming language first.

Then, structure your response in Markdown with these exact, friendly sections, using the 'ICON:' prefix for each title.

### ICON:Story The Story of this Code
Start with a simple, creative analogy, like "This code is like a recipe for...". Then, explain the code's overall purpose in one or two simple sentences.

### ICON:Logic How It Works, Step-by-Step
Explain the code's logic line-by-line or block-by-block.
- Use simple bullet points for each step.
- Use **bold** for important variable or function names.
- Use \`backticks\` for any code references.
- Explain the purpose of symbols and syntax (e.g., "the semicolon ';' tells the computer that this instruction is finished").

### ICON:Why The 'Why' Behind the Code
This is crucial. Explain the design choices.
- Why was this function or variable written in this specific way?
- What problem does this particular structure solve?
- Are there common alternative ways to write this, and why might a developer choose this one?

### ICON:Complexity Performance Check
Analyze the time and space complexity using Big O notation, but explain it simply.
- For Time Complexity, say: "This is O(n), which means the time it takes grows in a straight line as the input gets bigger."
- For Space Complexity, say: "This is O(1), which means it uses a constant amount of memory, no matter the size of the input."
- Avoid jargon. Explain what the complexity means for real-world performance.

### ICON:Issues Potential Problems & Bugs
Point out potential issues, edge cases, or common bugs.
- If the code is broken, explain exactly why and what line is causing the error.
- If the code works, explain what could make it break (e.g., "This would crash if the input list was empty.").
- Provide debugging tips.

### ICON:Improvements How to Make It Better
Suggest concrete ways to improve the code.
- Focus on readability, modern best practices, and efficiency.
- If possible, provide a short "before" and "after" code snippet to illustrate the improvement.

Important rules:
- Use hyphens (-) for bullet points.
- Keep paragraphs short and easy to read.`;

  const payload = {
    contents: [{ parts: [{ text: prompt }, ...dataParts] }],
  };

  generateWithBackoff(payload, "Thinking up a deep explanation...");
});

testButton.addEventListener("click", () => {
  if (isLoading) return;
  const dataParts = getBasePayload();
  if (!dataParts) return;

  const prompt = `You are a helpful AI that writes tests for code. Your goal is to make it easy for anyone to understand.

First, figure out the programming language and choose a common tool for testing it (like Jest for JavaScript or PyTest for Python).

Then, create the tests and structure your response in Markdown with these exact sections:

### ICON:Tests Writing Some Tests
Say which language and testing tool you chose. Briefly explain what the tests will check in simple terms.

### ICON:Logic Test Code
Provide the complete test code in a single code block.`;

  const payload = {
    contents: [{ parts: [{ text: prompt }, ...dataParts] }],
  };

  generateWithBackoff(payload, "Writing up some tests...");
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
  const dataParts = getBasePayload();
  if (!dataParts) return;

  const prompt = `You are a helpful AI that translates code from one language to another. Your task is to convert the given code to **${targetLanguage}**.

Please structure your response in Markdown with this exact section:

### ICON:Conversion Converted to ${targetLanguage}
First, provide the complete, converted code in a single code block.
After the code, explain any important differences between the old and new code in simple, easy-to-understand English.`;

  const payload = {
    contents: [{ parts: [{ text: prompt }, ...dataParts] }],
  };

  generateWithBackoff(payload, `Translating to ${targetLanguage}...`);
});

newSnippetButton.addEventListener("click", resetAll);

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
imagePreview.addEventListener("click", resetAll);
