import React, {useState, useRef, useEffect} from "react";
import {Div, Flex, GridColumns, Hr, Input, Right, Space, Span, Strong} from "~/styledComponents/shared";
import {MenuButton} from "~/styledComponents/shared/AdminLayouts";
import Textarea from "react-textarea-autosize";
import _ from 'lodash'
import {MdClose} from "react-icons/md"
import {getGoodsByGoodsNo} from "~/lib/goodsApi";
import ComUtil from "~/util/ComUtil";
import {color} from "~/styledComponents/Properties";
import AdminApi from '~/lib/adminApi'
import { ToastContainer, toast } from 'react-toastify'
import {updateAlrimInfo} from "~/lib/shopApi";
import {getProducerByProducerNo} from "~/lib/producerApi";                              //토스트
import styled from 'styled-components'
import {IoIosArrowUp, IoIosArrowDown} from 'react-icons/io'
import GoodsBadges from "~/components/common/badges/GoodsBadges";
import {useRecoilState} from "recoil";
import {boardTagModalState} from "~/recoilState";

const COLOR = {
    GROUP_TAG: color.special,
    TAG: color.primary,
}

const BOX_SHADOW = {
    GROUP_TAG: `box-shadow: 0 0 0 1.5px ${COLOR.GROUP_TAG}`,
    TAG: `box-shadow: 0 0 0 1.5px ${COLOR.TAG}`,
}

const TYPE = {
    GROUP_TAG: 'groupTags',
    TAG: 'tags'
}

const ImsiMark = () => <Div bg={'danger'} width={10} height={10}></Div>

function getFilteredListByStr(strTag) {
    //스페이스 제거된, 줄바꿈 제거
    const __tags = strTag.toLowerCase().replace(/\s/g, "").replace(/\r?\n|\r/g).split(',');

    //값 있는거만 필터
    const tags = __tags.filter(tag => tag !== null && tag !== undefined && tag !== '')
    return tags
}

function getStrGoodsNo(goodsList) {
    const goodsNoList = []
    goodsList.map(goods => goodsNoList.push(goods.goodsNo))
    return goodsNoList.join(', ')
}


