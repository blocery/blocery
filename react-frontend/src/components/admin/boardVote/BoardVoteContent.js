import React, {useState, useEffect} from 'react';
import {Button, Div, Flex, Input, Right, Span, Hr, Space} from "~/styledComponents/shared";
import {B2cGoodsSearch, SingleImageUploader} from "~/components/common";
import GoodsSelect from "~/components/admin/b2cHomeSetting/GoodsSelect";
import {Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import {useModal} from "~/util/useModal";
import Checkbox from "~/components/common/checkboxes/Checkbox";
import SummernoteEditor from "~/components/common/summernoteEditor";
import {DateRangePicker, SingleDatePicker} from "react-dates";
import moment from "moment-timezone";
import {BsCaretDownFill, BsCaretUpFill} from "react-icons/bs";
import adminApi from "~/lib/adminApi";
import Tag from "~/components/common/hashTag/HashTagInput";


const Star = () => <Span fg={'danger'}>*</Span>
const Heading = ({children}) => <Div bold fontSize={13} mb={10}>{children}</Div>
const OuterBox = ({children}) => <Div mb={10} p={16} bg={'white'} rounded={5} bc={'light'}>{children}</Div>

const BoardVoteContent = ({writingId, onClose}) => {

    const [modalOpen, setModalOpen, selected, setSelected, setModalState] = useModal()

    const [state, setState] = useState({
        writingId: writingId,
        title: '',
        items: [
            {text: '', image: {imageNo: 0, imageUrlPath: '', imageUrl: '', imageNm: '',}},
            {text: '', image: {imageNo: 0, imageUrlPath: '', imageUrl: '', imageNm: '',}}
        ],
        refGoods: [],
        startDate: '',
        endDate: '',
        maxVoter: '',        //참여자수
        rewardPoint: '',     //예산 (건당 포인트)
        displayFlag: false, //노출여부
        priority: null,     //노출순위
        displayContentFlag: false, //게시글 노출 여부
        content: '',
        tags: []
    })

    useEffect(() => {
        if (writingId) {
            search()
        }
    }, [writingId])

    const search = async () => {
        const {data} = await adminApi.getBoardVote(writingId)
        setState(data)
        console.log({data})
    }

    const onImageChange = (index, images) => {

        let image;

        if (images[0]) {
            image = {...images[0]}
        }else{
            image = {imageNo: 0, imageUrl: '', imageNm: ''}
        }

        const newState = Object.assign({}, state)

        newState.items[index].image = image

        console.log("newState.items:",newState.items)

        setState(prev=>({...prev,items:newState.items}))
    }


    //투표항목
    const onTextChange = (index, e) => {
        const newState = {...state}
        newState.items[index].text = e.target.value
        setState(newState)
    }

    const onSortClick = ({index, moveIndex}) => {
        if (index + moveIndex === -1){
            return
        }

        const items = Object.assign([], state.items)

        //잘라내기
        const value = items.splice(index, 1)[0]; //splice는 항상 array 로 리턴하기 때문

        items.splice(index+moveIndex, 0, value)

        setState({
            ...state,
            items: items
        })
    }

    //상품 행추가
    const onAddGoodsClick = () => {
        const newState = {...state}
        newState.refGoods.push('')
        setState(newState)
    }

    //상품 모달 띄우기
    const onGoodsClick = (index) => {
        setSelected(index)
        toggle()
    }

    //상품 지우기
    const onGoodsDeleteClick = (index) => {
        const newState = {...state}
        newState.refGoods.splice(index, 1)
        setState(newState)
    }

    //모달 토글
    const toggle = () => {
        setModalState(!modalOpen)
    }

    //모달 상품 선택 후 콜백 함수
    const goodsModalCallback = (goods) => {
        console.log({selected, goods})
        const index = selected
        const newState = {...state}
        newState.refGoods[index] = goods.goodsNo
        setState(newState)
        toggle()
    }

    //상품 정렬
    const onGoodsSortClick = ({index, moveIndex}) => {

        if (index + moveIndex === -1){
            return
        }

        const refGoods = Object.assign([], state.refGoods)

        //잘라내기
        const value = refGoods.splice(index, 1)[0]; //splice는 항상 array 로 리턴하기 때문

        refGoods.splice(index+moveIndex, 0, value)

        setState({
            ...state,
            refGoods: refGoods
        })
    }

    const onInputchange = ({target}) => {
        const {name, value} = target
        setState({
            ...state,
            [name]: value
        })
    }

    const onDisplayFlagChange = (checked) => {
        setState({
            ...state,
            displayFlag: checked
        })
    }

    const onEditChange = (data) => {
        setState({
            ...state,
            content: data
        })
    }

    //
    const onDateChange = ({ startDate, endDate }) => {
        setState({
            ...state,
            startDate: startDate && startDate.startOf('day'),
            endDate: endDate && endDate.endOf('day')
        })
    }

    //저장
    const onSaveClick = async () => {

        // validation check
        if (!canSave()) {
            return
        }

        const confirmMsg = `노출여부 ${state.displayFlag ? '[공개]' : '[비공개]'}, 게시글 노출 ${state.displayContentFlag ? '[공개]' : '[비공개]'} 저장 하시겠습니까?`

        if (!window.confirm(confirmMsg)) {
            return;
        }

        const saveState = {...state}

        const startDate = moment(state.startDate, "YYYYMMDD").format("YYYYMMDD")
        const endDate = moment(state.endDate, "YYYYMMDD").format("YYYYMMDD")

        saveState.startDate = parseFloat(startDate)
        saveState.endDate = parseFloat(endDate)

        saveState.refGoods = saveState.refGoods.filter(goodsNo => goodsNo !== '')

        console.log(saveState)

        //신규
        if (!writingId) {
            await adminApi.addBoardVote(saveState)
        }
        else{
            await adminApi.updateBoardVote(saveState)
        }

        onClose(true)
    }

    //validation check
    const canSave = () => {
        if (!state.title) {
            alert('타이틀은 필수 입니다')
            return false;
        }

        let hasItems = true
        state.items.map(item => {
            if (!item.image.imageUrl || !item.text) {
                hasItems = false
            }
        })

        if (!hasItems) {
            alert('투표항목의 이미지 & 문구는 필수 입니다')
            return false;
        }

        if (!state.startDate || !state.endDate) {
            alert('기간은 필수 입니다')
            return false;
        }

        if (!state.maxVoter) {
            alert('참여자수는 필수 입니다')
            return false;
        }

        if (!state.rewardPoint) {
            alert('예산은 필수 입니다')
            return false;
        }



        return true

    }

    //삭제
    const onDeleteClick = async () => {

        let votedConsumers = 0

        state.itemVoters.map(voters => {
            votedConsumers = votedConsumers + voters.length
        })

        if (votedConsumers > 0) {
            alert('이미 투표가 개시되어 삭제 불가능 합니다.')
            return
        }

        if (!window.confirm('삭제 하시겠습니까?')) {
            return
        }
        await adminApi.deleteBoardVote(writingId)
        onClose(true)
    }

    const onTagChange = (tags) => {
        setState({
            ...state,
            tags: tags
        })
    }

    const [focusedInput, setFocusedInput] = useState(null);

    return (
        <div>
            <OuterBox>
                <Heading>투표 제목<Star/></Heading>
                <Div>
                    <Input block placeholder={'투표 제목 입력'} name={'title'} value={state.title} onChange={onInputchange}/>
                </Div>
            </OuterBox>

            <OuterBox>
                <Heading>투표 항목<Star/></Heading>
                {
                    state.items.map((item, index) =>
                        <Flex custom={`
                        & > div {width: unset;}
                    `}>
                            <SingleImageUploader
                                images={[item.image]}
                                defaultCount={1}
                                isShownMainText={false}
                                onChange={onImageChange.bind(this, index)}
                                quality={1}
                            />
                            <Input value={item.text} width={300} placeholder={'투표옵션 내용(간략)'} onChange={onTextChange.bind(this, index)} />
                            <Div ml={10} fg={'white'}>
                                <Button
                                    bg={'secondary'} fg={'white'}
                                    px={10}
                                    onClick={onSortClick.bind(this, {index: index, moveIndex: -1})} mr={8}>
                                    <BsCaretUpFill/>
                                </Button>
                                <Button
                                    bg={'secondary'} fg={'white'}
                                    px={10}
                                    onClick={onSortClick.bind(this, {index: index, moveIndex: 1})}>
                                    <BsCaretDownFill/>
                                </Button>
                            </Div>
                        </Flex>
                    )
                }
            </OuterBox>
            <OuterBox>
                <Flex>
                    <Heading>연관 상품 등록</Heading>
                    <Right><Button bg={'green'} fg={'white'} px={10} onClick={onAddGoodsClick}>행추가</Button></Right>
                </Flex>
                {
                    state.refGoods.map((goodsNo, index) =>
                        <GoodsSelect
                            goodsNo={goodsNo}
                            onClick={onGoodsClick.bind(this, index)}
                            onDeleteClick={onGoodsDeleteClick.bind(this,  index)}
                            onUpClick={onGoodsSortClick.bind(this, {index: index, moveIndex: -1})}
                            onDownClick={onGoodsSortClick.bind(this, {index: index, moveIndex: 1})}
                            sort={true}
                        />
                    )
                }
            </OuterBox>

            <OuterBox>
                <Heading>투표 정보</Heading>
                <Div custom={`
                    & > div {
                        margin-bottom: 10px;                        
                    }
                    & > div:last-child {
                        margin: 0;
                    }                    
                `}>
                    <Flex>
                        <Div minWidth={100}>기간<Star/></Div>
                        <Div>
                            <DateRangePicker
                                startDateId='startDate'
                                endDateId='endDate'
                                startDatePlaceholderText="시작일"
                                endDatePlaceholderText="종료일"
                                startDate={state.startDate ? moment(state.startDate, "YYYYMMDD") : null}
                                endDate={state.endDate ? moment(state.endDate, "YYYYMMDD") : null}
                                onDatesChange={onDateChange}
                                focusedInput={focusedInput}
                                onFocusChange={(focusedInput) => { setFocusedInput(focusedInput)}}
                                numberOfMonths={2}          //달력 갯수(2개로 하면 모바일에서는 옆으로 들어가버리기 때문에 orientation='vertical'로 해야함), pc 에서는 상관없음
                                minimumNights={0}
                                orientation={'horizontal'}
                                openDirection="up"
                                withPortal
                                small
                                readOnly
                                showClearDates
                                calendarInfoPosition="top"
                                // isDayBlocked={(date)=>{
                                //     //상품판매기한보다 작거나 같은 일자는 블록처리하여 선택할 수 없도록 함
                                //     if(date.isSameOrBefore(moment(goods.saleEnd))) return true
                                //     return false
                                // }}
                                // renderCalendarInfo={this.renderExpectShippingCalendarInfo}
                                // displayFormat={'YYYY.MM.DD'}
                            />
                        </Div>
                    </Flex>
                    <Flex>
                        <Div minWidth={100}>참여가능 수<Star/></Div>
                        <Space>
                            <Div>
                                <Input value={state.maxVoter} block name={'maxVoter'} placeholder={'숫자 입력'} onChange={onInputchange} />
                            </Div>
                            <Div>
                                명 (참여자가 초과되면 투표는 자동 종료)
                            </Div>
                        </Space>

                    </Flex>
                    <Flex>
                        <Div minWidth={100}>예산 설정<Star/></Div>
                        <Space>
                            <Div>건당</Div>
                            <Div><Input value={state.rewardPoint} block name={'rewardPoint'} placeholder={'숫자 입력'} onChange={onInputchange} /></Div>
                            <Div>포인트</Div>
                        </Space>
                    </Flex>
                    <Flex>
                        <Div minWidth={100}>노출 여부<Star/></Div>
                        <Div>
                            <input type={'radio'} id={'displayFlag0'} name={'displayFlag'}  checked={state.displayFlag === true} onChange={onDisplayFlagChange.bind(this, true)} /><label htmlFor="displayFlag0" className='pl-1 mr-3'>공개</label>
                            <input type={'radio'} id={'displayFlag1'} name={'displayFlag'} checked={state.displayFlag === false} onChange={onDisplayFlagChange.bind(this, false)} /><label htmlFor="displayFlag1" className='pl-1 mr-3'>비공개</label>
                        </Div>
                    </Flex>
                    <Flex>
                        <Div minWidth={100}>노출 순위</Div>
                        <Space>
                            <Input value={state.priority} name={'priority'} placeholder={'숫자 입력'} onChange={onInputchange} />
                            <Div>
                                순위 낮은 값일수록 상단 노출, 순위 미적용은 0
                            </Div>
                        </Space>
                    </Flex>
                </Div>
            </OuterBox>
            <OuterBox>
                <Flex>
                    <Heading>게시글 작성</Heading>
                    <Right><Checkbox bg={'green'} checked={state.displayContentFlag === true} onChange={(e) => setState({...state, displayContentFlag: e.target.checked})}>게시글 노출</Checkbox></Right>
                </Flex>
                <SummernoteEditor quality={1} onChange={onEditChange} editorHtml={state.content} />
            </OuterBox>

            <OuterBox>
                <Heading>#태그</Heading>
                <Tag tags={state.tags} onChange={onTagChange} />
            </OuterBox>

            <Space mt={16} justifyContent={'center'}>
                <Button bg="green" fg={'white'} px={20} onClick={onSaveClick}>저장</Button>
                {
                    state.writingId && <Button bg="danger" fg={'white'} px={20} onClick={onDeleteClick}>삭제</Button>
                }
                <Button bg="dark" fg={'white'} px={20} onClick={() => onClose(false)}>취소</Button>
            </Space>

            {/*상품검색 모달 */}
            <Modal size="lg" isOpen={modalOpen}
                   toggle={toggle} >
                <ModalHeader toggle={toggle}>
                    상품 검색
                </ModalHeader>
                <ModalBody>
                    <B2cGoodsSearch onChange={goodsModalCallback} />
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={toggle}>취소</Button>
                </ModalFooter>
            </Modal>


        </div>
    );
};

export default BoardVoteContent;
