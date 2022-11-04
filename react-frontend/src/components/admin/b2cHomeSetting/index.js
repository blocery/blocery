import React, { useState, useEffect } from 'react';
import {Alert, Label, Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap'
import ComUtil from '~/util/ComUtil'
import {B2cGoodsSearch, SingleImageUploader} from '~/components/common'
import {Div, Span, Button, ShadowBox, Flex, Input, Space} from '~/styledComponents/shared'
import styled from 'styled-components'
import { getHomeSetting, setHomeSetting} from '~/lib/adminApi'
import { useModal } from '~/util/useModal'
import EventList from '~/components/admin/eventList/EventList'
import {FaPlusCircle} from "react-icons/fa";
import GoodsSelect from "./GoodsSelect";
import ProducerList from '~/components/common/modalContents/producerList'
import ProducerSelect from "~/components/admin/b2cHomeSetting/ProducerSelect";
import {MenuButton} from "~/styledComponents/shared/AdminLayouts";
import {BsCaretDownFill, BsCaretUpFill} from "react-icons/bs";
import {DateRangePicker} from "react-dates";

const Subject = styled(Div)`
    font-size: 16px;
    font-weight: 700;
`;

const TYPE = {
    onePlus: 'onePlus',
    specialDeal: 'specialDeal'
}

export default (props) => {

    const [state, setState] = useState({
        settingNoList: {},
        onePlusList: [],                            // 1+1 상품 번호(판매상품, 증정상품)
        specialDealGoodsList: [],           // 특가 deal 상품 번호
        // exGoodsList: [...Array(10)],                    // 기획전 상품 번호
        todayProducerList: [],               // 생산자 번호
        bannerList: [],
        blyTime: null,
        potenTime: null,
        superReward: null
    })
    //배너용 리스트
    const [bannerList, setBannerList] = useState([])
    const [localfoodBannerList, setLocalfoodBannerList] = useState([])
    const [goodsModalOpen, , selected, setSelected, setGoodsModalState] = useModal()
    const [producerModalOpen, , producerSelected, setProducerSelected, setProducerModalState] = useModal()

    //이벤트용 모달
    const [modalOpen, , , , setModalState] = useModal()


    useEffect(() => {
        search()
    }, [])


    const search = async () => {
        let {data} = await getHomeSetting();

        setState(data)

        const arr = getBannerDataFromState(data.bannerList)
        setBannerList(arr)

        const arr2 = getBannerDataFromState(data.localfoodBannerList)
        setLocalfoodBannerList(arr2)

        console.log({arr2})

        // setBannerList(data.bannerList)
    }

    const getBannerDataFromState = (bannerList) => {
        return bannerList.map(banner => ({
            images: [{imageNo: 0, imageUrl: banner.imageUrl, imageNm: banner.imageNm,}],
            url: banner.url,
            startDay:banner.startDay,
            endDay:banner.endDay
        }))
    }

    const getBannerDataForSave = (bannerList) => {
        console.log(bannerList)
        const list = []
        bannerList.map(banner => {

            // let image = banner.images
            // let url = banner.url

            let tempBanner = {
                imageNo: 0,
                imageUrl: null,
                imageNm: null,
                url: banner.url,
                startDay: banner.startDay,
                endDay: banner.endDay,
            }

            if (banner.images.length > 0) {
                const image = banner.images[0]
                if (image.imageUrl) {
                    tempBanner.imageNo = 0
                    tempBanner.imageUrl = image.imageUrl
                    tempBanner.imageNm = image.imageNm
                }
            }

            list.push(tempBanner)
        })

        //imageUrl, url 하나라도 있는것만 리턴
        return list.filter(banner => banner.imageUrl || banner.url)
    }

    const onSaveClick = () => {
        save()
    }

    const isOnePlusDuplicated = (arr) => {
        let isDuplicated = false

        arr.map(item1 => {
            if(item1 && ComUtil.toNum(item1.main) > 0){
                const numbers = arr.filter(item2 => ComUtil.toNum(item2.main) === ComUtil.toNum(item1.main))
                if (!isDuplicated) {
                    if (numbers.length > 1) {
                        isDuplicated = true
                    }
                }
            }
            if(item1 && ComUtil.toNum(item1.sub) > 0){
                const numbers = arr.filter(item2 => ComUtil.toNum(item2.main) === ComUtil.toNum(item1.sub))
                if (!isDuplicated) {
                    if (numbers.length > 0) {
                        isDuplicated = true
                    }
                }
            }
        })

        return isDuplicated
    }

    const isDuplicated = (arr) => {
        let isDuplicated = false
        arr.map(goodsNo => {
            const numbers = arr.filter(_goodsNo => _goodsNo === goodsNo)
            if (!isDuplicated) {
                if (numbers.length > 1) {
                    isDuplicated = true
                }
            }
        })

        return isDuplicated
    }

    // db에 저장
    const save = async () => {
        ComUtil.sortNumber(state.bannerList, 'imageNo')

        //저장용으로 다시 조합
        const newBannerList = getBannerDataForSave(bannerList)
        const newLocalfoodBannerList = getBannerDataForSave(localfoodBannerList)

        const params = {
            onePlusList: state.onePlusList,
            specialDealGoodsList: state.specialDealGoodsList.filter(item=> (item && ComUtil.toNum(item) > 0) ),
            // exGoodsList: state.exGoodsList.filter(item=> ComUtil.toNum(item) > 0),
            todayProducerList: state.todayProducerList.filter(item=> ComUtil.toNum(item) > 0),
            bannerList: newBannerList,
            localfoodBannerList: newLocalfoodBannerList, //2022.05 추가
            blyTime: state.blyTime,
            potenTime: state.potenTime,
            superReward: state.superReward
        }

        if(isOnePlusDuplicated(params.onePlusList)){
            alert('1+1상품 판매상품번호가 중복이거나, 증정상품번호가 판매상품번호에 있습니다.')
            return
        }
        if (isDuplicated(params.specialDealGoodsList)){
            alert('특가 Deal 상품번호가 중복 되었습니다.')
            return
        }
        if (isDuplicated(params.todayProducerList)){
            alert('오늘의 생산자 번호가 중복 되었습니다.')
            return
        }

        console.log({params})
        console.log({state: state})
        const { status, data } = await setHomeSetting(params)

        if(status === 200) {
            search();
            alert('저장이 완료되었습니다.')
        }
    }

    const onSpecialDealChange  = (index, e) =>{
        const name = e.target.name
        const value = e.target.value

        const list = Object.assign([], state[name])
        list[index] = value

        setState({
            ...state,
            [name]: list
        })

        console.log({list})
    }

    // // 배너용 이미지 조회
    // const onBannerImageChange = (images) => {
    //
    //     ComUtil.sortNumber(images, 'imageNo')
    //
    //     images.map((image, index) => {
    //         image.imageNo = index;
    //     })
    //
    //     setState(prev => ({
    //         ...prev,
    //         bannerList: images.filter(image => image.imageUrl.length > 0)
    //     }))
    //
    // }

    // 1+1 판매상품 변경
    const onOnePlusMainChange = (index, e) => {
        console.log(e.target)
        const value = e.target.value
        const onePlusList = Object.assign([], state.onePlusList)

        // 판매상품번호 먼저 입력
        onePlusList[index]= {
            main: 0, sub: 0
        }

        onePlusList[index].main = value

        setState({
            ...state,
            onePlusList: onePlusList
        })
    }

    // 1+1 증정상품 변경
    const onOnePlusSubChange = (index, e) => {
        const value = e.target.value
        const onePlusList = Object.assign([], state.onePlusList)

        if(onePlusList[index] === null) {
            onePlusList[index].sub = 0
        } else {
            onePlusList[index].sub = value
        }

        setState({
            ...state,
            onePlusList: onePlusList
        })
    }

    const onInputChange = (e) => {
        const {name, value} = e.target

        // const state = Object.assign({}, this.state)
        setState({
            ...state,
            [name]: value
        })
    }

    const toggleModal = () => {
        setModalState(!modalOpen)
    }

    const onGoodsClick = ({type, index, key}) => {
        setSelected({
            type: type,
            key: key,
            index: index,
        })
        setGoodsModalState(true)
    }

    const toggleGoodsModal = () => {
        setGoodsModalState(!goodsModalOpen)
    }

    const goodsModalCallback = (goods) => {

        const {goodsNo} = goods

        const {type, index} = selected

        //1+1 상품 일 경우 state 변경
        if (type === TYPE.onePlus) {
            console.log({goods})
            console.log({selected})
            const onePlusList = Object.assign([], state.onePlusList)

            const onePlusGoods = onePlusList[index]
            onePlusGoods[selected.key] = goodsNo

            console.log({onePlusList, onePlusGoods})

            setState({
                ...state,
                onePlusList
            })
        }
        //특가 DEAL 상품
        else if (type === TYPE.specialDeal) {
            const specialDealGoodsList = Object.assign([], state.specialDealGoodsList)

            specialDealGoodsList[index] = goodsNo

            setState({
                ...state,
                specialDealGoodsList
            })
        }


        //모달 닫기
        toggleGoodsModal()

    }

    //1+1 상품 삭제
    const onOnePlusGoodsDeleteClick = ({index, key}) => {
        const onePlusList = Object.assign([], state.onePlusList)
        const onePlusGoods = onePlusList[index]
        onePlusGoods[key] = ''
        if(key === 'main'){
            if(onePlusGoods['sub'] === '' || onePlusGoods['sub'] === null){
                onePlusList.splice(index, 1)
            }
        }else if(key === 'sub'){
            if(onePlusGoods['main'] === '' || onePlusGoods['main'] === null){
                onePlusList.splice(index, 1)
            }
        }

        setState({
            ...state,
            onePlusList: onePlusList
        })
    }

    //특가 Deal 상품 삭제
    const onSpecialPriceGoodsDeleteClick = ({index}) => {
        const specialDealGoodsList = Object.assign([], state.specialDealGoodsList)
        specialDealGoodsList.splice(index, 1)
        // specialDealGoodsList[index] = null

        setState({
            ...state,
            specialDealGoodsList
        })
    }

    const onSpecialDealGoodsUpClick = ({index}) => {
        console.log({onSpecialDealGoodsUpClick:index})
    }
    const onSpecialDealGoodsDownClick = ({index, moveIndex}) => {

        if (index + moveIndex === -1){
            return
        }

        console.log({onSpecialDealGoodsDownClick:index})
        const specialDealGoodsList = Object.assign([], state.specialDealGoodsList)

        //잘라내기
        const value = specialDealGoodsList.splice(index, 1)[0]; //splice는 항상 array 로 리턴하기 때문

        specialDealGoodsList.splice(index+moveIndex, 0, value)

        setState({
            ...state,
            specialDealGoodsList
        })
    }

    const addOnePlusListGoodsClick = () => {
        const onePlusList = Object.assign([], state.onePlusList)
        onePlusList.push({main: 0, sub: 0})
        setState({
            ...state,
            onePlusList
        })
    }

    const addSpecialDealGoodsClick = () => {
        const specialDealGoodsList = Object.assign([], state.specialDealGoodsList)
        specialDealGoodsList.push('')
        setState({
            ...state,
            specialDealGoodsList
        })
    }

    const toggleProducerModal = () => {
        setProducerModalState(!producerModalOpen)
    }

    //오늘의 생산자 클릭
    const onTodayProducerClick = ({index}) => {
        setProducerSelected(index)
        toggleProducerModal()
    }

    //오늘의 생산자 삭제 클릭
    const onTodayProducerDeleteClick = ({index}) => {
        const todayProducerList = Object.assign([], state.todayProducerList)
        todayProducerList.splice(index, 1)
        setState({
            ...state,
            todayProducerList
        })
    }

    //오늘의 생산자 행추가
    const addTodayProducerClick = () => {
        const todayProducerList = Object.assign([], state.todayProducerList)
        todayProducerList.push('')
        console.log({todayProducerList})
        setState({
            ...state,
            todayProducerList
        })
    }

    const onTodayProducerModalClosed = (data) => {


        if (data) {

            const index = producerSelected
            const todayProducerList = Object.assign([], state.todayProducerList)
            todayProducerList[index] = data.producerNo

            console.log({state, index, todayProducerList})

            setState({
                ...state,
                todayProducerList
            })
        }

        toggleProducerModal()
    }

    

        
    const onBannerDeleteClick = (index) => {
        const list = Object.assign([], bannerList)
        list.splice(index, 1)
        setBannerList(list)
    }

    //배너 이미지 + url 체인지
    const onBannerChange_test = (index, params) => {

        console.log({index, params})

        const list = Object.assign([], bannerList)

        list[index].images = params.images
        list[index].url = params.url
        list[index].startDay = params.startDay
        list[index].endDay = params.endDay

        console.log({list})

        setBannerList(list)
    }



    //배너 행추가
    const addBannerItem = () => {
        const newBanner = {images: [], url: '', startDay: null, endDay: null}// 로우 의 이미지 하나임 array 로 들어가야 해서 이렇게 함

        const list = Object.assign([], bannerList)

        list.push(newBanner)

        console.log({newBanner: newBanner})

        setBannerList(list) //이중 배열
    }

    //배너 위치
    const onBannerSortClick = (index, moveIndex) => {
        const list = Object.assign([], bannerList)

        if (moveIndex < 0 || moveIndex >= list.length) return

        //잘라내기
        const item = list.splice(index, 1)[0]

        console.log({item,  index,  moveIndex})

        list.splice(moveIndex, 0, item)

        setBannerList(list)
    }


    //로컬푸드배너 이미지 + url 체인지
    const onLocalfoodBannerChange = (index, params) => {

        console.log({index, params})

        const list = Object.assign([], localfoodBannerList)

        list[index].images = params.images
        list[index].url = params.url
        list[index].startDay = params.startDay
        list[index].endDay = params.endDay

        console.log({list})

        setLocalfoodBannerList(list)
    }
    //로컬푸드 배너 행추가
    const addLocalfoodBannerItem = () => {
        const newBanner = {images: [], url: '', startDay: null, endDay: null}// 로우 의 이미지 하나임 array 로 들어가야 해서 이렇게 함

        const list = Object.assign([], localfoodBannerList)

        list.push(newBanner)

        console.log({newBanner: newBanner})

        setLocalfoodBannerList(list) //이중 배열
    }

    //로컬푸드 배너 위치소팅
    const onLocalfoodBannerSortClick = (index, moveIndex) => {
        const list = Object.assign([], localfoodBannerList)

        if (moveIndex < 0 || moveIndex >= list.length) return

        //잘라내기
        const item = list.splice(index, 1)[0]

        console.log({item,  index,  moveIndex})

        list.splice(moveIndex, 0, item)

        setLocalfoodBannerList(list)
    }

    //로컬푸드 배너 삭제
    const onLocalfoodBannerDeleteClick = (index) => {
        const list = Object.assign([], localfoodBannerList)
        list.splice(index, 1)
        setLocalfoodBannerList(list)
    }


    if (!state) return null

    return (
        <Div p={16} bg={'background'}>

            <Subject mb={10}>홈 화면 구성 Page</Subject>
            <ShadowBox>
                <Subject mb={10}>스토어 배너 (이미지, url 둘 중 하나라도 있으면 저장 됩니다) 그리고 url이 있을경우만 배너에 노출 됩니다. </Subject>

                <Div>
                    <Button mb={10} onClick={addBannerItem} bg={'green'} fg={'white'} px={10}><FaPlusCircle/>{' 행추가'}</Button>
                    {
                        bannerList.map((banner, index) =>
                            <BannerItem
                                images={banner.images}
                                url={banner.url}
                                startDay={banner.startDay}
                                endDay={banner.endDay}
                                onChange={onBannerChange_test.bind(this, index)}
                                onDeleteClick={onBannerDeleteClick.bind(this, index)}
                                onUpClick={onBannerSortClick.bind(this, index, index-1)}
                                onDownClick={onBannerSortClick.bind(this, index, index+1)}
                            />)
                    }
                </Div>
            </ShadowBox>
            <ShadowBox>
                <Subject mb={10}>로컬푸드 배너 (이미지, url 둘 중 하나라도 있으면 저장 됩니다) 그리고 url이 있을경우만 배너에 노출 됩니다. </Subject>

                <Div>
                    <Button mb={10} onClick={addLocalfoodBannerItem} bg={'green'} fg={'white'} px={10}><FaPlusCircle/>{' 행추가'}</Button>
                    {
                        localfoodBannerList.map((banner, index) =>
                            <BannerItem
                                images={banner.images}
                                url={banner.url}
                                startDay={banner.startDay}
                                endDay={banner.endDay}
                                onChange={onLocalfoodBannerChange.bind(this, index)}
                                onDeleteClick={onLocalfoodBannerDeleteClick.bind(this, index)}
                                onUpClick={onLocalfoodBannerSortClick.bind(this, index, index-1)}
                                onDownClick={onLocalfoodBannerSortClick.bind(this, index, index+1)}
                            />)
                    }
                </Div>
            </ShadowBox>
            <ShadowBox>
                <Subject mb={10}>* 1+1 상품 번호(판매상품, 증정상품) 입력</Subject>

                <Button mb={10} onClick={addOnePlusListGoodsClick} bg={'green'} fg={'white'} px={10}><FaPlusCircle/>{' 행추가'}</Button>

                {
                    state.onePlusList.map((goodsNo, index) =>
                        <Div p={1} mb={2} rounded={5} bc={'secondary'} key={'onePlusGoods'+index}>
                            <GoodsSelect goodsNo={state.onePlusList[index]?state.onePlusList[index].main:''} onClick={onGoodsClick.bind(this, {type: TYPE.onePlus, index: index, key: 'main', })} onDeleteClick={onOnePlusGoodsDeleteClick.bind(this, {index: index, key:'main'})}  />
                            <GoodsSelect goodsNo={state.onePlusList[index]?state.onePlusList[index].sub:''} onClick={onGoodsClick.bind(this, {type: TYPE.onePlus, index: index, key: 'sub'})} onDeleteClick={onOnePlusGoodsDeleteClick.bind(this, {index: index, key:'sub'})} />
                        </Div>
                    )

                }

                <Div mt={20}>
                    {
                        state.onePlusList.map((goodsNo, index) =>
                            <Flex> {index}. &nbsp;
                                <input key={`onePlusMainGoodsNo${index}`} type="text" placeholder={index+'번 판매상품'} value={state.onePlusList[index]?state.onePlusList[index].main:''} onChange={onOnePlusMainChange.bind(this, index)} />
                                <input key={`onePlusSubGoodsNo${index}`} type="text" placeholder={index+'번 증정상품'} value={state.onePlusList[index]?state.onePlusList[index].sub:''} onChange={onOnePlusSubChange.bind(this, index)} />
                            </Flex>
                        )
                    }
                </Div>
            </ShadowBox>

            <ShadowBox>
                <Flex mb={10}>
                    <Subject>특가 Deal 상품 번호 입력</Subject>
                    {/*<Button ml={10} onClick={addSpecialDealGoodsClick} bg={'green'} fg={'white'} px={10}><FaPlusCircle/>{' 행추가'}</Button>*/}
                </Flex>

                <Button mb={10} onClick={addSpecialDealGoodsClick} bg={'green'} fg={'white'} px={10}><FaPlusCircle/>{' 행추가'}</Button>

                {
                    state.specialDealGoodsList.map((goodsNo, index) =>
                        <GoodsSelect
                            key={'specialDealGoods'+index}
                            goodsNo={goodsNo}
                            onClick={onGoodsClick.bind(this, {type: TYPE.specialDeal, index: index})}
                            onDeleteClick={onSpecialPriceGoodsDeleteClick.bind(this, {index: index})}
                            onUpClick={onSpecialDealGoodsDownClick.bind(this, {index: index, moveIndex: -1})}
                            onDownClick={onSpecialDealGoodsDownClick.bind(this, {index: index, moveIndex: 1})}
                            sort={true}
                        />
                    )
                }

                <Div mt={20}>
                    {
                        state.specialDealGoodsList.map((goodsNo, index) =>
                            <input key={`specialDealGoodsNo${index}`} type="number" name={'specialDealGoodsList'} value={goodsNo} onChange={onSpecialDealChange.bind(this, index)} />
                        )
                    }
                </Div>
            </ShadowBox>

            <ShadowBox>
                <Flex mb={10}>
                    <Subject>오늘의 생산자 번호 입력</Subject>
                    <Div fontSize={12} fg={'dark'} mx={10}>홈 화면에 랜덤으로 한건씩 노출 됩니다.</Div>
                    {/*<Button onClick={addTodayProducerClick} bg={'green'} fg={'white'} px={10}><FaPlusCircle/>{' 행추가'}</Button>*/}
                </Flex>

                <Button mb={10} onClick={addTodayProducerClick} bg={'green'} fg={'white'} px={10}><FaPlusCircle/>{' 행추가'}</Button>

                {
                    state.todayProducerList.map((producerNo,  index) =>
                        <ProducerSelect
                            key={`todayProducer${index}`}
                            producerNo={producerNo}
                            onClick={onTodayProducerClick.bind(this, {index})}
                            onDeleteClick={onTodayProducerDeleteClick.bind(this, {index})}
                        />
                    )
                }
                {/*<input type="number" name={'todayProducerList'} value={state.todayProducerList[0]} onChange={onSpecialDealChange.bind(this, 0)} />*/}
                {/*<input type="number" name={'todayProducerList'} value={state.todayProducerList[1]} onChange={onSpecialDealChange.bind(this, 1)} />*/}
                {/*<input type="number" name={'todayProducerList'} value={state.todayProducerList[2]} onChange={onSpecialDealChange.bind(this, 2)} />*/}
            </ShadowBox>



            {/*<ShadowBox>*/}
            {/*    <Subject>*/}

            {/*        <Div>*/}
            {/*            <Span mr={10}>블리타임 상단노출 이벤트번호</Span>*/}
            {/*            <Button bc={'dark'} onClick={toggleModal}>이벤트 확인</Button>*/}
            {/*        </Div>*/}

            {/*    </Subject>*/}
            {/*    <Div>*/}
            {/*        <input type="text" name={'blyTime'} value={state.blyTime} onChange={onInputChange}/>*/}
            {/*        <Div fg={'danger'}><small>삭제 할 경우 기본 블리타임의 기본 이미지가 나타납니다</small></Div>*/}
            {/*    </Div>*/}
            {/*</ShadowBox>*/}

            <ShadowBox>
                <Subject mb={10}>
                    <Span mr={10}>포텐타임 상단노출 이벤트번호</Span>
                    <Button bc={'dark'} onClick={toggleModal}>이벤트 확인</Button>
                </Subject>
                <Div>
                    <input type="text" name={'potenTime'} value={state.potenTime} onChange={onInputChange}/>
                    <Div fg={'danger'}><small>삭제 할 경우 기본 포텐타임의 기본 이미지가 나타납니다</small></Div>
                </Div>
            </ShadowBox>

            <ShadowBox>
                <Subject mb={10}>
                    <Span mr={10}>슈퍼리워드 상단노출 이벤트번호</Span>
                    <Button bc={'dark'} onClick={toggleModal}>이벤트 확인</Button>
                </Subject>
                <Div>
                    <input type="text" name={'superReward'} value={state.superReward} onChange={onInputChange}/>
                    <Div fg={'danger'}><small>삭제 할 경우 슈퍼리워드의 기본 이미지가 나타납니다</small></Div>
                </Div>
            </ShadowBox>



            <Div textAlign={'center'}>
                <Button  px={16} bg={'green'} fg={'white'} onClick={onSaveClick}>저장</Button>
            </Div>

            <Modal isOpen={modalOpen} toggle={toggleModal} centered>
                <ModalBody>
                    <EventList />
                    <Div textAlign={'center'}>
                        <Button px={16} bg={'secondary'} fg={'white'} onClick={toggleModal}>닫기</Button>
                    </Div>
                </ModalBody>
            </Modal>

            {/*상품검색 모달 */}
            <Modal size="lg" isOpen={goodsModalOpen}
                   toggle={toggleGoodsModal} >
                <ModalHeader toggle={toggleGoodsModal}>
                    상품 검색
                </ModalHeader>
                <ModalBody>
                    {
                        selected && <B2cGoodsSearch onChange={goodsModalCallback} />
                    }
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary"
                            onClick={toggleGoodsModal}>취소</Button>
                </ModalFooter>
            </Modal>

            {/*생산자 모달 */}
            <Modal size="lg" isOpen={producerModalOpen}
                   toggle={toggleProducerModal} >
                <ModalHeader toggle={toggleProducerModal}>
                    생산자 검색
                </ModalHeader>
                <ModalBody>
                    <ProducerList
                        onClose={onTodayProducerModalClosed}
                    />
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary"
                            onClick={toggleProducerModal}>취소</Button>
                </ModalFooter>
            </Modal>





        </Div>
    )

}


function BannerItem({images, url, startDay, endDay, onChange, onDeleteClick, onUpClick, onDownClick}) {


    const [_focusedInput, setFocusedInput] = useState()

    const onImageChange = (images) => {
        console.log("images===", images)
        onChange({
            images: images,
            url: url,
            startDay: startDay,
            endDay: endDay,
        })
    }
    const onUrlChange = (e) => {
        onChange({
            images: images,
            url: e.target.value,
            startDay: startDay,
            endDay: endDay,
        })
    }

    //기간 달력
    const onEventDatesChange = ({ startDate, endDate }) => {
        console.log("onEventDatesChange");
        // const event = Object.assign({}, this.state.event);
        const newStartDay = startDate && startDate.startOf('day').format('YYYYMMDD');
        const newEndDay = endDate && endDate.endOf('day').format('YYYYMMDD');
        // this.setState({event})

        onChange({
            images: images,
            url: url,
            startDay: newStartDay,
            endDay: newEndDay,
        })
    };

    const renderEventCalendarInfo = () => <Alert className='m-1'>이벤트 시작일 ~ 종료일을 선택해 주세요</Alert>;

    return(
        <Space custom={`
                            & > div:first-child {
                                max-width: 106px;
                            }
                            
                            & > div > div > div {
                                height: 46px;
                            }
                        `}>
            <SingleImageUploader images={images} defaultCount={1} onChange={onImageChange} />
            <Input width={400} value={url} onChange={onUrlChange} placeholder={'URL 입력 ex) /home/superReward'} />

            <Label className={'font-weight-bold text-secondary small'}>기간</Label>
            <div>
                <DateRangePicker
                    startDateId='my-eventStartDate'
                    endDateId='my-eventEndDate'
                    startDatePlaceholderText="시작일"
                    endDatePlaceholderText="종료일"
                    startDate={startDay ? ComUtil.intToDateMoment(startDay).startOf() : null}
                    endDate={endDay ? ComUtil.intToDateMoment(endDay).endOf() : null}
                    onDatesChange={onEventDatesChange}
                    focusedInput={_focusedInput}
                    onFocusChange={(focusedInput) => setFocusedInput(focusedInput)}
                    numberOfMonths={1}          //달력 갯수(2개로 하면 모바일에서는 옆으로 들어가버리기 때문에 orientation='vertical'로 해야함), pc 에서는 상관없음
                    orientation={'horizontal'}
                    openDirection="up"
                    withPortal
                    small
                    readOnly
                    showClearDates
                    calendarInfoPositio="top"
                    isOutsideRange={()=>false}
                    renderCalendarInfo={renderEventCalendarInfo}
                />
            </div>

            <MenuButton bg={'danger'} onClick={onDeleteClick}>삭제</MenuButton>
            <Div ml={10} fg={'white'}>
                <Button
                    bg={'secondary'} fg={'white'}
                    px={10}
                    onClick={onUpClick} mr={8}>
                    <BsCaretUpFill/>
                </Button>
                <Button
                    bg={'secondary'} fg={'white'}
                    px={10}
                    onClick={onDownClick}>
                    <BsCaretDownFill/>
                </Button>
            </Div>
        </Space>
    )
}