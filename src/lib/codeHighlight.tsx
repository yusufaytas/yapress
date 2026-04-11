import React from "react";
import type { ReactNode } from "react";

type TokenType =
  | "plain"
  | "keyword"
  | "string"
  | "number"
  | "comment"
  | "operator"
  | "punctuation"
  | "function"
  | "property"
  | "tag"
  | "attribute"
  | "variable"
  | "meta";

type Token = {
  type: TokenType;
  value: string;
};

const LANGUAGE_ALIASES: Record<string, string> = {
  js: "javascript",
  jsx: "javascript",
  ts: "typescript",
  tsx: "typescript",
  shell: "bash",
  sh: "bash",
  zsh: "bash",
  md: "markdown",
  py: "python",
};

const KEYWORD_PATTERN =
  /\b(?:const|let|var|function|return|if|else|switch|case|break|continue|for|while|do|try|catch|finally|throw|new|class|extends|import|from|export|default|async|await|typeof|instanceof|in|of|void|delete|this|super|true|false|null|undefined|interface|type|enum|implements|public|private|protected|readonly|as|satisfies)\b/;
const OPERATOR_PATTERN = /^(?:=>|===|!==|==|!=|<=|>=|\+\+|--|\|\||&&|[=+\-*/%<>!?:|&^~])/;
const PUNCTUATION_PATTERN = /^[()[\]{}.,;]/;
const NUMBER_PATTERN = /^(?:0x[\da-fA-F]+|\d+(?:\.\d+)?)/;
const IDENTIFIER_PATTERN = /^[A-Za-z_$][\w$-]*/;

function normalizeLanguage(language: string) {
  return LANGUAGE_ALIASES[language] ?? language;
}

function pushToken(tokens: Token[], type: TokenType, value: string) {
  if (value) {
    tokens.push({ type, value });
  }
}

