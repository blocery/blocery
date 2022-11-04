import React, {Fragment, Component} from 'react';
import {Button} from '~/styledComponents/shared/Buttons'
import axios from 'axios'
import { Link } from 'react-router-dom'
import {getConsumer} from "~/lib/shopApi";
export default class AddressManagementContent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            consumerNo: this.props.consumerNo,
            // name: '',
            // phone: '',
            // addr: '',
            // addrDetail: '',
            // zipNo: '',
            modal: false,
            tatalCount: '',
            results: [],
            updateAddress: false,
            addressess: []
        }
    }

    componentDidMount() {
        this.search()
    }

    search = async () => {
        const {data:consumerInfo} = await getConsumer();

        this.setState({
            consumerNo: consumerInfo.consumerNo,
            addressess: consumerInfo.consumerAddresses
        })
    }

    // element값 변경시
    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    // 주소검색 클릭
    addressModalPopup = () => {
        this.setState({ modal: true })
    }

    modalToggle = () => {
        this.setState(prevState => ({
            modal: !prevState.modal
        }));
    }

    searchAPIcall = async () => {
        //공공주소 open API
        let query = this.state.updateAddress;
        let bodyFormData = new FormData();

        //console.log('query:'+query);

        bodyFormData.set('currentPage','1');
        bodyFormData.set('countPerPage','100');
        bodyFormData.set('resultType','json');
        bodyFormData.set('confmKey','U01TX0FVVEgyMDE5MDQyNjEzMDEwNjEwODY4Mjc='); //이지팜 키.
        bodyFormData.set('keyword', query);

        let {data:allResults} = await  axios(window.location.protocol + '//www.juso.go.kr/addrlink/addrLinkApiJsonp.do', { method: "post",
            data: bodyFormData,
            config: {
                headers: {
                    dataType:'jasonp',
                    crossDomain: true
                }
            }
        });

        //괄호 제거
        let jsonResults = JSON.parse(allResults.substring(1, allResults.lastIndexOf(')')));

        let totalCount = jsonResults.results.common.totalCount;
        //console.log(jsonResults.results);

        const juso = jsonResults.results.juso || []

        let results = juso.map( (row,i) => {
                return {zipNo: row.zipNo, roadAddrPart1: row.roadAddrPart1};
            }
        );

        //console.log('results:',results);
        this.setState({
            totalCount: totalCount,
            results:results
        });
    }

    addressSelected = (row) => {
        const data = Object.assign({}, this.state)
        data.addr = row.roadAddrPart1
        data.zipNo = row.zipNo

        this.setState({
            addr: row.roadAddrPart1,
            zipNo: row.zipNo
        })

        this.modalToggle();
    }

    addressInsert = () => {
        const params = {
            pathname: '/mypage/addressModify',
            search: '?flag=mypage',
            state: null
        }
        this.props.history.push(params)
    }

    addressModify = (i) => {
        const params = {
            pathname: '/mypage/addressModify',
            search: '?index='+i+'&flag=mypage',
            state: null
        }
        this.props.history.push(params)
    }

    render() {
        const data = this.state.addressess
        return (
            <Fragment>
                {
                    data.length !== 0 ?
                        data.map(({addrName, receiverName, addr, addrDetail, zipNo, phone, basicAddress}, index)=>{
                            return (
                                <div key={index}>
                                    <div className='d-flex p-3'>
                                        <div className='mr-2'>
                                            {
                                                basicAddress == 1?
                                                    <div className='p-1 f6 border bg-light mb-2 d-inline-block'><b>기본배송지</b></div> : ''
                                            }
                                            <div className='f5 textBoldLarge text-secondary'>{addrName} ({receiverName})</div>
                                            <div className='f6'>{addr} {addrDetail}({zipNo})</div>
                                            <div className='f6'>{phone}</div>
                                        </div>
                                        <div className='flex-shrink-0 d-flex justify-content-center align-items-center ml-auto'>
                                            <Button outline color="secondary" size='sm' onClick={this.addressModify.bind(this, index)}>수정</Button>
                                        </div>
                                    </div>
                                    <hr className='m-0 p-0' />
                                </div>
                            )
                        })
                        :
                        <div className='w-100 h-100 bg-light d-flex justify-content-center align-items-center p-5 text-dark'>등록된 주소록이 없습니다.</div>
                }
                <div className='m-3'>
                    {/*<Link to={'/mypage/addressModify?flag=mypage'}>*/}
                        <Button block bg={'green'} fg={'white'} py={16} onClick={this.addressInsert}>+ 배송지 추가</Button>
                    {/*</Link>*/}
                </div>


            </Fragment>
        )
    }
}