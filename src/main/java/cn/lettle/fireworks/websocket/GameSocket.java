package cn.lettle.fireworks.websocket;

import com.alibaba.fastjson2.JSONObject;
import jakarta.websocket.*;
import jakarta.websocket.server.PathParam;
import jakarta.websocket.server.ServerEndpoint;
import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicInteger;

@Slf4j
@Component
@ServerEndpoint("/websocket/{userId}")
public class GameSocket {

    private Session session;
    /**
     * 记录在线连接客户端数量
     */
    private static AtomicInteger onlineCount = new AtomicInteger(0);
    /**
     * 存放每个连接进来的客户端对应的websocketServer对象，用于后面群发消息
     */
    private static CopyOnWriteArrayList<GameSocket> wsServers = new CopyOnWriteArrayList<>();

    private static Map<String, String> uid_uname = new HashMap<>();

    /**
     * 服务端与客户端连接成功时执行
     * @param session 会话
     */
    @OnOpen
    public void onOpen(Session session, @PathParam("userId") String userId){
        if (userId.equals("null")) {
            return;
        }

        this.session = session;
        //接入的客户端+1
        int count = onlineCount.incrementAndGet();
        //集合中存入客户端对象+1
        wsServers.add(this);
        System.out.println("[" + userId + "] 连接到服务器");
        System.out.println("与客户端连接成功，当前连接的客户端数量为：" + count);

        // 向登录的客户端发送消息
        Map map = new HashMap<String, String>();
        map.put("type", "connection");
        map.put("msg", "连接成功");
        String message = JSONObject.toJSONString(map);
        session.getAsyncRemote().sendText(message);

        // 向所有客户发送登入消息
//        map.clear();
//        map.put("type", "newuser");
//        map.put("username", username);
//        sendMessageToAll(JSONObject.toJSONString(map));
    }

    /**
     * 收到客户端的消息时执行
     * @param message 消息
     * @param session 会话
     */
    @OnMessage
    public void onMessage(@PathParam("userId") String userId, String message, Session session){
//        log.info("收到来自客户端的消息，客户端地址：{}，消息内容：{}", session.getMessageHandlers(), message);
        //业务逻辑，对消息的处理
//        sendMessageToAll("群发消息的内容");
        JSONObject recv = JSONObject.parseObject(message);
        String type = recv.getString("type");

        System.out.println("收到message: " + message);

        Map<String, String> msg = new HashMap<>();
        Map<String, String> firework = new HashMap<>();

        if (type.equals("firework")) {
            firework.put("username",recv.getString("username"));
            msg.put("type", "firework");
            msg.put("firework", JSONObject.toJSONString(firework));
            sendMessageToAll(JSONObject.toJSONString(msg));
        } else if (type.equals("bindname")) {
            msg.put("type", "newuser");
            msg.put("username", recv.getString("username"));
            sendMessageToAll(JSONObject.toJSONString(msg));
            uid_uname.put(userId, recv.getString("username"));
        }

    }

    /**
     * 连接发生报错时执行
     * @param session 会话
     * @param throwable 报错
     */
    @OnError
    public void onError(Session session, @NonNull Throwable throwable){
//        log.error("连接发生报错");
        throwable.printStackTrace();
    }

    /**
     * 连接断开时执行
     */
    @OnClose
    public void onClose(@PathParam("username") String username){
        //接入客户端连接数-1
        int count = onlineCount.decrementAndGet();
        //集合中的客户端对象-1
        wsServers.remove(this);
        System.out.println("["+username+"]断开连接，当前连接的客户端数量为：" + count);

        Map<String, String> msg = new HashMap<>();
        msg.put("type", "leave");
        msg.put("username", username);
        sendMessageToAll(JSONObject.toJSONString(msg));
    }


    /**
     * 向客户端推送消息
     * @param message 消息
     */
    public void sendMessage(String message){
        try {
            this.session.getBasicRemote().sendText(message);
        } catch (IllegalStateException e) {
            e.printStackTrace();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
//        System.out.println("推送消息给客户端: "+ this.session.getMessageHandlers() + "，消息内容为：" + message);
    }

//    @PostMapping("/send2c")
//    public void sendMessage1(@RequestBody String message){
//        try {
//            this.session.getBasicRemote().sendText(message);
//        } catch (IOException e) {
//            throw new RuntimeException(e);
//        }
//        log.info("推送消息给客户端，消息内容为：{}", message);
//    }


    /**
     * 群发消息
     * @param message 消息
     */
    public void sendMessageToAll(String message){
        CopyOnWriteArrayList<GameSocket> ws = wsServers;
        for (GameSocket wsServer : ws){
            wsServer.sendMessage(message);
        }
    }

//    @PostMapping("/send2AllC")
//    public void sendMessageToAll1(@RequestBody String message){
//        CopyOnWriteArrayList<WsServer> ws = wsServers;
//        for (WsServer wsServer : ws){
//            wsServer.sendMessage(message);
//        }
//    }


}

