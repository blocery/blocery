import React, {useEffect, useRef, useState} from 'react';
import {Button, Div, Flex, Mask, Right, Space, Span} from "~/styledComponents/shared";
import ReactIdSwiper from "react-id-swiper";
import {MdClose} from "react-icons/all";
import {color} from "~/styledComponents/Properties";
import {useRecoilState} from "recoil";
import {selectedOptionsState} from "~/recoilState";
import ComUtil from "~/util/ComUtil";
import {Server} from "~/components/Properties";
import moment from "moment-timezone";
import {Bold} from "~/styledComponents/ShopBlyLayouts";
import {MdRemoveCircleOutline} from "react-icons/md";
import {getValue} from "~/styledComponents/Util";
import {BsDownload,BsZoomIn} from "react-icons/bs";
import {IoIosCloseCircleOutline} from "react-icons/io";
import Zoomable from "react-instagram-zoom";
import "moment/locale/ko"
import ObjectUniqueQr from "./ObjectUniqueQr"
import useImageViewer from "~/hooks/useImageViewer";
import styled from "styled-components";
import {LazyLoadImage} from "react-lazy-load-image-component";
const ImgEnlargement = styled(Div)`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  color: white;
  width: 3em;
  height: 3em;
  //top: 0.3em;
  right: 0.3em;
  font-size: 12px;
  background: rgba(0, 0, 0, 0.4);
  color: white;
  border-radius: 100%;
  cursor: pointer;
  z-index: 2;
`;
//옵션 스와이퍼 모달
const OptionViewerModal = ({selectedOptionIndex, goods, addOption, onClose}) => {


    const ref = useRef(null);
    const [loading, setLoading] = useState(true)
    const [activeSlideIndex, setActiveSlideIndex] = useState(selectedOptionIndex)

    const swipeOptions = {
        lazy: true,
        slidesPerView: 1.2,
        spaceBetween: 16,
        // freeMode: true,
        // direction: 'vertical',
        centeredSlides: true,

        // activeSlideKey: `slide_${selectedOptionIndex}`
        // pagination: {
        //     el: '.swiper-pagination',
        //     clickable: true,
        //     dynamicBullets: true
        // },
        // autoHeight: true
        breakpoints: {
            // 1024: {
            //     slidesPerView: 4,
            //     spaceBetween: 40
            // },
            768: {
                slidesPerView: 2,
                spaceBetween: 25
            },
            640: {
                slidesPerView: 1.5,
                spaceBetween: 16
            },
            320: {
                slidesPerView: 1.2,
                spaceBetween: 10
            }
        },
        on: {
            slideChange: function () {
                console.log(this)
                setActiveSlideIndex(this.realIndex)
            }
        }
    }

    useEffect(() => {
        if (ref.current !== null && ref.current.swiper) {

            try {
                const swiper = ref.current.swiper
                console.log(swiper)

                // swiper.updateSlides()

                swiper.slideTo(selectedOptionIndex)
            }catch (err){}
        }

        setLoading(false)

    }, [])

    // const onCloseClick = e => {
    //     e.stopPropagation()
    //     onClose()
    // }

    return (
        <Mask onClick={onClose}>
            <Div absolute width={'100%'} top={'50%'} custom={`
                transform: translateY(-55%);
            `}>
                <Div textAlign={'center'} fg={'white'} mb={10} fontSize={17}>
                    {`${activeSlideIndex+1}/${goods.options.length}`}
                </Div>
                <ReactIdSwiper {...swipeOptions} ref={ref}
                    //activeSlideKey={`slide_${selectedOptionIndex}`}
                >
                    {
                        goods.options.map((option, index) =>
                            option.deleted ? null :
                            <div key={`slide_${option.optionIndex}`} onClick={e => e.stopPropagation()}>
                                <OptionSlider index={index} goods={goods} option={option} addOption={addOption}/>
                            </div>
                        )
                    }
                </ReactIdSwiper>
                <Flex justifyContent={'center'} mt={20}>
                    <Flex cursor justifyContent={'center'} >
                        <IoIosCloseCircleOutline color={color.white} size={36} onClick={onClose}/>
                    </Flex>
                </Flex>

            </Div>
        </Mask>
    )
}

