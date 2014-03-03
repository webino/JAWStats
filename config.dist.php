<?php
/**
 * Core config parameters
 */
$sDefaultLanguage    = "en-gb";
$sConfigDefaultView  = "thismonth.all";
$bConfigChangeSites  = true;
$bConfigUpdateSites  = true;
$sUpdateSiteFilename = "xml_update.php";
$sDefaultTimeZone    = "UTC";   // see : http://php.net/manual/en/timezones.php
$bUTF8LogFiles       = false;   // use '.utf8' extension at end of filename, for utf8 version of awstats log file.
$bUseHttpHost        = false;   // use HTTP_HOST enviourment variable as config name.
$bForceHttpHost      = false;   // don't allow other config than HTTP_HOST
$aDesc               = array();

/**
 * DO NOT EDIT BELLOW THIS LINE
 *
 * Include individual site configs.
 */
foreach (glob(__DIR__ . '/site-configs/*.php') as $file) {
    if (!strpos($file, '.dist.php')) {
        include $file;
    }
}
