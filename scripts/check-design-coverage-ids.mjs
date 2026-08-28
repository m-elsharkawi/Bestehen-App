const checkIdPattern = /P04-[A-Z0-9]+-001/g;

export function executableCheckIds(contents) {
  const ids = new Set();
  let index = 0;
  while (index < contents.length) {
    if (contents.startsWith("//", index)) {
      index = contents.indexOf("\n", index + 2);
      if (index < 0) break;
      continue;
    }
    if (contents.startsWith("/*", index)) {
      index = contents.indexOf("*/", index + 2);
      index = index < 0 ? contents.length : index + 2;
      continue;
    }
    const character = contents[index];
    if (character === '"' || character === "'" || character === "`") {
      const quote = character;
      index++;
      while (index < contents.length) {
        if (contents[index] === "\\") index += 2;
        else if (contents[index++] === quote) break;
      }
      continue;
    }
    const match = contents.slice(index).match(/^(test|describe)\s*\(\s*(["'`])/);
    if (match) {
      index += match[0].length;
      const quote = match[2];
      let title = "";
      while (index < contents.length && contents[index] !== quote) {
        if (contents[index] === "\\" && index + 1 < contents.length) index++;
        title += contents[index++];
      }
      for (const id of title.matchAll(checkIdPattern)) ids.add(id[0]);
    }
    index++;
  }
  return ids;
}
