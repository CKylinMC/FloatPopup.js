(function () {
    const domHelper = (tagName = 'div', options = {}) => {
        let el;
        if(options.from){
            if(options.from instanceof HTMLElement){
                el = options.from;
            }else if(typeof(options.from)=="string"){
                els = domHelper(tagName,{html:options.from});
                if(els.childElementCount===0){
                    el = document.createElement(tagName);
                }else if(els.childElementCount===1){
                    el = els.firstElementChild;
                }else{
                    el = els;
                }
            }
        } else el = document.createElement(tagName);
        if (options.id) el.id = options.id;
        if (options.html) el.innerHTML = options.html;
        if (options.text) el.innerText = options.text;
        if (options.attr) {
            for(const ak of Object.keys(options.attr)){
                el.setAttribute(ak,options.attr[ak]);
            }
        }
        if (options.assign) {
            Object.assign(el, options.assign);
        }
        if (options.style) Object.assign(el.style, options.style);
        if (options.css) Object.assign(el.style, options.css);
        if (options.childs) {
            if(options.childs instanceof Array) options.childs.filter(el=>!!el).forEach(child => {
                if(child instanceof HTMLElement) el.appendChild(child);
                else el.appendChild(document.createTextNode(child));
            });
            else if(options.childs instanceof HTMLElement) el.appendChild(options.childs);
            else el.appendChild(document.createTextNode(options.childs));
        }
        if(options.classnames) {
            if(options.classnames instanceof Array) options.classnames.forEach(classname => {
                el.classList.add(classname);
            });
            else el.classList.add(...options.classnames.split(" "));
        }
        if(options.on) {
            for(let listenerName of Object.keys(options.on)) {
                el.addEventListener(listenerName, options.on[listenerName]);
            }
        }
        if (options.append && options.append instanceof HTMLElement) options.append.appendChild(el);
        if (options.init && options.init instanceof Function) options.init(el);
        if (options.initAsync && options.initAsync instanceof Function) {
            return options.initAsync(el).then(() => el);
        }
        return el;
    }
    class _{
        static get(q,p=document){
            return p.querySelector(q);
        }
        static getAll(q,p=document,asArray = true){
            const res = p.querySelectorAll(q);
            if (asArray) return [...res];
            else return res;
        }
        static wait(ms=0){
            return new Promise(r => setTimeout(r, ms));
        }
        static GUID() {
            var S4 = function() {
               return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
            };
            return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
        }
        static ShortID() {
            var S4 = function() {
               return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
            };
            return (S4()+S4()+S4()+S4());
        }
    }
    class FloatPopup{
        static zIndex = 999000;
        static getZIndex() {
            return FloatPopup.zIndex++;
        }
        static lastInstance = null;

        static alert(title,content,btntxt='确定'){
            return new Promise(r => {
                const fw = new FloatPopup();
                fw.setTitle(title)
                    .setCloseCallback(r)
                    .setContents(content)
                    .setFooterElements(domHelper('div', {
                        classnames: 'ckfp-btns',
                        childs: domHelper('button', {
                            classnames: 'ckfp-btn',
                            text: btntxt,
                            on: {
                                click: (e)=>{
                                    fw.hide();
                                }
                            }
                        })
                    }))
                    .show();
            })
        }

        static confirm(title,content,btnoktxt='是',btnnotxt='否'){
            return new Promise(r => {
                const fw = new FloatPopup();
                fw.setTitle(title)
                    .setCloseCallback(r)
                    .setContents(content)
                    .setFooterElements(domHelper('div', {
                        classnames: 'ckfp-btns',
                        childs: [
                            domHelper('button', {
                                classnames: 'ckfp-btn',
                                text: btnoktxt,
                                on: {
                                    click: (e)=>{
                                        fw.hide(true);
                                    }
                                }
                            }),
                            domHelper('button', {
                                classnames: 'ckfp-btn',
                                text: btnnotxt,
                                on: {
                                    click: (e)=>{
                                        fw.hide(false);
                                    }
                                }
                            })
                        ]
                    }))
                    .show();
            })
        }

        static prompt(title, content, placeholder = '输入...', btnoktxt = '确定') {
            const inputid = 'CKP-'+_.ShortID();
            return new Promise(r => {
                const fw = new FloatPopup();
                fw.setTitle(title)
                    .setCloseCallback(r)
                    .setContents(content)
                    .setFooterElements(domHelper('div', {
                        classnames: 'ckfp-btns',
                        childs: [
                            domHelper('input', {
                                css: {
                                    'width': '95%',
                                    'flex': 'none',
                                    'font-size': 'larger',
                                    'margin': '5px auto',
                                    'padding': '5px 3px',
                                },
                                id: inputid,
                                attr: {
                                    placeholder
                                }
                            }),
                            domHelper('button', {
                                classnames: 'ckfp-btn',
                                text: btnoktxt,
                                on: {
                                    click: (e)=>{
                                        fw.hide(_.get('#'+inputid).value);
                                    }
                                }
                            })
                        ]
                    }))
                    .show();
            })
        }

        constructor() {
            FloatPopup.lastInstance = this;
            this.guid = _.GUID();
            this.closeable = true;
            this.initDom();
            this.closeCallback = null;
        }
        initDom() {
            if (this.container) {
                if (this.dcontainerom.instance) {
                    this.container.instance.hide();
                }
                this.container.remove();
            }
            const bwz = FloatPopup.getZIndex();
            const domz = FloatPopup.getZIndex();
            this.dom = domHelper('div', {
                attr: {
                    'ckfpinstanceid': this.guid
                },
                childs: [
                    domHelper('div', {classnames: 'ckfp-transparent-layer'}),
                    domHelper('div', {classnames: 'ckfp-header'}),
                    domHelper('div', {classnames: 'ckfp-content'}),
                    domHelper('div', {classnames: 'ckfp-footer'}),
                ],
                css:{
                    zIndex: domz,
                },
                classnames: 'ckfp',
                assign:{
                    instance: this,
                    query: (el)=>_.get(el,this.dom),
                    queryAll: (el,asArray=true)=>_.getAll(el,this.dom,asArray),
                }
            });
            this.container = domHelper('div', {
                classnames:'ckfp-container',
                attr: {
                    'ckfpinstanceid': this.guid
                },
                childs: [
                    domHelper('div', {
                        css:{
                            zIndex: bwz,
                        },
                        classnames: 'ckfp-blockwindow'
                    }),
                    this.dom,
                ],
                append:document.body,
                assign:{
                    instance: this,
                }
            });
        }
        setCloseCallback(fn) {
            this.closeCallback = fn;
            return this;
        }
        setCloseable(closeable = true) {
            this.closeable = closable;
            return this;
        }
        appendCloseableComponent() {
            this.dom.query('.ckfp-closebtn')?.remove();
            this.closeable&&domHelper('span', {
                css: {
                    float:'right',
                    cursor: 'pointer'
                },
                classnames: ['ckfp-closebtn','clearfloat'],
                text:'❌',
                on:{
                    click: e=>this.hide()
                },
                append:this.dom.query('.ckfp-header')
            })
        }
        // setThemeColor() {
// TODO: Theming
        // }
        setTitle(t=''){
            this.dom.query('.ckfp-header').innerText = t;
            this.appendCloseableComponent();
            return this;
        }
        setTitleHTML(t=''){
            this.dom.query('.ckfp-header').innerHTML = t;
            this.appendCloseableComponent();
            return this;
        }
        setContent(t=''){
            this.dom.query('.ckfp-content').innerText = t;
            this.appendCloseableComponent();
            return this;
        }
        setContents(childs = []) {
            domHelper('div',{
                from: this.dom.query('.ckfp-content'),
                childs:childs
            });
            return this;
        }
        setContentHTML(t=''){
            this.dom.query('.ckfp-content').innerHTML = t;
            return this;
        }
        setFooter(t=''){
            this.dom.query('.ckfp-footer').innerText = t;
            return this;
        }
        setFooterElements(childs = []){
            domHelper('div',{
                from: this.dom.query('.ckfp-footer'),
                childs:childs
            });
            return this;
        }
        setFooterHTML(t=''){
            this.dom.query('.ckfp-footer').innerHTML = t;
            return this;
        }
        show() {
            this.container.classList.toggle('show', true);
            return this;
        }
        hide(value=null,nocallback = false) {
            this.container.classList.toggle('show', false);
            if (!nocallback) {
                if (typeof (this.closeCallback) === 'function') {
                    try {
                        this.closeCallback(value);
                    } catch (e) {
                        // ignore
                    }
                }
                this.closeCallback = null;
            }
            return this;
        }
    }
    window.FloatPopup = FloatPopup;
})();
