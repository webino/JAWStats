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

class clsAWStats
{
    var $sAWStats        = "";
    var $bLoaded         = false;
    var $iYear           = 0;
    var $iMonth          = 0;
    var $dtLastUpdate    = 0;
    var $iTotalVisits    = 0;
    var $iUniqueVisits   = 0;
    var $arrLabel        = array();
    var $arrLogMonths    = array();
    var $siteName        = array();
    var $dtStartOfMonth  = 0;
    var $iDaysInMonth    = 0;
    var $iDailyVisitAvg  = 0;
    var $iDailyUniqueAvg = 0;
    var $sFileName       = "";

    function __construct($sStatName, $sFilePath = "", $sFileName = "", $iYear = 0, $iMonth = 0)
    {
        // validate dates
        $dtDate       = ValidateDate($iYear, $iMonth);
        $this->iYear  = date("Y", $dtDate);
        $this->iMonth = date("n", $dtDate);

        // load data
        if (strlen($sFileName) == 0) {
            $sFileName = ("awstats[MM][YYYY]." . $sStatName . ".txt");
            if ($GLOBALS["bUTF8LogFiles"])
                $sFileName .= ".utf8";
        }
        $sFileName = str_replace("[YYYY]", $this->iYear, $sFileName);
        $sFileName = str_replace("[YY]", substr($this->iYear, 2), $sFileName);
        if ($this->iMonth < 10) {
            $sFileName = str_replace("[MM]", ("0" . $this->iMonth), $sFileName);
        } else {
            $sFileName = str_replace("[MM]", $this->iMonth, $sFileName);
        }
        $sFileName = str_replace("[M]", $this->iMonth, $sFileName);
        $sFilePath = ($sFilePath . $sFileName);

        $this->sFileName = $sFileName;

        if (is_readable($sFilePath)) {
            $this->sAWStats = htmlspecialchars(file_get_contents($sFilePath), ENT_SUBSTITUTE);
            $this->bLoaded  = true;
        }
        else
            return;

        // get summary data
        $arrData            = $this->GetSection("GENERAL");
        $sLastUpdate        = $this->GetSummaryElement($arrData, "lastupdate", 1);
        $this->dtLastUpdate = strtotime($this->GetSummaryElement($arrData, "lastupdate", 1));
        $this->dtLastUpdate = mktime(abs(substr($sLastUpdate, 8, 2)), abs(substr($sLastUpdate, 10, 2)), abs(substr($sLastUpdate, 12, 2)), abs(substr($sLastUpdate, 4, 2)), abs(substr($sLastUpdate, 6, 2)), abs(substr($sLastUpdate, 0, 4)));
        $this->iTotalVisits = $this->GetSummaryElement($arrData, "totalvisits", 1);
        $this->iTotalUnique = $this->GetSummaryElement($arrData, "totalunique", 1);

        // populate label array
        $this->arrLabel["BROWSER"]                   = array("id", "hits");
        $this->arrLabel["DAY"]                       = array("date", "pages", "hits", "bw", "visits");
        $this->arrLabel["DOMAIN"]                    = array("id", "pages", "hits", "bw");
        $this->arrLabel["ERRORS"]                    = array("id", "hits", "bw");
        $this->arrLabel["FILETYPES"]                 = array("id", "hits", "bw", "noncompressedbw", "compressedbw");
        $this->arrLabel["KEYWORDS"]                  = array("word", "freq");
        $this->arrLabel["OS"]                        = array("id", "hits");
        $this->arrLabel["PAGEREFS"]                  = array("url", "pages", "hits");
        $this->arrLabel["ROBOT"]                     = array("id", "hits", "bw", "lastvisit", "robotstxt");
        $this->arrLabel["SEARCHWORDS"]               = array("phrase", "freq");
        $this->arrLabel["SEREFERRALS"]               = array("id", "pages", "hits");
        $this->arrLabel["SESSION"]                   = array("range", "freq");
        $this->arrLabel["SIDER"]                     = array("url", "pages", "bw", "entry", "exit");
        $this->arrLabel["SIDER_404"]                 = array("url", "hits", "referrer");
        $this->arrLabel["TIME"]                      = array("hour", "pages", "hits", "bw", "notviewedpages",
            "notviewedhits", "notviewedbw");
        $this->arrLabel["VISITOR"]                   = array("address", "pages", "hits", "bw", "lastvisit",
            "lastvisitstart", "lastvisitpage", "desc");
        $this->arrLabel["EMAILSENDER"]               = array("address", "emails", "bw", "lastvisit");
        $this->arrLabel["EMAILRECEIVER"]             = array("address", "emails", "bw", "lastvisit");
        $this->arrLabel["PLUGIN_geoip_city_maxmind"] = array("id", "pages", "hits", "bw", "lastvisit");
        $this->arrLabel["PLUGIN_geoip_org_maxmind"]  = array("id", "pages", "hits", "bw", "lastvisit");


        // days in month
        if (($this->iYear == date("Y")) && ($this->iMonth == date("n"))) {
            $this->iDaysInMonth = abs(date("s", $this->dtLastUpdate));
            $this->iDaysInMonth += (abs(date("i", $this->dtLastUpdate)) * 60);
            $this->iDaysInMonth += (abs(date("H", $this->dtLastUpdate)) * 60 * 60);
            $this->iDaysInMonth = abs(date("j", $this->dtLastUpdate) - 1) + ($this->iDaysInMonth / (60 * 60 * 24));
        } else {
            $this->iDaysInMonth = date("d", mktime(0, 0, 0, date("n", $this->dtLastUpdate), 0, date("Y", $this->dtLastUpdate)));
        }

        // start of the month
        $this->dtStartOfMonth  = mktime(0, 0, 0, $this->iMonth, 1, $this->iYear);
        $this->iDailyVisitAvg  = ($this->iTotalVisits / $this->iDaysInMonth);
        $this->iDailyUniqueAvg = ($this->iTotalUnique / $this->iDaysInMonth);
    }

