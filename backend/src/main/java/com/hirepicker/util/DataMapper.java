package com.hirepicker.util;

import org.w3c.dom.Element;

import com.hirepicker.dto.CompanyDto;
import com.hirepicker.dto.EventDto;
import com.hirepicker.dto.JobDto;

public class DataMapper {

    public static JobDto mapToJobDto(Element e) {
        String id = XmlParser.getTagValue(e, "empSeqno");
        if (id == null || id.isBlank())
            return null; // Or throw an exception
        return new JobDto(id, XmlParser.getTagValue(e, "empBusiNm"), XmlParser.getTagValue(e, "empWantedTitle"),
                XmlParser.getTagValue(e, "empWantedTypeNm"), XmlParser.getTagValue(e, "coClcdNm"), id);
    }

    public static EventDto mapToEventDto(Element e) {
        String id = XmlParser.getTagValue(e, "eventNo");
        if (id == null || id.isBlank())
            return null; // Or throw an exception
        return new EventDto(id, XmlParser.getTagValue(e, "eventNm"), XmlParser.getTagValue(e, "eventTerm"),
                XmlParser.getTagValue(e, "area"));
    }

    public static CompanyDto mapToCompanyDto(Element e) {
        String id = XmlParser.getTagValue(e, "empCoNo");
        if (id == null || id.isBlank())
            return null;
        return new CompanyDto(
                null, // companyIdx
                id, // id
                XmlParser.getTagValue(e, "coNm"), // name
                XmlParser.getTagValue(e, "coIntroSummaryCont"), // summary
                XmlParser.getTagValue(e, "homepg"), // homepage
                XmlParser.getTagValue(e, "busino"), // businessNumber
                XmlParser.getTagValue(e, "regLogImgNm"), // logoUrl
                XmlParser.getTagValue(e, "coClcdNm"), // companyType
                XmlParser.getTagValue(e, "ceoNm"), // ceoNm
                XmlParser.getTagValue(e, "adres"), // adres
                XmlParser.getTagValue(e, "empCnt"), // employeeCount
                XmlParser.getTagValue(e, "corpCode"), // corpCode
                null, // status
                null, // regDate
                null, // sales_amount
                null); // welfare_benefits
    }

    public static CompanyDto mapToDartCorp(Element e) {
        String id = XmlParser.getTagValue(e, "CorpName");
        if (id == null || id.isBlank())
            return null;
        return new CompanyDto(
                null, // companyIdx
                id, // id
                XmlParser.getTagValue(e, "CorpName"), // name
                null, // summary
                null, // homepage
                null, // businessNumber
                null, // logoUrl
                null, // companyType
                null, // ceoNm
                null, // adres
                null, // employeeCount
                XmlParser.getTagValue(e, "CorpCode"), // corpCode
                null, // status
                null, // regDate
                null, // sales_amount
                null); // welfare_benefits
    }
}
