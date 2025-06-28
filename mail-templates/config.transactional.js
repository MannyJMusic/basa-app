module.exports = {
  build: {
    destination: {
      path: 'dist/transactional',
    },
    templates: {
      source: 'src/templates/transactional',
    },
  },

  inlineCSS: {
    enabled: true,
    applySizeAttribute: {
      width: ['IMG'],
      height: ['IMG'],
    },
  },

  cleanup: {
    removeUnusedCSS: {
      enabled: true,
    },
    keepOnlyAttributeSizes: {
      width: ['IMG', 'VIDEO'],
      height: ['IMG', 'VIDEO'],
    },
    preferBgColorAttribute: true,
  },

  prettify: {
    enabled: true,
  },
}