    function CreateJSON($sSection)
    {
        echo json_encode($this->GetSection($sSection));
    }

    function CreatePagesXMLString($urlAliasFile = null)
    {
        // produce xml
        $aXML    = array();
        $aData   = $this->GetSection("SIDER");
        $dTitles = null;

        // Page Titles
        if ($urlAliasFile !== null) {
            $aTitles = file($urlAliasFile);
            foreach ($aTitles as $line) {
                $line_parts              = explode("\t", $line);
                $dTitles[$line_parts[0]] = $line_parts[1];
            }
        }

        // count totals
        $iTotalPages = 0;
        $iTotalBW    = 0;
        $iTotalEntry = 0;
        $iTotalExit  = 0;
        for ($iIndexItem = 0; $iIndexItem < count($aData); $iIndexItem++) {
            $aData[$iIndexItem][1] = abs($aData[$iIndexItem][1]);
            $aData[$iIndexItem][2] = abs($aData[$iIndexItem][2]);
            $aData[$iIndexItem][3] = abs($aData[$iIndexItem][3]);
            $aData[$iIndexItem][4] = abs($aData[$iIndexItem][4]);

            $iTotalPages += $aData[$iIndexItem][1];
            $iTotalBW += $aData[$iIndexItem][2];
            $iTotalEntry += $aData[$iIndexItem][3];
            $iTotalExit += $aData[$iIndexItem][4];
        }

        // define size
        $iSize = 50;

        // last update and totals
        $sHaveTitles = ($dTitles == null) ? ("\"0\"") : ("\"1\"");
        $aXML[]      = ("<info lastupdate=\"" . $this->dtLastUpdate . "\" haveTitles=" . $sHaveTitles . "/>\n" .
            "<totals pages=\"" . $iTotalPages . "\" bw=\"" . $iTotalBW . "\" entry=\"" .
            $iTotalEntry . "\" exit=\"" . $iTotalExit . "\" />\n");


        // sort by page views
        usort($aData, "Sort1");
        $aXML[] = "<data_pages>";
        for ($iIndexItem = 0; $iIndexItem < count($aData); $iIndexItem++) {
            $sTemp = "";
            for ($iIndexAttr = 0; $iIndexAttr < count($aData[$iIndexItem]); $iIndexAttr++) {
                $sTemp .= $this->arrLabel["SIDER"][$iIndexAttr] . "=\"" . trim($aData[$iIndexItem][$iIndexAttr]) . "\" ";
            }

            // add title (if available)
            if ($dTitles !== null) {
                $url   = $aData[$iIndexItem][0];
                $title = $dTitles[$url];
                $sTemp .= " title= \"" . trim($title) . "\"";
            }

            $aXML[] = ("<item " . $sTemp . "/>\n");
            if ($iIndexItem > $iSize) {
                break;
            }
        }
        $aXML[] = "</data_pages>\n";

        // sort by bandwidth
        usort($aData, "Sort2");
        $aXML[] = "<data_bw>";
        for ($iIndexItem = 0; $iIndexItem < count($aData); $iIndexItem++) {
            $sTemp = "";
            for ($iIndexAttr = 0; $iIndexAttr < count($aData[$iIndexItem]); $iIndexAttr++) {
                $sTemp .= $this->arrLabel["SIDER"][$iIndexAttr] . "=\"" . trim($aData[$iIndexItem][$iIndexAttr]) . "\" ";
            }
            $aXML[] = ("<item " . $sTemp . "/>\n");
            if ($iIndexItem > $iSize) {
                break;
            }
        }
        $aXML[] = "</data_bw>\n";

        // sort by bandwidth
        usort($aData, "Sort3");
        $aXML[] = "<data_entry>";
        for ($iIndexItem = 0; $iIndexItem < count($aData); $iIndexItem++) {
            $sTemp = "";
            for ($iIndexAttr = 0; $iIndexAttr < count($aData[$iIndexItem]); $iIndexAttr++) {
                $sTemp .= $this->arrLabel["SIDER"][$iIndexAttr] . "=\"" . trim($aData[$iIndexItem][$iIndexAttr]) . "\" ";
            }
            $aXML[] = ("<item " . $sTemp . "/>\n");
            if ($iIndexItem > $iSize) {
                break;
            }
        }
        $aXML[] = "</data_entry>\n";

        // sort by bandwidth
        usort($aData, "Sort4");
        $aXML[] = "<data_exit>";
        for ($iIndexItem = 0; $iIndexItem < count($aData); $iIndexItem++) {
            $sTemp = "";
            for ($iIndexAttr = 0; $iIndexAttr < count($aData[$iIndexItem]); $iIndexAttr++) {
                $sTemp .= $this->arrLabel["SIDER"][$iIndexAttr] . "=\"" . trim($aData[$iIndexItem][$iIndexAttr]) . "\" ";
            }
            $aXML[] = ("<item " . $sTemp . "/>\n");
            if ($iIndexItem > $iSize) {
                break;
            }
        }
        $aXML[] = "</data_exit>\n";

        // return
        return implode("", $aXML);
    }

