import React, {useContext, useEffect, useState, useRef, useCallback} from "react";
import {Button, Div, Flex, Grid, GridColumns, Input, Space} from "~/styledComponents/shared";
import {FilterContext} from "~/components/common/filter/FilterContext";
import {initialFilterOptionStore, KEY} from './FilterStore'
import ComUtil from "~/util/ComUtil";
import DoubleSlider from "~/components/common/filter/components/DoubleSlider";
import FilterHookContent from "~/components/common/filter/hookComponents/FilterHookContent";
import {MdClose, MdCloud, MdFrontHand, MdRiceBowl} from "react-icons/all";
import {color} from "~/styledComponents/Properties";
import {RiSearchLine} from 'react-icons/ri'
import {Server} from "~/components/Properties";

/**
 * [README] 필터에 관한 컨텐츠를 마음대로 커스터마이징 하여 추가해도 되지만 onChange 시 {key, data : {value, label, data}} 형식에 맞게 호출 해 줘야 함
 **/


//검색 컨텐츠
const Keyword = () => {
    const key = KEY.KEYWORD
    const {filterInfo, getFilterOptions, updateFilterOptions, onForceChange, onRemove} = useContext(FilterContext)
    const filterOptions = getFilterOptions(key)
    const [inputValue, setInputValue] = useState(filterOptions[0].data)
    const inputRef = useRef();
    const onInputChange = e => {
        setInputValue(e.target.value)
    }
    // useEffect(() => {
    //     console.log(filterInfo[key], filterOptions)
    //     setInputValue(filterOptions[0].data)
    // }, [filterOptions[0].data])

    useEffect(() => inputRef && inputRef.current.focus(), [])

    const onApplyClick = () => {

        if (!inputValue) {
            // alert('검색어를 입력해 주세요.')
            return
        }

        const newOption = {value: '0', label: inputValue, data: inputValue}

        //필터 옵션 data 변경
        updateFilterOptions(key, [newOption])

        //필터 변경
        onForceChange({
            key: key,
            data: newOption
        })
    }

    //필터 제거
    const onCancelClick = () => {

        //필터에 바인딩 된게 있을때만 삭제
        if (filterInfo[key].data)
            onRemove(key)

        updateFilterOptions(key, initialFilterOptionStore[key])

        //인풋값 제거
        setInputValue('')
    }

    const onKeyUp = e => {

        if(e.key === 'Enter'){
            onApplyClick()
            //포커스 밖으로 빠져 나가도록
            inputRef.current.blur()
        }
    }

    return (
        <Div p={16}>
            <Flex rounded={4} overflow={'hidden'} bc={'light'} >
                <Div relative flexGrow={1}>
                    <Div absolute right={16} top={'50%'} yCenter>
                        <MdClose color={color.secondary} size={20} onClick={onCancelClick}/>
                    </Div>
                    <Input type='search' ref={inputRef} style={{border: 0}} rounded={0} value={inputValue} block placeholder={'사과'} onKeyUp={onKeyUp} onChange={onInputChange} />
                </Div>
                <Button style={{flexShrink: 0, border: 0, minWidth: 70}} fontSize={14} rounded={0} height={45} bc={0} onClick={onApplyClick} bg={'primary'} fg={'white'}>
                    <RiSearchLine color={color.white} style={{marginRight:4}} size={20}/>
                </Button>
            </Flex>
        </Div>


    )
}


