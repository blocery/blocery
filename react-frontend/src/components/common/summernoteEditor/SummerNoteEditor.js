import React from "react";
import {Server} from "~/components/Properties";
import ComUtil from "~/util/ComUtil";
import axios from "axios";

// imports for summernote
import ReactSummernote from "react-summernote";
import "react-summernote/lang/summernote-ko-KR";

class SummerNoteEditor extends React.Component {

    constructor(props) {
        super(props);
        this.toolbar = this.props.toolbar ? false:true;
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange = content => {
        //console.log("onChange ", content);
        this.props.onChange(content);
    };

    onImageUpload = async (files, insertImage) => {
        for (let i = files.length - 1; i >= 0; i--) {
            this.sendFile(files[i], this, insertImage);
        }
    };

    checkFileSize = (file) => {
        const maxFileSizeMB = this.props.maxFileSizeMB || 10;
        const limitedSize = maxFileSizeMB * 1024;
        const fileSize = file.size / 1024;
        if(fileSize > limitedSize){
            return false;
        }
        return true;
    }

    sendFile = async (file, el, insertImage) => {
        let newFile = file;
        if(file.type !== "image/gif"){
            newFile = await ComUtil.getCompressoredFile(file,this.props.quality||0.6);
        }

        //파일 사이즈 체크(압축된 파일로)
        if(!this.checkFileSize(newFile))
        {
            alert(`이미지 사이즈가 너무 큽니다(${this.props.maxFileSizeMB || 10}메가 이하로 선택해주세요)`)
            return false;
        }

        const form_data = new FormData();
        form_data.append('image', newFile);

        axios.post(Server.getRestAPIFileServerHost()+'/contentImgFile',
            form_data,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'withCredentials': true,
                    'credentials': 'same-origin'
                }
            })
        .then( (serverResponse) =>{
            if(serverResponse.status === 200){
                const fileData = serverResponse.data;
                let v_fileUrlPath = fileData.fileUrlPath;
                let resfile = Server.getImgTagServerURL() + v_fileUrlPath + fileData.fileName;
                //console.log("===resfile",resfile)
                insertImage(resfile);
            }
        }).catch(error=>{
            alert(error);
        })
    }

    onInit = ({summernote}) => {
        summernote('code', this.props.editorHtml)
    }

    render() {
        return (
            <div>
                <ReactSummernote
                    onInit={this.onInit}
                    value={this.props.editorHtml || null}
                    placeholder={this.props.placeholder||"내용을 입력해 주세요!"}
                    options={{
                        lang: "ko-KR",
                        height: this.props.height ? this.props.height:380,
                        minHeight: 200,
                        focus: this.props.focus?this.props.focus:false,
                        dialogsInBody: true,
                        dialogsFade: true,
                        disableDragAndDrop: false,
                        toolbar:
                            this.toolbar ?
                                ComUtil.isMobileApp() ?
                                    [["insert", ["picture"]]]
                                    :
                                    [
                                        ['style', ['style']],
                                        ["fontname", ["fontname"]],
                                        ['fontsize', ['fontsize']],
                                        ["style", ['bold','italic','strikethrough','underline','clear']],
                                        ['color', ['color']],
                                        ["table", ["table"]],
                                        ["para", ["ul", "ol", "paragraph"]],
                                        ['height', ['height']],
                                        ["insert", ["link", "picture", "video"]],
                                        ["view", ["fullscreen","codeview"]]
                                    ]
                                :
                                null
                        ,
                        popover: {
                            image: [
                                ['image', ['resizeFull', 'resizeHalf', 'resizeQuarter', 'resizeNone']],
                                ['float', ['floatLeft', 'floatRight', 'floatNone']],
                                ['remove', ['removeMedia']]
                            ],
                            table: [
                                ['add', ['addRowDown', 'addRowUp', 'addColLeft', 'addColRight']],
                                ['delete', ['deleteRow', 'deleteCol', 'deleteTable']],
                            ],
                            air: [
                                ['color', ['color']],
                                ['font', ['bold', 'underline', 'clear']],
                                ["insert", ["picture"]],
                            ]
                        },
                        print: {
                            //'stylesheetUrl': 'url_of_stylesheet_for_printing'
                        },
                        fontNames: [
                            // "NotoSansKR","SeoulHangangL","SeoulHangangM","SeoulHangangB","SeoulHangangEB",
                            "NanumBarunGothic",
                            "Arial", 'Arial Black', "Sans-Serif",
                            'Comic Sans MS', 'Courier New','맑은 고딕','궁서','굴림체','굴림','돋움체','바탕체'
                        ],
                        fontNamesIgnoreCheck:[
                            // "NotoSansKR", "SeoulHangangL","SeoulHangangM","SeoulHangangB","SeoulHangangEB"
                            "NanumBarunGothic"
                        ],
                        fontSizes: ['8','9','10','11','12','14','15','16','18','20','22','24','28','30','36','50','72'],
                        blockquoteBreakingLevel: 2,
                        styleTags: [
                            'p',
                            { title: '인용구', tag: 'blockquote', className: 'blockquote', value: 'blockquote' },
                            { title: '코드', tag: 'pre', className: 'pre', value: 'pre' },
                            'h1', 'h2', 'h3', 'h4', 'h5', 'h6'
                        ],
                    }}
                    onChange={this.handleChange}
                    onImageUpload={this.onImageUpload}
                />
            </div>
        );
    }
}

export default SummerNoteEditor;