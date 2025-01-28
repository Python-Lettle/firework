package cn.lettle.fireworks.entity;

import com.alibaba.fastjson2.JSON;
import lombok.*;

@Data
@Getter
@AllArgsConstructor
public class Message {
    private String type;
    private String data;

//    public static String OnlineCount (Integer num){
//        Message msg = new Message("onlineCount", String.valueOf(num));
//        return JSON.toJSONString(msg);
//    }

//    public static String WsConnected(String msgstr) {
//        Message msg = new Message("msg", msgstr);
//        return JSON.toJSONString(msg);
//    }
//
//    public static String FireworkInfo(Firework firework) {
//        Message msg = new Message("firework", firework.toString());
//        return JSON.toJSONString(msg);
//    }

}

class Firework
{

}
