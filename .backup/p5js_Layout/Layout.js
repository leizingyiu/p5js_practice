// https://github.com/leizingyiu/p5js_Layout
// Created: 2022/03/04 16:54:00
// Last modified: "2022/06/15 16:40:10"

class Layout {
    constructor(str,
        settings = {
            font: textFont(),
            margin: 0,
            padding: 0,
            spacing: 0,
            left: 0,
            top: 0,
            width: width,
            height: height,
            l: 0,
            t: 0,
            w: width,
            h: height,
            rectmode: CENTER,
            textHorizAlign: CENTER,
            textVertAlign: CENTER,
            fillCell: ["width", "height"][1],
            defaultLayout: ['splitWordGrid', 'splitSentenceGrid', 'gridFillCeil', 'gridFillFloor'][0],
            letterFillFn: () => false,
            letterStrokeFn: () => false,
            rectFillFn: () => false,
            rectStrokeFn: () => false,
            textFillColor: '#fff',
            textStrokeColor: '',
            textStrokeWeight: 1,
            rectFillColor: '',
            rectStrokeColor: '',
            rectStrokeWeight: 1,
            drawingTarget: window
        }) {


        this.initArguments = [...arguments];

        this.init(str,
            settings);

        this.layoutType = '';
        this.layoutFuncs = ['splitGrid', 'splitWordGrid', 'splitSentenceGrid', 'gridFillCeil', 'gridFillFloor'];
    }


