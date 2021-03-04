var studentAdd = document.querySelector("#student-add");
var studentList = document.querySelector("#student-list");
var modal = document.querySelector('.modal');
var tableData = [];
var pageConfig = {
    nowPage: 1, //当前页码
    allPage: 1, //共有多少页
    pageSize: 1 //页容量
};
// 获取content区域一页最多显示多少条数据
var contentDom = getComputedStyle(document.querySelector('.content'));
pageConfig.pageSize = Math.floor((parseInt(contentDom.height) - 180) / 30);

// 查询配置
var selArr = ["sNo", "name", "email", "birth", "phone", "address"];
var preSelInfo = [false];

function okHttp(url, data, callback) {
    var res = saveData('http://open.duyiedu.com' + url, Object.assign({
        appkey: "manage111_1581347026589"
    }, data));
    if (res.status === 'fail') {
        alert(res.msg);
    } else {
        callback(res.data)
    }
}

function bindEvent() {
    // 导航栏点击事件
    var navlist = document.querySelector("nav");
    navlist.onclick = function(e) {
        var dom = e.target;
        if (dom.tagName !== "DD") {
            return false;
        }
        var actives = navlist.querySelector("dd.active");
        actives.classList.remove('active');
        dom.classList.add('active');
        if (dom.dataset.id === "student-add") {
            studentAdd.style.display = 'block';
            studentList.style.display = 'none';
        } else if (dom.dataset.id === "student-list") {
            studentAdd.style.display = 'none';
            studentList.style.display = 'block';
            getTableData();
        }
    }

    // 添加表单点击事件
    var studentAddBtn = document.querySelector("#student-add-btn");
    studentAddBtn.onclick = function(e) {
        e.preventDefault();
        var form = document.querySelector('#student-add-form');
        var data = getFormData(form);
        if (data) {
            okHttp('/api/student/addStudent', data, function(data) {
                alert('新增成功');
                var studentList = navlist.querySelectorAll("dd")[0];
                studentList.click();
                form.reset();
            })
        }
    }

    // 单个学生点击事件
    var tbody = document.querySelector("tbody");
    tbody.onclick = function(e) {
        var btn = e.target;
        if (btn.tagName !== "BUTTON") {
            return false;
        }
        var isEdit = btn.classList.contains('edit');
        var index = btn.dataset.index;

        if (isEdit) {
            modal.style.display = 'block';
            renderEditForm(tableData[index]);
        } else {
            var isDelete = confirm('确认删除？');
            // debugger
            if (isDelete) {
                okHttp('/api/student/delBySno', {
                    sNo: tableData[index]['sNo']
                }, function(data) {
                    alert('删除成功');
                    if (preSelInfo[0]) {
                        getTableData();
                    } else {
                        findStudent();
                    }
                })
            }
        }
    }

    // 编辑表单-->点击事件
    var studentEditBtn = document.querySelector('#student-edit-btn');
    studentEditBtn.onclick = function(e) {
        e.preventDefault();
        var form = document.querySelector('#student-edit-form');
        var data = getFormData(form);
        if (data) {
            okHttp('/api/student/updateStudent', data, function(data) {
                alert('修改成功');
                modal.style.display = 'none';
                if (preSelInfo[0]) {
                    getTableData();
                } else {
                    findStudent();
                }
            })
        }

    };

    //切换页点击事件
    var nextBtn = document.querySelector("#next-btn");
    var prevBtn = document.querySelector("#prev-btn");
    nextBtn.onclick = function() {
        pageConfig.nowPage++;
        if (!preSelInfo[0]) {
            getTableData();
        } else {
            findStudent();
        }
    };
    prevBtn.onclick = function() {
        pageConfig.nowPage--;
        if (!preSelInfo[0]) {
            getTableData();
        } else {
            findStudent();
        }
    };

    // 查询点击事件
    var findBtn = document.querySelector("#find-btn");
    findBtn.onclick = function(e) {
        var findInp = document.querySelector('#find-input');
        var select = document.querySelectorAll('select');
        var val = findInp.value;
        if (select[0].value == 0 && !(/^\d{4,16}$/.test(val))) {
            alert("学号为4-16数字组成");
            return false;
        }
        if (select[0].value == 2 && !(/\w+@\w+(\.(com|cn|net)){1,2}$/.test(val))) {
            alert('邮箱格式不正确');
            return false;
        }
        if (select[0].value == 3 && !(/^\d{4}$/.test(val))) {
            alert('出生年份格式有误');
            return false;
        }
        if (select[0].value == 4 && !(/^1\d{10}$/.test(val))) {
            alert("手机号格式错误");
            return false;
        }
        console.log(preSelInfo);
        preSelInfo[0] = true;
        preSelInfo[1] = select[0].value;
        preSelInfo[2] = select[1].value;
        preSelInfo[3] = val;
        findStudent();
    };

    modal.onclick = function() {
        modal.style.display = 'none';
    };
    var modalContent = document.querySelector(".modal-content");
    modalContent.onclick = function(e) {
        e.stopPropagation();
    }

    var refreshImg = document.querySelector(".find-img");
    refreshImg.onclick = function(e) {
        console.log("执行")
        preSelInfo[0] = false;
        getTableData();
    }
}


