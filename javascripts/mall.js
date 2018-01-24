/**
 * @authors brucezhao
 * @date    2017-08-25 10:06:21
 * @version 1.0
 */
var _ROOT = "/jy";
// var _ROOT = "http://120.24.58.202:7070/jy";
var AJAX_RESCODE = {
    SUCCESS_CODE: 1,
    ERROR_CODE: 0
}
var PAGE_SIZE = 16;
var API_INTERFACE = {
    TOLOGIN: _ROOT + "/home/toHomePage.xp",
    GETLOGININFO: _ROOT + "/jy/getLoginInfo.xp",
    GETGOODS: _ROOT + "/jy/getGoods.xp",
    SEARCHGOODS: _ROOT + "/jy/searchGoods.xp",
    GETADDRESS: _ROOT + "/jy/getAddress.xp",
    PAYORDER: _ROOT + "/jy/payOrder.xp",
    GETORDERDETAIL: _ROOT + "/jy/getOrderDetail.xp?ORDERID=%(ORDERID)",
    GETGOODDETAIL: _ROOT + "/jy/getGoodDetail.xp?ORDERID=%(ORDERID)"
}
var g_jsonpEnabled = true;

function getOrderParams() {
    var formData = {
        GOODSID: $.trim($("#GOODSID").data("goodsid")),
        NUM: $.trim($("#NUM").text()),
        PICKTYPE: $.trim($("#PICKTYPE").text()),
        AMOUNT: $.trim($("#AMOUNT").data("amount")),
        ADDRESS: $.trim($("#ADDRESS").text())
    };
    // formData.TAXTYPE = $("#J_tabBox .tab-hd a.active").text();
    var _taxType = $("#J_tabBox .tab-hd a.active").index();
    formData.TAXTYPE = _taxType;
    if (_taxType == 1) {
        if ($("#personalInvoiceInput").hasClass("focus")) {
            formData.TAXNAME = $("#personalInvoiceInput").val();
        } else {
            formData.TAXNAME = $("#companyInvoiceInput").val();
            formData.TAXPLAYERID = $("#TAXPAYERID").val();
        }
        formData.TAXNUM = $("#buy-num").val()
    } else if (_taxType == 2) {
        formData.TAXCOMPYNAME = $("#TAXCOMPYNAME").val();
        formData.TAXPLAYERID = $("#TAXPAYERID").val();
        formData.TAXNUM = $("#buy-num").val()
    }
    formData.RECEIVER = $("#RECEIVER").val();
    formData.TEL = $("#TEL").val();
    return formData;
}

function payOrder() {
    var formData = getOrderParams(),
        _oValidateRules = {
            TAXNAME: "公司发票抬头",
            TAXPLAYERID: "纳税人识别号",
            TAXCOMPYNAME: "单位名称",
            RECEIVER: "收货人",
            TEL: "手机号码"
        };
    if (commonValidate(formData, _oValidateRules)) {
        if (!isValidMobile(formData.TEL)) {
            toast("手机号码不合法");
            return;
        }
        formData.REMARK = $("#REMARK").val();
        ajaxReq(API_INTERFACE.PAYORDER, formData, function(res) {
            window.location.href = "complete.html?ORDERID=" + res.singleData.ORDERID
        }, g_jsonpEnabled);
    }
}

function searchGoods(url, params) {
    function resolve(res) {
        if (params.key) {
            $("#J_searchKeywords").text("“" + params.key + "”");
            $("#J_relCount").text(res.pageQuery.totalCount);
        }
        var html = template("goods_tmpl", res);
        $("#J_goodsList .gl-warp").html(html);
        $("#J_goodsList .gl-item").each(function() {
            var _$a = $(".p-img a", this);
            var _oriHref = _$a.attr("href");
            _$a.attr("href", _oriHref + "&keywords=" + params.key);
        });

        $("#J_bottomPage").createPage({
            pageNum: res.pageQuery.totalPage, //总页码
            current: res.pageQuery.pageIndex, //当前页
            shownum: 7, //每页显示个数
            // activepage: "",//当前页选中样式
            // activepaf: "",//下一页选中样式
            backfun: function(obj) {
                params.pageIndex = obj.current;
                searchGoods(url, params)
            }
        });
    }
    params.pageIndex = params.pageIndex || 1;
    params.pageSize = PAGE_SIZE;
    ajaxReq(url, params, resolve, g_jsonpEnabled);
}

