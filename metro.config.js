const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Configure Metro to handle Node.js polyfills for CCXT
config.resolver = {
  ...config.resolver,
  alias: {
    ...config.resolver.alias,
    // Node.js core modules polyfills
    crypto: 'crypto-js',
    stream: 'stream-browserify',
    buffer: 'buffer',
    process: 'process/browser',
    zlib: 'browserify-zlib',
    path: 'path-browserify',
    querystring: 'querystring',
    url: 'url',
    util: 'util',
    assert: 'assert',
    events: 'events',
    os: 'os-browserify/browser',
    inherits: 'inherits',
    string_decoder: 'string_decoder',
    'safe-buffer': 'safe-buffer',

    // Handle specific problematic imports
    'readable-stream': 'stream-browserify',
    'readable-stream/lib/_stream_readable.js': 'stream-browserify',
    'readable-stream/lib/_stream_writable.js': 'stream-browserify',
    'readable-stream/lib/_stream_duplex.js': 'stream-browserify',
    'readable-stream/lib/_stream_transform.js': 'stream-browserify',

    // Handle CCXT and WebSocket requirements - disable WebSocket for React Native
    ws: false,
    'ws/lib/stream.js': false,
    'ws/lib/stream': false,
    'ws/lib/sender.js': false,

    // Node: prefixed imports
    'node:stream': 'stream-browserify',
    'node:crypto': 'crypto-js',
    'node:buffer': 'buffer',
    'node:util': 'util',
    'node:events': 'events',
    'node:process': 'process/browser',
    'node:os': 'os-browserify/browser',
    'node:path': 'path-browserify',
    'node:querystring': 'querystring',
    'node:url': 'url',
    'node:assert': 'assert',
    'node:zlib': 'browserify-zlib',
  },
  platforms: ['native', 'web', 'default'],
  sourceExts: [...config.resolver.sourceExts, 'cjs'],
};

// Ensure we're using the correct metro version
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    mangle: {
      keep_fnames: true,
    },
  },
};

module.exports = config;
