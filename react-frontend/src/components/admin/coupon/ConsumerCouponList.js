import React, {Component, useState, useEffect, Suspense, lazy} from "react";
import ComUtil from "~/util/ComUtil";
import {ExcelDownload} from "~/components/common";
import {Div, Span, Flex, Right, Hr, Space} from '~/styledComponents/shared/Layouts'
import {AgGridReact} from "ag-grid-react";
import {Button, Input, Modal, ModalBody, ModalHeader} from "reactstrap";
import moment from "moment";
import {getLoginAdminUser} from "~/lib/loginApi";
import SearchDates from '~/components/common/search/SearchDates'
import {getCouponMaster, getConsumerCouponList, getConsumerAllCoupon, getConsumerAllCouponWithOrderInfo} from "~/lib/adminApi";
import {FilterGroup} from "~/styledComponents/shared";
import InputFilter from "~/components/common/gridFilter/InputFilter";
import CheckboxFilter from "~/components/common/gridFilter/CheckboxFilter";
import FilterContainer from "~/components/common/gridFilter/FilterContainer";
import {MenuButton} from "~/styledComponents/shared/AdminLayouts";
import {withRouter} from "react-router-dom"
import Select from "react-select";

const CouponMemoRenderer = (props) => {
    const [couponMemo, setCouponMemo] = useState()
    useEffect(() => {

        getCouponMaster({masterNo:props.data.masterNo}).then(res => {
            setCouponMemo(res.data.couponMemo)
        })

    }, [])
    return <div>{couponMemo === undefined ? '...' : couponMemo}</div>
}

const BlySiseWithoutCoupon = lazy(()=> import('./BlySiseWithoutCoupon'))

