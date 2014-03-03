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
 *
 */

var oTranslation = {};
var aStatistics = [];
var dtLastUpdate = 0;
var sToolID;
var aParts = [];

// jQuery methods
$(document).ready(function() {
    var aCurrentView = g_sCurrentView.split(".");
    $("#menu").children("ul:eq(0)").children("li").addClass("off");
    $("#tab" + aCurrentView[0]).removeClass("off");
    DrawPage(g_sCurrentView);

    // change language mouseover
    $("#toolLanguageButton").mouseover(function() {
        $("#toolLanguageButton img").attr("src", "themes/" + sThemeDir + "/images/change_language_on.gif");
    });
    $("#toolLanguageButton").mouseout(function() {
        $("#toolLanguageButton img").attr("src", "themes/" + sThemeDir + "/images/change_language.gif");
    });
    if (g_sParts.length == 0)
        aParts = [{name: "", active: true}];
    else {
        aStr = g_sParts.split(',');
        for (iIndex in aStr)
            aParts.push({name: aStr[iIndex], active: true});
    }
    window.onscroll = function(e) {
        $("#control").animate({"top": getScrollXY()[1] + 120}, 100);
    }

});

function getScrollXY() {
    var scrOfX = 0, scrOfY = 0;
    if (typeof(window.pageYOffset) == 'number') {
        //Netscape compliant
        scrOfY = window.pageYOffset;
        scrOfX = window.pageXOffset;
    } else if (document.body && (document.body.scrollLeft || document.body.scrollTop)) {
        //DOM compliant
        scrOfY = document.body.scrollTop;
        scrOfX = document.body.scrollLeft;
    } else if (document.documentElement && (document.documentElement.scrollLeft || document.documentElement.scrollTop)) {
        //IE6 standards compliant mode
        scrOfY = document.documentElement.scrollTop;
        scrOfX = document.documentElement.scrollLeft;
    }
    return [scrOfX, scrOfY];
}

function AddLeadingZero(vValue, iLength) {
    sValue = vValue.toString();
    while (sValue.length < iLength) {
        sValue = ("0" + sValue);
    }
    return sValue;
}

function ChangeLanguage(sLanguage) {
    $("#loading").show();
    self.location.href = ("?config=" + g_sConfig + "&year=" + g_iYear + "&month=" + g_iMonth + "&view=" + g_sCurrentView + "&lang=" + sLanguage);
}

function ChangeMonth(iYear, iMonth) {
    $("#loading").show();
    self.location.href = ("?config=" + g_sConfig + "&year=" + iYear + "&month=" + iMonth + "&view=" + g_sCurrentView + "&lang=" + g_sLanguage);
}

function ChangeSite(sConfig) {
    $("#loading").show();
    self.location.href = ("?config=" + sConfig + "&year=" + g_iYear + "&month=" + g_iMonth + "&view=" + g_sCurrentView + "&lang=" + g_sLanguage);
}


function ChangeTab(oSpan, sPage) {
    $("#menu").children("ul:eq(0)").children("li").addClass("off");
    $(oSpan).parent().removeClass("off");
    DrawPage(sPage);
}

function ChangePart(oDom, sPart)
{
    var iCount = 0;
    var iIdx = 0;
    for (iIndex in aParts) {
        if (aParts[iIndex].name == sPart) {
            iIdx = iIndex;
            aParts[iIndex].active = !aParts[iIndex].active;
            if (aParts[iIndex].active)
                $(oDom).addClass("selected");
            else
                $(oDom).removeClass("selected");

        }
        if (aParts[iIndex].active)
            iCount++;
    }

    // 1 part must be active
    if (iCount == 0) {
        $(oDom).addClass("selected");
        aParts[iIdx].active = true;
        return;
    }
    DrawPage(g_sCurrentView);
}

function CheckLastUpdate(oXML) {
    /* CHECK:0.8
     // removed check becouse of multiple parts, not clear what is the effect.
     if (parseInt($(oXML).find('info').attr("lastupdate")) != g_dtLastUpdate) {
     var sURL = "?config=" + g_sConfig + "&year=" + g_iYear + "&month=" + g_iMonth + "&view=" + g_sCurrentView;
     self.location.href = sURL;
     }*/
}

