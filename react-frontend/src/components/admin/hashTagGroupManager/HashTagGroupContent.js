import React, {useState, useEffect} from 'react';
import {Button, Div, Flex, GridColumns, Input} from "~/styledComponents/shared";
import HashTagInput from "~/components/common/hashTag/HashTagInput";
import styled from 'styled-components'
import {getValue} from "~/styledComponents/Util";
import BasicSelect from '~/components/common/selectBoxes/BasicSelect'
import Select from "react-select";
import Checkbox from "~/components/common/checkboxes/Checkbox";
import adminApi from '~/lib/adminApi'
import GoodsCard from "~/components/common/cards/GoodsCard";
import GoodsCardsContentByHashTags from "~/components/admin/hashTagGroupManager/GoodsCardsContentByHashTags";
import {SingleImageUploader} from "~/components/common";
import ComUtil from "~/util/ComUtil"

import {hashTagVisiblePageStore} from "~/store";
import moment from "moment-timezone";
import {DateRangePicker} from "react-dates";

const Heading = styled(Div)`
    margin-bottom: ${getValue(8)};
`

const visibilityStore = [
    {label: '노출하기', value: true},
    {label: '숨기기', value: false},
]

/*
    int groupNo;                        //유일키
    String visiblePage;                 //해시태그가 노출될 위치 코드 : home, best, contract...
    String groupName;                   //해시태그 노출 그룹명 : "잘 나가요, 이 상품"
    List<HashTag> hashTags;             //해시태그 : 팜토리, 유기농, 친환경, 신뢰
    boolean visibility;                 //화면 노출여부 : true, false
    int sortNum;                        //정렬순서
    Date timestamp;                     //등록일
 */
