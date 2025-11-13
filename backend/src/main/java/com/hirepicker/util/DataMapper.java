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
        Long postingIdx = Long.parseLong(id); // Assuming empSeqno can be parsed to Long

        return new JobDto(
                id, // id
                postingIdx, // postingIdx
                XmlParser.getTagValue(e, "empBusiNm"), // companyName
                XmlParser.getTagValue(e, "empWantedTitle"), // title
                XmlParser.getTagValue(e, "empWantedTypeNm"), // employmentType
                XmlParser.getTagValue(e, "coClcdNm"), // location (this seems incorrect, should be job location)
                null, // imgUrl
                null, // searchTerm
                null, // companyType
                null, // filters
                null, // experience_level
                null, // jobType
                null, // description
                null, // startDate
                null, // endDate
                null, // companyIdx
                null, // welfare
                null, // required_qualifications
                null, // preferred_qualifications
                null, // experienceLevel
                null, // salaryInfo
                null, // internal (외부 공고이므로 false)
                null, // applyUrl
                "OPEN" // status

        );
    }

    public static EventDto mapToEventDto(Element e) {
        String id = XmlParser.getTagValue(e, "eventNo");
        if (id == null || id.isBlank())
            return null; // Or throw an exception
        return new EventDto(id, XmlParser.getTagValue(e, "eventNm"), XmlParser.getTagValue(e, "eventTerm"),
                XmlParser.getTagValue(e, "area"), "OPEN"); // eventStatus 필드에 "OPEN" 전달
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
