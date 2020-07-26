Protos
======

Protos is a small library that preserves the original object definition per each scope (according to the script file URL).

How to install?
---------------
All you need is to add this library as the first script in your HTML page.

```html
<html>
    <head>
        <title>...</title>
        <script src="https://slavikme.github.io/protos/dist/protos-1.0.0-min.js" 
                type="application/javascript"></script>
        ...
    </head>
    <body>
        ...
    </body>
</html>
```

How to use?
-----------
By default, Protos will monitor automatically all native function of major types: `Array`, `String`, `Number`, `Boolean`, `Function`, `BigInt`, `Object` and `RegExp`.

If you want to add monitors to other objects, just wrap it with `Protos` function.  
For example:
```js
Protos(HTMLElement.prototype);
```

Configurations
--------------
By default, Protos will scope the script files by origin. If you like to change it, the following scope options are available:
> The script path in the following examples is `https://sub.example.com:8080/some/dir/file.js?param=value`  
 - `hostname` - The hostname/domain part of the URL (without port number). E.g. The `sub.example.com` part.
 - `origin` - Origin of the URL, including the protocol, the hostanme and the port. E.g. The `https://sub.example.com:8080` part.
 - `dir` - The whole URL including the full directory path. E.g. The `https://sub.example.com:8080/some/dir` part.
 - `file` - The whole full filename, directory and the origin. E.g. The `https://sub.example.com:8080/some/dir/file.js` part.
 - `href` - The whole URL path. E.g. The whole URL `https://sub.example.com:8080/some/dir/file.js?param=value`. 

In order to change it, just pass the `scope` parameter to the `protos.js` script, with the value as one of the options above.  
For example:
```html
<script src="https://slavikme.github.io/protos/dist/protos-1.0.0-min.js?scope=file" 
        type="application/javascript"></script>
``` 

Demo
----
See the [example page](https://slavikme.github.io/protos/example/) to view a sample show-case of the library. 

Contribution
------------
You are more than welcome to expand and contribute to this library.
Just create a new pull-request in GitHub, and we will go from there. 
