package org.json;

// 경량 JSONObject 래퍼 (Jackson 기반)

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import java.util.Map;

public class JSONObject {
    private static final ObjectMapper MAPPER = new ObjectMapper();
    private final ObjectNode node;

    public JSONObject(String json) {
        try {
            JsonNode n = MAPPER.readTree(json);
            if (!(n instanceof ObjectNode)) {
                throw new IllegalArgumentException("JSON is not an object");
            }
            this.node = (ObjectNode) n;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public JSONObject(ObjectNode node) {
        this.node = node;
    }

    public JSONObject getJSONObject(String field) {
        JsonNode n = node.get(field);
        if (n == null || !n.isObject()) {
            throw new IllegalArgumentException("Field is not an object: " + field);
        }
        return new JSONObject((ObjectNode) n);
    }

    public JSONArray getJSONArray(String field) {
        JsonNode n = node.get(field);
        if (n == null) {
            throw new IllegalArgumentException("Field not found: " + field);
        }
        return new JSONArray(n);
    }

    public String getString(String field) {
        JsonNode n = node.get(field);
        if (n == null) {
            throw new IllegalArgumentException("Field not found: " + field);
        }
        return n.asText();
    }

    public Object get(String field) {
        JsonNode n = node.get(field);
        if (n == null) return null;
        if (n.isObject()) return new JSONObject((ObjectNode) n);
        if (n.isArray()) return new JSONArray(n);
        return MAPPER.convertValue(n, Object.class);
    }

    public Map<String, Object> toMap() {
        return MAPPER.convertValue(node, new TypeReference<Map<String, Object>>() {});
    }

    public boolean has(String string) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'has'");
    }

    public String optString(String string, String string2) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'optString'");
    }
}