function DisplayBandwidth(iBW) {
    iVal = iBW;

    iBW = (iBW / 1024);
    if (iBW < 1024) {
        return NumberFormat(iBW, 1) + "k";
    }
    iBW = (iBW / 1024);
    if (iBW < 1024) {
        return NumberFormat(iBW, 1) + "M";
    }
    iBW = (iBW / 1024);
    return NumberFormat(iBW, 1) + "G";
}


function DrawGraph(aItem, aValue, aInitial, sMode) {
    var aSeries = [];
    for (var jIndex in aValue) {
        var data = [];
        for (var iIndex in aValue[jIndex])
            data.push([aItem[iIndex], aValue[jIndex][iIndex]]);
        aSeries.push({data: data, points: {show: true, fill: true, fillColor: g_cGraphFillColor, lineWidth: g_cGraphLineWidth}, color: g_cGraphLineColor});
    }
    //
    var xax = null;
    if (sMode != null)
        xax = {mode: sMode, min: aItem[0].getTime(), max: aItem[aItem.length - 1].getTime()};
    else
        xax = {mode: sMode, ticks: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22], tickDecimals: 0};
    var yax = {min: 0};

    var aOptions = {series: {stack: true}, lines: {show: true, lineWidth: g_cGraphLineWidth, fill: true},
        grid: {show: true, borderColor: "white"}, xaxis: xax, yaxis: yax};

    $.plot($("#graph"), aSeries, aOptions);
}

function DrawBar(aItem, aValue, aInitial) {
    var aSeries = [];
    var aTicks = [[0, ""]];
    var iSum = 0;
    var iCount = 0;
    for (var iPart in aValue) {
        var data = [];
        for (var iIndex in aValue[iPart]) {
            sBarColor = g_aBarColors[iPart];
            /*	if (aInitial[iIndex] == "Sat")
             sBarColor=g_aBarColors[2];
             else if (aInitial[iIndex] == "Fri")
             sBarColor=g_aBarColors[1];*/

            data.push([iIndex * 2, aValue[iPart][iIndex]]);

            if (iPart == 0) {
                if (iIndex % 2 == 0)
                    aTicks.push([iIndex * 2 + 1, aItem[iIndex]]);
                else
                    aTicks.push([iIndex * 2 + 1, ""]);
            }

            if (aValue[iPart][iIndex] > 0) {
                if (iPart == 0)
                    iCount++;
                iSum += aValue[iPart][iIndex];
            }
        }
        aSeries.push({data: data, color: g_cBarFrame, bars: {fillColor: sBarColor}});
        // aSeries.push(data);
    }

    aMarkingLine = iSum / iCount;

    xax = {min: 0, max: aItem.length * 2, ticks: aTicks, mode: "time"};
    yax = {labelWidth: 10, labelHeight: 10, tickDecimals: 0};

    var aOptions = {xaxis: xax, yaxis: yax, bars: {show: true, barWidth: 1.85, lineWidth: 1},
        grid: {show: true, hoverable: false, clickable: false, autohighlight: true,
            borderColor: "white", tickColor: "white"
                    /*			      markings: [{ xaxis: { from: 1, to: 61 }, yaxis: {from: aMarkingLine, to: aMarkingLine},
                     color: g_cBarMarking, lineWidth:1  }]*/},
        legend: {show: false},
        series: {stack: true, labels: aInitial},
        formatter: function(label, series) {
            return '<div style="font-size:8pt;text-align:center;padding:2px;color:blue;">' + label + '<br/>' + Math.round(series.percent) + '%</div>';
        }
    };

    var plot = $.plot($("#graph"), aSeries, aOptions);

    /*    $("#graph").bind("plotclick", function (event, pos, item) {
     if (item) {
     //	    $("#graph").highlight(item.series, item.datapoint);
     oRow = oStatistics.oThisMonth.aData[item.seriesIndex];
     window.location = g_sJAWStatsPath + "?config=" + oRow.sSite;
     }
     });*/
}


function DrawPie(iTotal, aItem, aValue) {
    var data = [];

    if (!aItem.length)
        return;

    for (var iIndex in aValue) {
        data[iIndex] = {label: aItem[iIndex], data: aValue[iIndex], color: g_aPieColors[iIndex]};
        //	alert(data[i].label+" : "+data[i].data);
    }

    $.plot($("#pie"), data,
            {
                series: {
                    pie: {
                        show: true,
                        radius: 1,
                        label: {
                            show: false,
                            radius: 1,
                            formatter: function(label, series) {
                                return '<div style="font-size:8pt;text-align:center;padding:2px;color:blue;">' + label + '<br/>' + Math.round(series.percent) + '%</div>';
                            }},
                        threshold: 0.05
                    }
                },
                legend: {
                    show: true,
                    position: "sw",
                    margin: [10, -80],
                    backgroundOpacity: 0.5
                }
            });
}


