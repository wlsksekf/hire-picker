package com.hirepicker.util;

import com.hirepicker.dto.CompanyDto;
import com.hirepicker.dto.EventDto;
import com.hirepicker.dto.JobDto;
import org.w3c.dom.Element;

// Work24 API의 XML 데이터를 DTO로 변환하는 유틸리티 클래스
public class Work24DataMapper {

    // 채용 공고 XML 엘리먼트를 JobDto로 변환
    public static JobDto mapToJobDto(Element e) {
        String id = Work24XmlParser.getTagValue(e, "empSeqno");
        if (id == null || id.isBlank()) return null;
        return new JobDto(id, Work24XmlParser.getTagValue(e, "empBusiNm"), Work24XmlParser.getTagValue(e, "empWantedTitle"), Work24XmlParser.getTagValue(e, "empWantedTypeNm"), Work24XmlParser.getTagValue(e, "coClcdNm"));
    }

    // 채용 행사 XML 엘리먼트를 EventDto로 변환
    public static EventDto mapToEventDto(Element e) {
        String id = Work24XmlParser.getTagValue(e, "eventNo");
        if (id == null || id.isBlank()) return null;
        return new EventDto(id, Work24XmlParser.getTagValue(e, "eventNm"), Work24XmlParser.getTagValue(e, "eventTerm"), Work24XmlParser.getTagValue(e, "area"));
    }

    // 기업 정보 XML 엘리먼트를 CompanyDto로 변환
    public static CompanyDto mapToCompanyDto(Element e) {
        String id = Work24XmlParser.getTagValue(e, "empCoNo");
        if (id == null || id.isBlank()) return null;
        return new CompanyDto(id, Work24XmlParser.getTagValue(e, "coNm"), Work24XmlParser.getTagValue(e, "coIntroSummaryCont"), Work24XmlParser.getTagValue(e, "homepg"), Work24XmlParser.getTagValue(e, "busino"), Work24XmlParser.getTagValue(e, "regLogImgNm"),Work24XmlParser.getTagValue(e, "coClcdNm"));
    }
}
