System.config({
  "paths": {
    "*": "*.js",
    "github:*": "jspm_packages/github/*.js",
    "npm:*": "jspm_packages/npm/*.js"
  }
});

System.config({
  "map": {
    "angular": "github:angular/bower-angular@^1.3.4",
    "text": "github:systemjs/plugin-text@^0.0.2",
    "theseus": "github:argo-rest/theseus@master",
    "github:argo-rest/theseus@master": {
      "reqwest": "github:ded/reqwest@^1.1.2",
      "uri-templates": "npm:uri-templates@^0.1.5",
      "jquery": "github:components/jquery@^2.1.1"
    },
    "github:jspm/nodelibs@0.0.5": {
      "Base64": "npm:Base64@^0.2.0",
      "base64-js": "npm:base64-js@^0.0.4",
      "ieee754": "npm:ieee754@^1.1.1",
      "inherits": "npm:inherits@^2.0.1",
      "json": "github:systemjs/plugin-json@^0.1.0",
      "pbkdf2-compat": "npm:pbkdf2-compat@^2.0.1",
      "ripemd160": "npm:ripemd160@^0.2.0",
      "sha.js": "npm:sha.js@^2.2.6"
    },
    "npm:Base64@0.2.1": {},
    "npm:base64-js@0.0.4": {},
    "npm:ieee754@1.1.4": {},
    "npm:inherits@2.0.1": {},
    "npm:json@9.0.2": {},
    "npm:pbkdf2-compat@2.0.1": {},
    "npm:ripemd160@0.2.0": {},
    "npm:sha.js@2.3.0": {},
    "npm:uri-templates@0.1.5": {
      "json": "npm:json@^9.0.2"
    }
  }
});

System.config({
  "versions": {
    "github:angular/bower-angular": "1.3.4",
    "github:argo-rest/theseus": "master",
    "github:components/jquery": "2.1.1",
    "github:ded/reqwest": "1.1.5",
    "github:jspm/nodelibs": "0.0.5",
    "github:systemjs/plugin-json": "0.1.0",
    "github:systemjs/plugin-text": "0.0.2",
    "npm:Base64": "0.2.1",
    "npm:base64-js": "0.0.4",
    "npm:ieee754": "1.1.4",
    "npm:inherits": "2.0.1",
    "npm:json": "9.0.2",
    "npm:pbkdf2-compat": "2.0.1",
    "npm:ripemd160": "0.2.0",
    "npm:sha.js": "2.3.0",
    "npm:uri-templates": "0.1.5"
  }
});

