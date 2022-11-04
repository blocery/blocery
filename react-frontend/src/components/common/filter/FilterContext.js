import React, {createContext, useState, useEffect} from "react";
import {initialFilterStore, initialFilterOptionStore, optionFetch, KEY} from './FilterStore'
import ComUtil from "~/util/ComUtil";

export const FilterContext = createContext()

/**
 * 필터 컴포넌트의 context (children 에게 공유되는 컴포넌트 내 전역 변수)
 * @param visibleFilterKeys
 * @param initialFilter
 * @param initialOptionData
 * @param onFilterChange
 * @param children
 * @returns {JSX.Element}
 * @constructor
 */
const FilterContextComponent = ({
                                    pageInfo,
                                    visibleFilterKeys = [],
                                    initialFilter = {},
                                    initialOption = {},
                                    initialOpenKey = null,
                                    onFilterChange,
                                    children
                                }) => {

    const [filterInfo, setFilterInfo] = useState({...initialFilterStore, ...initialFilter})
    const [filterOptionInfo, setFilterOptionInfo] = useState({...initialFilterOptionStore, ...initialOption}) //initial 값 넣으면 될듯 함..
    const [openKey, setOpenKey] = useState(initialOpenKey)
    const [scrollToEndDate, setScrollToEndDate] = useState()
    const [loading, setLoading] = useState(true)


    //DB 에서 조회해서 옵션 값을 동적으로 바꾸고자 할때
    useEffect(() => {
        fetchAllFilterOptions()
    }, []);

    async function fetchAllFilterOptions() {
        const newFilterOptionInfo = {...filterOptionInfo}

        const promises = []
        //활성화 되어 있는 필터만 조회
        Object.keys(optionFetch).map(key => {
            if (visibleFilterKeys.includes(key)) {

                //TODO 방법 1 (FilterStore.js 참고)
                // const promise = new Promise(async (resolve, reject) => {
                //     const options = await optionFetch[key]
                //     resolve({key: key, options: options})
                // })

                //TODO 방법 2 (FilterStore 참고)
                const promise = optionFetch[key]

                promises.push(promise)
            }
        })

        const res = await Promise.all(promises)

        console.log({res})

        //업데이트
        res.map(optionInfo => {
            newFilterOptionInfo[optionInfo.key] = optionInfo.options
        })
        setFilterOptionInfo(newFilterOptionInfo)
        setLoading(false)
    }


    /**
     * 필터 옵션 LIST 반환
     * @param filterKey 필터 키
     * @param isIncludeCustomValueOption isCustomValue 옵션 포함시킬지 여부 (default: true)
     * @returns {*}
     */
    function getFilterOptions(filterKey, isIncludeCustomValueOption = true) {
        if (isIncludeCustomValueOption) {
            return filterOptionInfo[filterKey]
        }else{
            return filterOptionInfo[filterKey].filter(option => !option.isCustomValue)
        }
    }

    /**
     * 필터 옵션 한건 반환
     * @param filterKey
     * @param value
     * @returns {{label: string, value: string}}
     */
    function getFilterOption(filterKey, optionValue) {
        return getFilterOptions(filterKey).find(option => option.value.toString().toUpperCase() === optionValue.toString().toUpperCase())
    }


    //[필터 변경] 적용되어 있는 필터의 변경 (부모 onChange 호출)
    //data: {value, label, data}
    const onForceChange = async ({key, data}) => {

        console.log({"1-forceChange initialFilterOptionStore::":initialFilterOptionStore})

        const copyFilterInfo = {...filterInfo}
        const filter = copyFilterInfo[key]
        //이미 선택되어 있는 필터 값이 없을때는 제일 뒤로 가기 위해 현재 키를 삭제
        delete copyFilterInfo[key]
        const mergedData = {...filter, ...data}
        const newFilterInfo = {
            ...copyFilterInfo,
            [key]: mergedData
        }


        // console.log("filter :: onForceChange", {key, data, newFilterInfo, filterOptionInfo})

        setFilterInfo(newFilterInfo)
        //스크롤 끝으로 이동 지시
        setScrollToEndDate(new Date().getTime())

        await ComUtil.delay(200)

        console.log({"1-forceChange initialFilterOptionStore::":initialFilterOptionStore})

        //부모 필터 변경 호출
        callback(newFilterInfo, filterOptionInfo)
    }

    //[필터 변경] 변경 및 삭제를 수행하는 함수 (value 가 없으면 추가, 중복되면 알아서 제거)
    //data: {value, label, data}
    const onChange = ({key, data}) => {

        const value = data.value

        //같은걸 중복해서 클릭 시 필터에서 제거
        if (value === filterInfo[key].value) {
            onRemove(key)
            return
        }


        onForceChange({key, data})
    }

    //[필터 삭제] (부모 onChange 호출)
    const onRemove = key => {
        const newFilterInfo = {...filterInfo}

        //초기값을 넣어 줌
        newFilterInfo[key] = {...initialFilterStore[key]}

        // newFilterInfo[key] = {...newFilterInfo[key], value: '', label: '', data: ''}

        console.log("filter :: onRemove", {key, newFilterInfo})

        setFilterInfo(newFilterInfo)

        //부모 필터 변경 호출
        callback(newFilterInfo)
    }

    //필터 옵션 data 업데이트(부모 onChange 호출 X )
    const updateFilterOptions = (key, filterOptions) => {
        const newFilterOptionInfo = {...filterOptionInfo}
        newFilterOptionInfo[key] = filterOptions
        console.log({"2:updateFilterOptions()":newFilterOptionInfo})
        setFilterOptionInfo(newFilterOptionInfo)
    }

    //적용된 필터 전체 삭제 (부모 onChange 호출)
    const clearAll = () => {
        setFilterInfo(initialFilterStore)

        //부모 필터 변경 호출
        callback(initialFilterStore)

    }

    const callback = (filter, optionObj) => {
        //부모 필터 변경 호출
        if (onFilterChange && typeof onFilterChange === 'function') {
            onFilterChange(filter, optionObj)
        }
    }

    //필터 컨텐츠 토글
    const toggleFilterContent = (key, e) => {

        console.log("toggleFilterContent", {openKey, key})

        e.stopPropagation()
        //null === 'objectUnique...'
        if (openKey === key){
            setOpenKey(null)
        }else{
            setOpenKey(key)
        }
    }

    return (
        <FilterContext.Provider value={{
            pageInfo,
            getFilterOptions,
            getFilterOption,
            visibleFilterKeys,
            filterOptionInfo,
            setFilterOptionInfo,
            updateFilterOptions,
            filterInfo, setFilterInfo, toggleFilterContent, openKey, onChange, onForceChange, onRemove, clearAll,
            scrollToEndDate
        }}>
            {children}
        </FilterContext.Provider>
    )
};

export default FilterContextComponent;
