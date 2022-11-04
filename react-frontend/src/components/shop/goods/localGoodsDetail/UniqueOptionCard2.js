import {AbsoluteMask, Div, Flex, Img, Span} from "~/styledComponents/shared";
import ComUtil from "~/util/ComUtil";
import moment from "moment-timezone";
import {color} from "~/styledComponents/Properties";
import {MdRemoveCircleOutline} from "react-icons/md";
import {getValue} from "~/styledComponents/Util";
import {BsDownload} from "react-icons/bs";
import React from "react";

const buttonBorder = 'dark'

function UniqueOptionCard2({remainedCnt, optionPrice, capturedTime, optionImages, isAdded, onDetailClick, onAddOptionClick}) {
    return(
        <Flex px={16} py={16}>
            <Div relative overflow={'hidden'} cursor rounded={4} width={100}>
                {
                    remainedCnt <= 0 && <AbsoluteMask><Div fontSize={24} fg={'white'}>품절</Div></AbsoluteMask>
                }
                <Img height={'unset'} cover src={ComUtil.getFirstImageSrc(optionImages, 'square')} alt={"실물확인 옵션 이미지"} onClick={onDetailClick}/>
            </Div>
            <Div pl={14} flexGrow={1}>
                <Div fontSize={16} fg={'black'}><b>{ComUtil.addCommas(optionPrice)}원</b></Div>
                <Div fontSize={13} fg={'darkBlack'}>촬영일시 <Span fg={'darkBlack'}>{ComUtil.timeFromNow(moment(capturedTime, 'YYYYMMDDHHmmss'))}</Span></Div>

                <Flex overflow={'hidden'} bc={buttonBorder} rounded={3} fontSize={13} maxWidth={250} mt={10}>
                    <Flex minHeight={35} justifyContent={'center'} height={'100%'} cursor doActive bg={'white'} width={'50%'} textAlign={'center'} custom={`border-right: 1px solid ${color[buttonBorder]};`}
                          onClick={onDetailClick}>상세보기</Flex>
                    <Flex minHeight={35} justifyContent={'center'} height={'100%'} cursor doActive
                          width={'50%'} textAlign={'center'}
                          bg={remainedCnt > 0 ? 'white' : 'veryLight'}
                          fg={remainedCnt > 0 ? isAdded ? 'danger' : 'black' : 'secondary'}
                          onClick={onAddOptionClick}
                    >

                        {
                            remainedCnt > 0 ? (
                                isAdded ? (
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
                    </Flex>
                </Flex>

            </Div>
        </Flex>
    )
}
export default UniqueOptionCard2