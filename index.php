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

header('Content-Type: text/html; charset="utf-8"', true);
error_reporting(0);
set_error_handler("ErrorHandler");

// javascript caching
$gc_sJavascriptVersion = "200901251254";
$g_aTranslation        = array();
$g_aCurrentTranslation = array();

// includes
require_once "clsAWStats.php";
require_once "clsPage.php";
require_once "languages/translations.php";
require_once "defaults.php";
require_once "config.php";

define('WARN_MISSING_PART', 'MissingPart');

function ValidateConfig()
{
    // core values
    // bConfigChangeSites
    if (is_bool($GLOBALS["bConfigChangeSites"]) != true) {
        Error("BadConfig", "bConfigChangeSites");
    }

    // bConfigUpdateSites
    if (is_bool($GLOBALS["bConfigUpdateSites"]) != true) {
        Error("BadConfig", "bConfigUpdateSites");
    }
}
ValidateConfig();
date_default_timezone_set($sDefaultTimeZone);

// select configuraton and translations
$g_sConfig     = GetConfig();
$g_aConfig     = $aConfig[$g_sConfig];
$sLanguageCode = SetTranslation();


// external include files
if ((isset($g_aConfig["includes"]) == true) && (strlen($g_aConfig["includes"]) > 0)) {
    $aIncludes = explode(",", $g_aConfig["includes"]);
    foreach ($aIncludes as $sInclude) {
        include $sInclude;
    }
}

// get date range and valid log file
$year           = array_key_exists("year", $_GET) ? $_GET["year"] : NULL;
$month          = array_key_exists("month", $_GET) ? $_GET["month"] : NULL;
$statsname      = array_key_exists("statsname", $g_aConfig) ? $g_aConfig["statsname"] : NULL;
$parts          = array_key_exists("parts", $g_aConfig) ? $g_aConfig["parts"] : NULL;
$g_dtStatsMonth = ValidateDate($year, $month);
$g_aLogFiles    = GetLogList($g_sConfig, $g_aConfig["statspath"], $statsname, $parts);
$g_iThisLog     = -1;

for ($iIndex = 0; $iIndex < count($g_aLogFiles); $iIndex++) {
    if (($g_dtStatsMonth == $g_aLogFiles[$iIndex][0]) && ($g_aLogFiles[$iIndex][1] == true)) {
        $g_iThisLog = $iIndex;
        break;
    }
}

if ($g_iThisLog < 0) {
    if (count($g_aLogFiles) > 0) {
        $g_iThisLog = 0;
    } else {
        Error("NoLogsFound");
    }
}


$clsPage = new clsPage($GLOBALS["g_aConfig"]["type"]);
if ($clsPage->ValidateView($GLOBALS["sConfigDefaultView"]) != true) {
    Error("BadConfig", "sConfigDefaultView");
}

$sView = array_key_exists("view", $_GET) ? $_GET["view"] : NULL;
// validate current view
if ($clsPage->ValidateView($sView) == true) {
    $sCurrentView = $sView;
} else {
    $sCurrentView = $sConfigDefaultView;
}

$aParts   = array();
$bHaveLog = false;

if (isset($g_aConfig["parts"]))
    $aParts    = explode(",", $g_aConfig["parts"]);
else
    $aParts[0] = "";

$clsAWStats      = array();
$arrMissingParts = array();
foreach ($aParts as $part) {
    $dot_part          = "";
    if (strlen($part) > 0)
        $dot_part          = "." . $part;
    // create class
    $clsAWStats[$part] = new clsAWStats($g_sConfig . $dot_part, array_key_exists("statspath", $g_aConfig)
                ? $g_aConfig["statspath"] : NULL, array_key_exists("statsname", $g_aConfig) ? $g_aConfig["statsname"]
                : NULL, date("Y", $g_aLogFiles[$g_iThisLog][0]), date("n", $g_aLogFiles[$g_iThisLog][0]));

    if ($clsAWStats[$part]->bLoaded != true) {
        Warning(WARN_MISSING_PART, $part, $clsAWStats[$part]->sFileName);
        $arrMissingParts[$part] = $clsAWStats[$part]->sFileName;
    } else {
        $bHaveLog = true;
    }
}

if (!$bHaveLog)
    Error("CannotOpenLog", $clsAWStats[$aParts[0]]->sFileName);
