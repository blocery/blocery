import React, { useState, useEffect, useRef } from 'react'
import {Container, Row, Col, ModalHeader} from 'reactstrap'
import ComUtil from '~/util/ComUtil'

//임시로 쓰는 api
import { getConsumerGoodsByKeyword } from '~/lib/goodsApi'
import { Webview } from '~/lib/webviewApi'

import { SpinnerBox } from '~/components/common'
import { SlideItemHeaderImage, SlideItemContent } from '~/components/common/slides'
import Css from './Search.module.scss'
import { IconStore, IconSearch, IconBackArrow } from '~/components/common/icons'
import { Server } from '~/components/Properties'
import CombinedSwiperContent from "~/components/shop/hashTag/CombinedSwiperContent";
import {Button, Div, Flex, GridColumns, Input, Span} from "~/styledComponents/shared";
import {useRecoilState} from "recoil";
import {boardTagModalState} from "~/recoilState";
import styled from 'styled-components'
import {getValue} from "~/styledComponents/Util";
import {RiSearchLine} from 'react-icons/ri'
import {color} from "~/styledComponents/Properties";
import ArrowBackButton from "~/components/common/buttons/ArrowBackButton";

import {withRouter} from 'react-router-dom'
import {HiHashtag} from "react-icons/hi";
import {GridList} from "~/styledComponents/ShopBlyLayouts";
import VerticalGoodsCard from "~/components/common/cards/VerticalGoodsCard";
import {addSearchKeyword} from "~/lib/shopApi";


//팝업창 닫기
function onCloseClick() {
    Webview.closePopup()
}

const SearchInput = styled(Input)`
    width: 100%;
    height: 100%;
    border: 0;     
    padding-top: ${getValue(4)};
    font-size: ${getValue(17)};    
`
function checkValidation(value) {
    if (!value) {
        alert('검색할 내용을 입력해 주세요.')
        return false
    }
    return true
}

const SearchBar = withRouter(({history}) => {
    const [tagModalState, setTagModalState] = useRecoilState(boardTagModalState)
    const [searchValue, setSearchValue] = useState('')
    const inputRef = useRef();

    useEffect(() => {
        inputRef.current.focus()
    }, [])

    useEffect(() => {
        setSearchValue(tagModalState.tag)
    }, [tagModalState.tag])

    const onKeyUp = e => {
        if (e.key === 'Enter'){
            if (checkValidation(e.target.value)){
                onSearchClick()
            }
        }
    }

    const onInputChange = e => {
        setSearchValue(e.target.value)
    }

    const onSearchClick = () => {
        if (checkValidation(searchValue)){
            setTagModalState({
                tag: searchValue
            })

            //검색 키워드 저장
            addSearchKeyword({keyword: searchValue, source: "직접검색", pageName: "통합검색"}).catch(() => {})
        }
    }

    return(
        <Flex height={60} custom={`
            border-bottom: 1px solid ${color.green};
        `}>
            <Flex bg={'white'} doActive cursor={1} width={30} height={'100%'} justifyContent={'center'} onClick={() => history.goBack()}>
                <ArrowBackButton />
            </Flex>
            <Div flexGrow={1}>
                <SearchInput ref={inputRef} value={searchValue} onKeyUp={onKeyUp} onChange={onInputChange} placeholder={'검색어를 입력하세요'}/>
            </Div>
            <Flex onClick={onSearchClick} cursor={1} width={60} height={'100%'} bg={'white'} doActive justifyContent={'center'}>
                <RiSearchLine size={20}/>
            </Flex>
        </Flex>
    )
})


// const GoodsListContainer = () => {
//     const [tagModalState] = useRecoilState(boardTagModalState)
//     const [goodsList, setGoodsList] = useState()
//
//     useEffect(() => {
//         if (tagModalState.tag) {
//             search()
//         }
//     }, [tagModalState.tag])
//
//     async function search() { //옵션:withLocalKeyworkd
//         const {data} = await getConsumerGoodsByKeyword(tagModalState.tag.toLowerCase())
//         setGoodsList(data)
//     }
//
//     if (!goodsList || goodsList.length <= 0) return null
//
//     return(
//         <GridList p={16} pb={0}>
//             {
//                 goodsList.map(goods =>
//                     <VerticalGoodsCard.Medium key={goods.goodsNo}
//                                               isThumnail={true}
//                                               goods={goods}
//                     />
//                 )
//             }
//         </GridList>
//     )
// }

const Search = (props) => {
    return(
        <div>
            <SearchBar />
            {/*<GoodsListContainer />*/}
            <CombinedSwiperContent />
        </div>
    )
}
export default Search