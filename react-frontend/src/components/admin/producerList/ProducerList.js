import React, { Component } from 'react';
import { Button, Input } from 'reactstrap'
import {
    getAllProducers,
    authProducer,
    checkAuthProducer,
    createProducerIostAccount,
    updateProducerGoodsStop,
    changeProducerWrapDeliver
} from '~/lib/adminApi'
import {getBankInfoList, getProducerByProducerNo} from "~/lib/producerApi";
import { scOntGetBalanceOfBlctAdmin } from '~/lib/smartcontractApi'
import { Server } from '~/components/Properties';
import axios from 'axios';
import { getLoginAdminUser } from '~/lib/loginApi'
import ComUtil from '~/util/ComUtil'
// import BlctRenderer from '../SCRenderers/BlctRenderer';
// import { SingleDatePicker } from 'react-dates';
import moment from 'moment'
import {Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap'

//ag-grid
import { AgGridReact } from 'ag-grid-react';
import FilterContainer from "~/components/common/gridFilter/FilterContainer";
import {Flex, Div, FilterGroup, Hr, Span, Space, Right} from "~/styledComponents/shared";
import InputFilter from "~/components/common/gridFilter/InputFilter";
import CheckboxFilter from "~/components/common/gridFilter/CheckboxFilter";
import {MenuButton, SmButton} from "~/styledComponents/shared/AdminLayouts";
import ProducerViewer from "~/components/common/contents/BizProducerViewer";
import SearchDates from "~/components/common/search/SearchDates";

let bankList;
export default class ProducerList extends Component{

    constructor(props) {
        super(props);
        this.gridRef = React.createRef();
        this.state = {
            loading: false,
            data: [],
            columnDefs: [
                {
                    headerName: "생산자번호", field: "producerNo", sort:"asc",
                    cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
                    headerCheckboxSelection: true,
                    headerCheckboxSelectionFilteredOnly: true,  //전체 체크시 필터된 것만 체크
                    checkboxSelection: function({data}) {
                        // add your cancheck-logic here
                        if(data.producerNo == 0) return false;
                        return true;
                    }
                },
                {
                    headerName: "상품등록",  width:50, field: "goodsRegStop", cellStyle:ComUtil.getCellStyle({cellAlign: 'left'}),
                    valueGetter: function({data}) {
                        if(data.producerNo == 0) return "";
                        return (data.goodsRegStop ? "불가" : "가능")
                    }
                },
                {headerName: "생산자명", field: "farmName", cellStyle:ComUtil.getCellStyle({cellAlign: 'left'})},
                {headerName: "대표명", field: "name", cellStyle:ComUtil.getCellStyle({cellAlign: 'left'})},
                {headerName: "묶음배송여부", field: "producerWrapDeliver", cellRenderer: "wrapDeliverRenderer"},
                {headerName: "email", field: "email", width: 200, cellStyle:ComUtil.getCellStyle({cellAlign: 'left'})},
                {headerName: "account", field: "account", width: 250, cellStyle:ComUtil.getCellStyle({cellAlign: 'left'}), hide: true},
                {
                    headerName: "#해시태그", field: "tags", width: 200,
                    valueGetter: function ({data}){
                        if(data.producerNo == 0) return "";
                        if (!data.tags) return '';
                        return data.tags.map(tag => '#'+tag).join(' ')
                    },
                    cellRenderer: "tagsRenderer"
                },
                {
                    headerName: "가입일", field: "timestamp", width: 100,
                    cellStyle:ComUtil.getCellStyle({cellAlign: 'left'}),
                    valueGetter: function ({data}){
                        return ComUtil.utcToString(data.timestamp);
                    }
                },

                {headerName: "상점(연락처)", field: "shopPhone", width: 110},
                {headerName: "주요취급품목", field: "shopMainItems", width: 150},
                {headerName: "한줄소개", field: "shopIntroduce", width: 200},


                {headerName: "계좌번호", field: "payoutAccount"},
                {headerName: "예금주", field: "payoutAccountName"},

                {headerName: "통신판매업 번호", field: "comSaleNumber", width: 200},
                {headerName: "담당자명", field: "charger", width: 120},
                {headerName: "담당자연락처", field: "chargerPhone", width: 130},

                {headerName: "사업자등록번호", field: "coRegistrationNo", width: 130},
                {
                    headerName: "은행", field: "payoutBankName", width: 80,
                    valueGetter: function ({data}){
                        if (data.payoutBankCode) {
                            let bankName = "";
                            if(bankList && bankList.length > 0){
                                if(data.payoutBankCode != null && data.payoutBankCode != "") {
                                    console.log("payoutBankCode",data.payoutBankCode);
                                    bankName = bankList.find(item => item.code === data.payoutBankCode).name;
                                    console.log("bankItem",bankName);
                                }
                            }
                            return bankName;
                        }
                        return "";
                    },
                },
                {headerName: "계좌번호", field: "payoutAccount", width: 130},
                {headerName: "예금주", field: "payoutAccountName", width: 130},


                //{headerName: "BLCT", field: "blct", cellRenderer: "blctRenderer", width: 100, cellStyle:ComUtil.getCellStyle({cellAlign: 'left'})},
                //{headerName: "iost계정", field: "iostAccount", cellRenderer: "authProducerRenderer", width: 250},

            ],
            defaultColDef: {
                width: 110,
                resizable: true,
                filter: true,
                sortable: true,
                floatingFilter: false,
                filterParams: {
                    newRowsAction: 'keep'
                }
            },
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
            components: {
                applyDateRenderer: this.applyDateRenderer
            },
            frameworkComponents: {
                goodsRegStopRenderer: this.goodsRegStopRenderer,
                // blctRenderer: BlctRenderer,
                tagsRenderer: this.tagsRenderer,
                wrapDeliverRenderer: this.wrapDeliverRenderer,
                // payoutRenderer: this.payoutRenderer,
                // feeRateRenderer: this.feeRateRenderer,
                // authProducerRenderer: this.authProducerRenderer
            },
            getRowNodeId: function(data) {
                return data.id;
            },

            focused: false,
            producerNo: null,


            isOpen: false,
            isDirectFee:false,
            selectedItem: null,

            // producerFeeRateList: [],
            selectedRows: [],

            //tag관련
            tagsModalOpen: false,
            selectedRow: null,

            search:{
                selectedGubun: 'all', //'week': 최초화면을 오늘(day)또는 1주일(week)로 설정.
                startDate: null,//moment(moment().toDate()).add(-30,"days" ),
                endDate: null, //moment(moment().toDate()),
                regGoods: '',
            },
        }

        // grid events
        this.onGridReady = this.onGridReady.bind(this);
    }

    async componentDidMount() {

        let user = await getLoginAdminUser();
        if (!user || user.email.indexOf('ezfarm') < 0) {
            //admin은 웹전용이라서, window로 이동하는 것이 더 잘됨. //this.props.history.push('/admin');
            window.location = '/admin/login';
        }

        getBankInfoList().then((res)=> {
            bankList = res.data;
        });

        await this.search();
    }

    //[이벤트] 그리드 로드 후 callback 이벤트
    onGridReady = (params) => {
        // or setState if using components
        this.setState({
            gridApi: params.api,
            columnApi: params.columnApi
        });
    }

    onSelectionChanged = (event) => {
        this.updateSelectedRows()
    }
    updateSelectedRows = () => {
        this.setState({
            selectedRows: this.state.gridApi.getSelectedRows()
        })
    }

    search = async () => {
        if (this.state.gridApi) {
            //ag-grid 레이지로딩중 보이기
            this.state.gridApi.showLoadingOverlay();
        }

        const params = {
            startDate: this.state.search.startDate !== null ? moment(this.state.search.startDate).format('YYYYMMDD') : null,
            endDate: this.state.search.endDate !== null ? moment(this.state.search.endDate).format('YYYYMMDD') : null,
            regGoods: this.state.search.regGoods,
        };

        let { status, data } = await getAllProducers(params)
        if(status !== 200){
            alert('응답이 실패 하였습니다')
            return
        }

        // 싱싱블루베리농원(producerNo 78) 미노출 요청으로 필터처리
        data = data.filter(producer => (producer.producerNo !== 78));

        // manager를 data맨 위에 넣기
        // let managerAccount = await this.getBaseAccount();
        // let manager = {
        //     producerNo: 0,
        //     name: '매니저',
        //     account: managerAccount
        // }
        // data.unshift(manager);

        // const res = data.map(async(item) => {
        //     item.getBalanceOfBlct = scOntGetBalanceOfBlctAdmin;
        //     item.timestamp = ComUtil.utcToString(item.timestamp);
        //     item.iostAuth = false;
        //     if(item.iostAccount) {
        //         const {data} = await checkAuthProducer(item.iostAccount);
        //         item.iostAuth = data;
        //     }
        //     return item;
        // })

        // Promise.all(res).then(() => {
            this.setState({
                data: data
            })

            //ag-grid api
            if(this.state.gridApi) {
                //ag-grid 레이지로딩중 감추기
                this.state.gridApi.hideOverlay()
            }
        // })
    }


    // getBaseAccount = async () => {
    //     //ropsten에서는 getAccounts 동작하지 않을 수도 있기 때문에 안전하게 backend 이용.
    //     return axios(Server.getRestAPIHost() + '/baseAccount',
    //         {   method:"get",
    //             withCredentials: true,
    //             credentials: 'same-origin'
    //         }
    //     ).then((response) => {
    //         return response.data;
    //     });
    // }

    selectedRowChange = (row) => {
        console.log({row})
        this.setState({
            selectedRow: row
        }, () => {
            this.tagsModalToggle()
        })
    }
    tagsModalToggle = () => {
        this.setState({tagsModalOpen: !this.state.tagsModalOpen})
    }

    onTagsModalClose = () => {
        this.tagsModalToggle()
        this.search()
    }

    tagsRenderer = ({data}) => {
        if(data.producerNo == 0) return null;
        return (
            <Flex>
                <SmButton mr={6} onClick={this.selectedRowChange.bind(this, data)}>변경</SmButton>
                {/*<TagChangeButton onClick={this.selectedRowChange.bind(this, data)}>변경</TagChangeButton>*/}
                {/*<Div bg={'white'} py={3} bc={'secondary'} fontSize={12} lineHeight={12} px={5} mr={6} onClick={this.selectedRowChange.bind(this, data)}>변경</Div>*/}
                {
                    data.tags && data.tags.map(tag =>
                        <Span key={tag}
                            // onClick={onTagClick.bind(this, tag)}
                              fg={'blue'}
                              mr={6}>#{tag}</Span>
                    )
                }
            </Flex>
        )
    }

    // 상품등록 여부 렌더러
    goodsRegStopRenderer = ({value, data:rowData}) => {
        return (rowData.goodsRegStop ? "불가" : "가능")
    }

    wrapDeliverRenderer = ({value, data:rowData}) => {
        return (
            rowData.producerNo > 0 &&
            <Flex>
                {value ? <Span fg={'red'}><b> 묶음 </b></Span> : <Span>개별</Span> }
                <SmButton ml={10} mr={3} onClick={this.wrapDeliverChange.bind(this, rowData)}>변경</SmButton>
            </Flex>
        )
    }

    authProducerRenderer = ({value, data:rowData}) => {
        return (
            rowData.producerNo === 0 ? (<div> </div>) :
                (
                    rowData.iostAuth ?
                        (<span className='mr-3'>{rowData.iostAccount} </span>)
                        :
                        (
                            <Flex>
                                {rowData.iostAccount ?
                                    <span className='mr-3'>{rowData.iostAccount} </span>
                                    :
                                    <div style={{textAlign: 'right'}}>
                                        <Button size={'sm'} color={'secondary'} onClick={this.createProducerIostAccount.bind(this, rowData.producerNo)}>
                                            iost 계정생성</Button>
                                    </div>
                                }
                                <div style={{textAlign: 'right'}} className='ml-4'>
                                    <Button size={'sm'} color={'info'}
                                        onClick={this.authorizeProducer.bind(this, rowData.iostAccount)}>iost이력 권한</Button>
                                </div>
                            </Flex>
                        )
                )
        );
    }

    authorizeProducer = async(producerAccount) => {
        if (window.confirm('선택한 생산자에게 블록체인 기록 권한을 부여하겠습니까? (thread 처리)')) {
            await authProducer(producerAccount);
        }
    }

    createProducerIostAccount = async (producerNo) => {
        if (window.confirm('선택한 생산자의 iost 계정을 생성하시겠습니까? (결과가 나올때까지 기다려주세요)')) {
            const {data} = await createProducerIostAccount(producerNo);
            if(data) {
                alert("계정을 생성했습니다.");
                await this.search();
            } else {
                alert("계정생성에 실패했습니다. 다시 시도해주세요.");
            }
        }
    }

    applyDateRenderer = ({value, data: rowData}) => {
        console.log(value)
        if(value){
            return moment(value).format('YYYY-MM-DD')
        }
        return value
    }

    //상품 등록 중단 클릭
    onGoodsRegStopClick = async () => {
        const promises = this.state.selectedRows.map((producer) => getProducerByProducerNo(producer.producerNo))
        const res = await Promise.all(promises)

        const producerNoList = []

        res.map(({data:producer}) => {
            if (producer.producerNo > 0 && producer.goodsRegStop === false) {
                producerNoList.push(producer.producerNo)
            }
        })

        if (window.confirm(`${producerNoList.length}건을 상품등록 중단 하시겠습니까?`)) {
            try{
                await Promise.all(producerNoList.map(producerNo => updateProducerGoodsStop(producerNo, true)))
                alert(`${producerNoList.length}건이 상품등록 중단 되었습니다.`)
                this.search();
            }catch (err){
                alert('에러가 발생하였습니다. 다시 시도애 주세요.')
            }
        }
    }

    //상품 등록 재개 클릭
    onGoodsRegUnStopClick = async () => {
        const promises = this.state.selectedRows.map((producer) => getProducerByProducerNo(producer.producerNo))
        const res = await Promise.all(promises)

        const producerNoList = []

        res.map(({data:producer}) => {
            if (producer.producerNo > 0 && producer.goodsRegStop === true) {
                producerNoList.push(producer.producerNo)
            }
        })

        if (window.confirm(`${producerNoList.length}건을 상품등록 재개 하시겠습니까?`)) {
            try{
                await Promise.all(producerNoList.map(producerNo => updateProducerGoodsStop(producerNo, false)))
                alert(`${producerNoList.length}건이 상품등록 재개 되었습니다.`)
                this.search();
            }catch (err){
                alert('에러가 발생하였습니다. 다시 시도애 주세요.')
            }
        }
    }

    copy = ({value}) => {
        ComUtil.copyTextToClipboard(value, '', '');
    }

    onDatesChange = async (data) => {
        const vSearch = Object.assign({}, this.state.search);
        vSearch.startDate = data.startDate;
        vSearch.endDate = data.endDate;
        vSearch.selectedGubun = data.gubun;
        await this.setState({
            search: vSearch
        });
    }

    // 상품등록가능여부 선택
    onRegGoodsChange = async (e) => {
        const vSearch = Object.assign({}, this.state.search);
        vSearch.regGoods = e.target.value;
        await this.setState({
            search: vSearch
        });
    }

    wrapDeliverChange = async(rawData) => {
        console.log({rawData});
        let message = rawData.producerWrapDeliver ? '선택한 생산자의 묶음배송을 개별배송으로 변경하시겠습니까?' : '선택한 생산자의 개별배송을 묶음배송으로 변경하시겠습니까?';
        if (window.confirm(message)) {
            // data.producerNo
            // !data.producerWrapDeliver
            const {data} = await changeProducerWrapDeliver(rawData.producerNo, !rawData.producerWrapDeliver);
            if(data) {
                alert("변경이 완료되었습니다.");
                await this.search();
            } else {
                alert("로그인 여부를 다시 확인해주세요.")
            }
        }
    }

    render() {

        if(this.state.data.length <= 0)
            return null;

        // const {selectedItem, isDirectFee} = this.state

        return (
            <Div p={16}>
                <div className="mt-2 mb-2">
                    <Flex bc={'secondary'} m={3} p={7}>
                        <Div pl={10} pr={20} py={1}> 기 간 </Div>
                        <Div ml={10} >
                            <Flex>
                                <SearchDates
                                    gubun={this.state.search.selectedGubun}
                                    startDate={this.state.search.startDate}
                                    endDate={this.state.search.endDate}
                                    // isHiddenAll={true}
                                    isNotOnSearch={true}
                                    // isHiddenAll={true}
                                    isCurrenYeartHidden={true}
                                    onChange={this.onDatesChange}
                                />

                                <div className='ml-2'>
                                    <Input type='select'
                                           name='regGoods'
                                           id='searchModDate'
                                           onChange={this.onRegGoodsChange}
                                           value={this.state.search.regGoods}
                                    >
                                        <option name='regGoods' value=''>등록여부 전체</option>
                                        <option name='regGoods' value='true'>상품등록가능</option>
                                        <option name='regGoods' value='false'>상품등록불가</option>
                                    </Input>
                                </div>

                                <Button className="ml-3" color="primary" onClick={this.search}> 검 색 </Button>
                            </Flex>
                        </Div>
                    </Flex>
                </div>

                {/* filter START */}
                <FilterContainer gridApi={this.state.gridApi} columnApi={this.state.columnApi} excelFileName={'생산자 목록'}>
                    <FilterGroup>
                        <InputFilter
                            gridApi={this.state.gridApi}
                            columns={[
                                {field: 'producerNo', name: '생산자번호'},
                                {field: 'name', name: '생산자명'},
                                {field: 'localfoodFlag', name: '로컬푸드'},
                                {field: 'farmName', name: '농장명'},
                                {field: 'email', name: '이메일'},
                                {field: 'tags', name: '해시태그'},
                                // {field: 'producerFeeRate', name: '커미션%'},
                                {field: 'shopPhone', name: '상점(연락처)'}
                            ]}
                            isRealTime={true}
                        />
                    </FilterGroup>
                    <Hr/>
                    <FilterGroup>
                        <CheckboxFilter
                            gridApi={this.state.gridApi}
                            field={'goodsRegStop'}
                            name={'상품등록'}
                            data={[
                                {value: '가능', name: '가능'},
                                {value: '불가', name: '불가'},
                            ]}
                        />
                    </FilterGroup>
                </FilterContainer>
                {/* filter END */}
                <Flex mb={10}>
                    <Space>
                        <MenuButton onClick={() => this.search()}>새로고침</MenuButton>
                        {
                            (this.state.selectedRows.length > 0) && <MenuButton bg={'danger'} onClick={this.onGoodsRegStopClick}>{this.state.selectedRows.length}건 등록중지</MenuButton>
                        }
                        {
                            (this.state.selectedRows.length > 0) && <MenuButton bg={'green'} onClick={this.onGoodsRegUnStopClick}>{this.state.selectedRows.length}건 등록재개</MenuButton>
                        }
                    </Space>
                    <Right>
                        총 {this.state.data.length} 건
                    </Right>
                </Flex>

                <div
                    className="ag-theme-balham"
                    style={{
                        height: '700px',
                    }}
                >
                    <AgGridReact
                        ref={this.gridRef}
                        rowSelection={'multiple'}
                        suppressRowClickSelection={false}   //false : 셀 클릭시 체크박스도 체크 true: 셀클릭시 체크박스 체크 안함
                        columnDefs={this.state.columnDefs}  //컬럼 세팅
                        defaultColDef={this.state.defaultColDef}
                        getRowHeight={50}
                        overlayLoadingTemplate={this.state.overlayLoadingTemplate}
                        overlayNoRowsTemplate={this.state.overlayNoRowsTemplate}
                        rowData={this.state.data}
                        components={this.state.components}  //custom renderer 지정, 물론 정해져있는 api도 있음
                        frameworkComponents={this.state.frameworkComponents}
                        onGridReady={this.onGridReady}   //그리드 init(최초한번실행)
                        onCellDoubleClicked={this.copy}
                        onSelectionChanged={this.onSelectionChanged.bind(this)}
                    >
                    </AgGridReact>

                </div>

                <Modal isOpen={this.state.tagsModalOpen} toggle={this.tagsModalToggle} size={'md'}>
                    <ModalHeader toggle={this.tagsModalToggle}> 해시태그 수정</ModalHeader>
                    <ModalBody style={{padding: 0}}>
                        <ProducerViewer
                            producerNo={this.state.selectedRow && this.state.selectedRow.producerNo}
                            onClose={this.onTagsModalClose}
                        />
                    </ModalBody>
                </Modal>

            </Div>
        )
    }
}
