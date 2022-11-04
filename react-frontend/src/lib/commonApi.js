import axios from 'axios'
import axiosCache from "~/lib/axiosCache";
import { Server } from "../components/Properties";

//전체 생산자 상품 중 최신 재배일지 조회
export const getServerToday = () => axios.get(Server.getRestAPIHost() + '/common/today', { withCredentials: true, credentials: 'same-origin' })

export const getServerTodayTime = () => axios.get(Server.getRestAPIHost() + '/common/todaytime', { withCredentials: true, credentials: 'same-origin' })

export const getServerVersion =  () => axios.get(Server.getRestAPIHost() + '/version', { withCredentials: true, credentials: 'same-origin' });

export const getSitemap = () => axios.get(Server.getRestAPIHost() + '/sitemap', { withCredentials: true, credentials: 'same-origin' });

/**
    해시태그 조회(연관검색어 or 추천해시태그)
    recommended : 추천단어 구분. true면 파라미터로 받은 tag 에서 적당히 substring 하여 regex 함.
 **/
export const getHashTagList = ({tag, isPaging = false, limit = 10, page = 1, recommended = false}) => new Promise((resolve) => {
    axios.get(Server.getRestAPIHost() + '/common/hashTag', { params: {tag, isPaging, limit, page, recommended}, withCredentials: true, credentials: 'same-origin' }).then(res => {
        const returnData = {
            tags: [],
            totalCount: 0
        }

        if (res.status === 200) {

            const {hashTags, totalCount} = res.data


            if (recommended) {
                //추천 단어일 경우 작성한 키워와 일치한것은 제외후 리턴
                hashTags.map(hashTag => hashTag.tag !== tag && returnData.tags.push(hashTag.tag))
            }else{
                //조회된 그대로 리턴
                hashTags.map(hashTag => returnData.tags.push(hashTag.tag))
            }
            returnData.totalCount = totalCount

        }
        resolve(returnData)
    })
})

//해시태그 그룹 전체 조회(노출된것만)
export const getAllHashTagGroupList = () => axios.get(Server.getRestAPIHost() + '/common/hashTagGroup/all', { params: {}, withCredentials: true, credentials: 'same-origin' })

//해시태그 그룹조회 (visiblePage)
export const getHashTagGroupListByVisiblePage = (visiblePage, producerNo, forceUpdate = true, signal) => axiosCache.get(Server.getRestAPIHost() + '/common/hashTagGroup/visiblePage', { params: {visiblePage, producerNo:producerNo}, withCredentials: true, credentials: 'same-origin', forceUpdate, cache: true, signal })