    function CreateXMLString($sSection)
    {
        // produce xml
        $aXML    = array();
        $arrData = $this->GetSection($sSection);
        $aXML[]  = "<info lastupdate=\"" . $this->dtLastUpdate . "\" />\n<data>\n";
        for ($iIndexItem = 0; $iIndexItem < count($arrData); $iIndexItem++) {
            $sTemp = "";
            for ($iIndexAttr = 0; $iIndexAttr < count($arrData[$iIndexItem]); $iIndexAttr++) {
                $sTemp .= $this->arrLabel[$sSection][$iIndexAttr] . "=\"" . htmlspecialchars(urldecode(trim($arrData[$iIndexItem][$iIndexAttr]))) . "\" ";
            }
            $aXML[] = ("<item " . $sTemp . "/>\n");
        }
        $aXML[] = "</data>\n";
        return implode("", $aXML);
    }

    function GetSection($sSection)
    {
        $arrData   = array();
        $iStartPos = strpos($this->sAWStats, ("\nBEGIN_" . $sSection . " "));
        if ($iStartPos === FALSE)
            return array();
        $iEndPos   = strpos($this->sAWStats, ("\nEND_" . $sSection), $iStartPos);
        $max       = 0;
        $aDesc     = array();#$GLOBALS["aDesc"];
        if (isset($_GET["max"]))
            $max       = $_GET["max"];
        $arrStat   = explode("\n", substr($this->sAWStats, ($iStartPos + 1), ($iEndPos - $iStartPos - 1)));
        if ($max == 0)
            for ($iIndex = 1; $iIndex < count($arrStat); $iIndex++) {
                $data_line = explode(' ', $arrStat[$iIndex]);
                if (isset($aDesc[$sSection])) {
                    $req_len     = count($this->arrLabel[$sSection]) - 1;
                    while (count($data_line) < $req_len)
                        $data_line[] = "";
                    $desc        = $data_line[0];
                    if (isset($aDesc[$sSection][$data_line[0]]))
                        $desc        = $aDesc[$sSection][$data_line[0]];
                    $data_line[] = $desc;
                }
                $arrData[] = $data_line;
            }
        else
            for ($iIndex = 1; $iIndex < count($arrStat); $iIndex++) {
                $data_line = explode(' ', $arrStat[$iIndex]);
                if (isset($aDesc[$sSection])) {
                    $req_len     = count($this->arrLabel[$sSection]) - 1;
                    while (count($data_line) < $req_len)
                        $data_line[] = "";
                    $desc        = $data_line[0];
                    if (isset($aDesc[$sSection][$data_line[0]]))
                        $desc        = $aDesc[$sSection][$data_line[0]];
                    $data_line[] = $desc;
                }
                $arrData[] = $data_line;
                if ($iIndex > $max)
                    break;
            }
        return $arrData;
    }