    defaultSettings(settings) {

        let defaultSetting = {
            font: textFont(),
            margin: 0,
            padding: 0,
            spacing: 0,
            left: 0,
            top: 0,
            width: window.innerWidth,
            height: window.innerHeight,
            l: 0,
            t: 0,
            w: window.innerWidth,
            h: window.innerHeight,
            rectmode: CENTER,
            textHorizAlign: CENTER,
            textVertAlign: CENTER,
            fillCell: (["none", "width", "height"][1]),
            defaultLayout: (['splitWordGrid', 'splitSentenceGrid', 'gridFillCeil', 'gridFillFloor'][0]),
            letterFillFn: () => false,
            letterStrokeFn: () => false,
            rectFillFn: () => false,
            rectStrokeFn: () => false,
            textFillColor: '#fff',
            textStrokeColor: '',
            textStrokeWeight: 1,
            rectFillColor: '',
            rectStrokeColor: '',
            rectStrokeWeight: 1,
            drawingTarget: window
        };

        if (arguments.length == 0) {
            return defaultSetting;
        }
        if (arguments.length != 1) {
            console.trace();
            console.warn('settings need a key:value object');
            return;
        }

        settings = Object.assign(defaultSetting, settings);

        if (settings.font instanceof p5.Font) {
            this.font = settings.font;
        } else if ((!(settings.font instanceof p5.Font)) && (typeof settings.font == 'string')) {
            if (settings.font != this.getDefaultFont()) {
                push();


                let sampleText = `1234567890+-*/=~!@#$%^&￥…():"{}[]|\?<>,.;'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ：。，、！？；《》—（）“”‘’【】_～―★『』`;
                textFont(' ');
                let w1 = textWidth(sampleText, 0, 0);
                textFont(settings.font);
                let w2 = textWidth(sampleText, 0, 0);


                if (w1 == w2) {
                    console.info(`textWidth of ${textFont(' ')} or ${this.getDefaultFont()} is ${w1},
textWidth of ${settings.font} is ${w2}`)
                    console.warn(`font ${settings.font} error: This is not the default font, nor can it be found in the system `);
                }
                pop();
            }
        } else {
            console.trace();
            console.warn('font "' + settings.font + '" error : need p5.font or system font name, load it in preload function');
        }

        if ([settings.spacing, settings.left, settings.top, settings.w, settings.h].some(i => (typeof i) != 'number')) {
            console.trace();
            console.warn('left, top, w, h, space error: ' + ['spacing', 'left', 'top', 'w', 'h'].filter(prop => typeof (settings[prop]) != 'number').map(p => `< ${p} : ${settings[p]} >`).join(', ') + ' is/are not number , please check');
        }

        if (['width', 'height', 'none'].indexOf(settings.fillCell) == -1) {
            console.trace();
            console.warn('fillCell input error: need "width", "height" or "none".');
        }
        //console.log(defaultSetting, '\n --------------- \n', settings);

        let sameKeysDict = {
            l: 'left',
            t: 'top',
            w: 'width',
            h: 'height'
        }
        Object.keys(sameKeysDict).map(k => {
            switch (true) {
                case settings[k] !== settings[sameKeysDict[k]]:
                    if ([settings[k], settings[sameKeysDict[k]]].every(v => v !== defaultSetting[k])) {
                        console.warn(`In the settings of arguments[1], the value of the short name "${k}" and the full name "${sameKeysDict[k]}" are different`)
                    } else {
                        [k, sameKeysDict[k]].map(prop => {
                            settings[prop] = [settings[k], settings[sameKeysDict[k]]].filter(v => v !== defaultSetting[k])[0];
                        });
                    }
                    break;
            }
        })

        return settings;
    }
    init(str,
        settings) {

        settings = this.defaultSettings(settings);

        this.target = settings.drawingTarget || window;

        this.settings = settings;

        if (typeof str == 'string') {
            this.str = str;
        } else {
            console.trace();
            console.warn(`str "${str}" error: need string`);
        }


        ['font', 'letterFillFn', 'letterStrokeFn', 'spacing', 'left', 'top', 'w', 'h', 'fillCell', 'rectmode', 'defaultLayout'].map(prop => {
            this[prop] = settings[prop];
        })


        this.margin = {
            "l": 0,
            "t": 0,
            "r": 0,
            "b": 0,
            "left": 0,
            "top": 0,
            "right": 0,
            "bottom": 0
        };
        this.padding = {
            "l": 0,
            "t": 0,
            "r": 0,
            "b": 0,
            "left": 0,
            "top": 0,
            "right": 0,
            "bottom": 0
        };

        this.setTRDLprop('margin', settings.margin);
        this.setTRDLprop('padding', settings.padding);

        this._length = this.str.length;

        this.W = this.w - this.margin.l - this.margin.r;
        this.H = this.h - this.margin.t - this.margin.b;

        this.letterPosArr = [];
        this.fontsize = this.h;

        this.row = 1, this.col = 1;
        this.rw = this.w / 2;
        this.ch = this.h / 2;

        this._rectmode = CENTER;
        this._textalign = [CENTER, CENTER];
        this.textalign = [settings.textHorizAlign, settings.textVertAlign];


        if (typeof this[this.defaultLayout] == 'function') {
            this[this.defaultLayout]();
        }

    }
    reInit() {
        this.init(...this.initArguments);
    }

