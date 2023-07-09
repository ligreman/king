## King for [Kong API Gateway](https://docs.konghq.com)

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

King for Kong has been developed to be compatible with Kong API Gateway 2.8.x version. It may be compatible backwards,
but it has not been tested.
It supports Kong 3.X new features like the new router flavour "expressions".

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
application server (apache, nginx... maybe the same that is serving King) as a static file. Then you can set in King
the "Config File Url" parameter to point to that config file, and King will load it on start.

Steps to set this up:

1) Create a JSON file with the configuration desired (you have a template in the Examples folder)
2) Serve it with your web server as an static file. For improved security make sure that only the web server is able to
   access the file.
3) Open the settings dialog (gear icon on the left of the Kong nodw url field in the header).
4) Set the config file url up.

Fields allowed in the config file:

* kongNodeUrl: used if you want to set a default kong url node.

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
