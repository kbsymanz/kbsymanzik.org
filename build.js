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
    less = require('metalsmith-less'),
    pagination = require('metalsmith-pagination')
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
  done();
};

// --------------------------------------------------------
// Assumes that it is working with Markdown so needs to be
// placed before the Markdown plugin.
//
// TODO:
// 1. Separate out as a separate plugin.
// 2. Use minimatch for matching patterns.
// 3. Incorporate tests.
// --------------------------------------------------------
var easyImage = function(config) {
  var pattern = config.pattern || void 0;

  return function(files, metalsmith, done) {
    var getFields = function(keys) {
      var flds = [];
      keys.forEach(function(k) {
        if (k.search(/^IMAGE-/)) flds.push(k);
      });
      return flds;
    };

    Object.keys(files).forEach(function(file) {
      if (file.indexOf(pattern) !== -1) {
        var fileObj = files[file];
        var flds = getFields(Object.keys(fileObj));
        var val;
        var contents;
        if (flds) {
          console.log(file);
          console.dir(flds);
          //contents = fileObj.contents.toString();
          //flds.forEach(function(fld) {
            //val = fileObj[fld];
            //contents = contents.replace(fld, "<img src='" + val + "'>");
          //});
          //// Write the finished results back to the node.
          //fileObj.contents.write(contents);
        }
      }
    });
    done();
  };
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
  .concurrency(250)
  .use(less({
    // Just my less file, not the vendor's.
    pattern: 'styles/main.less'
  }))
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
  //.use(easyImage({
    //pattern: 'posts/*.md'
  //}))
  .use(markdown())
  .use(excerpts())
  .use(collections({
    posts: {
      sortBy: 'publishDate',
      reverse: true
    }
  }))
  .use(pagination({
    'collections.posts': {
      perPage: 5,
      template: 'pages.jade',
      first: 'index.html',
      path: 'page/:num/index.html'
    }
  }))
  .use(branch('posts/*.html')
    .use(permalinks({
      pattern: 'posts/:title',
      relative: false
    }))
  )
  .use(branch('posts/legacy/*.html')
    .use(permalinks({
      pattern: 'posts/legacy/:title',
      relative: false
    }))
  )
  .use(templates({
    engine: 'jade',
    moment: moment,
    util: require('util')
  }))
  //.use(logFilesMap)
  .use(serve({
    port: 9000,
    verbose: true
  }))
  // NOTE: this does not seem to work with Metalsmith 2.0.1.
  // (not that it worked that great before.)
  //.use(watch({
    //pattern: '**/*',
    //livereload: true
  //}))
  .build(function (err) {
    if (err) {
      console.log(err);
    }
    else {
      console.log('Site build complete!');
    }
  });