    refresh() {
        this[this.layoutType]();
    }
    layoutFunc(type = this.layoutType) {

        if (type == '') {

            type = this.defaultLayout;
        }
        if (arguments.length == 1) {
            this.layoutType = type;
        }

        this[type]();
    }
    splitGrid(spliter = / /g,
        settings = {
            include_spliter: true,
            splitter_is_after: true
        }) {
        let defaultSettings = {
            include_spliter: true,
            splitter_is_after: true
        };
        if (Boolean(settings)) {
            settings = Object.assign(defaultSettings, settings);
        } else {
            settings = defaultSettings;
        }



        let strArr = [], continueArr = [];
        let regResult = [...this.str.matchAll(spliter)];
        let regResultIndexs = regResult.map(r => r.index);
        regResult.unshift(['']),
            regResult.push(['']);
        regResultIndexs.unshift(0),
            regResultIndexs.push(this.str.length);

        let sliceIdxs = [...new Array(regResultIndexs.length - 1)].map((i, idx) => idx);
        sliceIdxs = sliceIdxs.map((i) => [
            regResultIndexs[i] + (i == 0 ? 0 : regResult[i][0].length),
            regResultIndexs[i + 1]]);

        regResultIndexs.map((i, idx) => {
            for (let j = 0; j < regResult[idx][0].length; j++) {
                continueArr.push(i + j);
            }
        });

        let strObj = {};
        sliceIdxs.map((i, idx) => {
            strObj[idx] = {
                main: this.str.slice(...i),
                prefix: settings.splitter_is_after == false ? regResult[idx][0] : '',
                suffix: settings.splitter_is_after == true ? regResult[idx + 1][0] : [...new Array(regResult[idx + 1][0].length)].join(' ')
            }
        });
        sliceIdxs.map((i, idx) => {
            strArr[idx] = strObj[idx].prefix + strObj[idx].main + strObj[idx].suffix;
        });

        strArr = strArr.filter(i => i.replace(spliter, '').length != 0);

        if (settings.include_spliter == false) {
            strArr = strArr.map(s => s.replace(spliter, function () {
                return [...new Array(arguments[0].length + 1)].join(' ');
            }))
        }

        this.row = strArr.length;
        this.col = Math.max(...strArr.map(i => {
            if (settings.include_spliter == true) {
                return i.length;
            } else {
                return i.replace(/(^ *)|( *$)/g, '').length;
            }
        }));
        this.spacing = Math.min(this.spacing, this.W / (this.col - 1), this.H / (this.row));

        let w = (this.W - this.col * (this.padding.l + this.padding.r) - (this.col - 1) * this.spacing) / (this.col);
        let h = (this.H - this.row * (this.padding.t + this.padding.b) - (this.row - 1) * this.spacing) / (this.row);


        this.letterPosArr = [];
        strArr.map((s, idx, arr) => {

            s.split('').map((t, i, ar) => {
                textAlign(CENTER, CENTER);
                let totalIndex = idx == 0 ? i : (arr.filter((a, aidx) => aidx < idx).map(a => a.length).reduce((a, b) => a + b) + i);
                this.letterPosArr.push({
                    'continue': settings.include_spliter == false && (continueArr.includes(totalIndex)),
                    'part': s,
                    'letter': t,
                    'row': i,
                    'col': idx,

                    'x': this.left + this.margin.l +
                        (i + 1) * this.padding.l +
                        (i + 0.5) * w +
                        i * this.padding.r +
                        i * this.spacing,

                    'y': this.top + this.margin.t +
                        (idx + 1) * this.padding.t +
                        (idx + 0.5) * h +
                        idx * this.padding.b +
                        idx * this.spacing,

                    'w': w,
                    'h': h,
                    'width': w,
                    'height': h
                })
            });
        });
        // this.fontsize = h - this.padding.t - this.padding.b;
        this.fontsize = Math.min(h, this.fontsize);


    }
    splitWordGrid() {
        this.layoutType = 'splitWordGrid';

        this.splitGrid(/\s([ \.\n\s]*)/g, {
            include_spliter: false,
            splitter_is_after: true
        });
    }
    splitSentenceGrid() {
        this.layoutType = 'splitSentenceGrid';

        this.splitGrid(/[\.\n;]\s*/g, {
            include_spliter: true,
            splitter_is_after: true
        });
    }
    // splitWordBlock() {

    // }
    // splitSentenceBlock() {

    // }

