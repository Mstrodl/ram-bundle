// Usage: fs.writeFileSync("main.jsbundle", pack({startup: Buffer, 0: Buffer, 1: Buffer, ...}))

const UINT32_LENGTH = 4;

module.exports.pack = function pack(modules) {
  const startup = modules.startup;
  delete modules.startup;

  const entries = {};
  let offset = startup.length + 1;
  for (const moduleId in modules) {
    entries[moduleId] = {
      offset,
      length: modules[moduleId].length + 1,
    };
    offset += entries[moduleId].length;
  }

  const entryCount = Object.keys(entries).length;

  const length =
    // module table size
    offset +
    // Header + entry count + startup length
    UINT32_LENGTH * 3 +
    // Entry table size
    entryCount * 2 * UINT32_LENGTH;

  const buffer = Buffer.alloc(length);
  // Magic
  buffer.writeUInt32LE(0xfb0bd1e5, 0);
  buffer.writeUInt32LE(entryCount, UINT32_LENGTH);
  buffer.writeUInt32LE(startup.length + 1, UINT32_LENGTH * 2);

  const tableStart = UINT32_LENGTH * 3;
  const moduleStart = tableStart + entryCount * UINT32_LENGTH * 2;
  let position = tableStart;
  for (const entryId in entries) {
    const entry = entries[entryId];
    console.log("Packing " + entryId + " at " + moduleStart + entry.offset);
    buffer.writeUInt32LE(entry.offset, position);
    buffer.writeUInt32LE(entry.length, position + UINT32_LENGTH);
    position += UINT32_LENGTH * 2;

    // Put module into the module glob
    modules[entryId].copy(buffer, moduleStart + entry.offset);
    // NUL byte
    buffer[moduleStart + entry.offset + entry.length - 1] = 0;
  }
  startup.copy(buffer, moduleStart);
  startup[moduleStart + startup.length - 1] = 0;

  return buffer;
};
