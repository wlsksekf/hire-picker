package com.hirepicker.controller;

import com.hirepicker.service.TossPaymentService;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import java.util.Map;

@Controller
public class PaymentController {

    private final Logger logger = LoggerFactory.getLogger(this.getClass());
    private final TossPaymentService tossPaymentService = null;





    @RequestMapping(value = {"/confirm/widget", "/confirm/payment"})
    public ResponseEntity<Map<String, Object>> confirmPayment(HttpServletRequest request, @RequestBody String jsonBody) throws Exception {
        Map<String, Object> response = tossPaymentService.confirmPayment(request, jsonBody);
        int statusCode = response.containsKey("error") ? 400 : 200;
        return ResponseEntity.status(statusCode).body(response);
    }

    @RequestMapping(value = "/confirm-billing")
    public ResponseEntity<Map<String, Object>> confirmBilling(@RequestBody String jsonBody) throws Exception {
        Map<String, Object> response = tossPaymentService.confirmBilling(jsonBody);
        return ResponseEntity.status(response.containsKey("error") ? 400 : 200).body(response);
    }

    @RequestMapping(value = "/issue-billing-key")
    public ResponseEntity<Map<String, Object>> issueBillingKey(@RequestBody String jsonBody) throws Exception {
        Map<String, Object> response = tossPaymentService.issueBillingKey(jsonBody);
        return ResponseEntity.status(response.containsKey("error") ? 400 : 200).body(response);
    }

    @RequestMapping(value = "/callback-auth", method = RequestMethod.GET)
    public ResponseEntity<Map<String, Object>> callbackAuth(@RequestParam String customerKey, @RequestParam String code) throws Exception {
        Map<String, Object> response = tossPaymentService.callbackAuth(customerKey, code);
        logger.info("Response Data: {}", response);
        return ResponseEntity.status(response.containsKey("error") ? 400 : 200).body(response);
    }

    @RequestMapping(value = "/confirm/brandpay", method = RequestMethod.POST, consumes = "application/json")
    public ResponseEntity<Map<String, Object>> confirmBrandpay(@RequestBody String jsonBody) throws Exception {
        Map<String, Object> response = tossPaymentService.confirmBrandpay(jsonBody);
        return ResponseEntity.status(response.containsKey("error") ? 400 : 200).body(response);
    }







    /*@RequestMapping(value = "/", method = RequestMethod.GET)
    public String index() {
        return "/widget/checkout";
    }*/

    @RequestMapping(value = "/fail", method = RequestMethod.GET)
    public String failPayment(HttpServletRequest request, Model model) {
        model.addAttribute("code", request.getParameter("code"));
        model.addAttribute("message", request.getParameter("message"));
        return "/fail";
    }
}
