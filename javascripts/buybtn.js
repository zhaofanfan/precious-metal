function throttle(fn, delay) {
    var timer = null;
    return function() {
        clearTimeout(timer);
        timer = setTimeout(function() {
            fn();
        }, delay);
    }
};

window.setAmount = {
    init: function() {
        if (this.min = 1, this.max = 199, this.count = 1, this.disableAdd = !1, this.disableReduce = !0, this.$buyNum = $("#buy-num"), this.$buyBtn = $("#InitCartUrl"), this.$add = $("#choose-btns .btn-add"), this.$reduce = $("#choose-btns .btn-reduce"), this.matchCountKey = ["pcount", "pCount", "num", "buyNum"], this.$buyNum.length < 1) return !1;
        /debug=num/.test(location.href) && (this.$buyNum.attr("data-min", "5"), this.$buyNum.attr("data-max", "10"));
        var t = this.$buyNum.data("min"),
            i = this.$buyNum.data("max");
        i && (this.max = i), t && (this.min = t, this.count = t), this.checkLimit(), this.bindEvent()
    },
    bindEvent: function() {
        this.$buyNum.unbind("change keydown keyup").bind("change keydown keyup", throttle($.proxy(this.handleChange, this), 500))
    },
    disabledReduce: function(t) {
        this.disableReduce = !0, this.disableAdd = !1, this.$reduce.addClass("disabled"), this.$add.removeClass("disabled"), this.$add.attr("data-disabled", "1"), t ? this.$reduce.removeAttr("data-disabled") : this.$reduce.attr("data-disabled", "1")
    },
    disabledAdd: function(t) {
        this.disableAdd = !0, this.disableReduce = !1, this.$add.addClass("disabled"), this.$reduce.removeClass("disabled"), this.$reduce.attr("data-disabled", "1"), t ? this.$add.removeAttr("data-disabled") : this.$add.attr("data-disabled", "1")
    },
    enabledAll: function() {
        this.disableAdd = !1, this.disableReduce = !1, this.$reduce.removeClass("disabled").attr("data-disabled", "1"), this.$add.removeClass("disabled").attr("data-disabled", "1")
    },
    getVal: function() {
        return this.$buyNum.val()
    },
    setVal: function(t) {
        this.$buyNum.val(t)
    },
    checkLimit: function() {
        var t = this.$buyNum.data("min"),
            i = Number(this.getVal());
        i <= 1 && this.disabledReduce(), i >= this.max && this.disabledAdd(!0), i > 1 && i < this.max && this.enabledAll(), t && i === this.min && this.disabledReduce(!0)
    },
    isEmpty: function(t) {
        return "" == $.trim(t)
    },
    isFloat: function(t) {
        return Number(t) === t && t % 1 != 0
    },
    add: function() {
        var t = Number(this.getVal());
        return !this.disableAdd && !this.isEmpty(t) && (t > this.min && (this.disableReduce = !1), t >= this.max ? (this.setDisabled(this.$add), this.disableAdd = !0, !1) : (this.disableAdd = !1, this.setEnabled(this.$add), this.count++, this.setVal(this.count), this.checkLimit(), void this.setBuyLink()))
    },
    reduce: function() {
        var t = Number(this.getVal());
        return !this.disableReduce && !this.isEmpty(t) && (t < this.max && (this.disableAdd = !1), t <= this.min ? (this.setDisabled(this.$reduce), this.disableReduce = !0, !1) : (this.setEnabled(this.$reduce), this.disableReduce = !1, this.count--, this.setVal(this.count), this.checkLimit(), void this.setBuyLink()))
    },
    handleChange: function() {
        var t = this.getVal(),
            i = null;
        isNaN(Number(t)) || this.isEmpty(t) || this.isFloat(Number(t)) ? i = this.count : (t < this.min && (i = this.min, this.disabledReduce(1 !== i)), t > this.max && (i = this.max, this.disabledAdd(!0))), i ? (this.count = i, this.$buyNum.val(i)) : this.count = Number(t), this.setVal(this.count), this.checkLimit(), this.setBuyLink()
    },
    modify: function() {},
    setDisabled: function(t) {
        t.attr("data-disabled", 1)
    },
    setEnabled: function(t) {
        t.removeAttr("data-disabled")
    },
    setBuyLink: function() {
        var t = this;
        t.$buyBtn.each(function() {
            var i, e, s = $(this),
                n = s.attr("href"),
                a = n.split("?")[1];
            ! function() {
                for (var d = 0; d < t.matchCountKey.length; d++)
                    if (e = new RegExp(t.matchCountKey[d] + "=\\d+"), e.test(a)) return i = n.replace(e, t.matchCountKey[d] + "=" + t.count), s.attr("href", i), !1
            }()
        });
        // , e.fire({
        //     type: "onNumChange",
        //     count: this.count
        // })
    }
}, setAmount.init();