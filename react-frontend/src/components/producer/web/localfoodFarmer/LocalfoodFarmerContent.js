import React, {Fragment, useEffect, useState} from 'react'
import {Flex, Right, Input, Button, Div} from "~/styledComponents/shared";
import {AddressCard, SingleImageUploader} from "~/components/common";
import {FormGroup, Row, Col, Label} from "reactstrap";
import {getLocalfoodFarmer, addOrUpdateLocalfoodFarmer} from '~/lib/producerApi'
import SummernoteEditor from "~/components/common/summernoteEditor";
import {getItems} from "~/lib/adminApi";
import Select from "react-select";
import Switch from "react-switch";
import {toast} from "react-toastify";
import ComUtil from "~/util/ComUtil";


let bindCorporation = [
    { value: "farmer", label:'생산자' },
    { value: "agriCorporation", label:'영농법인(조합)' }
]

const LocalfoodFarmerContent = (props) => {
    const [state, setState] = useState({
        localfoodFarmerNo: props.localfoodFarmerNo || 0,
        localFarmerNo: props.localFarmerNo || '',
        coRegistrationNo: '',
        phoneNum: '',
        farmerType: 'farmer',     // 생산자(farmer), 영농조합법인(agriCorporation)
        farmName: '',
        farmerName: '',
        farmerImages: [],
        mainItems: '',
        priority: 0,

        bankName: '',
        acntNo: '',
        acntName: '',
        feeRate: 0,

        desc: '',
        zipNo: '',
        address: '',
        addressDetail: '',
        deleted: false,
        starred: false,     // 주요농가 여부
        localFarmerContent: null,   //생산자 스토리
        // shopIntroduce: null
    })


    const [label, setLabel] = useState({farm:'농가명', farmer:'생산자명'})

    const [items, setItems] = useState(null)

    useEffect(() => {
        async function fetch() {
            if(!props.isNew) {
                let {data} = await getLocalfoodFarmer(state.localfoodFarmerNo);
                setState(data)
                if(data.farmerType === 'agriCorporation') {
                    setLabel({ farm:'상호명', farmer:'대표자명' })
                }
            }

            const { data: itemsData } = await getItems(true)
            const items =  itemsData.map(item => ({value: item.itemNo, label: item.itemName, itemKinds: item.itemKinds, enabled: item.enabled, itemFeeRate: item.itemFeeRate}))
            setItems(items)
        }
        fetch();
    }, []);

    // element의 값이 체인지될 때
    const handleChange = (e) => {
        setState({
            ...state,
            [e.target.name]: e.target.value
        })
    }

    const onFarmerImageChange = (images) => {
        setState({...state, farmerImages: images})
    }

    const onAddressChange = (address) => {
        setState({
            ...state,
            zipNo: address.zipNo,
            address: address.address,
            addressDetail: address.addressDetail
        })
    }

    const onChangeShopIntroduce = (editorHtml) => {
        setState({
            ...state,
            localFarmerContent: editorHtml
        })
    }

    const notify = (msg, toastFunc) => {
        toastFunc(msg, {
            position: toast.POSITION.TOP_RIGHT
        })
    }

    const onClickConfirm = async () => {
        if(state.farmerName.length <= 0){
            notify('생산자명은 필수 입니다', toast.error)
            return
        }
        if(state.farmerImages.length <= 0){
            notify('농가사진은 필수 입니다', toast.error)
            return
        }
        // if(state.zipNo.length <= 0 || state.address.length <= 0){
        //     notify('주소는 필수 입니다', toast.error)
        //     return
        // }
        if(state.mainItems.length <= 0){
            notify('주요품목은 필수 입니다', toast.error)
            return
        }
        // if(state.desc.length <= 0){
        //     notify('한줄소개는 필수 입니다', toast.error)
        //     return
        // }

        const {data: errRes, status} = await addOrUpdateLocalfoodFarmer(state)
        if (errRes.resCode) {
            alert(errRes.errMsg) //위 3가지 에러 서버에서 리턴.
            return;
        } else {
            alert('저장이 완료되었습니다.')
            props.toggle();
        }
    }

    const onItemChange = (item) => {
        setState({
            ...state,
            mainItems: item.label
        })
    }

    const deletedChange = () => {
        setState({
            ...state,
            deleted: !state.deleted
        })
    }

    const starredChange = () => {
        setState({ ...state, starred: !state.starred })
    }

    const farmerTypeChange = (e) => {
        console.log(e.target)
        setState({...state, farmerType: e.target.value})
        if(e.target.value === 'farmer') {
            setLabel({farm:'농가명', farmer: '생산자명'})
        } else {
            setLabel({farm:'상호명', farmer: '대표자명'})
        }
    }

    //연락처 정규식 체크
    const checkPhoneRegex = (e) => {
        console.log(e.target)
        setState({
            ...state, phoneNum: ComUtil.phoneRegexChange(e.target.value)
        })
    }

    const star = <span className='text-danger'>*</span>;

    return (
        <div>
            <FormGroup>
                {
                    bindCorporation.map((item, index) => {
                        const id = `farmer_${index}`
                        return (
                            <Fragment key={id}>
                                <input
                                    type="radio"
                                    checked={state.farmerType === item.value ? true : false}
                                    id={id}
                                    name="category"
                                    value={item.value}
                                    className='mr-2'
                                    onChange={farmerTypeChange} />
                                <label for={id} className='p-0 m-0 mr-3'>{item.label}</label>
                            </Fragment>
                        )
                    })
                }
            </FormGroup>

            <FormGroup inline>
                <Row>
                    <Col sm={3}>
                        <Label>{label.farmer} {star}</Label>
                    </Col>
                    <Col sm={9}>
                        <Input name={'farmerName'} width={'100%'}  placeholder={'소비자 노출용: 예)홍길동'} value={state.farmerName||''} onChange={handleChange} />
                    </Col>
                </Row>
            </FormGroup>

            <FormGroup inline>
                <Row>
                    <Col sm={3}>
                        <Label>{label.farm}</Label>
                    </Col>
                    <Col sm={9}>
                        <Input name={'farmName'} width={'100%'}  placeholder={'정산용: 예) [친]홍길동'} value={state.farmName||''} onChange={handleChange} />
                    </Col>
                </Row>
            </FormGroup>

            <FormGroup inline>
                <Row>
                    <Col sm={3}>
                        <Label>농가사진 {star}</Label>
                    </Col>
                    <Col sm={9}>
                        <SingleImageUploader images={state.farmerImages} defaultCount={5} isShownMainText={false} onChange={onFarmerImageChange} />
                    </Col>
                </Row>
            </FormGroup>

            <FormGroup inline>
                <Row>
                    <Col sm={3}>
                        <Label>농가 바코드번호</Label>
                    </Col>
                    <Col sm={9}>
                        <Input name={'localFarmerNo'} width={'100%'} value={state.localFarmerNo||''}  placeholder={'재고관리시 필수.'} onChange={handleChange} />
                    </Col>
                </Row>
            </FormGroup>

            <FormGroup>
                <Row>
                    <Col sm={3}>
                        <Label>사업자등록번호</Label>
                    </Col>
                    <Col sm={9}>
                        <Input name={'coRegistrationNo'} width={'100%'} value={state.coRegistrationNo||''} onChange={handleChange} />
                    </Col>
                </Row>
            </FormGroup>

            <FormGroup>
                <Row>
                    <Col sm={3}>
                        <Label>연락처</Label>
                    </Col>
                    <Col sm={9}>
                        <Input name={'phoneNum'} width={'100%'} value={state.phoneNum||''} placeholder={'기획생산/농가관리 메뉴에서 조회 후 입력'} onChange={handleChange} onBlur={checkPhoneRegex}  />
                    </Col>
                </Row>
            </FormGroup>

            <FormGroup>
                <Row>
                    <Col sm={3}>
                       <Label>주소</Label>
                    </Col>
                    <Col sm={9}>
                        <AddressCard
                            zipNo={state.zipNo}
                            address={state.address}
                            addressDetail={state.addressDetail}
                            onChange={onAddressChange} />
                    </Col>
                </Row>
            </FormGroup>

            <FormGroup>
                <Row>
                    <Col sm={3}>
                        <Label>주요품목 {star}</Label>
                    </Col>
                    <Col sm={9}>
                        <Select options={items}
                                value={items && items.find(item => item.label === state.mainItems)}
                                onChange={onItemChange}
                        />
                    </Col>
                </Row>
            </FormGroup>

            <FormGroup>
                <Row>
                    <Col sm={3}>
                        <Label>한줄소개</Label>
                    </Col>
                    <Col sm={9}>
                        <Input name={'desc'} width={'100%'} value={state.desc||''} onChange={handleChange} />
                    </Col>
                </Row>
            </FormGroup>

            <FormGroup>
                <Row>
                    <Col sm={3}>
                        <Label>우선순위</Label>
                        <Div fontSize={12} fg={'danger'}>* 높은 값 우선노출</Div>
                    </Col>
                    <Col sm={9}>
                        <Input name={'priority'} width={'100%'} value={state.priority||0} onChange={handleChange} />
                    </Col>
                </Row>
            </FormGroup>
            { !props.isNew &&
                <FormGroup>
                    <Row>
                        <Col sm={3}>
                            <Label>바코드 출력비율(%) : 기본 70%</Label>
                        </Col>
                        <Col sm={9}>
                            <Input name={'barcodeRatio'} width={'100%'} value={state.barcodeRatio} onChange={handleChange} />
                        </Col>
                    </Row>
                </FormGroup>
            }

            <FormGroup>
                <Row>
                    <Col sm={3}>
                        <Label>은행명</Label>
                    </Col>
                    <Col sm={9}>
                        <Input name={'bankName'} width={'100%'} value={state.bankName||''} onChange={handleChange} />
                    </Col>
                </Row>
            </FormGroup>
            <FormGroup>
                <Row>
                    <Col sm={3}>
                        <Label>계좌번호</Label>
                    </Col>
                    <Col sm={9}>
                        <Input name={'acntNo'} width={'100%'} value={state.acntNo||''} onChange={handleChange} />
                    </Col>
                </Row>
            </FormGroup>
            <FormGroup>
                <Row>
                    <Col sm={3}>
                        <Label>예금주</Label>
                    </Col>
                    <Col sm={9}>
                        <Input name={'acntName'} width={'100%'} value={state.acntName||''} onChange={handleChange} />
                    </Col>
                </Row>
            </FormGroup>
            <FormGroup>
                <Row>
                    <Col sm={3}>
                        <Label>수수료(%)</Label>
                    </Col>
                    <Col sm={9}>
                        <Input name={'feeRate'} width={'100%'} value={state.feeRate||0} onChange={handleChange} />
                    </Col>
                </Row>
            </FormGroup>

            <FormGroup>
                <Row>
                    <Col sm={3}>
                        <Label>사용유무</Label>
                    </Col>
                    <Col sm={9}>
                        <Switch checked={!state.deleted} onChange={deletedChange}></Switch>
                    </Col>
                </Row>
            </FormGroup>

            <FormGroup>
                <Row>
                    <Col sm={3}>
                        <Label>주요농가</Label>
                    </Col>
                    <Col sm={9}>
                        <Switch checked={state.starred} onChange={starredChange}></Switch>
                    </Col>
                </Row>
            </FormGroup>

            <FormGroup>
                <Row>
                    <Col sm={3}>
                        <Label>생산자 스토리</Label>
                    </Col>
                </Row>
                <SummernoteEditor
                    height={400}
                    quality={1}
                    onChange={onChangeShopIntroduce}
                    editorHtml={state.localFarmerContent||null}
                />
            </FormGroup>

            <Flex>
                <Right>
                    <Button px={20} bg={'green'} fg={'white'} onClick={onClickConfirm}>확인</Button>
                    <Button px={20} bg={'secondary'} fg={'white'} ml={5} onClick={props.toggle}>닫기</Button>
                </Right>
            </Flex>

        </div>
    )
}

export default LocalfoodFarmerContent