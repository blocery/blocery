// 연관검색어(tag)
import {useRecoilState} from "recoil";
import {boardTagModalState} from "~/recoilState";
import React, {useEffect, useState} from "react";
import {getHashTagList} from "~/lib/commonApi";
import {Div, Hr} from "~/styledComponents/shared";
import HashTagList from "~/components/common/hashTag/HashTagList";

//연관 키워드
const RelatedTags = () => {
    const [tagModalState, setTagModalState] = useRecoilState(boardTagModalState)
    const [tags, setTags] = useState([])

    useEffect(() => {
        if (tagModalState.tag) {
            search()
        }
    }, [tagModalState.tag])

    const onClick = ({tag}) => {
        setTagModalState({
            ...tagModalState,
            tag: tag
        })
    }

    const search = async () => {
        const {tags} = await getHashTagList({tag: tagModalState.tag, isPaging: true, limit: 10, page: 1, recommended: true})
        setTags(tags)
    }

    if(tags.length <= 0) return null

    return(
        <>
            <Div px={16} pt={16} pb={8}>
                {/*<Div fg={'dark'} fontSize={12} mb={5}>연관검색어</Div>*/}
                <HashTagList tags={tags} isViewer={true} onClick={onClick} />
            </Div>
        </>

    )
}
export default RelatedTags