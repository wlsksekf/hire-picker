package com.hirepicker.util;

import com.hirepicker.entity.Company;
import org.xml.sax.Attributes;
import org.xml.sax.SAXException;
import org.xml.sax.helpers.DefaultHandler;

import java.util.ArrayList;
import java.util.List;

public class DartCorpCodeSaxHandler extends DefaultHandler {

    private List<Company> companies;
    private Company currentCompany;
    private StringBuilder currentValue;
    private boolean inCorpCode;
private boolean inCorpName;

    public DartCorpCodeSaxHandler() {
        this.companies = new ArrayList<>();
        this.currentValue = new StringBuilder();
    }

    public List<Company> getCompanies() {
        return companies;
    }

    @Override
    public void startElement(String uri, String localName, String qName, Attributes attributes) throws SAXException {
        currentValue.setLength(0); // Clear the StringBuilder for new element
        if (qName.equalsIgnoreCase("list")) {
            currentCompany = new Company();
        } else if (qName.equalsIgnoreCase("corp_code")) {
            inCorpCode = true;
        } else if (qName.equalsIgnoreCase("corp_name")) {
            inCorpName = true;
        }
    }

    @Override
    public void characters(char[] ch, int start, int length) throws SAXException {
        if (inCorpCode || inCorpName) {
            currentValue.append(ch, start, length);
        }
    }

    @Override
    public void endElement(String uri, String localName, String qName) throws SAXException {
        if (qName.equalsIgnoreCase("list")) {
            if (currentCompany != null && currentCompany.getCorpCode() != null && currentCompany.getCompanyName() != null) {
                companies.add(currentCompany);
            }
        } else if (qName.equalsIgnoreCase("corp_code")) {
            if (currentCompany != null) {
                currentCompany.setCorpCode(currentValue.toString().trim());
            }
            inCorpCode = false;
        } else if (qName.equalsIgnoreCase("corp_name")) {
            if (currentCompany != null) {
                currentCompany.setCompanyName(currentValue.toString().trim());
            }            inCorpName = false;
        }
    }
}
