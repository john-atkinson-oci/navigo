Contributing
============

General Guidelines
------------------

* Keep directives small and applicable to the tag - don't put a directive on the body tag
* Limit jQuery use - only inside directives and only if necessary
* Prefer directives over controllers - controllers are obsolete in Angular 2
* Performance is important - avoid bottlenecks like nested loops
* All files contributed require a test spec with 100% coverage
* Customizations should be easy enable/disable (modular).
  * Directives are a good start so they can be easily added/removed from a tag without breaking things.
  * Use local scope in directives - don't rely on outer scope, it could change

Issues
------
If you have a bug or enhancement request: if Voyager Jira system is accessible use that, otherwise please file a Zendesk issue: https://voyagersearch.zendesk.com/hc/en-us

When submitting an issue please include context from your test and
your application. If there's an error, please include the error text.

Code style
----------
* Formatting - Follow the .jshintrc - the build checks this
* Style - Follow the AngularJS Style Guide - https://github.com/johnpapa/angular-styleguide

Commit Messages
----------
* We use the [AngularJS Git Commit Guidelines](https://github.com/angular/angular.js/blob/master/CONTRIBUTING.md#-git-commit-guidelines) - please adhere to these in all commit messages

Software development life-cycle
-------------------------------
There are a some Grunt tasks defined to ease the development cycle. Let's see how to use them:

First, make sure you have npm and grunt-cli installed globally. Let's install the dependencies.

```
# Inside the project dir, install the nodeJS dependencies
$ npm install

And we must install the client libraries dependencies with _bower_ too:
```
$ bower install

Once you have the development dependencies installed, we can use our predefined grunt tasks. For example:

* **grunt test**. Executes the karma unitary tests
* **grunt protractor**. Executes only the e2e tests (some selenium setup required - see https://www.npmjs.com/package/grunt-protractor-runner)
* **grunt default**. The default task tries to build the library file and then runs the JSHint filter and unit tests. Let's see an example:
* **grunt serve**. Runs the app
* **grunt build**. Builds the app
* **grunt serve:dist**. Runs the build

```

After a successful build, a new library distribution file will be generated inside the "dist" folder, which will be ready to distribute:

