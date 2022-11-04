import React, {useState, useEffect} from 'react'
import {Div, Flex, Button, Hr, Right, Span} from "~/styledComponents/shared";
import {Col, FormGroup, Input, Label, Row, Spinner} from "reactstrap";
import {useParams} from "react-router-dom";
import BasicNavigation from "~/components/common/navs/BasicNavigation";
import {getLocalfoodFarmerListByLocalFarmerNo} from "~/lib/localfoodApi"
import onClick from "swiper/src/components/core/events/onClick";
import {AddressCard} from "~/components/common";
import ComUtil from "~/util/ComUtil";

const SearchFarmer = (props) => {
    const {producerNo} = useParams()

    const [searchObj, setSearchObj] = useState({producerNo: producerNo, localFarmerNo:'', phoneNum:''})
    const [loading, setLoading] = useState(true)
    const [list, setList] = useState()

    useEffect(() => {

    }, [])

    const onInputChange = (e) => {
        let {name, value} = e.target
        setSearchObj({
            ...searchObj,
            [name]: value
        })
    }

    const checkPhoneRegex = (e) => {
        setSearchObj({
            ...searchObj,
            phoneNum: ComUtil.phoneRegexChange(e.target.value)
        })
    }

    const onSearchClick = async () => {
        if(searchObj.localFarmerNo === '' && searchObj.phoneNum === '') {
            alert('검색할 농가번호 또는 연락처를 입력해주세요.')
            return;
        }
        const {data} = await getLocalfoodFarmerListByLocalFarmerNo(searchObj)

        setList(data)
    }

    const onClickFarm = (localFarmerNo) => {
        props.history.push(`/localhistory/localFarmer/${localFarmerNo}`)
    }

    // if(loading)
    //     return <Flex minHeight={400} justifyContent={'center'}><Spinner color={'success'} /></Flex>

    return (
        <div>
            <BasicNavigation><Div pl={16}>샵블리 온라인 주문목록</Div></BasicNavigation>

            <Div p={16}>
                <FormGroup>
                    <Row>
                        <Col sm={3}>
                            <Label>농가번호</Label>
                        </Col>
                        <Col sm={9}>
                            <Input type={'text'} name={'localFarmerNo'} value={searchObj.localFarmerNo || ''} onChange={onInputChange} />
                        </Col>
                    </Row>
                </FormGroup>

                <Div textAlign={'center'} my={15}>or</Div>

                <FormGroup>
                    <Row>
                        <Col sm={3}>
                            <Label>연락처</Label>
                        </Col>
                        <Col sm={9}>
                            <Input type={'text'} name={'phoneNum'} value={searchObj.phoneNum || ''} onChange={onInputChange} onBlur={checkPhoneRegex} placeholder={'010-0000-0000'} />
                        </Col>
                    </Row>
                </FormGroup>

                {/*<Flex mb={10}>*/}
                {/*    <Div mr={10} width={'100%'}>농가번호 : </Div>*/}
                {/*    <Input type={'text'} name={'localFarmerNo'} value={searchObj.localFarmerNo || ''} onChange={onInputChange} />*/}
                {/*</Flex>*/}

                {/*<Flex>*/}
                {/*    <Div mr={10} width={'100%'}>연락처 : </Div>*/}
                {/*    <Input type={'text'} name={'phoneNum'} value={searchObj.phoneNum || ''} onChange={onInputChange} />*/}
                {/*</Flex>*/}
            </Div>

            <Div px={16} pb={16}>
                <Button block bg={'green'} fg={'white'} onClick={onSearchClick}>검색</Button>
            </Div>

            <Hr />

            {
                list &&
                    <Div p={16}>
                        <Flex mb={20}><Right>총 {list.length}건</Right></Flex>
                        {
                            list.map((item, index) =>
                                <Flex cursor p={10} mb={20} bc={'dark'} onClick={onClickFarm.bind(this, item.localFarmerNo)}>
                                    <Div>
                                        <Div mb={10}><Span bold mr={10}>{item.localFarmerNo}</Span>{item.farmName}</Div>
                                        <Div>{item.phoneNum}</Div>
                                    </Div>
                                    <Right alignItems={'center'}>
                                        <Button onClick={onClickFarm.bind(this, item.localFarmerNo)} px={10} bg={'green'} fg={'white'}>주문내역 보기</Button>
                                    </Right>
                                </Flex>
                            )
                        }
                    </Div>
            }


        </div>
    )
}

export default SearchFarmer