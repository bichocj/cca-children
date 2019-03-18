// See http://brunch.io for documentation.
exports.files = {
  javascripts: {
    joinTo: {
      '../../common/vendor.js': /^(?!app)/, // Files that are not in `app` dir.
      '../../common/app.js': /^app/
    }
  },
  stylesheets: { joinTo: {
      '../../common/app.css': /^app/
    }
  }
};

exports.plugins = {
  babel: {
    presets: ['latest']
  },
  sass: {
    options: {
      includePaths: ['./node_modules/bootstrap/scss/'],
      precision: 8
    }
  }
};

exports.npm = {
  globals: {
    $: 'jquery',
    jQuery: 'jquery'
  }
}