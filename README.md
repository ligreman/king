## King for [Kong API Gateway](https://docs.konghq.com)

> [!WARNING]
> Since Kong now distributes its UI through the open-source version of Kong API Gateway, this project loses some of its purpose.
> 
> Therefore, and due to a lack of time to keep it updated with new versions of Kong, it will be put on hold.
> 

Complete administration UI for Kong API Gateway.

[![King architect](https://raw.githubusercontent.com/ligreman/king/main/docs/images/cap.png)](https://ligreman.github.io/king)
*https://ligreman.github.io/king*

_King is not official, and does not have any affiliation with [Kong](https://www.konghq.com)._

## Summary

- [**Features**](#features)
- [**Compatibility**](#compatibility)
- [**Prerequisites**](#prerequisites)
- [**Installation**](#installation)
- [**Configuration**](#configuration)
- [**Development**](#development)
- [**Author**](#author)

## Features

* Manage multiple Kong Nodes.
* Manage all Kong API Objects with an interactive graph interface, or a more table-like traditional one.
* Helpful and intuitive forms.
* Monitor nodes using health checks.

See some screenshots in the wiki: https://github.com/ligreman/king/wiki/Screenshots-of-features

## Compatibility

King for Kong has been developed to be compatible with Kong API Gateway 2.8.x version and newer. It may be compatible backwards,
but it has not been tested. It supports Kong 3.X new features like the new router flavour "expressions".

### Supported Authentication plugins

* Key Auth
* JWT
* OAuth 2.0
* LDAP Authentication
* Session

## Prerequisites

- A [Kong API Gateway](https://docs.konghq.com) instance running
- A web server ([Apache](https://httpd.apache.org/download.cgi), [Nginx](https://nginx.org/en/download.html)...)

## Installation

Download the latest `.zip` [release package](https://github.com/ligreman/king/releases), and unzip it into a web
application server ([Apache](https://httpd.apache.org/download.cgi), [Nginx](https://nginx.org/en/download.html)...).

## Configuration

King for Kong is an Angular web application without a backend. This is a limitation when you want to have configuration
parameters persisted among sessions. To cover part of this feature you can have a JSON config file served by an
application server (apache, nginx... maybe the same server serving King) as a static file. Then you can set in King
the url to access this configuration file, and King will load it on start.

Steps to set this up:

1) Create a JSON file with the configuration desired (you have a template in the Examples folder)
2) Serve it with your web server as an static file. For improved security make sure that only the web server is able to
   access the file.
3) Open the settings dialog (gear icon on the left of the Kong nodw url field in the header).
4) Type the config file url.

Note: If no config url is set, King by default will look for the config file at <king url>/config.json. Example: if you are accessing King at http://king.com:8080, King will look for the file at http://king.com:8080/config.json.  

Field description of the config file:

* kong_admin_url: default kong url node to connect to. Note: it can be the Kong loopback url if you are using "Kong loopback security method".
* kong_admin_authorization_method: method used to send the credentials/token. If filled, King will send the credentials along with all requests, using the method selected. Values: "header", "query" or "body". Leave empty if no authorization credentials are needed.
* kong_admin_authorization_field: name of the field where the credentials/token will be sent. For example: "Authorization" (for an authorization header). Other example: "token" (in a query param).
* kong_admin_authorization_token: can be used to send Basic or Bearer tokens in base64 encoding. King will send this in the field indicated, using the method selected. Format: 'Basic <insert here base64 token calculated like base64(username:password)>'. Example: 'Basic dXNlcm5hbWU6cGFzc3dvcmQ='.

### King Globals configuration

Some parameters can be set at code level (they are hardcoded in the source files). You can change them to change King's default behaviour to a certain level. 

The file containing the global configuration is located at `src/app/services/globals.service.ts`

There you have these variables:

```
// Default url for the configuration JSON file
private _CONFIG_URL = '/config.json';

// Enable or disable the config dialog in the interface
private _ALLOW_CONFIG = false;

// Allow users to change the url of the Kong node to connect to
private _ALLOW_CHANGE_KONG_URL = true;

// Allow users to change the url of the JSON configuration file to load
private _ALLOW_CHANGE_CONFIG_FILE_URL = true;
```

## Development

### Prepare environment

Clone the repository to your local machine and install npm dependencies:

```
npm install
```

### Running

```
npm start
```

King for Kong will be available at `http://localhost:4200`

### How to upgrade

To upgrade Angular and Angular Material libraries, use the `npx` tool included with Angular. Example:

`npx @angular/cli@13 update @angular/core@13 @angular/cli@13 --force`

`npx @angular/cli@13 update @angular/material@13 --force`

## Author

[Ligreman (LigreSoftware)](https://ligreman.com)
