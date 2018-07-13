var sql = require('mssql');
var express = require("express");
var app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");

var server = require("http").Server(app);
var io = require("socket.io")(server);
server.listen(process.env.PORT || 3000);

//check when have client connect to server
io.on("connection", function(socket){
  //do get data from sql server
  getEmp();
  console.log("some body connected: " + socket.id);

  //check when have client disconnect server
  socket.on("disconnect",function(){
    console.log(socket.id + " ngat ket noi !!!");
  });

  //listen when client send data to server
  socket.on("Client-send-data", function(data){
    console.log(data);
    //after recieve data from client A, server send data recieved to clientS
    io.sockets.emit("Server-send-data", data+"888");
  });
});

app.get("/", function(req, res){
  res.render("trangchu");
});

//config connect to database
var dbConfig = {
  server: "thanhthoiserver.ddns.net",
  database: "thanhthoi",
  user:"sa",
  password:"kingpro123",
  port:1433
};

function getEmp()
{
  var conn = new sql.ConnectionPool(dbConfig);
  var req = new sql.Request(conn);

  conn.connect(function(err){
    if(err){
      console.log("err");
      return;
    }
    req.query("SELECT TOP 5 * FROM BANGGIA", function(err, recordset){
      if(err)
      {
        console.log("err db");
      }
      else{
        //send data to client connect to server
        io.sockets.emit("Data-from-server",recordset);
      }
      conn.close();
    });
  });
}
