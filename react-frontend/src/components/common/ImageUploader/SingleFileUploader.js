import React, {Fragment, useEffect, useState, useRef} from 'react'
import PropTypes from 'prop-types'
import ComUtil from "../../../util/ComUtil"
import { Server } from '../../Properties'
import axios from 'axios'
import {Webview} from '~/lib/webviewApi'
import styled from "styled-components";
import {Button} from "~/styledComponents/shared";
import {activeColor, color, hoverColor} from "~/styledComponents/Properties";
import {getValue} from "~/styledComponents/Util";
import {AiOutlinePlus} from "react-icons/ai"
import {MdClose} from "react-icons/md";

const BasicButton = styled(Button)`
    ${props => !props.bg && `
        background: ${color.white};        
        border: 1px solid ${color.secondary};
        
        &:hover {
            background-color: ${hoverColor.white};
        }
        &:active {
            background-color: ${activeColor.white};
        }
        
    `}
    
    ${props => (props.bg && props.bg !== 'white') && `
        color: ${color.white};
    `}
`

//일반 버튼
export const StandardButton = styled(BasicButton)`    
    padding: ${getValue(10)};
    font-size: 13px;
    line-height: 13px;    
`;

const SingleFileUploader = (props) => {

    const inputFileEl = useRef(null);
    const [fileType,setFileType] = useState(props.fileType||"image/*,application/pdf,.zip,.hwp,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    const [file,setFile] = useState(props.file);

    useEffect(() => {
        console.log('single useEffect file')
        // props.onChange(props.name,file);
        setFile(props.file)
    }, [props.file])

    const onFileDeleteClick = async () => {
        //input 파일경로 삭제
        inputFileEl.current.value = '';
        // setFile(null);
        props.onChange(props.name, null)
    }

    const onFileDownloadClick = async (file) => {
        getDownLoad(file);
    }

    const onFileUploadClick = async () => {

        if (ComUtil.isMobileApp())
            Webview.cameraPermission();

        //없으면 탐색기 열기
        inputFileEl.current.click();
    }

    const checkFileSize = (file) => {
        const maxFileSizeMB = props.maxFileSizeMB
        const limitedSize = maxFileSizeMB * 1024
        const fileSize = file.size / 1024
        if(fileSize > limitedSize){
            return false
        }
        return true
    }

    const onFileChange = async (e) => {
        let inputFile = e.target.files[0];

        // 파일 사이즈 체크(압축된 파일로)
        if(!checkFileSize(inputFile))
        {
            alert(`파일 사이즈가 너무 큽니다(${props.maxFileSizeMB}메가 이하로 선택해주세요)`)
            inputFileEl.current.value = ''
            return false
        }
        const formData = new FormData();
        formData.append('file', inputFile, inputFile.name);
        if(props.fileGubun === "producerfile") {
            formData.append("fileKey", props.fileKey)
        }
        //서버에 파일 업로드
        const { status, data: fileData } = await upload(formData)

        if(status !== 200){
            alert('업로드 오류 입니다, 다시 시도해 주세요')
            inputFileEl.current.value = ''
            return
        }

        const fileInfo = Object.assign({}, file)
        fileInfo.fileNo = props.fileNo;
        fileInfo.filePath= fileData.filePath;
        fileInfo.fileExtsn = fileData.fileExtsn;
        fileInfo.fileName = fileData.fileName;

        // setFile(fileInfo);
        props.onChange(props.name, fileInfo)
    }

    const getDownLoad = async (file) => {
        let vFilePath = "";
        if(props.fileGubun === "producerfile"){
            vFilePath = "/"+props.fileGubun+file.filePath;
        } else if(props.fileGubun === "producerauthfile"){
            vFilePath = file.filePath;
        }
        const fileUrl = Server.getFileServerURL()+vFilePath;
        axios.get(fileUrl, {
            responseType: 'blob'
        },{
            withCredentials: true, credentials: 'same-origin'
        }).then((response) => {
            // 다운로드(서버에서 전달 받은 데이터) 받은 바이너리 데이터를 blob으로 변환합니다.
            const blob = new Blob([response.data]);

            // 가상 링크 DOM 만들어서 다운로드 실행
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.style.display = "none";
            a.download = file.fileName
            document.body.appendChild(a)
            a.click()
            a.remove();
            window.URL.revokeObjectURL(url)
        });
    }

    const upload = async (formData) => {
        let apiName = "";
        if(props.fileGubun === "producerfile"){
            apiName = "/producerFile";
        } else if(props.fileGubun === "producerauthfile"){
            apiName = "/producerAuthFile";
        }
        return await axios(Server.getRestAPIFileServerHost() + apiName,
            {
                method: 'post',
                data:formData,
                withCredentials: true,
                credentials: 'same-origin'
            });
    }


    return(
        <Fragment>
            <div>
                <div>
                    <StandardButton onClick={onFileUploadClick.bind(this, file)}>
                        <AiOutlinePlus/> 선택
                    </StandardButton>
                    {
                        (file && file.filePath) &&
                        <StandardButton ml={5} onClick={onFileDeleteClick.bind(this, file)}>
                            <MdClose/> {file.fileName}
                        </StandardButton>
                    }
                    {
                        (file && file.filePath) &&
                         <StandardButton ml={5} onClick={onFileDownloadClick.bind(this, file)}>다운로드</StandardButton>
                    }
                </div>
                <input
                    style={{display:'none'}}
                    type='file'
                    ref={inputFileEl}
                    onChange={onFileChange}
                    accept={fileType}
                />
            </div>
        </Fragment>
    )
}

SingleFileUploader.propTypes = {
    fileGubun: PropTypes.string,
    fileKey: PropTypes.string,
    fileType: PropTypes.string,
    fileNo:PropTypes.number,
    maxFileSizeMB: PropTypes.number, //파일업로드 용량
    onChange: PropTypes.func.isRequired
}

SingleFileUploader.defaultProps = {
    fileGubun:'producerfile',
    fileNo:0,
    fileKey: '',
    fileType: '',
    maxFileSizeMB: 10,
    onChange: () => null
}
export default SingleFileUploader