    function GetSummaryElement($arrData, $sLabel, $iElementID)
    {
        for ($iIndex = 1; $iIndex < count($arrData); $iIndex++) {
            if (strtolower($arrData[$iIndex][0]) == $sLabel) {
                return $arrData[$iIndex][$iElementID];
            }
        }
    }

    function OutputXML($sXML)
    {
        header("content-type: text/xml");
        echo "<?xml version=\"1.0\" encoding=\"utf-8\" ?>\n" .
        "<jawstats>\n" . $sXML . "</jawstats>";
    }
}

//  "Static" functions

function ElapsedTime($iSeconds)
{
    if ($GLOBALS["g_iThisLog"] == 0) {
        if ($iSeconds < 60) {
            return (" (<" . Lang("1 min ago") . ")");
        }
        $iMinutes = floor($iSeconds / 60);
        if ($iMinutes < 60) {
            if ($iMinutes == 1) {
                return (" (" . Lang("1 min ago") . ")");
            } else {
                return (" (" . str_replace("[MINUTES]", $iMinutes, Lang("[MINUTES] mins ago")) . ")");
            }
        }
        $iHours = floor($iMinutes / 60);
        if ($iHours < 24) {
            $iMinutes = ($iMinutes - ($iHours * 60));
            return (" (" . str_replace("[HOURS]", $iHours, str_replace("[MINUTES]", $iMinutes, Lang("[HOURS]h [MINUTES]m ago"))) . ")");
        }
        $iDays = floor($iHours / 24);
        if ($iDays == 1) {
            return (" (" . Lang("1 day ago") . ")");
        } else {
            return (" (" . str_replace("[DAYS]", $iDays, Lang("[DAYS] days ago")) . ")");
        }
    }
}

