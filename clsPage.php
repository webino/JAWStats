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

class clsPage
{
    var $sMenu      = "";
    var $sSubMenuJS = "";
    var $aViews     = array();

    function __construct($type = "")
    {
        if (strlen($type) == 0) {
            $type = "web";
        }
        $uifile = "ui/" . $type . "menu.xml";
        if (file_exists($uifile)) {
            $xml = new DOMDocument();
            $xml->load($uifile);
        } else {
            exit("Failed to open ui/" . $type . "menu.xml");
        }

        $aMenuString    = "<ul>";
        $aSubMenuString = "<script type=\"text/javascript\"> var oSubMenu = {};";

        $tabs = $xml->getElementsByTagName("tab");

        // Iterate Tabs
        foreach ($tabs as $aTab) {
            $children                             = $aTab->getElementsByTagName("subview");
            $sId                                  = $aTab->getAttribute("id");
            $sTitle                               = Lang($aTab->getAttribute("label"));
            $sSubView                             = $aTab->getAttribute("subview");
            $aMenuString .= "<li id=\"tab" . $sId . "\"><span onclick=\"ChangeTab(this, '" . $sId . "." . $sSubView . "')\">" . $sTitle . "</span></li>";
            $aSubMenuString .= "oSubMenu." . $sId . " = { ";
            // Iterate Sub-Views
            $aFirst                               = true;
            $this->aViews[$sId . "." . $sSubView] = 10;
            foreach ($children as $aSubmenu) {
                if ($aFirst) {
                    $aFirst = false;
                } else {
                    $aSubMenuString .= ", ";
                    $this->aViews[$sId . "." . $aSubmenu->getAttribute("id")] = 10;
                }
                $aSubMenuString .= "\"" . Lang($aSubmenu->getAttribute("label")) . "\"   :    \"" . $sId . "." . $aSubmenu->getAttribute("id") . "\"";
            }
            $aSubMenuString .= " };";
        }

        $aMenuString .= "</ul>";
        $aSubMenuString .= "</script>";

        $this->sMenu      = $aMenuString;
        $this->sSubMenuJS = $aSubMenuString;
    }

    function DrawMenu()
    {
        return $this->sMenu;
    }

    function SubMenuJSObj()
    {
        return $this->sSubMenuJS;
    }

    function DrawHeader($dtDate)
    {
        $aString = explode("_", str_replace("]", "]_", str_replace("[", "_[", Lang("Statistics for [SITE] in [MONTH] [YEAR]"))));
        for ($i = 0; $i < count($aString); $i++) {
            if ((strlen(trim($aString[$i])) > 0) && (substr($aString[$i], 0, 1) != "[")) {
                $aString[$i] = ("<span>" . $aString[$i] . "</span>");
            } else {
                switch ($aString[$i]) {
                    case "[MONTH]":
                        $aString[$i] = Lang(date("F", $dtDate));
                        break;
                    case "[SITE]":
                        $aString[$i] = (GetSiteName() . "<a href=\"" . $GLOBALS["g_aConfig"]["siteurl"] .
                            "\" target=\"_blank\"><img src=\"themes/default/images/external_link.png\" class=\"externallink\" /></a>");
                        break;
                    case "[YEAR]":
                        $aString[$i] = date("Y", $dtDate);
                        break;
                }
            }
        }
        return ("<h1>" . implode($aString) . "</h1>");
    }

    function DrawFooter()
    {
        $aString = explode("_", str_replace("]", "]_", str_replace("[", "_[", Lang("Powered by [AWSTART]AWStats[END]. Made beautiful by [JAWSTART]JAWStats Web Statistics and Analytics[END]."))));
        for ($i = 0; $i < count($aString); $i++) {
            if ((strlen(trim($aString[$i])) > 0) && (substr($aString[$i], 0, 1) != "[") && (substr($aString[$i + 1], 0, 5) != "[END]")) {
                $aString[$i] = ("<span>" . $aString[$i] . "</span>");
            } else {
                switch ($aString[$i]) {
                    case "[AWSTART]":
                        $aString[$i] = "<a href=\"http://www.awstats.org/\" target=\"_blank\">";
                        break;
                    case "[END]":
                        $aString[$i] = "</a>";
                        break;
                    case "[JAWSTART]":
                        $aString[$i] = "<a href=\"http://jawstats.com/\" target=\"_blank\">";
                        break;
                }
            }
        }
        return implode($aString);
    }