function DrawSubMenu(sMenu, sSelected) {
    oMenu = oSubMenu[sMenu];

    // create menu
    var aMenu = [];
    for (sLabel in oMenu) {
        if (sSelected == sLabel) {
            aMenu.push("<span class=\"submenuselect\" onclick=\"DrawPage('" + oMenu[sLabel] + "')\">" + Lang(sLabel) + "</span>");
        } else {
            aMenu.push("<span class=\"submenu\" onclick=\"DrawPage('" + oMenu[sLabel] + "')\">" + Lang(sLabel) + "</span>");
        }
    }
    return ("<div id=\"submenu\">" + aMenu.join(" | ") + "</div>");
}

function SumParts(oStats, sField, iRow) {
    var iSum = 0;
    for (iIndex in aParts)
        if (aParts[iIndex].active && (oStats[iIndex] != null) && oStats[iIndex].aData[iRow])
            iSum += parseInt(oStats[iIndex].aData[iRow][sField]);
    return iSum;
}

function MergeParts_Country() {
    // merge helper
    function mergePart(oSum, oPart) {
        function mergeContinent(oSum, oPart) {
            // merge totals
            oSum.iTotalPages += oPart.iTotalPages;
            oSum.iTotalHits += oPart.iTotalHits;
            oSum.iTotalBW += oPart.iTotalBW;
        }

        // merge totals
        oSum.iTotalPages += oPart.iTotalPages;
        oSum.iTotalHits += oPart.iTotalHits;
        oSum.iTotalBW += oPart.iTotalBW;
        // merge data
        for (iRow in oPart.aData) {
            var found = false;
            for (jRow in oSum.aData)
                if (oPart.aData[iRow].sCountryCode == oSum.aData[jRow].sCountryCode) {
                    oSum.aData[jRow].iPages += oPart.aData[iRow].iPages;
                    oSum.aData[jRow].iHits += oPart.aData[iRow].iHits;
                    oSum.aData[jRow].iBW += oPart.aData[iRow].iBW;
                    found = true;
                    break;
                }
            if (!found)
                oSum.aData.push(oPart.aData[iRow]);
        }

        mergeContinent(oSum.oContinent["Africa"], oPart.oContinent["Africa"]);
        mergeContinent(oSum.oContinent["Antartica"], oPart.oContinent["Antartica"]);
        mergeContinent(oSum.oContinent["Asia"], oPart.oContinent["Asia"]);
        mergeContinent(oSum.oContinent["Europe"], oPart.oContinent["Europe"]);
        mergeContinent(oSum.oContinent["North America"], oPart.oContinent["North America"]);
        mergeContinent(oSum.oContinent["Oceania"], oPart.oContinent["Oceania"]);
        mergeContinent(oSum.oContinent["Other"], oPart.oContinent["Other"]);
        mergeContinent(oSum.oContinent["South America"], oPart.oContinent["South America"]);
    }


    var foundFirst = false;
    var oCountry = aStatistics["country"];
    for (iIndex in aParts)
        if (aParts[iIndex].active)
            if (!foundFirst) { // use first active part as base
                // deep copy
                oCountry[aParts.length + 1] = $.evalJSON($.toJSON(oCountry[iIndex]));
                foundFirst = true;
            } else
                mergePart(oCountry[aParts.length + 1], oCountry[iIndex]);
    // Sort
    oCountry[aParts.length + 1].aData.sort(Sort_Pages);
}

// Getting Data From Server:

function PopulateData_Country(sPage) {
    $("#loading").show();
    aStatistics[sPage.split(".")[0]] = [];
    GetPart_Country(sPage, aParts[0]);
}

function AddPart_Country(oData, sPage) {
    iCount = aStatistics[sPage.split(".")[0]].push(oData);
    if (iCount < aParts.length) {
        GetPart_Country(sPage, aParts[iCount]);
    } else {
        $("#loading").hide();
        DrawPage(sPage);
    }
}