    gridFill(type = 'floor') {
        this.layoutType = 'gridFill';

        textSize((12));
        let cellSize = this.font.textBounds('W', 0, 0);
        this.col = Math[type](Math.pow(this.str.length * (this.W / this.H) / (cellSize.w / cellSize.h), 0.5));
        this.row = Math.ceil(this.str.length / this.col);

        /**
         * let cellSize = titleFont.textBounds('O', 0, 0);
         * let a = Math.floor(Math.pow(str.length * (W / H) / (cellSize.w / cellSize.h), 0.5));
         * //let b = Math.ceil(Math.pow(str.length * (1 / (W / H)) / (1 / (cellSize.w / cellSize.h)), 0.5));
         * let b = Math.ceil(str.length / a);
    
         * 以每个字作为一个方格，字数则是整段话的面积
         * 
         * 改变文本框只改变宽高比，不会改变面积
         * 
         * 对面积乘除宽高比，是对整段话的文本框进行等比缩放，
         * 
         * 得到目标文本框的宽乘以宽的正方形，和目标文本框的高乘以高的正方形，
         * 
         * 分别面积开方之后，得到目标文本框的宽高分别多少行乘以多少列
         * 
         * 将宽高其中一个求得之后，可代入另一个式子运算。
         * 
         * 其中，除以单字宽高比，是将整段话的面积，调整到实际字体的宽高比
         * 
         */

        let gridArr = this.leftTopArr(this.row, this.col);

        this.spacing = Math.min(this.spacing, this.W / (this.col - 1), this.H / (this.row - 1));
        let w = (this.W - this.col * (this.padding.l + this.padding.r) - (this.col - 1) * this.spacing) / this.col;
        let h = (this.H - this.row * (this.padding.t + this.padding.b) - (this.row - 1) * this.spacing) / this.row;


        this.letterPosArr = gridArr.map((g, i, arr) => {

            let pos = {
                'part': this.str,
                'letter': this.str[i],
                'row': g.x,
                'col': g.y,

                'x': this.left + this.margin.l +
                    (g.x + 1) * this.padding.l +
                    (g.x + 0.5) * w +
                    g.x * this.padding.r +
                    g.x * this.spacing,

                'y': this.top + this.margin.t +
                    (g.y + 1) * this.padding.t +
                    (g.y + 0.5) * h +
                    g.y * this.padding.b +
                    g.y * this.spacing,

                'w': w,
                'h': h
            };
            return pos;
        });




        this.fontsize = h - this.padding.t - this.padding.b;

    }
    gridFillCeil() {

        this.gridFill('ceil');
        this.layoutType = 'gridFillCeil';
    }
    gridFillFloor() {

        this.gridFill('floor');
        this.layoutType = 'gridFillFloor';
    }

    // boundFill(type = 'floor') {
    //     //     let testFontSize = 100;
    //     //     textSize(testFontSize);

    //     //     let bound = this.font.textBounds(this.str, 0, 0);
    //     //     console.log(bound);

    //     //     // let vmin = Math.min(this.W, this.H);
    //     //     // let vmax = Math.max(this.W, this.H);
    //     //     // let shortN = Math.ceil(Math.pow(bound.w * bound.h * (vmax / vmin), 0.5));
    //     //     // let longN = Math.ceil(bound.w * bound.h / shortN);
    //     //     // console.log(shortN, longN);

    //     //     // this.fontsize = testFontSize * Math[type](Math.pow(((this.W * this.H) / (bound.w * bound.h)), 0.5));
    //     //     this.fontsize = testFontSize * Math.pow((this.W * this.H) / ((bound.w) * (bound.h)), 0.5);
    //     //     console.log(this.fontsize);

    //     //     let boundArr = [];
    //     //     push();
    //     //     let rowW = 0;
    //     //     textSize(this.fontsize);
    //     //     textAlign(LEFT, TOP);
    //     //     // this.str.split('').map((s, idx, ar) => {
    //     //     //     boundArr.push(this.font.textBounds(s,
    //     //     //         idx == 0 ? this.padding.l : boundArr[idx - 1].x + boundArr[idx - 1].w + this.padding.r + this.padding.l,
    //     //     //         0))
    //     //     // });

    //     //     this.str.split('').map((s, idx, ar) => {
    //     //         boundArr.push(this.font.textBounds(s,
    //     //             idx == 0 ? 0 : boundArr[idx - 1].x + boundArr[idx - 1].w,
    //     //             0))
    //     //     });


    //     //     let lineStartIdx = 0, row = 0;
    //     //     boundArr.map((b, idx, arr) => {
    //     //         let rightPoint = idx == 0 ? b.w - arr[lineStartIdx].x :
    //     //             this.letterPosArr[idx - 1].x + this.letterPosArr[idx - 1].w / 2
    //     //             + this.padding.r + this.padding.l
    //     //             + b.w;

    //     //         if (rightPoint > this.W) {
    //     //             row += 1;
    //     //             lineStartIdx = idx;
    //     //         }
    //     //         this.letterPosArr[idx] = {
    //     //             'row': row,
    //     //             'col': (idx - lineStartIdx),