//가격
const GoodsPrice = () => {

    const {filterInfo, filterOptionInfo, setFilterOptionInfo, getFilterOptions, getFilterOption, onChange, onForceChange} = useContext(FilterContext)

    const filterKey = KEY.GOODS_PRICE

    //초기 options 배열
    const myFilterOptions = getFilterOptions(filterKey)

    //커스텀 지정되 옵션 조회
    const customOption = myFilterOptions.find(option => option.isCustomValue === true)
    const [goodsPrice, setGoodsPrice] = useState([customOption.data[0], customOption.data[1]])

    const min = 0
    const max = 300000

    const onApplyClick = () => {

        //필터정보 교체
        const newFilterOptionData = {...filterOptionInfo}     //전체 필터 복사
        const newOptions = newFilterOptionData[filterKey]
        const customOption = newOptions.find(option => option.isCustomValue === true)
        customOption.label = `${ComUtil.addCommas(goodsPrice[0])}원 ~ ${ComUtil.addCommas(goodsPrice[1])}원`
        customOption.data = [goodsPrice[0], goodsPrice[1]]

        //필터 옵션 업데이트
        setFilterOptionInfo(newFilterOptionData)

        onForceChange({
            key: filterKey,
            data: customOption
        })
    }

    const onSliderChange = (value) => {
        setGoodsPrice(value)
    }

    //customValue 옵션을 제외
    const arr = getFilterOptions(filterKey, false)

    return(
        <div>

            <FilterHookContent.SwiperContent filterOptions={arr} filterKey={filterKey} columnCount={2} pageCount={6} />

            {/* options 에서 isCustomValue = true 인 항목 제어 */}
            <Grid px={16} mb={20} mt={8} height={30} templateColumns={`1fr 12px 1fr 68px`} colGap={8}>
                <Flex px={8} bg={'#ececec'} bc={'#cecece'} height={'100%'} rounded={2}>{ComUtil.addCommas(goodsPrice[0])}</Flex>
                <Flex justifyContent={'center'} textAlign={'center'}>~</Flex>
                <Flex px={8} bg={'#ececec'} bc={'#cecece'} height={'100%'} rounded={2} >{ComUtil.addCommas(goodsPrice[1])}</Flex>
                <Button block px={16} height={30} bg={'dark'} fg={'white'} onClick={onApplyClick}>적용</Button>
            </Grid>
            <Div px={16} pb={16}>
                <DoubleSlider
                    min={min}
                    max={max}
                    defaultValue={goodsPrice}
                    value={goodsPrice}
                    onChange={onSliderChange}
                />
                <GridColumns repeat={3} colGap={0} rowGap={0} mt={10} fg={'darkBlack'} fontSize={12} px={8}>
                    <div>{min}</div>
                    <div style={{textAlign: 'center'}}>{ComUtil.addCommas(ComUtil.roundDown((max/2)/10000, 0))}만</div>
                    <div style={{textAlign: 'right'}}>{ComUtil.addCommas(max / 10000)}만</div>
                </GridColumns>
            </Div>


        </div>
    )
}

//해시태그 컨텐츠
const Hashtag = (props) => {
    const {getFilterOptions} = useContext(FilterContext)
    const filterOptions = getFilterOptions(KEY.HASHTAG)
    return <FilterHookContent.AContent filterOptions={filterOptions} filterKey={KEY.HASHTAG} columnCount={3}/>
}

//그룹 해시태그 컨텐츠
const ThemeHashtag = (props) => {
    const {getFilterOptions} = useContext(FilterContext)
    const filterOptions = getFilterOptions(KEY.THEME_HASHTAG)
    return <FilterHookContent.SwiperContent filterOptions={filterOptions} filterKey={KEY.THEME_HASHTAG} columnCount={1} pageCount={4}/>
}

//카테고리 해시태그 컨텐츠
const CategoryHashtag = (props) => {

    const {getFilterOptions} = useContext(FilterContext)
    const filterOptions = getFilterOptions(KEY.CATEGORY)

    // const CategoryLabelRenderer = useCallback(({option}) => {
    //     let src = option.image ? Server.getImageURL() + option.image.imageUrl : ''
    //     return (
    //         <Flex py={10} px={15}>
    //             <div>
    //                 {src && <img src={src} style={{width: 40, height: 40, marginBottom: 6}} />}
    //             </div>
    //             <div style={{textAlign: 'center'}}>
    //                 {option.label}
    //             </div>
    //         </Flex>
    //     )
    // }, [])

    return <FilterHookContent.AContent
                filterOptions={filterOptions}
                filterKey={KEY.CATEGORY}
                columnCount={3}
                // labelRenderer={CategoryLabelRenderer}
            />
}


//상품종류 컨텐츠
const GoodsType = (props) => {
    const {getFilterOptions} = useContext(FilterContext)
    const filterOptions = getFilterOptions(KEY.GOODS_TYPE)
    return <FilterHookContent.AContent filterOptions={filterOptions} filterKey={KEY.GOODS_TYPE} columnCount={2}/>
}

export default {
    Keyword,
    GoodsPrice,
    Hashtag,
    ThemeHashtag,
    CategoryHashtag,
    GoodsType
}