function HashtagMultiSaveContent({goodsList = [], onClose}) {

    const [tagModalState, setTagModalState] = useRecoilState(boardTagModalState)

    const [list, setList] = useState([])

    // const [strGoodsNo, setStrGoodsNo] = useState(getStrGoodsNo(goodsList))

    const [backupObj, setBackupObj] = useState({})
    const [backupGroupObj, setBackupGroupObj] = useState({})

    // const [strTag, setStrTag] = useState('')

    const strGoodsNoRef = useRef() //textarea ref(상품번호)
    const strTagRef = useRef() //textarea ref(tags 태그입력)
    const strGroupTagRef = useRef() //textarea ref(그룹 태그입력)

    const [unionTagObj, setUnionTagObj] = useState({})
    const [unionGroupTagObj, setUnionGroupTagObj] = useState({})
    const [producer, setProducer] = useState()

    useEffect(() => {
        strGoodsNoRef.current.value = getStrGoodsNo(goodsList)
        //DB로 조회해서 싱크 맞추
        onGoodsSearchClick()
    }, [])


    useEffect(() => {

        //합집합
        let newTagObj = {}
        const newGroupTagObj = {}
        list.map(goods => {
            goods.tags.map(tag => {
                newTagObj[tag] = tag
            })
            goods.groupTags.map(tag => {
                newGroupTagObj[tag] = tag
            })
        })
        setUnionTagObj(newTagObj)
        setUnionGroupTagObj(newGroupTagObj)

    }, [list]);

    // useEffect(() => {
    //     strGoodsNoRef.current.value = strGoodsNo
    // }, [strGoodsNo])
    //
    // useEffect(() => {
    //     strTagRef.current.value = strTag
    // }, [strTag])

    //생산자 번호로 조회
    const searchProducerGoods = async () => {
        const value = window.prompt('생산자번호를 입력해주세요. (판매중단을 제외한 모든 상품을 검색 합니다)', producer ? producer.producerNo : '')
        if (!isNaN(value)) {
            try{
                const {status, data} =  await AdminApi.getAllProducerGoods(value)

                if (status === 200 || data) {
                    if (data.length <= 0) {
                        alert('조회된 상품이 없습니다. 생산자 번호를 다시 확인 바랍니다.')
                        return
                    }

                    // console.log("===", strTag)

                    const goodsNoList = []
                    data.map(goods => goodsNoList.push(goods.goodsNo))

                    const strGoodsNos = goodsNoList.join(', ')

                    fillMatchedTag(strTagRef.current.value, setStrTagObj)
                    fillMatchedTag(strGroupTagRef.current.value, setStrGroupTagObj)

                    // setStrGoodsNo(strGoodsNos)
                    setList(data)

                    strGoodsNoRef.current.value = strGoodsNos

                    //임시
                    // setStrTag(strTagRef.current.value)


                    //전부 삭제모드로 강제 전환
                    setBackupObj({})
                    setBackupGroupObj({})

                    const {data: producer} = await getProducerByProducerNo(value)
                    setProducer(producer)
                }
            }catch (error) {
                alert('가져오기를 실패하였습니다.')
            }
        }
    }

    //알아 서추가 (다른 단어 일 경우 추가)
    const onPushClick = (type) => {

        let ref = type === TYPE.TAG ? strTagRef : strGroupTagRef

        if (!ref.current.value) {
            toast.warn("추가할게 없는뎁쇼!", {
                position: toast.POSITION.TOP_CENTER
            })
        }

        const tags = getFilteredListByStr(ref.current.value)

        const newList = list.map(goods => {
            const newTags = _.union(goods[type], tags)
            return {
                ...goods,
                [type]: newTags
            }
        })
        setList(newList)

        if (type === TYPE.TAG) {
            //전부 삭제모드로 강제 전환
            setBackupObj({})
            // strTagRef.current.focus()
        }else{
            //전부 삭제모드로 강제 전환
            setBackupGroupObj({})

        }

        ref.current.focus()
    }


    //일치되는 항목 제거
    const onRemoveOnlyMatchedClick = (column) => {
        // const tags = getFilteredListByStr(strTag)
        //
        // const newList = list.map(goods => ({
        //     ...goods,
        //     tags: _.difference(goods.tags, tags) //차집합
        // }))
        //
        // setList(newList)
        //
        // //전부 삭제모드로 강제 전환
        // setBackupObj({})

        const ref = column === TYPE.TAG ? strTagRef : strGroupTagRef

        if (!ref.current.value) {
            toast.warn("제거할게 없는뎁쇼!", {
                position: toast.POSITION.TOP_CENTER
            })
        }

        const tags = getFilteredListByStr(ref.current.value)
        removeOnlyMatched(tags, column)
        ref.current.focus()
    }

    const removeOnlyMatched = (tags, column) => {
        const newList = list.map(goods => ({
            ...goods,
            [column]: _.difference(goods[column], tags) //차집합
        }))

        setList(newList)

        //전부 삭제모드로 강제 전환
        if (column === TYPE.TAG) {
            setBackupObj({})
        }else{
            setBackupGroupObj({})
        }

    }

    //전부 지우고 이걸로 대체
    const onRemoveAndOverWriteAllClick = (column) => {

        let ref;
        let word;
        if (column === TYPE.TAG) {
            word = '상품'
            ref = strTagRef;
        }else{
            word = '그룹'
            ref = strGroupTagRef
        }
        if (!window.confirm(list.length + `개의 상품 ${word} 해시태그를 모두 지우고 이걸로 대체 하시겠습니까?`)) {
            return
        }

        const tags = getFilteredListByStr(ref.current.value)

        const newList = list.map(goods => ({
            ...goods,
            [column]: tags
        }))

        setList(newList)

        if (column === TYPE.TAG){
            //전부 삭제모드로 강제 전환
            setBackupObj({})
        }else{
            //전부 삭제모드로 강제 전환
            setBackupGroupObj({})
        }

        ref.current.focus()
    }



    //상품 삭제
    const onRemoveGoodsClick = (goodsNo, e) => {
        e.stopPropagation()
        const goods = list.find(goods => goods.goodsNo === goodsNo)
        if (!window.confirm(`"${goods.goodsNm}" 상품을 제외 시키겠습니까?`)) {
            return
        }

        const newList = list.filter(goods => goods.goodsNo !== goodsNo)
        setList(newList)
    }

    //상품 하나의 태그 전체삭제 클릭
    const onRemoveAllClick = (goodsNo, column) => {

        const newList = Object.assign([], list)
        const goods = newList.find(goods => goods.goodsNo === goodsNo)

        if (goods[column].length <= 0) {
            alert('삭제할 태그가 없습니다.')
            return
        }

        //백업 처리
        procBackup(goods, column)

        goods[column] = []
        setList(newList)
    }

    //복구하기 클릭
    const onRecoverClick = (goodsNo, column) => {
        const newList = Object.assign([], list)
        const goods = newList.find(goods => goods.goodsNo === goodsNo)

        //백업 삭제 처리
        procBackup(goods, column)

        goods[column] = column === TYPE.TAG ? backupObj[goodsNo] : backupGroupObj[goodsNo]

        setList(newList)
    }

    //상품의 태그 하나 삭제
    const onRemoveOneTagClick = (goodsNo, tag, column, e) => {
        e.stopPropagation()
        const newList = Object.assign([], list)
        const goods = newList.find(goods => goods.goodsNo === goodsNo)
        const index = goods[column].indexOf(tag.toLowerCase())
        if (index > -1) {
            goods[column].splice(index, 1)
        }

        setList(newList)
    }

    const procBackup = (goods, column) => {

        const newBackupObj = Object.assign({}, column === TYPE.TAG ? backupObj : backupGroupObj)

        //이미 들어있으면 삭제
        if (newBackupObj[goods.goodsNo]) {
            delete newBackupObj[goods.goodsNo]
        }//없으면 추가
        else{
            newBackupObj[goods.goodsNo] = goods[column]
        }

        // setBackupObj({
        //     ...backupObj,
        //     [goods.goodsNo]: goods.tags
        // })

        if (column === TYPE.TAG)
            setBackupObj(newBackupObj)
        else
            setBackupGroupObj(newBackupObj)
    }

    //상품코드로 검색
    const onGoodsSearchClick = async () => {

        const goodsNoList = _.uniq(getFilteredListByStr(strGoodsNoRef.current.value))
        // .filter(goodsNo => !isNaN(goodsNo))

        //숫자만 필터링된 리스트
        const filteredGoodsNoList = goodsNoList.filter(goodsNo => !isNaN(goodsNo))
        //문자가 섞여있는 잘못된 리스트
        const isNanGoodsNoList = goodsNoList.filter(goodsNo => isNaN(goodsNo))

        if(list.length > 0) {
            if (!window.confirm(`작업중이었던 태그가 있을 경우 미리 저장해 주세요. ${filteredGoodsNoList.length > 0 ? '조회 하시겠습니까?' : '클리어 하시겠습니까?'}`)) {
                return
            }
        }

        if (isNanGoodsNoList.length > 0) {
            let msg = ''
            isNanGoodsNoList.map(goodsNo => msg += goodsNo + " ")

            alert('상품코드 '+ msg + '가 잘못 되어 검색에 제외 되었습니다.')
        }

        const newGoodsList = []

        const promises = filteredGoodsNoList.map(goodsNo => getGoodsByGoodsNo(goodsNo).then(({data}) => {
            if (data) {
                newGoodsList.push(data)
            }
        }))

        await Promise.all(promises)

        ComUtil.sortNumber(newGoodsList, 'goodsNo')

        // const newList = res.map(({data}) => data)
        //
        // console.log({goodsNoList, newList})

        fillMatchedTag(strTagRef.current.value, setStrTagObj)
        fillMatchedTag(strGroupTagRef.current.value, setStrGroupTagObj)

        setList(newGoodsList)
        setBackupObj({})
        setBackupGroupObj({})

        //setStrTagObj()

    }


    //합집합 된 태그 클릭시 상품 리스트에서 해당 해시태그 전부 제거
    const onUnionTagClick = (tag, column, e) => {
        e.stopPropagation()
        removeOnlyMatched([tag], column)
    }

    const onSaveClick = async () => {

        if (!window.confirm('저장 하시겠습니까?')) {
            return
        }

        const promises = list.map(goods => AdminApi.updateGoodsTags(goods))

        await Promise.all(promises)

        toast.success("저장 되었습니다.",{
            position: toast.POSITION.TOP_CENTER
        })

        if (onClose && typeof onClose === 'function') {
            onClose()
        }
    }

    // const [tempChecked , setTempChecked] = useState(true)
    //
    // const onCheckboxChange = (e) => {
    //     const name = e.target.name
    //     if (name === 'temp') {
    //         setTempChecked(e.target.checked)
    //     }
    // }
    //

    //해시태그 클릭
    const onTagClick = (tag, e) => {
        e.stopPropagation()
        setTagModalState({
            tag: tag,
            isOpen: true
        })
    }

    // const [strTagList, setStrTagList] = useState([])

    const [strTagObj, setStrTagObj] = useState({})
    const [strGroupTagObj, setStrGroupTagObj] = useState({})

    const onTagBlur = (type, e) => {
        // const tagList = getFilteredListByStr(e.target.value)
        // setStrTag(tagList.join(', '))
        // setStrTagList(tagList)

        if (type === TYPE.TAG) {
            fillMatchedTag(e.target.value, setStrTagObj)
        }else{
            fillMatchedTag(e.target.value, setStrGroupTagObj)
        }
    }

    const fillMatchedTag = (tagValue, setter) => {
        const tagList = getFilteredListByStr(tagValue)
        const newTagObj = {}
        tagList.map(tag => {
            newTagObj[tag] = tag
        })

        setter(newTagObj)

        // setStrTagObj(newTagObj)
    }

    return(
        <>

            <Flex px={16} py={10} bg={'background'}>
                <Div fg={'green'}><b>여기서 변경된 모든 내용은 <u>저장시 반영</u> 됩니다.</b></Div>
                <Right>
                    <MenuButton bg={'green'} onClick={onSaveClick}>저장</MenuButton>
                </Right>
            </Flex>
            <Hr/>
            <Div p={16}>
                <Flex mb={10}>
                    <Space>
                        <Span><b>상품코드로 검색</b></Span>
                        <Span fg={'dark'} fontSize={12}>
                            상품코드로 상품을 검색 할 수 있습니다. "," (콤마)가 구분자 입니다.
                        </Span>
                    </Space>
                    <Right>
                        <Space spaceGap={2}>
                            {
                                producer && <MenuButton onClick={() => {
                                    setProducer(null)
                                }}><MdClose /></MenuButton>
                            }
                            {
                                producer && <ProducerInfo producer={producer} />
                            }
                            <MenuButton bg={producer ? 'green' : 'white'}
                                        fg={producer ? 'white' : 'black'}
                                        bc={'light'}
                                        onClick={searchProducerGoods}>생산자 번호로 상품조회 (현재 {producer ? producer.producerNo : '미지정'})</MenuButton>
                        </Space>
                    </Right>
                </Flex>

                <Space alignItems={'flex-start'}>

                    <Textarea
                        inputRef={strGoodsNoRef}
                        style={{width: '100%', minHeight: 50, padding: 16, maxHeight: 400, border: '1px solid rgba(0,0,0,.125)'}}
                        className={'border'}
                        rows={5}
                        placeholder='ex) 400, 521, 665'
                    />
                    <Flex cursor height={50} minWidth={100} bg={'white'} bc={'light'} doActive justifyContent={'center'}
                          onClick={onGoodsSearchClick}>
                        검색
                    </Flex>
                </Space>
            </Div>
            <Hr/>

            <Div p={16}>

                <GridColumns repeat={2} colGap={10}>
                    <div>
                        <Space mb={10} >
                            <Span fg={COLOR.TAG}><b>상품 해시태그 입력</b></Span>
                            <Span fg={'dark'} fontSize={12}>
                                해시태그를 등록해 주세요. "," (콤마)가 구분자 입니다.
                            </Span>
                        </Space>
                        <Textarea
                            inputRef={strTagRef}
                            style={{width: '100%', minHeight: 50, borderRadius: 1, border: '1px solid rgba(0,0,0,.125)'}}
                            className={'border'}
                            rows={5}
                            placeholder='ex) 상추, 팜토리, 쌈채소'
                            onBlur={onTagBlur.bind(this, TYPE.TAG)}
                        />
                        <Space flexShrink={0} mt={10}>
                            <MenuButton id={'TooltipExample'} height={'100%'} onClick={onPushClick.bind(this, TYPE.TAG)}>+ 알아서 추가</MenuButton>
                            <MenuButton height={'100%'} onClick={onRemoveOnlyMatchedClick.bind(this, TYPE.TAG)}>- 일치되는 항목 제거</MenuButton>
                            <MenuButton height={'100%'} bg={'danger'} onClick={onRemoveAndOverWriteAllClick.bind(this, TYPE.TAG)}>전부 지우고 이걸로 대체</MenuButton>
                        </Space>

                    </div>
                    <div>
                        <Space mb={10} >
                            <Span fg={COLOR.GROUP_TAG}><b>그룹 해시태그 입력</b></Span>
                            <Span fg={'dark'} fontSize={12}>
                                해시태그를 등록해 주세요. "," (콤마)가 구분자 입니다.
                            </Span>
                        </Space>
                        <Textarea
                            inputRef={strGroupTagRef}
                            style={{width: '100%', minHeight: 50, borderRadius: 1, border: '1px solid rgba(0,0,0,.125)'}}
                            className={'border'}
                            rows={5}
                            placeholder='ex) 상추, 팜토리, 쌈채소'
                            onBlur={onTagBlur.bind(this, TYPE.GROUP_TAG)}
                        />
                        <Space flexShrink={0} mt={10}>
                            <MenuButton id={'TooltipExample'} height={'100%'} onClick={onPushClick.bind(this, TYPE.GROUP_TAG)}>+ 알아서 추가</MenuButton>
                            <MenuButton height={'100%'} onClick={onRemoveOnlyMatchedClick.bind(this, TYPE.GROUP_TAG)}>- 일치되는 항목 제거</MenuButton>
                            <MenuButton height={'100%'} bg={'danger'} onClick={onRemoveAndOverWriteAllClick.bind(this, TYPE.GROUP_TAG)}>전부 지우고 이걸로 대체</MenuButton>
                        </Space>

                    </div>
                </GridColumns>


                <Div bc={'light'} mt={16}>
                    <Flex px={16} py={8} bg={'background'} fontSize={12}>
                        <div>
                            {
                                `상품 ${list.length}건`
                            }
                            &nbsp;&nbsp;
                            (해시태그의 X 버튼을 누르면 상품 안의 해시태그가 같이 삭제 됩니다.)
                        </div>
                        <Space ml={'auto'} spaceGap={16}>
                            <Space>
                                <ImsiMark/>
                                <div>임시저장</div>
                            </Space>
                        </Space>


                    </Flex>

                    <div>
                        <Div fontSize={12} px={16} mt={8}>상품 해시태그 집계 {Object.keys(unionTagObj).length}건</Div>
                        <Flex flexWrap={'wrap'} colGap={8} rowGap={8} px={16} pt={10}>
                            {
                                Object.keys(unionTagObj).map(tag => {
                                    // const isMatched = strTagList.includes(tag)
                                    const isMatched = strTagObj[tag] ? true : false
                                    return(
                                        <TagButton key={'union_'+tag} fontSize={11} onClick={onTagClick.bind(this, tag)}
                                                   bc={'light'}
                                                   pl={5}
                                                   custom={isMatched && BOX_SHADOW.TAG}
                                        >
                                            <div>
                                                {tag}
                                            </div>
                                            <Flex justifyContent={'center'} width={25} height={'100%'} onClick={onUnionTagClick.bind(this, tag, TYPE.TAG)} fontSize={16}>
                                                <MdClose color={color.dark} />
                                            </Flex>
                                        </TagButton>
                                    )
                                })
                            }
                        </Flex>
                    </div>
                    <div>
                        <Div fontSize={12} px={16} mt={8}>그룹 해시태그 집계 {Object.keys(unionGroupTagObj).length}건</Div>
                        <Flex flexWrap={'wrap'} colGap={8} rowGap={8} px={16} pt={10}>
                            {
                                Object.keys(unionGroupTagObj).map(tag => {
                                    // const isMatched = strTagList.includes(tag)
                                    const isMatched = strGroupTagObj[tag] ? true : false
                                    return(
                                        <TagButton key={'unionGroup_'+tag} fontSize={11} onClick={onTagClick.bind(this, tag)}
                                                   bc={'light'}
                                                   pl={5}
                                                   custom={isMatched && BOX_SHADOW.GROUP_TAG}
                                        >
                                            <div>
                                                {tag}
                                            </div>
                                            <Flex justifyContent={'center'} width={25} height={'100%'} onClick={onUnionTagClick.bind(this, tag, TYPE.GROUP_TAG)} fontSize={16}>
                                                <MdClose color={color.dark} />
                                            </Flex>
                                        </TagButton>
                                    )
                                })
                            }
                        </Flex>
                    </div>

                    <Hr/>
                    <Div overflow={'auto'} maxHeight={400} style={{resize: 'vertical'}} p={16}>
                        {
                            list.map((goods, index) =>
                                <Item key={goods.goodsNo}
                                      index={index+1}
                                      goods={goods}
                                      onRemoveGoodsClick={onRemoveGoodsClick.bind(this, goods.goodsNo)}//상품 삭제

                                      isTagsRemoved={backupObj[goods.goodsNo] ? true : false}
                                      onRemoveTagsClick={onRemoveAllClick.bind(this, goods.goodsNo, TYPE.TAG)} //상품 태그 삭제(전체)
                                      onRecoverTagsClick={onRecoverClick.bind(this, goods.goodsNo, TYPE.TAG)}     //복구

                                      isGroupTagsRemoved={backupGroupObj[goods.goodsNo] ? true : false}
                                      onRemoveGroupTagsClick={onRemoveAllClick.bind(this, goods.goodsNo, TYPE.GROUP_TAG)} //그룹 태그 삭제(전체)
                                      onRecoverGroupTagsClick={onRecoverClick.bind(this, goods.goodsNo, TYPE.GROUP_TAG)}     //복구

                                      onRemoveOneTagClick={onRemoveOneTagClick}  //태그 하나 삭제
                                      onTagClick={onTagClick}
                                    // strTag={strTag}
                                    // strTagList={strTagList}
                                      strTagObj={strTagObj}
                                      strGroupTagObj={strGroupTagObj}
                                />
                            )
                        }
                        {
                            list.length <= 0 && (
                                <Flex p={16} minHeight={100} justifyContent={'center'} textAlign={'center'}>
                                    선택된 상품이 없습니다. <br/>상품코드로 직접 조회하거나, 그리드에서 선택해 주세요.
                                </Flex>
                            )
                        }
                    </Div>
                </Div>
            </Div>
            {/*<ToastContainer/>*/}
        </>
    )
}

