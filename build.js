var metalsmith = require('metalsmith'),
    templates = require('metalsmith-templates'),
    markdown = require('metalsmith-markdown')
    serve = require('metalsmith-serve'),
    watch = require('metalsmith-watch')
    collections = require('metalsmith-collections'),
    branch = require('metalsmith-branch'),
    permalinks = require('metalsmith-permalinks'),
    excerpts = require('metalsmith-excerpts'),
    concat = require('metalsmith-concat'),
    copy = require('metalsmith-copy'),
    moment = require('moment');

// --------------------------------------------------------
// http://blog.lecomte.me/posts/2014/gentle-intro-metalsmith/way-of-metalsmith/
// --------------------------------------------------------
var logFilesMap = function(files, metalsmith, done) {
    Object.keys(files).forEach(function (file) {
        var fileObject = files[file];

        if (file.indexOf('posts') === 0) {
          console.log("key -------> ", file);
          console.log("value -----> ", fileObject);
        }
    });
};

var siteBuild = metalsmith(__dirname)
  .metadata({
    site: {
      title: 'Symanzik Family Update',
      tagline: 'family news and more',
      url: 'localhost'
    }
  })
  .source('./src')
  .destination('./out')
  .use(concat({
    files: [
      'bower_components/jquery/dist/jquery.js',
      'bower_components/bootstrap/dist/js/bootstrap.js'
    ],
    output: 'js/vendor.js'
  }))
  .use(concat({
    files: [
     'bower_components/bootstrap/dist/css/bootstrap.css'
    ],
    output: 'styles/vendor.css'
  }))
  .use(copy({
    pattern: 'bower_components/bootstrap/dist/css/*.map',
    directory: 'styles/'
  }))
  .use(copy({
    pattern: 'bower_components/bootstrap/dist/fonts/*',
    directory: 'fonts/'
  }))
  .use(markdown())
  .use(excerpts())
  .use(collections({
    posts: {
      pattern: 'posts/**.html',
      sortBy: 'publishDate',
      reverse: true
    }
  }))
  .use(branch('posts/**.html')
    .use(permalinks({
      pattern: 'posts/:title',
      relative: false
    }))
  )
  .use(templates({
    engine: 'jade',
    moment: moment    // make the moment library available to the templates
  }))
  .use(logFilesMap)
  .use(serve({
    port: 9000,
    verbose: true
  }))
  .use(watch({
    pattern: '**/*',
    livereload: true
  }))
  .build(function (err) {
    if (err) {
      console.log(err);
    }
    else {
      console.log('Site build complete!');
    }
  });

