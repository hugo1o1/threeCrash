var WebSocketServer = require("ws").Server,
  wss = new WebSocketServer({ port: 8088 }, () => {
    console.log("websocket 服务监听8088端口");
  });

// 连接池
var clients = [];

wss.on("connection", function(ws) {
  // 将该连接加入连接池

  clients.push(ws);
  ws.on("message", function(message) {
    // 广播消息
    console.log(message);

    clients.forEach(function(ws1) {
      if (ws1 !== ws) {
        ws1.send("收到");
      }
    });
  });

  ws.on("close", function(message) {
    // 连接关闭时，将其移出连接池
    clients = clients.filter(function(ws1) {
      return ws1 !== ws;
    });
  });
});