?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <title><?php echo str_replace("[SITE]", GetSiteName(), str_replace("[MONTH]", Lang(date("F", $g_aLogFiles[$g_iThisLog][0])), str_replace("[YEAR]", date("Y", $g_aLogFiles[$g_iThisLog][0]), Lang("Statistics for [SITE] in [MONTH] [YEAR]")))) ?></title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <link rel="stylesheet" href="themes/<?php echo $g_aConfig["theme"] ?>/style.css" type="text/css" />
        <!-- script type="text/javascript" src="js/packed.js?<?php echo $gc_sJavascriptVersion ?>"></script -->

        <script type="text/javascript" src="js/jquery.js"></script>
        <script type="text/javascript" src="js/jquery.json.js"></script>
        <script type="text/javascript" src="js/jquery.tablesorter.js"></script>
        <!--[if IE]><script type="text/javascript" src="js/excanvas.js"></script><![endif]-->
        <script type="text/javascript" src="js/jquery.flot.js"></script>
        <script type="text/javascript" src="js/jquery.flot.pie.js"></script>
        <script type="text/javascript" src="js/jquery.flot.label.js"></script>
        <script type="text/javascript" src="js/jquery.flot.stack.js"></script>


        <?php echo $clsPage->SubMenuJSObj(); ?>

        <script type="text/javascript" src="js/constants.js?<?php echo $gc_sJavascriptVersion ?>"></script>
        <script type="text/javascript" src="js/jawstats.js?<?php echo $gc_sJavascriptVersion ?>"></script>
        <script type="text/javascript" src="js/jawstats_<?php echo $g_aConfig['type'] ?>.js?<?php echo $gc_sJavascriptVersion ?>"></script>
        <script type="text/javascript">
            var g_sConfig = "<?php echo $g_sConfig ?>";
            var g_sParts = "<?php
        echo (array_key_exists('parts', $g_aConfig) ? $g_aConfig['parts'] : '');
        ?>";
            var g_iYear = <?php echo date("Y", $g_aLogFiles[$g_iThisLog][0]) ?>;
            var g_iMonth = <?php echo date("n", $g_aLogFiles[$g_iThisLog][0]) ?>;
            var g_sCurrentView = "<?php echo $sCurrentView ?>";
            var g_dtLastUpdate = <?php echo $clsAWStats[$aParts[0]]->dtLastUpdate ?>;
            var g_iFadeSpeed = <?php echo $g_aConfig["fadespeed"] ?>;
            var g_bUseStaticXML = <?php echo BooleanToText($g_aConfig["staticxml"]) ?>;
            var g_sLanguage = "<?php echo $sLanguageCode ?>";
            var sThemeDir = "<?php echo $g_aConfig["theme"] ?>";
            var sUpdateFilename = "<?php echo $sUpdateSiteFilename ?>";
        </script>
        <script type="text/javascript" src="themes/<?php echo $g_aConfig["theme"] ?>/style.js?<?php echo $gc_sJavascriptVersion ?>"></script>
        <?php
        if ($sLanguageCode != "en-gb") {
            echo "  <script type=\"text/javascript\" src=\"languages/" . $sLanguageCode . ".js\"></script>\n";
        }
        ?>
        <!-- script type="text/javascript" src="http://version.jawstats.com/version.js"></script -->
    </head>

    <body>

        <div id="tools">
            <?php
            if (isset($g_aConfig["parts"]))
                echo ToolChangeParts($g_aConfig["parts"], $arrMissingParts);
            echo ToolChangeMonth();
            echo ToolChangeSite();
            echo ToolUpdateSite();
            echo ToolChangeLanguage();
// echo ToolAdmin();
            ?>
        </div>

        <div id="toolmenu">
            <div class="container">
                <?php
// change parts
                if (isset($g_aConfig["parts"]))
                    echo "<span onclick=\"ShowTools('toolParts')\">" . Lang("Pick Parts") . "</span>\n";
