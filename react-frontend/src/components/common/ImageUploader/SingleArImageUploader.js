import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import ComUtil from "../../../util/ComUtil"
import { Server } from '../../Properties'
import axios from 'axios'
import {Webview} from '~/lib/webviewApi'
import styled from "styled-components";
import {Button} from "~/styledComponents/shared";
import {activeColor, color, hoverColor} from "~/styledComponents/Properties";
import {getValue} from "~/styledComponents/Util";
import {AiOutlinePlus,AiOutlineMinus} from "react-icons/ai"
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

export const ArDiv = styled.div`    
    margin: 0.3em;
    border-radius: 5px;
    font-weight: 400;
`;

class SingleArImageUploader extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            arType: props.arType ? props.arType:'glb',    // glb, usdz(ios)
            image: {}
        }
        this.files = []     //input files
    }

    //props 및 state 변경시 항상 동작
    static getDerivedStateFromProps(nextProps, prevState) {
        if(nextProps.image !== prevState.image)
            return { image: nextProps.image }// setState 와 동일(개선된 코드임), return 된 값은 shouldComponentUpdate의 nextState에 들어감
        return null
    }

    //렌더링 여부
    shouldComponentUpdate(nextProps, nextState){
        if(this.state.image === nextState.image) return false
        return true
    }

    onArImageDeleteClick = async (image) => {
        //input 파일경로 삭제
        this.files[0].value = ''
        this.setState({
            image: {}
        }, this.props.onChange({}));

    }

    onArImageUploadClick = async (image) => {

        if (ComUtil.isMobileApp())
            Webview.cameraPermission();

        //없으면 탐색기 열기
        this.files[0].click();
    }

    checkFileSize = (file) => {
        const maxFileSizeMB = this.props.maxFileSizeMB
        const limitedSize = maxFileSizeMB * 1024
        const fileSize = file.size / 1024
        if(fileSize > limitedSize){
            return false
        }
        return true
    }

    onArFileChange = async (e) => {
        let file = e.target.files[0]

        // 파일 사이즈 체크(압축된 파일로)
        if(!this.checkFileSize(file))
        {
            alert(`이미지 사이즈가 너무 큽니다(${this.props.maxFileSizeMB}메가 이하로 선택해주세요)`)
            file.value = ''
            return false
        }
        const formData = new FormData();
        formData.append('arFile', file, file.name);
        //서버에 파일 업로드
        const { status, data: imageData } = await this.upload(formData)

        if(status !== 200){
            alert('업로드 오류 입니다, 다시 시도해 주세요')
            file.value = ''
            return
        }

        const images = Object.assign({}, this.state.image)
        images.imageNo = 0;
        images.imageUrl = imageData;
        images.imageNm = file.name

        this.setState({
            image: images
        }, this.props.onChange(images)) //setState 이후 callback에 부모 callback 호출

    }

    upload = async (formData) => {
        return await axios(Server.getRestAPIFileServerHost() + '/arFile',
            {
                method: 'post',
                data:formData,
                withCredentials: true,
                credentials: 'same-origin'
            });
    }

    render(){

        const { image } = this.state;
        return(
            <Fragment>
                <div>
                    <div>
                        <StandardButton onClick={this.onArImageUploadClick.bind(this, image)}>
                            <AiOutlinePlus/> AR파일 {`(${this.state.arType})`}
                        </StandardButton>
                        {
                            (image && image.imageUrl) &&
                            <StandardButton ml={5} onClick={this.onArImageDeleteClick.bind(this, image)}>
                                <AiOutlineMinus/> AR파일삭제
                            </StandardButton>
                        }
                    </div>
                    <ArDiv>
                    {
                        (image && image.imageUrl) ? (
                            <div>
                                {image.imageUrl ? '/arimages/' + image.imageUrl:''}
                            </div>
                            ) :
                            (`AR파일(${this.state.arType})없음`)
                    }
                    </ArDiv>
                    <input
                        style={{display:'none'}}
                        type='file'
                        ref={file => this.files[0] = file}
                        onChange={this.onArFileChange.bind(this)}
                        accept={this.state.arType ? `.${this.state.arType}`:'.glb'}
                    />
                </div>
            </Fragment>
        )
    }

}

SingleArImageUploader.propTypes = {
    arType: PropTypes.string,
    image: PropTypes.object,
    maxFileSizeMB: PropTypes.number, //파일업로드 용량
    onChange: PropTypes.func.isRequired
}

SingleArImageUploader.defaultProps = {
    arType: 'glb',
    image: {},
    maxFileSizeMB: 20,
    onChange: () => null
}
export default SingleArImageUploader