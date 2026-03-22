document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("ideaForm");
  const input = document.getElementById("ideaInput");
  const submitBtn = document.getElementById("submitBtn");
  const btnText = submitBtn.querySelector(".btn-text");
  const btnLoading = submitBtn.querySelector(".btn-loading");
  const progressSection = document.getElementById("progressSection");
  const resultsSection = document.getElementById("resultsSection");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const idea = input.value.trim();
    if (!idea) return;

    // UI: show loading
    submitBtn.disabled = true;
    btnText.style.display = "none";
    btnLoading.style.display = "inline";
    progressSection.style.display = "block";
    resultsSection.style.display = "none";

    // Reset progress
    ["claude", "gemini", "chatgpt", "perplexity"].forEach((a) => {
      document.getElementById(`status-${a}`).textContent = "Waiting...";
      const fill = document.getElementById(`fill-${a}`);
      fill.className = "prog-fill";
      fill.style.width = "0%";
    });

    try {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      });
      const data = await res.json();

      if (!data.success) {
        alert("Error: " + (data.error || "Something went wrong"));
        return;
      }

      const results = data.results;

      // Update progress to done
      ["claude", "gemini", "chatgpt", "perplexity"].forEach((a) => {
        document.getElementById(`status-${a}`).textContent = "Done!";
        const fill = document.getElementById(`fill-${a}`);
        fill.className = "prog-fill done";
      });

      // Show results
      resultsSection.style.display = "block";

      if (results.finalPlan) {
        document.getElementById("content-final").innerHTML = markdownToHtml(results.finalPlan);
      }
      if (results.coordinator) {
        document.getElementById("content-coordinator").innerHTML = markdownToHtml(results.coordinator);
      }
      if (results.gemini) {
        document.getElementById("content-gemini").innerHTML = markdownToHtml(results.gemini);
      }
      if (results.perplexity) {
        document.getElementById("content-perplexity").innerHTML = markdownToHtml(results.perplexity);
      }
      if (results.chatgpt) {
        document.getElementById("content-chatgpt").innerHTML = markdownToHtml(results.chatgpt);
      }
    } catch (err) {
      alert("Network error: " + err.message);
    } finally {
      submitBtn.disabled = false;
      btnText.style.display = "inline";
      btnLoading.style.display = "none";
    }
  });

  // Simple markdown to HTML (basic)
  function markdownToHtml(md) {
    if (!md) return "";
    let html = md
      // Code blocks
      .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="lang-$1">$2</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      // Headers
      .replace(/^### (.+)$/gm, "<h3>$1</h3>")
      .replace(/^## (.+)$/gm, "<h2>$1</h2>")
      .replace(/^# (.+)$/gm, "<h1>$1</h1>")
      // Bold
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      // Italic
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      // Unordered lists
      .replace(/^[-*] (.+)$/gm, "<li>$1</li>")
      // Ordered lists
      .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
      // Paragraphs
      .replace(/\n\n/g, "</p><p>")
      // Line breaks
      .replace(/\n/g, "<br>");

    // Wrap loose <li> in <ul>
    html = html.replace(/((?:<li>.*?<\/li><br>?)+)/g, "<ul>$1</ul>");
    html = html.replace(/<br><\/ul>/g, "</ul>");
    html = html.replace(/<ul><br>/g, "<ul>");

    return `<p>${html}</p>`;
  }
});