//옵션 슬라이더
const OptionSlider = ({goods, index, option, addOption}) => {

    const {openImageViewer} = useImageViewer()

    const [selectedOptions, ] = useRecoilState(selectedOptionsState)

    const isAddedOption = selectedOptions.findIndex(item => item.optionIndex == option.optionIndex) === -1 ? false : true


    const onImageClick = (index) => {
        openImageViewer(option.optionImages, index)
    }


    return(
        <Div
            // height={'80vh'}
            bg={'white'} overflow={'hidden'} rounded={4} flexDirection={'column'}>
            <Div p={16}>
                <Flex mb={10}>
                    <Span display={'inline-block'} bg={'green'} fg={'white'} bold rounded={12} px={15} py={6} fontSize={12} lineHeight={12} mr={8}>옵션{index}</Span>
                    <Span fontSize={13} lineHeight={'normal'}><b>No.{option.objectUniqueNo}</b></Span>
                </Flex>
            </Div>
            <Div
                height={'50vh'}
                overflow={'auto'}>
                {
                    option.optionImages.map((image,index) =>
                        <>
                        <ImgEnlargement mr={16} onClick={onImageClick.bind(this, index)}><BsZoomIn size={20}/></ImgEnlargement>
                        <Zoomable key={'optionImage'+image.imageNo} releaseAnimationTimeout={200}>
                            <LazyLoadImage
                                wrapperClassName={'wrapper-lazy-image'}
                                // alt={goodsNm}
                                // height={image.height}
                                src={Server.getImageURL() + image.imageUrl} // use normal <img> attributes as props
                                // width={image.width}
                                effect="blur"
                                width={'100%'}
                                placeholderSrc={'/lazy/gray_lazy_1_1.jpg'}
                                // onError={onError}
                            />
                            {/*<img style={{width:'100%'}} src={Server.getImageURL() + image.imageUrl} className='w-100 swiper-lazy'/>*/}
                        </Zoomable>
                        </>
                    )
                }
                <div className="swiper-lazy-preloader swiper-lazy-preloader-white" />
            </Div>

            <Div p={16}>
                <Div fontSize={16}>{goods.goodsNm}</Div>
                <Bold display={'inline-block'} fg={'green'} bold fontSize={30} mb={8}>{ComUtil.addCommas(option.optionPrice)}</Bold>원
            </Div>

            <Flex p={16} mb={10}>
                <Div mt={25}>
                    <Space spaceGap={8} fontSize={12} flexWrap={'wrap'} fg={'dark'} mb={4}>
                        <Div>상품번호</Div>
                        <Div>{option.optionName}</Div>
                    </Space>
                    <Space spaceGap={8} fontSize={12} flexWrap={'wrap'} fg={'dark'}>
                        <Div>촬영일시</Div>
                        <Div>{moment(option.capturedTime, 'YYYYMMDDHHmmss').format('YYYY.MM.DD HH:mm')}</Div>
                        <Div>{ComUtil.timeFromNow(moment(option.capturedTime,'YYYYMMDDHHmmss'))}</Div>
                    </Space>
                </Div>
                <Right>
                    <ObjectUniqueQr objectUniqueNo={option.objectUniqueNo} />
                </Right>
                {/*<Div fg={'primary'} fontSize={14}>*/}
                {/*    상품정보는 사진을 확대해서 확인해 주세요!--re------*/}
                {/*</Div>*/}
            </Flex>

            <Button
                rounded={0}
                bg={option.remainedCnt > 0 ? isAddedOption ? 'veryLight' : 'green' : 'veryLight'}
                fg={option.remainedCnt > 0 ? isAddedOption ? 'danger' : 'white' : 'second'}
                block
                height={50}
                onClick={addOption.bind(this, option)}>
                {
                    option.remainedCnt > 0 ? (
                        isAddedOption ? (
                            <>
                                <MdRemoveCircleOutline style={{marginRight: getValue(4)}} />
                                선택취소
                            </>
                        ) : (
                            <>
                                <BsDownload style={{marginRight: getValue(4)}}/>
                                옵션추가
                            </>
                        )
                    ) : (
                        <>품절</>
                    )
                }
            </Button>
        </Div>
    )
}



export default OptionViewerModal;