    function ValidateView($sView)
    {
        return array_key_exists($sView, $this->aViews);
    }
}

// clsPage

function ToolChangeLanguage()
{
    if (count($GLOBALS["g_aTranslation"]) < 1) {
        return "";
    }

    function LanguageSort($a, $b)
    {
        return ($a["name"] < $b["name"]) ? -1 : 1;
    }
    // create html
    $aHTML   = array();
    $aHTML[] = "<div id=\"toolLanguage\" class=\"tool\">\n<div>";
    $aHTML[] = "<h1>" . Lang("Please select your language") . "<span onclick=\"ShowTools('toolLanguage')\">(" . Lang("Cancel") . ")</span></h1>";
    $aHTML[] = "<table id=\"langpicker\" cellspacing=\"0\">\n<tr><td><ul>";

    // copy array
    array_push($GLOBALS["g_aTranslation"], array("code"         => "en-gb", "name"         => "English", "translations" => array(
    )));
    usort($GLOBALS["g_aTranslation"], "LanguageSort");

    // loop through sites
    $iColA = ceil(count($GLOBALS["g_aTranslation"]) / 3);
    $iColB = ceil((count($GLOBALS["g_aTranslation"]) - $iColA) / 2) + $iColA;
    for ($i = 0; $i < count($GLOBALS["g_aTranslation"]); $i++) {
        $sCSS = "";
        if ($GLOBALS["g_aTranslation"][$i]["code"] == $GLOBALS["sLanguageCode"]) {
            $sCSS = " class=\"selected\"";
        }
        $aHTML[] = "<li" . $sCSS . " onclick=\"ChangeLanguage('" . $GLOBALS["g_aTranslation"][$i]["code"] . "')\">" . $GLOBALS["g_aTranslation"][$i]["name"] . "</li>";
        if ((($i + 1) == $iColA) || (($i + 1) == $iColB)) {
            $aHTML[] = "</ul>\n</td>\n<td><ul>";
            if (count($GLOBALS["g_aTranslation"]) == $i) {
                $aHTML[] = "<li>&nbsp;</li>";
            }
        }
    }

    // close html
    $aHTML[] = "</ul>\n</td>\n</tr>\n</table>";
    $aHTML[] = "</div></div>";

    return implode("\n", $aHTML);
}

function ToolChangeMonth()
{
    $aHTML   = array();
    $aHTML[] = "<div id=\"toolMonth\" class=\"tool\">\n<div>";
    $aHTML[] = "<h1>" . Lang("Please select the month you wish to view") . "<span onclick=\"ShowTools('toolMonth')\">(" . Lang("Cancel") . ")</span></h1>";
    $aHTML[] = "<table id=\"datepicker\" cellspacing=\"0\">";

    //loop through years
    for ($iYear = date("Y", $GLOBALS["g_aLogFiles"][0][0]); $iYear >= date("Y", $GLOBALS["g_aLogFiles"][count($GLOBALS["g_aLogFiles"]) - 1][0]); $iYear--) {
        $aHTML[] = "<tr>\n<td>" . $iYear . ":</td>";

        // loop through months
        for ($iMonth = 1; $iMonth < 13; $iMonth++) {
            $dtTemp  = mktime(0, 0, 0, $iMonth, 1, $iYear);
            $bExists = false;
            foreach ($GLOBALS["g_aLogFiles"] as $aLog) {
                if (($aLog[0] == $dtTemp) && ($aLog[1] == true)) {
                    $bExists = true;
                    break;
                }
            }
            if ($bExists == true) {
                $sCSS = "";
                if ((date("n", $GLOBALS["g_aLogFiles"][$GLOBALS["g_iThisLog"]][0]) == $iMonth) && (date("Y", $GLOBALS["g_aLogFiles"][$GLOBALS["g_iThisLog"]][0]) == $iYear)) {
                    $sCSS .= " selected";
                }
                $aHTML[] = "<td class='date" . $sCSS . "' onclick='ChangeMonth(" . date("Y,n", $dtTemp) . ")'>" . Lang(date("F", $dtTemp)) . "</td>";
            } else {
                if ($dtTemp > time()) {
                    $aHTML[] = "<td class='fade'>&nbsp;</td>";
                } else {
                    $aHTML[] = "<td class='fade'>" . Lang(date("F", $dtTemp)) . "</td>";
                }
            }
        }
        $aHTML[] = "</tr>";
    }
    $aHTML[] = "</table>";
    $aHTML[] = "</div></div>";

    return implode("\n", $aHTML);
}

