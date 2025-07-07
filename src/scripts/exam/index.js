var web_attributes = {}
var students = {}
for (const search of window.location.search.replace("?", "").split("&")) {
    const kv = search.split("=");
    web_attributes[kv[0]] = kv[1]
}
var data = {};
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
            window.exam = response['info'];
            window.exam_questions = response['questions'];
            window.i = 0;
            window.question_length = exam_questions.length;
            var question_area = document.getElementById("left");
            flush(question_area)
        }
    }
}
window.onload = function () {
    document.getElementById("next_part").onclick = ev => {
        if (i + 1 != question_length) {
            i++;
            flush(document.getElementById("left"))
        }
    };
    document.getElementById("previous_part").onclick = ev => {
        if (i != 0) {
            i--
            flush(document.getElementById("left"))
        }
    }
}
function flush(question_area) {
    question_area.innerHTML = '';
    document.getElementById("title_head").innerHTML = `${exam['name']} - ${exam['grade']}年级${exam['subject']}学科`
    document.getElementById("exam_name").innerHTML = `${exam['name']} - ${exam['grade']}年级${exam['subject']}学科`;
    document.getElementById("question_title").innerText = exam_questions[i].name;
    exam_questions[i]['questions'].forEach(question => {
        const question_id = question['id'];
        var inputGroup_html = '';
        switch (question['type']) {
            case 'choose':
                question['choose'].forEach(choose => {
                    inputGroup_html += `<div style="display: flex; flex-direction: row;gap: 2px;">
                        <input ${data[`${question_id}`] == choose ? "checked" : ""} type="radio" name="${question_id}" value="${choose}" id="${question_id}_${choose}" onclick="saveData(\`${choose}\`, ${question_id})">
                        <label for="${question_id}_${choose}">${choose}</label>
                        </div>`
                });
                break;
            case 'passage':
                inputGroup_html = `<div style="text-indent: 2em;"><p>${question['text'].replaceAll("\n", "</p><p>")}</p></div>
                `
                break;
            case 'html':
                fetch(`${window.location.protocol}//${window.location.host}/data/exam_data/${web_attributes['id']}/${question['html']}.html`).then(response => response.text().then(
                    data => {
                        console.log(data);

                        inputGroup_html = data.replaceAll("./", `/data/exam_data/${exam['id']}/`);

                        const question_html = `
                <div>
                    ${(question['type'] == 'passage' || question['type'] == 'html') ? `` : `<p>${question_id}. ${question['title'].replace("\n", "<br/>")}</p>`
                            }
                    <div style="display: flex; flex-direction: row;gap: 20px;">
                    ${inputGroup_html}
                    </div>
                </div>`
                        question_area.innerHTML = question_html + question_area.innerHTML;
                    }
                ));
                break;
            case "long_input":
                inputGroup_html = `<textarea style="text-indent: 2em;" id="${question_id}_textarea" oninput="saveData(document.getElementById('${question_id}_textarea').value, ${question_id})" rows="30" cols="150" placeholder="在此处输入你的答案"></textarea>`
                break;
        }
        const question_html = `
                <div>
                    ${(question['type'] == 'passage' || question['type'] == 'html') ? `` : `<p>${question_id}. ${
                        question["type"] == "short_input" ? question['title'].replace("\n", "<br/>").replace("______", `<input id="${question_id}_answer-area" oninput="saveData(document.getElementById('${question_id}_answer-area').value, ${question_id})" style="width: 15%" placeholder="在此处输入你的答案" value="${!!data[`${question_id}`]? data[`${question_id}`]: ""}">`) : question['title'].replace("\n", "<br/>")}</p>`
            }
                    <div style="${(question['type'] == 'passage' || question['type'] == 'html')? "": "display: flex;"} flex-direction: row;gap: 20px;">
                    ${inputGroup_html}
                    </div>
                </div>`
        question_area.innerHTML += question_html;
    })
}
function saveData(choose, id) {
    data[`${id}`] = choose;
}