function GetConfig()
{
    // check config(s) exists
    if (count($GLOBALS["aConfig"]) < 1) {
        Error("BadConfigNoSites");
    }

    // check this site config exists
    if ((isset($_GET["config"]) == true) && (isset($GLOBALS["aConfig"][$_GET["config"]]) == true) && ($GLOBALS['bForceHttpHost'] === false)) {
        $sConfig = $_GET["config"];
    } else if (($GLOBALS['bUseHttpHost'] === true) && isset($GLOBALS["aConfig"][$_ENV['HTTP_HOST']])) {
        $sConfig = $_ENV['HTTP_HOST'];
    } else if ($GLOBALS['bForceHttpHost'] === false) {
        $sConfig = key($GLOBALS["aConfig"]);
    } else {
        Error('BadConfigNoSites');
    }

    // validate settings
    if ((isset($GLOBALS["aConfig"][$sConfig]["staticxml"]) != true) || (is_bool($GLOBALS["aConfig"][$sConfig]["staticxml"]) != true)) {
        $GLOBALS["aConfig"][$sConfig]["staticxml"] = false;
    }

    // return
    return $sConfig;
}

function GetLogList($sStatsName, $sFilePath, $sFileName = "", $sParts = "")
{
    if ($oDir = opendir($sFilePath)) {
        if (strlen($sParts) > 0) {
            $arr = explode(",", $sParts);
            $sStatsName.="." . $arr[0];
        }
        // create regex
        if (strlen($sFileName) == 0) {
            $sFileName = ("awstats[MM][YYYY]." . $sStatsName . ".txt");
            if ($GLOBALS["bUTF8LogFiles"])
                $sFileName .= ".utf8";
        }

        $sRegex = str_replace("[YYYY]", "\d\d\d\d", $sFileName);
        $sRegex = str_replace("[YY]", "\d\d", $sRegex);
        $sRegex = str_replace("[MM]", "\d\d", $sRegex);
        $sRegex = str_replace("[M]", "\d", $sRegex);

        // load available dates into array and sort by date
        while (($oItem = readdir($oDir)) !== false) {
            if (preg_match("/^" . $sRegex . "$/", $oItem) == true) {
                $sYear = null;
                // year [YYYY]
                if (strpos($sFileName, "[YYYY]") !== false) {
                    $sYear = substr($oItem, strpos(str_replace("]", "", str_replace("[", "", str_replace("[YYYY]", "****", $sFileName))), "****"), 4);
                }
                // year [YY]
                if (strpos($sFileName, "[YY]") !== false) {
                    $sYear = substr($oItem, strpos(str_replace("]", "", str_replace("[", "", str_replace("[YY]", "**", $sFileName))), "**"), 2);
                }
                $sMonth = null;
                // month [MM]
                if (strpos($sFileName, "[MM]") !== false) {
                    $sMonth = substr($oItem, strpos(str_replace("]", "", str_replace("[", "", str_replace("[MM]", "**", $sFileName))), "**"), 2);
                }
                // month [M]
                if (strpos($sFileName, "[M]") !== false) {
                    $sMonth = substr($oItem, strpos(str_replace("]", "", str_replace("[", "", str_replace("[M]", "*", $sFileName))), "*"), 1);
                }
                $aTemp[] = mktime(0, 0, 0, intval($sMonth), 1, intval($sYear));
            }
        }
        closedir($oDir);
        if (count($aTemp) < 1) {
            Error("NoLogsFound", $GLOBALS["g_sConfig"]);
        }
        if (count($aTemp) > 1) {
            rsort($aTemp);
        }

        // find first & last dates
        $dtLatest   = $aTemp[0];
        $dtEarliest = $aTemp[count($aTemp) - 1];

        // create full array of all potential dates
        $aMonths = array();
        $dtLoop  = $dtLatest;
        while ($dtLoop >= $dtEarliest) {
            $bFound = false;
            for ($iIndex = 0; $iIndex < count($aTemp); $iIndex++) {
                if ($aTemp[$iIndex] == $dtLoop) {
                    $bFound = true;
                    array_splice($aTemp, $iIndex, 1);
                    break;
                }
            }
            array_push($aMonths, array($dtLoop, $bFound));
            $dtLoop = mktime(0, 0, 0, (date("n", $dtLoop) - 1), 1, date("Y", $dtLoop));
        }
    } else {
        Error("CannotOpenLog");
    }
    return $aMonths;
}

