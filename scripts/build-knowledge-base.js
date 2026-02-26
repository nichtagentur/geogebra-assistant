const fs = require('fs');
const path = require('path');

const MANUAL_DIR = process.argv[2] || '/tmp/geogebra-manual/en/modules/ROOT/pages';
const OUTPUT_FILE = path.join(__dirname, '..', 'public', 'knowledge-base.json');

function stripAdoc(text) {
  return text
    // Remove page metadata lines
    .replace(/^:page-[^:]+:.*$/gm, '')
    .replace(/^ifdef::.*$/gm, '')
    // Remove image references
    .replace(/image:[^\[]*\[[^\]]*\]/g, '')
    // Convert xref links to just the link text
    .replace(/xref:[^\[]*\[([^\]]*)\]/g, '$1')
    // Remove NOTE/WARNING blocks markers
    .replace(/^\[NOTE\]\s*$/gm, '')
    .replace(/^\[WARNING\]\s*$/gm, '')
    .replace(/^====\s*$/gm, '')
    // Remove AsciiDoc formatting
    .replace(/\*\*([^*]+)\*\*/g, '$1')  // bold
    .replace(/\*([^*]+)\*/g, '$1')       // italic with *
    .replace(/_([^_]+)_/g, '$1')         // italic with _
    .replace(/`\+\+([^+]+)\+\+`/g, '$1') // inline code ++
    .replace(/`([^`]+)`/g, '$1')          // inline code
    // Remove heading markup but keep text
    .replace(/^=+\s+/gm, '')
    // Remove definition list markers
    .replace(/::$/gm, ':')
    // Clean up excessive whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function getCategory(filePath) {
  if (filePath.includes('/commands/')) return 'command';
  if (filePath.includes('/tools/')) return 'tool';
  return 'general';
}

function getTitle(content) {
  const match = content.match(/^=\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

function processFiles(dir, baseDir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...processFiles(fullPath, baseDir));
    } else if (entry.name.endsWith('.adoc')) {
      const raw = fs.readFileSync(fullPath, 'utf-8');
      const title = getTitle(raw);
      if (!title) continue; // Skip files without a proper title

      const relativePath = path.relative(baseDir, fullPath);
      const category = getCategory(fullPath);
      const content = stripAdoc(raw);

      // Skip index/category pages that just list other pages
      if (content.length < 50) continue;

      results.push({
        title,
        category,
        path: relativePath,
        content,
      });
    }
  }
  return results;
}

console.log(`Processing .adoc files from: ${MANUAL_DIR}`);
const docs = processFiles(MANUAL_DIR, MANUAL_DIR);
console.log(`Processed ${docs.length} manual documents`);

// Load tutorial content from the "Learn Calculator Suite" book
const TUTORIAL_FILE = path.join(__dirname, 'tutorial-content.json');
if (fs.existsSync(TUTORIAL_FILE)) {
  const tutorials = JSON.parse(fs.readFileSync(TUTORIAL_FILE, 'utf-8'));
  docs.push(...tutorials);
  console.log(`Added ${tutorials.length} tutorial lessons`);
}

// Ensure public dir exists
const publicDir = path.dirname(OUTPUT_FILE);
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(docs, null, 0));
const sizeMB = (fs.statSync(OUTPUT_FILE).size / 1024 / 1024).toFixed(2);
console.log(`Knowledge base written to ${OUTPUT_FILE} (${sizeMB} MB)`);

// Print category breakdown
const cats = {};
docs.forEach(d => { cats[d.category] = (cats[d.category] || 0) + 1; });
console.log('Categories:', cats);
console.log(`Total: ${docs.length} documents`);
