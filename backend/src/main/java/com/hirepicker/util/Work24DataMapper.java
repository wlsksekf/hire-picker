package com.hirepicker.util;

import com.hirepicker.dto.CompanyDto;
import com.hirepicker.dto.EventDto;
import com.hirepicker.dto.JobDto;
import org.w3c.dom.Element;

public class Work24DataMapper {

    public static JobDto mapToJobDto(Element e) {
        String id = Work24XmlParser.getTagValue(e, "empSeqno");
        if (id == null || id.isBlank()) return null; // Or throw an exception
        return new JobDto(id, Work24XmlParser.getTagValue(e, "empBusiNm"), Work24XmlParser.getTagValue(e, "empWantedTitle"), Work24XmlParser.getTagValue(e, "empWantedTypeNm"), Work24XmlParser.getTagValue(e, "coClcdNm"));
    }

    public static EventDto mapToEventDto(Element e) {
        String id = Work24XmlParser.getTagValue(e, "eventNo");
        if (id == null || id.isBlank()) return null; // Or throw an exception
        return new EventDto(id, Work24XmlParser.getTagValue(e, "eventNm"), Work24XmlParser.getTagValue(e, "eventTerm"), Work24XmlParser.getTagValue(e, "area"));
    }

    public static CompanyDto mapToCompanyDto(Element e) {
        String id = Work24XmlParser.getTagValue(e, "empCoNo");
        if (id == null || id.isBlank()) return null; // Or throw an exception
        return new CompanyDto(id, Work24XmlParser.getTagValue(e, "coClcdNm"), Work24XmlParser.getTagValue(e, "coIntroSummaryCont"), Work24XmlParser.getTagValue(e, "homepg"), Work24XmlParser.getTagValue(e, "busino"), Work24XmlParser.getTagValue(e, "regLogImgNm"));
    }
}