function SumTotalVisits($arrStats)
{
    $sum = 0;
    foreach ($arrStats as $clsAWStats) {
        $sum += $clsAWStats->iTotalVisits;
    }
    return $sum;
}

function SumUniqueVisits($arrStats)
{
    $sum = 0;
    foreach ($arrStats as $clsAWStats) {
        $sum += $clsAWStats->iTotalUnique;
    }
    return $sum;
}

function CalclDailyVisitAvg($arrStats)
{
    $count = 0;
    $sum   = 0;
    foreach ($arrStats as $clsAWStats) {
        $count++;
        $sum += $clsAWStats->iDailyVisitAvg;
    }
    return $sum / $count;
}

function CalclDailyUniqueAvg($arrStats)
{
    $count = 0;
    $sum   = 0;
    foreach ($arrStats as $clsAWStats) {
        $count++;
        $sum += $clsAWStats->iDailyUniqueAvg;
    }
    return $sum / $count;
}

function GetSiteName()
{
    if ((isset($GLOBALS["g_aConfig"]["sitename"]) == true) && (strlen($GLOBALS["g_aConfig"]["sitename"]) > 0)) {
        return $GLOBALS["g_aConfig"]["sitename"];
    } else {
        return $GLOBALS["g_aConfig"]["siteurl"];
    }
}

function SetTranslation()
{

    function FindTranslation($sCode)
    {
        $sCode = strtolower($sCode);
        if ($sCode == "en-gb") {
            return true;
        }
        for ($i = 0; $i < count($GLOBALS["g_aTranslation"]); $i++) {
            if (strtolower($GLOBALS["g_aTranslation"][$i]["code"]) == $sCode) {
                $GLOBALS["g_aCurrentTranslation"] = $GLOBALS["g_aTranslation"][$i]["translations"];
                return true;
            }
        }
        return false;
    }
    // check for existence of querystring
    if ((isset($_GET["lang"]) == true) && (FindTranslation($_GET["lang"]) == true)) {
        return $_GET["lang"];
    }
    // check for existence of site config
    if ((isset($GLOBALS["g_aConfig"]["language"]) == true) && (FindTranslation($GLOBALS["g_aConfig"]["language"]) == true)) {
        return $GLOBALS["g_aConfig"]["language"];
    }
    // check for existence of global config
    if ((isset($GLOBALS["sDefaultLanguage"]) == true) && (FindTranslation($GLOBALS["sDefaultLanguage"]) == true)) {
        return $GLOBALS["sDefaultLanguage"];
    }
    return "en-gb";
}

function Sort1($a, $b)
{
    if ($a[1] == $b[1]) {
        return 0;
    }
    return ($a[1] > $b[1]) ? -1 : 1;
}

function Sort2($a, $b)
{
    if ($a[2] == $b[2]) {
        return 0;
    }
    return ($a[2] > $b[2]) ? -1 : 1;
}

function Sort3($a, $b)
{
    if ($a[3] == $b[3]) {
        return 0;
    }
    return ($a[3] > $b[3]) ? -1 : 1;
}

function Sort4($a, $b)
{
    if ($a[4] == $b[4]) {
        return 0;
    }
    return ($a[4] > $b[4]) ? -1 : 1;
}

function ValidateDate($iYear, $iMonth)
{
    $iYear  = intval($iYear);
    $iMonth = intval($iMonth);
    if (($iYear < 2000) || ($iYear > date("Y"))) {
        $iYear = intval(date("Y"));
    }
    if (($iMonth < 1) || ($iMonth > 12)) {
        $iMonth = intval(date("n"));
    }
    return mktime(0, 0, 0, $iMonth, 1, $iYear);
}
