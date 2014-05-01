# JAWStats Website Statistics

**Web 2.0 Frontend for AWStats**

This is a fork of the [JAWStats](http://www.jawstats.com), because primary development is dead over 5 years.
Original JAWStats 0.7 beta has some issues and can't work out of the box anymore. It's a great tool, so now this is fixed.

**For today standards it's poorly coded, but it works.**

## Features

  - Quick and Easy to Install
  - User-friendly interface
  - Web 2.0 look and feel
  - Multi-Language
  - Fully Skinnable

## Fixes

  - Deprived of Flash
  - PHP notices and deprecated functions
  - White screen of dead
  - Broken AJAX
  - A separate config for each site
  - AWStats data custom filename
  - Latest JAWStats Language Pack included
  - Files protection with .htaccess

## Why not an AWStats frontend?

  - It's too much server heavy
  - It's ugly and not very user friendly

## Requirements

  - [AWStats](http://awstats.sourceforge.net/)
  - [PHP](http://php.net/)

## Setup

  1. Download or clone this repository

  2. Copy `config.dist.php` to `config.php` and edit (optionally)

  3. Copy `site-configs/example.com.dist.php` to `site-configs/mysite.tld.php` and edit

     *NOTE: Create as many site configs as you need.*

     *NOTE: [Original JAWStats installation guide](http://www.jawstats.com/documentation)*

## Changelog

### 0.9.0

  - Graph display based on the table column header sort
  - Replace all instances of $_GET with $_REQUEST
  - Fix of the AWStats GeoIP plugin illegal HTML data

### 0.8.0

  - Deprived of Flash
  - PHP notices and deprecated functions
  - White screen of dead
  - Broken AJAX
  - A separate config for each site
  - AWStats data custom filename
  - Latest JAWStats Language Pack included
  - Files protection with .htaccess

## Addendum

  Please, if you are interested in this great tool report any issues and don't hesitate to contribute.

[Report a bug](https://github.com/webino/JAWStats) | [Fork me](https://github.com/webino/JAWStats)