function getGoods() {
    ajaxReq(API_INTERFACE.GETGOODS, {
        GOODSID: getUrlParam("GOODSID")
    }, function(res) {
        if (res.data && res.data.length) {
            var _oGoods = res.data[0];
            for (var field in _oGoods) {
                $("#" + field).data(field, _oGoods[field])
                    .text(_oGoods[field]);
                $('[name="' + field + '"]').data(field, _oGoods[field])
                    .text(_oGoods[field]);
            }
            $(".J_NAME").text(_oGoods.NAME);
            $("#PIC").attr("src", _oGoods.PIC);
            $("#TITLEPIC").attr("src", _oGoods.TITLEPIC);
            var num = parseInt($("#NUM").text(), 10);
            var price = parseFloat(_oGoods.PRICE);
            $("#GOODSID").data("goodsid", _oGoods.ID);
            var amount = Number(num * price).toFixed(2);
            $("#AMOUNT").data("amount", amount).text("￥" + amount);
        }
    }, g_jsonpEnabled);
}

function getGoodDetail() {
    ajaxReq(API_INTERFACE.GETGOODDETAIL, {
        GOODSID: getUrlParam("GOODSID")
    }, function(res) {
        if (res.data && res.data.length) {
            var html = "",
                _aImgs = res.data;
            for (var i = 0, len = _aImgs.length; i < len; i++) {
                html += '<img src="' + _aImgs[i].URL + '" style="max-width: 900px;margin-top: 20px;" alt="" />';
            }
            $("#J_detailWrap").html(html);
        }
    }, g_jsonpEnabled);
}

function getAddress() {
    ajaxReq(API_INTERFACE.GETADDRESS, null, function(res) {
        if (res.data && res.data.length) {
            var _oPoint = res.data[0];
            $("#POINTBANK").text(_oPoint.POINTBANK);
            $("#ADDRESS").text(_oPoint.ADDRESS);
            $("#RECEIVER").val(_oPoint.NAME);
            $("#TEL").val(_oPoint.TELPHONE);
        }
    }, g_jsonpEnabled);
}

function getOrderDetail() {
    var ORDERID = getUrlParam("ORDERID");
    !ORDERID || ajaxReq(API_INTERFACE.GETORDERDETAIL.jstpl_format({
        ORDERID: ORDERID
    }), null, function(res) {
        if (res.singleData) {
            var _oOrder = res.singleData;
            $("#GOODSNAME").text(_oOrder.GOODSNAME || "");
            $("#AMOUNT").text(_oOrder.AMOUNT || 0);
            $("#RECEIVER").text(_oOrder.RECEIVER || "");
            $("#TEL").text(_oOrder.TEL || "");
            $("#ORDERID").text(ORDERID);
        }
    }, g_jsonpEnabled);
}

function getLoginInfo() {
    ajaxReq(API_INTERFACE.GETLOGININFO, null, function(res) {
        if (res.singleData) {
            var _oUser = res.singleData;
            $("#USERNAME").removeClass("hide")
                .find("span").text(_oUser.USERNAME);
            $("#LOGIN").addClass("hide");
        }
    }, g_jsonpEnabled);
}

$(function() {
    getLoginInfo();
    $(".link-login, .link-order a").attr("href", window.API_INTERFACE.TOLOGIN);
});

function ajaxReq(url, data, successfn, jsonp, errorfn, beforefn, method) {
    data = data || { timestamp: new Date().getTime() };
    var ajaxSetting = {
        url: url,
        type: method || "post",
        data: data,
        contentType: "application/x-www-form-urlencoded;charset=utf-8",
        dataType: "json",
        beforeSend: function() {
            beforefn ? beforefn() : showLoading();
        },
        success: function(res) {
            if (res && res.statusCode == AJAX_RESCODE.SUCCESS_CODE) {
                successfn(res);
            } else {
                toast(res.statusMsg)
            }
        },
        error: function(e) {
            !errorfn || errorfn(e);
        },
        complete: function(xhr, textStatus) {
            $("#loadingDiv").addClass("hide");
            if (window.location.href.indexOf("order-confirm.html") != -1) {
                var sessionStatus = xhr.getResponseHeader("sessionstatus");
                if (sessionStatus == "timeout") {
                    // 会话超时
                    toast("登录已失效，请重新登录！即将跳转到登录页面...");
                    setTimeout(function() {
                        window.location.href = window.API_INTERFACE.TOLOGIN;
                    }, 2500);
                }
            }
        }
    }
    if (jsonp) {
        ajaxSetting.dataType = "jsonp";
        ajaxSetting.jsonp = "jsonpCallback";
    }
    $.ajax(ajaxSetting)
};

