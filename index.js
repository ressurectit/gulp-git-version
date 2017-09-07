const gulp = require('gulp'),
      fileExists = require('file-exists'),
      file = require('gulp-file'),
      read = require('read-file'),
      handlebars = require('gulp-compile-handlebars'),
      VersionsExtractor = require('npm-git-version').VersionsExtractor,
      StringDecoder = require('string_decoder').StringDecoder,
      decoder = new StringDecoder('utf8');

module.exports = function gitVersion(options, cb)
{
    var currentVersion = null;
    var fullPath = `${options.path}/${options.filename}`;

    if(fileExists.sync(fullPath))
    {
        var contents = decoder.end(read.sync(fullPath));

        currentVersion = new RegExp(options.currentVersionRegex, 'gi').exec(contents)[1];
    }

    var extractor = new VersionsExtractor(options.extractorOptions);

    extractor.process()
        .then(extractor =>
        {
            console.log(`
Branch name is '${extractor.branchName}'
Branch prefix is '${extractor.branchPrefix}'
Branch version is '${extractor.branchVersion}'
Last matching version is '${extractor.lastMatchingVersion}'
Computed version is '${extractor.version}'`);

            file(options.filename, options.template, { src: true })
                .pipe(handlebars({version: extractor.version}))
                .pipe(gulp.dest(options.path))
                .on('finish', function ()
                {
                    cb();
                });
        })
        .catch(reason =>
        {
            console.error(`Processing failed: '${reason}'!`);

            process.exit(-1);
        });
}