class ConsumerCouponList extends Component {
    constructor(props) {
        super(props);

        let searchMasterNo = 0;
        const params = ComUtil.getParams(props);

        if(params.couponMasterNo) {
            searchMasterNo = params.couponMasterNo;
        }

        this.state = {
            loading: false,
            selectedGubun: 'day', //'week': 최초화면을 오늘(day)또는 1주일(week)로 설정.
            startDate: moment(moment().toDate()),
            endDate: moment(moment().toDate()),
            searchMasterNo: searchMasterNo,
            searchUsed: null,
            searchDateOption:[
                {value:'issuedDate', label:'발급일기준'},
                {value:'usedDate', label:'사용일기준'}
            ],
            searchDate:'issuedDate',
            data: [],
            searchConsumerNo: 0,
            isSiseModalOpen: false,
            columnDefs: [
                {headerName: "쿠폰NO", field: "couponNo", width: 100, cellStyle:this.getCellStyle({cellAlign: 'center'})},
                {headerName: "소비자번호", field: "consumerNo", width: 100, cellStyle:this.getCellStyle({cellAlign: 'center'})},
                {headerName: "이름", field: "name", width: 100, cellStyle:this.getCellStyle({cellAlign: 'center'})},
                {headerName: "연락처", field: "phone", width: 130, cellStyle:this.getCellStyle({cellAlign: 'center'})},
                {headerName: "Email", field: "email", width: 160, cellStyle:this.getCellStyle({cellAlign: 'center'})},
                {headerName: "추천친구", field: "recommenderNo", width: 90, cellStyle:this.getCellStyle({cellAlign: 'center'})},
                {headerName: "쿠폰명", field: "couponTitle", width: 200, cellStyle:this.getCellStyle({cellAlign: 'center'})},
                {headerName: "앱전용", field: "onlyAppCoupon", width: 90, cellStyle:this.getCellStyle({cellAlign: 'center'}),
                    valueGetter: function(params) {
                        return params.data.onlyAppCoupon ? "앱전용" : "-" ;
                    }
                },
                {headerName: "원화쿠폰", field: "wonCoupon", width: 90, cellStyle:this.getCellStyle({cellAlign: 'center'}),
                    valueGetter: function(params) {
                        return params.data.wonCoupon ? "원화" : "-" ;
                    }
                },
                {
                    headerName: "상품쿠폰", field: "couponGoods", width: 180,
                    cellStyle:this.getCellStyle({cellAlign: 'left'}),
                    valueGetter: function(params) {
                        return params.data.couponGoods ? params.data.couponGoods.goodsNm : "-" ;
                    }
                },
                {headerName: "쿠폰메모", field: "couponMemo", width: 200, cellRenderer: "couponMemoRenderer", filter: false},
                {headerName: "일련번호", field: "hexCouponNo", width: 130, cellStyle:this.getCellStyle({cellAlign: 'center'})},
                {headerName: "발급일", field: "issuedDate", width: 130, cellStyle:this.getCellStyle({cellAlign: 'center'}),
                    valueGetter: function(params) {
                        return (params.data.issuedDate ? ComUtil.utcToString(params.data.issuedDate, 'YYYY-MM-DD HH:mm') : '-');
                    },
                },
                {headerName: "지급처", field: "manualIssueFlag", width: 130, cellStyle:this.getCellStyle({cellAlign: 'center'}),
                    valueGetter: function(params) {
                        return (params.data.manualIssueFlag) ? "수동(관리자)" : "자동";
                    }
                },
                {headerName: "사용기간", field: "useDay", width: 180,
                    valueGetter: function(params) {
                        let v_Date = '-';
                        if(params.data.useStartDay > 0) {
                            v_Date = ComUtil.intToDateString(params.data.useStartDay, 'YYYY.MM.DD') + '~' + ComUtil.intToDateString(params.data.useEndDay, 'YYYY.MM.DD')
                        }
                        return v_Date;
                    },
                    cellStyle:this.getCellStyle({cellAlign: 'center'})},  // useStartDay useEndDay
                {headerName: "사용여부", field: "usedFlag", width: 100, cellStyle:this.getCellStyle({cellAlign: 'center'}),
                    valueGetter: function(params) {
                        return (params.data.usedFlag) ? "사용" : "미사용";
                    }
                },
                {headerName: "사용일", field: "usedDate", width: 130, cellStyle:this.getCellStyle({cellAlign: 'center'}),
                    valueGetter: function(params) {
                        return (params.data.usedDate ? ComUtil.utcToString(params.data.usedDate, 'YYYY-MM-DD HH:mm') : '-');
                    },
                },
                {headerName: "주문일", field: "orderDate", width: 120,
                    valueGetter: function(params) {
                        let v_Date = '-';
                        if(params.data.orderSeq > 0) {
                            v_Date = ComUtil.utcToString(params.data.orderDate, 'YYYY.MM.DD')
                        }
                        return v_Date;
                    },
                    cellStyle:this.getCellStyle({cellAlign: 'center'})},  // useStartDay useEndDay
                // {headerName: "상품코드", field: "goodsNo", width: 100, cellStyle:this.getCellStyle({cellAlign: 'center'})},
                {headerName: "주문번호", field: "orderSeqList", width: 170, cellStyle:this.getCellStyle({cellAlign: 'center'}),
                    valueGetter: function(params) {
                        let seqList = '';
                        if(params.data.usedFlag && params.data.orderSeq > 0) {
                            params.data.orderSeqList && params.data.orderSeqList.map(item => {
                                seqList = seqList + item + " / "
                            })
                        }
                        return seqList;
                    }
                },
                {headerName: "주문금액", field: "orderPrice", width: 130,
                    valueGetter: function(params) {
                        let value = '-';
                        if(params.data.usedFlag && params.data.orderSeq > 0) {
                            value = ComUtil.addCommas(params.data.orderPrice)
                        }
                        return value;
                    },
                    cellStyle:this.getCellStyle({cellAlign: 'center'})},
                {headerName: "사용BLY", field: "couponBlyAmount", width: 110, cellStyle:this.getCellStyle({cellAlign: 'center'}),
                    valueGetter: function(params) {
                        return params.data.couponBlyAmount + "BLY";
                    }
                },
                {headerName: "BLY 시세", field: "orderBlctExchangeRate", width: 110, cellStyle:this.getCellStyle({cellAlign: 'center'})},
                {headerName: "사용쿠폰가격", field: "couponPrice", width: 120,
                    valueGetter: function(params) {
                        let value = '-';
                        if(params.data.usedFlag && params.data.orderSeq > 0) {
                            value = ComUtil.addCommas(ComUtil.doubleMultiple(params.data.couponBlyAmount,params.data.orderBlctExchangeRate).toFixed(0))
                        }
                        return value;
                    },
                    cellStyle:this.getCellStyle({cellAlign: 'center'})},
                {headerName: "쿠폰 원화금액", field: "fixedWon", width: 110, cellStyle:this.getCellStyle({cellAlign: 'center'}),
                    valueGetter: function(params) {
                        return params.data.fixedWon + "원";
                    }},
                {headerName: "최소 주문금액", field: "minGoodsPrice", width: 120, cellStyle:this.getCellStyle({cellAlign: 'center'}),
                    valueGetter: function(params) {
                        return params.data.minGoodsPrice + "원";
                    }
                },
                {headerName: "최소 주문BLY", field: "minOrderBlyAmount", width: 120, cellStyle:this.getCellStyle({cellAlign: 'center'}),
                    valueGetter: function(params) {
                        if(params.data.minGoodsPrice === 0) {
                            return params.data.minOrderBlyAmount + "BLY";
                        } else {
                            return '원화주문금액참고';
                        }
                    }
                },
            ],
            defaultColDef: {
                width: 110,
                resizable: true,
                filter: true,
                sortable: true,
                floatingFilter: true,
                filterParams: {
                    newRowsAction: 'keep'
                }
            },
            frameworkComponents: {
                formatCurrencyRenderer: this.formatCurrencyRenderer,
                formatDateRenderer: this.formatDateRenderer,
                formatDateTimeRenderer: this.formatDateTimeRenderer,
                couponMemoRenderer: CouponMemoRenderer
            },
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
        }
    }

