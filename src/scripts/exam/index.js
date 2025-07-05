var web_attributes = {}
var students = {}
for (const search of window.location.search.replace("?", "").split("&")) {
    const kv = search.split("=");
    web_attributes[kv[0]] = kv[1]
}
const xmlHttpRequest = new XMLHttpRequest();
xmlHttpRequest.open("GET", window.location.protocol + "//" + window.location.host + `/data/students.json`);
xmlHttpRequest.send()
xmlHttpRequest.onload = function () {
    const config = JSON.parse(this.responseText);
    config.forEach(student => {
        students[`${student['id']}`] = student['name']
    });
    const student_id = window.localStorage.getItem("student_id");

    if (!student_id) {
        window.location.href = './login/?reason=login_unavailable&id=' + web_attributes['id']
    } else if (Object.keys(students).indexOf(student_id) == -1) {
        window.location.href = './login/?reason=unknown_student&id=' + web_attributes['id']
    } else {
        document.getElementById("student_name").innerText += students[student_id]
        document.getElementById("student_id").innerText += student_id
        xmlHttpRequest.open("GET", window.location.protocol + "//" + window.location.host + `/data/exam_data/${web_attributes['id']}.json`);
        xmlHttpRequest.send()
        xmlHttpRequest.onload = function () {
            const response = JSON.parse(xmlHttpRequest.responseText);
            const exam = response['info'];
            const exam_questions = response['questions'];
            var i = 0;
            document.getElementById("title_head").innerHTML = `${exam['name']} - ${exam['grade']}年级${exam['subject']}学科`
            document.getElementById("exam_name").innerHTML = `${exam['name']} - ${exam['grade']}年级${exam['subject']}学科`;
            document.getElementById("question_title").innerText = exam_questions[i].name;
            var question_area = document.getElementById("left");
            exam_questions[i]['questions'].forEach(question => {
                const question_id = exam_questions[i]['questions'].indexOf(question);
                var inputGroup_html = '';
                switch (question['type']) {
                    case 'choose':
                        question['choose'].forEach(choose => {
                            inputGroup_html += `<div style="display: flex; flex-direction: row;gap: 2px;">
                        <input type="radio" name="${question_id + 1}" value="${choose}" id="${choose}">
                        <label for="${choose}">${choose}</label>
                        </div>`
                        });
                        break;
                }
                const question_html = `
                <div>
                    <p>${question_id + 1}. ${question['title'].replace("\n", "<br/>")}</p>
                    <div style="display: flex; flex-direction: row;gap: 20px;">
                    ${inputGroup_html}
                    </div>
                </div>`
                question_area.innerHTML += question_html;
            })
            question_area.innerHTML += `
                    <div style="width: 100%; height: 10vh"></div>`
        }
    }
}