// 根据保存的数据查询
function findStudent() {
    var data = tableData.filter(function(item) {
        if (preSelInfo[2] == -1) {
            return item[selArr[preSelInfo[1]]] == preSelInfo[3];
        } else {
            if (item.preSelInfo[2] != sex) {
                return false;
            }
            return item[selArr[preSelInfo[1]]] == preSelInfo[3];
        }
    });
    pageConfig.allPage = Math.ceil(data.cont / pageConfig.pageSize);
    tableData = data;
    renderTable(data);
}


/**
 * 查询所有表单元素
 */
function getTableData() {
    okHttp('/api/student/findByPage', {
        page: pageConfig.nowPage,
        size: pageConfig.pageSize
    }, function(data) {
        pageConfig.allPage = Math.ceil(data.cont / pageConfig.pageSize);
        tableData = data.findByPage;
        renderTable(tableData || []);
    })
}

/**
 * 渲染studentList
 * @param {*} data 
 */
function renderTable(data) {
    var str = '';
    data.forEach(function(item, index) {
        str += `<tr>
                    <td>${item.sNo}</td>
                    <td>${item.name}</td>
                    <td>${item.sex === 0?"男":"女"}</td>
                    <td>${item.email}</td>
                    <td>${new Date().getFullYear()-item.birth}</td>
                    <td>${item.phone}</td>
                    <td>${item.address}</td>
                    <td>
                        <button class="btn edit" data-index=${index}>编辑</button>
                        <button class="btn delete" data-index="${index}">删除</button>
                    </td>
                </tr>`;
    });
    document.querySelector('tbody').innerHTML = str;
    var nextBtn = document.querySelector("#next-btn");
    var prevBtn = document.querySelector("#prev-btn");
    if (pageConfig.nowPage < pageConfig.allPage) {
        nextBtn.style.display = 'inline-block';
    } else {
        nextBtn.style.display = 'none';
    }

    if (pageConfig.nowPage > 1) {
        prevBtn.style.display = 'inline-block';
    } else {
        prevBtn.style.display = 'none';
    }
}

/**
 * 编辑表单--->数据回填
 * @param {*} data 
 */
function renderEditForm(data) {
    console.log("editdata=", data)
    var form = document.querySelector('#student-edit-form');
    for (var prop in data) {
        if (form[prop]) {
            form[prop].value = data[prop];
        }
    }
}

/**
 * 获取表单数据
 */
function getFormData(form) {
    var name = form.name.value;
    var sex = parseInt(form.sex.value);
    var sNo = form.sNo.value;
    var email = form.email.value;
    var address = form.address.value;
    var phone = form.phone.value;
    var birth = form.birth.value;
    if (!name || !email || !sNo || !address || !phone || !birth) {
        alert("信息填写不全,请检查后提交")
        return false;
    }
    if (!(/^\d{4,16}$/.test(sNo))) {
        alert("学号为4-16数字组成");
        return false;
    }
    if (!(/\w+@\w+(\.(com|cn|net)){1,2}$/.test(email))) {
        alert('邮箱格式不正确');
        return false;
    }
    if (!(/^\d{4}$/.test(birth))) {
        alert('出生年份格式有误');
        return false;
    }
    if (!(/^1\d{10}$/.test(phone))) {
        alert("手机号格式错误");
        return false;
    }
    return {
        sNo,
        name,
        sex,
        birth,
        phone,
        address,
        email
    };
}

bindEvent();
getTableData();