function Item({
                  index,
                  strTag,
                  strTagList,
                  strTagObj,
                  strGroupTagObj,
                  goods,
                  onRemoveGoodsClick, //상품 삭제
                  isTagsRemoved, onRemoveTagsClick, onRecoverTagsClick, //상품 태그 관련
                  isGroupTagsRemoved, onRemoveGroupTagsClick, onRecoverGroupTagsClick, //그룹 태그 관련
                  onRemoveOneTagClick,
                  onTagClick
              }) {

    return(
        <Div my={8}>
            <Space>
                <Div minWidth={20} fg={'secondary'}>[{index}]</Div>
                <Div>
                    <b>{goods.goodsNo}</b>
                </Div>
                <Div lineClamp={1}>
                    {goods.goodsNm}
                </Div>
                {
                    !goods.confirm && <ImsiMark/>
                }
                <GoodsBadges goods={goods} />
                <MdClose onClick={onRemoveGoodsClick} />
            </Space>
            <Flex flexWrap={'wrap'} mt={8}>
                <TagButton px={5} fg={isTagsRemoved ? 'green' : 'danger'} onClick={isTagsRemoved ? onRecoverTagsClick : onRemoveTagsClick}>{isTagsRemoved ? '상품태그 복구' : '상품태그 삭제'}</TagButton>
                {
                    goods.tags.map(tag => {
                        // const isMatched = strTag.toLowerCase().indexOf(tag.toLowerCase()) > -1
                        // const isMatched = strTagList.includes(tag)
                        const isMatched = strTagObj[tag] ? true : false
                        return(
                            <TagButton key={tag} onClick={onTagClick.bind(this, tag)}
                                       bc={'light'}
                                       pl={5}
                                       custom={isMatched && BOX_SHADOW.TAG}
                            >
                                <div>
                                    {tag}
                                </div>
                                <Flex justifyContent={'center'} width={25} height={'100%'} onClick={onRemoveOneTagClick.bind(this, goods.goodsNo, tag, TYPE.TAG)} fontSize={16}>
                                    <MdClose color={color.dark} />
                                </Flex>
                            </TagButton>
                        )

                    })
                }
            </Flex>
            <Flex flexWrap={'wrap'} mt={8}>
                <TagButton px={5} fg={isGroupTagsRemoved ? 'green' : 'danger'} onClick={isGroupTagsRemoved ? onRecoverGroupTagsClick : onRemoveGroupTagsClick}>{isGroupTagsRemoved ? '그룹태그 복구' : '그룹태그 삭제'}</TagButton>
                {
                    goods.groupTags.map(tag => {
                        // const isMatched = strTag.toLowerCase().indexOf(tag.toLowerCase()) > -1
                        // const isMatched = strTagList.includes(tag)
                        const isMatched = strGroupTagObj[tag] ? true : false
                        return(
                            <TagButton key={tag} onClick={onTagClick.bind(this, tag)}
                                       bc={'light'}
                                       pl={5}
                                       custom={isMatched && BOX_SHADOW.GROUP_TAG}
                            >
                                <div>
                                    {tag}
                                </div>
                                <Flex justifyContent={'center'} width={25} height={'100%'} onClick={onRemoveOneTagClick.bind(this, goods.goodsNo, tag, TYPE.GROUP_TAG)} fontSize={16}>
                                    <MdClose color={color.dark} />
                                </Flex>
                            </TagButton>
                        )

                    })
                }
            </Flex>
        </Div>
    )
}