// change month
                echo "<span>";
                if ($g_iThisLog < (count($g_aLogFiles) - 1)) {
                    echo "<img src=\"themes/" . $g_aConfig["theme"] . "/changemonth/first.gif\" onmouseover=\"this.src='themes/" . $g_aConfig["theme"] . "/changemonth/first_on.gif'\" onmouseout=\"this.src='themes/" . $g_aConfig["theme"] . "/changemonth/first.gif'\" class=\"changemonth\" onclick=\"ChangeMonth(" . date("Y,n", $g_aLogFiles[count($g_aLogFiles) - 1][0]) . ")\" />" .
                    "<img src=\"themes/" . $g_aConfig["theme"] . "/changemonth/prev.gif\" onmouseover=\"this.src='themes/" . $g_aConfig["theme"] . "/changemonth/prev_on.gif'\" onmouseout=\"this.src='themes/" . $g_aConfig["theme"] . "/changemonth/prev.gif'\" class=\"changemonth\" onclick=\"ChangeMonth(" . date("Y,n", $g_aLogFiles[$g_iThisLog + 1][0]) . ")\" />";
                } else {
                    echo "<img src=\"themes/" . $g_aConfig["theme"] . "/changemonth/first_off.gif\" class=\"changemonthOff\" />" .
                    "<img src=\"themes/" . $g_aConfig["theme"] . "/changemonth/prev_off.gif\" class=\"changemonthOff\" />";
                }
                echo "<span onclick=\"ShowTools('toolMonth');\">" . Lang("Change Month") . "</span>";
                if ($g_iThisLog > 0) {
                    echo "<img src=\"themes/" . $g_aConfig["theme"] . "/changemonth/next.gif\" onmouseover=\"this.src='themes/" . $g_aConfig["theme"] . "/changemonth/next_on.gif'\" onmouseout=\"this.src='themes/" . $g_aConfig["theme"] . "/changemonth/next.gif'\" class=\"changemonth\" onclick=\"ChangeMonth(" . date("Y,n", $g_aLogFiles[$g_iThisLog - 1][0]) . ")\" />" .
                    "<img src=\"themes/" . $g_aConfig["theme"] . "/changemonth/last.gif\" onmouseover=\"this.src='themes/" . $g_aConfig["theme"] . "/changemonth/last_on.gif'\" onmouseout=\"this.src='themes/" . $g_aConfig["theme"] . "/changemonth/last.gif'\" class=\"changemonth\" onclick=\"ChangeMonth(" . date("Y,n", $g_aLogFiles[0][0]) . ")\" /> ";
                } else {
                    echo "<img src=\"themes/" . $g_aConfig["theme"] . "/changemonth/next_off.gif\" class=\"changemonthOff\" />" .
                    "<img src=\"themes/" . $g_aConfig["theme"] . "/changemonth/last_off.gif\" class=\"changemonthOff\" />";
                }
                echo "</span>\n";

// change site (if available)
                if (($bConfigChangeSites == true) && (count($aConfig) > 1)) {
                    echo "<span onclick=\"ShowTools('toolSite')\">" . Lang("Change Site") . "</span>\n";
                }

// update site (if available)
                if ($bConfigUpdateSites == true) {
                    echo "<span onclick=\"ShowTools('toolUpdate')\">" . Lang("Update Site") . "</span>\n";
                }

// change language
                echo "<span id=\"toolLanguageButton\" onclick=\"ShowTools('toolLanguage')\">" . Lang("Change Language") .
                "<img src=\"themes/" . $g_aConfig["theme"] . "/images/change_language.gif\" /></span>\n";
                ?>
            </div>
        </div>

        <div id="header">
            <img class="logo" style="float:left;" src="themes/<?php echo $g_aConfig["theme"] ?>/images/logo.gif" />
            <div class="container">
                <?php echo $clsPage->DrawHeader($g_aLogFiles[$g_iThisLog][0]) ?>


                <div id="summary">
                    <?php
                    $sTemp = Lang("Last updated [DAYNAME], [DATE] [MONTH] [YEAR] at [TIME] [ELAPSEDTIME] ");

                    if ($g_aConfig["type"] == "mail") {
                        //    $sTemp .= Lang("A total of [TOTALEMAILS] emails this month, an average of [DAILYAVERAGE] ");
                        $sTemp .= ".";
                    } else {

                        $sTemp .= Lang("A total of [TOTALVISITS] visits ([UNIQUEVISITORS] unique) this month, an average of [DAILYAVERAGE] per day ([DAILYUNIQUE] unique).");
                    }
                    $sTemp = str_replace("[DAYNAME]", "<span>" . Lang(date("l", $clsAWStats[$aParts[0]]->dtLastUpdate)), $sTemp);
                    $sTemp = str_replace("[YEAR]", date("Y", $clsAWStats[$aParts[0]]->dtLastUpdate) . "</span>", $sTemp);
                    $sTemp = str_replace("[DATE]", Lang(date("jS", $clsAWStats[$aParts[0]]->dtLastUpdate)), $sTemp);
                    $sTemp = str_replace("[MONTH]", Lang(date("F", $clsAWStats[$aParts[0]]->dtLastUpdate)), $sTemp);
                    $sTemp = str_replace("[TIME]", "<span>" . date("H:i", $clsAWStats[$aParts[0]]->dtLastUpdate) . "</span>", $sTemp);
                    $sTemp = str_replace("[ELAPSEDTIME]", ElapsedTime(time() - $clsAWStats[$aParts[0]]->dtLastUpdate), $sTemp);
                    $sTemp = str_replace("[TOTALVISITS]", "<span>" . number_format(SumTotalVisits($clsAWStats)) . "</span>", $sTemp);
                    $sTemp = str_replace("[UNIQUEVISITORS]", number_format(SumUniqueVisits($clsAWStats)), $sTemp);
                    $sTemp = str_replace("[DAILYAVERAGE]", "<span>" . number_format(CalclDailyVisitAvg($clsAWStats), 1) . "</span>", $sTemp);
                    $sTemp = str_replace("[DAILYUNIQUE]", number_format(CalclDailyUniqueAvg($clsAWStats), 1), $sTemp);
                    echo $sTemp;
                    ?>
                </div>
                <div id="menu">
                    <?php echo $clsPage->DrawMenu(); ?>
                </div>
                <br style="clear: both" />
                <div id="loading">&nbsp;</div>
            </div>
        </div>
        <div id="main">
            <div class="container">
                <div id="content">&nbsp;</div>
                <div id="footer">
                    <?php echo $clsPage->DrawFooter(); ?>
                    <span id="version">&nbsp;</span>
                </div>
            </div>
        </div>
    </body>