function GetPart_Country(sPage, oPart) {

    // create data objects
    var oC = {"bPopulated": false, "iTotalPages": 0, "iTotalHits": 0, "iTotalBW": 0, "aData": []};
    oC.oContinent = {"Africa": {}, "Antartica": {}, "Asia": {}, "Europe": {}, "North America": {}, "Oceania": {}, "South America": {}, "Other": {}};
    for (var sContinent in oC.oContinent) {
        oC.oContinent[sContinent] = {"iTotalPages": 0, "iTotalHits": 0, "iTotalBW": 0};
    }

    $.ajax({
        type: "GET",
        url: XMLURL("DOMAIN", oPart.name),
        success: function(oXML) {
            CheckLastUpdate(oXML);

            $(oXML).find('item').each(function() {
                // collect values
                var sCountryCode = $(this).attr("id");
                var sCountryName = gc_aCountryName[sCountryCode];
                if (typeof gc_aCountryName[sCountryCode] == "undefined") {
                    sCountryName = ("Unknown (code: " + sCountryCode.toUpperCase() + ")");
                }
                var sContinent = gc_aCountryContinent[sCountryCode];
                if (typeof gc_aContinents[sContinent] == "undefined") {
                    sContinent = "Other";
                }
                var iPages = parseInt($(this).attr("pages"));
                var iHits = parseInt($(this).attr("hits"));
                var iBW = parseInt($(this).attr("bw"));

                // increment totals
                oC.iTotalPages += iPages;
                oC.iTotalHits += iHits;
                oC.iTotalBW += iBW;
                oC.oContinent[sContinent].iTotalPages += iPages;
                oC.oContinent[sContinent].iTotalHits += iHits;
                oC.oContinent[sContinent].iTotalBW += iBW;

                // populate array
                oC.aData.push({"sCountryCode": sCountryCode,
                    "sCountryName": sCountryName,
                    "sContinent": sContinent,
                    "iPages": iPages,
                    "iHits": iHits,
                    "iBW": iBW});
            });

            // apply data
            oC.aData.sort(Sort_Pages);
            AddPart_Country(oC, sPage);
        }
    });
}


// Other functions: get week number thanks to http://www.quirksmode.org/js/week.html
function getWeekNr(dtTempDate) {
    Year = takeYear(dtTempDate);
    Month = dtTempDate.getMonth();
    Day = dtTempDate.getDate();
    now = Date.UTC(Year, Month, Day + 1, 0, 0, 0);
    var Firstday = new Date();
    Firstday.setYear(Year);
    Firstday.setMonth(0);
    Firstday.setDate(1);
    then = Date.UTC(Year, 0, 1, 0, 0, 0);
    var Compensation = Firstday.getDay();
    if (Compensation > 3)
        Compensation -= 4;
    else
        Compensation += 3;
    NumberOfWeek = Math.round((((now - then) / 86400000) + Compensation) / 7);

    // my alteration to make monday-sunday calendar
    //	if (dtTempDate.getDay() == 0) {
    //  	NumberOfWeek--;
    //}
// end

    return NumberOfWeek;
}
function takeYear(dtTempDate) {
    x = dtTempDate.getYear();
    var y = x % 100;
    y += (y < 38) ? 2000 : 1900;
    return y;
}

