import React from 'react';
import {Div, Flex, Button, Img, Space, Span, Right} from "~/styledComponents/shared";
import styled, {css} from 'styled-components'
import {TYPE_OF_IMAGE} from "~/lib/bloceryConst";
import NoImageDefault from "~/images/noimage-300x267.png";
import useImg from "~/hooks/useImg";
import ComUtil from "~/util/ComUtil";
import {margin, padding} from "~/styledComponents/CoreStyles";
import {FaCheck} from "react-icons/all";
import {color} from "~/styledComponents/Properties";

export const COLOR = {
    MAIN: '#1db691',
    SUB: '#095744',
    DARK: '#535353'
}

export const LocalButton = styled.button`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 60px;
    color: white;
    background-color: ${COLOR.MAIN};
    border-radius: 30px;
    font-size: 25px;
    min-width: 175px;
    padding: 0;
    font-weight: bold;
    border: 0;
    transition: 0.2s;
        
    &:active {
        filter: brightness(85%);
    }
    
    ${props => props.bordered && `
        border: 3px solid ${COLOR.MAIN};
        color: ${COLOR.MAIN};
        background-color: white;
    `}
    
    ${props => props.dark && `
        background-color: ${COLOR.SUB};
    `}
    
    ${padding};
    ${margin};
    
    ${props => props.disabled && css`
        pointer-events: none;
        background-color: ${color.secondary}!important;
        color: ${color.white}!important;        
        border: 0;
    `};
`


export const LocalGoodsCard = ({bodyStyle = {py: 25}, goodsImages, farmerName, goodsName, optionName, price, printedCount, timestamp,
                                        visibleHeader = false,
                                        visibleFarmerName = false,
                                        onImageClick,
                                        isModified,
                                        onQaClick,
                                        // buttonText,
                                        // onButtonClick,
                                        rightContent
}) => {
    const {imageUrl, onError} = useImg(goodsImages, TYPE_OF_IMAGE.SMALL_SQUARE, NoImageDefault)
    // const {imageUrl: profileUrl, onError: onProfileError} = useImg(goodsImages, TYPE_OF_IMAGE.SMALL_SQUARE, NoImageDefault)
    return (
        <Div rounded={10} overflow={'hidden'} custom={`
            box-shadow: 0px 5px 10px 0 rgba(0, 0, 0, 0.1);
        `}>
            {
                visibleHeader && (
                    <Flex px={30} bg={COLOR.MAIN} fg={'white'} fontSize={26} bold {...bodyStyle}>
                        <div>{goodsName}</div>
                        <Right>
                            <LocalButton dark onClick={onQaClick} >문의하기</LocalButton>
                        </Right>
                    </Flex>
                )
            }
            <Flex px={30} py={24} bg={'white'}>
                <div>
                    <Flex>
                        <Div relative flexShrink={0} width={150} height={150} rounded={3} overflow={'hidden'} onClick={onImageClick}>
                            {
                                isModified && (
                                    <Flex absolute bg={'rgba(85,181,148,.75)'} top={0} left={0} right={0} bottom={0} fg={'white'} justifyContent={'center'} zIndex={1}>
                                        <FaCheck size={60} />
                                    </Flex>
                                )
                            }
                            {/*<Img src={imageSrc} rounded={3}/>*/}
                            {
                                goodsImages ? <Img cover onError={onError} src={imageUrl} /> : <Img rounded={4} src={NoImageDefault} alt={'이미지 없음'} />
                            }
                        </Div>
                        <Div ml={19}>
                            {
                                timestamp && <Div fontSize={20} fg={'#9fa3a7'}>{ComUtil.utcToString(timestamp, 'MM-DD HH:mm')}</Div>
                            }
                            <Div fontSize={24} bold my={5}>{optionName}</Div>
                            <Space fontSize={24} spaceGap={15}>
                                <span>{ComUtil.addCommas(price)}원</span>
                                {
                                    printedCount ? (
                                        <>
                                            <span>x</span>
                                            <Span fg={'primary'}>{ComUtil.addCommas(printedCount)}개</Span>
                                        </>
                                    ) : null
                                }
                            </Space>
                        </Div>
                    </Flex>
                    {
                        visibleFarmerName && (
                            <Div pt={21}>
                                <Div bold fontSize={20}>{farmerName}</Div>
                            </Div>
                        )
                    }
                </div>
                <Div ml={'auto'} flexShrink={0} pl={19}>
                    {rightContent}
                    {/*<LocalButton onClick={onButtonClick}>{buttonText}</LocalButton>*/}
                </Div>
            </Flex>
        </Div>
    );
};