function ToolChangeSite()
{
    if (($GLOBALS["bConfigChangeSites"] != true) || (count($GLOBALS["aConfig"]) < 2)) {
        return "";
    }

    // create html
    $aHTML   = array();
    $aHTML[] = "<div id=\"toolSite\" class=\"tool\">\n<div>";
    $aHTML[] = "<h1>" . Lang("Please select the site you wish to view") . "<span onclick=\"ShowTools('toolSite')\">(" . Lang("Cancel") . ")</span></h1>";
    $aHTML[] = "<table id=\"sitepicker\" cellspacing=\"0\">\n<tr><td><ul>";

    // loop through sites
    $i     = 0;
    $iColA = ceil(count($GLOBALS["aConfig"]) / 3);
    $iColB = ceil((count($GLOBALS["aConfig"]) - $iColA) / 2) + $iColA;
    foreach ($GLOBALS["aConfig"] as $sSiteCode => $aSite) {
        $sCSS = "";
        if ($GLOBALS["g_sConfig"] == $sSiteCode) {
            $sCSS = " class=\"selected\"";
        }
        $aHTML[] = "<li" . $sCSS . " onclick=\"ChangeSite('" . $sSiteCode . "')\">" .
            (((isset($aSite["sitename"]) == true) && (strlen(trim($aSite["sitename"])) > 0)) ? $aSite["sitename"]
                    : $aSite["siteurl"]) . "</li>";
        $i++;
        if (($i == $iColA) || ($i == $iColB)) {
            $aHTML[] = "</ul>\n</td>\n<td><ul>";
            if ((count($GLOBALS["aConfig"]) == 2) && ($i == 2)) {
                $aHTML[] = "<li></li>";
            }
        }
    }

    // close html
    $aHTML[] = "</ul>\n</td>\n</tr>\n</table>";
    $aHTML[] = "</div></div>";

    return implode("\n", $aHTML);
}

function ToolUpdateSite()
{
    if ($GLOBALS["bConfigUpdateSites"] != true) {
        return "";
    }

    // create html
    $aHTML   = array();
    $aHTML[] = "<div id=\"toolUpdate\" class=\"tool\">\n<div>";
    $aHTML[] = "<h1>" . Lang("Please enter the password to update this site") . "<span onclick=\"ShowTools('toolUpdate')\">(" . Lang("Cancel") . ")</span></h1>\n<div id=\"siteupdate\">";
    $aHTML[] = "<input type=\"password\" id=\"password\" onkeyup=\"UpdateSiteKeyUp(event)\" />";
    $aHTML[] = "<input type=\"button\" onclick=\"UpdateSite()\" value=\"" . Lang("Update") . "\" />";
    $aHTML[] = "</div>\n</div>\n</div>";
    return implode("\n", $aHTML);
}

function ToolChangeParts($sParts, $arrMissingParts)
{
    $aHTML   = array();
    $aHTML[] = "<div id=\"toolParts\" class=\"tool\">\n<div>";
    $aHTML[] = "<h1>" . Lang("Select parts to show") . "<span onclick=\"ShowTools('toolParts')\">(" . Lang("Close") . ")</span></h1>";
    $aHTML[] = "<table id=\"partspicker\" cellspacing=\"0\">\n<tr><td>";
    foreach (explode(',', $sParts) as $part) {
        $class = "selected";
        $title = "";
        if (array_key_exists($part, $arrMissingParts)) {
            $class .= " missing";
            $title .= "Missing Log : " . $arrMissingParts[$part];
        }
        $aHTML[] = "<ul><li title=\"" . $title . "\" onclick=\"ChangePart(this, '" . $part . "')\" class=\"" . $class . "\">" . ucwords($part) . " </li></ul></td> <td>\n";
    }
    $aHTML[] = "</td>\n</tr>\n</table>";
    $aHTML[] = "</div>\n</div>";
    return implode("\n", $aHTML);
}
