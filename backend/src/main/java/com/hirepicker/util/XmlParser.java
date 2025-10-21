package com.hirepicker.util;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.StringReader;

// XML 파싱을 위한 유틸리티 클래스
public class XmlParser {

    // XML 문자열을 Document 객체로 파싱
    public static Document parseXml(String xml) throws Exception {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        DocumentBuilder builder = factory.newDocumentBuilder();
        return builder.parse(new InputSource(new StringReader(xml)));
    }

    // XML 엘리먼트에서 특정 태그의 값을 추출
    public static String getTagValue(Element element, String tagName) {
        NodeList nodeList = element.getElementsByTagName(tagName);
        if (nodeList.getLength() > 0) {
            Node node = nodeList.item(0).getFirstChild();
            if (node != null) { return node.getNodeValue(); }
        }
        return "";
    }

    // 원시 XML 문자열에서 특정 태그의 값을 추출 (간단한 파싱)
    public static String getTagValueFromRawXml(String xml, String tagName) {
        try {
            return xml.split("<" + tagName + ">")[1].split("</" + tagName + ">")[0];
        } catch (Exception e) { return ""; }
    }
}