function commonValidate(formData, _oValidateRules) {
    var _bIsCompleted = true,
        msg = null;
    for (var field in formData) {
        if (!$.trim(formData[field])) {
            msg = "请填写" + _oValidateRules[field];
            _bIsCompleted = false;
            toast(msg);
            break;
        }
    }
    return _bIsCompleted;
}

function isValidMobile(mobile) {
    return /^1[34578]\d{9}$/.test(mobile);
};

function showLoading() {
    if (!$("#loadingDiv").length) {
        var loadingDiv = document.createElement("div");
        loadingDiv.id = "loadingDiv";
        loadingDiv.setAttribute("class", "loading-wrap");
        loadingDiv.innerHTML = '<div class="loading"></div>';
        document.body.appendChild(loadingDiv)
    }
    $("#loadingDiv").removeClass("hide")
}

(function(_win) {
    var toastTimer = null;
    _win.toast = function(str) {
        if (!$("#toast").length) {
            var toast = document.createElement("div");
            toast.id = "toast";
            toast.setAttribute("class", "toast");
            toast.onclick = function() {
                $(this).removeClass("shown")
            };
            document.body.appendChild(toast)
        }
        if (toastTimer) clearTimeout(toastTimer);
        $("#toast").text(str).addClass("shown");
        $("#toast").css({
            "margin-left": -$("#toast").outerWidth() / 2 + "px",
            "margin-top": -$("#toast").outerHeight() / 2 + "px"
        });
        toastTimer = setTimeout(function() {
            $("#toast").removeClass("shown")
        }, 3E3)
    };
})(window);

// 获取 url 中的 QueryString 值
function getUrlParam(name, url) {
    var r = new RegExp("(\\?|#|&)" + name + "=(.*?)(#|&|$)");
    var m = (url || location.href).match(r);
    return decodeURIComponent(m ? m[2] : "")
};

// 设定 url 中的 QueryString 值
function setUrlParam(param, v, url) {
    url = url || location.href;
    var re = new RegExp("(\\?|&)" + param + "=([^&]+)(&|$)", "i");
    var m = url.match(re);
    if (m) {
        return url.replace(re, function($0, $1, $2) {
            return $0.replace($2, v);
        });
    } else {
        if (url.indexOf('?') == -1)
            return (url + '?' + param + '=' + v);
        else
            return (url + '&' + param + '=' + v);
    }
}

String.prototype.jstpl_format = function(ns) {
    function fn(w, g) {
        if (g in ns)
            return ns[g];
        return '';
    };
    return this.replace(/%\(([A-Za-z0-9_|.]+)\)/g, fn);
};

MOCK_DATA = {
    "statusCode": "1",
    "statusMsg": "",
    "type": null,
    "redirectUrl": null,
    "singleData": null,
    "data": [{
        "METACLASSNAME": "PUREFAN.JY.G.GOODS",
        "FSN": 1,
        "PRICE": 1.0,
        "NAME": "1",
        "JLAMOUNT": 1.0,
        "PIC": "1",
        "SELLSERVICEFEE": 1.0,
        "BUYTYPE_DISPVALUE": "预约购买",
        "SKU": "1",
        "SERIES": "1",
        "MQ": "1",
        "SALEAMOUNT": null,
        "CREATEDATE": "2017-08-20 21:51:37",
        "VERSION": 0,
        "WEIGHT": 1,
        "ZSFL": "1",
        "TITLEPIC": "http://www.jq22.com/demo/jQueryViewer20160329/img/thumbnails/tibet-1.jpg",
        "ID": "d7c5d3fc5ea34302a06f617b9aafd7ac",
        "BUYTYPE": "1",
        "TYPE_DISPVALUE": "纸黄金",
        "MODIFYDATE": "2017-08-20 21:51:37",
        "TYPE": "1"
    }],
    "totalCount": "0",
    "pageQuery": null
}