// md5 thanks to http://www.webtoolkit.info
var MD5 = function(string) {

    function RotateLeft(lValue, iShiftBits) {
        return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
    }

    function AddUnsigned(lX, lY) {
        var lX4, lY4, lX8, lY8, lResult;
        lX8 = (lX & 0x80000000);
        lY8 = (lY & 0x80000000);
        lX4 = (lX & 0x40000000);
        lY4 = (lY & 0x40000000);
        lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
        if (lX4 & lY4) {
            return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
        }
        if (lX4 | lY4) {
            if (lResult & 0x40000000) {
                return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
            } else {
                return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
            }
        } else {
            return (lResult ^ lX8 ^ lY8);
        }
    }

    function F(x, y, z) {
        return (x & y) | ((~x) & z);
    }
    function G(x, y, z) {
        return (x & z) | (y & (~z));
    }
    function H(x, y, z) {
        return (x ^ y ^ z);
    }
    function I(x, y, z) {
        return (y ^ (x | (~z)));
    }

    function FF(a, b, c, d, x, s, ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    }
    ;

    function GG(a, b, c, d, x, s, ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    }
    ;

    function HH(a, b, c, d, x, s, ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    }
    ;

    function II(a, b, c, d, x, s, ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    }
    ;

    function ConvertToWordArray(string) {
        var lWordCount;
        var lMessageLength = string.length;
        var lNumberOfWords_temp1 = lMessageLength + 8;
        var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
        var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
        var lWordArray = Array(lNumberOfWords - 1);
        var lBytePosition = 0;
        var lByteCount = 0;
        while (lByteCount < lMessageLength) {
            lWordCount = (lByteCount - (lByteCount % 4)) / 4;
            lBytePosition = (lByteCount % 4) * 8;
            lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
            lByteCount++;
        }
        lWordCount = (lByteCount - (lByteCount % 4)) / 4;
        lBytePosition = (lByteCount % 4) * 8;
        lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
        lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
        lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
        return lWordArray;
    }
    ;

    function WordToHex(lValue) {
        var WordToHexValue = "", WordToHexValue_temp = "", lByte, lCount;
        for (lCount = 0; lCount <= 3; lCount++) {
            lByte = (lValue >>> (lCount * 8)) & 255;
            WordToHexValue_temp = "0" + lByte.toString(16);
            WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
        }
        return WordToHexValue;
    }
    ;

    function Utf8Encode(string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    }
    ;

    var x = Array();
    var k, AA, BB, CC, DD, a, b, c, d;
    var S11 = 7, S12 = 12, S13 = 17, S14 = 22;
    var S21 = 5, S22 = 9, S23 = 14, S24 = 20;
    var S31 = 4, S32 = 11, S33 = 16, S34 = 23;
    var S41 = 6, S42 = 10, S43 = 15, S44 = 21;

    string = Utf8Encode(string);

    x = ConvertToWordArray(string);

    a = 0x67452301;
    b = 0xEFCDAB89;
    c = 0x98BADCFE;
    d = 0x10325476;

    for (k = 0; k < x.length; k += 16) {
        AA = a;
        BB = b;
        CC = c;
        DD = d;
        a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
        d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
        c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
        b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
        a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
        d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
        c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
        b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
        a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
        d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
        c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
        b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
        a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
        d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
        c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
        b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
        a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
        d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
        c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
        b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
        a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
        d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
        c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
        b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
        a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
        d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
        c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
        b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
        a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
        d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
        c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
        b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
        a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
        d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
        c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
        b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
        a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
        d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
        c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
        b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
        a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
        d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
        c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
        b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
        a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
        d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
        c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
        b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
        a = II(a, b, c, d, x[k + 0], S41, 0xF4292244);
        d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
        c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
        b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
        a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
        d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
        c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
        b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
        a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
        d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
        c = II(c, d, a, b, x[k + 6], S43, 0xA3014314);
        b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
        a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
        d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
        c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
        b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
        a = AddUnsigned(a, AA);
        b = AddUnsigned(b, BB);
        c = AddUnsigned(c, CC);
        d = AddUnsigned(d, DD);
    }

    var temp = WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d);

    return temp.toLowerCase();
}

// random stuff...
function DateSuffix(iDate) {
    switch (iDate) {
        case 1:
        case 21:
        case 31:
            return "st";
        case 2:
        case 22:
            return "nd";
        case 3:
        case 23:
            return "rd";
        default:
            return "th";
    }
}

function NumberFormat(vValue, iDecimalPlaces) {
    if (typeof iDecimalPlaces != "undefined") {
        vValue = vValue.toFixed(iDecimalPlaces);
    }
    var oRegEx = /(\d{3})(?=\d)/g;
    var aDigits = vValue.toString().split(".");
    if (aDigits[0] >= 1000) {
        aDigits[0] = aDigits[0].split("").reverse().join("").replace(oRegEx, "$1,").split("").reverse().join("");
    }
    return aDigits.join(".");
}

function StripLeadingZeroes(sString) {
    while (sString.substr(0, 1) == "0") {
        sString = sString.substr(1);
    }
    return sString;
}

$.tablesorter.addParser({
    id: "commaNumber",
    is: function(s) {
        return false;
    },
    format: function(s) {
        s = s.replace(/\,/g, "");
        return s;
    },
    type: "numeric"
});