const TagButton = React.memo(({children, onClick, ...rest}) => {
    return(<Flex fontSize={12} justifyContent={'center'} cursor mr={8} height={30} rounded={3} bc={'light'} mb={8} {...rest} onClick={onClick}>{children}</Flex>)
})

const ProducerLayer = styled.div`
    position: absolute;
    background-color: white;
    left: 50%;
    // width: max-content;
    display: inline-block;
    transform: translateX(-50%);
    overflow: auto;
    padding: 16px;    
    border-radius: 2px;
    border: 1px solid ${color.light};
    top: calc(100% + 4px);
    box-shadow: rgba(50, 50, 93, 0.25) 0px 13px 27px -5px, rgba(0, 0, 0, 0.3) 0px 8px 16px -8px;
`

export function ProducerInfo({producer}) {
    const [isOpen, setOpen] = useState(false)
    const toggle = () => setOpen(!isOpen)
    return(
        <Div relative>
            <MenuButton size={'sm'} onClick={toggle}>
                {producer.farmName} {isOpen ? <IoIosArrowUp />: <IoIosArrowDown />}


            </MenuButton>
            {
                isOpen && (
                    <ProducerLayer>
                        {producer.producerNo}<br/>
                        {producer.farmName}<br/>
                        {producer.name}<br/>
                        {producer.shopMainItems}
                    </ProducerLayer>
                )
            }
        </Div>
    )
}

export default HashtagMultiSaveContent