    //     //             // 'x': this.margin.l
    //     //             //     + b.x + b.w / 2
    //     //             //     - arr[lineStartIdx].x +
    //     //             //     (idx - lineStartIdx + 1) * this.padding.l +
    //     //             //     (idx - lineStartIdx) * this.padding.r,

    //     //             'x': this.margin.l
    //     //                 + (idx == lineStartIdx ? this.padding.l + b.w / 2 :
    //     //                     this.letterPosArr[idx - 1].x + this.letterPosArr[idx - 1].w / 2 + this.padding.r + this.padding.l),

    //     //             'y': this.margin.t
    //     //                 + b.y + b.h / 2
    //     //                 + row * Math.max(...arr.map(a => a.h)),

    //     //             'w': b.w,
    //     //             'h': b.h
    //     //         };
    //     //     })

    //     //     console.log(boundArr);
    //     //     console.log(this.letterPosArr);


    //     //     // for (let i = 0; i < this.str.length; i++) {

    //     //     // }
    //     //     pop();
    //     //     return;


    //     //     let cellSize = this.font.textBounds('W', 0, 0);
    //     //     this.col = Math[type](Math.pow(this.str.length * (this.W / this.H) / (cellSize.w / cellSize.h), 0.5));
    //     //     this.row = Math.ceil(theStr.length / this.col);

    //     //     let gridArr = this.leftTopArr(this.row, this.col);
    //     //     // console.table(gridArr);

    //     //     let w = (this.W - this.col * (this.padding.l + this.padding.r)) / this.col;
    //     //     let h = (this.H - this.row * (this.padding.t + this.padding.b)) / this.row;

    //     //     this.letterPosArr = gridArr.map(g => {

    //     //         let pos = {
    //     //             'row': g.x,
    //     //             'col': g.y,
    //     //             'x': this.margin.l + (g.x + 1) * this.padding.l + (g.x + 0.5) * w + g.x * this.padding.r,
    //     //             'y': this.margin.t + (g.y + 1) * this.padding.t + (g.y + 0.5) * h + g.y * this.padding.b,
    //     //             'w': w,
    //     //             'h': h
    //     //         };
    //     //         return pos;
    //     //     });

    //     //     this.fontsize = h - this.padding.t - this.padding.b;
    // }

    show() {
        this.refresh();
        this.target.push();
        this.target.translate(this.left, this.top);

        this.target.rectMode(this.rectmode);
        this.target.textAlign(...this.textalign);
        this.target.textSize(this.fontsize);
        // textSize(12);

        this.target.noFill();
        this.target.noStroke();
        {
            this.target.push();
            if (this.settings.rectFillColor) {
                this.target.fill(this.settings.rectFillColor);
            }
            if (this.settings.rectStrokeColor && this.settings.rectStrokeWeight) {
                this.target.stroke(this.settings.rectStrokeColor);
            }
            this.rect();
            this.target.pop();
            this.target.push();
            if (this.settings.textFillColor) {
                this.target.fill(this.settings.textFillColor);
            }
            if (this.settings.textStrokeColor && this.settings.textStrokeWeight) {
                this.target.stroke(this.settings.textStrokeColor);
            }

            this.text();
            this.target.pop();
        }
        this.target.pop();
    }

