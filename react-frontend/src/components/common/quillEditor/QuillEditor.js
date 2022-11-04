import React from 'react'
import { Server } from '~/components/Properties'
import ResizeModule from '@ssumo/quill-resize-module';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './QuillEditor.css';
import { QuillImageUpload } from './QuillImageUpload';
import ComUtil from "../../../util/ComUtil";
Quill.register('modules/imageUpload', QuillImageUpload); // QuillImageUpload 모듈 등록
Quill.register("modules/resize", ResizeModule);

const Delta = Quill.import("delta");
const Break = Quill.import("blots/break");
const Embed = Quill.import("blots/embed");
const BlockEmbed = Quill.import('blots/block/embed');
class ImageBlot extends BlockEmbed {
    static create(value) {
        let node = super.create();
        if(value.style != null) node.setAttribute('style', value.style);
        if(value.url != null) node.setAttribute('src', value.url);
        return node;
    }
    static value(node) {
        return {
            style: node.getAttribute('style'),
            url: node.getAttribute('src')
        };
    }
}
ImageBlot.blotName = 'image';
ImageBlot.tagName = 'img';

Quill.register(ImageBlot,true);
// Specify Quill fonts
const fontList= [
    'noto-sans-kr',
    //'seoul-hangang-l','seoul-hangang-m','seoul-hangang-b','seoul-hangang-eb',
    'arial',
    'sans-serif'
];
let FontStyle = Quill.import('formats/font'); // allow ONLY these fonts and the default
// We do not add Sans Serif since it is the default
FontStyle.whitelist = fontList;
Quill.register(FontStyle, true);

// set Quill to use <b> and <i>, not <strong> and <em>
const bold = Quill.import('formats/bold');
bold.tagName = 'b';   // Quill uses <strong> by default
Quill.register(bold, true);

const italic = Quill.import('formats/italic');
italic.tagName = 'i';   // Quill uses <em> by default
Quill.register(italic, true);

let Inline = Quill.import('blots/inline');
class quote extends Inline {
    static create(value) {
        let node = super.create(value);
        return node;
    }
}
quote.blotName = 'quote';
quote.tagName = 'q';
Quill.register(quote);

const Parchment = Quill.import('parchment');
let config = { scope: Parchment.Scope.Block };
let SpanBlockClass = new Parchment.Attributor.Class('span-block', 'span', config);
Quill.register(SpanBlockClass, true);

const icons = Quill.import('ui/icons');
icons['span-block'] = 'sb';
icons['quote'] = 'st';


class Editor extends React.Component {

    /*
     * Quill modules to attach to editor
     * See https://quilljs.com/docs/modules/ for complete options
     */
    quillEditorModules = {
        toolbar: {
            container: [

                ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
                ['blockquote', 'quote', 'span-block', 'code-block'],

                [{ 'header': 1 }, { 'header': 2 }],               // custom button values
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
                [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
                [{ 'direction': 'rtl' }],                         // text direction

                [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

                ['link', 'image', 'video'],

                [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
                [{ 'font': fontList }],
                [{ 'align': [] }],

                ['clean']
            ],
            handlers: {
                'quote': function() {
                    let range = this.quill.getSelection();
                    let format = this.quill.getFormat(range);

                    if (!format['quote']) {
                        this.quill.format('quote', 'block');
                    } else {
                        this.quill.removeFormat(range.index, range.length);
                    }
                },
                'span-block': function() {
                    let range = this.quill.getSelection();
                    let format = this.quill.getFormat(range);

                    if (!format['span-block']) {
                        this.quill.format('span-block', 'block');
                    } else {
                        this.quill.removeFormat(range.index, range.length);
                    }
                }
            }
        },
        imageUpload: {
            url: Server.getRestAPIFileServerHost()+'/contentImgFile', // server url. If the url is empty then the base64 returns
            method: 'POST', // change query method, default 'POST'
            name: 'image', // custom form name
            withCredentials: true, // withCredentials
            credentials: 'same-origin',
            // personalize successful callback and call next function to insert new url to the editor
            callbackOK: (serverResponse, next) => {
                //console.log("serverResponse==",serverResponse);
                let v_fileUrlPath = serverResponse.fileUrlPath;
                let resfile = Server.getImgTagServerURL() + v_fileUrlPath + serverResponse.fileName;
                //console.log("===resfile",resfile)
                next({style:"",url:resfile});
            },
            // personalize failed callback
            callbackKO: serverError => {
                //console.log("serverError==",serverError);
                alert(serverError);
            },
            // optional
            // add callback when a image have been chosen
            checkBeforeSend: async (file, next) => {
                //console.log("checkBeforeSend",file);
                let newFile = file;
                if(file.type !== "image/gif"){
                    newFile = await ComUtil.getCompressoredFile(file);
                }

                //파일 사이즈 체크(압축된 파일로)
                if(!this.checkFileSize(newFile))
                {
                    alert(`이미지 사이즈가 너무 큽니다(${this.props.maxFileSizeMB || 10}메가 이하로 선택해주세요)`)
                    return false;
                }

                next(newFile);
            }
        },
        clipboard: {
            // toggle to add extra line breaks when pasting HTML:
            matchVisual: false
        },
        resize: {
            locale: {
                altTip: "리사이징",
                floatLeft: "왼쪽",
                floatRight: "오른쪽",
                center: "중앙",
                restore: "복원"
            }
        }
    };

    /*
     * Quill editor formats
     * See https://quilljs.com/docs/formats/
     */
    quillEditorFormats = [
        'bold', 'italic', 'underline', 'strike',
        'blockquote', 'code-block', 'script',
        'header', 'list', 'bullet', 'indent',
        'link', 'image', 'video',
        'color', 'background',
        'font', 'size', 'align'
    ];

    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    // toolbar 클릭시 포커스 상위로 가는 버그 방지
    componentDidMount() {
        document.querySelectorAll(".ql-picker").forEach(tool => {
            tool.addEventListener("mousedown", function(event) {
                event.preventDefault();
                event.stopPropagation();
            });
        });
    }

    checkFileSize = (file) => {
        const maxFileSizeMB = this.props.maxFileSizeMB || 10;
        const limitedSize = maxFileSizeMB * 1024;
        const fileSize = file.size / 1024;
        if(fileSize > limitedSize){
            return false;
        }
        return true;
    }

    handleChange(html) {
        this.props.onChange(html);
    }

    render() {
        return (
            <ReactQuill
                theme={'snow'}
                className={'ql-editor-resize-scroll'}
                value={this.props.editorHtml || null}
                onChange={this.handleChange}
                modules={this.quillEditorModules}
                //formats={this.quillEditorFormats}
                placeholder={this.props.placeholder||"내용을 입력해 주세요!"}
            />
        )
    }
}

export default Editor;