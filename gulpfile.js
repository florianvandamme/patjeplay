var elixir = require('laravel-elixir');

/*
 |--------------------------------------------------------------------------
 | Elixir Asset Management
 |--------------------------------------------------------------------------
 |
 | Elixir provides a clean, fluent API for defining some basic Gulp tasks
 | for your Laravel application. By default, we are compiling the Sass
 | file for our application, as well as publishing vendor resources.
 |
 */

elixir(function(mix) {
    mix.styles([
        'normalize.css',
        'site.css',
        'font-awesome.min.css'
    ],
        'public/css/site.css'
    ).styles([
        'normalize.css',
        'main.css',
        'font-awesome.min.css'
    ],
        'public/css/main.css'
    );

    mix.scripts([
        'angular/angular.min.js',
        'angular-resource/angular-resource.min.js',
        'jquery/dist/jquery.min.js',
        'custom/youtube.js',
        'custom/main.js'
    ],
        'public/js/main.js'
    ).scripts([
        'angular/angular.min.js',
        'angular-resource/angular-resource.min.js',
        'jquery/dist/jquery.min.js',
        'custom/site.js'
    ],
        'public/js/site.js'
    );

});