    text() {
        this.target.push();
        this.target.rectMode(this.rectmode);
        this.target.textAlign(...this.textalign);
        this.target.textSize(this.fontsize);
        this.target.textFont(this.font);

        let x, y, w, h, bound;
        for (let i = 0; i < this.str.length; i++) {
            // console.log(this.str[i], this.letterPosArr[i]);
            if (this.letterPosArr[i].continue == true) {
                continue;
            }

            this.target.push();
            x = this.letterPosArr[i].x;
            y = this.letterPosArr[i].y;
            w = this.letterPosArr[i].w;
            h = this.letterPosArr[i].h;
            // [w, h] = [w, h].map(i => Math.max(i, 0));

            if (this.fillCell != 'none' && typeof this.font != 'string') {
                this.target.textSize(this.fontsize);
                bound = this.font.textBounds(this.str[i], 0, 0, this.fontsize, LEFT, TOP);

                switch (this.fillCell) {
                    case 'width':
                        this.target.textSize(this.fontsize * w / bound.w);
                        this.target.translate(bound.x * bound.w / w, 0);
                        break;
                    case 'height':
                        this.target.textSize(this.fontsize * h / bound.h);
                        this.target.translate(0, bound.y * bound.h / h);
                        break;
                    default:
                }
            }

            this.fillStyleFn = this.letterFillFn();
            this.strokeStyleFn = this.letterStrokeFn();
            if (this.fillStyleFn != false) {

                drawingContext.fillStyle = this.fillStyleFn({
                    x: x, y: y,
                    w: w, h: h,
                    width: w, height: h,
                    fontsize: this.fontsize
                });

            }
            if (this.strokeStyleFn != false) {
                drawingContext.strokeStyle = this.strokeStyleFn({
                    x: x, y: y,
                    w: w, h: h,
                    width: w, height: h,
                    fontsize: this.fontsize
                });
            }


            this.target.text(this.str[i], x, y);


            // console.log(x, y, this.str[i]);
            this.target.pop();
        }

        this.target.pop();
    }
    textToPoints(options = {
        sampleFactor: 5,
        simplifyThreshold: 0
    }) {
        let pointsArr = [];
        this.target.rectMode(this.rectmode);
        this.target.textAlign(...this.textalign);
        this.target.textSize(this.fontsize);


        let x, y, w, h, bound, size;
        for (let i = 0; i < this.str.length; i++) {
            this.target.push();
            x = this.letterPosArr[i].x;
            y = this.letterPosArr[i].y;
            w = this.letterPosArr[i].w;
            h = this.letterPosArr[i].h;
            [w, h] = [w, h].map(i => Math.max(i, 0));

            if (this.fillCell != 'none') {
                bound = this.font.textBounds(this.str[i], 0, 0, this.fontsize, LEFT, TOP);

                switch (this.fillCell) {
                    case 'width':
                        this.target.textSize(this.fontsize * w / bound.w);
                        size = this.fontsize * w / bound.w;
                        translate(bound.x * bound.w / w, 0);
                        break;
                    case 'height':
                        this.target.textSize(this.fontsize * h / bound.h);
                        size = this.fontsize * h / bound.h;
                        this.target.translate(0, bound.y * bound.h / h);
                        break;
                    default:
                }
            }
            // text(this.str[i], x, y);
            pointsArr.push(this.font.textToPoints(this.str[i], x, y, size, options));
            this.target.pop();
        }
        return pointsArr;
    }
    rect() {
        this.target.push();
        this.target.rectMode(this.rectmode);
        this.target.textAlign(...this.textalign);
        this.target.textSize(this.fontsize);
        let x, y, w, h;
        for (let i = 0; i < this.str.length; i++) {
            if (this.letterPosArr[i].continue == true) {
                continue;
            }

            x = this.letterPosArr[i].x;
            y = this.letterPosArr[i].y;
            w = this.letterPosArr[i].w;
            h = this.letterPosArr[i].h;
            [w, h] = [w, h].map(i => Math.max(i, 0));
            this.target.rect(x, y, w, h);
            // console.log(x, y, this.str[i]);
        }
        this.target.pop();
    }

    leftTopArr(a, b) {
        let result = [];
        for (let i = 0; i < a * b; i++) {
            let A = (i % b);
            let B = Math.floor(i / b);
            result[i] = {
                'x': A,
                'y': B
            };
        }

        return result;
    }


    centerPositionArr(a, b) {
        let result = [];
        for (let i = 0; i < a * b; i++) {
            let A = (i % a - (a - 1) / 2);
            let B = Math.floor(i / a) - (b - 1) / 2;
            result[i] = {
                'x': A,
                'y': B
            };
        }
        return result;
    }

