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
- [**Development**](#development)
- [**Author**](#author)

## Features

* Manage multiple Kong Nodes.
* Manage all Kong API Objects with an interactive graph interface, or a more table-like traditional one.
* Helpful and intuitive forms.
* Monitor nodes using health checks.

See some screenshots in the wiki: https://github.com/ligreman/king/wiki/Screenshots-of-features

## Compatibility

King for Kong has been developed to be compatible with Kong API Gateway 2.8.x version. It may be compatible backwards, but it has not been tested.

## Prerequisites

- A [Kong API Gateway](https://docs.konghq.com) instance running
- A web server ([Apache](https://httpd.apache.org/download.cgi), [Nginx](https://nginx.org/en/download.html)...)

## Installation

Download the latest `.zip` [release package](https://github.com/ligreman/king/releases), and unzip it into a web application server ([Apache](https://httpd.apache.org/download.cgi), [Nginx](https://nginx.org/en/download.html)...).

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
