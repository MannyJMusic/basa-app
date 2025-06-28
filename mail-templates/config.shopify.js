module.exports = {
  build: {
    destination: {
      path: 'dist/shopify',
    },
    templates: {
      source: 'src/templates/shopify',
    },
  },

  baseImageURL: '',

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
    /**
     * Don't format contents of <style>
     *
     * This is currently required in order to use Liquid variables
     * in CSS. Otherwise `js-beautify` breaks each {{ onto its
     * own row, resulting in invalid Liquid syntax.
     */
    content_unformatted: ['style'],
  }
}
