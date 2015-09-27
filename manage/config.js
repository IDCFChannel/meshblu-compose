'use strict';
var path = require('path');

var filter = {
        html: '**/*.html',
        js: '**/*.js',
        css: '**/*.css'
    },
    srcDir = './src',
    src = {
        server: srcDir + '/server/',
        client: srcDir + '/client/',
        scripts: srcDir + '/client/js/' + filter.js,
        images: './images/**',
        views: './views/' + filter.html
    },
    distDir = './dist',
    dist = {
        base: distDir,
        js: distDir + '/js/',
        css: distDir + '/css/'
    },
    output = {
        buildJs: 'bundle.js',
        buildCss: 'bundle.css',
        bowerJs: 'vendor.js',
        bowerCss: 'vendor.css',
        minJs: '.min.js',
        minCss: '.min.css'
    };

module.exports = {
    src: src,
    dist: dist,
    filter: filter,
    output: output
};
