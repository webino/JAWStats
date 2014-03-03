<?php
/**
 * Individual site configuration
 */
$aConfig["example.com"] = array(
    "statsname"    => "awstats[MM][YYYY].txt",
    "statspath"    => "/path/to/data/awstats/",
    "updatepath"   => "/path/to/cgi-bin/awstats.pl/",
    "preupdate"    => "",
    "postupdate"   => "",
    "siteurl"      => "http://example.com",
    "sitename"     => "example.com",
    "theme"        => "default",
    "fadespeed"    => 250,
    "password"     => "",
    "includes"     => "",
    "language"     => "en-gb",
    "type"         => "web",
    "urlaliasfile" => "", // optional, read url alias file, display page titles instead of urls under 'Pages' tab
    "parts"        => ""  // Optional (only if you want to combine/stack multiple awstats logs)
);
