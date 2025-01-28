// messages.js
// 管理与服务器通信部分

// 示例：从服务端接收消息并显示在消息框中
function getIcon(iconname) {
    return '<img class="messageState" src="/fonts/'+iconname+'.svg" />';
}
function receiveMessageFromServer(message, iconname) {
    var messageBox = document.getElementById('messageBox');
    if (iconname !== undefined) {
        messageBox.innerHTML += '<p>' + message + '</p>' + getIcon(iconname) + '<br>';
    } else {
        messageBox.innerHTML += '<p>' + message + '</p>' + '<br>';
    }
    messageBox.scrollTop = messageBox.scrollHeight; // 滚动到消息框底部以显示新消息
}


// 示例调用
$("#mini").click(function () {
    $("#messageBox").css("display", "none");
    $("#messageBtn").css("display", "block");
    $("#mini").css("display", "none")
})

$("#messageBtn").click(function () {
    $("#messageBox").css("display", "block");
    $("#messageBtn").css("display", "none");
    $("#mini").css("display", "block")
})

// WebSocket部分
// 判断浏览器是否支持WebSocket
var supportsWebSockets = 'WebSocket' in window || 'MozWebSocket' in window;
if (supportsWebSockets) {
    //建立WebSocket连接（ip地址换成自己主机ip）

    var ws = new WebSocket("ws://127.0.0.1:8092/websocket/"+myId);
    ws.onopen = function(msg){
        // 初始化服务端 id-username
        ws.send(JSON.stringify({
            "type" : "bindname",
            "username" : myname
        }));
    }
    ws.onmessage = function(e){
        //当客户端收到服务端发来的消息时，触发onmessage事件，参数e.data包含server传递过来的数据
        var data = JSON.parse(e.data);

        if (data['type'] === "connection") {
            receiveMessageFromServer(data['msg']);

        } else if (data['type'] === "firework") {
            var firework_info = JSON.parse(data['firework']);
            if (firework_info['username'] !== myname) {
                fireworks.push(new Firework(cw / 2, ch, random(0, cw), random(0, ch / 2)));
            }
            receiveMessageFromServer(firework_info['username'] + getIcon("firework"));

        } else if (data['type'] === "newuser") {
            receiveMessageFromServer(data['username'] + getIcon("join"));

        } else if (data['type'] === "leave") {
            receiveMessageFromServer(data['username'] + getIcon("quit"));
        }
    }
    ws.onclose = function(e){
        //当客户端收到服务端发送的关闭连接请求时，触发onclose事件
        receiveMessageFromServer("已断开连接");
        ws.send(JSON.stringify({"type" : "leave", "username" : myname}));
    }
    ws.onerror = function(e){
        //如果出现连接、处理、接收、发送数据失败的时候触发onerror事件
        console.log("websocket发生错误"+e);
    }
}else{
    alert("您的浏览器不支持 WebSocket!");
}


