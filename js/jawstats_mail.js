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

    var cur_emails = [];

    oAllMonths = aStatistics["allmonths"];

    for (part_idx in oAllMonths)
        if (aParts[part_idx].active) {
            aValue[part_idx] = [];
            cur_emails[part_idx] = 0;
        }

    var cur_year = oAllMonths[0].aData[0].dtDate.getFullYear();


    for (var iIndex in oAllMonths[0].aData) {
        var year = oAllMonths[0].aData[iIndex].dtDate.getFullYear();

        if (year == cur_year) {
            for (part_idx in oAllMonths)
                if (aParts[part_idx].active)
                    cur_emails[part_idx] += parseInt(oAllMonths[part_idx].aData[iIndex].iPages);
        } else {
            aItem.push(cur_year);
            aInitial.push(cur_year.toString().substr(2));

            for (part_idx in oAllMonths)
                if (aParts[part_idx].active)
                    aValue.push(cur_emails[part_idx]);


            cur_year = year;
            for (part_idx in oAllMonths)
                if (aParts[part_idx].active)
                    cur_emails[part_idx] = parseInt(oAllMonths[part_idx].aData[iIndex].iPages);
        }
    }
    aItem.push(cur_year);
    aInitial.push(cur_year.toString().substr(2));

    for (part_idx in oAllMonths)
        if (aParts[part_idx].active)
            aValue[part_idx].push(cur_emails[part_idx]);

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
            if (aParts[part_idx].active)
                aValue[part_idx].push(oAllMonths[part_idx].aData[iIndex].iPages);
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

    for (var iIndex in oThisMonth[0].aData) {
        iDay = (oThisMonth[0].aData[iIndex].dtDate.getDate() - 1);
        // populate values for each part:
        for (part_idx in oThisMonth) {
            if (aParts[part_idx].active)
                if (oThisMonth[part_idx].aData[iIndex])
                    aValue[part_idx][iDay] = oThisMonth[part_idx].aData[iIndex].iPages;
                else
                    aValue[part_idx][iDay] = 0;
        }
    }

    // remove empty/non-active parts
    var aActiveValue = [];
    for (iIndex in aValue)
        if (aValue[iIndex])
            aActiveValue.push(aValue[iIndex]);

    DrawBar(aItem, aValue, aInitial);
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
            if (aParts[part_idx].active)
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
                PageLayout_AllMonths(aPage[1]);
                break;
            case "country":
                if (typeof aStatistics[aPage[0]] == "undefined") {
                    PopulateData_Country(sPage);
                    return false;
                }
                MergeParts_Country();
                PageLayout_Country(aPage[1]);
                break;
            case "hosts":
                if (typeof aStatistics[aPage[0]] == "undefined") {
                    PopulateData_Hosts(sPage);
                    return false;
                }
                MergeParts_Hosts();
                PageLayout_EmailHosts(aPage[1]);
                break;
            case "senders":
                if (typeof aStatistics[aPage[0]] == "undefined") {
                    PopulateData_Senders(sPage);
                    return false;
                }
                MergeParts_Senders();
                PageLayout_EmailSenders(aPage[1]);
                break;
            case "recipients":
                if (typeof aStatistics[aPage[0]] == "undefined") {
                    PopulateData_Recipients(sPage);
                    return false;
                }
                MergeParts_Recipients();
                PageLayout_EmailRecipients(aPage[1]);
                break;
            case "status":
                if (typeof aStatistics["status"] == "undefined") {
                    PopulateData_Status(sPage);
                    return false;
                }
                MergeParts_Status();
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

