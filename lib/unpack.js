// Usage: write(unpack(fs.readFileSync("main.jsbundle")), "output")
const fs = require("fs");
const path = require("path");

const UINT32_LENGTH = 4;

module.exports.unpack = function unpack(buffer) {
  if (buffer.readUInt32LE(0) != 0xfb0bd1e5) {
    throw new Error("Bundle doesn't start with magic");
  }
  const entryCount = buffer.readUInt32LE(UINT32_LENGTH);
  const startupCodeLength = buffer.readUInt32LE(UINT32_LENGTH * 2);

  const entries = {};

  const entryTableStart = UINT32_LENGTH * 3;
  let position = entryTableStart;
  for (let entryId = 0; entryId < entryCount; ++entryId) {
    entries[entryId] = {
      offset: buffer.readUInt32LE(position),
      length: buffer.readUInt32LE(position + UINT32_LENGTH),
    };
    position += UINT32_LENGTH * 2;
  }

  const moduleStart = position;
  const modules = {};
  for (const entryId in entries) {
    const entry = entries[entryId];
    const end = moduleStart + entry.offset + entry.length - 1;
    modules[entryId] = buffer.slice(moduleStart + entry.offset, end);
    if (buffer[end] != 0) {
      throw new Error("Sanity check: entry doesn't end in NUL?? " + entryId);
    }
  }
  modules.startup = buffer.slice(
    moduleStart,
    moduleStart + startupCodeLength - 1
  );

  return modules;
};

module.exports.write = async function write(modules, output) {
  try {
    await fs.promises.mkdir(output);
  } catch (err) {
    if (err.code != "EEXIST") {
      throw err;
    }
  }

  const pool = new Set();
  for (const moduleId in modules) {
    pool.add(
      fs.promises.writeFile(
        path.join(output, moduleId + ".js"),
        modules[moduleId]
      )
    );
  }
  await Promise.all(pool);
};