    //Ag-Grid Cell 숫자콤마적용 렌더러
    formatCurrencyRenderer = ({value, data: rowData}) => {
        //console.log("rowData",rowData);
        return ComUtil.addCommas(value);
    };
    //Ag-Grid Cell 날짜변환 렌더러
    formatDateRenderer = ({value, data: rowData}) => {
        return (value ? ComUtil.utcToString(value, 'YYYY-MM-DD') : '-')
    };
    formatDateTimeRenderer = ({value, data: rowData}) => {
        return (value ? ComUtil.utcToString(value, 'YYYY-MM-DD HH:mm') : '-')
    };

    // Ag-Grid Cell 스타일 기본 적용 함수
    getCellStyle ({cellAlign,color,textDecoration,whiteSpace, fontWeight}){
        if(cellAlign === 'left') cellAlign='flex-start';
        else if(cellAlign === 'center') cellAlign='center';
        else if(cellAlign === 'right') cellAlign='flex-end';
        else cellAlign='flex-start';
        return {
            display: "flex",
            alignItems: "center",
            justifyContent: cellAlign,
            color: color,
            textDecoration: textDecoration,
            whiteSpace: whiteSpace,
            fontWeight: fontWeight
        }
    }

    async componentDidMount() {

        let user = await getLoginAdminUser();
        if (!user || user.email.indexOf('ezfarm') < 0) {
            //admin은 웹전용이라서, window로 이동하는 것이 더 잘됨. //this.props.history.push('/admin');
            window.location = '/admin/login';
        }

        await this.search();
    }

    //[이벤트] 그리드 로드 후 callback 이벤트
    onGridReady(params) {
        //API init
        this.gridApi = params.api
        this.columnApi = params.columnApi
        //this.gridColumnApi = params.columnApi
        // console.log("onGridReady");
    }

    search = async (searchButtonClicked) => {

        if (searchButtonClicked) {
            if (!this.state.startDate || !this.state.endDate) {
                alert('시작일과 종료일을 선택해주세요')
                return;
            }
        }

        if(this.gridApi) {
            //ag-grid 레이지로딩중 보이기
            this.gridApi.showLoadingOverlay();
        }
        const params = {
            startDate:this.state.startDate ? moment(this.state.startDate).format('YYYYMMDD'):null,
            endDate:this.state.endDate ? moment(this.state.endDate).format('YYYYMMDD'):null,
            searchMasterNo: this.state.searchMasterNo,
            searchUsed: this.state.searchUsed,
            searchDate: this.state.searchDate
        };
        const { status, data } = await getConsumerCouponList(params);

        if (status !== 200) {
            alert('응답이 실패 하였습니다');
            return;
        }

        this.setState({
            data: data
        })

        //ag-grid api
        if(this.gridApi) {
            //ag-grid 레이지로딩중 감추기
            this.gridApi.hideOverlay()
        }
    };

