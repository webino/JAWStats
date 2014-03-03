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

var oPaging = {
    oKeywords: {iCurrPage: 0, iRowCount: 0, iRowsPerPage: 15, sSort: "freqDESC"},
    oKeyphrases: {iCurrPage: 0, iRowCount: 0, iRowsPerPage: 15, sSort: "freqDESC"}
};

function DrawGraph_EachYear() {
    var aItem = [];
    var aValue = [];
    var aInitial = [];

    var cur_visits = [];

    oAllMonths = aStatistics["allmonths"];

    for (part_idx in oAllMonths)
        if (aParts[part_idx].active) {
            aValue[part_idx] = [];
            cur_visits[part_idx] = 0;
        }


    var cur_year = oAllMonths[0].aData[0].dtDate.getFullYear();


    for (var iIndex in oAllMonths[0].aData) {
        var year = oAllMonths[0].aData[iIndex].dtDate.getFullYear();
        if (year == cur_year) {
            for (part_idx in oAllMonths)
                if (aParts[part_idx].active && !(oAllMonths[part_idx].aData[iIndex] === undefined))
                    cur_visits[part_idx] += oAllMonths[part_idx].aData[iIndex].iVisits;
        } else {
            aItem.push(cur_year);
            aInitial.push(cur_year.toString().substr(2));

            for (part_idx in oAllMonths)
                if (aParts[part_idx].active)
                    aValue[part_idx].push(cur_visits[part_idx]);


            cur_year = year;
            for (part_idx in oAllMonths)
                if (aParts[part_idx].active)
                    cur_visits[part_idx] = oAllMonths[part_idx].aData[iIndex].iVisits;
        }
    }
    aItem.push(cur_year);
    aInitial.push(cur_year.toString().substr(2));

    for (part_idx in oAllMonths)
        if (aParts[part_idx].active)
            aValue[part_idx].push(cur_visits[part_idx]);

    // remove empty/non-active parts
    var aActiveValue = [];
    for (iIndex in aValue)
        if (aValue[iIndex])
            aActiveValue.push(aValue[iIndex]);

    DrawBar(aItem, aActiveValue, aInitial);
}

function DrawGraph_AllMonths() {
    oAllMonths = aStatistics["allmonths"];
    var aItem = [];
    var aValue = [];

    for (part_idx in oAllMonths)
        if (aParts[part_idx].active)
            aValue[part_idx] = [];

    for (var iIndex in oAllMonths[0].aData) {
        aItem.push(oAllMonths[0].aData[iIndex].dtDate);
        for (part_idx in oAllMonths)
            if (aParts[part_idx].active && (oAllMonths[part_idx] != null))
                if (!(oAllMonths[part_idx].aData[iIndex] === undefined))
                    aValue[part_idx].push(oAllMonths[part_idx].aData[iIndex].iVisits);
    }
    DrawGraph(aItem, aValue, [], "time");
}

function DrawGraph_ThisMonth() {
    var oThisMonth = aStatistics["thismonth"];

    var aItem = [];
    var aValue = [];
    var aInitial = [];

    for (part_idx in oThisMonth)
        if (aParts[part_idx].active)
            aValue[part_idx] = [];

    // populate days
    var iDaysInMonth = (new Date(g_iYear, g_iMonth, 0)).getDate();
    var iDayOfWeek = (new Date(g_iYear, (g_iMonth - 1), 1)).getDay();
    for (var iDay = 0; iDay < iDaysInMonth; iDay++) {
        aItem.push(Lang((iDay + 1) + DateSuffix(iDay + 1)));
        for (part_idx in oThisMonth)
            if (aParts[part_idx].active)
                aValue[part_idx].push(0);
        aInitial.push(Lang(gc_aDayName[iDayOfWeek].substr(0, 3)));

        // day of week
        iDayOfWeek++;
        if (iDayOfWeek > 6) {
            iDayOfWeek = 0;
        }
    }

    // update values we know about
    for (var iIndex in oThisMonth[0].aData) {
        iDay = (oThisMonth[0].aData[iIndex].dtDate.getDate() - 1);
        // populate values for each part:
        for (part_idx in oThisMonth) {
            if (aParts[part_idx].active)
                if (oThisMonth[part_idx].aData[iIndex])
                    aValue[part_idx][iDay] = oThisMonth[part_idx].aData[iIndex].iVisits;
                else
                    aValue[part_idx][iDay] = 0;
        }
    }

    // remove empty/non-active parts
    var aActiveValue = [];
    for (iIndex in aValue)
        if (aValue[iIndex])
            aActiveValue.push(aValue[iIndex]);

    DrawBar(aItem, aActiveValue, aInitial);
}

function DrawGraph_Time() {
    var oTime = aStatistics["time"];
    var aItem = [];
    var aValue = [];

    for (part_idx in oTime)
        if (aParts[part_idx].active)
            aValue[part_idx] = [];

    for (var iRow in oTime[0].aData) {
        oRow = oTime[0].aData[iRow];
        sHour = oRow.iHour;
        if (oRow.iHour < 10) {
            sHour = ("0" + sHour)
        }
        aItem.push(sHour);
        for (part_idx in oTime)
            if (aParts[part_idx].active && (oTime[part_idx] != null))
                aValue[part_idx].push(oTime[part_idx].aData[iRow].iPages);
    }
    DrawGraph(aItem, aValue, [], null);
}

function DrawPage(sPage) {
    $("#content").fadeOut(g_iFadeSpeed, function() {
        g_sCurrentView = sPage;
        var aPage = sPage.split(".");
        switch (aPage[0]) {
            case "allmonths":
                if (typeof aStatistics[aPage[0]] == "undefined") {
                    PopulateData_AllMonths(sPage);
                    return false;
                }
                async:false,
                        PageLayout_AllMonths(aPage[1]);
                break;
            case "browser":
                if (typeof aStatistics[aPage[0]] == "undefined") {
                    PopulateData_Browser(sPage);
                    return false;
                }
                MergeParts_Browser();
                PageLayout_Browser(aPage[1]);
                break;
            case "country":
                if (typeof aStatistics[aPage[0]] == "undefined") {
                    PopulateData_Country(sPage);
                    return false;
                }
                MergeParts_Country();
                PageLayout_Country(aPage[1]);
                break;
            case "city":
                if (typeof aStatistics[aPage[0]] == "undefined") {
                    PopulateData_City(sPage);
                    return false;
                }
                MergeParts_City();
                PageLayout_City(aPage[1]);
                break;
            case "org":
                if (typeof aStatistics[aPage[0]] == "undefined") {
                    PopulateData_Org(sPage);
                    return false;
                }
                MergeParts_Org();
                PageLayout_Org(aPage[1]);
                break;
            case "visitor":
                if (typeof aStatistics[aPage[0]] == "undefined") {
                    PopulateData_Visitor(sPage);
                    return false;
                }
                MergeParts_Visitor();
                PageLayout_Visitor(aPage[1]);
                break;
            case "filetypes":
                if (typeof aStatistics[aPage[0]] == "undefined") {
                    PopulateData_Filetypes(sPage);
                    return false;
                }
                MergeParts_Filetypes();
                PageLayout_Filetypes();
                break;
            case "keyphrases":
                if (typeof aStatistics["keyphrases"] == "undefined") {
                    PopulateData_Keyphrases(sPage);
                    return false;
                }
                MergeParts_Keyphrases();
                PageLayout_Keyphrases(aPage[1]);
                break;
            case "keywords":
                if (typeof oStatistics.oKeywords == "undefined") {
                    PopulateData_Keywords(sPage);
                    return false;
                }
                PageLayout_Keywords(aPage[1]);
                break;
            case "os":
                if (typeof aStatistics["os"] == "undefined") {
                    PopulateData_OperatingSystems(sPage);
                    return false;
                }
                MergeParts_OperatingSystems();
                PageLayout_OperatingSystems(aPage[1]);
                break;
            case "pagerefs":
                if (aPage[1] == "se") {
                    if (typeof aStatistics["pagerefsse"] == "undefined") {
                        PopulateData_PageRefsSE(sPage);
                        return false;
                    }
                    MergeParts_PageRefsSE();
                    PageLayout_PageRefsSE();
                } else {
                    if (typeof aStatistics["pagerefs"] == "undefined") {
                        PopulateData_PageRefs(sPage);
                        return false;
                    }
                    MergeParts_PageRefs();
                    PageLayout_PageRefs(aPage[1]);
                }
                break;
            case "pages":
                if (typeof aStatistics[aPage[0]] == "undefined") {
                    PopulateData_Pages(sPage);
                    return false;
                }
                MergeParts_Pages();
                PageLayout_Pages(aPage[1]);
                break;
            case "robots":
                if (typeof aStatistics[aPage[0]] == "undefined") {
                    PopulateData_Robots(sPage);
                    return false;
                }
                MergeParts_Robots();
                PageLayout_Robots();
                break;
            case "searches":
                switch (aPage[1]) {
                    case "keyphrasecloud":
                        if (typeof aStatistics["keyphrases"] == "undefined") {
                            PopulateData_Keyphrases(sPage);
                            return false;
                        }
                        MergeParts_Keyphrases();
                        PageLayout_Searches(aPage[1]);
                        break;
                    case "keyphrases":
                        if (typeof aStatistics["keyphrases"] == "undefined") {
                            PopulateData_Keyphrases(sPage);
                            return false;
                        }
                        MergeParts_Keyphrases();
                        PageLayout_Searches(aPage[1]);
                        break;
                    case "keywordcloud":
                        if (typeof aStatistics["keywords"] == "undefined") {
                            PopulateData_Keywords(sPage);
                            return false;
                        }
                        MergeParts_Keywords();
                        PageLayout_Searches(aPage[1]);
                        break;
                    case "keywords":
                        if (typeof aStatistics["keywords"] == "undefined") {
                            PopulateData_Keywords(sPage);
                            return false;
                        }
                        MergeParts_Keywords();
                        PageLayout_Searches(aPage[1]);
                        break;
                }
                break;
            case "session":
                if (typeof aStatistics["session"] == "undefined") {
                    PopulateData_Session(sPage);
                    return false;
                }
                MergeParts_Session();
                PageLayout_Session();
                break;
            case "status":
                if (aPage[1] == "404") {
                    if (typeof aStatistics["status404"] == "undefined") {
                        PopulateData_Status404(sPage);
                        return false;
                    }
                    MergeParts_Status404();
                } else {
                    if (typeof aStatistics["status"] == "undefined") {
                        PopulateData_Status(sPage);
                        return false;
                    }
                    MergeParts_Status();
                }
                PageLayout_Status(aPage[1]);
                break;
            case "thismonth":
                if (typeof aStatistics[aPage[0]] == "undefined") {
                    PopulateData_ThisMonth(sPage);
                    return false;
                }
                PageLayout_ThisMonth(aPage[1]);
                break;
            case "time":
                if (typeof aStatistics[aPage[0]] == "undefined") {
                    PopulateData_Time(sPage);
                    return false;
                }
                PageLayout_Time();
                break;
        }
    });
}

function DrawPie_Browser(sPage) {
    var oBrowser = aStatistics["browser"][aParts.length + 1];
    var aItem = [];
    var aValue = [];
    var iRunningTotal = 0;
    var iCount = 0;

    switch (sPage) {
        case "all":
            for (var iRow in oBrowser.aData) {
                if (iCount < 6) {
                    aItem.push(oBrowser.aData[iRow].sBrowser);
                    aValue.push(oBrowser.aData[iRow].iHits);
                    iRunningTotal += oBrowser.aData[iRow].iHits;
                    iCount++;
                }
            }
            if (oBrowser.iTotalHits > iRunningTotal) {
                aItem.push(Lang("Other Browsers"));
                aValue.push(oBrowser.iTotalHits - iRunningTotal);
            }
            DrawPie(oBrowser.iTotalHits, aItem, aValue);
            break;
        case "family":
            for (var iRow in oBrowser.aFamily) {
                if (iCount < 6) {
                    if (oBrowser.aFamily[iRow].iHits > 0) {
                        aItem.push(gc_aBrowserFamilyCaption[oBrowser.aFamily[iRow].sBrowser]);
                        aValue.push(oBrowser.aFamily[iRow].iHits);
                        iRunningTotal += oBrowser.aFamily[iRow].iHits;
                        iCount++;
                    }
                }
            }
            if (oBrowser.iTotalHits > iRunningTotal) {
                aItem.push(Lang("Other Browsers"));
                aValue.push(oBrowser.iTotalHits - iRunningTotal);
            }
            DrawPie(oBrowser.iTotalHits, aItem, aValue);
            break;
        default:
            // find family totals
            for (var iRow in aFamily) {
                if (aFamily[iRow].sBrowser == sPage) {
                    iFamilyTotalHits = aFamily[iRow].iHits;
                    break;
                }
            }

            // extract data
            for (var iRow in oBrowser.aData) {
                if ((iCount < 6) && (oBrowser.aData[iRow].sFamily == sPage)) {
                    aItem.push(oBrowser.aData[iRow].sBrowser);
                    aValue.push(oBrowser.aData[iRow].iHits);
                    iRunningTotal += oBrowser.aData[iRow].iHits;
                    iCount++;
                }
            }
            if (iFamilyTotalHits > iRunningTotal) {
                aItem.push(Lang("Other Versions"));
                aValue.push(iFamilyTotalHits - iRunningTotal);
            }
            DrawPie(iFamilyTotalHits, aItem, aValue);
            break;
    }
}


function DrawPie_Country(sContinent) {
    var oCountry = aStatistics["country"][aParts.length + 1];
    // get values
    if (typeof sContinent == "undefined") {
        iTotalPages = oCountry.iTotalPages;
    } else {
        iTotalPages = oCountry.oContinent[sContinent].iTotalPages;
    }
    aData = oCountry.aData;

    // build arrays
    var aItem = [];
    var aValue = [];
    var iRunningTotal = 0;
    var iCount = 0;
    for (var iIndex in aData) {
        if (iCount < 6) {
            if ((typeof sContinent == "undefined") || (aData[iIndex].sContinent == sContinent)) {
                aItem.push(Lang(aData[iIndex].sCountryName));
                aValue.push(aData[iIndex].iPages);
                iRunningTotal += aData[iIndex].iPages;
                iCount++;
            }
        }
    }
    if (iTotalPages > iRunningTotal) {
        aItem.push(Lang("Other Countries"));
        aValue.push(iTotalPages - iRunningTotal);
    }
    if (iTotalPages > 0)
        DrawPie(iTotalPages, aItem, aValue);
}


function DrawPie_City(sCountry) {
    oCity = aStatistics["city"][aParts.length + 1];
    var iTotalHits = 0;
    // get values
    if (typeof sCountry == "undefined") {
        iTotalHits = oCity.iTotalHits;
    } else {
        iTotalHits = oCity.oCountry[sCountry].iTotalHits;
    }

    aData = oCity.aData;

    // build arrays
    var aItem = [];
    var aValue = [];
    var iRunningTotal = 0;
    var iCount = 0;


    for (var iIndex in aData) {
        if ((typeof sCountry == "undefined") || (aData[iIndex].sCountry == sCountry)) {
            if (iCount < 6) {
                aItem.push(Lang(aData[iIndex].sCityName));
                aValue.push(aData[iIndex].iHits);
                iRunningTotal += aData[iIndex].iHits;
                iCount++;
            }

        }
    }
    if (iTotalHits > iRunningTotal) {
        aItem.push(Lang("Other Cities"));
        aValue.push(iTotalHits - iRunningTotal);
    }
    DrawPie(iTotalHits, aItem, aValue);
}

function DrawPie_CountryContinent() {
    var oCountry = aStatistics["country"][aParts.length + 1];
    // this section is an anomaly whereby the continents need to be sorted by size before being passsed to the flash
    // thankfully there are only 6 (we are interested in)
    var aTemp = [];
    for (var sContinent in gc_aContinents) {
        aTemp.push({"sContinent": sContinent,
            "iPages": oCountry.oContinent[sContinent].iTotalPages});
    }
    aTemp.sort(Sort_Pages);

    // pass across to simpler array format
    var iTotalPages = oCountry.iTotalPages;
    var aItem = [];
    var aValue = [];
    var iRunningTotal = 0;
    for (var iIndex in aTemp) {
        aItem.push(Lang(aTemp[iIndex].sContinent));
        aValue.push(aTemp[iIndex].iPages);
        iRunningTotal += aTemp[iIndex].iPages;
    }
    if (iTotalPages > iRunningTotal) {
        aItem.push(Lang("Other"));
        aValue.push(iTotalPages - iRunningTotal);
    }
    DrawPie(iTotalPages, aItem, aValue);
}

function DrawPie_Org() {
    oOrg = aStatistics["org"][aParts.length + 1];
    var aItem = [];
    var aValue = [];
    var iRunningTotal = 0;
    var iCount = 0;
    for (var iIndex in oOrg.aData) {
        if (iCount < 6) {
            aItem.push(oOrg.aData[iIndex].sOrgName);
            aValue.push(oOrg.aData[iIndex].iHits);
            iRunningTotal += oOrg.aData[iIndex].iHits;
        }
        iCount++;
    }
    if (oOrg.iTotalHits > iRunningTotal) {
        aItem.push(Lang("Other Organizations"));
        aValue.push(oOrg.iTotalHits - iRunningTotal);
    }
    DrawPie(oOrg.iTotalHits, aItem, aValue);
}

function DrawPie_Visitor() {
    oVisitor = aStatistics["visitor"][aParts.length + 1];
    var aItem = [];
    var aValue = [];
    var iRunningTotal = 0;
    var iCount = 0;
    for (var iIndex in oVisitor.aData) {
        if (iCount < 6) {
            aItem.push(oVisitor.aData[iIndex].sDesc);
            aValue.push(oVisitor.aData[iIndex].iPages);
            iRunningTotal += oVisitor.aData[iIndex].iPages;
        }
        iCount++;
    }
    if (oVisitor.iTotalPages > iRunningTotal) {
        aItem.push(Lang("Other Visitors"));
        aValue.push(oVisitor.iTotalPages - iRunningTotal);
    }
    DrawPie(oVisitor.iTotalPages, aItem, aValue);
}

function DrawPie_Filetypes() {
    oFiletypes = aStatistics["filetypes"][aParts.length + 1];
    var aItem = [];
    var aValue = [];
    var iRunningTotal = 0;
    var iCount = 0;
    for (var iIndex in oFiletypes.aData) {
        if (iCount < 6) {
            if (oFiletypes.aData[iIndex].sFiletype != "&nbsp;") {
                aItem.push(oFiletypes.aData[iIndex].sFiletype.toUpperCase() + ": " +
                        Lang(oFiletypes.aData[iIndex].sDescription));
            } else {
                aItem.push(Lang(oFiletypes.aData[iIndex].sDescription));
            }
            aValue.push(oFiletypes.aData[iIndex].iHits);
            iRunningTotal += oFiletypes.aData[iIndex].iHits;
        }
        iCount++;
    }
    if (oFiletypes.iTotalHits > iRunningTotal) {
        aItem.push(Lang("Other Filetypes"));
        aValue.push(oFiletypes.iTotalHits - iRunningTotal);
    }
    DrawPie(oFiletypes.iTotalHits, aItem, aValue);
}

function DrawPie_Keyphrases() {
    var oKeyphrases = aStatistics["keyphrases"][aParts.length + 1][0];

    var aItem = [];
    var aValue = [];
    var iRunningTotal = 0;
    var iCount = 0;
    for (var iIndex in oKeyphrases.aData) {
        if (iCount < 6) {
            aItem.push(oKeyphrases.aData[iIndex].sPhrase);
            aValue.push(oKeyphrases.aData[iIndex].iFreq);
            iRunningTotal += oKeyphrases.aData[iIndex].iFreq;
        }
        iCount++;
    }
    if (oKeyphrases.iTotalFreq > iRunningTotal) {
        aItem.push(Lang("Other Keyphrases"));
        aValue.push(oKeyphrases.iTotalFreq - iRunningTotal);
    }
    DrawPie(oKeyphrases.iTotalFreq, aItem, aValue);
}

function DrawPie_Keywords() {
    var oKeywords = aStatistics["keywords"][aParts.length + 1][0];
    var aItem = [];
    var aValue = [];
    var iRunningTotal = 0;
    var iCount = 0;
    for (var iIndex in oKeywords.aData) {
        if (iCount < 6) {
            aItem.push(oKeywords.aData[iIndex].sWord);
            aValue.push(oKeywords.aData[iIndex].iFreq);
            iRunningTotal += oKeywords.aData[iIndex].iFreq;
        }
        iCount++;
    }
    if (oKeywords.iTotalFreq > iRunningTotal) {
        aItem.push(Lang("Other Keywords"));
        aValue.push(oKeywords.iTotalFreq - iRunningTotal);
    }
    DrawPie(oKeywords.iTotalFreq, aItem, aValue);
}

function DrawPie_OperatingSystems(sPage) {
    var oOperatingSystems = aStatistics["os"][aParts.length + 1];
    var aItem = [];
    var aValue = [];
    var iRunningTotal = 0;
    var iCount = 0;

    switch (sPage) {
        case "all":
            for (var iRow in oOperatingSystems.aData) {
                if (iCount < 6) {
                    aItem.push(oOperatingSystems.aData[iRow].sOperatingSystem);
                    aValue.push(oOperatingSystems.aData[iRow].iHits);
                    iRunningTotal += oOperatingSystems.aData[iRow].iHits;
                    iCount++;
                }
            }
            if (oOperatingSystems.iTotalHits > iRunningTotal) {
                aItem.push(Lang("Other Operating Systems"));
                aValue.push(oOperatingSystems.iTotalHits - iRunningTotal);
            }
            DrawPie(oOperatingSystems.iTotalHits, aItem, aValue);
            break;
        case "family":
            for (var iRow in oOperatingSystems.aFamily) {
                if (iCount < 6) {
                    if (oOperatingSystems.aFamily[iRow].iHits > 0) {
                        aItem.push(gc_aOSFamilyCaption[oOperatingSystems.aFamily[iRow].sOperatingSystem]);
                        aValue.push(oOperatingSystems.aFamily[iRow].iHits);
                        iRunningTotal += oOperatingSystems.aFamily[iRow].iHits;
                        iCount++;
                    }
                }
            }
            if (oOperatingSystems.iTotalHits > iRunningTotal) {
                aItem.push(Lang("Other Operating Systems"));
                aValue.push(oOperatingSystems.iTotalHits - iRunningTotal);
            }
            DrawPie(oOperatingSystems.iTotalHits, aItem, aValue);
            break;
        default:
            // find family totals
            for (var iRow in oOperatingSystems.aFamily) {
                if (oOperatingSystems.aFamily[iRow].sBrowser == sPage) {
                    iFamilyTotalHits = oOperatingSystems.aFamily[iRow].iHits;
                    break;
                }
            }

            // extract data
            for (var iRow in oOperatingSystems.aData) {
                if ((iCount < 6) && (oOperatingSystems.aData[iRow].sFamily == sPage)) {
                    aItem.push(oOperatingSystems.aData[iRow].sOperatingSystem);
                    aValue.push(oOperatingSystems.aData[iRow].iHits);
                    iRunningTotal += oOperatingSystems.aData[iRow].iHits;
                    iCount++;
                }
            }
            if (iFamilyTotalHits > iRunningTotal) {
                aItem.push(Lang("Other Versions"));
                aValue.push(iFamilyTotalHits - iRunningTotal);
            }
            DrawPie(iFamilyTotalHits, aItem, aValue);
            break;
    }
}

function DrawPie_PageRefs(sPage) {
    var oPageRefs = aStatistics["pagerefs"][aParts.length + 1];
    var aItem = [];
    var aValue = [];
    var iRunningTotal = 0;
    var iCount = 0;

    // switch view
    switch (sPage) {
        case "all":
        case "top10":
        case "top50":
            var aData = oPageRefs.aData;
            var sVarName = "sURL";
            break;
        case "domains":
            var aData = oPageRefs.aDataDomain;
            var sVarName = "sVisibleURL";
            break;
    }

    // loop through data
    for (var iIndex in aData) {
        if (iCount < 6) {
            aItem.push(aData[iIndex][sVarName]);
            aValue.push(aData[iIndex].iPages);
            iRunningTotal += aData[iIndex].iPages;
        }
        iCount++;
    }
    if (oPageRefs.iTotalPages > iRunningTotal) {
        aItem.push(Lang("Other Referrers"));
        aValue.push(oPageRefs.iTotalPages - iRunningTotal);
    }
    DrawPie(oPageRefs.iTotalPages, aItem, aValue);
}

function DrawPie_PageRefsSE(sPage) {
    var oPageRefsSE = aStatistics["pagerefsse"][aParts.length + 1];
    var aItem = [];
    var aValue = [];
    var iRunningTotal = 0;
    var iCount = 0;
    var aData = oPageRefsSE.aData;

    // loop through data
    for (var iIndex in aData) {
        if (iCount < 6) {
            aItem.push(aData[iIndex].sReferrer);
            aValue.push(aData[iIndex].iPages);
            iRunningTotal += aData[iIndex].iPages;
        }
        iCount++;
    }
    if (oPageRefsSE.iTotalPages > iRunningTotal) {
        aItem.push(Lang("Other Search Engines"));
        aValue.push(oPageRefsSE.iTotalPages - iRunningTotal);
    }
    DrawPie(oPageRefsSE.iTotalPages, aItem, aValue);
}

function DrawPie_Pages(aData, iTotal, sItemName, bHaveTitles) {
    var aItem = [];
    var aValue = [];
    var iRunningTotal = 0;
    var iCount = 0;
    for (var iIndex in aData) {
        if (iCount < 6) {
            if (bHaveTitles)
                aItem.push(aData[iIndex].sTitle);
            else
                aItem.push(aData[iIndex].sURL);
            aValue.push(aData[iIndex][sItemName]);
            iRunningTotal += aData[iIndex][sItemName];
        }
        iCount++;
    }
    if (iTotal > iRunningTotal) {
        aItem.push(Lang("Other URLs"));
        aValue.push(iTotal - iRunningTotal);
    }
    DrawPie(iTotal, aItem, aValue);
}

