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

// external include files
if ((isset($g_aConfig["includes"]) == true) && (strlen($g_aConfig["includes"]) > 0)) {
    $aIncludes = explode(",", $g_aConfig["includes"]);
    foreach ($aIncludes as $sInclude) {
        include $sInclude;
    }
}

$sConfig = $_POST["config"];
header("content-type: text/xml");
echo "<?xml version=\"1.0\" encoding=\"utf-8\" ?>\n";
if (isset($GLOBALS["aConfig"][$sConfig]) == true) {
    if ($_POST["pass"] == md5($GLOBALS["aConfig"][$sConfig]["password"])) {

        // pre update hook
        if (isset($GLOBALS["aConfig"][$sConfig]["preupdate"]))
            shell_exec($GLOBALS["aConfig"][$sConfig]["preupdate"]);

        $aParts    = array();
        if (isset($GLOBALS["aConfig"][$sConfig]["parts"]))
            $aParts    = explode(",", $GLOBALS["aConfig"][$sConfig]["parts"]);
        else
            $aParts[0] = "";

        foreach ($aParts as $part) {
            $dot_part = "";
            if (strlen($part) > 0)
                $dot_part = "." . $part;

            $sCommand = "export AWSTATS_DEL_GATEWAY_INTERFACE='jawstats' && " .
                $GLOBALS["aConfig"][$sConfig]["updatepath"] .
                "awstats.pl -config=" . $sConfig . $dot_part;
            $sResult  = shell_exec($sCommand);
        }
        // post update hook
        if (isset($GLOBALS["aConfig"][$sConfig]["postupdate"]))
            shell_exec($GLOBALS["aConfig"][$sConfig]["postupdate"]);

        echo "<xml>" .
        "<result type=\"updated\" />" .
        "<command><![CDATA[" . $sCommand . "]]></command>" .
        "<output><![CDATA[" . $sResult . "]]></output>" .
        "</xml>";
    } else {
        echo "<xml><result type=\"bad_password\" /></xml>";
    }
} else {
    echo "<xml><result type=\"bad_config\" /></xml>";
}
