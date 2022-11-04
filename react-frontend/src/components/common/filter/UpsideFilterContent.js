import React, {useCallback, useContext, useEffect, useRef, useState} from 'react';
import {FilterContext} from "~/components/common/filter/FilterContext";
import {initialFilterStore, initialFilterOptionStore, KEY} from "~/components/common/filter/FilterStore";
import {Server} from "~/components/Properties";
import {Button, Div, Flex, Input} from "~/styledComponents/shared";
import FilterHookContent from "~/components/common/filter/hookComponents/FilterHookContent";
import {MdClose} from "react-icons/all";
import {color} from "~/styledComponents/Properties";
import {RiSearchLine} from "react-icons/ri";
import ComUtil from "~/util/ComUtil";
import {addSearchKeyword} from "~/lib/shopApi";

//검색 컨텐츠
export const Keyword = ({style = {}}) => {
    const key = KEY.KEYWORD
    const {pageInfo, filterInfo, getFilterOptions, getFilterOption, filterOptionInfo, setFilterOptionInfo, updateFilterOptions, onForceChange, onRemove} = useContext(FilterContext)

    const filterOption = getFilterOption(key, '0')
    const [inputValue, setInputValue] = useState(filterOption.data)
    const inputRef = useRef();
    const onInputChange = e => {
        setInputValue(e.target.value)
        console.log({"e.target.value":e.target.value})
    }
    // useEffect(() => {
    //     console.log(filterInfo[key], filterOptions)
    //     setInputValue(filterOptions[0].data)
    // }, [filterOptions[0].data])

    // useEffect(() => inputRef && inputRef.current.focus(), [])

    const onApplyClick = async () => {

        if (!inputValue) {
            // alert('검색어를 입력해 주세요.')
            return
        }

        //필터정보 교체
        const newFilterOptionData = {...filterOptionInfo}     //전체 필터 복사

        const newOptions = newFilterOptionData[key]
        newOptions[0].label = inputValue
        newOptions[0].data = inputValue

        //필터 옵션 data 변경 (부모콜백 X)
        updateFilterOptions(key, newOptions)

        //필터 변경 (부모콜백 O)
        onForceChange({
            key: key,
            data: newOptions[0]
        })
        console.log({pageInfo})
        //검색 키워드 저장
        addSearchKeyword({keyword: inputValue, source: "직접검색", pageName: pageInfo.pageName, producerNo: pageInfo.producerNo ? Number(pageInfo.producerNo) : 0 }).catch(() => {})
    }

    //필터 제거
    const onCancelClick = () => {

        //필터에 바인딩 된게 있을때만 삭제
        if (filterInfo[key].data)
            onRemove(key)

        const newFilterOptions = filterOptionInfo[key]
        newFilterOptions[0].label = ''
        newFilterOptions[0].data = ''

        //옵션은 바뀌기 때문에 initialOptionStore 를 넣어 주면 안됨(왜 initialFilterStore 값이 바뀌어 있는지 의문)
        updateFilterOptions(key, newFilterOptions)

        //인풋값 제거
        setInputValue('')
    }

    const onKeyPress = e => {

        if(e.key === 'Enter'){
            onApplyClick()
            //포커스 밖으로 빠져 나가도록
            inputRef.current.blur()
        }
    }

    return (
        <Div p={16} {...style}>
            {/*<button onClick={() => console.log({initialFilterOptionStore})}></button>*/}
            <Flex rounded={4} overflow={'hidden'} bc={'light'} >
                <Div relative flexGrow={1}>
                    <Div absolute right={16} top={'50%'} yCenter>
                        <MdClose color={color.secondary} size={20} style={{cursor: 'pointer'}} onClick={onCancelClick}/>
                    </Div>
                    <Input type='search' ref={inputRef} style={{border: 0}} rounded={0} value={inputValue} block placeholder={'산양우유'} onKeyPress={onKeyPress} on onChange={onInputChange} />
                </Div>
                <Button style={{flexShrink: 0, border: 0, minWidth: 70}} fontSize={14} rounded={0} height={45} bc={0} onClick={onApplyClick} bg={'primary'} fg={'white'}>
                    <RiSearchLine color={color.white} style={{marginRight:4}} size={20}/>
                </Button>
            </Flex>
        </Div>


    )
}


// export const Category = (props) => {
//     const {getFilterOptions} = useContext(FilterContext)
//     const filterOptions = getFilterOptions(KEY.CATEGORY)
//
//     const CategoryLabelRenderer = useCallback(({option}) => {
//         let src = option.image ? Server.getImageURL() + option.image.imageUrl : ''
//         return (
//             <Flex py={10} px={15}>
//                 <div>
//                     {src && <img src={src} style={{width: 40, height: 40, marginBottom: 6}} />}
//                 </div>
//                 <div style={{textAlign: 'center'}}>
//                     {option.label}
//                 </div>
//             </Flex>
//         )
//     }, [])
//
//     return <FilterHookContent.ABorderedGridContent
//         filterOptions={filterOptions}
//         filterKey={KEY.CATEGORY}
//         columnCount={3}
//         hideDot={true}
//         labelRenderer={CategoryLabelRenderer}
//     />
// };

export default {
    Keyword,
    // Category
};