function DrawPie_Robots() {
    var oRobots = aStatistics["robots"][aParts.length + 1];
    var aItem = [];
    var aValue = [];
    var iRunningTotal = 0;
    var iCount = 0;
    for (var iIndex in oRobots.aData) {
        if (iCount < 6) {
            aItem.push(oRobots.aData[iIndex].sRobot);
            aValue.push(oRobots.aData[iIndex].iHits);
            iRunningTotal += oRobots.aData[iIndex].iHits;
        }
        iCount++;
    }
    if (oRobots.iTotalHits > iRunningTotal) {
        aItem.push(Lang("Other Spiders"));
        aValue.push(oRobots.iTotalHits - iRunningTotal);
    }
    DrawPie(oRobots.iTotalHits, aItem, aValue);
}

function DrawPie_Session() {
    var oSession = aStatistics["session"][aParts.length + 1];
    var aItem = [Lang("0 seconds - 30 seconds"), Lang("30 seconds - 2 minutes"), Lang("2 minutes - 5 minutes"), Lang("5 minutes - 15 minutes"), Lang("15 minutes - 30 minutes"), Lang("30 minutes - 1 hour"), Lang("More than 1 hour")];
    var aValue = [oSession.aData.s0s30s,
        oSession.aData.s30s2mn,
        oSession.aData.s2mn5mn,
        oSession.aData.s5mn15mn,
        oSession.aData.s15mn30mn,
        oSession.aData.s30mn1h,
        oSession.aData.s1h];
    DrawPie(oSession.iTotalFreq, aItem, aValue);
}

function DrawPie_Status() {
    var oStatus = aStatistics["status"][aParts.length + 1];
    var aItem = [];
    var aValue = [];
    var iRunningTotal = 0;
    var iCount = 0;
    for (var iIndex in oStatus.aData) {
        if (iCount < 6) {
            if (oStatus.aData[iIndex].sDescription != "&nbsp;") {
                aItem.push(oStatus.aData[iIndex].sCode + ": " +
                        Lang(oStatus.aData[iIndex].sDescription));
            } else {
                aItem.push(oStatus.aData[iIndex].sCode);
            }
            aValue.push(oStatus.aData[iIndex].iHits);
            iRunningTotal += oStatus.aData[iIndex].iHits;
        }
        iCount++;
    }
    if (oStatus.iTotalHits > iRunningTotal) {
        aItem.push(Lang("Other Status Codes"));
        aValue.push(oStatus.iTotalHits - iRunningTotal);
    }
    DrawPie(oStatus.iTotalHits, aItem, aValue);
}

