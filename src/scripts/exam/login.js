var web_attributes = {}
for (const search of window.location.search.replace("?", "").split("&")) {
    const kv = search.split("=");
    web_attributes[kv[0]] = kv[1]
}
const xmlHttpRequest = new XMLHttpRequest();
xmlHttpRequest.open("GET", window.location.protocol + "//" + window.location.host + `/data/exam_data/${web_attributes['id']}.json`);
xmlHttpRequest.send()
xmlHttpRequest.onload = function () {
    const response = JSON.parse(xmlHttpRequest.responseText);
    const exam = response['info'];
    window.exam_questions = response['questions'];
    document.getElementById("title_head").innerHTML = `${exam['name']} - ${exam['grade']}年级${exam['subject']}学科`
    document.getElementById("title_top").innerHTML = `${exam['name']}<br/>${exam['grade']}年级&nbsp;&nbsp;&nbsp;${exam['subject']}学科`
}
function input_student_id() {
    document.getElementById("content").innerHTML = `
        <p style="font-size: 30px;font-weight: bold;">请填写准考证号登录系统</p>
        <input placeholder="请在此输入准考证号" style="height: 10%;width: 40%;font-size: 1.25em;" id="exam_student_id">
        <div style="display: flex;flex-direction: row;gap: 50px;margin-top: 30px;">
            <button class="btn button_outlined" onclick='document.getElementById("exam_student_id").value = ""'>重填</button>
            <button class="btn button_filled" onclick="login()">进入</button>
        </div>
        <dialog style="border-radius: 20px;border: 2px solid red;" id="dialog">
            <h1 style="color: red;"></h1>
            <button class="btn" onclick='document.getElementById("dialog").open = false'>确定</button>
        </dialog>`;
}
function login() {
    const exam_student_id = document.getElementById("exam_student_id").value;
    var dialog = document.getElementById("dialog");
    if (exam_student_id.length == 0) {
        dialog.open = true;
        dialog.children[0].innerHTML = "请输入准考证号！"
    } else {
        xmlHttpRequest.open("GET", window.location.protocol + "//" + window.location.host + `/data/students.json`);
        xmlHttpRequest.send()
        xmlHttpRequest.onload = function () {
            const response = JSON.parse(xmlHttpRequest.responseText);
            for (const student of response) {
                if (student['id'] == exam_student_id) {
                    document.getElementById("content").innerHTML = `
        <p style="font-size: 30px;font-weight: bold;">请确认您的个人信息</p>
        <div>
            <p>姓名：${student['name']}</p>
            <p>准考证号：${student['id']}</p>
        </div>
        <div style="display: flex;flex-direction: row;gap: 50px;margin-top: 30px;">
        <button class="btn button_outlined" onclick="input_student_id()">重填</button>
        <button class="btn button_filled" onclick="startExam(${student['id']})">确认</button>
        </div>`
                    return;
                }
            }
            dialog.open = true;
            dialog.children[0].innerHTML = "准考证号不存在！"
        }
    }
}
input_student_id()
function startExam(id) {
    window.localStorage.setItem("student_id", id);
    window.location.href = '../?id=' + web_attributes['id']
}