const HashTagGroupContent = ({groupNo = 0, onClose = () => null}) => {

    const [state, setState] = useState({
        groupNo: groupNo,
        visiblePage: '',
        groupName: '',
        desc: '',
        groupImages: [],
        hashTags: [],
        sortNum: 0,
        visibility: false,
        hideTags: false,
        focusedInput: null,
        startDate: 0,
        endDate: 0,
        localfoodProducerNo: 0
    })

    const [hashTagGoodsCount, setHashTagGoodsCount] = useState(0)

    const [localfoodProducer, setLocalfoodProducer] = useState([{producerNo:0, label:''}])

    useEffect(() => {
        if (groupNo) {
            searchGroupHashtag()
        }
        getLocalfoodProducer()
    }, [groupNo])

    const searchGroupHashtag = async () => {
        const {data} = await adminApi.getHashTagGroup(groupNo)
        console.log({data})
        setState(data)
    }

    const getLocalfoodProducer = async () => {
        const {data} = await adminApi.getLocalfoodProducerList()
        console.log(data)
        const localfoodProducer = data.map(item => ({producerNo: item.producerNo, label: item.farmName}))
        // const items =  itemsData.map(item => ({value: item.itemNo, label: item.itemName, itemKinds: item.itemKinds, enabled: item.enabled, itemFeeRate: item.itemFeeRate}))
        setLocalfoodProducer(localfoodProducer)
    }

    const onVisiblePageChange = data => {
        //const value = e.target.value
        // setVisiblePage(data.value)
        console.log("onVisiblePageChange========",data)

        if(data.value !== 'local') {
            console.log(data.value)
            setState({
                ...state,
                localfoodProducerNo: 0,
                visiblePage: data.value
            })
        } else {
            setState({
                ...state,
                visiblePage: data.value
            })
        }
    }

    const onProducerChange = data => {
        console.log("onProducerChange========>",data)
        setState({
            ...state,
            localfoodProducerNo: data.producerNo
        })
    }

    const onHideTagsChange = e => {
        setState({
            ...state,
            hideTags: e.target.checked
        })
    }

    const onVisibilityChange = e => {
        //const value = e.target.value
        // setVisibility(e.target.checked)
        setState({
            ...state,
            visibility: e.target.checked
        })
    }

    const onHashTagChange = tags => {
        // setTags(tags)
        console.log({tags})
        setState({
            ...state,
            hashTags: tags
        })
    }

    //테마 기간 달력
    const onThemeDatesChange = ({ startDate, endDate }) => {
        state.startDate = startDate && ComUtil.utcToString(startDate.startOf('day'), 'YYYYMMDD');
        state.endDate = endDate && ComUtil.utcToString(endDate.endOf('day'), 'YYYYMMDD');
        setState({
            ...state,
        })
    };

    const onDeleteClick = async() => {
        if (!window.confirm('삭제 하시겠습니까?'))
            return

        await adminApi.deleteHashTagGroup(state.groupNo)
        onClose()
    }

    const onSaveClick = async() => {
        const saveParams = {...state, groupNo: groupNo ? groupNo : 0}
        console.log({saveParams})
        await adminApi.addHashTagGroup(saveParams)
        onClose()
    }

    const onInputChange = e => {
        setState({
            ...state,
            [e.target.name]: e.target.value
        })
    }

    const onGroupImageChange = (images) => {
        setState(prev => ({
            ...prev,
            groupImages: images
        }))
    }

    return (
        <div>
            <GridColumns repeat={2} colGap={10} rowGap={0}>
                <Div p={16} bg={'white'} rounded={4}>
                    <Div mb={20}>
                        <Heading>노출페이지</Heading>
                        <Div>
                            {/*<BasicSelect data={hashTagVisiblePageStore} onChange={onVisiblePageChange}/>*/}
                            <Select options={hashTagVisiblePageStore}
                                    value={hashTagVisiblePageStore.find(item => item.value === state.visiblePage)}
                                    onChange={onVisiblePageChange}
                            />
                        </Div>
                        {
                            state.visiblePage === 'local' &&
                            <Div mt={20}>
                                <Select
                                    options={localfoodProducer}
                                    value={localfoodProducer.find(item => item.producerNo === state.localfoodProducerNo)}
                                    onChange={onProducerChange}
                                />
                            </Div>
                        }
                    </Div>
                    <Div mb={20}>
                        {/*<Heading>그룹명</Heading>*/}
                        <Input name={'groupName'} block placeholder={'제목을 입력해 주세요'} value={state.groupName} onChange={onInputChange}/>
                    </Div>
                    <Div mb={20}>
                        {/*<Heading>설</Heading>*/}
                        <Input name={'desc'} block placeholder={'간단한 내용을 입력해 주세요'} value={state.desc} onChange={onInputChange}/>
                    </Div>
                    <Div mb={20}>
                        <SingleImageUploader images={state.groupImages} defaultCount={2} isShownMainText={false} onChange={onGroupImageChange} />
                    </Div>
                    <Div mb={20}>
                        {/*<Heading>태그입력</Heading>*/}
                        <div>그룹 해시태그</div>
                        <HashTagInput tags={state.hashTags} onChange={onHashTagChange}/>
                    </Div>
                    <Div mb={20}>
                        <DateRangePicker
                            startDateId='my-startDate'
                            endDateId='my-endDate'
                            startDatePlaceholderText="시작일"
                            endDatePlaceholderText="종료일"
                            startDate={state.startDate ? moment(ComUtil.intToDateMoment(state.startDate)) : null}
                            endDate={state.endDate ? moment(ComUtil.intToDateMoment(state.endDate)) : null}
                            onDatesChange={onThemeDatesChange}
                            focusedInput={state.focusedInput}
                            onFocusChange={(focusedInput) => { setState({ ...state, focusedInput })}}
                            numberOfMonths={1}          //달력 갯수(2개로 하면 모바일에서는 옆으로 들어가버리기 때문에 orientation='vertical'로 해야함), pc 에서는 상관없음
                            orientation={'horizontal'}
                            openDirection="up"
                            withPortal
                            small
                            readOnly
                            showClearDates
                            calendarInfoPositio="top"
                            //renderCalendarInfo={renderMdPickCalendarInfo}
                        />
                    </Div>
                    <Div mb={20}>
                        {/*<Heading>순서</Heading>*/}
                        <Input name={'sortNum'} block placeholder={'순서입력 (숫자 0 ~ 9)'} value={state.sortNum} onChange={onInputChange}/>
                    </Div>
                    <Div mb={15}>
                        <Checkbox onChange={onHideTagsChange} checked={state.hideTags}>태그 숨기기 (소비자 화면에서 태그 숨김)</Checkbox>
                    </Div>
                    <Div mb={20}>
                        {/*<Heading>노출여부</Heading>*/}
                        <Checkbox onChange={onVisibilityChange} checked={state.visibility} >노출하기</Checkbox>
                    </Div>
                    <Div textAlign={'center'} mb={20}>
                        <Button px={16} bg={'danger'} fg={'white'} onClick={onDeleteClick} mr={10}>삭제</Button>
                        <Button px={16} bg={'green'} fg={'white'} onClick={onSaveClick} >저장</Button>
                    </Div>
                </Div>

                <Div bg={'white'} rounded={4}>
                    <Heading p={16} pb={0}>#태그와 일치된 상품{` ${hashTagGoodsCount}건`}</Heading>
                    <Div maxHeight={600} overflow={'auto'}>
                        <GoodsCardsContentByHashTags producerNo={state.localfoodProducerNo} hashTags={state.hashTags} onChange={list => setHashTagGoodsCount(list.length)} />
                    </Div>
                </Div>
            </GridColumns>
        </div>
    );
};

export default HashTagGroupContent;
