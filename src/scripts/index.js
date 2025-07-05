function referTo(event) {
    window.location.href = `./exam/?id=${event.target.getAttribute("exam-id")}`
}
const xmlHttpRequest = new XMLHttpRequest();
xmlHttpRequest.open("GET", window.location.protocol+"//"+window.location.host + "/data/exams.json");
xmlHttpRequest.send()
xmlHttpRequest.onload = function () {
    const response = JSON.parse(xmlHttpRequest.responseText);
    for (const exam of response) {
        var html = `
                <s-card clickable="true">
                    <div slot="headline">${exam['name']}</div>
                    <div slot="subhead">${exam['grade']}年级${exam['subject']}学科</div>
                    <s-button slot="action" onclick="referTo(event)" exam-id="${exam['id']}">开始测试</s-button>
                </s-card>
                `
        document.getElementById("all_exams").innerHTML += html;
    }
}