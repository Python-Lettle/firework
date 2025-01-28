var last_name_temp = "";
var myname = prompt("你的名字是：");
var myId = String(Math.floor(random(100000,999999)));
if (myname === undefined || myname === null) {
    myname = myId;
}
last_name_temp = myname;

$("#username").val(myname);
$("#username").on("change", function () {
    myname = $(this).val();
});

$("#submitName").on("click", function () {
    ws.send(JSON.stringify({
        "type" : "bindname",
        "username" : myname
    }));
    alert("更改成功");
});
