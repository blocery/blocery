import React, {useState, useEffect} from 'react';
import {getHashTagList} from "~/lib/commonApi";

const useTagSearch = ({initialValue, initialLimit = 10, recommended}) => {
    const [value, setValue] = useState(initialValue)
    const [tags, setTags] = useState([])

    const [page, setPage] = useState(0)
    const [totalCount, setTotalCount] = useState(0)

    const clear = () => setTags([])
    const onChange = async (e) => {
        const {value: inputValue} = e.target
        if(inputValue) {
            //recommended : 추천단어 구분. true면 파라미터로 받은 tag 에서 적당히 substring 하여 regex 함.
            const params = {tag: inputValue, isPaging: true, limit: initialLimit, page: 1, recommended}
            const {tags, totalCount} = await getHashTagList(params)
            console.log({tags})
            setTags(tags)

            setValue(inputValue)
            setPage(1)
            setTotalCount(totalCount)
        }else{
            setTags([])
        }
    }

    //TODO 아직 테스트안해봄. 추후 해시테그 조회 페이지에서 사용 할 예정
    const fetch = async () => {
        const params = {tag: value, isPaging: true, limit: initialLimit, page: page + 1, recommended}
        const data = await getHashTagList(params)

        const newTags = tags.concat(data.tags)

        setTags(newTags)
        setPage(params.page)
        setTotalCount(data.totalCount)
    }

    return {value, setValue, tags, onChange, clear, fetch, page, totalCount}
};

export default useTagSearch;
