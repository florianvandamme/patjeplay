Patje-Play
==========

### Table of Contents
1. [Disclaimer](#disclaimer)
2. [Prerequisites](#prerequisites)
3. [Installing the project](#installing-the-project)
4. [To Do](#to-do)

### Disclaimer

Patje-Play is your go to party resource. Sharing and listening to the same music at parties with friends made easy. This is an application created with Laravel and Angular based on the YouTube API. Current developers on the project are [Florian Van Damme](http://vandammeflorian.be) and [Arno Gekiere](https://www.couchsurfing.com/users/2000109888).

### Prerequisites

Patje-Play is being developed in [Laravel 5](http://laravel.com/). We highly suggest you should run Laravel through [Homestead](http://laravel.com/docs/master/homestead) please refer to the corresponding documentation on how to run a Laravel project using Homestead. There is also a video available on [Laracasts](https://laracasts.com/series/laravel-5-fundamentals/episodes/2) on how to install Homestead, we highly recommend this guide.

To share code we use [Git](#installing-git).

For installing our PHP packages and managing the Laravel project we use [Composer](#installing-composer).

Other dependencies used in this project are [Angular](https://angularjs.org/) and [jQuery](https://jquery.com/). These are both managed and installed by using [Bower](#installing-bower).

To manage our styles and scripts (and minify them on production) we're using [Gulp](#installing-gulp) in combination with [Elixir](http://laravel.com/docs/5.0/elixir).

##### Installing Git

[Git](https://git-scm.com/) is used to share our code. The easiest way to install Git for Windows is [downloading the latest client](http://git-scm.com/download/win). Once downloaded run the .msi file and go follow the steps provided by the installer. We use the default configuration but for more information and a detailed guide please refer to the [official documentation](https://git-scm.com/doc).

##### Installing Composer

To install [Composer](https://getcomposer.org/) on a Windows system we can use the official installer. To download the installer [click here](https://getcomposer.org/Composer-Setup.exe). Once downloaded run the official installer. During the install the wizard will ask if you want to add Composer to your PATH environment variable. This is required if you want the Composer command to be accessible globally, so please make sure you check this box. Else you will need to add the Composer file to your PATH environment variable manually. To do so please refer to the [official documentation](https://getcomposer.org/doc/).

##### Installing Bower

To install [Bower](http://bower.io/). We first need to install [NodeJS](https://nodejs.org/en/). To do so [download this file for Windows](https://nodejs.org/dist/latest/node-v4.1.0-x64.msi) and run the installer. Just use the default settings provided by the installer and you should be good.
Next up open Git Bash, which we installed in the previous step. Run the following code:
```
$ node -v
4.1.0
```

and

```
$ npm -v
2.14.3
```
if both version numbers were returned the installation was successful. Next up is installing Bower globally on your system. To do this we have to run the following command in Git Bash:
```
$ npm install -g bower
```
Git Bash should now have installed Bower. To confirm a correct installation we run the following command:
```
$ bower -v
1.5.2
```
Again, if the version number is returned the installation was successful. 

### Installing Gulp

We'll install [Gulp](http://gulpjs.com/) as a global NPM package. To achieve this we run this command:
```
$ npm install -g gulp
```
After the installation is finished we run 
```
$ gulp -v
[15:50:28] CLI version 3.9.0
[15:50:28] Local version 3.9.0
```
to check if the installation was successful, again if the version numbers are returned correct the installation succeeded.

If everything was installed correctly you are now ready to [install Patje-Play](#installing-the-project).

### Installing the project

To install Patje-Play we open up Git Bash and navigate to our Code folder. This folder is defined in the Homestead.yml file created during the installation of Homestead. If you not have Homestead installed please refer to our [prerequisites](#prerequisites) section and follow our guide. If you've followed the official Homestead documentation the follow path should be your Code folder. If you're running a custom Homestead installation please change your path accordingly.
```
$ cd ~/Code
```
After successfully navigating to this folder we create a folder where our project will be stored
```
$ mkdir PatjePlay
```
After creating the folder we navigate to the folder:
```
$ cd PatjePlay
```
We clone the Patje-Play project in this folder by using the following command (note: the ```.``` at the end is important!): 
```
$ git clone https://link-to-patje-play.git .
```
Next up we have to edit our Homestead.yml file. Run this command:
```
$ homestead edit
```
in the Homestead.yml file we add the following block of code to the ```sites``` section. 
```
sites:
    - map: patjeplay.dev
      to: /home/vagrant/Code/PatjePlay/public
```
Make sure to save the file and close it. Next up is editing our ```etc/hosts``` file. On a Windows system this is done by opening Notepad (!important right-click and run as Administrator, else you're not able to save the file). Once opened hit ```ctrl + o``` to open a new file and navigate to the ```etc/hosts``` file. This file is located at ```C:\Windows\System32\drivers\etc``` make sure you filter on "All Files" and select the ```hosts``` file. Add the follow line on the bottom of the file:
```
192.168.10.10 patjeplay.dev	
```
again this line is only correct if you used the default Homestead installation. If you have a custom installation the IP-address may differ from the one above.  

Once the project is cloned in the folder we need to install all our dependencies. This is done by running Composer. First we need to navigate to our project folder:
```
$ cd ~/Code/PatjePlay
```
once we've successfully navigated here we run Composer:
```
$ composer install
```
Composer should now install everything that's needed for our project. 

Next up is running Bower and making sure all our front-end dependencies are in place. First we need to make sure the correct Bower configuration file is present. Check if there's a file name ```.bowerrc``` present in the root of the project. If not create it: 
```
$ touch .bowerrc
```
Once you've created or located the file make sure the content is the following: 
```
{
  "directory": "resources/assets/js"
}
```
After this we're ready to run the installation with this command:
```
$ bower install
```
Everything from the ```Bower.json``` file should now be downloaded and installed in the correct assets folder.

Last but not least we have to install Laravel Elixir, we do this by running
```
$ npm install --no-bin-links
```
NPM is now downloading and installing all the required files to run elixir. Note: on non-Windows machines you can run the command without the ```--no-bin-links``` parameter.

Once the installation of Elixir is completed we need to edit the ```gulpfile.js``` file in the root of the application. It should look like this:
```
elixir(function(mix) {
    mix.sass('app.scss');
    mix.scripts([
        'angular/angular.min.js',
        'angular-resource/angular-resource.min.js',
        'jquery/dist/jquery.min.js',
        'custom/main.js'
    ],
        'public/js/main.js'
    );
});
```
You are now ready to run Gulp and compile all the JavaScript and CSS needed to run Patje-Play. There are two possible options to achieve this. 
On first use we recommend running
```
$ gulp
```
this will compile everything and output the files to the specified folder. This is useful but you don't want to run this every time some piece of JavaScript or CSS changes. So when developing we recommend running
```
$ gulp watch
```
this will automatically detect when you save your files and output the changes to the files rendered in the browser. But when you are ready to deploy a large chunk of code we recommend running
```
$ gulp --production
```
this command will compile and minify everything. This will make your scripts run faster and makes it harder for [Swiper](http://dora.wikia.com/wiki/Swiper) to steal your code. 

When this is done we're ready to boot up our virtual machine by running:
```
$ homestead up
```
After waiting a few moments the Homestead box should boot up and we're ready to open our project for the first time! To open the project open your favorite browser and navigate to 
[http://patjeplay.dev](http://patjeplay.dev). You should now see the main screen of Patje-Play, happy developing! 

### To do

Set up Angular

Set up the migrations and make the registration work