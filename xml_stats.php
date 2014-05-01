<?php
/*
 * JAWStats 0.8.0 Web Statistics
 *
 * Copyright (c) 2009 Jon Combe (jawstats.com)
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

require_once "defaults.php";
require_once "config.php";
require_once "clsAWStats.php";

// external include files
if ((isset($g_aConfig["includes"]) == true) && (strlen($g_aConfig["includes"]) > 0)) {
    $aIncludes = explode(",", $g_aConfig["includes"]);
    foreach ($aIncludes as $sInclude) {
        include $sInclude;
    }
}

// select configuraton
$g_sConfig = GetConfig();
$g_aConfig = $aConfig[$g_sConfig];

if (isset($_REQUEST["part"])) {
    $g_sConfig = $g_sConfig . "." . $_REQUEST["part"];
}

// create class
$clsAWStats = new clsAWStats($g_sConfig, $g_aConfig["statspath"], isset($g_aConfig["statsname"]) ? $g_aConfig["statsname"]
            : null, $_REQUEST["year"], $_REQUEST["month"]);

if ($clsAWStats->bLoaded) {
    // create xml
    $sSection = $_REQUEST["section"];
    switch ($sSection) {
        case "BROWSER":
        case "DAY":
        case "DOMAIN":
        case "ERRORS":
        case "FILETYPES":
        case "KEYWORDS":
        case "PAGEREFS":
        case "OS":
        case "ROBOT":
        case "SEARCHWORDS":
        case "SEREFERRALS":
        case "SESSION":
        case "SIDER":
        case "SIDER_404":
        case "TIME":
        case "VISITOR":
        case "EMAILSENDER":
        case "EMAILRECEIVER":
        case "PLUGIN_geoip_city_maxmind":
        case "PLUGIN_geoip_org_maxmind":
            $clsAWStats->OutputXML($clsAWStats->CreateXMLString($sSection));
            break;
    }
} else {
    $clsAWStats->OutputXML("");
}