    onDatesChange = async (data) => {
        await this.setState({
            startDate: data.startDate,
            endDate: data.endDate,
            selectedGubun: data.gubun
        });
        // if(data.isSearch) {
        //     await this.search();
        // }
    }

    consumerSearch = async(withOrderInfo) => {
        let data;
        let status;
        if(withOrderInfo) {
            const result = await getConsumerAllCouponWithOrderInfo(this.state.searchConsumerNo);
            status = result.status;
            data = result.data;

        } else {
            const result = await getConsumerAllCoupon(this.state.searchConsumerNo);
            status = result.status;
            data = result.data;
        }

        if (status !== 200) {
            alert('응답이 실패 하였습니다');
            return;
        }

        if(data.length === 0) {
            alert('해당 소비자에게 발급된 쿠폰이 존재하지 않습니다.')
        }

        this.setState({
            data: data
        })
    }

    onChangeConsumerNo = (e) => {
        this.setState({
            searchConsumerNo: e.target.value
        })
    }

    onChangeMasterNo = (e) => {
        this.setState({
            searchMasterNo: e.target.value
        })
    }

    onSearchUsedChange = (e) => {
        let usedValue = null;
        if(e.target.value === 'true')
            usedValue = true;
        else if(e.target.value === 'false')
            usedValue = false;

        this.setState({
            searchUsed: usedValue
        })
    }

    toggleSise = () => {
        this.setState({ isSiseModalOpen: !this.state.isSiseModalOpen })
    }

    onSearchSise = () => {
        this.setState({
            isSiseModalOpen: true
        })
    }

    onSearchDateOptionChange = (param) => {
        let usedValue = null;

        if(param.value === 'usedDate') {
            usedValue = true;
        }

        this.setState({
            searchDate: param.value,
            searchUsed: usedValue
        })
    }

    copy = ({value}) => {
        ComUtil.copyTextToClipboard(value, '', '');
    }

