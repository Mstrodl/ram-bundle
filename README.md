# RAM Bundle Multitool

A packer and unpacker for [react-native](https://reactnative.dev) [RAM bundles](https://reactnative.dev/docs/ram-bundles-inline-requires)!

## Why?
I couldn't find any standalone tools for packing/unpacking the RAM bundle format online, so I made my own

## Usage

Usage is simple, but it depends on what you want to do:
### Unpacking
Unpacking can be done like so:

```
ram-bundle unpack existing.jsbundle entries
```

### Packing
To pack an entries directory, simply run:

```
ram-bundle pack new.jsbundle entries
```

The directory structure of entries should be flat containing zero-indexed js files (for the entry id) and a 'startup.js' file (to be used as the react-native startup module).

Example:
```
$ ls entries
0.js 1.js 2.js 3.js startup.js
```