</html>

<?php

// output booleans for javascript
function BooleanToText($bValue)
{
    if ($bValue == true) {
        return "true";
    } else {
        return "false";
    }
}

function Warning($sReason, $sParam, $sExtra = "")
{
    if ($sReason == WARN_MISSING_PART) {
        // echo "<h2>Missing Part : ".$sParam." (".$sExtra.")</h2>\n";
    }
}

// error display
function Error($sReason, $sExtra = "")
{
    // echo "ERROR!<br />" . $sReason;
    switch ($sReason) {
        case "BadConfig":
            $sProblem    = str_replace("[FILENAME]", "\"config.php\"", Lang("There is an error in [FILENAME]"));
            $sResolution = "<p>" . str_replace("[VARIABLE]", ("<i>" . $sExtra . "</i>"), Lang("The variable [VARIABLE] is missing or invalid.")) . "</p>";
            break;
        case "BadConfigNoSites":
            $sProblem    = str_replace("[FILENAME]", "\"config.php\"", Lang("There is an error in [FILENAME]"));
            $sResolution = "<p>" . Lang("No individual AWStats configurations have been defined.") . "</p>";
            break;
        case "CannotLoadClass":
            $sProblem    = str_replace("[FILENAME]", "\"clsAWStats.php\"", Lang("Cannot find required file [FILENAME]"));
            $sResolution = "<p>" . Lang("At least one file required by JAWStats has been deleted, renamed or corrupted.") . "</p>";
            break;
        case "CannotLoadConfig":
            $sProblem    = str_replace("[FILENAME]", "\"config.php\"", Lang("Cannot find required file [FILENAME]"));
            $sResolution = "<p>" . str_replace("[CONFIGDIST]", "<i>config.dist.php</i>", str_replace("[CONFIG]", "<i>config.php</i>", Lang("JAWStats cannot find it's configuration file, [CONFIG]. Did you successfully copy and rename the [CONFIGDIST] file?"))) . "</p>";
            break;
        case "CannotLoadLanguage":
            $sProblem    = str_replace("[FILENAME]", "\"languages/translations.php\"", Lang("Cannot find required file [FILENAME]"));
            $sResolution = "<p>" . Lang("At least one file required by JAWStats has been deleted, renamed or corrupted.") . "</p>";
            break;
        case "CannotOpenLog":
            $aConfig     = $GLOBALS["aConfig"][$GLOBALS["g_sConfig"]];
            $sStatsPath  = $aConfig["statspath"];
            /* 	$aConfig = $GLOBALS["aConfig"][$GLOBALS["g_sConfig"]];
              $sStatsPath = $aConfig["statspath"];
              $sStatsName = "awstats" . date("mY") . "." . $GLOBALS["g_sConfig"];
              $parts = array_key_exists("parts", $aConfig)?$aConfig["parts"]:NULL;
              if (strlen($parts) > 0) {
              $arr=explode(",",$parts);
              $sStatsName.=".".$arr[0];
              }
              $sStatsName.=".txt";
              if ($GLOBALS["bUTF8LogFiles"])
              $sStatsName .= ".utf8";
             */
            $sProblem    = Lang("JAWStats could not open an AWStats log file");
            $sResolution = "<p>" . Lang("Is the specified AWStats log file directory correct? Does it have a trailing slash?") . "<br />" .
                str_replace("[VARIABLE]", "<strong>\"statspath\"</strong>", str_replace("[CONFIG]", "<i>config.php</i>", Lang("The problem may be the variable [VARIABLE] in your [CONFIG] file."))) . "</p>" .
                "<p>" . str_replace("[FOLDER]", "<strong>" . $sStatsPath . "</strong>\n", str_replace("[FILE]", "<strong>" . $sExtra . "</strong>", Lang("The data file being looked for is [FILE] in folder [FOLDER]")));
            if (substr($sStatsPath, -1) != "/") {
                $sResolution .= "<br />" . str_replace("[FOLDER]", "<strong>" . $sStatsPath . "/</strong>", Lang("Try changing the folder to [FOLDER]"));
            }
            $sResolution .= "</p>";
            $sResolution .= "<p> Last PHP Error Message : " . $GLOBALS["errstr"] . "</p>";
            break;
        case "NoLogsFound":
            $sStatsPath  = $GLOBALS["aConfig"][$GLOBALS["g_sConfig"]]["statspath"];
            $sProblem    = Lang("No AWStats Log Files Found");
            $sResolution = "<p>JAWStats cannot find any AWStats log files in the specified directory: <strong>" . $sStatsPath . "</strong><br />" .
                "Is this the correct folder? Is your config name, <i>" . $GLOBALS["g_sConfig"] . "</i>, correct?</p>\n";
            if ($GLOBALS["bUTF8LogFiles"])
                $sResolution .= "<p> Note : I was looking for files with '.utf8' extension, as specified in the configuration file</p>";
            break;
        case "Unknown":
            $sProblem    = "";
            $sResolution = "<p>" . $sExtra . "</p>\n";
            break;
    }
    echo "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" " .
    "\"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">\n" .
    "<html xmlns=\"http://www.w3.org/1999/xhtml\">\n" .
    "<head>\n" .
    "<title>JAWStats</title>\n" .
    "<style type=\"text/css\">\n" .
    "html, body { background: #33332d; border: 0; color: #eee; font-family: arial, helvetica, sans-serif; font-size: 15px; margin: 20px; padding: 0; }\n" .
    "a { color: #9fb4cc; text-decoration: none; }\n" .
    "a:hover { color: #fff; text-decoration: underline; }\n" .
    "h1 { border-bottom: 1px solid #cccc9f; color: #eee; font-size: 22px; font-weight: normal; } \n" .
    "h1 span { color: #cccc9f !important; font-size: 16px; } \n" .
    "p { margin: 20px 30px; }\n" .
    "</style>\n" .
    "</head>\n<body>\n" .
    "<h1><span>" . Lang("An error has occured") . ":</span><br />" . $sProblem . "</h1>\n" . $sResolution .
    "<p>" . str_replace("[LINKSTART]", "<a href=\"http://www.jawstats.com/documentation\" target=\"_blank\">", str_replace("[LINKEND]", "</a>", Lang("Please refer to the [LINKSTART]installation instructions[LINKEND] for more information."))) . "</p>\n" .
    "</body>\n</html>";
    exit;
}

// error handler
function ErrorHandler($errno, $errstr, $errfile, $errline, $errcontext)
{
    if (strpos($errfile, "index.php") != false) {
        switch ($errline) {
            case 40:
                Error("CannotLoadClass");
                break;
            case 41:
                Error("CannotLoadClass");
                break;
            case 42:
                Error("CannotLoadLanguage");
                break;
            case 43:
                Error("CannotLoadConfig");
                break;
            default:
                Error("Unknown", ("Line #" . $errline . "<br />" . $errstr));
        }
    } else {
        isset($GLOBALS["errstr"]) or $GLOBALS["errstr"] = '';
        $GLOBALS["errstr"] .= $errstr;
    }
}

// translator
function Lang($sString)
{
    if (isset($GLOBALS["g_aCurrentTranslation"][$sString]) == true) {
        return $GLOBALS["g_aCurrentTranslation"][$sString];
    } else {
        return $sString;
    }
}
