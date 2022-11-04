import React, {useEffect, useState, useRef} from 'react';
import {Flex, Div, GridColumns, Sticky, Img} from '~/styledComponents/shared/Layouts'
import axios from "axios";
import ComUtil from "~/util/ComUtil";
import {Input} from "~/styledComponents/shared";
import {AiOutlinePlus, AiOutlineCheck} from 'react-icons/ai'
import {color} from "~/styledComponents/Properties";
import {Collapse, Spinner} from "reactstrap";
import {BsFillCheckCircleFill} from 'react-icons/bs'
import {MdClose} from 'react-icons/md'
import InfiniteScroll from "react-infinite-scroll-component";
import { Grid } from '@giphy/react-components'
import { GiphyFetch } from '@giphy/js-fetch-api'
const gf = new GiphyFetch('8FCUyt4sUUlfM4e2LuIm1XKT7Njtvy5z')
const limit = 12

const SearchJjalbot = ({onChange, maxCount = 2}) => {

    const inputRef = useRef();
    // const {onChange}= props;
    const [offset, setOffset] = useState(-1);
    const [keyword, setKeyword] = useState('');
    const [searchedJJal, setSearchedJJal] = useState([]);
    const [selectedIdList, setSelectedIdList] = useState([]);

    // const [page, setPage] = useState(0)
    // const [limit, setLimit] = useState(18)
    const [hasMore, setHasMore] = useState(false)
    const [trendMode, setTrendMode] = useState(true)

    useEffect(() => {

        //트렌드 조회
        searchMore()

    }, [])

    const fetchImg = async (number, value) => {
        try {
            const res = await gf.search(value,{
                offset:number,
                limit: 12
                // limit: limit
            })
            console.log({number: number, res})

            return res;

            // const result = await fetch(`https://jjalbot.com/api/jjals?text=${value}`)
            // return result.json();
        } catch (e) {
            console.log(e)
        }
    }

    const fetchTrend = async () => {
        const {data} = await gf.trending({offset: 0, limit: limit});
        setSearchedJJal(data)
    }


    const firstSearch = async () => {

        const {data, pagination: {count, total_count}} = await gf.search(keyword, {offset: 0, limit: limit});

        console.log({firstSearch: data})

        setSearchedJJal(data);

        if (count <= 0) {
            setHasMore(false);
        }else{
            setHasMore(true);
        }
    }


    //조회된 data 를 map에 추가
    const searchMore = async () => {

        // let nextOffset = searchedJJal.length;

        // const {data, pagination: {count, total_count}} = await fetchImg(0, keyword);

        let data, count, totalCount;

        // const {data, pagination: {count, total_count}} = await gf.search(keyword, {offset: searchedJJal.length, limit: limit});
        if (trendMode) {
            const res = await gf.trending({offset: searchedJJal.length, limit: limit});
            data = res.data
            count = res.count
            totalCount = res.totalCount
        }else{
            const res = await gf.search(keyword, {offset: searchedJJal.length, limit: limit});
            data = res.data
            count = res.count
            totalCount = res.totalCount
        }

        let filteredImgData = []

        //giphy 의 문제로 id 가 중복된게 가끔 나온다. 그래서 수동으로 빼준다
        data.filter(newItem => {
            if (!searchedJJal.find(item => item.id === newItem.id)){
                filteredImgData.push(newItem)
            }
        })

        // searchedJJal.map(item => {
        //     const vItem = data.find(newItem => newItem.id !== item.id)
        //     if (vItem) {
        //         filteredImgData.push(vItem)
        //     }
        // })

        const newList = searchedJJal.concat(filteredImgData)

        console.log({searchedJJal, data, filteredImgData, nextOffset: searchedJJal.length})

        setSearchedJJal(newList);

        if (filteredImgData <= 0) {
            setHasMore(false);
        }else{
            setHasMore(true);
        }

        // setOffset(newList.length);
    }

    const onSearchChange = async (e) => {

        const value = e.target.value

        if (trendMode) {
            setTrendMode(false)
        }

        setKeyword(value)

        if (value){
            setSelectedIdList([]);
            firstSearch()
        }else{
            setSearchedJJal([])
            setSelectedIdList([])
            setHasMore(false)
        }
    }

    const onClick = async (id) => {

        const list = Object.assign([], selectedIdList)
        const index = list.indexOf(id)
        //짤이 이미 있으면 삭제
        if (index > -1) {
            list.splice(index, 1)
        }else{

            if (list.length >= maxCount){
                // alert(`최대 ${maxCount}개 선택 가능합니다.`)
                // return
            }

            list.push(id)
        }

        setSelectedIdList(list)

    }

    const onDeselectClick = () => {
        setSelectedIdList([])
    }
    const onAddClick = async () => {

        const list = []
        searchedJJal.map(item => {
            if (selectedIdList.indexOf(item.id) > -1) {
                // list.push(item.imageUrl)
                list.push(item)
            }
        })

        if (onChange && typeof onChange === 'function') {
            onChange(list)
        }

        setSelectedIdList([])

    }
    const onClearClick = () => {
        setKeyword('');
        // setOffset(0);
        setSelectedIdList([]);
        setSearchedJJal([]);
        setHasMore(false);

        inputRef.current.focus()
    }

    return (
        <Div relative
             id={'scrollableDiv'} overflow={'auto'} maxHeight={'calc(100vh - 150px)'}
        >
            <Sticky p={16} zIndex={2} top={0} absolute top={0} left={0} right={0}>
                {/*<Flex>*/}
                {/*<Div flexGrow={1}>*/}
                <Flex
                    absolute justifyContent={'center'} rounded={'50%'} width={30} height={30} yCenter top={'50%'} right={24} bg={'background'} zIndex={2}
                    rounded={3}
                    cursor={1}
                    doActive
                    onClick={onClearClick}
                >
                    <MdClose />
                </Flex>
                <Input ref={inputRef} type={"text"} block autocomplete="off" placeholder={'검색할 키워드를 넣으세요.'} onChange={onSearchChange} value={keyword}/>
                {/*</Div>*/}
                {/*<Flex width={45} ml={8} height={45} rounded={3} cursor={1} bg={'white'} justifyContent={'center'} bc={'light'}>*/}
                {/*    <AiOutlinePlus />*/}
                {/*</Flex>*/}
                {/*</Flex>*/}
            </Sticky>



            <Div
                p={2}
                // id={'scrollableDiv'} overflow={'auto'} maxHeight={'calc(100vh - 130px)'} p={2}
            >
                <InfiniteScroll
                    scrollableTarget="scrollableDiv"
                    dataLength={searchedJJal.length}
                    next={searchMore}
                    hasMore={hasMore}
                    loader={<Flex p={16} justifyContent={'center'}><Spinner color="success" /></Flex>}
                    // refreshFunction={search}
                >
                    <GridColumns repeat={2} colGap={2} rowGap={2}>
                        {
                            searchedJJal.map( item => {
                                return(<JjalImg key={item.id} selected={selectedIdList.indexOf(item.id) > -1 ? true : false} onClick={onClick.bind(this, item.id)} src={item.images.downsized.url}/>)
                            })
                        }
                    </GridColumns>
                </InfiniteScroll>
            </Div>

            {/*<GridColumns repeat={3} colGap={2} rowGap={2}>*/}
            {/*    {*/}
            {/*        searchedJJal && searchedJJal.map( item => {*/}
            {/*            return(<JjalImg key={item._id} selected={selectedIdList.indexOf(item._id) > -1 ? true : false} onClick={onClick.bind(this, item._id)} src={item.imageUrl}/>)*/}
            {/*        })*/}
            {/*    }*/}
            {/*</GridColumns>*/}

            <Sticky bottom={0} zIndex={2}>
                <Collapse
                    isOpen={selectedIdList.length > 0}
                    // isOpen={collapseOpen}
                >
                    <Flex justifyContent={'center'} p={16} bg={'background'}>
                        <Flex minWidth={120} minHeight={45} px={8} rounded={25} cursor={1} bg={'white'} justifyContent={'center'} bc={'light'} mr={8} onClick={onDeselectClick}>
                            <MdClose />
                            <Div ml={8}>선택취소</Div>
                        </Flex>
                        <Flex minWidth={120} minHeight={45}  px={8} rounded={25} cursor={1} bg={'green'} fg={'white'} justifyContent={'center'} bc={'light'} onClick={onAddClick}>
                            {selectedIdList.length}
                            <Div>개 추가하기</Div>
                        </Flex>
                    </Flex>
                </Collapse>
            </Sticky>



        </Div>
    )
}
export default SearchJjalbot

function JjalImg({key, onClick, src, selected, selectedCount}) {
    return (
        <Div relative cursor={1} width={'100%'} height={'18vh'} onClick={onClick}>
            {/*{*/}
            {/*    selected && (*/}
            {/*        <Flex absolute zIndex={1} justifyContent={'center'} bg={'rgba(0,0,0,0.4)'} top={0} right={0} left={0} bottom={0}>*/}
            {/*            <BsFillCheckCircleFill color={color.white} size={30}/>*/}
            {/*        </Flex>*/}
            {/*    )*/}
            {/*}*/}

            {
                selected && (
                    <Div absolute zIndex={1} justifyContent={'center'} bg={'rgba(0,0,0,0.2)'} top={0} right={0} left={0} bottom={0} p={8} custom={`
                        transition: 0.2s;
                    `}>
                        <BsFillCheckCircleFill color={color.white} size={25}/>
                    </Div>
                )
            }
            <Img key={key} src={src} height={'100%'}/>
        </Div>
    )
}

// function Mask({children}) {
//     return(
//         <Div absolute zIndex={1} justifyContent={'center'} top={0} right={0} left={0} bottom={0} p={8} custom={'tran'}>
//             {children}
//         </Div>
//     )
// }