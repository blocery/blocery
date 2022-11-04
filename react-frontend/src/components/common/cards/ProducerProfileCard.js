import React, { Fragment } from 'react';
import Style from './ProducerProfileCard.module.scss'
import { Container, Row, Col } from 'reactstrap'
import classNames from 'classnames'
import {FaQuoteLeft, FaQuoteRight} from 'react-icons/fa'
import { Server } from '~/components/Properties'
import useImageViewer from "~/hooks/useImageViewer";
import ComUtil from "~/util/ComUtil";
import {Div, Img} from "~/styledComponents/shared";
const EMPTY_TEXT = '-';
const ProducerProfileCard = (props) => {


    const {openImageViewer} = useImageViewer()

    const bgUrl = ComUtil.getFirstImageSrc(props.profileBackgroundImages)

    const onProfileImageClick = () => {
        openImageViewer(props.profileImages, 0)
    }

    if(!props.producerNo) return null

    return(
        <Fragment>
            <Div relative>
                <Div bg={!bgUrl && 'green'}>
                    <Img src={bgUrl} height={'40vmin'} cover/>
                </Div>
                <Div absolute center width={'25vmin'} height={'25vmin'}>
                    <Img rounded={'20%'} src={ComUtil.getFirstImageSrc(props.profileImages)} alt="판매자 소개 사진" onClick={onProfileImageClick}/>
                </Div>
            </Div>

            {/* 농장 타이틀 */}
            <div className='mb-2'>
                <div className='d-flex justify-content-center align-items-center m-2'>
                    <span className='f2 text-black-50 font-weight-bold mr-2'>{props.farmName}</span>
                </div>
                {
                    props.shopIntroduce &&
                    <div className='m-4 lead f5 text-center text-secondary'>
                        <FaQuoteLeft />
                        <span className='ml-1 mr-1 f4'>{props.shopIntroduce}</span>
                        <FaQuoteRight />
                    </div>
                }
            </div>

            {/* 농장 상세설명 */}
            <div className='mb-2'>
                <div className={'pl-3 pr-3 f6 text-secondary text-center '}>
                    {/*<div>업종 : {props.shopBizType || EMPTY_TEXT }</div>*/}
                    {/*<div data-rel="external">연락처 : {props.shopPhone ? <a href={`tel:${props.shopPhone}`}  data-rel="external">{props.shopPhone}</a> : EMPTY_TEXT} </div>*/}
                    {/*<div>주소 : ({props.shopZipNo || EMPTY_TEXT}){props.shopAddress} {props.shopAddressDetail}</div>*/}
                    <div className='mb-2'>주요취급품목 : {props.shopMainItems || EMPTY_TEXT}</div>
                </div>
            </div>
        </Fragment>
    )
}
export default ProducerProfileCard