function DrawPie_Status404() {
    var oStatus404 = aStatistics["status404"][aParts.length + 1];
    var aItem = [];
    var aValue = [];
    var iRunningTotal = 0;
    var iCount = 0;
    for (var iIndex in oStatus404.aData) {
        if (iCount < 6) {
            aItem.push(oStatus404.aData[iIndex].sURL.replace(/&#8203;/g, ""));
            aValue.push(oStatus404.aData[iIndex].iHits);
            iRunningTotal += oStatus404.aData[iIndex].iHits;
        }
        iCount++;
    }
    if (oStatus404.iTotalHits > iRunningTotal) {
        aItem.push("Other URLs");
        aValue.push(oStatus404.iTotalHits - iRunningTotal);
    }
    DrawPie(oStatus404.iTotalHits, aItem, aValue);
}

function DrawTable_AllMonths(sPage) {
    // create header
    var sHTML = "<table class=\"tablesorter\" cellspacing=\"0\">\n" +
            "<thead><tr>";
    if (sPage == "all") {
        sHTML += "<th width=\"16%\">" + Lang("Month") + "</th>";
    } else {
        sHTML += "<th width=\"16%\">" + Lang("Year") + "</th>";
    }
    sHTML += "<th width=\"12%\">" + Lang("Total Visitors") + "</th>" +
            "<th width=\"12%\">" + Lang("Visitors per Day") + "</th>" +
            "<th width=\"12%\">" + Lang("Unique Visitors") + "</th>" +
            "<th width=\"12%\">" + Lang("Unique Ratio") + "</th>" +
            "<th width=\"12%\">" + Lang("Pages") + "</th>" +
            "<th width=\"12%\">" + Lang("Hits") + "</th>" +
            "<th width=\"12%\" class=\"noborder\">" + Lang("BW") + "</th>" +
            "</tr></thead>\n" +
            "<tbody>";

    oAllMonths = aStatistics["allmonths"];

    // create table body
    aHTML = new Array();
    var iTotalVisits = 0;
    var iTotalUniques = 0;
    var iTotalPages = 0;
    var iTotalHits = 0;
    var iTotalBW = 0;
    var iAnnualVisits = 0;
    var iAnnualUniques = 0;
    var iAnnualPages = 0;
    var iAnnualHits = 0;
    var iAnnualBW = 0;
    var iCurrentYear = oAllMonths[0].aData[0].iYear;

    for (var iRow in oAllMonths[0].aData) {
        oRow = oAllMonths[0].aData[iRow];


        // create single values

        var iVisits = SumParts(oAllMonths, "iVisits", iRow);
        var iUniques = SumParts(oAllMonths, "iUniques", iRow);
        var iPages = SumParts(oAllMonths, "iPages", iRow);
        var iHits = SumParts(oAllMonths, "iHits", iRow);
        var iBW = SumParts(oAllMonths, "iBW", iRow);
        /*var iVisits      = oRow.iVisits;
         var iUniques     = oRow.iUniques;
         var iPages       = oRow.iPages;
         var iHits        = oRow.iHits;
         var iBW          = oRow.iBW;*/
        var iDaysInMonth = oRow.iDaysInMonth;

        // sum totals
        iTotalVisits += iVisits;
        iTotalUniques += iUniques;
        iTotalPages += iPages;
        iTotalHits += iHits;
        iTotalBW += iBW;
        iAnnualVisits += iVisits;
        iAnnualUniques += iUniques;
        iAnnualPages += iPages;
        iAnnualHits += iHits;
        iAnnualBW += iBW;
        iCurrentYear = oRow.iYear;

        // create table
        switch (sPage) {
            case "all":
                if ((g_iMonth == oRow.iMonth) && (g_iYear == oRow.iYear)) {
                    var sHTMLRow = "<tr class=\"highlight\">";
                } else {
                    var sHTMLRow = "<tr>";
                }
                sHTMLRow += "<td><span class=\"hidden\">" + oRow.dtDate.valueOf() + "</span>" + Lang(gc_aMonthName[oRow.iMonth - 1]) + " " + oRow.iYear + "</td>" +
                        "<td class=\"right\">" + NumberFormat(iVisits, 0) + "</td>" +
                        "<td class=\"right\">" + NumberFormat((iVisits / iDaysInMonth), 1) + "</td>" +
                        "<td class=\"right\">" + NumberFormat(iUniques) + "</td>";
                if (iVisits > 0) {
                    sHTMLRow += "<td class=\"right\">" + NumberFormat(((iUniques / iVisits) * 100), 0) + "%</td>";
                } else {
                    sHTMLRow += "<td class=\"right\">0%</td>";
                }
                sHTMLRow += "<td class=\"right\">" + NumberFormat(iPages, 0) + "</td>" +
                        "<td class=\"right\">" + NumberFormat(iHits, 0) + "</td>" +
                        "<td class=\"right\">" + DisplayBandwidth(iBW) + "</td>" +
                        "</tr>\n";
                aHTML.push(sHTMLRow);
                break;
            case "year":
                //if ((iCurrentYear != oRow.iYear) || (iRow == (oStatistics.oAllMonths.aData.length - 1))) {
                if ((oRow.iMonth == 12) || (iRow == (oAllMonths[0].aData.length - 1))) {
                    var sHTMLRow = "<tr>" +
                            "<td>" + iCurrentYear + "</td>" +
                            "<td class=\"right\">" + NumberFormat(iAnnualVisits) + "</td>" +
                            "<td class=\"right\">" + NumberFormat((iAnnualVisits / oAllMonths[0].aYearDayCount[iCurrentYear]), 1) + "</td>" +
                            "<td class=\"right\">" + NumberFormat(iAnnualUniques, 0) + "</td>";
                    if (iAnnualVisits > 0) {
                        sHTMLRow += "<td class=\"right\">" + NumberFormat(((iAnnualUniques / iAnnualVisits) * 100), 0) + "%</td>";
                    } else {
                        sHTMLRow += "<td class=\"right\">0%</td>";
                    }
                    sHTMLRow += "<td class=\"right\">" + NumberFormat(iAnnualPages, 0) + "</td>" +
                            "<td class=\"right\">" + NumberFormat(iAnnualHits, 0) + "</td>" +
                            "<td class=\"right\">" + DisplayBandwidth(iAnnualBW) + "</td>" +
                            "</tr>\n";
                    aHTML.push(sHTMLRow);

                    // reset values
                    iAnnualVisits = 0;
                    iAnnualUniques = 0;
                    iAnnualPages = 0;
                    iAnnualHits = 0;
                    iAnnualBW = 0;
                }
                break;
        }
    }

    // output
    if (aHTML.length > 0) {
        sHTML = (sHTML + aHTML.join("\n") + "</tbody><tfoot><tr>" +
                "<td class=\"noborder\">&nbsp;</td>" +
                "<td class=\"noborder right\">" + NumberFormat(iTotalVisits, 0) + "</td>" +
                "<td class=\"noborder right\">&nbsp;</td>" +
                "<td class=\"noborder right\">" + NumberFormat(iTotalUniques, 0) + "</td>" +
                "<td class=\"noborder right\">&nbsp;</td>" +
                "<td class=\"noborder right\">" + NumberFormat(iTotalPages, 0) + "</td>" +
                "<td class=\"noborder right\">" + NumberFormat(iTotalHits, 0) + "</td>" +
                "<td class=\"noborder right\">" + DisplayBandwidth(iTotalBW) + "</td>" +
                "</tr></tfoot></table>")
        return ([true, sHTML]);
    } else {
        return ([false, (sHTML + "<tr><td class=\"center\" colspan=\"7\">" + Lang("There is no data to display") + "</td></tr></tbody></table>")]);
    }
}

function DrawTable_Browser(sPage) {
    var oBrowser = aStatistics["browser"][aParts.length + 1];
    // get values
    iTotalHits = oBrowser.iTotalHits;
    aData = oBrowser.aData;
    aFamily = oBrowser.aFamily;

    // create table body
    aHTML = new Array();
    switch (sPage) {
        case "all":
            // create header
            var sHTML = "<table class=\"tablesorter\" cellspacing=\"0\">\n" +
                    "<thead><tr>" +
                    "<th width=\"1\">&nbsp;</th>" +
                    "<th>" + Lang("Browser") + "</th>" +
                    "<th>" + Lang("Hits") + "</th>" +
                    "<th class=\"noborder\">&nbsp;</th>" +
                    "</tr></thead>\n" +
                    "<tbody>";

            // create output
            for (var iRow in aData) {
                iPercent = ((aData[iRow].iHits / iTotalHits) * 100);
                aHTML.push("<tr>" +
                        "<td class=\"browserlogo\"><img src=\"themes/" + sThemeDir + "/browsers/" + aData[iRow].sFamily.replace(" ", "").replace("-", "").replace("\\", "").toLowerCase() + ".gif\" alt=\"" + aData[iRow].sFamily + "\" /></td>" +
                        "<td>" + aData[iRow].sBrowser + "</td>" +
                        "<td class=\"right\">" + NumberFormat(aData[iRow].iHits, 0) + "</td>" +
                        "<td class=\"noborder right\">" + iPercent.toFixed(1) + "%</td>" +
                        "</tr>\n");
            }
            break;
        case "family":
            // create header
            var sHTML = "<table class=\"tablesorter\" cellspacing=\"0\">\n" +
                    "<thead><tr>" +
                    "<th width=\"1\">&nbsp;</th>" +
                    "<th>" + Lang("Browser Family") + "</th>" +
                    "<th>" + Lang("Hits") + "</th>" +
                    "<th class=\"noborder\">&nbsp;</th>" +
                    "</tr></thead>\n" +
                    "<tbody>";

            // create output
            for (var iRow in aFamily) {
                if (aFamily[iRow].iHits > 0) {
                    iPercent = ((aFamily[iRow].iHits / iTotalHits) * 100);
                    aHTML.push("<tr>" +
                            "<td class=\"browserlogo\"><img src=\"themes/" + sThemeDir + "/browsers/" + aFamily[iRow].sBrowser.replace(" ", "").replace("-", "").replace("\\", "").toLowerCase() + ".gif\" alt=\"" + aFamily[iRow].sBrowser + "\"/></td>" +
                            "<td>" + gc_aBrowserFamilyCaption[aFamily[iRow].sBrowser] + " &nbsp;<span class=\"fauxlink tiny\" onclick=\"DrawPage('browser." +
                            aFamily[iRow].sBrowser + "');\">&raquo;</span>" + "</td>" +
                            "<td class=\"right\">" + NumberFormat(aFamily[iRow].iHits, 0) + "</td>" +
                            "<td class=\"noborder right\">" + iPercent.toFixed(1) + "%</td>" +
                            "</tr>\n");
                }
            }
            break;
        default:
            // create header
            var sHTML = "<table class=\"tablesorter\" cellspacing=\"0\">\n" +
                    "<thead><tr>" +
                    "<th width=\"1\">&nbsp;</th>" +
                    "<th>" + Lang("Browser") + "</th>" +
                    "<th>" + Lang("Hits") + "</th>" +
                    "<th class=\"noborder\" width=\"1\">%&nbsp;" + Lang("within Family") + "</th>" +
                    "<th class=\"noborder\" width=\"1\">%&nbsp;" + Lang("Overall") + "</th>" +
                    "</tr></thead>\n" +
                    "<tbody>";

            // find family totals
            for (var iRow in aFamily) {
                if (aFamily[iRow].sBrowser == sPage) {
                    iFamilyTotalHits = aFamily[iRow].iHits;
                    break;
                }
            }

            // create output
            for (var iRow in aData) {
                if (aData[iRow].sFamily == sPage) {
                    iTotalPercent = ((aData[iRow].iHits / iTotalHits) * 100);
                    iFamilyPercent = ((aData[iRow].iHits / iFamilyTotalHits) * 100);
                    aHTML.push("<tr>" +
                            "<td class=\"browserlogo\"><img src=\"themes/" + sThemeDir + "/browsers/" + aData[iRow].sFamily.replace(" ", "").replace("-", "").replace("\\", "").toLowerCase() + ".gif\" alt=\"" + aData[iRow].sFamily + "\"/></td>" +
                            "<td>" + aData[iRow].sBrowser + "</td>" +
                            "<td class=\"right\">" + NumberFormat(aData[iRow].iHits, 0) + "</td>" +
                            "<td class=\"noborder right\">" + iFamilyPercent.toFixed(1) + "%</td>" +
                            "<td class=\"noborder right\">" + iTotalPercent.toFixed(1) + "%</td>" +
                            "</tr>\n");
                }
            }
    }

    // output
    if (aHTML.length > 0) {
        return ([true, (sHTML + aHTML.join("\n") + "</tbody></table>")]);
    } else {
        return ([false, (sHTML + "<tr><td class=\"center\" colspan=\"4\">" + Lang("There is no data to display") + "</td></tr></tbody></table>")]);
    }
}


function DrawTable_Country(sContinent) {
    var oCountry = aStatistics["country"][aParts.length + 1];
    // get values
    if (typeof sContinent == "undefined") {
        iTotalPages = oCountry.iTotalPages;
        iTotalHits = oCountry.iTotalHits;
        iTotalBW = oCountry.iTotalBW;
    } else {
        iTotalPages = oCountry.oContinent[sContinent].iTotalPages;
        iTotalHits = oCountry.oContinent[sContinent].iTotalHits;
        iTotalBW = oCountry.oContinent[sContinent].iTotalBW;
    }
    aData = oCountry.aData;

    // create header
    var sHTML = "<table class=\"tablesorter\" cellspacing=\"0\">\n" +
            "<thead><tr>" +
            "<th>&nbsp;</th>" +
            "<th>" + Lang("Country") + "</th>" +
            "<th>" + Lang("Pages") + "</th>" +
            "<th>%</th>" +
            "<th>" + Lang("Hits") + "</th>" +
            "<th>%</th>" +
            "<th>" + Lang("Bandwidth") + "</th>" +
            "<th class=\"noborder\">%</th>" +
            "</tr></thead>\n" +
            "<tbody>";

    // create table body
    var aHTML = new Array();
    for (var iRow in aData) {
        if (aData[iRow].sContinent == "Other") {
            aData[iRow].sCountryCode = "trans";
        }
        if ((typeof sContinent == "undefined") || (aData[iRow].sContinent == sContinent)) {
            aHTML.push("<tr>" +
                    "<td class=\"countryflag\"><img src=\"themes/" + sThemeDir + "/flags/" + aData[iRow].sCountryCode + ".gif\" alt=\"" + aData[iRow].sCountryName + "\" /></td>" +
                    "<td>" + Lang(aData[iRow].sCountryName) + "</td>" +
                    "<td class=\"noborder right\">" + NumberFormat(aData[iRow].iPages, 0) + "</td>" +
                    "<td class=\"right\">" + (SafeDivide(aData[iRow].iPages, iTotalPages) * 100).toFixed(1) + "%</td>" +
                    "<td class=\"noborder right\">" + NumberFormat(aData[iRow].iHits, 0) + "</td>" +
                    "<td class=\"right\">" + ((aData[iRow].iHits / iTotalHits) * 100).toFixed(1) + "%</td>" +
                    "<td class=\"noborder right\">" + DisplayBandwidth(aData[iRow].iBW) + "</td>" +
                    "<td class=\"noborder right\">" + ((aData[iRow].iBW / iTotalBW) * 100).toFixed(1) + "%</td>" +
                    "</tr>");
        }
    }

    // output
    if (aHTML.length > 0) {
        return ([true, (sHTML + aHTML.join("\n") + "</tbody></table>")]);
    } else {
        return ([false, (sHTML + "<tr><td class=\"center\" colspan=\"8\">" + Lang("There is no data to display") + "</td></tr></tbody></table>")]);
    }
}

function DrawTable_CountryContinent() {
    var oCountry = aStatistics["country"][aParts.length + 1];
    // get values
    var iTotalPages = oCountry.iTotalPages;
    var iTotalHits = oCountry.iTotalHits;
    var iTotalBW = oCountry.iTotalBW;
    var iOtherPages = iTotalPages;
    var iOtherHits = iTotalHits;
    var iOtherBW = iTotalBW;

    // create header
    var sHTML = "<table class=\"tablesorter\" cellspacing=\"0\">\n" +
            "<thead><tr>" +
            "<th>" + Lang("Continent") + "</th>" +
            "<th>" + Lang("Pages") + "</th>" +
            "<th>%</th>" +
            "<th>" + Lang("Hits") + "</th>" +
            "<th>%</th>" +
            "<th>" + Lang("Bandwidth") + "</th>" +
            "<th class=\"noborder\">%</th>" +
            "</tr></thead>\n" +
            "<tbody>";

    // create table body
    aHTML = new Array();
    for (var sContinent in gc_aContinents) {
        oC = oCountry.oContinent[sContinent];
        iOtherPages -= oC.iTotalPages;
        iOtherHits -= oC.iTotalHits;
        iOtherBW -= oC.iTotalBW;
        aHTML.push("<tr>" +
                "<td>" + Lang(sContinent) + " &nbsp;<span class=\"fauxlink tiny\" onclick=\"DrawPage('country." + sContinent + "');\">&raquo;</span></td>" +
                "<td class=\"right\">" + NumberFormat(oC.iTotalPages, 0) + "</td>" +
                "<td class=\"right\">" + ((oC.iTotalPages / iTotalPages) * 100).toFixed(1) + "%</td>" +
                "<td class=\"right\">" + NumberFormat(oC.iTotalHits, 0) + "</td>" +
                "<td class=\"right\">" + ((oC.iTotalHits / iTotalHits) * 100).toFixed(1) + "%</td>" +
                "<td class=\"right\">" + DisplayBandwidth(oC.iTotalBW) + "</td>" +
                "<td class=\"noborder right\">" + ((oC.iTotalBW / iTotalBW) * 100).toFixed(1) + "%</td>" +
                "</tr>\n");
    }

    // add "other" row
    aHTML.push("<tr>" +
            "<td>" + Lang("Other") + "&nbsp;<span class=\"fauxlink tiny\" onclick=\"DrawPage('country.Other');\">&raquo;</span></td>" +
            "<td class=\"right\">" + NumberFormat(iOtherPages, 0) + "</td>" +
            "<td class=\"right\">" + ((iOtherPages / iTotalPages) * 100).toFixed(1) + "%</td>" +
            "<td class=\"right\">" + NumberFormat(iOtherHits, 0) + "</td>" +
            "<td class=\"right\">" + ((iOtherHits / iTotalHits) * 100).toFixed(1) + "%</td>" +
            "<td class=\"right\">" + DisplayBandwidth(iOtherBW) + "</td>" +
            "<td class=\"noborder right\">" + ((iOtherBW / iTotalBW) * 100).toFixed(1) + "%</td>" +
            "</tr>\n");

    // output
    return (sHTML + aHTML.join("\n") + "</tbody></table>");
}

function DrawTable_City(sCountry) {
    oCity = aStatistics["city"][aParts.length + 1];
    // get values
    //    iTotalPages = oCity.iTotalPages;
    iTotalHits = oCity.iTotalHits;
    //    iTotalBW    = oCity.iTotalBW;

    if (typeof sCountry != "undefined") {
        //	iTotalPages = oCity.oCountry[sCountry].iTotalPages;
        iTotalHits = oCity.oCountry[sCountry].iTotalHits;
        //	iTotalBW    = oCity.oContinent[sCountry].iTotalBW;
    }

    aData = oCity.aData;

    // create header
    var sHTML = "<table class=\"tablesorter\" cellspacing=\"0\">\n" +
            "<thead><tr>" +
            "<th>&nbsp;</th>" +
            "<th>" + Lang("City") + "</th>" +
            //      "<th>" + Lang("Pages") + "</th>" +
            //        "<th>%</th>" +
            "<th>" + Lang("Hits") + "</th>" +
            "<th>%</th>" +
            //		          "<th>" + Lang("Bandwidth") + "</th>" +
            //		          "<th class=\"noborder\">%</th>" +
            "</tr></thead>\n" +
            "<tbody>";

    // create table body
    var aHTML = new Array();
    for (var iRow in aData) {
        /*    if (aData[iRow].sContinent == "Other") {
         aData[iRow].sCountryCode = "trans";
         }*/
        if ((typeof sCountry == "undefined") || (aData[iRow].sCountry == sCountry)) {
            aHTML.push("<tr>" +
                    "<td class=\"countryflag\"><img src=\"themes/" + sThemeDir + "/flags/" + aData[iRow].sCountry + ".gif\" alt=\"" + aData[iRow].sCityName + "\" /></td>" +
                    "<td>" + Lang(aData[iRow].sCityName) + "</td>" +
                    //                 "<td class=\"noborder right\">" + NumberFormat(aData[iRow].iPages, 0) + "</td>" +
                    //                 "<td class=\"right\">" + (SafeDivide(aData[iRow].iPages, iTotalPages) * 100).toFixed(1) + "%</td>" +
                    "<td class=\"noborder right\">" + NumberFormat(aData[iRow].iHits, 0) + "</td>" +
                    "<td class=\"right\">" + ((aData[iRow].iHits / iTotalHits) * 100).toFixed(1) + "%</td>" +
                    //                 "<td class=\"noborder right\">" + DisplayBandwidth(aData[iRow].iBW) + "</td>" +
                    //                 "<td class=\"noborder right\">" + ((aData[iRow].iBW / iTotalBW) * 100).toFixed(1) + "%</td>" +
                    "</tr>");
        }
    }

    // output
    if (aHTML.length > 0) {
        return ([true, (sHTML + aHTML.join("\n") + "</tbody></table>")]);
    } else {
        return ([false, (sHTML + "<tr><td class=\"center\" colspan=\"8\">" + Lang("There is no data to display") + "</td></tr></tbody></table>")]);
    }
}

function DrawTable_Filetypes() {
    oFiletypes = aStatistics["filetypes"][aParts.length + 1];
    // get values
    iTotalHits = oFiletypes.iTotalHits;
    iTotalBW = oFiletypes.iTotalBW;
    iTotalNonCompBW = oFiletypes.iTotalNonCompBW;
    iTotalCompBW = oFiletypes.iTotalCompBW;
    aData = oFiletypes.aData;

    // create header
    var sHTML = "<table class=\"tablesorter\" cellspacing=\"0\">\n" +
            "<thead><tr>" +
            "<th>" + Lang("Filetype") + "</th>" +
            "<th>" + Lang("Description") + "</th>" +
            "<th>" + Lang("Hits") + "</th>" +
            "<th>&nbsp;</th>" +
            "<th>" + Lang("Bandwidth") + "</th>" +
            "<th>&nbsp;</th>" +
            "<th class=\"noborder\">" + Lang("Average Size") + "</th>" +
            "</tr></thead>\n" +
            "<tbody>";

    // create table body
    aHTML = new Array();
    for (var iRow in aData) {
        aHTML.push("<tr>" +
                "<td>" + oFiletypes.aData[iRow].sFiletype + "</td>" +
                "<td>" + Lang(oFiletypes.aData[iRow].sDescription) + "</td>" +
                "<td class=\"right\">" + NumberFormat(oFiletypes.aData[iRow].iHits, 0) + "</td>" +
                "<td class=\"right\">" + ((oFiletypes.aData[iRow].iHits / iTotalHits) * 100).toFixed(1) + "%</td>" +
                "<td class=\"right\">" + DisplayBandwidth(oFiletypes.aData[iRow].iBW) + "</td>" +
                "<td class=\"right\">" + ((oFiletypes.aData[iRow].iBW / iTotalBW) * 100).toFixed(1) + "%</td>" +
                "<td class=\"noborder right\">" + DisplayBandwidth(oFiletypes.aData[iRow].iBW / oFiletypes.aData[iRow].iHits) + "</td>" +
                "</tr>\n");
    }

    // output
    if (aHTML.length > 0) {
        return ([true, (sHTML + aHTML.join("\n") + "</tbody></table>")]);
    } else {
        return ([false, (sHTML + "<tr><td class=\"center\" colspan=\"7\">" + Lang("There is no data to display") + "</td></tr></tbody></table>")]);
    }
}

function DrawTable_Org() {
    oOrg = aStatistics["org"][aParts.length + 1];
    // get values
    iTotalHits = oOrg.iTotalHits;
    //  iTotalBW        = oOrg.iTotalBW;
    //  iTotalNonCompBW = oOrg.iTotalNonCompBW;
    //  iTotalCompBW    = oOrg.iTotalCompBW;
    aData = oOrg.aData;

    // create header
    var sHTML = "<table class=\"tablesorter\" cellspacing=\"0\">\n" +
            "<thead><tr>" +
            "<th>" + Lang("Organization") + "</th>" +
            //              "<th>" + Lang("Description") + "</th>" +
            "<th>" + Lang("Hits") + "</th>" +
            "<th>&nbsp;</th>" +
            /*		          "<th>" + Lang("Bandwidth") + "</th>" +
             "<th>&nbsp;</th>" +
             "<th class=\"noborder\">" + Lang("Average Size") + "</th>" +*/
            "</tr></thead>\n" +
            "<tbody>";

    // create table body
    aHTML = new Array();
    for (var iRow in aData) {
        var sOrg = oOrg.aData[iRow].sOrgName;
        if (!oOrg.aData[iRow].sOrgName)
            sOrg = oOrg.aData[iRow].sOrgCode;
        aHTML.push("<tr>" +
                "<td>" + sOrg + "</td>" +
                //               "<td>" + Lang(oFiletypes.aData[iRow].sDescription) + "</td>" +
                "<td class=\"right\">" + NumberFormat(oOrg.aData[iRow].iHits, 0) + "</td>" +
                "<td class=\"right\">" + ((oOrg.aData[iRow].iHits / iTotalHits) * 100).toFixed(1) + "%</td>" +
                /*               "<td class=\"right\">" + DisplayBandwidth(oOrg.aData[iRow].iBW) + "</td>" +
                 "<td class=\"right\">" + ((oOrg.aData[iRow].iBW / iTotalBW) * 100).toFixed(1) + "%</td>" +
                 "<td class=\"noborder right\">" + DisplayBandwidth(oOrg.aData[iRow].iBW / oOrg.aData[iRow].iHits) + "</td>" +*/
                "</tr>\n");
    }

    // output
    if (aHTML.length > 0) {
        return ([true, (sHTML + aHTML.join("\n") + "</tbody></table>")]);
    } else {
        return ([false, (sHTML + "<tr><td class=\"center\" colspan=\"7\">" + Lang("There is no data to display") + "</td></tr></tbody></table>")]);
    }
}

function DrawTable_Visitor() {
    oVisitor = aStatistics["visitor"][aParts.length + 1];
    // get values
    iTotalPages = oVisitor.iTotalPages;
    iTotalHits = oVisitor.iTotalHits;
    iTotalBW = oVisitor.iTotalBW;
    //  iTotalNonCompBW = oVisitor.iTotalNonCompBW;
    //  iTotalCompBW    = oVisitor.iTotalCompBW;
    aData = oVisitor.aData;

    // create header
    var sHTML = "<table class=\"tablesorter\" cellspacing=\"0\">\n" +
            "<thead><tr>" +
            "<th>" + Lang("Address") + "</th>" +
            "<th>" + Lang("Pages") + "</th>" +
            "<th>&nbsp;</th>" +
            "<th>" + Lang("Hits") + "</th>" +
            "<th>&nbsp;</th>" +
            "<th>" + Lang("Bandwidth") + "</th>" +
            "<th>&nbsp;</th>" +
            "<th class=\"noborder\">" + Lang("Average Size") + "</th>" +
            "</tr></thead>\n" +
            "<tbody>";

    // create table body
    aHTML = new Array();
    for (var iRow in aData) {
        aHTML.push("<tr>" +
                "<td>" + oVisitor.aData[iRow].sDesc + "</td>" +
                "<td class=\"right\">" + NumberFormat(oVisitor.aData[iRow].iPages, 0) + "</td>" +
                "<td class=\"right\">" + ((oVisitor.aData[iRow].iPages / iTotalPages) * 100).toFixed(1) + "%</td>" +
                "<td class=\"right\">" + NumberFormat(oVisitor.aData[iRow].iHits, 0) + "</td>" +
                "<td class=\"right\">" + ((oVisitor.aData[iRow].iHits / iTotalHits) * 100).toFixed(1) + "%</td>" +
                "<td class=\"right\">" + DisplayBandwidth(oVisitor.aData[iRow].iBW) + "</td>" +
                "<td class=\"right\">" + ((oVisitor.aData[iRow].iBW / iTotalBW) * 100).toFixed(1) + "%</td>" +
                "<td class=\"noborder right\">" + DisplayBandwidth(oVisitor.aData[iRow].iBW / oVisitor.aData[iRow].iHits) + "</td>" +
                "</tr>\n");
    }

    // output
    if (aHTML.length > 0) {
        return ([true, (sHTML + aHTML.join("\n") + "</tbody></table>")]);
    } else {
        return ([false, (sHTML + "<tr><td class=\"center\" colspan=\"7\">" + Lang("There is no data to display") + "</td></tr></tbody></table>")]);
    }
}

function DrawTable_OperatingSystems(sPage) {
    var oOperatingSystems = aStatistics["os"][aParts.length + 1];
    // get values
    var iTotalHits = oOperatingSystems.iTotalHits;
    var aData = oOperatingSystems.aData;
    var aFamily = oOperatingSystems.aFamily;

    // create table body
    var aHTML = [];
    switch (sPage) {
        case "all":
            // create header
            var sHTML = "<table class=\"tablesorter\" cellspacing=\"0\">\n" +
                    "<thead><tr>" +
                    "<th width=\"1\">&nbsp;</th>" +
                    "<th>" + Lang("Operating System") + "</th>" +
                    "<th>" + Lang("Hits") + "</th>" +
                    "<th class=\"noborder\">&nbsp;</th>" +
                    "</tr></thead>\n" +
                    "<tbody>";

            // create output
            for (var iRow in aData) {
                var iPercent = ((aData[iRow].iHits / iTotalHits) * 100);
                aHTML.push("<tr>" +
                        "<td class=\"oslogo\"><img src=\"themes/" + sThemeDir + "/os/" + aData[iRow].sFamily.replace(" ", "").toLowerCase() + ".gif\" alt=\"" + aData[iRow].sFamily + "\" /></td>" +
                        "<td>" + aData[iRow].sOperatingSystem + "</td>" +
                        "<td class=\"right\">" + NumberFormat(aData[iRow].iHits, 0) + "</td>" +
                        "<td class=\"noborder right\">" + iPercent.toFixed(1) + "%</td>" +
                        "</tr>\n");
            }
            break;
        case "family":
            // create header
            var sHTML = "<table class=\"tablesorter\" cellspacing=\"0\">\n" +
                    "<thead><tr>" +
                    "<th width=\"1\">&nbsp;</th>" +
                    "<th>" + Lang("Operating System Family") + "</th>" +
                    "<th>" + Lang("Hits") + "</th>" +
                    "<th class=\"noborder\">&nbsp;</th>" +
                    "</tr></thead>\n" +
                    "<tbody>";

            // create output
            for (var iRow in aFamily) {
                if (aFamily[iRow].iHits > 0) {
                    var iPercent = ((aFamily[iRow].iHits / iTotalHits) * 100);
                    aHTML.push("<tr>" +
                            "<td class=\"oslogo\"><img src=\"themes/" + sThemeDir + "/os/" + aFamily[iRow].sOperatingSystem.replace(" ", "").toLowerCase() + ".gif\" alt=\"" + aFamily[iRow].sOperatingSystem + "\" /></td>" +
                            "<td>" + gc_aOSFamilyCaption[aFamily[iRow].sOperatingSystem] + " &nbsp;<span class=\"fauxlink tiny\" onclick=\"DrawPage('os." +
                            aFamily[iRow].sOperatingSystem + "');\">&raquo;</span>" + "</td>" +
                            "<td class=\"right\">" + NumberFormat(aFamily[iRow].iHits, 0) + "</td>" +
                            "<td class=\"noborder right\">" + iPercent.toFixed(1) + "%</td>" +
                            "</tr>\n");
                }
            }
            break;
        default:
            // create header
            var sHTML = "<table class=\"tablesorter\" cellspacing=\"0\">\n" +
                    "<thead><tr>" +
                    "<th width=\"1\">&nbsp;</th>" +
                    "<th>" + Lang("Operating System") + "</th>" +
                    "<th>" + Lang("Hits") + "</th>" +
                    "<th class=\"noborder\" width=\"1\">%&nbsp;" + (Lang("within Family")).replace(" ", "&nbsp;") + "</th>" +
                    "<th class=\"noborder\" width=\"1\">%&nbsp;" + Lang("Overall") + "</th>" +
                    "</tr></thead>\n" +
                    "<tbody>";

            // find family totals
            for (var iRow in aFamily) {
                if (aFamily[iRow].sOperatingSystem == sPage) {
                    iFamilyTotalHits = aFamily[iRow].iHits;
                    break;
                }
            }

            // create output
            for (var iRow in aData) {
                if (aData[iRow].sFamily == sPage) {
                    iTotalPercent = ((aData[iRow].iHits / iTotalHits) * 100);
                    iFamilyPercent = ((aData[iRow].iHits / iFamilyTotalHits) * 100);
                    aHTML.push("<tr>" +
                            "<td class=\"oslogo\"><img src=\"themes/" + sThemeDir + "/os/" + aData[iRow].sFamily.replace(" ", "").toLowerCase() + ".gif\" alt=\"" + aData[iRow].sFamily + "\" /></td>" +
                            "<td>" + aData[iRow].sOperatingSystem + "</td>" +
                            "<td class=\"right\">" + NumberFormat(aData[iRow].iHits, 0) + "</td>" +
                            "<td class=\"noborder right\">" + iFamilyPercent.toFixed(1) + "%</td>" +
                            "<td class=\"noborder right\">" + iTotalPercent.toFixed(1) + "%</td>" +
                            "</tr>\n");
                }
            }
    }

    // output
    if (aHTML.length > 0) {
        return ([true, (sHTML + aHTML.join("\n") + "</tbody></table>")]);
    } else {
        return ([false, (sHTML + "<tr><td class=\"center\" colspan=\"3\">" + Lang("There is no data to display") + "</td></tr></tbody></table>")]);
    }
}


function DrawTable_PageRefs(sPage) {
    var oPageRefs = aStatistics["pagerefs"][aParts.length + 1];
    // get values
    iTotalPages = oPageRefs.iTotalPages;
    iTotalHits = oPageRefs.iTotalHits;
    switch (sPage) {
        case "domains":
            aData = oPageRefs.aDataDomain;
            break;
        default:
            aData = oPageRefs.aData;
            break;
    }

    // create header
    var sHTML = "<table class=\"tablesorter\" cellspacing=\"0\">\n" +
            "<thead><tr>" +
            "<th>" + Lang("Referrer") + "</th>" +
            "<th>" + Lang("Pages") + "</th>" +
            "<th>&nbsp;</th>" +
            "<th>" + Lang("Hits") + "</th>" +
            "<th class=\"noborder\">&nbsp;</th>" +
            "</tr></thead>\n" +
            "<tbody>";

    // create table body
    aHTML = new Array();
    for (var iRow in aData) {
        switch (sPage) {
            case "all":
            case "top10":
            case "top50":
                sReferrer = "<a href=\"" + aData[iRow].sURL + "\" target=\"_blank\">" + aData[iRow].sVisibleURL + "</a>";
                break;
            case "domains":
                sReferrer = "<a href=\"" + aData[iRow].sURL + "\" target=\"_blank\">" + aData[iRow].sVisibleURL + "</a>";
                break;
            default:
                sReferrer = aData[iRow].sURL;
        }
        aHTML.push("<tr>" +
                "<td>" + sReferrer + "</td>" +
                "<td class=\"right\">" + NumberFormat(aData[iRow].iPages, 0) + "</td>" +
                "<td class=\"right\">" + (SafeDivide(aData[iRow].iPages, iTotalPages) * 100).toFixed(1) + "%</td>" +
                "<td class=\"right\">" + NumberFormat(aData[iRow].iHits, 0) + "</td>" +
                "<td class=\"noborder right\">" + ((aData[iRow].iHits / iTotalHits) * 100).toFixed(1) + "%</td>" +
                "</tr>\n");
        if ((sPage == "top10") && (iRow > 9)) {
            break;
        }
        if ((sPage == "top50") && (iRow > 49)) {
            break;
        }
    }

    // output
    if (aHTML.length > 0) {
        return ([true, (sHTML + aHTML.join("\n") + "</tbody></table>")]);
    } else {
        return ([false, (sHTML + "<tr><td class=\"center\" colspan=\"5\">" + Lang("There is no data to display") + "</td></tr></tbody></table>")]);
    }
}

function DrawTable_PageRefsSE(sPage) {
    var oPageRefsSE = aStatistics["pagerefsse"][aParts.length + 1];
    // get values
    iTotalPages = oPageRefsSE.iTotalPages;
    iTotalHits = oPageRefsSE.iTotalHits;
    aData = oPageRefsSE.aData;

    // create header
    var sHTML = "<table class=\"tablesorter\" cellspacing=\"0\">\n" +
            "<thead><tr>" +
            "<th width=\"1\">&nbsp;</th>" +
            "<th>" + Lang("Search Engine") + "</th>" +
            "<th>" + Lang("Pages") + "</th>" +
            "<th>&nbsp;</th>" +
            "<th>" + Lang("Hits") + "</th>" +
            "<th class=\"noborder\">&nbsp;</th>" +
            "</tr></thead>\n" +
            "<tbody>";

    // create table body
    aHTML = new Array();
    for (var iRow in aData) {
        aHTML.push("<tr>" +
                "<td class=\"searchenginelogo\">" + aData[iRow].sImage + "</td>" +
                "<td><!-- " + aData[iRow].sReferrer + " -->" + aData[iRow].sURL + "</td>" +
                "<td class=\"right\">" + NumberFormat(aData[iRow].iPages, 0) + "</td>" +
                "<td class=\"right\">" + (SafeDivide(aData[iRow].iPages, iTotalPages) * 100).toFixed(1) + "%</td>" +
                "<td class=\"right\">" + NumberFormat(aData[iRow].iHits, 0) + "</td>" +
                "<td class=\"noborder right\">" + ((aData[iRow].iHits / iTotalHits) * 100).toFixed(1) + "%</td>" +
                "</tr>\n");
    }

    // output
    if (aHTML.length > 0) {
        return ([true, (sHTML + aHTML.join("\n") + "</tbody></table>")]);
    } else {
        return ([false, (sHTML + "<tr><td class=\"center\" colspan=\"6\">" + Lang("There is no data to display") + "</td></tr></tbody></table>")]);
    }
}

function DrawTable_Pages(aData) {
    var oPages = aStatistics["pages"][aParts.length + 1];
    // get values
    var iTotalPages = oPages.iTotalPages;
    var iTotalBW = oPages.iTotalBW;
    var iTotalEntry = oPages.iTotalEntry;
    var iTotalExit = oPages.iTotalExit;

    // create header
    var sHTML = "<table class=\"tablesorter\" cellspacing=\"0\">\n" +
            "<thead><tr>" +
            "<th>" + Lang("URL") + "</th>" +
            "<th>" + Lang("Pages") + "</th>" +
            "<th>&nbsp;</th>" +
            "<th>" + Lang("Bandwidth") + "</th>" +
            "<th>&nbsp;</th>" +
            "<th>" + Lang("Entry") + "</th>" +
            "<th>&nbsp;</th>" +
            "<th>" + Lang("Exit") + "</th>" +
            "<th class=\"noborder\">&nbsp;</th>" +
            "</tr></thead>\n" +
            "<tbody>";

    // create table body
    var aHTML = [];
    for (var iRow in aData) {
        sName = "";
        if (oPages.bHaveTitles)
            sName = "<td title=\"" + aData[iRow].sURL + "\">" + aData[iRow].sTitle + "</td>";
        else
            sName = "<td>" + aData[iRow].sURL + "</td>";
        aHTML.push("<tr>" +
                sName +
                "<td class=\"right\">" + NumberFormat(aData[iRow].iPages, 0) + "</td>" +
                "<td class=\"right\">" + NumberFormat(SafeDivide(aData[iRow].iPages, iTotalPages) * 100, 1) + "%</td>" +
                "<td class=\"right\">" + DisplayBandwidth(aData[iRow].iBW) + "</td>" +
                "<td class=\"right\">" + NumberFormat(SafeDivide(aData[iRow].iBW, iTotalBW) * 100, 1) + "%</td>" +
                "<td class=\"right\">" + NumberFormat(aData[iRow].iEntry, 0) + "</td>" +
                "<td class=\"right\">" + NumberFormat(SafeDivide(aData[iRow].iEntry, iTotalEntry) * 100, 1) + "%</td>" +
                "<td class=\"right\">" + NumberFormat(aData[iRow].iExit, 0) + "</td>" +
                "<td class=\"noborder right\">" + NumberFormat(SafeDivide(aData[iRow].iExit, iTotalExit) * 100, 1) + "%</td>" +
                "</tr>\n");
    }

    // output
    if (aHTML.length > 0) {
        return ([true, (sHTML + aHTML.join("\n") + "</tbody></table>")]);
    } else {
        return ([false, (sHTML + "<tr><td class=\"center\" colspan=\"9\">" + Lang("There is no data to display") + "</td></tr></tbody></table>")]);
    }
}

function DrawTable_Robots() {
    var oRobots = aStatistics["robots"][aParts.length + 1];
    // get values
    iTotalHits = oRobots.iTotalHits;
    iTotalBW = oRobots.iTotalBW;
    iTotalRobotsTXT = oRobots.iTotalRobotsTXT;
    aData = oRobots.aData;

    // create header
    var sHTML = "<table class=\"tablesorter\" cellspacing=\"0\">\n" +
            "<thead><tr>" +
            "<th>" + Lang("Spider") + "</th>" +
            "<th>" + Lang("Hits") + "</th>" +
            "<th>&nbsp;</th>" +
            "<th>" + Lang("Bandwidth") + "</th>" +
            "<th>&nbsp;</th>" +
            "<th>" + Lang("Last Visit") + "</th>" +
            "<th>Robots.txt</th>" +
            "<th class=\"noborder\">&nbsp;</th>" +
            "</tr></thead>\n" +
            "<tbody>";

    // create table body
    aHTML = new Array();
    for (var iRow in aData) {
        sDate = oRobots.aData[iRow].dtLastVisit.toString();
        dtDate = new Date(sDate.substr(0, 4),
                (parseInt(StripLeadingZeroes(sDate.substr(4, 2))) - 1),
                sDate.substr(6, 2),
                sDate.substr(8, 2),
                sDate.substr(10, 2),
                sDate.substr(12, 2));
        aHTML.push("<tr>" +
                "<td>" + oRobots.aData[iRow].sRobot + "</td>" +
                "<td class=\"right\">" + NumberFormat(oRobots.aData[iRow].iHits, 0) + "</td>" +
                "<td class=\"right\">" + ((oRobots.aData[iRow].iHits / iTotalHits) * 100).toFixed(1) + "%</td>" +
                "<td class=\"right\">" + DisplayBandwidth(oRobots.aData[iRow].iBW) + "</td>" +
                "<td class=\"right\">" + ((oRobots.aData[iRow].iBW / iTotalBW) * 100).toFixed(1) + "%</td>" +
                "<td class=\"right\"><span class=\"hidden\">" + sDate + "</span>" + dtDate.getDate() + " " + Lang(gc_aMonthName[dtDate.getMonth()].substr(0, 3)) + " '" + dtDate.getFullYear().toString().substr(2) + " " + AddLeadingZero(dtDate.getHours(), 2) + ":" + AddLeadingZero(dtDate.getMinutes(), 2) + "</td>" +
                "<td class=\"right\">" + NumberFormat(oRobots.aData[iRow].iRobotsTXT, 0) + "</td>" +
                "<td class=\"noborder right\">" + (SafeDivide(oRobots.aData[iRow].iRobotsTXT, iTotalRobotsTXT) * 100).toFixed(1) + "%</td>" +
                "</tr>\n");
    }

    // output
    if (aHTML.length > 0) {
        return ([true, (sHTML + aHTML.join("\n") + "</tbody></table>")]);
    } else {
        return ([false, (sHTML + "<tr><td class=\"center\" colspan=\"8\">" + Lang("There is no data to display") + "</td></tr></tbody></table>")]);
    }
}

function DrawTable_Session() {
    var oSession = aStatistics["session"][aParts.length + 1];
    // get values
    var iTotalFreq = oSession.iTotalFreq;
    var aData = oSession.aData;

    // create header
    var sHTML = "<table class=\"tablesorter\" cellspacing=\"0\">\n" +
            "<thead><tr>" +
            "<th>" + Lang("Session Length") + "</th>" +
            "<th>" + Lang("Frequency") + "</th>" +
            "<th class=\"noborder\">&nbsp;</th>" +
            "</tr></thead>\n" +
            "<tbody>";

    // create table body
    aHTML = new Array();
    aHTML.push("<tr>" +
            "<td><!-- 7 -->" + Lang("0 seconds - 30 seconds") + "</td>" +
            "<td>" + NumberFormat(aData.s0s30s, 0) + "</td>" +
            "<td>" + NumberFormat(SafeDivide(aData.s0s30s, iTotalFreq) * 100, 1) + "%</td>" +
            "</tr>\n");
    aHTML.push("<tr>" +
            "<td><!-- 6 -->" + Lang("30 seconds - 2 minutes") + "</td>" +
            "<td>" + NumberFormat(aData.s30s2mn, 0) + "</td>" +
            "<td>" + NumberFormat(SafeDivide(aData.s30s2mn, iTotalFreq) * 100, 1) + "%</td>" +
            "</tr>\n");
    aHTML.push("<tr>" +
            "<td><!-- 5 -->" + Lang("2 minutes - 5 minutes") + "</td>" +
            "<td>" + NumberFormat(aData.s2mn5mn, 0) + "</td>" +
            "<td>" + NumberFormat(SafeDivide(aData.s2mn5mn, iTotalFreq) * 100, 1) + "%</td>" +
            "</tr>\n");
    aHTML.push("<tr>" +
            "<td><!-- 4 -->" + Lang("5 minutes - 15 minutes") + "</td>" +
            "<td>" + NumberFormat(aData.s5mn15mn, 0) + "</td>" +
            "<td>" + NumberFormat(SafeDivide(aData.s5mn15mn, iTotalFreq) * 100, 1) + "%</td>" +
            "</tr>\n");
    aHTML.push("<tr>" +
            "<td><!-- 3 -->" + Lang("15 minutes - 30 minutes") + "</td>" +
            "<td>" + NumberFormat(aData.s15mn30mn, 0) + "</td>" +
            "<td>" + NumberFormat(SafeDivide(aData.s15mn30mn, iTotalFreq) * 100, 1) + "%</td>" +
            "</tr>\n");
    aHTML.push("<tr>" +
            "<td><!-- 2 -->" + Lang("30 minutes - 1 hour") + "</td>" +
            "<td>" + NumberFormat(aData.s30mn1h, 0) + "</td>" +
            "<td>" + NumberFormat(SafeDivide(aData.s30mn1h, iTotalFreq) * 100, 1) + "%</td>" +
            "</tr>\n");
    aHTML.push("<tr>" +
            "<td><!-- 1 -->" + Lang("More than 1 hour") + "</td>" +
            "<td>" + NumberFormat(aData.s1h, 0) + "</td>" +
            "<td>" + NumberFormat(SafeDivide(aData.s1h, iTotalFreq) * 100, 1) + "%</td>" +
            "</tr>\n");

    // output
    return ([true, (sHTML + aHTML.join("\n") + "</tbody></table>")]);
}

function DrawTable_Status() {
    var oStatus = aStatistics["status"][aParts.length + 1];
    // get values
    iTotalHits = oStatus.iTotalHits;
    iTotalBW = oStatus.iTotalBW;
    aData = oStatus.aData;

    // create header
    var sHTML = "<table class=\"tablesorter\" cellspacing=\"0\">\n" +
            "<thead><tr>" +
            "<th>" + Lang("Code") + "</th>" +
            "<th>" + Lang("Description") + "</th>" +
            "<th>" + Lang("Hits") + "</th>" +
            "<th>&nbsp;</th>" +
            "<th>" + Lang("Bandwidth") + "</th>" +
            "<th>&nbsp;</th>" +
            "<th class=\"noborder\">" + Lang("Average Size") + "</th>" +
            "</tr></thead>\n" +
            "<tbody>";

    // create table body
    aHTML = new Array();
    for (var iRow in aData) {
        aHTML.push("<tr>" +
                "<td>" + oStatus.aData[iRow].sCode + "</td>" +
                "<td>" + Lang(oStatus.aData[iRow].sDescription) + "</td>" +
                "<td class=\"right\">" + NumberFormat(oStatus.aData[iRow].iHits, 0) + "</td>" +
                "<td class=\"right\">" + ((oStatus.aData[iRow].iHits / iTotalHits) * 100).toFixed(1) + "%</td>" +
                "<td class=\"right\">" + DisplayBandwidth(oStatus.aData[iRow].iBW) + "</td>" +
                "<td class=\"right\">" + ((oStatus.aData[iRow].iBW / iTotalBW) * 100).toFixed(1) + "%</td>" +
                "<td class=\"noborder right\">" + DisplayBandwidth(oStatus.aData[iRow].iBW / oStatus.aData[iRow].iHits) + "</td>" +
                "</tr>\n");
    }

    // output
    if (aHTML.length > 0) {
        return ([true, (sHTML + aHTML.join("\n") + "</tbody></table>")]);
    } else {
        return ([false, (sHTML + "<tr><td class=\"center\" colspan=\"7\">" + Lang("There is no data to display") + "</td></tr></tbody></table>")]);
    }
}

function DrawTable_Status404() {
    var oStatus404 = aStatistics["status404"][aParts.length + 1];
    // get values
    iTotalHits = oStatus404.iTotalHits;
    aData = oStatus404.aData;

    // create header
    var sHTML = "<table class=\"tablesorter\" cellspacing=\"0\">\n" +
            "<thead><tr>" +
            "<th>" + Lang("URL") + "</th>" +
            "<th>" + Lang("Hits") + "</th>" +
            "<th>" + Lang("Referrer") + "</th>" +
            "</tr></thead>\n" +
            "<tbody>";

    // create table body
    aHTML = new Array();
    var sReferrer = "";
    for (var iRow in aData) {
        if (oStatus404.aData[iRow].sReferrer == "-") {
            sReferrer = "&nbsp;";
        } else {
            sReferrer = ("<a href=\"" + oStatus404.aData[iRow].sReferrer + "\" target=\"_blank\">" + oStatus404.aData[iRow].sReferrerVisible + "</a>");
        }
        aHTML.push("<tr>" +
                "<td>" + oStatus404.aData[iRow].sURL + "</td>" +
                "<td class=\"right\">" + NumberFormat(oStatus404.aData[iRow].iHits, 0) + "</td>" +
                "<td>" + sReferrer + "</td>" +
                "</tr>\n");
    }

    // output
    if (aHTML.length > 0) {
        return ([true, (sHTML + aHTML.join("\n") + "</tbody></table>")]);
    } else {
        return ([false, (sHTML + "<tr><td class=\"center\" colspan=\"3\">" + Lang("There is no data to display") + "</td></tr></tbody></table>")]);
    }
}


function DrawTable_ThisMonth() {
    var oThisMonth = aStatistics["thismonth"];
    var iTotalVisits = 0;
    var iTotalPages = 0;
    var iTotalHits = 0;
    var iTotalPages = 0;
    var iTotalBW = 0;
    var aData = null;

    for (iIndex in aParts)
        if (aParts[iIndex].active) {
            // get values
            iTotalVisits += oThisMonth[iIndex].iTotalVisits;
            iTotalPages += oThisMonth[iIndex].iTotalPages;
            iTotalHits += oThisMonth[iIndex].iTotalHits;
            iTotalBW += oThisMonth[iIndex].iTotalBW;
            if (aData == null)
                aData = oThisMonth[iIndex].aData;
        }


    // create header
    var sHTML = "<table class=\"tablesorter\" cellspacing=\"0\">\n" +
            "<thead><tr>" +
            "<th width=\"15%\">" + Lang("Day") + "</th>" +
            "<th width=\"14%\">" + Lang("Date") + "</th>" +
            "<th width=\"9%\">" + Lang("Visits") + "</th>" +
            "<th width=\"9%\" class=\"noborder\">" + Lang("Pages") + "</th>" +
            "<th width=\"11%\">" + Lang("per Visit") + "</th>" +
            "<th width=\"9%\" class=\"noborder\">" + Lang("Hits") + "</th>" +
            "<th width=\"11%\">" + Lang("per Visit") + "</th>" +
            "<th width=\"9%\" class=\"noborder\">" + Lang("BW") + "</th>" +
            "<th width=\"11%\" class=\"noborder\">" + Lang("per Visit") + "</th>" +
            "</tr></thead>\n" +
            "<tbody>";

    // create table body
    aHTML = new Array();
    for (var iRow in aData) {
        oRow = aData[iRow];
        sVisibleDate = (oRow.dtDate.getDate() + " " +
                Lang(gc_aMonthName[oRow.dtDate.getMonth()].substr(0, 3)) + " '" +
                oRow.dtDate.getFullYear().toString().substr(2));
        if (oRow.dtDate.getDay() == 5) {
            sRowStyle = " class=\"friday\"";
        } else if (oRow.dtDate.getDay() == 6) {
            sRowStyle = " class=\"saturday\"";
        } else {
            sRowStyle = "";
        }

        var iVisits = SumParts(oThisMonth, "iVisits", iRow);
        var iPages = SumParts(oThisMonth, "iPages", iRow);
        var iHits = SumParts(oThisMonth, "iHits", iRow);
        var iBW = SumParts(oThisMonth, "iBW", iRow);


        aHTML.push("<tr" + sRowStyle + ">" +
                "<td><span class=\"hidden\">" + oRow.dtDate.getDay() + "</span>" + Lang(gc_aDayName[oRow.dtDate.getDay()]) + "</td>" +
                "<td><span class=\"hidden\">" + oRow.dtDate.valueOf() + "</span>" + sVisibleDate + "</td>" +
                "<td class=\"right\">" + NumberFormat(iVisits, 0) + "</td>" +
                "<td class=\"right\">" + NumberFormat(iPages, 0) + "</td>" +
                "<td class=\"right\">" + NumberFormat((SafeDivide(iPages, iVisits)), 1) + "</td>" +
                "<td class=\"right\">" + NumberFormat(iHits, 0) + "</td>" +
                "<td class=\"right\">" + NumberFormat(SafeDivide(iHits, iVisits), 1) + "</td>" +
                "<td class=\"right\">" + DisplayBandwidth(iBW) + "</td>" +
                "<td class=\"noborder right\">" + DisplayBandwidth(SafeDivide(iBW, iVisits)) + "</td>" +
                "</tr>\n");
    }

    // output
    if (aHTML.length > 0) {
        sHTML = (sHTML + aHTML.join("\n") + "</tbody><tfoot><tr>" +
                "<td colspan=\"3\" class=\"noborder right\">" + NumberFormat(iTotalVisits, 0) + "</td>" +
                "<td class=\"noborder right\">" + NumberFormat(iTotalPages, 0) + "</td>" +
                "<td class=\"noborder right\">" + NumberFormat(SafeDivide(iTotalPages, iTotalVisits), 1) + "</td>" +
                "<td class=\"noborder right\">" + NumberFormat(iTotalHits) + "</td>" +
                "<td class=\"noborder right\">" + NumberFormat(SafeDivide(iTotalHits, iTotalVisits), 2) + "</td>" +
                "<td class=\"noborder right\">" + DisplayBandwidth(iTotalBW) + "</td>" +
                "<td class=\"noborder right\">" + DisplayBandwidth(SafeDivide(iTotalBW, iTotalVisits)) + "</td>" +
                "</tr></tfoot></table>")
        return ([true, sHTML]);
    } else {
        return ([false, (sHTML + "<tr><td class=\"center\" colspan=\"10\">" + Lang("There is no data to display") + "</td></tr></tbody></table>")]);
    }
}

function DrawTable_Time() {
    // get values
    var oTime = aStatistics["time"];

    var iTotalPages = 0;
    var iTotalHits = 0;
    var iTotalBW = 0;
    var iTotalNVPages = 0;
    var iTotalNVHits = 0;
    var iTotalNVBW = 0;

    for (iIndex in aParts)
        if ((aParts[iIndex].active) && (oTime[iIndex] != null)) {
            iTotalPages += oTime[iIndex].iTotalPages;
            iTotalHits += oTime[iIndex].iTotalHits;
            iTotalBW += oTime[iIndex].iTotalBW;
            iTotalNVPages += oTime[iIndex].iTotalNVPages;
            iTotalNVHits += oTime[iIndex].iTotalNVHits;
            iTotalNVBW += oTime[iIndex].iTotalNVBW;
        }

    // create header
    var sHTML = "<table class=\"tablesorter\" cellspacing=\"0\">\n" +
            "<thead><tr>" +
            "<th>" + Lang("Hour") + "</th>" +
            "<th class=\"noborder\">" + Lang("Pages") + "</th>" +
            "<th class=\"noborder right\">%</th>" +
            "<th class=\"right\">+/-</th>" +
            "<th class=\"noborder\">" + Lang("Hits") + "</th>" +
            "<th class=\"noborder right\">%</th>" +
            "<th class=\"right\">+/-</th>" +
            "<th class=\"noborder\">" + Lang("BW") + "</th>" +
            "<th class=\"noborder right\">%</th>" +
            "<th class=\"right\">+/-</th>" +
            "<th width=\"1\"><small>" + (Lang("Not Viewed")).replace(" ", "&nbsp;") + "</small><br />" + Lang("Pages") + "</th>" +
            "<th width=\"1\"><small>" + (Lang("Not Viewed")).replace(" ", "&nbsp;") + "</small><br />" + Lang("Hits") + "</th>" +
            "<th class=\"noborder\" width=\"1\"><small>" + (Lang("Not Viewed")).replace(" ", "&nbsp;") + "</small><br />" + Lang("BW") + "</th>" +
            "</tr></thead>\n" +
            "<tbody>";

    // create table body
    var aHTML = [];
    var iAvgPages = (iTotalPages / 24);
    var iAvgHits = (iTotalHits / 24);
    var iAvgBW = (iTotalBW / 24);
    for (var iRow in oTime[0].aData) {
        var oRow = oTime[0].aData[iRow];
        var sHour = oRow.iHour;
        if (oRow.iHour < 10) {
            sHour = ("0" + sHour)
        }

        var iPages = SumParts(oTime, "iPages", iRow);
        var iNVPages = SumParts(oTime, "iNVPages", iRow);
        var iHits = SumParts(oTime, "iHits", iRow);
        var iNVHits = SumParts(oTime, "iNVHits", iRow);
        var iBW = SumParts(oTime, "iBW", iRow);
        var iNVBW = SumParts(oTime, "iNVBW", iRow);

        // +/- values
        var sPagesDiff = Difference(iPages, iAvgPages);
        var sHitsDiff = Difference(iHits, iAvgHits);
        var sBWDiff = Difference(iBW, iAvgBW);

        // create table
        aHTML.push("<tr>" +
                "<td>" + sHour + "</td>" +
                "<td class=\"right\">" + NumberFormat(iPages, 0) + "</td>" +
                "<td class=\"right\">" + NumberFormat((SafeDivide(iPages, iTotalPages) * 100), 1) + "%</td>" +
                "<td class=\"right\">" + sPagesDiff + "</td>" +
                "<td class=\"right\">" + NumberFormat(iHits, 0) + "</td>" +
                "<td class=\"right\">" + NumberFormat((SafeDivide(iHits, iTotalHits) * 100), 1) + "%</td>" +
                "<td class=\"right\">" + sHitsDiff + "</td>" +
                "<td class=\"right\">" + DisplayBandwidth(iBW) + "</td>" +
                "<td class=\"right\">" + NumberFormat((SafeDivide(iBW, iTotalBW) * 100), 1) + "%</td>" +
                "<td class=\"right\">" + sBWDiff + "</td>" +
                "<td class=\"right\">" + NumberFormat(iNVPages, 0) + "</td>" +
                "<td class=\"right\">" + NumberFormat(iNVHits, 0) + "</td>" +
                "<td class=\"noborder right\">" + DisplayBandwidth(iNVBW) + "</td>" +
                "</tr>\n");
    }

    // output
    if (aHTML.length > 0) {
        sHTML = (sHTML + aHTML.join("\n") + "</tbody><tfoot><tr>" +
                "<td class=\"noborder\">&nbsp;</td>" +
                "<td class=\"noborder right\">" + NumberFormat(iTotalPages, 0) + "</td>" +
                "<td class=\"noborder\">&nbsp;</td>" +
                "<td class=\"noborder\">&nbsp;</td>" +
                "<td class=\"noborder right\">" + NumberFormat(iTotalHits, 0) + "</td>" +
                "<td class=\"noborder\">&nbsp;</td>" +
                "<td class=\"noborder\">&nbsp;</td>" +
                "<td class=\"noborder right\">" + DisplayBandwidth(iTotalBW) + "</td>" +
                "<td class=\"noborder\">&nbsp;</td>" +
                "<td class=\"noborder\">&nbsp;</td>" +
                "<td class=\"noborder right\">" + NumberFormat(iTotalNVPages, 0) + "</td>" +
                "<td class=\"noborder right\">" + NumberFormat(iTotalNVHits, 0) + "</td>" +
                "<td class=\"noborder right\">" + DisplayBandwidth(iTotalNVBW) + "</td>" +
                "</tr></tfoot></table>")
        return ([true, sHTML]);
    } else {
        return ([false, (sHTML + "<tr><td class=\"center\" colspan=\"4\">" + Lang("There is no data to display") + "</td></tr></tbody></table>")]);
    }

    function Difference(iValue, iAverage) {
        if (iValue == iAverage) {
            return "-";
        } else {
            if (iValue > iAverage) {
                return ("<span class=\"tiny positive\">+" + NumberFormat((SafeDivide((iValue - iAverage), iAverage) * 100), 1) + "%</span>");
            } else {
                return ("<span class=\"tiny negative\">-" + NumberFormat((SafeDivide((iAverage - iValue), iAverage) * 100), 1) + "%</span>");
            }
        }
    }
}

function Lang(sPhrase) {
    return (oTranslation[sPhrase] || sPhrase);
}

function Misc_ThisMonthCalendar(sHeadline, sSubMenu, sDataItem) {
    var oThisMonth = aStatistics["thismonth"];
    // create sum arrays
    var aWeek = [];
    var aDay = [];
    for (var iPart in oThisMonth) {
        if (aParts[iPart].active) {
            aDay[iPart] = [];
            for (var iIndex = 0; iIndex < 7; iIndex++) {
                aDay[iPart][iIndex] = {iCount: 0, iTotal: 0};
            }
        }
    }
    var iTotal = 0;

    // calculate dates
    var iFirstWeek = getWeekNr(oThisMonth[0].aData[0].dtDate);
    var dtLastDayOfMonth = new Date(oThisMonth[0].aData[0].dtDate.getFullYear(),
            (oThisMonth[0].aData[0].dtDate.getMonth() + 1),
            0);
    var iLastWeek = getWeekNr(dtLastDayOfMonth);

    // create table
    var sHTML = "<table class=\"calendar\"><tbody>" +
            "<tr>" +
            "<td class=\"labelTop\">&nbsp;</td>" +
            "<td class=\"labelTop\">" + Lang("Sunday") + "</td>" +
            "<td class=\"labelTop\">" + Lang("Monday") + "</td>" +
            "<td class=\"labelTop\">" + Lang("Tuesday") + "</td>" +
            "<td class=\"labelTop\">" + Lang("Wednesday") + "</td>" +
            "<td class=\"labelTop\">" + Lang("Thursday") + "</td>" +
            "<td class=\"labelTop\">" + Lang("Friday") + "</td>" +
            "<td class=\"labelTop\">" + Lang("Saturday") + "</td>" +
            "<td class=\"labelTopSpacer\">&nbsp;</td>" +
            "<td class=\"labelTop\">" + Lang("Week Total") + "</td>" +
            "<td class=\"labelTop\">" + Lang("Daily Average") + "</td>" +
            "</tr>";
    for (var iIndex = iFirstWeek; iIndex <= iLastWeek; iIndex++) {
        aWeek[iIndex] = {iCount: 0, iTotal: 0};
        sHTML += "<tr>" +
                "<td id=\"calWeek" + iIndex + "\" class=\"labelSide\">" + Lang("Week") + ":&nbsp;" + iIndex + "</td>" +
                "<td id=\"calDay0-" + iIndex + "\">&nbsp;</td>" +
                "<td id=\"calDay1-" + iIndex + "\">&nbsp;</td>" +
                "<td id=\"calDay2-" + iIndex + "\">&nbsp;</td>" +
                "<td id=\"calDay3-" + iIndex + "\">&nbsp;</td>" +
                "<td id=\"calDay4-" + iIndex + "\">&nbsp;</td>" +
                "<td id=\"calDay5-" + iIndex + "\">&nbsp;</td>" +
                "<td id=\"calDay6-" + iIndex + "\">&nbsp;</td>" +
                "<td>&nbsp;</td>" +
                "<td id=\"calTotWk" + iIndex + "\" class=\"calTotWk\">&nbsp;</td>" +
                "<td id=\"calAvgWk" + iIndex + "\" class=\"calAvgWk\">&nbsp;</td>" +
                "</tr>";
    }
    sHTML += "<tr>" +
            "<td>&nbsp;</td>" +
            "<td colspan=\"7\" class=\"calGraph\"><div id=\"graph\">&nbsp;</div></td>" +
            "<td colspan=\"3\">&nbsp;</td>" +
            "</tr><tr>" +
            "<td class=\"labelSide\">" + Lang("Day of Week Total") + "</td>" +
            "<td id=\"calTotDay0\" class=\"calTotDay\">&nbsp;</td>" +
            "<td id=\"calTotDay1\" class=\"calTotDay\">&nbsp;</td>" +
            "<td id=\"calTotDay2\" class=\"calTotDay\">&nbsp;</td>" +
            "<td id=\"calTotDay3\" class=\"calTotDay\">&nbsp;</td>" +
            "<td id=\"calTotDay4\" class=\"calTotDay\">&nbsp;</td>" +
            "<td id=\"calTotDay5\" class=\"calTotDay\">&nbsp;</td>" +
            "<td id=\"calTotDay6\" class=\"calTotDay\">&nbsp;</td>" +
            "<td>&nbsp;</td>" +
            "<td colspan=\"2\" id=\"calTotMonth\" class=\"calTotDay\">&nbsp;</td>" +
            "</tr><tr>" +
            "<td class=\"labelSide\">" + Lang("Day of Week Average") + "</td>" +
            "<td id=\"calAvgDay0\" class=\"calAvgDay\">&nbsp;</td>" +
            "<td id=\"calAvgDay1\" class=\"calAvgDay\">&nbsp;</td>" +
            "<td id=\"calAvgDay2\" class=\"calAvgDay\">&nbsp;</td>" +
            "<td id=\"calAvgDay3\" class=\"calAvgDay\">&nbsp;</td>" +
            "<td id=\"calAvgDay4\" class=\"calAvgDay\">&nbsp;</td>" +
            "<td id=\"calAvgDay5\" class=\"calAvgDay\">&nbsp;</td>" +
            "<td id=\"calAvgDay6\" class=\"calAvgDay\">&nbsp;</td>" +
            "<td>&nbsp;</td>" +
            "<td colspan=\"2\" id=\"calAvgMonth\" class=\"calAvgDay\">&nbsp;</td>" +
            "</tr>";
    sHTML += "</tbody></table>";

    // apply content
    $("#content").html("<h2>" + Lang(sHeadline) + "</h2>" +
            DrawSubMenu("thismonth", sSubMenu) +
            "<div class=\"tableFull\">" + sHTML + "</div>");

    // populate daily values
    for (var iRow in oThisMonth[0].aData) {
        iTotal = 0;
        for (iPart in oThisMonth) {
            if (aParts[iPart].active) {
                var oRow = oThisMonth[iPart].aData[iRow];
                var iWeekNumber = getWeekNr(oRow.dtDate);
                var iDayNumber = oRow.dtDate.getDay();

                // increment counters
                aWeek[iWeekNumber].iCount++;
                //var iSumParts = SumParts(oThisMonth, sDataItem, iRow);
                aWeek[iWeekNumber].iTotal += oRow[sDataItem];
                aDay[iPart][iDayNumber].iCount++;
                aDay[iPart][iDayNumber].iTotal += oRow[sDataItem];
                // aDay[iDayNumber].iTotal += iSumParts;
                iTotal += oRow[sDataItem];
            }
        }
        // modify table
        if (sDataItem == "iBW") {
            sHTML = ("<div class=\"date\">" + oRow.dtDate.getDate() + "</div><div class=\"value\">" + DisplayBandwidth(iTotal) + "</div>");
        } else {
            sHTML = ("<div class=\"date\">" + oRow.dtDate.getDate() + "</div><div class=\"value\">" + NumberFormat(iTotal, 0) + "</div>");
        }
        $("#calDay" + iDayNumber + "-" + iWeekNumber).html(sHTML).addClass("calDayPopulated");

    }


    // populate week totals
    for (var iIndex = iFirstWeek; iIndex <= iLastWeek; iIndex++) {
        if (aWeek[iIndex].iCount > 0) {
            if (sDataItem == "iBW") {
                $("#calTotWk" + iIndex).html("<div>" + DisplayBandwidth(aWeek[iIndex].iTotal) + "</div>");
                $("#calAvgWk" + iIndex).html("<div>" + DisplayBandwidth(aWeek[iIndex].iTotal / aWeek[iIndex].iCount) + "</div>");
            } else {
                $("#calTotWk" + iIndex).html("<div>" + NumberFormat(aWeek[iIndex].iTotal, 0) + "</div>");
                $("#calAvgWk" + iIndex).html("<div>" + NumberFormat((aWeek[iIndex].iTotal / aWeek[iIndex].iCount), 1) + "</div>");
            }
        }
    }
    var iMonthTotal = 0;
    var iMonthCount = 0;
    // populate day totals
    for (var iIndex = 0; iIndex < 7; iIndex++) {
        var iCount = 0;
        var iTotal = 0;
        for (iPart in oThisMonth) {
            if (aParts[iPart].active) {
                iCount += aDay[iPart][iIndex].iCount;
                iTotal += aDay[iPart][iIndex].iTotal;
            }
        }
        if (iCount > 0) {
            if (sDataItem == "iBW") {
                $("#calTotDay" + iIndex).html("<div>" + DisplayBandwidth(iTotal) + "</div>");
                $("#calAvgDay" + iIndex).html("<div>" + DisplayBandwidth(iTotal / iCount) + "</div>");
            } else {
                $("#calTotDay" + iIndex).html("<div>" + NumberFormat(iTotal, 0) + "</div>");
                $("#calAvgDay" + iIndex).html("<div>" + NumberFormat((iTotal / iCount), 1) + "</div>");
            }
        }
        iMonthCount += iCount;
        iMonthTotal += iTotal;
    }

    // fill in any remaining empty days
    var dtThisDate = new Date(oRow.dtDate.getFullYear(), oRow.dtDate.getMonth(), (oRow.dtDate.getDate() + 1));
    while (dtThisDate.getMonth() == dtLastDayOfMonth.getMonth()) {
        $("#calDay" + dtThisDate.getDay() + "-" + getWeekNr(dtThisDate)).html("<div class=\"date\">" + dtThisDate.getDate() + "</div>").addClass("calDay");
        dtThisDate.setDate(dtThisDate.getDate() + 1);
    }

    // populate month totals
    if (sDataItem == "iBW") {
        $("#calTotMonth").html("<div><span>" + Lang("Total") + ":</span> " + DisplayBandwidth(iMonthTotal) + "</div>");
        $("#calAvgMonth").html("<div><span>" + Lang("Average") + ":</span> " + DisplayBandwidth(iMonthTotal / /*oRow.dtDate.getDate()*/ iMonthCount) + "</div>");
    } else {
        $("#calTotMonth").html("<div><span>" + Lang("Total") + ":</span> " + NumberFormat(iMonthTotal, 0) + "</div>");
        $("#calAvgMonth").html("<div><span>" + Lang("Average") + ":</span> " + NumberFormat((iMonthTotal / iMonthCount /*oRow.dtDate.getDate()*/), 1) + "</div>");
    }

    // draw graph
    var aGraphItem = [Lang("Sunday"), Lang("Monday"), Lang("Tuesday"), Lang("Wednesday"), Lang("Thursday"), Lang("Friday"), Lang("Saturday")];

    var aGraphValue = [];
    for (iPart in oThisMonth)
        if (aParts[iPart].active)
            aGraphValue[iPart] = [SafeDivide(aDay[iPart][0].iTotal, aDay[iPart][0].iCount),
                SafeDivide(aDay[iPart][1].iTotal, aDay[iPart][1].iCount),
                SafeDivide(aDay[iPart][2].iTotal, aDay[iPart][2].iCount),
                SafeDivide(aDay[iPart][3].iTotal, aDay[iPart][3].iCount),
                SafeDivide(aDay[iPart][4].iTotal, aDay[iPart][4].iCount),
                SafeDivide(aDay[iPart][5].iTotal, aDay[iPart][5].iCount),
                SafeDivide(aDay[iPart][6].iTotal, aDay[iPart][6].iCount)];


    if (sDataItem == "iBW")
        for (iPart in aGraphValue)
            for (iIndex in aGraphValue[iPart])
                aGraphValue[iPart][iIndex] = SafeDivide(aGraphValue[iPart][iIndex], 1024 * 1024);


    $("#content").fadeIn(g_iFadeSpeed);
    DrawBar(["", "", "", "", "", "", ""], aGraphValue, aGraphItem);
}

function PageLayout_AllMonths(sPage) {
    var aTable = DrawTable_AllMonths(sPage);
    switch (sPage) {
        case "all":
            var sHTML = "<h2>" + Lang("Visitors each Month") + "</h2>" +
                    DrawSubMenu("allmonths", "Visitors each Month") +
                    "<div id=\"graph\" class=\"graph\">&nbsp;</div>";
            break;
        case "year":
            var sHTML = "<h2>" + Lang("Visitors each Year") + "</h2>" +
                    DrawSubMenu("allmonths", "Visitors each Year") +
                    "<div id=\"graph\" class=\"graph\">&nbsp;</div>";
            break;
    }
    sHTML += "<div class=\"tableFull\">" + aTable[1] + "</div>";
    $("#content").html(sHTML);
    $("#content").fadeIn(g_iFadeSpeed);
    if (aTable[0] == true) {
        $(".tablesorter").tablesorter({headers: {1: {sorter: "commaNumber"}, 2: {sorter: "commaNumber"}, 3: {sorter: "commaNumber"}, 5: {sorter: "commaNumber"}, 6: {sorter: "commaNumber"}, 7: {sorter: 'bandwidth'}}, sortList: [[0, 0]], textExtraction: function(node) {
                return node.innerHTML.replace(',', '');
            }, widgets: ['zebra']});
    }
    if (sPage == "all") {
        DrawGraph_AllMonths();
    } else {
        DrawGraph_EachYear();
    }
}

function PageLayout_Browser(sPage) {
    var aTable = DrawTable_Browser(sPage);
    switch (sPage) {
        case "family":
            var sHTML = "<h2>" + Lang("Browser Families") + "</h2>" +
                    DrawSubMenu("browser", "Browser Families") +
                    "<div id=\"pie\" class=\"pie\">&nbsp;</div><div class=\"tablePie\">" + aTable[1] + "</div>";
            break;
        case "all":
            var sHTML = "<h2>" + Lang("All Browsers") + "</h2>" +
                    DrawSubMenu("browser", "All Browsers") +
                    "<div id=\"pie\" class=\"pie\">&nbsp;</div><div class=\"tablePie\">" + aTable[1] + "</div>";
            break;
        default:
            var sHTML = "<h2>" + Lang("Browser Family") + ": " + gc_aBrowserFamilyCaption[sPage] + "</h2>" +
                    DrawSubMenu("browser", "") +
                    "<div id=\"pie\" class=\"pie\">&nbsp;</div><div class=\"tablePie\">" + aTable[1] + "</div>";
    }
    $("#content").html(sHTML);
    $("#content").fadeIn(g_iFadeSpeed);
    if (aTable[0] == true) {
        $(".tablesorter").tablesorter({headers: {0: {sorter: false}, 2: {sorter: "commaNumber"}, 3: {sorter: false}}, sortList: [[2, 1]], textExtraction: function(node) {
                return node.innerHTML.replace(',', '');
            }, widgets: ['zebra']});
    }
    DrawPie_Browser(sPage);
}

function PageLayout_Country(sPage) {
    switch (sPage) {
        case "all":
            var aTable = DrawTable_Country();
            var sHTML = "<h2>" + Lang("Visitors by Country") + "</h2>" +
                    DrawSubMenu("country", "Countries") +
                    "<div id=\"pie\" class=\"pie\">&nbsp;</div><div class=\"tablePie\">" +
                    aTable[1] +
                    "</div>";
            $("#content").html(sHTML);
            $("#content").fadeIn(g_iFadeSpeed);
            if (aTable[0] == true) {
                $(".tablesorter").tablesorter({headers: {0: {sorter: false}, 2: {sorter: "commaNumber"}, 3: {sorter: false}, 4: {sorter: "commaNumber"}, 5: {sorter: false}, 6: {sorter: 'bandwidth'}, 7: {sorter: false}}, sortList: [[2, 1]], textExtraction: function(node) {
                        return node.innerHTML.replace(',', '');
                    }, widgets: ['zebra']});
            }
            DrawPie_Country();
            break;
        case "continent":
            var sHTML = "<h2>" + Lang("Visitors by Continent") + "</h2>" +
                    DrawSubMenu("country", "Continents") +
                    "<div id=\"pie\" class=\"pie\">&nbsp;</div><div class=\"tablePie\">" +
                    DrawTable_CountryContinent() +
                    "</div>";
            $("#content").html(sHTML);
            $(".tablesorter").tablesorter({headers: {1: {sorter: "commaNumber"}, 2: {sorter: false}, 3: {sorter: "commaNumber"}, 4: {sorter: false}, 5: {sorter: 'bandwidth'}, 6: {sorter: false}}, sortList: [[1, 1]], textExtraction: function(node) {
                    return node.innerHTML.replace(',', '');
                }, widgets: ['zebra']});
            $("#content").fadeIn(g_iFadeSpeed);
            DrawPie_CountryContinent();
            break;
        default:
            if (sPage == "Other") {
                var sHTML = "<h2>" + Lang("Other Visitors") + "</h2>";
            } else {
                var sHTML = "<h2>" + Lang("Visitors from " + sPage) + "</h2>";
            }
            var aTable = DrawTable_Country(sPage);
            sHTML += DrawSubMenu("country", sPage) +
                    "<div id=\"pie\" class=\"pie\">&nbsp;</div><div class=\"tablePie\">" +
                    aTable[1] + "</div>";
            $("#content").html(sHTML);
            $("#content").fadeIn(g_iFadeSpeed);
            if (aTable[0] == true) {
                $(".tablesorter").tablesorter({headers: {0: {sorter: false}, 2: {sorter: "commaNumber"}, 3: {sorter: false}, 4: {sorter: "commaNumber"}, 5: {sorter: false}, 6: {sorter: 'bandwidth'}, 7: {sorter: false}}, sortList: [[2, 1]], textExtraction: function(node) {
                        return node.innerHTML.replace(',', '');
                    }, widgets: ['zebra']});
            }
            if (aTable[0] == true) {
                DrawPie_Country(sPage);
            }
            break;
    }
}

function GenSubMenu_City() {
    oCity = aStatistics["city"][aParts.length + 1];
    oSubMenu.city = {"Cities": "city.all"};
    for (var sCountryCode in oCity.oCountry) {
        if (sCountryCode != "unknown") {
            sCountryName = gc_aCountryName[sCountryCode];
            oSubMenu.city[sCountryName] = "city." + sCountryCode;
        }
    }
}


function PageLayout_City(sPage) {
    GenSubMenu_City();
    switch (sPage) {
        case "all":
            var aTable = DrawTable_City();
            var sHTML = "<h2>" + Lang("Visitors by City") + "</h2>" +
                    DrawSubMenu("city", "Cities") +
                    "<div id=\"pie\" class=\"pie\">&nbsp;</div><div class=\"tablePie\">" +
                    aTable[1] +
                    "</div>";
            $("#content").html(sHTML);
            $("#content").fadeIn(g_iFadeSpeed);
            if (aTable[0] == true) {
                $(".tablesorter").tablesorter({headers: {0: {sorter: false}, 2: {sorter: "commaNumber"}, 3: {sorter: false}, 4: {sorter: "commaNumber"}, 5: {sorter: false}, 6: {sorter: 'bandwidth'}, 7: {sorter: false}}, sortList: [[2, 1]], textExtraction: function(node) {
                        return node.innerHTML.replace(',', '');
                    }, widgets: ['zebra']});
            }
            DrawPie_City();
            break;
        default:
            if (sPage == "Other") {
                var sHTML = "<h2>" + Lang("Other Visitors") + "</h2>";
            } else {
                var sHTML = "<h2>" + Lang("Visitors from " + gc_aCountryName[sPage]) + "</h2>";
            }
            var aTable = DrawTable_City(sPage);
            sHTML += DrawSubMenu("city", gc_aCountryName[sPage]) +
                    "<div id=\"pie\" class=\"pie\">&nbsp;</div><div class=\"tablePie\">" +
                    aTable[1] + "</div>";
            $("#content").html(sHTML);
            $("#content").fadeIn(g_iFadeSpeed);
            if (aTable[0] == true) {
                $(".tablesorter").tablesorter({headers: {0: {sorter: false}, 2: {sorter: "commaNumber"}, 3: {sorter: false}, 4: {sorter: "commaNumber"}, 5: {sorter: false}, 6: {sorter: 'bandwidth'}, 7: {sorter: false}}, sortList: [[2, 1]], textExtraction: function(node) {
                        return node.innerHTML.replace(',', '');
                    }, widgets: ['zebra']});
            }
            DrawPie_City(sPage);
            break;
    }
}

function PageLayout_Org() {
    var aTable = DrawTable_Org();
    var sHTML = "<h2>" + Lang("Organizations") + "</h2><div id=\"pie\" class=\"pie\">&nbsp;</div><div class=\"tablePie\">" + aTable[1] + "</div>";
    $("#content").html(sHTML);
    $("#content").fadeIn(g_iFadeSpeed);
    if (aTable[0] == true) {
        $(".tablesorter").tablesorter({headers: {2: {sorter: "commaNumber"}, 3: {sorter: false}, 4: {sorter: 'bandwidth'}, 5: {sorter: false}, 6: {sorter: 'bandwidth'}}, sortList: [[2, 1]], textExtraction: function(node) {
                return node.innerHTML.replace(',', '');
            }, widgets: ['zebra']});
    }
    DrawPie_Org();
}

function PageLayout_Visitor() {
    var aTable = DrawTable_Visitor();
    var sHTML = "<h2>" + Lang("Visitors") + "</h2>" + DrawSubMenu("visitor", "Top 100") + "<div id=\"pie\" class=\"pie\">&nbsp;</div><div class=\"tablePie\">" + aTable[1] + "</div>";
    $("#content").html(sHTML);
    $("#content").fadeIn(g_iFadeSpeed);
    if (aTable[0] == true) {
        $(".tablesorter").tablesorter({headers: {2: {sorter: "commaNumber"}, 3: {sorter: false}, 4: {sorter: 'bandwidth'}, 5: {sorter: false}, 6: {sorter: 'bandwidth'}}, sortList: [[2, 1]], textExtraction: function(node) {
                return node.innerHTML.replace(',', '');
            }, widgets: ['zebra']});
    }
    DrawPie_Visitor();
}


function PageLayout_Filetypes() {
    var aTable = DrawTable_Filetypes();
    var sHTML = "<h2>" + Lang("Filetypes") + "</h2><div id=\"pie\" class=\"pie\">&nbsp;</div><div class=\"tablePie\">" + aTable[1] + "</div>";
    $("#content").html(sHTML);
    $("#content").fadeIn(g_iFadeSpeed);
    if (aTable[0] == true) {
        $(".tablesorter").tablesorter({headers: {2: {sorter: "commaNumber"}, 3: {sorter: false}, 4: {sorter: 'bandwidth'}, 5: {sorter: false}, 6: {sorter: 'bandwidth'}}, sortList: [[2, 1]], textExtraction: function(node) {
                return node.innerHTML.replace(',', '');
            }, widgets: ['zebra']});
    }
    DrawPie_Filetypes();
}

function PageLayout_OperatingSystems(sPage) {
    var aTable = DrawTable_OperatingSystems(sPage);
    switch (sPage) {
        case "family":
            var sHTML = "<h2>" + Lang("Operating System Families") + "</h2>" +
                    DrawSubMenu("os", "Operating System Families") +
                    "<div id=\"pie\" class=\"pie\">&nbsp;</div><div class=\"tablePie\">" + aTable[1] + "</div>";
            break;
        case "all":
            var sHTML = "<h2>" + Lang("Operating Systems") + "</h2>" +
                    DrawSubMenu("os", "All Operating Systems") +
                    "<div id=\"pie\" class=\"pie\">&nbsp;</div><div class=\"tablePie\">" + aTable[1] + "</div>";
            break;
        default:
            var sHTML = "<h2>" + Lang("Operating System Family") + ": " + gc_aOSFamilyCaption[sPage] + "</h2>" +
                    DrawSubMenu("os", "") +
                    "<div id=\"pie\" class=\"pie\">&nbsp;</div><div class=\"tablePie\">" + aTable[1] + "</div>";
    }
    $("#content").html(sHTML);
    $("#content").fadeIn(g_iFadeSpeed);
    if (aTable[0] == true) {
        $(".tablesorter").tablesorter({headers: {0: {sorter: false}, 2: {sorter: "commaNumber"}, 3: {sorter: false}, 4: {sorter: false}}, sortList: [[2, 1]], textExtraction: function(node) {
                return node.innerHTML.replace(',', '');
            }, widgets: ['zebra']});
    }
    DrawPie_OperatingSystems(sPage);
}

function PageLayout_PageRefs(sPage) {
    switch (sPage) {
        case "all":
            var aTable = DrawTable_PageRefs("all");
            var sHTML = "<h2>" + Lang("Referring Pages") + "</h2>" +
                    DrawSubMenu("pagerefs", "All Referrers") +
                    "<div id=\"pie\" class=\"pie\">&nbsp;</div><div class=\"tablePie\">" + aTable[1] + "</div>";
            break;
        case "domains":
            var aTable = DrawTable_PageRefs("domains");
            var sHTML = "<h2>" + Lang("Referring Domains") + "</h2>" +
                    DrawSubMenu("pagerefs", "Referring Domains") +
                    "<div id=\"pie\" class=\"pie\">&nbsp;</div><div class=\"tablePie\">" + aTable[1] + "</div>";
            break;
        case "top10":
            var aTable = DrawTable_PageRefs("top10");
            var sHTML = "<h2>" + Lang("Referring Pages") + "</h2>" +
                    DrawSubMenu("pagerefs", "Top 10 Referrers") +
                    "<div id=\"pie\" class=\"pie\">&nbsp;</div><div class=\"tablePie\">" + aTable[1] + "</div>";
            break;
        case "top50":
            var aTable = DrawTable_PageRefs("top50");
            var sHTML = "<h2>" + Lang("Referring Pages") + "</h2>" +
                    DrawSubMenu("pagerefs", "Top 50 Referrers") +
                    "<div id=\"pie\" class=\"pie\">&nbsp;</div><div class=\"tablePie\">" + aTable[1] + "</div>";
            break;
    }
    $("#content").html(sHTML);
    $("#content").fadeIn(g_iFadeSpeed);
    if (aTable[0] == true) {
        $(".tablesorter").tablesorter({headers: {1: {sorter: "commaNumber"}, 2: {sorter: false}, 3: {sorter: "commaNumber"}, 4: {sorter: false}}, sortList: [[1, 1]], textExtraction: function(node) {
                return node.innerHTML.replace(',', '');
            }, widgets: ['zebra']});
    }
    DrawPie_PageRefs(sPage);
}

function PageLayout_PageRefsSE() {
    var aTable = DrawTable_PageRefsSE();
    var sHTML = "<h2>" + Lang("Referring Search Engines") + "</h2>" +
            DrawSubMenu("pagerefs", "Search Engines") +
            "<div id=\"pie\" class=\"pie\">&nbsp;</div><div class=\"tablePie\">" + aTable[1] + "</div>";
    $("#content").html(sHTML);
    $("#content").fadeIn(g_iFadeSpeed);
    if (aTable[0] == true) {
        $(".tablesorter").tablesorter({headers: {0: {sorter: false}, 2: {sorter: "commaNumber"}, 3: {sorter: false}, 4: {sorter: "commaNumber"}, 5: {sorter: false}}, sortList: [[2, 1]], textExtraction: function(node) {
                return node.innerHTML.replace(',', '');
            }, widgets: ['zebra']});
    }
    DrawPie_PageRefsSE();
}

function PageLayout_Pages(sPage) {
    var oPages = aStatistics["pages"][aParts.length + 1];
    // select data
    switch (sPage) {
        case "topBW":
            var aData = oPages.aDataBW;
            var aSort = [3, 1];
            var sSubMenu = "Top Bandwidth";
            var iPieTotal = oPages.iTotalBW;
            var sPieItem = "iBW";
            break;
        case "topEntry":
            var aData = oPages.aDataEntry;
            var aSort = [5, 1];
            var sSubMenu = "Top Entry Pages";
            var iPieTotal = oPages.iTotalEntry;
            var sPieItem = "iEntry";
            break;
        case "topExit":
            var aData = oPages.aDataExit;
            var aSort = [7, 1];
            var sSubMenu = "Top Exit Pages";
            var iPieTotal = oPages.iTotalExit;
            var sPieItem = "iExit";
            break;
        case "topPages":
            var aData = oPages.aDataPages;
            var aSort = [1, 1];
            var sSubMenu = "Top Page Views";
            var iPieTotal = oPages.iTotalPages;
            var sPieItem = "iPages";
            break;
    }

    // create html
    var aTable = DrawTable_Pages(aData);
    var sHTML = "<h2>" + Lang("Page Views") + "</h2>" +
            DrawSubMenu("pages", sSubMenu) +
            "<div id=\"pie\" class=\"pie\">&nbsp;</div><div class=\"tablePie\">" + aTable[1] + "</div>";
    $("#content").html(sHTML);
    $("#content").fadeIn(g_iFadeSpeed);
    if (aTable[0] == true) {
        $(".tablesorter").tablesorter({headers: {2: {sorter: false}, 3: {sorter: 'bandwidth'}, 4: {sorter: false}, 6: {sorter: false}, 8: {sorter: false}}, sortList: [aSort], textExtraction: function(node) {
                return node.innerHTML.replace(',', '');
            }, widgets: ['zebra']});
    }
    DrawPie_Pages(aData, iPieTotal, sPieItem, oPages.bHaveTitles);
}

function PageLayout_Robots() {
    var aTable = DrawTable_Robots();
    var sHTML = "<h2>" + Lang("Visiting Spiders") + "</h2><div id=\"pie\" class=\"pie\">&nbsp;</div><div class=\"tablePie\">" + aTable[1] + "</div>";
    $("#content").html(sHTML);
    $("#content").fadeIn(g_iFadeSpeed);
    if (aTable[0] == true) {
        $(".tablesorter").tablesorter({headers: {1: {sorter: "commaNumber"}, 2: {sorter: false}, 3: {sorter: 'bandwidth'}, 4: {sorter: false}, 6: {sorter: "commaNumber"}, 7: {sorter: false}}, sortList: [[1, 1]], textExtraction: function(node) {
                return node.innerHTML.replace(',', '');
            }, widgets: ['zebra']});
    }
    DrawPie_Robots();
}

function PageLayout_Searches(sPage) {
    switch (sPage) {
        case "keyphrasecloud":
            var oKeyphrases = aStatistics["keyphrases"][aParts.length + 1][0];
            var sHTML = "<h2>" + Lang("Keyphrases Tag Cloud") + "</h2>" +
                    DrawSubMenu("searches", "Keyphrases Tag Cloud") +
                    "<div class=\"tagcloud\">" + TagCloud("sPhrase", oKeyphrases, 75) + "</div>";
            $("#content").html(sHTML);
            $("#content").fadeIn(g_iFadeSpeed);
            break;
        case "keyphrases":
            var sHTML = "<h2>" + Lang("Keyphrases") + "</h2>" +
                    DrawSubMenu("searches", "Keyphrases") +
                    "<div id=\"pie\" class=\"pie\">&nbsp;</div><div class=\"tablePie\">" + Paging_Keyphrases() + "</div>";
            $("#content").html(sHTML);
            $("#content").fadeIn(g_iFadeSpeed);
            DrawPie_Keyphrases();
            break;
        case "keywordcloud":
            var oKeywords = aStatistics["keywords"][aParts.length + 1][0];
            var sHTML = "<h2>" + Lang("Keywords Tag Cloud") + "</h2>" +
                    DrawSubMenu("searches", "Keywords Tag Cloud") +
                    "<div class=\"tagcloud\">" + TagCloud("sWord", oKeywords, 150) + "</div>";
            $("#content").html(sHTML);
            $("#content").fadeIn(g_iFadeSpeed);
            break;
        case "keywords":
            var sHTML = "<h2>" + Lang("Keywords") + "</h2>" +
                    DrawSubMenu("searches", "Keywords") +
                    "<div id=\"pie\" class=\"pie\">&nbsp;</div><div class=\"tablePie\">" + Paging_Keywords() + "</div>";
            $("#content").html(sHTML);
            $("#content").fadeIn(g_iFadeSpeed);
            DrawPie_Keywords();
            break;
    }
}

function PageLayout_Session() {
    var aTable = DrawTable_Session();
    var sHTML = "<h2>" + Lang("Session Duration") + "</h2><div id=\"pie\" class=\"pie\">&nbsp;</div><div class=\"tablePie\">" + aTable[1] + "</div>";
    $("#content").html(sHTML);
    if (aTable[0] == true) {
        //$(".tablesorter").tablesorter({ headers: { 0: { sorter: false }, 1:{sorter:"commaNumber"}, 2: { sorter: false } }, sortList: [[1,1]],textExtraction:function(node){return node.innerHTML.replace(',', '');}, widgets: ['zebra'] });
        $(".tablesorter").tablesorter({headers: {1: {sorter: "commaNumber"}, 2: {sorter: false}}, sortList: [[0, 1]], textExtraction: function(node) {
                return node.innerHTML.replace(',', '');
            }, widgets: ['zebra']});
    }
    $("#content").fadeIn(g_iFadeSpeed);
    DrawPie_Session();
}

function PageLayout_Status(sPage) {
    switch (sPage) {
        case "404":
            var aTable = DrawTable_Status404();
            var sHTML = "<h2>" + Lang("HTTP Status Codes") + ": 404s</h2>" +
                    DrawSubMenu("status", "File Not Found URLs") +
                    "<div id=\"pie\" class=\"pie\">&nbsp;</div><div class=\"tablePie\">" + aTable[1] + "</div>";
            $("#content").html(sHTML);
            if (aTable[0] == true) {
                $(".tablesorter").tablesorter({headers: {1: {sorter: "commaNumber"}}, sortList: [[1, 1]], textExtraction: function(node) {
                        return node.innerHTML.replace(',', '');
                    }, widgets: ['zebra']});
            }
            $("#content").fadeIn(g_iFadeSpeed);
            DrawPie_Status404(sPage);
            break;
        default:
            var aTable = DrawTable_Status();
            var sHTML = "<h2>" + Lang("HTTP Status Codes") + "</h2>" +
                    DrawSubMenu("status", "Status Codes") +
                    "<div id=\"pie\" class=\"pie\">&nbsp;</div><div class=\"tablePie\">" + aTable[1] + "</div>";
            $("#content").html(sHTML);
            if (aTable[0] == true) {
                $(".tablesorter").tablesorter({headers: {2: {sorter: "commaNumber"}, 3: {sorter: false}, 4: {sorter: "bandwidth"}, 5: {sorter: false}}, sortList: [[2, 1]], textExtraction: function(node) {
                        return node.innerHTML.replace(',', '');
                    }, widgets: ['zebra']});
            }
            $("#content").fadeIn(g_iFadeSpeed);
            DrawPie_Status(sPage);
    }
}

function PageLayout_ThisMonth(sPage) {
    switch (sPage) {
        case "all":
            var aTable = DrawTable_ThisMonth();
            var sHTML = "<h2>" + Lang("Visitors this Month") + "</h2>" +
                    DrawSubMenu("thismonth", "Overview") +
                    "<div id=\"graph\" class=\"graph\">&nbsp;</div><div class=\"tableFull\">" + aTable[1] + "</div>";
            $("#content").html(sHTML);
            $("#content").fadeIn(g_iFadeSpeed);

            if (aTable[0] == true) {
                $(".tablesorter").tablesorter({headers: {2: {sorter: "commaNumber"}, 3: {sorter: "commaNumber"}, 5: {sorter: "commaNumber"}, 7: {sorter: "bandwidth"}, 8: {sorter: "bandwidth"}}, sortList: [[1, 0]], textExtraction: function(node) {
                        return node.innerHTML.replace(',', '');
                    }, widgets: ['zebra']});
            }
            DrawGraph_ThisMonth();
            break;
        case "bandwidth":
            Misc_ThisMonthCalendar("Calendar of Bandwidth Usage this Month", "Calendar of Bandwidth Usage", "iBW");
            break;
        case "hits":
            Misc_ThisMonthCalendar("Calendar of Hits this Month", "Calendar of Hits", "iHits");
            break;
        case "pages":
            Misc_ThisMonthCalendar("Calendar of Page Views this Month", "Calendar of Page Views", "iPages");
            break;
        case "visits":
            Misc_ThisMonthCalendar("Calendar of Visitors this Month", "Calendar of Visitors", "iVisits");
            break;
    }
}

function PageLayout_Time(sPage) {
    var aTable = DrawTable_Time(sPage);
    var sHTML = "<h2>" + Lang("Visitors over 24 Hours") + "</h2>" +
            "<div id=\"graph\" class=\"graph\">&nbsp;</div>" +
            "<div class=\"tableFull\">" + aTable[1] + "</div>";
    $("#content").html(sHTML);
    $("#content").fadeIn(g_iFadeSpeed);
    if (aTable[0] == true) {
        $(".tablesorter").tablesorter({headers: {1: {sorter: "commaNumber"}, 2: {sorter: false}, 3: {sorter: false}, 4: {sorter: "commaNumber"}, 5: {sorter: false}, 6: {sorter: false}, 7: {sorter: 'bandwidth'}, 8: {sorter: false}, 9: {sorter: false}, 10: {sorter: "commaNumber"}, 11: {sorter: "commaNumber"}, 12: {sorter: 'bandwidth'}}, sortList: [[0, 0]], textExtraction: function(node) {
                return node.innerHTML.replace(',', '');
            }, widgets: ['zebra']});
    }
    DrawGraph_Time();
}

function PagingInputNumber(oEvent, oInput, sType) {
    var iCode = (oEvent.charCode || oEvent.keyCode);
    if (iCode == 13) {
        var iValue = parseFloat($(oInput).val());
        if (isNaN(iValue) == true) {
            return false;
        }
        if (iValue < 1) {
            return false;
        }
        if (iValue != Math.round(iValue)) {
            return false;
        }
        switch (sType) {
            case "keyphrases":
                if (iValue > (Math.floor((oStatistics.oKeyphrases.aData.length - 1) / oPaging.oKeyphrases.iRowsPerPage) + 1)) {
                    return false;
                }
                RedrawTable_Keyphrases("iCurrPage", (iValue - 1));
                break;
            case "keywords":
                if (iValue > (Math.floor((oStatistics.oKeywords.aData.length - 1) / oPaging.oKeywords.iRowsPerPage) + 1)) {
                    return false;
                }
                RedrawTable_Keywords("iCurrPage", (iValue - 1));
                break;
        }
    }
    if ((iCode == 8) || (iCode == 9) || ((iCode > 34) && (iCode < 38)) || (iCode == 39) || (iCode == 46) || ((iCode > 47) && (iCode < 58))) {
        return true;
    } else {
        return false;
    }
}

function Paging_Keyphrases() {
    var oKeyphrases = aStatistics["keyphrases"][aParts.length + 1][0];
    var oKeyphrasesAlphabetical = aStatistics["keyphrases"][aParts.length + 1][1];
    // get values
    iTotalFreq = oKeyphrases.iTotalFreq;
    switch (oPaging.oKeyphrases.sSort) {
        case "freqASC":
            var sKeyphraseClass = "";
            var sFrequencyClass = " headerSortDown";
            var sKeyphraseSort = "wordDESC";
            var sFrequencySort = "freqDESC";
            var aData = oKeyphrases.aData;
            var iDisplayOrder = -1;
            break;
        case "freqDESC":
            var sKeyphraseClass = "";
            var sFrequencyClass = " headerSortUp";
            var sKeyphraseSort = "wordDESC";
            var sFrequencySort = "freqASC";
            var aData = oKeyphrases.aData;
            var iDisplayOrder = 1;
            break;
        case "wordASC":
            var sKeyphraseClass = " headerSortDown";
            var sFrequencyClass = "";
            var sKeyphraseSort = "wordDESC";
            var sFrequencySort = "freqDESC";
            var aData = oKeyphrasesAlphabetical.aData;
            var iDisplayOrder = -1;
            break;
        case "wordDESC":
            var sKeyphraseClass = " headerSortUp";
            var sFrequencyClass = "";
            var sKeyphraseSort = "wordASC";
            var sFrequencySort = "freqDESC";
            var aData = oKeyphrasesAlphabetical.aData;
            var iDisplayOrder = 1;
            break;
    }

    // create header
    var sDesc = (Lang("Showing [START] to [END] of [TOTAL] keyphrases")).replace("[TOTAL]", aData.length);
    var sHTML = "<table class=\"tablesorter\" cellspacing=\"0\">\n" +
            "<thead><tr>" +
            "<th class=\"header" + sKeyphraseClass + "\" onclick=\"RedrawTable_Keyphrases('sSort', '" + sKeyphraseSort + "')\" width=\"80%\">" + Lang("Keyphrase") + "</th>" +
            "<th class=\"header" + sFrequencyClass + "\" onclick=\"RedrawTable_Keyphrases('sSort', '" + sFrequencySort + "')\" width=\"10%\">" + Lang("Frequency") + "</th>" +
            "<th class=\"noborder\" width=\"10%\">&nbsp;</th>" +
            "</tr></thead>\n" +
            "<tbody>";

    // create table body
    aHTML = new Array();
    if (iDisplayOrder == 1) {
        var iStart = (oPaging.oKeyphrases.iCurrPage * oPaging.oKeyphrases.iRowsPerPage);
        var iEnd = (iStart + oPaging.oKeyphrases.iRowsPerPage);
        if (iEnd > aData.length) {
            iEnd = aData.length;
        }
        sDesc = sDesc.replace("[START]", iStart + 1).replace("[END]", iEnd);
        for (var i = iStart; i < iEnd; i++) {
            aHTML.push(((i % 2 == 0) ? "<tr>" : "<tr class=\"odd\">") +
                    "<td>" + aData[i].sPhrase + "</td>" +
                    "<td class=\"right\">" + NumberFormat(aData[i].iFreq, 0) + "</td>" +
                    "<td class=\"noborder right\">" + ((aData[i].iFreq / iTotalFreq) * 100).toFixed(1) + "%</td>" +
                    "</tr>\n");
        }
    } else {
        if (aData.length > 0) {
            var iStart = (aData.length - 1) - (oPaging.oKeyphrases.iCurrPage * oPaging.oKeyphrases.iRowsPerPage);
            var iEnd = (iStart - oPaging.oKeyphrases.iRowsPerPage);
            if (iEnd < -1) {
                iEnd = -1;
            }
            sDesc = sDesc.replace("[START]", iStart + 1).replace("[END]", iEnd + 2);
            for (var i = iStart; i > iEnd; i--) {
                aHTML.push(((i % 2 == 0) ? "<tr>" : "<tr class=\"odd\">") +
                        "<td>" + aData[i].sPhrase + "</td>" +
                        "<td class=\"right\">" + NumberFormat(aData[i].iFreq, 0) + "</td>" +
                        "<td class=\"noborder right\">" + ((aData[i].iFreq / iTotalFreq) * 100).toFixed(1) + "%</td>" +
                        "</tr>\n");
            }
        }
    }

    // output
    if (aHTML.length > 0) {
        var iMaxPage = Math.floor((aData.length - 1) / oPaging.oKeyphrases.iRowsPerPage);
        var sNavigation = "<div id=\"paging\"><span>" + sDesc + "</span>";
        if (oPaging.oKeyphrases.iCurrPage > 0) {
            sNavigation += "<img src=\"themes/" + sThemeDir + "/paging/first.gif\" onmouseover=\"this.src='themes/" + sThemeDir + "/paging/first_on.gif'\" onmouseout=\"this.src='themes/" + sThemeDir + "/paging/first.gif'\" style=\"cursor: pointer;\" onclick=\"RedrawTable_Keyphrases('iCurrPage', 0)\" />" +
                    "<img src=\"themes/" + sThemeDir + "/paging/prev.gif\" onmouseover=\"this.src='themes/" + sThemeDir + "/paging/prev_on.gif'\" onmouseout=\"this.src='themes/" + sThemeDir + "/paging/prev.gif'\" style=\"cursor: pointer;\" onclick=\"RedrawTable_Keyphrases('iCurrPage', " + (oPaging.oKeyphrases.iCurrPage - 1) + ")\" />";
        } else {
            sNavigation += "<img src=\"themes/" + sThemeDir + "/paging/first_off.gif\" />" +
                    "<img src=\"themes/" + sThemeDir + "/paging/prev_off.gif\" />";
        }
        sNavigation += "<span><input type=\"text\" value=\"" + (oPaging.oKeyphrases.iCurrPage + 1) + "\" onkeypress=\"return PagingInputNumber(event, this, 'keyphrases');\" />" + " / " + (iMaxPage + 1) + "</span>";
        if (oPaging.oKeyphrases.iCurrPage < iMaxPage) {
            sNavigation += "<img src=\"themes/" + sThemeDir + "/paging/next.gif\" onmouseover=\"this.src='themes/" + sThemeDir + "/paging/next_on.gif'\" onmouseout=\"this.src='themes/" + sThemeDir + "/paging/next.gif'\" style=\"cursor: pointer;\" onclick=\"RedrawTable_Keyphrases('iCurrPage', " + (oPaging.oKeyphrases.iCurrPage + 1) + ")\" />" +
                    "<img src=\"themes/" + sThemeDir + "/paging/last.gif\" onmouseover=\"this.src='themes/" + sThemeDir + "/paging/last_on.gif'\" onmouseout=\"this.src='themes/" + sThemeDir + "/paging/last.gif'\" style=\"cursor: pointer;\" onclick=\"RedrawTable_Keyphrases('iCurrPage', " + iMaxPage + ")\" />";
        } else {
            sNavigation += "<img src=\"themes/" + sThemeDir + "/paging/next_off.gif\" />" +
                    "<img src=\"themes/" + sThemeDir + "/paging/last_off.gif\" />";
        }
        sNavigation += "</div>";
        return (sHTML + aHTML.join("\n") + "</tbody></table>" + sNavigation);
    } else {
        return (sHTML + "<tr><td class=\"center\" colspan=\"3\">" + Lang("There is no data to display") + "</td></tr></tbody></table>");
    }
}

function Paging_Keywords() {
    var oKeywords = aStatistics["keywords"][aParts.length + 1][0];
    var oKeywordsAlphabetical = aStatistics["keywords"][aParts.length + 1][1];
    // get values
    iTotalFreq = oKeywords.iTotalFreq;
    switch (oPaging.oKeywords.sSort) {
        case "freqASC":
            var sKeywordClass = "";
            var sFrequencyClass = " headerSortDown";
            var sKeywordSort = "wordDESC";
            var sFrequencySort = "freqDESC";
            var aData = oKeywords.aData;
            var iDisplayOrder = -1;
            break;
        case "freqDESC":
            var sKeywordClass = "";
            var sFrequencyClass = " headerSortUp";
            var sKeywordSort = "wordDESC";
            var sFrequencySort = "freqASC";
            var aData = oKeywords.aData;
            var iDisplayOrder = 1;
            break;
        case "wordASC":
            var sKeywordClass = " headerSortDown";
            var sFrequencyClass = "";
            var sKeywordSort = "wordDESC";
            var sFrequencySort = "freqDESC";
            var aData = oKeywordsAlphabetical.aData;
            var iDisplayOrder = -1;
            break;
        case "wordDESC":
            var sKeywordClass = " headerSortUp";
            var sFrequencyClass = "";
            var sKeywordSort = "wordASC";
            var sFrequencySort = "freqDESC";
            var aData = oKeywordsAlphabetical.aData;
            var iDisplayOrder = 1;
            break;
    }

    // create header
    var sDesc = (Lang("Showing [START] to [END] of [TOTAL] keywords")).replace("[TOTAL]", aData.length);
    var sHTML = "<table class=\"tablesorter\" cellspacing=\"0\">\n" +
            "<thead><tr>" +
            "<th class=\"header" + sKeywordClass + "\" onclick=\"RedrawTable_Keywords('sSort', '" + sKeywordSort + "')\" width=\"80%\">" + Lang("Keyword") + "</th>" +
            "<th class=\"header" + sFrequencyClass + "\" onclick=\"RedrawTable_Keywords('sSort', '" + sFrequencySort + "')\" width=\"10%\">" + Lang("Frequency") + "</th>" +
            "<th class=\"noborder\" width=\"10%\">&nbsp;</th>" +
            "</tr></thead>\n" +
            "<tbody>";

    // create table body
    aHTML = new Array();
    if (iDisplayOrder == 1) {
        var iStart = (oPaging.oKeywords.iCurrPage * oPaging.oKeywords.iRowsPerPage);
        var iEnd = (iStart + oPaging.oKeywords.iRowsPerPage);
        if (iEnd > aData.length) {
            iEnd = aData.length;
        }
        sDesc = sDesc.replace("[START]", iStart + 1).replace("[END]", iEnd);
        for (var i = iStart; i < iEnd; i++) {
            aHTML.push(((i % 2 == 0) ? "<tr>" : "<tr class=\"odd\">") +
                    "<td>" + aData[i].sWord + "</td>" +
                    "<td class=\"right\">" + NumberFormat(aData[i].iFreq, 0) + "</td>" +
                    "<td class=\"noborder right\">" + ((aData[i].iFreq / iTotalFreq) * 100).toFixed(1) + "%</td>" +
                    "</tr>\n");
        }
    } else {
        if (aData.length > 0) {
            var iStart = (aData.length - 1) - (oPaging.oKeywords.iCurrPage * oPaging.oKeywords.iRowsPerPage);
            var iEnd = (iStart - oPaging.oKeywords.iRowsPerPage);
            if (iEnd < -1) {
                iEnd = -1;
            }
            sDesc = sDesc.replace("[START]", iStart + 1).replace("[END]", iEnd + 2);
            for (var i = iStart; i > iEnd; i--) {
                aHTML.push(((i % 2 == 0) ? "<tr>" : "<tr class=\"odd\">") +
                        "<td>" + aData[i].sWord + "</td>" +
                        "<td class=\"right\">" + NumberFormat(aData[i].iFreq, 0) + "</td>" +
                        "<td class=\"noborder right\">" + ((aData[i].iFreq / iTotalFreq) * 100).toFixed(1) + "%</td>" +
                        "</tr>\n");
            }
        }
    }

    // output
    if (aHTML.length > 0) {
        var iMaxPage = Math.floor((aData.length - 1) / oPaging.oKeywords.iRowsPerPage);
        var sNavigation = "<div id=\"paging\"><span>" + sDesc + "</span>";
        if (oPaging.oKeywords.iCurrPage > 0) {
            sNavigation += "<img src=\"themes/" + sThemeDir + "/paging/first.gif\" onmouseover=\"this.src='themes/" + sThemeDir + "/paging/first_on.gif'\" onmouseout=\"this.src='themes/" + sThemeDir + "/paging/first.gif'\" style=\"cursor: pointer;\" onclick=\"RedrawTable_Keywords('iCurrPage', 0)\" />" +
                    "<img src=\"themes/" + sThemeDir + "/paging/prev.gif\" onmouseover=\"this.src='themes/" + sThemeDir + "/paging/prev_on.gif'\" onmouseout=\"this.src='themes/" + sThemeDir + "/paging/prev.gif'\" style=\"cursor: pointer;\" onclick=\"RedrawTable_Keywords('iCurrPage', " + (oPaging.oKeywords.iCurrPage - 1) + ")\" />";
        } else {
            sNavigation += "<img src=\"themes/" + sThemeDir + "/paging/first_off.gif\" />" +
                    "<img src=\"themes/" + sThemeDir + "/paging/prev_off.gif\" />";
        }
        sNavigation += "<span><input type=\"text\" value=\"" + (oPaging.oKeywords.iCurrPage + 1) + "\" onkeypress=\"return PagingInputNumber(event, this, 'keywords');\" />" + " / " + (iMaxPage + 1) + "</span>";
        if (oPaging.oKeywords.iCurrPage < iMaxPage) {
            sNavigation += "<img src=\"themes/" + sThemeDir + "/paging/next.gif\" onmouseover=\"this.src='themes/" + sThemeDir + "/paging/next_on.gif'\" onmouseout=\"this.src='themes/" + sThemeDir + "/paging/next.gif'\" style=\"cursor: pointer;\" onclick=\"RedrawTable_Keywords('iCurrPage', " + (oPaging.oKeywords.iCurrPage + 1) + ")\" />" +
                    "<img src=\"themes/" + sThemeDir + "/paging/last.gif\" onmouseover=\"this.src='themes/" + sThemeDir + "/paging/last_on.gif'\" onmouseout=\"this.src='themes/" + sThemeDir + "/paging/last.gif'\" style=\"cursor: pointer;\" onclick=\"RedrawTable_Keywords('iCurrPage', " + iMaxPage + ")\" />";
        } else {
            sNavigation += "<img src=\"themes/" + sThemeDir + "/paging/next_off.gif\" />" +
                    "<img src=\"themes/" + sThemeDir + "/paging/last_off.gif\" />";
        }
        sNavigation += "</div>";
        return (sHTML + aHTML.join("\n") + "</tbody></table>" + sNavigation);
    } else {
        return (sHTML + "<tr><td class=\"center\" colspan=\"3\">" + Lang("There is no data to display") + "</td></tr></tbody></table>");
    }
}

function PopulateData_AllMonths(sPage) {
    $("#loading").show();
    aStatistics[sPage.split(".")[0]] = [];
    GetPart_AllMonths(sPage, aParts[0]);
}

function AddPart_AllMonths(oData, sPage) {
    iCount = aStatistics[sPage.split(".")[0]].push(oData);
    if (iCount < aParts.length) {
        GetPart_AllMonths(sPage, aParts[iCount]);
    } else {
        $("#loading").hide();
        DrawPage(sPage);
    }
}

function GetPart_AllMonths(sPage, oPart) {
    // create data objects
    var oAM = {"aData": [], "aYearDayCount": []};

    $.ajax({
        type: "GET",
        url: XMLURL("ALLMONTHS", oPart.name),
        success: function(oXML) {
            CheckLastUpdate(oXML);

            var aTemp = [];
            var iCurrentYear = 0;
            if ($(oXML).find('month').length > 0) {
                $(oXML).find('month').each(function() {
                    dtTemp = new Date(parseInt($(this).attr("year")), (parseInt($(this).attr("month")) - 1), 1);

                    // days in month
                    iDaysInMonth = parseFloat($(this).attr("daysinmonth"));

                    // push items onto array
                    aTemp.push({"dtDate": new Date(dtTemp.getFullYear(), dtTemp.getMonth(), 1),
                        "iMonth": $(this).attr("month"),
                        "iYear": $(this).attr("year"),
                        "iDaysInMonth": iDaysInMonth,
                        "iVisits": parseInt($(this).attr("visits")),
                        "iUniques": parseInt($(this).attr("uniques")),
                        "iPages": parseInt($(this).attr("pages")),
                        "iHits": parseInt($(this).attr("hits")),
                        "iBW": parseInt($(this).attr("bw")),
                        "iDaysInMonth" : iDaysInMonth
                    });

                    // count days in year
                    if (iCurrentYear != dtTemp.getFullYear()) {
                        iCurrentYear = dtTemp.getFullYear();
                        oAM.aYearDayCount[iCurrentYear] = iDaysInMonth;
                    } else {
                        oAM.aYearDayCount[iCurrentYear] += iDaysInMonth;
                    }
                });

                // apply data
                oAM.aData = aTemp;
                AddPart_AllMonths(oAM, sPage);
            } else
                AddPart_AllMonths(null, sPage);
        }
    });
}


function PopulateData_Browser(sPage) {
    $("#loading").show();
    aStatistics[sPage.split(".")[0]] = [];
    GetPart_Browser(sPage, aParts[0]);
}

function AddPart_Browser(oData, sPage) {
    iCount = aStatistics[sPage.split(".")[0]].push(oData);
    if (iCount < aParts.length) {
        GetPart_Browser(sPage, aParts[iCount]);
    } else {
        $("#loading").hide();
        DrawPage(sPage);
    }
}

function GetPart_Browser(sPage, oPart)
{
    // create data objects
    var oB = {"iTotalHits": 0, "aData": [], "aFamily": []};

    // pre-populate browser families  (Deep Copy)
    // oB.aFamily = eval(gc_aBrowserFamily.toSource());
    oB.aFamily = $.evalJSON($.toJSON(gc_aBrowserFamily));

    // do ajax call
    $.ajax({
        type: "GET",
        url: XMLURL("BROWSER", oPart.name),
        success: function(oXML) {
            CheckLastUpdate(oXML);

            $(oXML).find('item').each(function() {
                var sBrowser = $(this).attr("id");
                var iHits = parseInt($(this).attr("hits"));

                // find family browser belongs to
                var bFamilyFound = false;
                var sFamily = "";
                for (var iRow in oB.aFamily) {
                    if (sBrowser.substr(0, oB.aFamily[iRow].sBrowser.length) == oB.aFamily[iRow].sBrowser) {
                        // change name
                        sBrowser = sBrowser.substr(oB.aFamily[iRow].sBrowser.length);
                        sBrowser = (gc_aBrowserFamilyCaption[oB.aFamily[iRow].sBrowser] + " " + sBrowser);

                        // add totals
                        oB.aFamily[iRow].iHits += iHits;
                        sFamily = oB.aFamily[iRow].sBrowser;
                        bFamilyFound = true;
                        break;
                    }
                }
                if (bFamilyFound != true) {
                    oB.aFamily[oB.aFamily.length - 1].iHits += iHits;
                    sFamily = "Other Browsers";
                }

                // increment totals
                oB.iTotalHits += iHits;

                // populate array
                oB.aData.push({"sBrowser": sBrowser,
                    "iHits": iHits,
                    "sFamily": sFamily});
            });

            // apply data
            oB.aData.sort(Sort_Hits);
            oB.aFamily.sort(Sort_Hits);
            AddPart_Browser(oB, sPage);
        }
    });
}

function MergeParts_Browser()
{
    // merge helper
    function mergePart(oSum, oPart)
    {
        // merge total hits
        oSum.iTotalHits += oPart.iTotalHits;
        // merge data
        for (iRow in oPart.aData) {
            var found = false;
            for (jRow in oSum.aData)
                if (oPart.aData[iRow].sBrowser == oSum.aData[jRow].sBrowser) {
                    oSum.aData[jRow].iHits += oPart.aData[iRow].iHits;
                    found = true;
                    break;
                }
            if (!found)
                oSum.aData.push(oPart.aData[iRow]);
        }

        // merge family
        for (iRow in oPart.aFamily) {
            var found = false;
            for (jRow in oSum.aFamily)
                if (oPart.aFamily[iRow].sBrowser == oSum.aFamily[jRow].sBrowser) {
                    oSum.aFamily[jRow].iHits += oPart.aFamily[iRow].iHits;
                    found = true;
                    break;
                }
            if (!found)
                oSum.aFamily.push(oPart.aFamily[iRow]);
        }
    }


    var foundFirst = false;
    var oBrowser = aStatistics["browser"];
    for (iIndex in aParts)
        if (aParts[iIndex].active)
            if (!foundFirst) { // use first active part as base
                // deep copy
                oBrowser[aParts.length + 1] = $.evalJSON($.toJSON(oBrowser[iIndex]));
                foundFirst = true;
            } else
                mergePart(oBrowser[aParts.length + 1], oBrowser[iIndex]);
    // Sort
    oBrowser[aParts.length + 1].aData.sort(Sort_Hits);
    oBrowser[aParts.length + 1].aFamily.sort(Sort_Hits);
}


function PopulateData_City(sPage) {
    $("#loading").show();
    aStatistics[sPage.split(".")[0]] = [];
    GetPart_City(sPage, aParts[0]);
}

function AddPart_City(oData, sPage) {
    iCount = aStatistics[sPage.split(".")[0]].push(oData);
    if (iCount < aParts.length) {
        GetPart_City(sPage, aParts[iCount]);
    } else {
        $("#loading").hide();
        DrawPage(sPage);
    }
}

function GetPart_City(sPage, oPart) {
    // create data objects
    var oC = {"bPopulated": false, "iTotalPages": 0, "iTotalHits": 0, "iTotalBW": 0, "aData": []};
    oC.oCountry = {};

    $.ajax({
        type: "GET",
        url: XMLURL("PLUGIN_geoip_city_maxmind", oPart.name),
        success: function(oXML) {
            CheckLastUpdate(oXML);

            $(oXML).find('item').each(function() {
                // collect values
                var sCityCode = $(this).attr("id");
                var aSplit = sCityCode.split("_", 2);
                var sCountryCode = aSplit[0];
                var sCityName = aSplit[1];
                var iPages = parseInt($(this).attr("pages"));
                var iHits = parseInt($(this).attr("hits"));
                var iBW = parseInt($(this).attr("bw"));


                // increment totals
                oC.iTotalPages += iPages;
                oC.iTotalHits += iHits;
                oC.iTotalBW += iBW;
                if ((oC.oCountry[sCountryCode] == null)) {
                    oC.oCountry[sCountryCode] = {"iTotalPages": 0, "iTotalHits": 0, "iTotalBW": 0};
                }

                if (oC.oCountry[sCountryCode] != null) {
                    oC.oCountry[sCountryCode].iTotalPages += iPages;
                    oC.oCountry[sCountryCode].iTotalHits += iHits;
                    oC.oCountry[sCountryCode].iTotalBW += iBW;
                }

                // populate array
                oC.aData.push({"sCityCode": sCityCode,
                    "sCityName": sCityName,
                    "sCountry": sCountryCode,
                    "iPages": iPages,
                    "iHits": iHits,
                    "iBW": iBW});
            });

            // apply data
            oC.aData.sort(Sort_Hits);
            AddPart_City(oC, sPage);
        }
    });
}

function MergeParts_City() {
    // merge helper
    function mergePart(oSum, oPart) {
        function mergeCountry(oSum, oPart) {
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

        for (var idx in oSum.oCountry)
            mergeCountry(oSum.oCountry[idx], oPart.oCountry[idx]);
    }


    var foundFirst = false;
    var oCity = aStatistics["city"];
    for (iIndex in aParts)
        if (aParts[iIndex].active)
            if (!foundFirst) { // use first active part as base
                // deep copy
                oCity[aParts.length + 1] = $.evalJSON($.toJSON(oCity[iIndex]));
                foundFirst = true;
            } else
                mergePart(oCity[aParts.length + 1], oCity[iIndex]);
    // Sort
    oCity[aParts.length + 1].aData.sort(Sort_Pages);
}

function PopulateData_Org(sPage) {
    $("#loading").show();
    aStatistics[sPage.split(".")[0]] = [];
    GetPart_Org(sPage, aParts[0]);
}

function AddPart_Org(oData, sPage) {
    iCount = aStatistics[sPage.split(".")[0]].push(oData);
    if (iCount < aParts.length) {
        GetPart_Org(sPage, aParts[iCount]);
    } else {
        $("#loading").hide();
        DrawPage(sPage);
    }
}

function GetPart_Org(sPage, oPart) {

    // create data objects
    var oC = {"bPopulated": false, "iTotalPages": 0, "iTotalHits": 0, "iTotalBW": 0, "aData": []};

    $.ajax({
        type: "GET",
        url: XMLURL("PLUGIN_geoip_org_maxmind", oPart.name),
        success: function(oXML) {
            CheckLastUpdate(oXML);

            $(oXML).find('item').each(function() {
                // collect values
                var sOrgCode = $(this).attr("id");
                var aSplit = sOrgCode.split("_", 2);
                var sASN = aSplit[0];
                var sOrgName = aSplit[1];
                var iPages = parseInt($(this).attr("pages"));
                var iHits = parseInt($(this).attr("hits"));
                var iBW = parseInt($(this).attr("bw"));


                // increment totals
                oC.iTotalPages += iPages;
                oC.iTotalHits += iHits;
                oC.iTotalBW += iBW;

                // populate array
                oC.aData.push({"sOrgCode": sASN,
                    "sOrgName": sOrgName,
                    "iPages": iPages,
                    "iHits": iHits,
                    "iBW": iBW});
            });

            // apply data
            oC.aData.sort(Sort_Pages);
            AddPart_Org(oC, sPage);
        }
    });
}

function MergeParts_Org()
{
    // merge helper
    function mergePart(oSum, oPart)
    {
        // merge total hits
        oSum.iTotalPages += oPart.iTotalPages;
        oSum.iTotalHits += oPart.iTotalHits;
        oSum.iTotalBW += oPart.iTotalBW;
        // merge data
        for (iRow in oPart.aData) {
            var found = false;
            for (jRow in oSum.aData)
                if (oPart.aData[iRow].sOrgCode == oSum.aData[jRow].sOrgCode) {
                    oSum.aData[jRow].iPages += oPart.aData[iRow].iPages;
                    oSum.aData[jRow].iHits += oPart.aData[iRow].iHits;
                    oSum.aData[jRow].iBW += oPart.aData[iRow].iBW;
                    found = true;
                    break;
                }
            if (!found)
                oSum.aData.push(oPart.aData[iRow]);
        }
    }


    var foundFirst = false;
    var oOrg = aStatistics["org"];
    for (iIndex in aParts)
        if (aParts[iIndex].active)
            if (!foundFirst) { // use first active part as base
                // deep copy
                oOrg[aParts.length + 1] = $.evalJSON($.toJSON(oOrg[iIndex]));
                foundFirst = true;
            } else
                mergePart(oOrg[aParts.length + 1], oOrg[iIndex]);
    // Sort
    oOrg[aParts.length + 1].aData.sort(Sort_Pages);
}



function PopulateData_Visitor(sPage) {
    $("#loading").show();
    aStatistics[sPage.split(".")[0]] = [];
    GetPart_Visitor(sPage, aParts[0]);
}

function AddPart_Visitor(oData, sPage) {
    iCount = aStatistics[sPage.split(".")[0]].push(oData);
    if (iCount < aParts.length) {
        GetPart_Visitor(sPage, aParts[iCount]);
    } else {
        $("#loading").hide();
        DrawPage(sPage);
    }
}


function GetPart_Visitor(sPage, oPart) {

    // create data objects
    var oC = {"bPopulated": false, "iTotalPages": 0, "iTotalHits": 0, "iTotalBW": 0, "aData": []};

    $.ajax({
        type: "GET",
        url: XMLURL("VISITOR", oPart.name),
        success: function(oXML) {
            CheckLastUpdate(oXML);

            $(oXML).find('item').each(function() {
                // collect values
                var sAddress = $(this).attr("address");
                var iPages = parseInt($(this).attr("pages"));
                var iHits = parseInt($(this).attr("hits"));
                var iBW = parseInt($(this).attr("bw"));
                var sDesc = $(this).attr("desc");


                // increment totals
                oC.iTotalPages += iPages;
                oC.iTotalHits += iHits;
                oC.iTotalBW += iBW;

                // populate array
                oC.aData.push({"sAddress": sAddress,
                    "iPages": iPages,
                    "iHits": iHits,
                    "iBW": iBW,
                    "sDesc": sDesc});
            });

            // apply data
            oC.aData.sort(Sort_Pages);
            AddPart_Visitor(oC, sPage);
        }
    });
}

function MergeParts_Visitor()
{
    // merge helper
    function mergePart(oSum, oPart)
    {
        // merge total hits
        oSum.iTotalPages += oPart.iTotalPages;
        oSum.iTotalHits += oPart.iTotalHits;
        oSum.iTotalBW += oPart.iTotalBW;
        // merge data
        for (iRow in oPart.aData) {
            var found = false;
            for (jRow in oSum.aData)
                if (oPart.aData[iRow].sAddress == oSum.aData[jRow].sAddress) {
                    oSum.aData[jRow].iPages += oPart.aData[iRow].iPages;
                    oSum.aData[jRow].iHits += oPart.aData[iRow].iHits;
                    oSum.aData[jRow].iBW += oPart.aData[iRow].iBW;
                    found = true;
                    break;
                }
            if (!found)
                oSum.aData.push(oPart.aData[iRow]);
        }
    }


    var foundFirst = false;
    var oVisitor = aStatistics["visitor"];
    for (iIndex in aParts)
        if (aParts[iIndex].active)
            if (!foundFirst) { // use first active part as base
                // deep copy
                oVisitor[aParts.length + 1] = $.evalJSON($.toJSON(oVisitor[iIndex]));
                foundFirst = true;
            } else
                mergePart(oVisitor[aParts.length + 1], oVisitor[iIndex]);
    // Sort
    oVisitor[aParts.length + 1].aData.sort(Sort_Pages);
}


function PopulateData_Filetypes(sPage) {
    $("#loading").show();
    aStatistics[sPage.split(".")[0]] = [];
    GetPart_Filetypes(sPage, aParts[0]);
}


function AddPart_Filetypes(oData, sPage) {
    iCount = aStatistics[sPage.split(".")[0]].push(oData);
    if (iCount < aParts.length) {
        GetPart_Filetypes(sPage, aParts[iCount]);
    } else {
        $("#loading").hide();
        DrawPage(sPage);
    }
}


function GetPart_Filetypes(sPage, oPart) {

    // create data objects
    var oF = {"iTotalHits": 0, "iTotalBW": 0, "iTotalNonCompBW": 0, "iTotalCompBW": 0, "aData": []};

    $.ajax({
        type: "GET",
        url: XMLURL("FILETYPES", oPart.name),
        success: function(oXML) {
            CheckLastUpdate(oXML);

            $(oXML).find('item').each(function() {
                // collect values
                var sFiletype = $(this).attr("id");
                var sDescription = gc_aFiletypeDesc[sFiletype];
                if (typeof gc_aFiletypeDesc[sFiletype] == "undefined") {
                    sDescription = "&nbsp;";
                }
                if (sFiletype == "Unknown") {
                    sFiletype = "&nbsp;";
                    sDescription = "Unknown";
                }
                var iHits = parseInt($(this).attr("hits"));
                var iBW = parseInt($(this).attr("bw"));
                var iNonCompBW = parseInt($(this).attr("noncompressedbw"));
                var iCompBW = parseInt($(this).attr("compressedbw"));

                // increment totals
                oF.iTotalHits += iHits;
                oF.iTotalBW += iBW;
                oF.iTotalNonCompBW += iNonCompBW;
                oF.iTotalCompBW += iCompBW;

                // populate array
                oF.aData.push({"sFiletype": sFiletype,
                    "sDescription": sDescription,
                    "iHits": iHits,
                    "iBW": iBW,
                    "iNonCompBW": iNonCompBW,
                    "iCompBW": iCompBW});
            });

            // apply data
            oF.aData.sort(Sort_Hits);
            AddPart_Filetypes(oF, sPage);
        }
    });
}


function MergeParts_Filetypes()
{
    // merge helper
    function mergePart(oSum, oPart)
    {
        // merge total hits
        oSum.iTotalPages += oPart.iTotalPages;
        oSum.iTotalHits += oPart.iTotalHits;
        oSum.iTotalBW += oPart.iTotalBW;
        // merge data
        for (iRow in oPart.aData) {
            var found = false;
            for (jRow in oSum.aData)
                if (oPart.aData[iRow].sFiletype == oSum.aData[jRow].sFiletype) {
                    oSum.aData[jRow].iPages += oPart.aData[iRow].iPages;
                    oSum.aData[jRow].iHits += oPart.aData[iRow].iHits;
                    oSum.aData[jRow].iBW += oPart.aData[iRow].iBW;
                    found = true;
                    break;
                }
            if (!found)
                oSum.aData.push(oPart.aData[iRow]);
        }
    }


    var foundFirst = false;
    var oFiletype = aStatistics["filetypes"];
    for (iIndex in aParts)
        if (aParts[iIndex].active)
            if (!foundFirst) { // use first active part as base
                // deep copy
                oFiletype[aParts.length + 1] = $.evalJSON($.toJSON(oFiletype[iIndex]));
                foundFirst = true;
            } else
                mergePart(oFiletype[aParts.length + 1], oFiletype[iIndex]);
    // Sort
    oFiletype[aParts.length + 1].aData.sort(Sort_Hits);
}


function PopulateData_Keyphrases(sPage) {
    $("#loading").show();
    aStatistics["keyphrases"] = [];
    GetPart_Keyphrases(sPage, aParts[0]);
}

function AddPart_Keyphrases(oData, sPage)
{
    iCount = aStatistics["keyphrases"].push(oData);
    if (iCount < aParts.length) {
        GetPart_Keyphrases(sPage, aParts[iCount]);
    } else {
        $("#loading").hide();
        DrawPage(sPage);
    }
}


function GetPart_Keyphrases(sPage, oPart) {

    // create data objects
    var oKP = {iMaxFreq: 0, iTotalFreq: 0, aData: []};
    var oKPAlpha = {aData: []};

    $.ajax({
        type: "GET",
        url: XMLURL("SEARCHWORDS", oPart.name),
        success: function(oXML) {
            CheckLastUpdate(oXML);

            $(oXML).find('item').each(function() {
                // collect values
                var sPhrase = $(this).attr("phrase").split("+").join(" ").split("%").join("%&#8203;");
                var iFreq = parseInt($(this).attr("freq"));

                // increment totals
                oKP.iTotalFreq += iFreq;
                if (iFreq > oKP.iMaxFreq) {
                    oKP.iMaxFreq = iFreq;
                }
                // populate array
                oKP.aData.push({"sPhrase": sPhrase,
                    "iFreq": iFreq});
                oKPAlpha.aData.push({sWord: sPhrase,
                    iFreq: iFreq});
            });

            // apply data
            oKP.aData.sort(Sort_Freq);
            oKPAlpha.aData.sort(Sort_Phrase);

            AddPart_Keyphrases([oKP, oKPAlpha], sPage);

            //      oStatistics.oKeyphrases = oKP;
            //      oStatistics.oKeyphrasesAlphabetical = oKPAlpha;
        }
    });
}


function MergeParts_Keyphrases()
{
    // merge helper
    function mergePart(oSum, oPart)
    {
        oSum[0].iTotalFreq += oPart[0].iTotalFreq;
        if (oSum[0].iMaxFreq < oPart[0].iMaxFreq)
            oSum[0].iMaxFreq = oPart[0].iMaxFreq;
        // merge data (Keyphrase)
        for (iRow in oPart[0].aData) {
            var found = false;
            for (jRow in oSum[0].aData)
                if (oPart[0].aData[iRow].sPhrase == oSum[0].aData[jRow].sPhrase) {
                    oSum[0].aData[jRow].iFreq += oPart[0].aData[iRow].iFreq;
                    found = true;
                    break;
                }
            if (!found)
                oSum[0].aData.push(oPart[0].aData[iRow]);
        }

        // merge data (Keyphrase Alpha)
        for (iRow in oPart[1].aData) {
            var found = false;
            for (jRow in oSum[1].aData)
                if (oPart[1].aData[iRow].sPhrase == oSum[1].aData[jRow].sPhrase) {
                    oSum[1].aData[jRow].iFreq += oPart[1].aData[iRow].iBW;
                    found = true;
                    break;
                }
            if (!found)
                oSum[1].aData.push(oPart[1].aData[iRow]);
        }
    }


    var foundFirst = false;
    var oKeyphrases = aStatistics["keyphrases"];
    for (iIndex in aParts)
        if (aParts[iIndex].active)
            if (!foundFirst) { // use first active part as base
                // deep copy
                oKeyphrases[aParts.length + 1] = $.evalJSON($.toJSON(oKeyphrases[iIndex]));
                foundFirst = true;
            } else
                mergePart(oKeyphrases[aParts.length + 1], oKeyphrases[iIndex]);
}


function PopulateData_Keywords(sPage) {
    $("#loading").show();
    aStatistics["keywords"] = [];
    GetPart_Keywords(sPage, aParts[0]);
}

function AddPart_Keywords(oData, sPage)
{
    iCount = aStatistics["keywords"].push(oData);
    if (iCount < aParts.length) {
        GetPart_Keywords(sPage, aParts[iCount]);
    } else {
        $("#loading").hide();
        DrawPage(sPage);
    }
}


function GetPart_Keywords(sPage, oPart) {

    // create data objects
    var oKW = {iMaxFreq: 0, iTotalFreq: 0, aData: []};
    var oKWAlpha = {aData: []};

    $.ajax({
        type: "GET",
        url: XMLURL("KEYWORDS", oPart.name),
        success: function(oXML) {
            CheckLastUpdate(oXML);

            $(oXML).find('item').each(function() {
                // collect values
                var sWord = $(this).attr("word").split("%").join("%&#8203;");
                var iFreq = parseInt($(this).attr("freq"));

                // increment totals
                oKW.iTotalFreq += iFreq;
                if (iFreq > oKW.iMaxFreq) {
                    oKW.iMaxFreq = iFreq;
                }

                // populate array
                oKW.aData.push({sWord: sWord,
                    iFreq: iFreq});
                oKWAlpha.aData.push({sWord: sWord,
                    iFreq: iFreq});
            });

            // apply data
            oKW.aData.sort(Sort_Freq);
            oKWAlpha.aData.sort(Sort_Word);
            AddPart_Keywords([oKW, oKWAlpha], sPage);
        }
    });
}

function MergeParts_Keywords()
{
    // merge helper
    function mergePart(oSum, oPart)
    {
        oSum[0].iTotalFreq += oPart[0].iTotalFreq;
        if (oSum[0].iMaxFreq < oPart[0].iMaxFreq)
            oSum[0].iMaxFreq = oPart[0].iMaxFreq;
        // merge data (Keyphrase)
        for (iRow in oPart[0].aData) {
            var found = false;
            for (jRow in oSum[0].aData)
                if (oPart[0].aData[iRow].sWord == oSum[0].aData[jRow].sWord) {
                    oSum[0].aData[jRow].iFreq += oPart[0].aData[iRow].iFreq;
                    found = true;
                    break;
                }
            if (!found)
                oSum[0].aData.push(oPart[0].aData[iRow]);
        }

        // merge data (Keyphrase Alpha)
        for (iRow in oPart[1].aData) {
            var found = false;
            for (jRow in oSum[1].aData)
                if (oPart[1].aData[iRow].sPhrase == oSum[1].aData[jRow].sPhrase) {
                    oSum[1].aData[jRow].iFreq += oPart[1].aData[iRow].iBW;
                    found = true;
                    break;
                }
            if (!found)
                oSum[1].aData.push(oPart[1].aData[iRow]);
        }
    }


    var foundFirst = false;
    var oKeywords = aStatistics["keywords"];
    for (iIndex in aParts)
        if (aParts[iIndex].active)
            if (!foundFirst) { // use first active part as base
                // deep copy
                oKeywords[aParts.length + 1] = $.evalJSON($.toJSON(oKeywords[iIndex]));
                foundFirst = true;
            } else
                mergePart(oKeywords[aParts.length + 1], oKeywords[iIndex]);
}




function PopulateData_OperatingSystems(sPage) {
    $("#loading").show();
    aStatistics[sPage.split(".")[0]] = [];
    GetPart_OperatingSystems(sPage, aParts[0]);
}

function AddPart_OperatingSystems(oData, sPage)
{
    iCount = aStatistics[sPage.split(".")[0]].push(oData);
    if (iCount < aParts.length) {
        GetPart_OperatingSystems(sPage, aParts[iCount]);
    } else {
        $("#loading").hide();
        DrawPage(sPage);
    }
}

function GetPart_OperatingSystems(sPage, oPart)
{
    // create data objects
    var oOS = {"iTotalHits": 0, "aData": [], "aFamily": []};

    // pre-populate browser families (Deep Copy)
    oOS.aFamily = $.evalJSON($.toJSON(gc_aOSFamily));

    // do ajax call
    $.ajax({
        type: "GET",
        url: XMLURL("OS", oPart.name),
        success: function(oXML) {
            CheckLastUpdate(oXML);

            $(oXML).find('item').each(function() {
                var sOperatingSystem = $(this).attr("id");
                var iHits = parseInt($(this).attr("hits"));

                // find family OS belongs to
                var bFamilyFound = false;
                var sFamily = "";
                for (var iRow in oOS.aFamily) {
                    if (sOperatingSystem.substr(0, oOS.aFamily[iRow].sOperatingSystem.length) == oOS.aFamily[iRow].sOperatingSystem) {
                        // change name
                        sOperatingSystem = sOperatingSystem.substr(oOS.aFamily[iRow].sOperatingSystem.length);
                        switch (oOS.aFamily[iRow].sOperatingSystem) {
                            case "mac":
                                sOperatingSystem = (sOperatingSystem.substr(0, 1).toUpperCase() + sOperatingSystem.substr(1));
                                switch (sOperatingSystem) {
                                    case "Intosh":
                                        sOperatingSystem = "Macintosh";
                                        break;
                                    case "Osx":
                                        sOperatingSystem = "OSX";
                                        break;
                                }
                                break;
                            case "sun":
                            case "win":
                                sOperatingSystem = sOperatingSystem.toUpperCase();
                                break;
                            default:
                                sOperatingSystem = (sOperatingSystem.substr(0, 1).toUpperCase() + sOperatingSystem.substr(1));
                        }
                        sOperatingSystem = (gc_aOSFamilyCaption[oOS.aFamily[iRow].sOperatingSystem] + " " + sOperatingSystem);

                        // add totals
                        oOS.aFamily[iRow].iHits += iHits;
                        sFamily = oOS.aFamily[iRow].sOperatingSystem;
                        bFamilyFound = true;
                        break;
                    }
                }
                if (bFamilyFound != true) {
                    oOS.aFamily[oOS.aFamily.length - 1].iHits += iHits;
                    sFamily = "Other OS";
                }

                // increment totals
                oOS.iTotalHits += iHits;

                // populate array
                oOS.aData.push({"sOperatingSystem": sOperatingSystem,
                    "iHits": iHits,
                    "sFamily": sFamily});
            });

            // apply data
            oOS.aData.sort(Sort_Hits);
            oOS.aFamily.sort(Sort_Hits);
            AddPart_OperatingSystems(oOS, sPage);
        }
    });
}

function MergeParts_OperatingSystems()
{
    // merge helper
    function mergePart(oSum, oPart)
    {
        // merge total hits
        oSum.iTotalHits += oPart.iTotalHits;
        // merge data
        for (iRow in oPart.aData) {
            var found = false;
            for (jRow in oSum.aData)
                if (oPart.aData[iRow].sOperatingSystem == oSum.aData[jRow].sOperatingSystem) {
                    oSum.aData[jRow].iHits += oPart.aData[iRow].iHits;
                    found = true;
                    break;
                }
            if (!found)
                oSum.aData.push(oPart.aData[iRow]);
        }

        // merge family
        for (iRow in oPart.aFamily) {
            var found = false;
            for (jRow in oSum.aFamily)
                if (oPart.aFamily[iRow].sOperatingSystem == oSum.aFamily[jRow].sOperatingSystem) {
                    oSum.aFamily[jRow].iHits += oPart.aFamily[iRow].iHits;
                    found = true;
                    break;
                }
            if (!found)
                oSum.aFamily.push(oPart.aFamily[iRow]);
        }
    }


    var foundFirst = false;
    var oOS = aStatistics["os"];
    for (iIndex in aParts)
        if (aParts[iIndex].active)
            if (!foundFirst) { // use first active part as base
                // deep copy
                oOS[aParts.length + 1] = $.evalJSON($.toJSON(oOS[iIndex]));
                foundFirst = true;
            } else
                mergePart(oOS[aParts.length + 1], oOS[iIndex]);
    // Sort
    oOS[aParts.length + 1].aData.sort(Sort_Hits);
    oOS[aParts.length + 1].aFamily.sort(Sort_Hits);
}

function PopulateData_PageRefs(sPage) {
    $("#loading").show();
    aStatistics[sPage.split(".")[0]] = [];
    GetPart_PageRefs(sPage, aParts[0]);
}

function AddPart_PageRefs(oData, sPage) {
    iCount = aStatistics[sPage.split(".")[0]].push(oData);
    if (iCount < aParts.length) {
        GetPart_PageRefs(sPage, aParts[iCount]);
    } else {
        $("#loading").hide();
        DrawPage(sPage);
    }
}


function GetPart_PageRefs(sPage, oPart) {

    // create data objects
    var oPR = {"iTotalPages": 0, "iTotalHits": 0, "aData": [], "aDataDomain": []};

    $.ajax({
        type: "GET",
        url: XMLURL("PAGEREFS", oPart.name),
        success: function(oXML) {
            CheckLastUpdate(oXML);

            $(oXML).find('item').each(function() {
                // collect values
                var sReferrer = $(this).attr("url");
                var iPages = parseInt($(this).attr("pages"));
                var iHits = parseInt($(this).attr("hits"));

                // increment totals
                oPR.iTotalPages += iPages;
                oPR.iTotalHits += iHits;

                // populate array
                oPR.aData.push({"sURL": sReferrer,
                    "sVisibleURL": (sReferrer.length > 100 ? sReferrer.substring(0, 100) + "..." : sReferrer).split("/").join("&#8203;/").split("-").join("-&#8203;").split("_").join("_&#8203;"),
                    "iPages": iPages,
                    "iHits": iHits});

                // populate domain array
                var aTemp = sReferrer.split("/");
                var sDomain = (aTemp[0] + "//" + aTemp[2]);
                var sVisibleDomain = aTemp[2].replace(/^www./, "");
                $bExists = false;
                for (var iRow in oPR.aDataDomain) {
                    if (oPR.aDataDomain[iRow].sVisibleURL == sVisibleDomain) {
                        oPR.aDataDomain[iRow].iPages += iPages;
                        oPR.aDataDomain[iRow].iHits += iHits;
                        $bExists = true;
                        break
                    }
                }
                if ($bExists != true) {
                    oPR.aDataDomain.push({"sURL": sDomain,
                        "sVisibleURL": aTemp[2].replace(/^www./, ""),
                        "iPages": iPages,
                        "iHits": iHits});
                }
            });

            // apply data
            oPR.aData.sort(Sort_Pages);
            AddPart_PageRefs(oPR, sPage);
        }
    });
}


function MergeParts_PageRefs()
{
    // merge helper
    function mergePart(oSum, oPart)
    {
        // merge total hits
        oSum.iTotalPages += oPart.iTotalPages;
        oSum.iTotalHits += oPart.iTotalHits;
        oSum.iTotalBW += oPart.iTotalBW;
        // merge data
        for (iRow in oPart.aData) {
            var found = false;
            for (jRow in oSum.aData)
                if (oPart.aData[iRow].sURL == oSum.aData[jRow].sURL) {
                    oSum.aData[jRow].iPages += oPart.aData[iRow].iPages;
                    oSum.aData[jRow].iHits += oPart.aData[iRow].iHits;
                    oSum.aData[jRow].iBW += oPart.aData[iRow].iBW;
                    found = true;
                    break;
                }
            if (!found)
                oSum.aData.push(oPart.aData[iRow]);
        }

        // merge data domains
        for (iRow in oPart.aDataDomain) {
            var found = false;
            for (jRow in oSum.aDataDomain)
                if (oPart.aDataDomain[iRow].sURL == oSum.aDataDomain[jRow].sURL) {
                    oSum.aDataDomain[jRow].iPages += oPart.aDataDomain[iRow].iPages;
                    oSum.aDataDomain[jRow].iHits += oPart.aDataDomain[iRow].iHits;
                    oSum.aDataDomain[jRow].iBW += oPart.aDataDomain[iRow].iBW;
                    found = true;
                    break;
                }
            if (!found)
                oSum.aDataDomain.push(oPart.aDataDomain[iRow]);
        }
    }


    var foundFirst = false;
    var oPageRefs = aStatistics["pagerefs"];
    for (iIndex in aParts)
        if (aParts[iIndex].active)
            if (!foundFirst) { // use first active part as base
                // deep copy
                oPageRefs[aParts.length + 1] = $.evalJSON($.toJSON(oPageRefs[iIndex]));
                foundFirst = true;
            } else
                mergePart(oPageRefs[aParts.length + 1], oPageRefs[iIndex]);
    // Sort
    oPageRefs[aParts.length + 1].aData.sort(Sort_Pages);
}

function PopulateData_PageRefsSE(sPage) {
    $("#loading").show();
    aStatistics["pagerefsse"] = [];
    GetPart_PageRefsSE(sPage, aParts[0]);
}

function AddPart_PageRefsSE(oData, sPage) {
    iCount = aStatistics["pagerefsse"].push(oData);
    if (iCount < aParts.length) {
        GetPart_PageRefsSE(sPage, aParts[iCount]);
    } else {
        $("#loading").hide();
        DrawPage(sPage);
    }
}


function GetPart_PageRefsSE(sPage, oPart) {
    // create data objects
    var oPR = {"iTotalPages": 0, "iTotalHits": 0, "aData": []};

    $.ajax({
        type: "GET",
        url: XMLURL("SEREFERRALS", oPart.name),
        success: function(oXML) {
            CheckLastUpdate(oXML);

            $(oXML).find('item').each(function() {
                // collect values
                var sReferrer = $(this).attr("id");
                var sURL = sReferrer;
                var sImage = "&nbsp;";
                var iPages = parseInt($(this).attr("pages"));
                var iHits = parseInt($(this).attr("hits"));

                // find if exists in array
                for (var i = 0; i < gc_aSearchEngines.length; i++) {
                    if (gc_aSearchEngines[i].sCode == sReferrer) {
                        sReferrer = gc_aSearchEngines[i].sName;
                        sURL = gc_aSearchEngines[i].sURL;
                        sImage = "<img src=\"themes/" + sThemeDir + "/searchengines/" + gc_aSearchEngines[i].sImage + ".gif\" alt=\"" + sReferrer + "\" />";
                        break;
                    }
                }

                // increment totals
                oPR.iTotalPages += iPages;
                oPR.iTotalHits += iHits;

                // populate array
                oPR.aData.push({"sReferrer": sReferrer,
                    "sURL": sURL,
                    "sImage": sImage,
                    "iPages": iPages,
                    "iHits": iHits});
            });

            // apply data
            oPR.aData.sort(Sort_Pages);
            AddPart_PageRefsSE(oPR, sPage);
        }
    });
}

function MergeParts_PageRefsSE()
{
    // merge helper
    function mergePart(oSum, oPart)
    {
        // merge total hits
        oSum.iTotalPages += oPart.iTotalPages;
        oSum.iTotalHits += oPart.iTotalHits;
        oSum.iTotalBW += oPart.iTotalBW;
        // merge data
        for (iRow in oPart.aData) {
            var found = false;
            for (jRow in oSum.aData)
                if (oPart.aData[iRow].sURL == oSum.aData[jRow].sURL) {
                    oSum.aData[jRow].iPages += oPart.aData[iRow].iPages;
                    oSum.aData[jRow].iHits += oPart.aData[iRow].iHits;
                    oSum.aData[jRow].iBW += oPart.aData[iRow].iBW;
                    found = true;
                    break;
                }
            if (!found)
                oSum.aData.push(oPart.aData[iRow]);
        }

        // merge data domains
        for (iRow in oPart.aDataDomain) {
            var found = false;
            for (jRow in oSum.aDataDomain)
                if (oPart.aDataDomain[iRow].sURL == oSum.aDataDomain[jRow].sURL) {
                    oSum.aDataDomain[jRow].iPages += oPart.aDataDomain[iRow].iPages;
                    oSum.aDataDomain[jRow].iHits += oPart.aDataDomain[iRow].iHits;
                    oSum.aDataDomain[jRow].iBW += oPart.aDataDomain[iRow].iBW;
                    found = true;
                    break;
                }
            if (!found)
                oSum.aDataDomain.push(oPart.aDataDomain[iRow]);
        }
    }


    var foundFirst = false;
    var oPageRefsSE = aStatistics["pagerefsse"];
    for (iIndex in aParts)
        if (aParts[iIndex].active)
            if (!foundFirst) { // use first active part as base
                // deep copy
                oPageRefsSE[aParts.length + 1] = $.evalJSON($.toJSON(oPageRefsSE[iIndex]));
                foundFirst = true;
            } else
                mergePart(oPageRefsSE[aParts.length + 1], oPageRefsSE[iIndex]);
    // Sort
    oPageRefsSE[aParts.length + 1].aData.sort(Sort_Pages);
}

function PopulateData_Pages(sPage) {
    $("#loading").show();
    aStatistics[sPage.split(".")[0]] = [];
    GetPart_Pages(sPage, aParts[0]);
}

function AddPart_Pages(oData, sPage) {
    iCount = aStatistics[sPage.split(".")[0]].push(oData);
    if (iCount < aParts.length) {
        GetPart_Pages(sPage, aParts[iCount]);
    } else {
        $("#loading").hide();
        DrawPage(sPage);
    }
}

function GetPart_Pages(sPage, oPart) {
    // create data objects
    var oP = {iTotalPages: 0, iTotalBW: 0, iTotalEntry: 0, iTotalExit: 0, bHaveTitles: false, aDataPages: [], aDataBW: [], aDataEntry: [], aDataExit: []};
    // do ajax call
    $.ajax({
        type: "GET",
        url: XMLURL("PAGES", oPart.name),
        success: function(oXML) {
            CheckLastUpdate(oXML);

            // retrieve totals
            var oXMLTotals = $(oXML).find("totals");
            oP.iTotalPages = parseInt(oXMLTotals.attr("pages"));
            oP.iTotalBW = parseInt(oXMLTotals.attr("bw"));
            oP.iTotalEntry = parseInt(oXMLTotals.attr("entry"));
            oP.iTotalExit = parseInt(oXMLTotals.attr("exit"));

            // have titles (url alias) ?
            if (parseInt($(oXML).find('info').attr("haveTitles")))
                oP.bHaveTitles = true;

            // extract data blocks
            oP.aDataPages = ExtractData($(oXML).find('data_pages'));
            oP.aDataBW = ExtractData($(oXML).find('data_bw'));
            oP.aDataEntry = ExtractData($(oXML).find('data_entry'));
            oP.aDataExit = ExtractData($(oXML).find('data_exit'));

            // apply data
            AddPart_Pages(oP, sPage);

            function ExtractData(oXMLBlock) {
                var aData = [];

                $(oXMLBlock).find('item').each(function() {
                    aData.push({"sURL": $(this).attr("url"),
                        "sTitle": $(this).attr("title"),
                        "iPages": parseInt($(this).attr("pages")),
                        "iBW": parseInt($(this).attr("bw")),
                        "iEntry": parseInt($(this).attr("entry")),
                        "iExit": parseInt($(this).attr("exit"))});
                });

                return aData;
            }
        }
    });
}


function MergeParts_Pages()
{
    // merge helper
    function mergePart(oSum, oPart)
    {
        // merge total hits
        oSum.iTotalPages += oPart.iTotalPages;
        oSum.iTotalHits += oPart.iTotalHits;
        oSum.iTotalBW += oPart.iTotalBW;
        // merge data
        for (iRow in oPart.aData) {
            var found = false;
            for (jRow in oSum.aData)
                if (oPart.aData[iRow].sURL == oSum.aData[jRow].sURL) {
                    oSum.aData[jRow].iPages += oPart.aData[iRow].iPages;
                    oSum.aData[jRow].iHits += oPart.aData[iRow].iHits;
                    oSum.aData[jRow].iBW += oPart.aData[iRow].iBW;
                    found = true;
                    break;
                }
            if (!found)
                oSum.aData.push(oPart.aData[iRow]);
        }
    }


    var foundFirst = false;
    var oPages = aStatistics["pages"];
    for (iIndex in aParts)
        if (aParts[iIndex].active)
            if (!foundFirst) { // use first active part as base
                // deep copy
                oPages[aParts.length + 1] = $.evalJSON($.toJSON(oPages[iIndex]));
                foundFirst = true;
            } else
                mergePart(oPages[aParts.length + 1], oPages[iIndex]);
    // Sort
    //    oPages[aParts.length+1].aData.sort(Sort_Pages);
}


function PopulateData_Robots(sPage) {
    $("#loading").show();
    aStatistics[sPage.split(".")[0]] = [];
    GetPart_Robots(sPage, aParts[0]);
}

function AddPart_Robots(oData, sPage) {
    iCount = aStatistics[sPage.split(".")[0]].push(oData);
    if (iCount < aParts.length) {
        GetPart_Robots(sPage, aParts[iCount]);
    } else {
        $("#loading").hide();
        DrawPage(sPage);
    }
}

function GetPart_Robots(sPage, oPart) {
    // create data objects
    var oR = {"iTotalHits": 0, "iTotalBW": 0, "dtLastVisit": 0, "iTotalRobotsTXT": 0, "aData": []};

    $.ajax({
        type: "GET",
        url: XMLURL("ROBOT", oPart.name),
        success: function(oXML) {
            CheckLastUpdate(oXML);

            $(oXML).find('item').each(function() {
                // collect values
                var sRobot = $(this).attr("id");
                var iHits = parseInt($(this).attr("hits"));
                var iBW = parseInt($(this).attr("bw"));
                var dtLastVisit = parseInt($(this).attr("lastvisit"));
                var iRobotsTXT = parseInt($(this).attr("robotstxt"));

                // increment totals
                oR.iTotalHits += iHits;
                oR.iTotalBW += iBW;
                oR.iTotalRobotsTXT += iRobotsTXT;

                // populate array
                oR.aData.push({"sRobot": sRobot,
                    "iHits": iHits,
                    "iBW": iBW,
                    "dtLastVisit": dtLastVisit,
                    "iRobotsTXT": iRobotsTXT});
            });

            // apply data
            AddPart_Robots(oR, sPage);
        }
    });
}

function MergeParts_Robots()
{
    // merge helper
    function mergePart(oSum, oPart)
    {
        // merge total hits
        oSum.iTotalHits += oPart.iTotalHits;
        oSum.iTotalBW += oPart.iTotalBW;
        oSum.iTotalRobotsTXT += oPart.iRobotsTXT;
        // merge data
        for (iRow in oPart.aData) {
            var found = false;
            for (jRow in oSum.aData)
                if (oPart.aData[iRow].sRobot == oSum.aData[jRow].sRobot) {
                    oSum.aData[jRow].iRobotsTXT += oPart.aData[iRow].iRobotsTXT;
                    oSum.aData[jRow].iHits += oPart.aData[iRow].iHits;
                    oSum.aData[jRow].iBW += oPart.aData[iRow].iBW;
                    found = true;
                    break;
                }
            if (!found)
                oSum.aData.push(oPart.aData[iRow]);
        }
    }


    var foundFirst = false;
    var oRobots = aStatistics["robots"];
    for (iIndex in aParts)
        if (aParts[iIndex].active)
            if (!foundFirst) { // use first active part as base
                // deep copy
                oRobots[aParts.length + 1] = $.evalJSON($.toJSON(oRobots[iIndex]));
                foundFirst = true;
            } else
                mergePart(oRobots[aParts.length + 1], oRobots[iIndex]);
    // Sort
    //    oPages[aParts.length+1].aData.sort(Sort_Pages);
}


function PopulateData_Session(sPage) {
    $("#loading").show();
    aStatistics[sPage.split(".")[0]] = [];
    GetPart_Session(sPage, aParts[0]);
}

function AddPart_Session(oData, sPage) {
    iCount = aStatistics[sPage.split(".")[0]].push(oData);
    if (iCount < aParts.length) {
        GetPart_Session(sPage, aParts[iCount]);
    } else {
        $("#loading").hide();
        DrawPage(sPage);
    }
}

function GetPart_Session(sPage, oPart) {
    var oS = {"iTotalFreq": 0, "aData": {s1h: 0, s5mn15mn: 0, s15mn30mn: 0, s30s2mn: 0, s0s30s: 0, s2mn5mn: 0, s30mn1h: 0}};

    $.ajax({
        type: "GET",
        url: XMLURL("SESSION", oPart.name),
        success: function(oXML) {
            CheckLastUpdate(oXML);

            $(oXML).find('item').each(function() {
                // collect values
                var sRange = ("s" + $(this).attr("range").replace(RegExp("[ +-]"), ""));
                oS.aData[sRange] = parseInt($(this).attr("freq"));

                // increment totals
                oS.iTotalFreq += oS.aData[sRange];
            });

            // apply data
            AddPart_Session(oS, sPage);
        }
    });
}


function MergeParts_Session()
{
    // merge helper
    function mergePart(oSum, oPart)
    {
        oSum.iTotalFreq += oPart.iTotalFreq;
        // merge data
        for (sRange in oPart.aData)
            oSum.aData[sRange] += oPart.aData[sRange];
    }


    var foundFirst = false;
    var oSession = aStatistics["session"];
    for (iIndex in aParts)
        if (aParts[iIndex].active)
            if (!foundFirst) { // use first active part as base
                // deep copy
                oSession[aParts.length + 1] = $.evalJSON($.toJSON(oSession[iIndex]));
                foundFirst = true;
            } else
                mergePart(oSession[aParts.length + 1], oSession[iIndex]);
    // Sort
    //    oPages[aParts.length+1].aData.sort(Sort_Pages);
}


function PopulateData_Status(sPage) {
    $("#loading").show();
    aStatistics[sPage.split(".")[0]] = [];
    GetPart_Status(sPage, aParts[0]);
}

function AddPart_Status(oData, sPage) {
    iCount = aStatistics[sPage.split(".")[0]].push(oData);
    if (iCount < aParts.length) {
        GetPart_Status(sPage, aParts[iCount]);
    } else {
        $("#loading").hide();
        DrawPage(sPage);
    }
}


function GetPart_Status(sPage, oPart) {
    // create data objects
    var oS = {"iTotalHits": 0, "iTotalBW": 0, "aData": []};

    $.ajax({
        type: "GET",
        url: XMLURL("ERRORS", oPart.name),
        success: function(oXML) {
            CheckLastUpdate(oXML);

            $(oXML).find('item').each(function() {
                // collect values
                var sCode = $(this).attr("id");
                var sDescription = gc_aHTTPStatus[sCode];
                if (typeof gc_aHTTPStatus[sCode] == "undefined") {
                    sDescription = "&nbsp;";
                }
                var iHits = parseInt($(this).attr("hits"));
                var iBW = parseInt($(this).attr("bw"));

                // increment totals
                oS.iTotalHits += iHits;
                oS.iTotalBW += iBW;

                // populate array
                oS.aData.push({"sCode": sCode,
                    "sDescription": sDescription,
                    "iHits": iHits,
                    "iBW": iBW});
            });

            // apply data
            oS.aData.sort(Sort_Hits);
            AddPart_Status(oS, sPage);
        }
    });
}

function MergeParts_Status()
{
    // merge helper
    function mergePart(oSum, oPart)
    {
        // merge totals
        oSum.iTotalHits += oPart.iTotalHits;
        oSum.iTotalBW += oPart.iTotalBW;
        // merge data
        for (iRow in oPart.aData) {
            var found = false;
            for (jRow in oSum.aData)
                if (oPart.aData[iRow].sCode == oSum.aData[jRow].sCode) {
                    oSum.aData[jRow].iHits += oPart.aData[iRow].iHits;
                    oSum.aData[jRow].iBW += oPart.aData[iRow].iBW;
                    found = true;
                    break;
                }
            if (!found)
                oSum.aData.push(oPart.aData[iRow]);
        }
    }


    var foundFirst = false;
    var oStatus = aStatistics["status"];
    for (iIndex in aParts)
        if (aParts[iIndex].active)
            if (!foundFirst) { // use first active part as base
                // deep copy
                oStatus[aParts.length + 1] = $.evalJSON($.toJSON(oStatus[iIndex]));
                foundFirst = true;
            } else
                mergePart(oStatus[aParts.length + 1], oStatus[iIndex]);
    // Sort
    oStatus[aParts.length + 1].aData.sort(Sort_Hits);
}


function PopulateData_Status404(sPage) {
    $("#loading").show();
    aStatistics["status404"] = [];
    GetPart_Status404(sPage, aParts[0]);
}

function AddPart_Status404(oData, sPage) {
    iCount = aStatistics["status404"].push(oData);
    if (iCount < aParts.length) {
        GetPart_Status404(sPage, aParts[iCount]);
    } else {
        $("#loading").hide();
        DrawPage(sPage);
    }
}


function GetPart_Status404(sPage, oPart) {

    // create data objects
    var oS = {"iTotalHits": 0, "aData": []};

    $.ajax({
        type: "GET",
        url: XMLURL("SIDER_404", oPart.name),
        success: function(oXML) {
            CheckLastUpdate(oXML);

            $(oXML).find('item').each(function() {
                // collect values
                var sURL = $(this).attr("url");
                var iHits = parseInt($(this).attr("hits"));
                var sReferrer = $(this).attr("referrer");

                // increment totals
                oS.iTotalHits += iHits;

                // populate array
                oS.aData.push({"sURL": sURL.split("/").join("&#8203;/").split("-").join("-&#8203;").split("_").join("_&#8203;"),
                    "iHits": iHits,
                    "sReferrer": sReferrer,
                    "sReferrerVisible": sReferrer.split("/").join("&#8203;/").split("-").join("-&#8203;").split("_").join("_&#8203;")});
            });

            // apply data
            oS.aData.sort(Sort_Hits);
            AddPart_Status404(oS, sPage);
        }
    });
}

function MergeParts_Status404()
{
    // merge helper
    function mergePart(oSum, oPart)
    {
        // merge totals
        oSum.iTotalHits += oPart.iTotalHits;
        // merge data
        for (iRow in oPart.aData) {
            var found = false;
            for (jRow in oSum.aData)
                if (oPart.aData[iRow].sURL == oSum.aData[jRow].sURL) {
                    oSum.aData[jRow].iHits += oPart.aData[iRow].iHits;
                    found = true;
                    break;
                }
            if (!found)
                oSum.aData.push(oPart.aData[iRow]);
        }
    }


    var foundFirst = false;
    var oStatus404 = aStatistics["status404"];
    for (iIndex in aParts)
        if (aParts[iIndex].active)
            if (!foundFirst) { // use first active part as base
                // deep copy
                oStatus404[aParts.length + 1] = $.evalJSON($.toJSON(oStatus404[iIndex]));
                foundFirst = true;
            } else
                mergePart(oStatus404[aParts.length + 1], oStatus404[iIndex]);
    // Sort
    oStatus404[aParts.length + 1].aData.sort(Sort_Hits);
}


function PopulateData_ThisMonth(sPage) {
    $("#loading").show();
    aStatistics[sPage.split(".")[0]] = [];
    GetPart_ThisMonth(sPage, aParts[0]);
}


function AddPart_ThisMonth(oData, sPage) {
    iCount = aStatistics[sPage.split(".")[0]].push(oData);
    if (iCount < aParts.length) {
        GetPart_ThisMonth(sPage, aParts[iCount]);
    } else {
        $("#loading").hide();
        DrawPage(sPage);
    }
}


function GetPart_ThisMonth(sPage, oPart) {
    // create data objects
    var oTM = {"iTotalPages": 0, "iTotalHits": 0, "iTotalBW": 0, "iTotalVisits": 0, "aData": []};
    $.ajax({
        type: "GET",
        url: XMLURL("DAY", oPart.name),
        success: function(oXML) {
            //	if (oXML) alert(oXML);  else alert("no xml");
            CheckLastUpdate(oXML);

            var aTemp1 = [];
            var iMaxDate = 0;
            $(oXML).find('item').each(function() {
                // collect values
                var sDate = $(this).attr("date");
                var iVisits = parseInt($(this).attr("visits"));
                var iPages = parseInt($(this).attr("pages"));
                var iHits = parseInt($(this).attr("hits"));
                var iBW = parseInt($(this).attr("bw"));

                // increment totals
                oTM.iTotalVisits += iVisits;
                oTM.iTotalPages += iPages;
                oTM.iTotalHits += iHits;
                oTM.iTotalBW += iBW;

                // create javascript date
                dtDate = new Date(sDate.substr(0, 4),
                        (parseInt(StripLeadingZeroes(sDate.substr(4, 2))) - 1),
                        sDate.substr(6, 2));

                // populate array
                aTemp1.push({"dtDate": dtDate,
                    "iVisits": iVisits,
                    "iPages": iPages,
                    "iHits": iHits,
                    "iBW": iBW});
                dtMaxDate = dtDate;
            });

            // populate complete array (including empty values)
            var aTemp2 = [];
            var iPointer = 0;
            for (var iIndex = 0; iIndex < dtMaxDate.getDate(); iIndex++) {
                dtExpectedDate = new Date(dtMaxDate.getFullYear(), dtMaxDate.getMonth(), (iIndex + 1));
                if ((aTemp1.length > iPointer) && (aTemp1[iPointer].dtDate.valueOf() == dtExpectedDate.valueOf())) {
                    aTemp2.push({"dtDate": new Date(dtMaxDate.getFullYear(), dtMaxDate.getMonth(), (iIndex + 1)),
                        "iVisits": aTemp1[iPointer].iVisits,
                        "iPages": aTemp1[iPointer].iPages,
                        "iHits": aTemp1[iPointer].iHits,
                        "iBW": aTemp1[iPointer].iBW});
                    iPointer++;
                } else {
                    aTemp2.push({"dtDate": new Date(dtMaxDate.getFullYear(), dtMaxDate.getMonth(), (iIndex + 1)),
                        "iVisits": 0,
                        "iPages": 0,
                        "iHits": 0,
                        "iBW": 0});
                }
            }

            // apply data
            oTM.aData = aTemp2;
            AddPart_ThisMonth(oTM, sPage);
        }
    });
}


function PopulateData_Time(sPage) {
    $("#loading").show();
    aStatistics[sPage.split(".")[0]] = [];
    GetPart_Time(sPage, aParts[0]);
}

function AddPart_Time(oData, sPage)
{
    iCount = aStatistics[sPage.split(".")[0]].push(oData);
    if (iCount < aParts.length) {
        GetPart_Time(sPage, aParts[iCount]);
    } else {
        $("#loading").hide();
        DrawPage(sPage);
    }
}

function GetPart_Time(sPage, oPart)
{
    // create data objects
    var oT = {"iTotalPages": 0, "iTotalHits": 0, "iTotalBW": 0, "iTotalNVPages": 0, "iTotalNVHits": 0, "iTotalNVBW": 0, "aData": []};

    $.ajax({
        type: "GET",
        url: XMLURL("TIME", oPart.name),
        success: function(oXML) {
            CheckLastUpdate(oXML);

            var aTemp = [];
            if ($(oXML).find('item').length > 0) {
                $(oXML).find('item').each(function() {
                    // collect values
                    var iHour = parseInt($(this).attr("hour"));
                    var iPages = parseInt($(this).attr("pages"));
                    var iHits = parseInt($(this).attr("hits"));
                    var iBW = parseInt($(this).attr("bw"));
                    var iNVPages = parseInt($(this).attr("notviewedpages"));
                    var iNVHits = parseInt($(this).attr("notviewedhits"));
                    var iNVBW = parseInt($(this).attr("notviewedbw"));

                    // increment totals
                    oT.iTotalPages += iPages;
                    oT.iTotalHits += iHits;
                    oT.iTotalBW += iBW;
                    oT.iTotalNVPages += iPages;
                    oT.iTotalNVHits += iHits;
                    oT.iTotalNVBW += iBW;

                    // populate array
                    oT.aData.push({"iHour": iHour,
                        "iPages": iPages,
                        "iHits": iHits,
                        "iBW": iBW,
                        "iNVPages": iNVPages,
                        "iNVHits": iNVHits,
                        "iNVBW": iNVBW});
                });

                // apply data
                AddPart_Time(oT, sPage);
            } else
                AddPart_Time(null, sPage);
        }
    });
}

function RedrawTable_Keyphrases(sParam, sValue) {
    oPaging.oKeyphrases[sParam] = sValue;
    $(".tablePie").html(Paging_Keyphrases());
}

function RedrawTable_Keywords(sParam, sValue) {
    oPaging.oKeywords[sParam] = sValue;
    $(".tablePie").html(Paging_Keywords());
}

function SafeDivide(iFirst, iSecond) {
    if (iSecond != 0) {
        return (iFirst / iSecond);
    } else {
        return 0;
    }
}

function ShowTools(sID) {
    if (arguments.length > 0) {
        sToolID = sID;
    }

    // loop through items
    if ($("#tools .tool:visible").size() > 0) {
        $("#tools .tool:visible").each(function() {
            if ($(this).attr("id") == sToolID) {
                $(this).stop().slideUp(350);
            } else {
                $(this).stop().slideUp(350, ShowTools);
            }
        });
    } else {
        $("#" + sToolID).stop().slideDown(350);
    }
}

function Sort_Freq(a, b) {
    return b.iFreq - a.iFreq;
}

function Sort_Hits(a, b) {
    return b.iHits - a.iHits;
}

function Sort_Pages(a, b) {
    return b.iPages - a.iPages;
}

function Sort_Hits(a, b) {
    return b.iHits - a.iHits;
}

function Sort_Phrase(a, b) {
    return ((a.sPhrase < b.sPhrase) ? -1 : ((a.sPhrase > b.sPhrase) ? 1 : 0));
}

function Sort_Word(a, b) {
    return ((a.sWord < b.sWord) ? -1 : ((a.sWord > b.sWord) ? 1 : 0));
}

function TagCloud(sType, oData, iMaxCount) {
    // create array of top tags, sorted alpahabetically
    var aTag = [];
    var iCount = oData.aData.length;
    if (iCount > iMaxCount) {
        iCount = iMaxCount;
    }
    for (var i = 0; i < iCount; i++) {
        aTag.push(oData.aData[i]);
    }
    if (sType == "sWord") {
        aTag.sort(Sort_Word);
    } else {
        aTag.sort(Sort_Phrase);
    }

    // apply sizes
    aHTML = [];
    var iMaxSize = 60;
    var iMinSize = 11;
    var iDiff = (iMaxSize - iMinSize);
    for (var i = 0; i < iCount; i++) {
        var iSize = (Math.round((aTag[i].iFreq / oData.iMaxFreq) * iDiff) + iMinSize);
        aHTML.push("<span style=\"font-size: " + iSize + "px; line-height: " + Math.round(iSize * 1.35) + "px;\">" + aTag[i][sType] + "</span>");
    }
    return aHTML.join("\n");
}

function UpdateSite() {
    $("#loading").show();
    $.ajax({
        type: "POST",
        url: sUpdateFilename,
        data: ("config=" + g_sConfig + "&pass=" + MD5($("#password").val())),
        success: function(oXML) {
            switch ($(oXML).find('result:eq(0)').attr("type")) {
                case "bad_password":
                    $("#loading").hide();
                    alert(Lang("The password you entered was incorrect."));
                    break;
                case "updated":
                    var sURL = "?config=" + g_sConfig + "&year=" + g_iYear + "&month=" + g_iMonth + "&view=" + g_sCurrentView + "&lang=" + g_sLanguage;
                    self.location.href = sURL;
                    break;
                default:
                    $("#loading").hide();
            }
        }
    });
}

function UpdateSiteKeyUp(event) {
    if (event.keyCode == 13) {
        UpdateSite();
    }
}

function XMLURL(sPage, part) {
    var sURL = "";
    if (g_bUseStaticXML == true) {
        switch (sPage) {
            case "ALLMONTHS":
                sURL = ("static/jawstats." + g_sConfig + ".allmonths.xml?cache=" + g_dtLastUpdate);
                break;
            default:
                if (g_iMonth < 10) {
                    sURL = ("static/jawstats" + g_iYear + "0" + g_iMonth + "." + g_sConfig + "." + sPage.toLowerCase() + ".xml?cache=" + g_dtLastUpdate);
                } else {
                    sURL = ("static/jawstats" + g_iYear + g_iMonth + "." + g_sConfig + "." + sPage.toLowerCase() + ".xml?cache=" + g_dtLastUpdate);
                }
        }
    } else {
        switch (sPage) {
            case "ALLMONTHS":
                sURL = ("xml_history.php?config=" + g_sConfig);
                break;
            case "PAGES":
                sURL = ("xml_pages.php?config=" + g_sConfig + "&year=" + g_iYear + "&month=" + g_iMonth);
                break;
            case "VISITOR":
                sURL = ("xml_stats.php?config=" + g_sConfig + "&section=" + sPage + "&year=" + g_iYear + "&month=" + g_iMonth + "&max=100");
                break;
            default:
                sURL = ("xml_stats.php?config=" + g_sConfig + "&section=" + sPage + "&year=" + g_iYear + "&month=" + g_iMonth);
        }
    }
    if (!(part === undefined) && part.length > 0)
        sURL += "&part=" + part;
    // no-cache, for IE:
    sURL += "&uncache=" + new Date().getTime();
    return sURL;
}
