package org.json;

// 경량 JSONArray 래퍼 (Jackson 기반)

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

public class JSONArray {
    private static final ObjectMapper MAPPER = new ObjectMapper();
    private final ArrayNode array;

    public JSONArray() {
        this.array = MAPPER.createArrayNode();
    }

    public JSONArray(JsonNode node) {
        if (node == null) {
            this.array = MAPPER.createArrayNode();
        } else if (node.isArray()) {
            this.array = (ArrayNode) node;
        } else {
            // 단일 값을 배열로 취급 (한글 주석: 기존 코드 호환)
            this.array = MAPPER.createArrayNode();
            this.array.add(node);
        }
    }

    public int length() {
        return array.size();
    }

    public Object get(int index) {
        JsonNode n = array.get(index);
        if (n == null) return null;
        if (n.isObject()) return new JSONObject((ObjectNode) n);
        if (n.isArray()) return new JSONArray(n);
        return MAPPER.convertValue(n, Object.class);
    }

    public JSONObject getJSONObject(int index) {
        JsonNode n = array.get(index);
        if (n == null || !n.isObject()) {
            throw new IllegalArgumentException("Index is not an object: " + index);
        }
        return new JSONObject((ObjectNode) n);
    }

    public void put(Object value) {
        if (value == null) {
            array.addNull();
        } else if (value instanceof JSONObject jo) {
            array.add(joToNode(jo));
        } else if (value instanceof JSONArray ja) {
            array.add(ja.array);
        } else {
            array.add(MAPPER.valueToTree(value));
        }
    }

    private ObjectNode joToNode(JSONObject jo) {
        try {
            // JSONObject 내부 필드 접근이 없으므로 직렬화 후 역직렬화로 변환
            String s = com.fasterxml.jackson.databind.json.JsonMapper.builder().build().writeValueAsString(jo.toMap());
            return (ObjectNode) MAPPER.readTree(s);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}

