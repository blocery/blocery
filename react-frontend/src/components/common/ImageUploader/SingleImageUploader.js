import React, { Fragment, useRef, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import ComUtil from "../../../util/ComUtil"
import { Server } from '../../Properties'
import axios from 'axios'
import Style from './SingleImageUploader.module.scss'
import Compressor from 'compressorjs'
import {Webview} from '~/lib/webviewApi'
import {Spinner} from "reactstrap";
import {Div, Flex} from "~/styledComponents/shared";
import {getValue} from "~/styledComponents/Util";
import {color} from "~/styledComponents/Properties";
import {IoMdCloseCircle} from "react-icons/io";

const SingleImageUploader = (props) => {

    //마우스 오버시 미리보기 할 지 여부
    const enablePreviewImage = props.enablePreviewImage || null
    const [loading, setLoading] = useState([])
    const [dataIndex, setDataIndex] = useState(null)
    const [images, setImages] = useState(props.images ? props.images:[])
    const imagesRef = useRef(props.images ? props.images:[])

    const files = useRef([])

    const [visiblePreviewImage, setVisiblePreviewImage] = useState(false)


    useEffect(() => {
        if(props.images) {
            setImages(props.images)
            imagesRef.current = props.images
        }
    }, [props.images])

    useEffect(() => {
        if(dataIndex != null){
            const loadingData = [...loading]
            const which = loading.indexOf(dataIndex)
            //있으면 삭제
            if (which > -1) {
                loadingData.splice(which, 1)
            }else{
                //없으면 추가
                loadingData.push(dataIndex)
            }
            setLoading(loadingData)
            setDataIndex(null);
        }
    }, [dataIndex])

    useEffect(() => {
        if (props.setUploading && typeof props.setUploading === 'function') {
            if (loading.length > 0) {
                props.setUploading(true)
            }else{
                props.setUploading(false)
            }
        }
    }, [loading])


    const onImageUploadClick = async (imageData, e) => {

        e.stopPropagation()

        if (ComUtil.isMobileApp())
            Webview.cameraPermission()

        //이미지가 있으면 삭제
        if(imageData.imageUrl){

            //서버 파일 삭제
            // await this.deleteImage(image.imageUrl)

            //input 파일경로 삭제
            files.current[imageData.imageNo].value = ''

            //삭제된 image를 제외한 배열
            // const imagesInfo = images.filter(item => item.imageNo !== imageData.imageNo)

            imagesRef.current = imagesRef.current.filter(item => item.imageNo !== imageData.imageNo)

            setImages(imagesRef.current);
            props.onChange(imagesRef.current);

        }else{
            //없으면 탐색기 열기
            files.current[imageData.imageNo].click()
        }
    }

    //파일 제거
    // deleteImage = async(imageUrl) => {
    //     await axios.delete(Server.getRestAPIHost() + '/file',{ params: {fileName: imageUrl}})
    // }

    const checkFileSize = (fileData) => {
        const maxFileSizeMB = props.maxFileSizeMB
        const limitedSize = maxFileSizeMB * 1024
        const fileSize = fileData.size / 1024

        if(fileSize > limitedSize){
            return false
        }
        return true
    }

    const onImageChange = async (index, e) => {

        console.log(`index === ${index}`)

        let fileData = e.target.files[0]

        const result = await ComUtil.getCompressoredFile(fileData, props.quality || 0.6)


        console.log("image upload==", result)

        // 파일 사이즈 체크(압축된 파일로)
        if(!checkFileSize(result))
        {
            alert(`이미지 사이즈가 너무 큽니다(${props.maxFileSizeMB}메가 이하로 선택해주세요)`)
            fileData.value = ''
            return false
        }


        const formData = new FormData();
        // The third parameter is required for server

        formData.append('file', result, result.name);

        toggleLoading(index)

        try{
            //서버에 파일 업로드
            const { status, data: imageUrl } = await upload(formData)

            console.log(`${index}번째 ${imageUrl}`)

            toggleLoading(index)

            if(status !== 200){
                alert('업로드 오류 입니다, 다시 시도해 주세요')
                fileData.value = ''
                return
            }

            // const images = Object.assign([], this.state.images)
            const tmpImage = {
                imageNo: index,
                imageUrlPath:'',
                imageUrl: imageUrl,
                imageNm: fileData.name
            }

            //아래 주석 처리함 (21.11.17 jaden) : 이미지가 set 될때 비동기로 처리되기 때문에 시간차가 발생하니 동기화 처리를 위해 ref로 변경
            //이미지가 바뀌었기 때문에, imageNo가 index와 다른것만 조회하여 다시 push 함
            // const imagesData = images.filter((image) => image.imageNo !== index )
            // imagesData.push(tmpImage)

            imagesRef.current = imagesRef.current.filter((image) => image.imageNo !== index )
            imagesRef.current.push(tmpImage)

            // console.log(imagesData)
            console.log(imagesRef.current)

            setImages(imagesRef.current);
            props.onChange(imagesRef.current);
        }catch (err){
            toggleLoading(index)
        }


        /*


        // 이미지 압축 및 서버 업로드(0.6은 대략 60% 정도의 용량이 줄어듬, 추천하는 압축률)
        new Compressor(fileData, {
            quality: props.quality,
            convertTypes: ['image/webp'],
            success: async (result) => {

                // 파일 사이즈 체크(압축된 파일로)
                if(!checkFileSize(result))
                {
                    alert(`이미지 사이즈가 너무 큽니다(${props.maxFileSizeMB}메가 이하로 선택해주세요)`)
                    fileData.value = ''
                    return false
                }

                const formData = new FormData();
                // The third parameter is required for server

                formData.append('file', result, result.name);

                toggleLoading(index)

                try{
                    //서버에 파일 업로드
                    const { status, data: imageUrl } = await upload(formData)
                    toggleLoading(index)

                    if(status !== 200){
                        alert('업로드 오류 입니다, 다시 시도해 주세요')
                        fileData.value = ''
                        return
                    }

                    // const images = Object.assign([], this.state.images)
                    const tmpImage = {
                        imageNo: index,
                        imageUrlPath:'',
                        imageUrl: imageUrl,
                        imageNm: fileData.name
                    }

                    //이미지가 바뀌었기 때문에, imageNo가 index와 다른것만 조회하여 다시 push 함
                    const imagesData = images.filter((image) => image.imageNo !== index )
                    imagesData.push(tmpImage)

                    setImages(imagesData);
                    props.onChange(imagesData);
                }catch (err){
                    toggleLoading(index)
                }
            },
            error(err) {
                console.log(err.message);
                toggleLoading(index)
            },
        });

         */
    }

    const toggleLoading = (index) => {
        setDataIndex(index)
    }

    const copyImageUrl = (image) => {
        let imageUrl = Server.getImageURL() + image.imageUrl
        const textarea = document.createElement("input");
        textarea.value = `<img src="${imageUrl}" alt="${image.imageNm}" />`;
        // textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in Microsoft Edge.
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);

    }

    const upload = async (formData) => {
        const method = '/file'
        return await axios(Server.getRestAPIFileServerHost() + method,
            {
                method: 'post',
                data:formData,
                withCredentials: true,
                credentials: 'same-origin'
            });
    }

    const arr = [...Array(props.defaultCount)]



    const onMouseOver = () => {
        if (enablePreviewImage && !visiblePreviewImage) {
            setVisiblePreviewImage(true)
        }
    }
    const onMouseLeave = () => {
        if (enablePreviewImage && visiblePreviewImage) {
            setVisiblePreviewImage(false)
        }
    }
    return(
        <Fragment>

            <div className={Style.wrap} onMouseOver={onMouseOver} onMouseLeave={onMouseLeave}>
                {
                    visiblePreviewImage && (
                        <Div absolute top={0} left={0} width={200} height={200}>
                        </Div>
                    )
                }
                {
                    arr.map((empty, index) => {
                        const image = images.find((img) => img.imageNo === index) || {imageNo: index, imageNm: '', imageUrlPath:'', imageUrl: ''}
                        const isShownMainText = index === 0 & props.isShownMainText ? true : false
                        return(

                            <div key={'singleImageUploader'+index} className={'d-flex flex-column flex-shrink-0'}>
                                <div className={[Style.item, isShownMainText &&'bg-info'].join(' ')}
                                     onClick={!loading.includes(index) ? onImageUploadClick.bind(this, image) : null}
                                >
                                    {
                                        loading.includes(index) && (
                                            <Flex justifyContent={'center'} width={'100%'} height={'100%'} absolute bg={'rgba(255, 255, 255, 0.5)'}>
                                                <Spinner color="success" />
                                            </Flex>
                                        )
                                    }
                                    {
                                        !image.imageUrlPath ? (
                                                image.imageUrl ? (
                                                        <Fragment>
                                                            {/*<div className={Style.deleteText}>×</div>*/}
                                                            <IoMdCloseCircle
                                                                style={{
                                                                    position: 'absolute',
                                                                    top: getValue(8),
                                                                    right: getValue(8),
                                                                    cursor: 'pointer',
                                                                    zIndex: 1
                                                                }}
                                                                color={color.veryLight} size={getValue(25)}
                                                            />
                                                            <img className={Style.image}
                                                                 src={image.imageUrl ? Server.getThumbnailURL() + image.imageUrl : ''}  alt={'사진'}/>
                                                        </Fragment>

                                                    ) :
                                                    (isShownMainText ? '+ 대표사진' : '+ 사진')
                                            ) :
                                            (
                                                image.imageUrl ? (
                                                        <Fragment>
                                                            <div className={Style.deleteText}>×</div>
                                                            <img className={Style.image}
                                                                 src={image.imageUrl ? Server.getImgTagServerURL() + image.imageUrlPath + image.imageUrl:''}  alt={'사진'}/>
                                                        </Fragment>

                                                    ) :
                                                    (isShownMainText ? '+ 대표사진' : '+ 사진')
                                            )
                                    }
                                    <input
                                        style={{display:'none'}}
                                        type='file'
                                        ref={(el) => files.current[index] = el}
                                        onChange={onImageChange.bind(this, index)}
                                        accept='image/*'
                                    />

                                </div>
                                {
                                    (props.isShownCopyButton && image.imageUrl) && <a href={'javascript:void(0)'} className={'m-1 small'} onClick={copyImageUrl.bind(this, image)}>url 복사</a>
                                }
                            </div>


                        )

                    })
                }
            </div>
        </Fragment>
    )
}

SingleImageUploader.propTypes = {
    images: PropTypes.array,
    defaultCount: PropTypes.number, //파일 업로드 개수
    maxFileSizeMB: PropTypes.number, //파일업로드 용량
    quality: PropTypes.number, //이미지 퀄리티
    isShownMainText: PropTypes.bool, //첫번째 이미지의 "+ 대표사진" 텍스트 여부
    onChange: PropTypes.func.isRequired,
    isShownCopyButton: PropTypes.bool,
    enablePreviewImage: PropTypes.bool
}

SingleImageUploader.defaultProps = {
    images: [],
    defaultCount: 10,
    maxFileSizeMB: 10,
    quality:0.6,
    isShownMainText: false,
    onChange: () => null,
    isShownCopyButton: false,
    enablePreviewImage: false
}
export default SingleImageUploader