    render() {
        return (
            <Div p={16}>
                <Div p={10} mb={10} bc={'secondary'}>
                    <Space>
                        <div className="pr-2" style={{width: '150px'}}>
                            <Select
                                name={'searchDateOption'}
                                options={this.state.searchDateOption}
                                value={this.state.searchDateOption.find(date => date.value === this.state.searchDate)}
                                onChange={this.onSearchDateOptionChange}
                            />
                        </div>

                        <Div> 기 간 </Div>
                        <SearchDates
                            gubun={this.state.selectedGubun}
                            startDate={this.state.startDate}
                            endDate={this.state.endDate}
                            onChange={this.onDatesChange}
                        />

                    </Space>
                    <Space mt={15}>
                        <Div> Master쿠폰 번호</Div>
                        <div>
                            <Input type="text" placeholder="쿠폰번호" value={this.state.searchMasterNo} onChange={this.onChangeMasterNo}/>
                        </div>

                        {this.state.searchDate === 'issuedDate' &&
                        <Space>
                            <Div> &nbsp; &nbsp; | &nbsp; &nbsp; 사용여부(2022년 2월 배포이후부터 조회가능) </Div>
                            <span>
                                <input defaultChecked type="radio" id="stateAll" name="state"
                                       onChange={this.onSearchUsedChange} value={'all'}/>
                                <label htmlFor="stateAll" className='pl-1 mr-3 mb-0'>전체</label>

                                <input type="radio" id="state1" name="state" onChange={this.onSearchUsedChange}
                                       value={true}/>
                                <label htmlFor="state1" className='pl-1 mr-3 mb-0'>사용완료</label>

                                <input type="radio" id="state2" name="state" onChange={this.onSearchUsedChange}
                                       value={false}/>
                                <label htmlFor="state2" className='pl-1 mr-3 mb-0'>미사용</label>
                            </span>
                        </Space>
                        }
                       <MenuButton onClick={() => this.search(true)}> 검 색 </MenuButton>
                    </Space>
                </Div>
                <Div p={10} mb={10} bc={'secondary'}>
                    <Space>
                        <Div> 특정소비자 쿠폰 검색(전체기간) </Div>
                        <div className='mr-2'>
                            <Input type="text" placeholder="소비자번호" value={this.state.searchConsumerNo} onChange={this.onChangeConsumerNo}/>
                        </div>
                        <MenuButton onClick={this.consumerSearch.bind(this, false)}> 검 색 </MenuButton>
                        <MenuButton onClick={this.consumerSearch.bind(this, true)}> 주문내역포함 검색 </MenuButton>
                    </Space>
                </Div>
                {/*<div>*/}
                {/*    <Flex bc={'secondary'} m={3} p={7}>*/}
                {/*        <Div pl={10} pr={20} py={1}> 기 간 (발급일) </Div>*/}
                {/*        <Div ml={10} >*/}
                {/*            <Flex>*/}
                {/*                <SearchDates*/}
                {/*                    gubun={this.state.selectedGubun}*/}
                {/*                    startDate={this.state.startDate}*/}
                {/*                    endDate={this.state.endDate}*/}
                {/*                    onChange={this.onDatesChange}*/}
                {/*                />*/}

                {/*                <Button className="ml-3" color="primary" onClick={() => this.search(true)}> 검 색 </Button>*/}
                {/*            </Flex>*/}
                {/*        </Div>*/}
                {/*    </Flex>*/}
                {/*</div>*/}
                <FilterContainer gridApi={this.gridApi} columnApi={this.columnApi} excelFileName={'쿠폰 지급목록'}>
                    <FilterGroup>
                        <InputFilter
                            gridApi={this.gridApi}
                            columns={[
                                {field: 'couponNo', name: '쿠폰NO', width: 80},
                                {field: 'name', name: '이름'},
                                {field: 'phone', name: '연락처'},
                                {field: 'email', name: 'Email'},
                                {field: 'couponTitle', name: '쿠폰명'},
                                {field: 'hexCouponNo', name: '일련번호'},
                                {field: 'issuedDate', name: '발급일'},
                            ]}
                            isRealTime={true}
                        />
                    </FilterGroup>
                    <Hr/>
                    <FilterGroup>
                        <CheckboxFilter
                            gridApi={this.gridApi}
                            field={'manualIssueFlag'}
                            name={'지급처'}
                            data={[
                                {value: '수동(관리자)', name: '수동(관리자)'},
                                {value: '자동', name: '자동'},
                            ]}
                        />
                        <CheckboxFilter
                            gridApi={this.gridApi}
                            field={'usedFlag'}
                            name={'사용여부'}
                            data={[
                                {value: '사용', name: '사용'},
                                {value: '미사용', name: '미사용'},
                            ]}
                        />
                    </FilterGroup>
                </FilterContainer>
                <Flex mb={10}>
                    <Div ml={10}>
                        <MenuButton onClick={this.onSearchSise}>일별시세조회</MenuButton>
                    </Div>
                    <Right>
                        총 {this.state.data.length} 건
                    </Right>
                </Flex>
                <div
                    id="myGrid"
                    className="ag-theme-balham"
                    style={{
                        height: '600px'
                    }}
                >
                    <AgGridReact
                        columnDefs={this.state.columnDefs}  //컬럼 세팅
                        defaultColDef={this.state.defaultColDef}
                        frameworkComponents={this.state.frameworkComponents}
                        overlayLoadingTemplate={this.state.overlayLoadingTemplate}
                        overlayNoRowsTemplate={this.state.overlayNoRowsTemplate}
                        onGridReady={this.onGridReady.bind(this)}   //그리드 init(최초한번실행)
                        rowData={this.state.data}
                        getRowHeight={35}
                        onCellDoubleClicked={this.copy}
                    >
                    </AgGridReact>
                </div>

                {
                    this.state.isSiseModalOpen &&
                    <Modal
                        isOpen={this.state.isSiseModalOpen}
                        toggle={this.toggleSise}
                        size="lg"
                        style={{maxWidth: '800px', width: '80%'}}
                        centered>
                        <ModalHeader toggle={this.toggleSise}>BLY 일별 시세 조회</ModalHeader>
                        <ModalBody>
                            <Suspense fallback={null}>
                                <BlySiseWithoutCoupon />
                            </Suspense>
                        </ModalBody>
                    </Modal>
                }
            </Div>
        )
    }
}

export default withRouter(ConsumerCouponList);