function tokenizeScript(source: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;

  while (index < source.length) {
    const rest = source.slice(index);

    const commentMatch = rest.match(/^(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/);
    if (commentMatch) {
      pushToken(tokens, "comment", commentMatch[0]);
      index += commentMatch[0].length;
      continue;
    }

    const stringMatch = rest.match(/^(['"`])(?:\\[\s\S]|(?!\1)[^\\])*\1/);
    if (stringMatch) {
      pushToken(tokens, "string", stringMatch[0]);
      index += stringMatch[0].length;
      continue;
    }

    const keywordMatch = rest.match(KEYWORD_PATTERN);
    if (keywordMatch?.index === 0) {
      pushToken(tokens, "keyword", keywordMatch[0]);
      index += keywordMatch[0].length;
      continue;
    }

    const numberMatch = rest.match(NUMBER_PATTERN);
    if (numberMatch) {
      pushToken(tokens, "number", numberMatch[0]);
      index += numberMatch[0].length;
      continue;
    }

    const propertyMatch = rest.match(/^([A-Za-z_$][\w$]*)(?=\s*:)/);
    if (propertyMatch) {
      pushToken(tokens, "property", propertyMatch[0]);
      index += propertyMatch[0].length;
      continue;
    }

    const functionMatch = rest.match(/^([A-Za-z_$][\w$]*)(?=\s*\()/);
    if (functionMatch) {
      pushToken(tokens, "function", functionMatch[0]);
      index += functionMatch[0].length;
      continue;
    }

    const identifierMatch = rest.match(IDENTIFIER_PATTERN);
    if (identifierMatch) {
      pushToken(tokens, "plain", identifierMatch[0]);
      index += identifierMatch[0].length;
      continue;
    }

    const operatorMatch = rest.match(OPERATOR_PATTERN);
    if (operatorMatch) {
      pushToken(tokens, "operator", operatorMatch[0]);
      index += operatorMatch[0].length;
      continue;
    }

    const punctuationMatch = rest.match(PUNCTUATION_PATTERN);
    if (punctuationMatch) {
      pushToken(tokens, "punctuation", punctuationMatch[0]);
      index += punctuationMatch[0].length;
      continue;
    }

    pushToken(tokens, "plain", source[index]);
    index += 1;
  }

  return tokens;
}

function tokenizeJson(source: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;

  while (index < source.length) {
    const rest = source.slice(index);
    const stringMatch = rest.match(/^"(?:\\.|[^"\\])*"/);

    if (stringMatch) {
      const isProperty = /^\s*:/.test(source.slice(index + stringMatch[0].length));
      pushToken(tokens, isProperty ? "property" : "string", stringMatch[0]);
      index += stringMatch[0].length;
      continue;
    }

    const keywordMatch = rest.match(/^(?:true|false|null)\b/);
    if (keywordMatch) {
      pushToken(tokens, "keyword", keywordMatch[0]);
      index += keywordMatch[0].length;
      continue;
    }

    const numberMatch = rest.match(NUMBER_PATTERN);
    if (numberMatch) {
      pushToken(tokens, "number", numberMatch[0]);
      index += numberMatch[0].length;
      continue;
    }

    const punctuationMatch = rest.match(PUNCTUATION_PATTERN);
    if (punctuationMatch) {
      pushToken(tokens, "punctuation", punctuationMatch[0]);
      index += punctuationMatch[0].length;
      continue;
    }

    pushToken(tokens, "plain", source[index]);
    index += 1;
  }

  return tokens;
}

function tokenizeBash(source: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;

  while (index < source.length) {
    const rest = source.slice(index);

    const commentMatch = rest.match(/^#[^\n]*/);
    if (commentMatch) {
      pushToken(tokens, "comment", commentMatch[0]);
      index += commentMatch[0].length;
      continue;
    }

    const stringMatch = rest.match(/^(['"])(?:\\.|(?!\1)[^\\])*\1/);
    if (stringMatch) {
      pushToken(tokens, "string", stringMatch[0]);
      index += stringMatch[0].length;
      continue;
    }

    const variableMatch = rest.match(/^(?:\$\{?[A-Za-z_][\w]*\}?|\$\d+)/);
    if (variableMatch) {
      pushToken(tokens, "variable", variableMatch[0]);
      index += variableMatch[0].length;
      continue;
    }

    const keywordMatch = rest.match(/^(?:if|then|else|fi|for|do|done|case|esac|while|in|function)\b/);
    if (keywordMatch) {
      pushToken(tokens, "keyword", keywordMatch[0]);
      index += keywordMatch[0].length;
      continue;
    }

    const operatorMatch = rest.match(/^(?:\|\||&&|>>|<<|[|&<>!=])/);
    if (operatorMatch) {
      pushToken(tokens, "operator", operatorMatch[0]);
      index += operatorMatch[0].length;
      continue;
    }

    const identifierMatch = rest.match(IDENTIFIER_PATTERN);
    if (identifierMatch) {
      pushToken(tokens, index === 0 || source[index - 1] === "\n" ? "function" : "plain", identifierMatch[0]);
      index += identifierMatch[0].length;
      continue;
    }

    pushToken(tokens, "plain", source[index]);
    index += 1;
  }

  return tokens;
}

function tokenizeMarkup(source: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;

  while (index < source.length) {
    const rest = source.slice(index);

    const commentMatch = rest.match(/^<!--[\s\S]*?-->/);
    if (commentMatch) {
      pushToken(tokens, "comment", commentMatch[0]);
      index += commentMatch[0].length;
      continue;
    }

    const tagMatch = rest.match(/^<\/?[A-Za-z][\w:-]*/);
    if (tagMatch) {
      pushToken(tokens, "tag", tagMatch[0]);
      index += tagMatch[0].length;
      continue;
    }

    const attributeMatch = rest.match(/^[A-Za-z_:][\w:.-]*(?==)/);
    if (attributeMatch) {
      pushToken(tokens, "attribute", attributeMatch[0]);
      index += attributeMatch[0].length;
      continue;
    }

    const stringMatch = rest.match(/^(['"])(?:\\.|(?!\1)[^\\])*\1/);
    if (stringMatch) {
      pushToken(tokens, "string", stringMatch[0]);
      index += stringMatch[0].length;
      continue;
    }

    const operatorMatch = rest.match(/^\/?>|^=/);
    if (operatorMatch) {
      pushToken(tokens, "operator", operatorMatch[0]);
      index += operatorMatch[0].length;
      continue;
    }

    pushToken(tokens, "plain", source[index]);
    index += 1;
  }

  return tokens;
}

function tokenizeCss(source: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;

  while (index < source.length) {
    const rest = source.slice(index);

    const commentMatch = rest.match(/^\/\*[\s\S]*?\*\//);
    if (commentMatch) {
      pushToken(tokens, "comment", commentMatch[0]);
      index += commentMatch[0].length;
      continue;
    }

    const stringMatch = rest.match(/^(['"])(?:\\.|(?!\1)[^\\])*\1/);
    if (stringMatch) {
      pushToken(tokens, "string", stringMatch[0]);
      index += stringMatch[0].length;
      continue;
    }

    const propertyMatch = rest.match(/^--?[\w-]+(?=\s*:)|^[A-Za-z-]+(?=\s*:)/);
    if (propertyMatch) {
      pushToken(tokens, "property", propertyMatch[0]);
      index += propertyMatch[0].length;
      continue;
    }

    const keywordMatch = rest.match(/^@[\w-]+/);
    if (keywordMatch) {
      pushToken(tokens, "keyword", keywordMatch[0]);
      index += keywordMatch[0].length;
      continue;
    }

    const numberMatch = rest.match(/^(?:\d+(?:\.\d+)?(?:px|rem|em|vh|vw|%|s|ms)?)|^#[\da-fA-F]{3,8}/);
    if (numberMatch) {
      pushToken(tokens, "number", numberMatch[0]);
      index += numberMatch[0].length;
      continue;
    }

    const punctuationMatch = rest.match(PUNCTUATION_PATTERN);
    if (punctuationMatch) {
      pushToken(tokens, "punctuation", punctuationMatch[0]);
      index += punctuationMatch[0].length;
      continue;
    }

    pushToken(tokens, "plain", source[index]);
    index += 1;
  }

  return tokens;
}

function tokenizeMarkdown(source: string): Token[] {
  const tokens: Token[] = [];

  for (const line of source.split(/(\n)/)) {
    if (line === "\n") {
      pushToken(tokens, "plain", line);
      continue;
    }

    if (/^\s*#/.test(line) || /^\s*(?:-|\*|\d+\.)\s/.test(line)) {
      pushToken(tokens, "keyword", line);
      continue;
    }

    let remaining = line;
    while (remaining.length > 0) {
      const codeMatch = remaining.match(/^`[^`]+`/);
      if (codeMatch) {
        pushToken(tokens, "string", codeMatch[0]);
        remaining = remaining.slice(codeMatch[0].length);
        continue;
      }

      const linkMatch = remaining.match(/^\[[^\]]+\]\([^)]+\)/);
      if (linkMatch) {
        pushToken(tokens, "function", linkMatch[0]);
        remaining = remaining.slice(linkMatch[0].length);
        continue;
      }

      pushToken(tokens, "plain", remaining[0]);
      remaining = remaining.slice(1);
    }
  }

  return tokens;
}

function tokenizePython(source: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;

  while (index < source.length) {
    const rest = source.slice(index);

    const decoratorMatch = rest.match(/^@[A-Za-z_][\w.]*/);
    if (decoratorMatch) {
      pushToken(tokens, "meta", decoratorMatch[0]);
      index += decoratorMatch[0].length;
      continue;
    }

    const commentMatch = rest.match(/^#[^\n]*/);
    if (commentMatch) {
      pushToken(tokens, "comment", commentMatch[0]);
      index += commentMatch[0].length;
      continue;
    }

    const stringMatch = rest.match(/^("""[\s\S]*?"""|'''[\s\S]*?'''|(['"])(?:\\.|(?!\2)[^\\])*\2)/);
    if (stringMatch) {
      pushToken(tokens, "string", stringMatch[0]);
      index += stringMatch[0].length;
      continue;
    }

    const keywordMatch = rest.match(
      /^(?:def|class|return|if|elif|else|for|while|try|except|finally|raise|import|from|as|with|lambda|yield|pass|break|continue|in|is|not|and|or|True|False|None|async|await)\b/
    );
    if (keywordMatch) {
      pushToken(tokens, "keyword", keywordMatch[0]);
      index += keywordMatch[0].length;
      continue;
    }

    const numberMatch = rest.match(NUMBER_PATTERN);
    if (numberMatch) {
      pushToken(tokens, "number", numberMatch[0]);
      index += numberMatch[0].length;
      continue;
    }

    const functionMatch = rest.match(/^([A-Za-z_][\w]*)(?=\s*\()/);
    if (functionMatch) {
      pushToken(tokens, "function", functionMatch[0]);
      index += functionMatch[0].length;
      continue;
    }

    const identifierMatch = rest.match(/^[A-Za-z_][\w]*/);
    if (identifierMatch) {
      pushToken(tokens, "plain", identifierMatch[0]);
      index += identifierMatch[0].length;
      continue;
    }

    const operatorMatch = rest.match(OPERATOR_PATTERN);
    if (operatorMatch) {
      pushToken(tokens, "operator", operatorMatch[0]);
      index += operatorMatch[0].length;
      continue;
    }

    const punctuationMatch = rest.match(PUNCTUATION_PATTERN);
    if (punctuationMatch) {
      pushToken(tokens, "punctuation", punctuationMatch[0]);
      index += punctuationMatch[0].length;
      continue;
    }

    pushToken(tokens, "plain", source[index]);
    index += 1;
  }

  return tokens;
}

function tokenizeJava(source: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;

  while (index < source.length) {
    const rest = source.slice(index);

    const annotationMatch = rest.match(/^@[A-Za-z_$][\w$]*/);
    if (annotationMatch) {
      pushToken(tokens, "meta", annotationMatch[0]);
      index += annotationMatch[0].length;
      continue;
    }

    const commentMatch = rest.match(/^(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/);
    if (commentMatch) {
      pushToken(tokens, "comment", commentMatch[0]);
      index += commentMatch[0].length;
      continue;
    }

    const stringMatch = rest.match(/^(['"])(?:\\.|(?!\1)[^\\])*\1/);
    if (stringMatch) {
      pushToken(tokens, "string", stringMatch[0]);
      index += stringMatch[0].length;
      continue;
    }

    const keywordMatch = rest.match(
      /^(?:public|private|protected|static|final|class|interface|enum|extends|implements|void|new|return|if|else|switch|case|break|continue|for|while|do|try|catch|finally|throw|throws|import|package|this|super|true|false|null|instanceof)\b/
    );
    if (keywordMatch) {
      pushToken(tokens, "keyword", keywordMatch[0]);
      index += keywordMatch[0].length;
      continue;
    }

    const numberMatch = rest.match(NUMBER_PATTERN);
    if (numberMatch) {
      pushToken(tokens, "number", numberMatch[0]);
      index += numberMatch[0].length;
      continue;
    }

    const functionMatch = rest.match(/^([A-Za-z_$][\w$]*)(?=\s*\()/);
    if (functionMatch) {
      pushToken(tokens, "function", functionMatch[0]);
      index += functionMatch[0].length;
      continue;
    }

    const identifierMatch = rest.match(IDENTIFIER_PATTERN);
    if (identifierMatch) {
      pushToken(tokens, "plain", identifierMatch[0]);
      index += identifierMatch[0].length;
      continue;
    }

    const operatorMatch = rest.match(OPERATOR_PATTERN);
    if (operatorMatch) {
      pushToken(tokens, "operator", operatorMatch[0]);
      index += operatorMatch[0].length;
      continue;
    }

    const punctuationMatch = rest.match(PUNCTUATION_PATTERN);
    if (punctuationMatch) {
      pushToken(tokens, "punctuation", punctuationMatch[0]);
      index += punctuationMatch[0].length;
      continue;
    }

    pushToken(tokens, "plain", source[index]);
    index += 1;
  }

  return tokens;
}

function tokenizeCode(source: string, language: string): Token[] {
  switch (normalizeLanguage(language)) {
    case "javascript":
    case "typescript":
      return tokenizeScript(source);
    case "python":
      return tokenizePython(source);
    case "java":
      return tokenizeJava(source);
    case "json":
      return tokenizeJson(source);
    case "bash":
      return tokenizeBash(source);
    case "html":
    case "xml":
      return tokenizeMarkup(source);
    case "css":
      return tokenizeCss(source);
    case "markdown":
      return tokenizeMarkdown(source);
    default:
      return [{ type: "plain", value: source }];
  }
}

export function renderHighlightedCode(source: string, language: string): ReactNode[] {
  return tokenizeCode(source, language).map((token, index) => {
    if (token.type === "plain") {
      return token.value;
    }

    return (
      <span key={`${language}-${index}`} className={`token token--${token.type}`}>
        {token.value}
      </span>
    );
  });
}
