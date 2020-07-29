const fs = require("fs");
const path = require("path");
const packer = require("../lib/pack");
const unpacker = require("../lib/unpack");

async function cli() {
  const action = process.argv[2];
  if (action == "pack") {
    function syntax() {
      console.error(
        "Syntax: " +
          process.argv[1] +
          " pack /path/to/new.jsbundle /path/to/directory"
      );
    }
    const jsbundle = process.argv[3];
    const dir = process.argv[4];
    if (!jsbundle || !dir) return syntax();
    let files = null;
    try {
      files = await fs.promises.readdir(dir);
    } catch (err) {
      if (err.code == "ENOENT" || err.code == "ENOTDIR") {
        return console.error("No such input directory");
      } else {
        throw err;
      }
    }
    const modules = {};
    const promises = new Set();
    for (const file of files) {
      if (!file.endsWith(".js")) {
        continue;
      }
      const id = file.slice(0, -3);
      promises.add(
        fs.promises.readFile(path.join(dir, file)).then(function (data) {
          modules[id] = data;
        })
      );
    }
    await Promise.all(promises);
    console.log("Loaded entries into memory");
    const bundle = packer.pack(modules);
    console.log("Created bundle, writing to disk");
    await fs.promises.writeFile(jsbundle, bundle);
    console.log("Done!");
  } else if (action == "unpack") {
    function syntax() {
      console.error(
        "Syntax: " +
          process.argv[1] +
          " pack /path/to/your.jsbundle /path/to/output/directory"
      );
    }
    const jsbundle = process.argv[3];
    const dir = process.argv[4];
    if (!jsbundle || !dir) return syntax();
    console.log("Loading bundle");
    const bundle = await fs.promises.readFile(jsbundle);
    console.log("Unpacking bundle");
    const modules = unpacker.unpack(bundle);
    console.log("Writing to disk");
    await unpacker.write(modules, dir);
    console.log("Done!");
  } else {
    const log = action == "help" ? console.log : console.error;
    log("Usage: " + process.argv[1] + " ACTION OPTIONS...");
    log("Where ACTION is one of 'pack' or 'unpack'");
    if (action != "help") {
      process.exit(1);
    }
  }
}

cli();
