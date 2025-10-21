package com.hirepicker.util;

import com.hirepicker.dto.CompanyDto;
import com.hirepicker.dto.EventDto;
import com.hirepicker.dto.JobDto;
import org.w3c.dom.Element;

public class DataMapper {

    public static JobDto mapToJobDto(Element e) {
        String id = XmlParser.getTagValue(e, "empSeqno");
        if (id == null || id.isBlank()) return null; // Or throw an exception
        return new JobDto(id, XmlParser.getTagValue(e, "empBusiNm"), XmlParser.getTagValue(e, "empWantedTitle"), XmlParser.getTagValue(e, "empWantedTypeNm"), XmlParser.getTagValue(e, "coClcdNm"));
    }


    public static EventDto mapToEventDto(Element e) {
        String id = XmlParser.getTagValue(e, "eventNo");
        if (id == null || id.isBlank()) return null; // Or throw an exception
        return new EventDto(id, XmlParser.getTagValue(e, "eventNm"), XmlParser.getTagValue(e, "eventTerm"), XmlParser.getTagValue(e, "area"));
    }

    public static CompanyDto mapToCompanyDto(Element e) {
        String id = XmlParser.getTagValue(e, "empCoNo");
        if (id == null || id.isBlank()) return null; // Or throw an exception
        return new CompanyDto(id, XmlParser.getTagValue(e, "coNm"), XmlParser.getTagValue(e, "coIntroSummaryCont"), XmlParser.getTagValue(e, "homepg"), XmlParser.getTagValue(e, "busino"), XmlParser.getTagValue(e, "regLogImgNm"), XmlParser.getTagValue(e, "coClcdNm"), null, null, null,null);
    }

    public static CompanyDto mapToDartCorp(Element e) {
        String id = XmlParser.getTagValue(e, "CorpName");
        if (id == null || id.isBlank()) return null; // Or throw an exception
        return new CompanyDto(id, XmlParser.getTagValue(e, "CorpCode"),null,null,null,null,null,null,null,null,null);
    }
}