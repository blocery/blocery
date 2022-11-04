import React from 'react';
import {AbsoluteMask, Button, Div, Flex, Img, Span} from "~/styledComponents/shared";
import {color} from "~/styledComponents/Properties";
import {getValue} from "~/styledComponents/Util";
import {BsDownload} from 'react-icons/bs'
import {MdRemoveCircleOutline} from 'react-icons/md'
import moment from "moment-timezone";

const UniqueOptionCard = ({isAdded, remainedCnt, src, number, objectUniqueNo, capturedTime, onDetailClick, onAddOptionClick}) => {
    return (
        <div style={{marginBottom: getValue(25)}} onClick={onDetailClick}>
            <Div relative overflow={'hidden'} cursor rounded={8} mb={11}>
                {
                    remainedCnt <= 0 && <AbsoluteMask><Div fontSize={24} fg={'white'}>품절</Div></AbsoluteMask>
                }
                <Img height={'unset'} cover src={src} />
            </Div>
            <Flex mb={10}>
                <Span display={'inline-block'} bg={'green'} fg={'white'} bold rounded={12} px={15} py={6} fontSize={12} lineHeight={12} mr={8}>옵션{number}</Span>
                <Span fontSize={13} lineHeight={'normal'}><b>No.{objectUniqueNo}</b></Span>
            </Flex>

            <Div fontSize={13} mb={10}>
                <div>촬영일시</div>
                <Div fg={'dark'}>{moment(capturedTime, 'YYYYMMDDHHmmss').format('YYYY.MM.DD HH:mm')}</Div>
            </Div>

            <Flex overflow={'hidden'} bc={'light'} rounded={3} fontSize={13}>
                <Flex minHeight={35} justifyContent={'center'} height={'100%'} cursor doActive bg={'white'} width={'50%'} textAlign={'center'} custom={`border-right: 1px solid ${color.light};`}
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
        </div>
    );
};

export default UniqueOptionCard;