    setTRDLprop(propertyName, input) {

        if (typeof input == 'number') {
            Object.keys(this[propertyName]).map(k => {
                this[propertyName][k] = input;
            });
        } else if (input instanceof Array && input.every(i => (typeof i) == 'number')) {
            switch (input.length) {
                case 1:
                    Object.keys(this[propertyName]).map(k => {
                        this[propertyName][k] = input[0];
                    });
                    break;
                case 2:
                    this[propertyName] = {
                        "l": input[1],
                        "t": input[0],
                        "r": input[1],
                        "b": input[0],
                        "left": input[1],
                        "top": input[0],
                        "right": input[1],
                        "bottom": input[0]
                    }
                    break;
                case 3:
                    this[propertyName] = {
                        "l": input[1],
                        "t": input[0],
                        "r": input[1],
                        "b": input[2],
                        "left": input[1],
                        "top": input[0],
                        "right": input[1],
                        "bottom": input[2]
                    }
                    break;
                case 4:
                    this[propertyName] = {
                        "l": input[3],
                        "t": input[0],
                        "r": input[1],
                        "b": input[2],
                        "left": input[3],
                        "top": input[0],
                        "right": input[1],
                        "bottom": input[2]
                    }
                    break;
                default:
                    console.trace();
                    console.warn('margin error: need 1 to 4 numbers');
            }
        } else {
            console.trace();
            console.warn('margin error: need number array or number');
        }

    }

    set rectmode(mode) {
        switch (mode) {
            case 'corner':
                this._rectmode = CORNER;
                break;
            case 'corners':
                this._rectmode = CORNERS;
                break;
            case 'center':
                this._rectmode = CENTER;
                break;
            case 'radius':
                this._rectmode = RADIUS;
                break;
            default:
                console.trace();
                console.warn('rectmode input error: need one of CORNER , CORNERS , CENTER , RADIUS');
        }
        this.target.rectMode(this._rectmode);
    }
    get rectmode() {
        return this._rectmode;
    }


    set textalign([textHorizAlign, textVertAlign] = [CENTER, CENTER]) {
        switch (textHorizAlign) {
            case 'left':
                this._textalign[0] = LEFT;
                break;
            case 'center':
                this._textalign[0] = CENTER;
                break;
            case 'right':
                this._textalign[0] = RIGHT;
                break;
            default:
                console.trace();
                console.warn('textHorizAlign input error: need one of LEFT , CENTER , RIGHT');
        }
        switch (textVertAlign) {
            case 'top':
                this._textalign[1] = TOP;
                break;
            case 'bottom':
                this._textalign[1] = BOTTOM;
                break;
            case 'center':
                this._textalign[1] = CENTER;
                break;
            case 'baseline':
                this._textalign[1] = BASELINE;
                break;
            default:
                console.trace();
                console.warn('textVertAlign input error: need one of TOP , BOTTOM , CENTER , BASELINE');
        }
        this.target.textAlign(...this._textalign);
    }
    get textalign() {
        return this._textalign;
    }

    getDefaultFont() {
        let style = window.getComputedStyle(drawingContext.canvas);
        var defaultFont = style.getPropertyValue('font-family');
        return defaultFont;
    }

    // setMode(rectMode, textHorizAlign, textVertAlign) {
    //     if ([rectMode, textHorizAlign, textVertAlign].every(s => typeof s == 'string')) {

    //         switch (textHorizAlign) {
    //             case 'left':
    //                 this.textalign[0] = LEFT;
    //                 break;
    //             case 'center':
    //                 this.textalign[0] = CENTER;
    //                 break;
    //             case 'right':
    //                 this.textalign[0] = RIGHT;
    //                 break;
    //             default:
    //                 throw ('textHorizAlign input error: need one of LEFT , CENTER , RIGHT');
    //         }
    //         switch (textVertAlign) {
    //             case 'top':
    //                 this.textalign[1] = TOP;
    //                 break;
    //             case 'bottom':
    //                 this.textalign[1] = BOTTOM;
    //                 break;
    //             case 'center':
    //                 this.textalign[1] = CENTER;
    //                 break;
    //             case 'baseline':
    //                 this.textalign[1] = BASELINE;
    //                 break;
    //             default:
    //                 throw ('textVertAlign input error: need one of TOP , BOTTOM , CENTER , BASELINE');
    //         }
    //     }
    // }
}

