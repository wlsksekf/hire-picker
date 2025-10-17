package com.hirepicker.service;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

public interface TossPaymentService {
    Map<String, Object> confirmPayment(HttpServletRequest request, String jsonBody) throws Exception;
    Map<String, Object> confirmBilling(String jsonBody) throws Exception;
    Map<String, Object> issueBillingKey(String jsonBody) throws Exception;
    Map<String, Object> callbackAuth(String customerKey, String code) throws Exception;
    Map<String, Object> confirmBrandpay(String jsonBody) throws Exception;
}