function DrawPie_Emails(aData, iTotal, sItemName) {
    var aItem = [];
    var aValue = [];
    var iRunningTotal = 0;
    var iCount = 0;
    for (var iIndex in aData) {
        if (iCount < 6) {
            aItem.push(aData[iIndex].sAddress);
            aValue.push(aData[iIndex][sItemName]);
            iRunningTotal += aData[iIndex][sItemName];
        }
        iCount++;
    }
    if (iTotal > iRunningTotal) {
        aItem.push(Lang("Other Adresses"));
        aValue.push(iTotal - iRunningTotal);
    }
    DrawPie(iTotal, aItem, aValue);
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

function DrawTable_AllMonths(sPage) {
    // create header
    var sHTML = "<table class=\"tablesorter\" cellspacing=\"0\">\n" +
            "<thead><tr>";
    if (sPage == "all") {
        sHTML += "<th width=\"16%\">" + Lang("Month") + "</th>";
    } else {
        sHTML += "<th width=\"16%\">" + Lang("Year") + "</th>";
    }
    sHTML += "<th width=\"12%\">" + Lang("Total Emails") + "</th>" +
            "<th width=\"12%\">" + Lang("Emails per Day") + "</th>" +
            "<th width=\"12%\" class=\"noborder\">" + Lang("BW") + "</th>" +
            "</tr></thead>\n" +
            "<tbody>";

    oAllMonths = aStatistics["allmonths"];

    // create table body
    aHTML = new Array();
    var iTotalEmails = 0;
    var iTotalBW = 0;
    var iAnnualEmails = 0;
    var iAnnualBW = 0;
    var iCurrentYear = oAllMonths[0].aData[0].iYear;

    for (var iRow in oAllMonths[0].aData) {
        oRow = oAllMonths[0].aData[iRow];

        // create single values
        var iEmails = SumParts(oAllMonths, "iPages", iRow);
        var iBW = SumParts(oAllMonths, "iBW", iRow);
        var iDaysInMonth = parseFloat(oRow.iDaysInMonth);

        // sum totals
        iTotalEmails += iEmails;
        iTotalBW += iBW;
        iAnnualEmails += iEmails;
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
                        "<td class=\"right\">" + NumberFormat(iEmails, 0) + "</td>" +
                        "<td class=\"right\">" + NumberFormat((iEmails / iDaysInMonth), 1) + "</td>" +
                        "<td class=\"right\">" + DisplayBandwidth(iBW) + "</td>" +
                        "</tr>\n";
                aHTML.push(sHTMLRow);
                break;
            case "year":
                //if ((iCurrentYear != oRow.iYear) || (iRow == (oAllMonths.aData.length - 1))) {
                if ((oRow.iMonth == 12) || (iRow == (oAllMonths[0].aData.length - 1))) {
                    var sHTMLRow = "<tr>" +
                            "<td>" + iCurrentYear + "</td>" +
                            "<td class=\"right\">" + NumberFormat(iAnnualEmails) + "</td>" +
                            "<td class=\"right\">" + NumberFormat((iAnnualEmails / oAllMonths[0].aYearDayCount[iCurrentYear]), 1) + "</td>" +
                            "<td class=\"right\">" + DisplayBandwidth(iAnnualBW) + "</td>" +
                            "</tr>\n";
                    aHTML.push(sHTMLRow);

                    // reset values
                    iAnnualEmails = 0;
                    iAnnualBW = 0;
                }
                break;
        }
    }

    // output
    if (aHTML.length > 0) {
        sHTML = (sHTML + aHTML.join("\n") + "</tbody><tfoot><tr>" +
                "<td class=\"noborder\">&nbsp;</td>" +
                "<td class=\"noborder right\">" + NumberFormat(iTotalEmails, 0) + "</td>" +
                "<td class=\"noborder right\">&nbsp;</td>" +
                "<td class=\"noborder right\">" + DisplayBandwidth(iTotalBW) + "</td>" +
                "</tr></tfoot></table>")
        return ([true, sHTML]);
    } else {
        return ([false, (sHTML + "<tr><td class=\"center\" colspan=\"7\">" + Lang("There is no data to display") + "</td></tr></tbody></table>")]);
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
            "<th>" + Lang("EMails") + "</th>" +
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


function DrawTable_EmailHost(aData) {
    oHosts = aStatistics["hosts"][aParts.length + 1];
    // get values
    var iTotalEmails = oHosts.iTotalEmails;
    var iTotalBW = oHosts.iTotalBW;

    // create header
    var sHTML = "<table class=\"tablesorter\" cellspacing=\"0\">\n" +
            "<thead><tr>" +
            "<th>" + Lang("Host") + "</th>" +
            "<th>" + Lang("Emails") + "</th>" +
            "<th>&nbsp;</th>" +
            "<th>" + Lang("Bandwidth") + "</th>" +
            "<th class=\"noborder\">&nbsp;</th>" +
            "</tr></thead>\n" +
            "<tbody>";

    // create table body
    var aHTML = [];
    for (var iRow in aData) {
        aHTML.push("<tr>" +
                "<td>" + aData[iRow].sAddress + "</td>" +
                "<td class=\"right\">" + NumberFormat(aData[iRow].iEmails, 0) + "</td>" +
                "<td class=\"right\">" + NumberFormat(SafeDivide(aData[iRow].iEmails, iTotalEmails) * 100, 1) + "%</td>" +
                "<td class=\"right\">" + DisplayBandwidth(aData[iRow].iBW) + "</td>" +
                "<td class=\"right\">" + NumberFormat(SafeDivide(aData[iRow].iBW, iTotalBW) * 100, 1) + "%</td>" +
                "</tr>\n");
    }

    // output
    if (aHTML.length > 0) {
        return ([true, (sHTML + aHTML.join("\n") + "</tbody></table>")]);
    } else {
        return ([false, (sHTML + "<tr><td class=\"center\" colspan=\"9\">" + Lang("There is no data to display") + "</td></tr></tbody></table>")]);
    }
}

function DrawTable_EmailSender(aData) {
    var oSenders = aStatistics["senders"][aParts.length + 1];
    // get values
    var iTotalEmails = oSenders.iTotalEmails;
    var iTotalBW = oSenders.iTotalBW;

    // create header
    var sHTML = "<table class=\"tablesorter\" cellspacing=\"0\">\n" +
            "<thead><tr>" +
            "<th>" + Lang("Sender") + "</th>" +
            "<th>" + Lang("Emails") + "</th>" +
            "<th>&nbsp;</th>" +
            "<th>" + Lang("Bandwidth") + "</th>" +
            "<th class=\"noborder\">&nbsp;</th>" +
            "</tr></thead>\n" +
            "<tbody>";

    // create table body
    var aHTML = [];
    for (var iRow in aData) {
        aHTML.push("<tr>" +
                "<td>" + aData[iRow].sAddress + "</td>" +
                "<td class=\"right\">" + NumberFormat(aData[iRow].iEmails, 0) + "</td>" +
                "<td class=\"right\">" + NumberFormat(SafeDivide(aData[iRow].iEmails, iTotalEmails) * 100, 1) + "%</td>" +
                "<td class=\"right\">" + DisplayBandwidth(aData[iRow].iBW) + "</td>" +
                "<td class=\"right\">" + NumberFormat(SafeDivide(aData[iRow].iBW, iTotalBW) * 100, 1) + "%</td>" +
                "</tr>\n");
    }

    // output
    if (aHTML.length > 0) {
        return ([true, (sHTML + aHTML.join("\n") + "</tbody></table>")]);
    } else {
        return ([false, (sHTML + "<tr><td class=\"center\" colspan=\"9\">" + Lang("There is no data to display") + "</td></tr></tbody></table>")]);
    }
}

function DrawTable_EmailRecipient(aData) {
    var oRecipients = aStatistics["recipients"][aParts.length + 1];
    // get values
    var iTotalEmails = oRecipients.iTotalEmails;
    var iTotalBW = oRecipients.iTotalBW;

    // create header
    var sHTML = "<table class=\"tablesorter\" cellspacing=\"0\">\n" +
            "<thead><tr>" +
            "<th>" + Lang("Recipient") + "</th>" +
            "<th>" + Lang("Emails") + "</th>" +
            "<th>&nbsp;</th>" +
            "<th>" + Lang("Bandwidth") + "</th>" +
            "<th class=\"noborder\">&nbsp;</th>" +
            "</tr></thead>\n" +
            "<tbody>";

    // create table body
    var aHTML = [];
    for (var iRow in aData) {
        aHTML.push("<tr>" +
                "<td>" + aData[iRow].sAddress + "</td>" +
                "<td class=\"right\">" + NumberFormat(aData[iRow].iEmails, 0) + "</td>" +
                "<td class=\"right\">" + NumberFormat(SafeDivide(aData[iRow].iEmails, iTotalEmails) * 100, 1) + "%</td>" +
                "<td class=\"right\">" + DisplayBandwidth(aData[iRow].iBW) + "</td>" +
                "<td class=\"right\">" + NumberFormat(SafeDivide(aData[iRow].iBW, iTotalBW) * 100, 1) + "%</td>" +
                "</tr>\n");
    }

    // output
    if (aHTML.length > 0) {
        return ([true, (sHTML + aHTML.join("\n") + "</tbody></table>")]);
    } else {
        return ([false, (sHTML + "<tr><td class=\"center\" colspan=\"9\">" + Lang("There is no data to display") + "</td></tr></tbody></table>")]);
    }
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
            "<th>" + Lang("Messages") + "</th>" +
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

function DrawTable_ThisMonth() {
    var oThisMonth = aStatistics["thismonth"];

    // get values
    iTotalEmails = 0;
    iTotalBW = 0;
    aData = null;

    for (iIndex in aParts)
        if (aParts[iIndex].active) {
            // get values
            iTotalEmails += oThisMonth[iIndex].iTotalPages;
            iTotalBW += oThisMonth[iIndex].iTotalBW;
            if (aData == null)
                aData = oThisMonth[iIndex].aData;
        }



    // create header
    var sHTML = "<table class=\"tablesorter\" cellspacing=\"0\">\n" +
            "<thead><tr>" +
            "<th width=\"15%\">" + Lang("Day") + "</th>" +
            "<th width=\"14%\">" + Lang("Date") + "</th>" +
            "<th width=\"9%\" class=\"noborder\">" + Lang("Emails") + "</th>" +
            "<th width=\"11%\">" + Lang("per Mail") + "</th>" +
            "<th width=\"9%\" class=\"noborder\">" + Lang("BW") + "</th>" +
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

        var iEmails = SumParts(oThisMonth, "iPages", iRow);
        var iBW = SumParts(oThisMonth, "iBW", iRow);


        aHTML.push("<tr" + sRowStyle + ">" +
                "<td><span class=\"hidden\">" + oRow.dtDate.getDay() + "</span>" + Lang(gc_aDayName[oRow.dtDate.getDay()]) + "</td>" +
                "<td><span class=\"hidden\">" + oRow.dtDate.valueOf() + "</span>" + sVisibleDate + "</td>" +
                "<td class=\"right\">" + NumberFormat(iEmails, 0) + "</td>" +
                "<td class=\"right\">" + DisplayBandwidth((SafeDivide(iBW, iEmails))) + "</td>" +
                "<td class=\"noborder right\">" + DisplayBandwidth(iBW) + "</td>" +
                "</tr>\n");
    }

    // output
    if (aHTML.length > 0) {
        sHTML = (sHTML + aHTML.join("\n") + "</tbody><tfoot><tr>" +
                "<td colspan=\"3\" class=\"noborder right\">" + NumberFormat(iTotalEmails, 0) + "</td>" +
                "<td class=\"noborder right\">" + DisplayBandwidth(iTotalBW) + "</td>" +
                "</tr></tfoot></table>")
        return ([true, sHTML]);
    } else {
        return ([false, (sHTML + "<tr><td class=\"center\" colspan=\"10\">" + Lang("There is no data to display") + "</td></tr></tbody></table>")]);
    }
}

function DrawTable_Time() {
    var oTime = aStatistics["time"];

    // get values
    var iTotalEmails = 0;
    var iTotalBW = 0;
    var iTotalNVEmails = 0;
    var iTotalNVBW = 0;
    aData = null;

    for (iIndex in aParts)
        if (aParts[iIndex].active) {
            iTotalEmails += oTime[iIndex].iTotalPages;
            iTotalBW += oTime[iIndex].iTotalBW;
            iTotalNVEmails += oTime[iIndex].iTotalNVPages;
            iTotalNVBW += oTime[iIndex].iTotalNVBW;
            if (aData == null)
                aData = oTime[iIndex].aData;
        }

    // create header
    var sHTML = "<table class=\"tablesorter\" cellspacing=\"0\">\n" +
            "<thead><tr>" +
            "<th>" + Lang("Hour") + "</th>" +
            "<th class=\"noborder\">" + Lang("Emails") + "</th>" +
            "<th class=\"noborder right\">%</th>" +
            "<th class=\"right\">+/-</th>" +
            "<th class=\"noborder\">" + Lang("BW") + "</th>" +
            "<th class=\"noborder right\">%</th>" +
            "<th class=\"right\">+/-</th>" +
            "</tr></thead>\n" +
            "<tbody>";

    // create table body
    var aHTML = [];
    var iAvgEmails = (iTotalEmails / 24);
    var iAvgBW = (iTotalBW / 24);
    for (var iRow in aData) {
        var oRow = aData[iRow];
        var sHour = oRow.iHour;
        if (oRow.iHour < 10) {
            sHour = ("0" + sHour)
        }

        // +/- values
        var sEmailsDiff = Difference(SumParts(oTime, "iPages", iRow), iAvgEmails);
        var sBWDiff = Difference(SumParts(oTime, "iBW", iRow), iAvgBW);

        // create table
        aHTML.push("<tr>" +
                "<td>" + sHour + "</td>" +
                "<td class=\"right\">" + NumberFormat(SumParts(oTime, "iPages", iRow), 0) + "</td>" +
                "<td class=\"right\">" + NumberFormat((SafeDivide(SumParts(oTime, "iPages", iRow), iTotalEmails) * 100), 1) + "%</td>" +
                "<td class=\"right\">" + sEmailsDiff + "</td>" +
                "<td class=\"right\">" + DisplayBandwidth(SumParts(oTime, "iBW", iRow)) + "</td>" +
                "<td class=\"right\">" + NumberFormat((SafeDivide(SumParts(oTime, "iBW", iRow), iTotalBW) * 100), 1) + "%</td>" +
                "<td class=\"right\">" + sBWDiff + "</td>" +
                "</tr>\n");
    }

    // output
    if (aHTML.length > 0) {
        sHTML = (sHTML + aHTML.join("\n") + "</tbody><tfoot><tr>" +
                "<td class=\"noborder\">&nbsp;</td>" +
                "<td class=\"noborder right\">" + NumberFormat(iTotalEmails, 0) + "</td>" +
                "<td class=\"noborder\">&nbsp;</td>" +
                "<td class=\"noborder\">&nbsp;</td>" +
                "<td class=\"noborder right\">" + DisplayBandwidth(iTotalBW) + "</td>" +
                "<td class=\"noborder\">&nbsp;</td>" +
                "<td class=\"noborder\">&nbsp;</td>" +
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
            "<td colspan=\"7\" class=\"calGraph\"><div id=\"graph\">&nbsp</div>&nbsp;</td>" +
            "<td colspan=\"3\">&nbsp;</td>" +
            "</tr><tr>" +
            "<td class=\"labelSide\">" + Lang("Day of Week Total") + "</td>" +
            "<td id=\"calTotDay1\" class=\"calTotDay\">&nbsp;</td>" +
            "<td id=\"calTotDay2\" class=\"calTotDay\">&nbsp;</td>" +
            "<td id=\"calTotDay3\" class=\"calTotDay\">&nbsp;</td>" +
            "<td id=\"calTotDay4\" class=\"calTotDay\">&nbsp;</td>" +
            "<td id=\"calTotDay5\" class=\"calTotDay\">&nbsp;</td>" +
            "<td id=\"calTotDay6\" class=\"calTotDay\">&nbsp;</td>" +
            "<td id=\"calTotDay0\" class=\"calTotDay\">&nbsp;</td>" +
            "<td>&nbsp;</td>" +
            "<td colspan=\"2\" id=\"calTotMonth\" class=\"calTotDay\">&nbsp;</td>" +
            "</tr><tr>" +
            "<td class=\"labelSide\">" + Lang("Day of Week Average") + "</td>" +
            "<td id=\"calAvgDay1\" class=\"calAvgDay\">&nbsp;</td>" +
            "<td id=\"calAvgDay2\" class=\"calAvgDay\">&nbsp;</td>" +
            "<td id=\"calAvgDay3\" class=\"calAvgDay\">&nbsp;</td>" +
            "<td id=\"calAvgDay4\" class=\"calAvgDay\">&nbsp;</td>" +
            "<td id=\"calAvgDay5\" class=\"calAvgDay\">&nbsp;</td>" +
            "<td id=\"calAvgDay6\" class=\"calAvgDay\">&nbsp;</td>" +
            "<td id=\"calAvgDay0\" class=\"calAvgDay\">&nbsp;</td>" +
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
                iTotal += aDay[iPart][iDayNumber].iTotal;
                ;
            }
        }
        // modify table
        if (sDataItem == "iBW") {
            sHTML = ("<div class=\"date\">" + oRow.dtDate.getDate() + "</div><div class=\"value\">" + DisplayBandwidth(oRow[sDataItem]) + "</div>");
        } else {
            sHTML = ("<div class=\"date\">" + oRow.dtDate.getDate() + "</div><div class=\"value\">" + NumberFormat(oRow[sDataItem], 0) + "</div>");
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
    }

    // fill in any remaining empty days
    var dtThisDate = new Date(oRow.dtDate.getFullYear(), oRow.dtDate.getMonth(), (oRow.dtDate.getDate() + 1));
    while (dtThisDate.getMonth() == dtLastDayOfMonth.getMonth()) {
        $("#calDay" + dtThisDate.getDay() + "-" + getWeekNr(dtThisDate)).html("<div class=\"date\">" + dtThisDate.getDate() + "</div>").addClass("calDay");
        dtThisDate.setDate(dtThisDate.getDate() + 1);
    }

    // populate month totals
    if (sDataItem == "iBW") {
        $("#calTotMonth").html("<div><span>" + Lang("Total") + ":</span> " + DisplayBandwidth(iTotal) + "</div>");
        $("#calAvgMonth").html("<div><span>" + Lang("Average") + ":</span> " + DisplayBandwidth(iTotal / oRow.dtDate.getDate()) + "</div>");
    } else {
        $("#calTotMonth").html("<div><span>" + Lang("Total") + ":</span> " + NumberFormat(iTotal, 0) + "</div>");
        $("#calAvgMonth").html("<div><span>" + Lang("Average") + ":</span> " + NumberFormat((iTotal / oRow.dtDate.getDate()), 1) + "</div>");
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
            var sHTML = "<h2>" + Lang("Emails each Month") + "</h2>" +
                    DrawSubMenu("allmonths", "Emails each Month") +
                    "<div id=\"graph\" class=\"graph\">&nbsp;</div>";
            break;
        case "year":
            var sHTML = "<h2>" + Lang("Emails each Year") + "</h2>" +
                    DrawSubMenu("allmonths", "Emails each Year") +
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

function PageLayout_Country(sPage) {
    switch (sPage) {
        case "all":
            var aTable = DrawTable_Country();
            var sHTML = "<h2>" + Lang("Emails by Country") + "</h2>" +
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
                var sHTML = "<h2>" + Lang("Other Emails") + "</h2>";
            } else {
                var sHTML = "<h2>" + Lang("Emails from " + sPage) + "</h2>";
            }
            var aTable = DrawTable_Country(sPage);
            sHTML += DrawSubMenu("country", sPage) +
                    "<div id=\"pie\" class=\"pie\">&nbsp;</div><div class=\"tablePie\">" +
                    aTable[1] + "</div>";
            $("#content").html(sHTML);
            if (aTable[0] == true) {
                $(".tablesorter").tablesorter({headers: {0: {sorter: false}, 2: {sorter: "commaNumber"}, 3: {sorter: false}, 4: {sorter: "commaNumber"}, 5: {sorter: false}, 6: {sorter: 'bandwidth'}, 7: {sorter: false}}, sortList: [[2, 1]], textExtraction: function(node) {
                        return node.innerHTML.replace(',', '');
                    }, widgets: ['zebra']});
            }
            $("#content").fadeIn(g_iFadeSpeed);
            DrawPie_Country(sPage);
            break;
    }
}

function PageLayout_EmailHosts(sPage) {
    var oHosts = aStatistics["hosts"][aParts.length + 1];
    var aData = oHosts.aData;
    var iPieTotal = oHosts.iTotalEmails;
    var sPieItem = "iEmails";
    var aTable = DrawTable_EmailHost(aData);
    var sHTML = "<h2>" + Lang("Email Hosts") + "</h2>" +
            /*              DrawSubMenu("emails", sSubMenu) + */
            "<div id=\"pie\" class=\"pie\">&nbsp;</div><div class=\"tablePie\">" + aTable[1] + "</div>";
    $("#content").html(sHTML);
    $("#content").fadeIn(g_iFadeSpeed);
    if (aTable[0] == true) {
        //    $(".tablesorter").tablesorter({ headers: { 2: { sorter: false }, 3:{sorter:'bandwidth'}, 4: { sorter: false }, 6: { sorter: false }, 8: { sorter: false } }, sortList: [aSort],textExtraction:function(node){return node.innerHTML.replace(',', '');}, widgets: ['zebra'] });
        $(".tablesorter").tablesorter({widgets: ['zebra']});
    }
    DrawPie_Emails(aData, iPieTotal, sPieItem);
}

function PageLayout_EmailSenders(sPage) {
    var oSenders = aStatistics["senders"][aParts.length + 1];
    var aData = oSenders.aData;
    var iPieTotal = oSenders.iTotalEmails;
    var sPieItem = "iEmails";
    var aTable = DrawTable_EmailSender(aData);
    var sHTML = "<h2>" + Lang("Email Senders") + "</h2>" +
            /*              DrawSubMenu("emails", sSubMenu) + */
            "<div id=\"pie\" class=\"pie\">&nbsp;</div><div class=\"tablePie\">" + aTable[1] + "</div>";
    $("#content").fadeIn(g_iFadeSpeed);
    $("#content").html(sHTML);
    if (aTable[0] == true) {
        //    $(".tablesorter").tablesorter({ headers: { 2: { sorter: false }, 3:{sorter:'bandwidth'}, 4: { sorter: false }, 6: { sorter: false }, 8: { sorter: false } }, sortList: [aSort],textExtraction:function(node){return node.innerHTML.replace(',', '');}, widgets: ['zebra'] });
        $(".tablesorter").tablesorter({widgets: ['zebra']});
    }
    DrawPie_Emails(aData, iPieTotal, sPieItem);
}

function PageLayout_EmailRecipients(sPage) {
    var oRecipients = aStatistics["recipients"][aParts.length + 1];
    var aData = oRecipients.aData;
    var iPieTotal = oRecipients.iTotalEmails;
    var sPieItem = "iEmails";
    var aTable = DrawTable_EmailRecipient(aData);
    var sHTML = "<h2>" + Lang("Email Recipients") + "</h2>" +
            /*              DrawSubMenu("emails", sSubMenu) + */
            "<div id=\"pie\" class=\"pie\">&nbsp;</div><div class=\"tablePie\">" + aTable[1] + "</div>";
    $("#content").html(sHTML);
    $("#content").fadeIn(g_iFadeSpeed);
    if (aTable[0] == true) {
        //    $(".tablesorter").tablesorter({ headers: { 2: { sorter: false }, 3:{sorter:'bandwidth'}, 4: { sorter: false }, 6: { sorter: false }, 8: { sorter: false } }, sortList: [aSort],textExtraction:function(node){return node.innerHTML.replace(',', '');}, widgets: ['zebra'] });
        $(".tablesorter").tablesorter({widgets: ['zebra']});
    }
    DrawPie_Emails(aData, iPieTotal, sPieItem);
}


function PageLayout_Status(sPage) {
    switch (sPage) {
        /*    case "404":
         var aTable = DrawTable_Status404();
         var sHTML = "<h2>" + Lang("SMTP Status Codes") + ": 404s</h2>" +
         DrawSubMenu("status", "File Not Found URLs") +
         "<div id=\"pie\" class=\"pie\">&nbsp;</div><div class=\"tablePie\">" + aTable[1] + "</div>";
         $("#content").html(sHTML);
         if (aTable[0] == true) {
         $(".tablesorter").tablesorter({ headers: { 1: { sorter: "commaNumber" } }, sortList: [[1,1]],textExtraction:function(node){return node.innerHTML.replace(',', '');}, widgets: ['zebra'] });
         }
         $("#content").fadeIn(g_iFadeSpeed);
         DrawPie_Status404(sPage);
         break;*/
        default:
            var aTable = DrawTable_Status();
            var sHTML = "<h2>" + Lang("SMTP Status Codes") + "</h2>" +
                    DrawSubMenu("status", "Status Codes") +
                    "<div id=\"pie\" class=\"pie\">&nbsp;</div><div class=\"tablePie\">" + aTable[1] + "</div>";
            $("#content").html(sHTML);
            $("#content").fadeIn(g_iFadeSpeed);
            if (aTable[0] == true) {
                //        $(".tablesorter").tablesorter({ headers: { 2: { sorter: "commaNumber" }, 3:{ sorter: false }, 4: { sorter: "bandwidth" }, 5: { sorter: false } }, sortList: [[2,1]],textExtraction:function(node){return node.innerHTML.replace(',', '');}, widgets: ['zebra'] });
                $(".tablesorter").tablesorter({widgets: ['zebra']});
            }
            DrawPie_Status(sPage);
    }
}

function PageLayout_ThisMonth(sPage) {
    switch (sPage) {
        case "all":
            var aTable = DrawTable_ThisMonth();
            var sHTML = "<h2>" + Lang("Emails this Month") + "</h2>" +
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
        case "emails":
            Misc_ThisMonthCalendar("Calendar of Emails this Month", "Calendar of Emails", "iPages");
            break;
        case "bandwidth":
            Misc_ThisMonthCalendar("Calendar of Bandwidth Usage this Month", "Calendar of Bandwidth Usage", "iBW");
            break;
    }
}

function PageLayout_Time(sPage) {
    var aTable = DrawTable_Time(sPage);
    var sHTML = "<h2>" + Lang("Emails over 24 Hours") + "</h2>" +
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
            // CheckLastUpdate(oXML); disabled until update problem is fixed. only affects this call.

            var aTemp = [];
            var iCurrentYear = 0;
            $(oXML).find('month').each(function() {
                dtTemp = new Date(parseInt($(this).attr("year")), (parseInt($(this).attr("month")) - 1), 1);

                // days in month
                iDaysInMonth = parseFloat($(this).attr("daysinmonth"));

                // push items onto array
                aTemp.push({"dtDate": new Date(dtTemp.getFullYear(), dtTemp.getMonth(), 1),
                    "iMonth": $(this).attr("month"),
                    "iYear": $(this).attr("year"),
                    "iDaysInMonth": iDaysInMonth,
                    "iVisits": $(this).attr("visits"),
                    "iUniques": $(this).attr("uniques"),
                    "iPages": $(this).attr("pages"),
                    "iHits": $(this).attr("hits"),
                    "iBW": $(this).attr("bw"),
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
        }
    });
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
                var sDescription = gc_aSMTPStatus[sCode];
                if (typeof gc_aSMTPStatus[sCode] == "undefined") {
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
        // merge total hits
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

function PopulateData_Hosts(sPage) {
    $("#loading").show();
    aStatistics[sPage.split(".")[0]] = [];
    GetPart_Hosts(sPage, aParts[0]);
}

function AddPart_Hosts(oData, sPage) {
    iCount = aStatistics[sPage.split(".")[0]].push(oData);
    if (iCount < aParts.length) {
        GetPart_Hosts(sPage, aParts[iCount]);
    } else {
        $("#loading").hide();
        DrawPage(sPage);
    }
}

function GetPart_Hosts(sPage, oPart) {
    // create data objects
    var oTM = {"iTotalEmails": 0, "iTotalBW": 0, "aData": []};

    $.ajax({
        type: "GET",
        url: XMLURL("VISITOR", oPart.name),
        success: function(oXML) {
            CheckLastUpdate(oXML);

            var aTemp1 = [];
            var iMaxDate = 0;
            var iTotalEmails = 0;
            var iTotalBW = 0;
            $(oXML).find('item').each(function() {
                // collect values
                var sAddress = $(this).attr("address");
                var iEmails = parseInt($(this).attr("pages"));
                var iBW = parseInt($(this).attr("bw"));
                var sLastVisit = $(this).attr("lastvisit");


                // create javascript date
                /*        dtDate = new Date(sDate.substr(0,4),
                 (parseInt(StripLeadingZeroes(sDate.substr(4,2))) - 1),
                 sDate.substr(6,2));*/

                // populate array
                aTemp1.push({"sAddress": sAddress,
                    "iEmails": iEmails,
                    "iBW": iBW});
                //dtMaxDate = dtDate;
                iTotalEmails += iEmails;
                iTotalBW += iBW;
            });
            oTM.aData = aTemp1;
            oTM.iTotalEmails = iTotalEmails;
            oTM.iTotalBW = iTotalBW;
            AddPart_Hosts(oTM, sPage);
        }});
}

function MergeParts_Hosts()
{
    // merge helper
    function mergePart(oSum, oPart)
    {
        // merge total hits
        oSum.iTotalEmails += oPart.iTotalEmails;
        oSum.iTotalBW += oPart.iTotalBW;
        // merge data
        for (iRow in oPart.aData) {
            var found = false;
            for (jRow in oSum.aData)
                if (oPart.aData[iRow].sAddress == oSum.aData[jRow].sAddress) {
                    oSum.aData[jRow].iEmails += oPart.aData[iRow].iEmails;
                    oSum.aData[jRow].iBW += oPart.aData[iRow].iBW;
                    found = true;
                    break;
                }
            if (!found)
                oSum.aData.push(oPart.aData[iRow]);
        }
    }


    var foundFirst = false;
    var oHost = aStatistics["hosts"];
    for (iIndex in aParts)
        if (aParts[iIndex].active)
            if (!foundFirst) { // use first active part as base
                // deep copy
                oHost[aParts.length + 1] = $.evalJSON($.toJSON(oHost[iIndex]));
                foundFirst = true;
            } else
                mergePart(oHost[aParts.length + 1], oHost[iIndex]);
    // Sort
    oHost[aParts.length + 1].aData.sort(Sort_Emails);
}


function PopulateData_Senders(sPage) {
    $("#loading").show();
    aStatistics[sPage.split(".")[0]] = [];
    GetPart_Senders(sPage, aParts[0]);
}

function AddPart_Senders(oData, sPage) {
    iCount = aStatistics[sPage.split(".")[0]].push(oData);
    if (iCount < aParts.length) {
        GetPart_Senders(sPage, aParts[iCount]);
    } else {
        $("#loading").hide();
        DrawPage(sPage);
    }
}

function GetPart_Senders(sPage, oPart) {
    // create data objects
    var oTM = {"iTotalEmails": 0, "iTotalBW": 0, "aData": []};

    $.ajax({
        type: "GET",
        url: XMLURL("EMAILSENDER", oPart.name),
        success: function(oXML) {
            CheckLastUpdate(oXML);

            var aTemp1 = [];
            var iMaxDate = 0;
            var iTotalEmails = 0;
            var iTotalBW = 0;
            $(oXML).find('item').each(function() {
                // collect values
                var sAddress = $(this).attr("address");
                var iEmails = parseInt($(this).attr("emails"));
                var iBW = parseInt($(this).attr("bw"));
                var sLastVisit = $(this).attr("lastvisit");


                // create javascript date
                /*        dtDate = new Date(sDate.substr(0,4),
                 (parseInt(StripLeadingZeroes(sDate.substr(4,2))) - 1),
                 sDate.substr(6,2));*/

                // populate array
                aTemp1.push({"sAddress": sAddress,
                    "iEmails": iEmails,
                    "iBW": iBW});
                //dtMaxDate = dtDate;
                iTotalEmails += iEmails;
                iTotalBW += iBW;
            });
            oTM.aData = aTemp1;
            oTM.iTotalEmails = iTotalEmails;
            oTM.iTotalBW = iTotalBW;
            AddPart_Senders(oTM, sPage);
        }});
}

function MergeParts_Senders()
{
    // merge helper
    function mergePart(oSum, oPart)
    {
        // merge total hits
        oSum.iTotalEmails += oPart.iTotalEmails;
        oSum.iTotalBW += oPart.iTotalBW;
        // merge data
        for (iRow in oPart.aData) {
            var found = false;
            for (jRow in oSum.aData)
                if (oPart.aData[iRow].sAddress == oSum.aData[jRow].sAddress) {
                    oSum.aData[jRow].iEmails += oPart.aData[iRow].iEmails;
                    oSum.aData[jRow].iBW += oPart.aData[iRow].iBW;
                    found = true;
                    break;
                }
            if (!found)
                oSum.aData.push(oPart.aData[iRow]);
        }
    }


    var foundFirst = false;
    var oSenders = aStatistics["senders"];
    for (iIndex in aParts)
        if (aParts[iIndex].active)
            if (!foundFirst) { // use first active part as base
                // deep copy
                oSenders[aParts.length + 1] = $.evalJSON($.toJSON(oSenders[iIndex]));
                foundFirst = true;
            } else
                mergePart(oSenders[aParts.length + 1], oSenders[iIndex]);
    // Sort
    oSenders[aParts.length + 1].aData.sort(Sort_Emails);
}

function PopulateData_Recipients(sPage) {
    $("#loading").show();
    aStatistics[sPage.split(".")[0]] = [];
    GetPart_Recipients(sPage, aParts[0]);
}

function AddPart_Recipients(oData, sPage) {
    iCount = aStatistics[sPage.split(".")[0]].push(oData);
    if (iCount < aParts.length) {
        GetPart_Recipients(sPage, aParts[iCount]);
    } else {
        $("#loading").hide();
        DrawPage(sPage);
    }
}

function GetPart_Recipients(sPage, oPart) {
    // create data objects
    var oTM = {"iTotalEmails": 0, "iTotalBW": 0, "aData": []};

    $.ajax({
        type: "GET",
        url: XMLURL("EMAILRECEIVER", oPart.name),
        success: function(oXML) {
            CheckLastUpdate(oXML);

            var aTemp1 = [];
            var iMaxDate = 0;
            var iTotalEmails = 0;
            var iTotalBW = 0;
            $(oXML).find('item').each(function() {
                // collect values
                var sAddress = $(this).attr("address");
                var iEmails = parseInt($(this).attr("emails"));
                var iBW = parseInt($(this).attr("bw"));
                var sLastVisit = $(this).attr("lastvisit");


                // create javascript date
                /*        dtDate = new Date(sDate.substr(0,4),
                 (parseInt(StripLeadingZeroes(sDate.substr(4,2))) - 1),
                 sDate.substr(6,2));*/

                // populate array
                aTemp1.push({"sAddress": sAddress,
                    "iEmails": iEmails,
                    "iBW": iBW});
                //dtMaxDate = dtDate;
                iTotalEmails += iEmails;
                iTotalBW += iBW;
            });
            oTM.aData = aTemp1;
            oTM.iTotalEmails = iTotalEmails;
            oTM.iTotalBW = iTotalBW;
            AddPart_Recipients(oTM, sPage);
        }});
}

function MergeParts_Recipients()
{
    // merge helper
    function mergePart(oSum, oPart)
    {
        // merge total hits
        oSum.iTotalEmails += oPart.iTotalEmails;
        oSum.iTotalBW += oPart.iTotalBW;
        // merge data
        for (iRow in oPart.aData) {
            var found = false;
            for (jRow in oSum.aData)
                if (oPart.aData[iRow].sAddress == oSum.aData[jRow].sAddress) {
                    oSum.aData[jRow].iEmails += oPart.aData[iRow].iEmails;
                    oSum.aData[jRow].iBW += oPart.aData[iRow].iBW;
                    found = true;
                    break;
                }
            if (!found)
                oSum.aData.push(oPart.aData[iRow]);
        }
    }


    var foundFirst = false;
    var oRecipients = aStatistics["recipients"];
    for (iIndex in aParts)
        if (aParts[iIndex].active)
            if (!foundFirst) { // use first active part as base
                // deep copy
                oRecipients[aParts.length + 1] = $.evalJSON($.toJSON(oRecipients[iIndex]));
                foundFirst = true;
            } else
                mergePart(oRecipients[aParts.length + 1], oRecipients[iIndex]);
    // Sort
    oRecipients[aParts.length + 1].aData.sort(Sort_Emails);
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
                if (aTemp1[iPointer].dtDate.valueOf() == dtExpectedDate.valueOf()) {
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
        }
    });
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

function Sort_Emails(a, b) {
    return b.iEmails - a.iEmails;
}

function Sort_Phrase(a, b) {
    return ((a.sPhrase < b.sPhrase) ? -1 : ((a.sPhrase > b.sPhrase) ? 1 : 0));
}

function Sort_Word(a, b) {
    return ((a.sWord < b.sWord) ? -1 : ((a.sWord > b.sWord) ? 1 : 0));
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
            case "EMAILSENDER":
                sURL = ("xml_stats.php?config=" + g_sConfig + "&section=" + sPage + "&year=" + g_iYear + "&month=" + g_iMonth + "&max=80");
                break;
            case "EMAILRECEIVER":
                sURL = ("xml_stats.php?config=" + g_sConfig + "&section=" + sPage + "&year=" + g_iYear + "&month=" + g_iMonth + "&max=80");
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
