const fs = require('fs');
const path = require('path');

const EXCLUDE_DIRS = new Set(['node_modules', '.git', '.vscode', 'dist', 'build']);
const EXCLUDE_FILES = new Set(['package-lock.json', 'package.json', 'README.md', 'clean-comments.js']);

function stripJsComments(code) {
  const pattern = /("(?:\\.|[^"\\])*")|('(?:\\.|[^'\\])*')|(`(?:\\.|[^`\\])*`)|(\/(?:\\.|[^\/\\])+\/[gimy]*)|(\/\*[\s\S]*?\*\/)|(\/\/.*)/g;
  
  let clean = code.replace(pattern, (match, g1, g2, g3, g4, g5, g6) => {
    if (g1 || g2 || g3 || g4) {
      return match;
    }
    return '';
  });

  clean = clean.split(/\r?\n/).map(line => line.trimEnd()).join('\n');
  return clean.replace(/\n{3,}/g, '\n\n');
}

function stripCssComments(code) {
  const pattern = /("(?:\\.|[^"\\])*")|('(?:\\.|[^'\\])*')|(\/\*[\s\S]*?\*\/)/g;
  let clean = code.replace(pattern, (match, g1, g2, g3) => {
    if (g1 || g2) return match;
    return '';
  });
  clean = clean.split(/\r?\n/).map(line => line.trimEnd()).join('\n');
  return clean.replace(/\n{3,}/g, '\n\n');
}

function stripSqlComments(code) {
  const pattern = /("(?:\\.|[^"\\])*")|('(?:\\.|[^'\\])*')|(\/\*[\s\S]*?\*\/)|(--.*)/g;
  let clean = code.replace(pattern, (match, g1, g2, g3, g4) => {
    if (g1 || g2) return match;
    return '';
  });
  clean = clean.split(/\r?\n/).map(line => line.trimEnd()).join('\n');
  return clean.replace(/\n{3,}/g, '\n\n');
}

function stripSvelteComments(code) {
  const scriptRegex = /(<script[\s\S]*?>)([\s\S]*?)(<\/script>)/gi;
  const styleRegex = /(<style[\s\S]*?>)([\s\S]*?)(<\/style>)/gi;
  
  const placeholders = [];
  const placeholderRegex = /<(script|style)[\s\S]*?>[\s\S]*?<\/\1>/gi;
  
  let temp = code.replace(placeholderRegex, (match) => {
    const id = `___PLACEHOLDER_${placeholders.length}___`;
    placeholders.push({ id, content: match });
    return id;
  });
  
  temp = temp.replace(/<!--[\s\S]*?-->/g, '');
  
  for (const p of placeholders) {
    let content = p.content;
    if (content.toLowerCase().startsWith('<script')) {
      content = content.replace(scriptRegex, (match, openTag, inner, closeTag) => {
        return openTag + '\n' + stripJsComments(inner) + '\n' + closeTag;
      });
    } else if (content.toLowerCase().startsWith('<style')) {
      content = content.replace(styleRegex, (match, openTag, inner, closeTag) => {
        return openTag + '\n' + stripCssComments(inner) + '\n' + closeTag;
      });
    }
    temp = temp.replace(p.id, content);
  }
  
  temp = temp.split(/\r?\n/).map(line => line.trimEnd()).join('\n');
  return temp.replace(/\n{3,}/g, '\n\n');
}

function stripEnvComments(code) {
  const lines = code.split(/\r?\n/);
  const cleanLines = lines.map(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('#')) {
      return '';
    }
    return line;
  });
  let clean = cleanLines.map(line => line.trimEnd()).join('\n');
  return clean.replace(/\n{3,}/g, '\n\n');
}

function processFile(filePath) {
  const ext = path.extname(filePath);
  const base = path.basename(filePath);
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    console.error(`Error reading ${filePath}:`, e.message);
    return;
  }
  
  let cleanContent = content;

  if (ext === '.js') {
    cleanContent = stripJsComments(content);
  } else if (ext === '.svelte') {
    cleanContent = stripSvelteComments(content);
  } else if (ext === '.css') {
    cleanContent = stripCssComments(content);
  } else if (ext === '.sql') {
    cleanContent = stripSqlComments(content);
  } else if (ext === '.html') {
    cleanContent = stripSvelteComments(content);
  } else if (base === '.env' || base.endsWith('.env')) {
    cleanContent = stripEnvComments(content);
  } else {
    return;
  }

  if (cleanContent !== content) {
    try {
      fs.writeFileSync(filePath, cleanContent, 'utf8');
      console.log(`Cleaned: ${filePath}`);
    } catch (e) {
      console.error(`Error writing ${filePath}:`, e.message);
    }
  }
}

function walkAndClean(dir) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!EXCLUDE_DIRS.has(file)) {
        walkAndClean(fullPath);
      }
    } else {
      if (!EXCLUDE_FILES.has(file)) {
        processFile(fullPath);
      }
    }
  }
}

console.log("Starting comment cleanup...");
walkAndClean(__dirname);
console.log("Cleanup complete!");
