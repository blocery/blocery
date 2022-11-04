import React, {Component, useEffect, useState} from 'react';
import {Cell} from "~/components/common";
import {Div, FilterGroup, Hr, Button, Flex, Span, Right, Space, Input, WhiteSpace} from "~/styledComponents/shared";
import {Input as RSInput} from 'reactstrap'
import {getProducerTempList, updateProducerTempStatus, updateProducerTempAdminMemo} from "~/lib/adminApi"
import FilterContainer from "~/components/common/gridFilter/FilterContainer";
import InputFilter from "~/components/common/gridFilter/InputFilter";
import CheckboxFilter from "~/components/common/gridFilter/CheckboxFilter";
import {AgGridReact} from "ag-grid-react";
import ComUtil from '~/util/ComUtil'
import {Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import RequestContent from '~/components/outside/producerCenter/join/requestContent'
import ConsumerDetail from "~/components/common/contents/ConsumerDetail";
import {MenuButton} from "~/styledComponents/shared/AdminLayouts";
import {getProducerTemp} from "~/lib/producerApi";
import useInput from "~/hooks/useInput";
import {ToastContainer, toast} from "react-toastify";
import Textarea from 'react-textarea-autosize'
export default class ProducerJoinList extends Component{
    constructor(props) {
        super(props);
        this.state = {
            searchData: {
                joinStatus:'1'
            },
            data: [],
            columnDefs: [
                // {
                //     headerName: "No.", width: 50,
                //     valueGetter: function(params) {
                //         let rowNo = params.node.rowIndex + 1;
                //         return rowNo;
                //     }
                // },
                {headerName: "사업자등록번호", width: 150, field: "coRegistrationNo"},
                {headerName: "업체명", width: 120, field: "farmName", cellRenderer: "nameRenderer"},
                {headerName: "담당자명", width: 100, field: "charger"},
                {headerName: "담당자 연락처", width: 120, field: "chargerPhone", cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}), cellRenderer: "phoneRenderer"},
                {headerName: "담당자 이메일", width: 120, field: "chargerEmail", cellStyle:ComUtil.getCellStyle({cellAlign: 'center'})},
                {headerName: "업종", width: 100, field: "shopBizType"},
                // {headerName: "우편번호", width: 100, field: "shopZipNo", cellStyle:this.getCellStyle({cellAlign: 'center'})},
                // {headerName: "업체주소", width: 200, field: "shopAddress", cellStyle:this.getCellStyle({cellAlign: 'center'}), cellRenderer: "addressRenderer"},
                {headerName: "진행상태", field: "joinStatus", cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}), cellRenderer: "statusRenderer"},
                {
                    headerName: "신청날짜", field: "joinTimestamp", width: 200,
                    valueGetter: function(params) {
                        return (params.data.joinTimestamp ? ComUtil.utcToString(params.data.joinTimestamp,'YYYY-MM-DD HH:mm'):'')
                    }
                },
                {
                    headerName: "신청일시", field: "joinTimestamp", width: 200,
                    valueGetter: function(params) {
                        return (params.data.joinTimestamp ? ComUtil.utcToString(params.data.joinTimestamp,'YYYY-MM-DD HH:mm'):'')
                    }
                },{
                    headerName: "승인일시", field: "adminConfirmTimestamp", width: 200,
                    valueGetter: function(params) {
                        return (params.data.adminConfirmTimestamp ? ComUtil.utcToString(params.data.adminConfirmTimestamp,'YYYY-MM-DD HH:mm'):'')
                    }
                },



                {headerName: "반려사유", width: 150, field: "reason"},
                {headerName: "관리자메모", width: 150, field: "adminMemo"},


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
                statusRenderer: this.statusRenderer,
                addressRenderer: this.addressRenderer,
                // reasonRenderer: this.reasonRenderer,
                nameRenderer: this.nameRenderer,
                phoneRenderer: this.phoneRenderer
            },
            isOpen: false,
            clickedProducer : null
        }
    }

    async componentDidMount() {
        await this.search();

    }

    search = async () => {
        if (this.gridApi) {
            //ag-grid 레이지로딩중 보이기
            this.gridApi.showLoadingOverlay();
        }
        const searchData = this.state.searchData;
        const params = {
            joinStatus:searchData.joinStatus
        }
        const {status, data} = await getProducerTempList(params);
        if(status !== 200){
            alert('응답이 실패 하였습니다')
            return
        }
        console.log({data})

        this.setState({
            data: data,
            loading: false
        })
        //ag-grid api
        if(this.gridApi) {
            //ag-grid 레이지로딩중 감추기
            this.gridApi.hideOverlay()
        }

    }

    //[이벤트] 그리드 로드 후 callback 이벤트
    onGridReady(params) {
        //API init
        this.gridApi = params.api;
        this.columnApi = params.columnApi;

        // 리스트 조회
        this.search()
    }

    phoneRenderer = ({value, data:rowData}) => {
        if (!value) return null
        return (
            <Div>{ComUtil.phoneRegexChange(rowData.chargerPhone)}</Div>
        )

    }

    statusRenderer = ({value, data:rowData}) => {
        switch (rowData.joinStatus) {
            case 1:
                return '신청완료'
                break;
            case 2:
                return '반려'
                break;
            case 3:
                return '승인'
                break;
            case 4:
                return '가입완료'
                break;
            default:
                return '임시저장'
                break;
        }
    }

    addressRenderer = ({value, data:rowData}) => {
        return (
            <Div>{rowData.shopAddress} {rowData.shopAddressDetail}</Div>
        )
    }

    // reasonRenderer = ({value, data:rowData}) => {
    //     // if(rowData.joinStatus === 1) {
    //     //     return (
    //     //         <Flex>
    //     //             <Button bg={'green'} bc={'secondary'} fg={'white'} mr={2} onClick={this.onConfirmClick.bind(this, rowData)}>승인</Button>
    //     //             <Button bg={'secondary'} bc={'secondary'} onClick={this.onRejectClick.bind(this, rowData)}>반려</Button>
    //     //         </Flex>
    //     //     )
    //     // } else
    //     if(rowData.joinStatus === 2) {
    //         return (
    //             <Div>사유 : {rowData.reason}</Div>
    //         )
    //     } else {
    //         return ''
    //     }
    // }

    nameRenderer = ({value, data:rowData}) => {
        return (
            <Span fg={'primary'} onClick={this.onNameClick.bind(this, rowData)}><u>{rowData.farmName}</u></Span>
        )

    }

    onNameClick = (data) => {
        console.log(data)
        this.setState({
            isOpen: true,
            clickedProducer: data
        })
    }

    // 승인
    onConfirmClick = async (producer) => {
        if(!window.confirm(`입점을 승인하시겠습니까?`)) {
            return false
        } else {
            const {status, data} = await updateProducerTempStatus({
                ...producer,
                reason: '',
                joinStatus: 3
            })

            if(status === 200) {
                alert('입점 처리를 완료했습니다')
                this.toggle();
                await this.search();
            }
        }
    }

    // 반려
    onRejectClick = async (producer) => {
        const rejectReason = window.prompt('반려 사유를 입력해주세요.')

        if(!rejectReason) {
            alert('반려사유를 입력하셔야 합니다.')
            return
        }

        if(!window.confirm(`반려 처리 하시겠습니까? \n 사유 : ${rejectReason}`)) {
            return false
        } else {
            const {status, data} = await updateProducerTempStatus({
                ...producer,
                reason: rejectReason,
                joinStatus: 2
            })

            if(status === 200) {
                alert('입점 반려 처리를 완료했습니다')
                this.toggle();
                await this.search();
            }
        }
    }

    toggle = async () => {
        this.setState(prevState => ({
            isOpen: !prevState.isOpen
        }));
    }

    copy = ({value}) => {
        ComUtil.copyTextToClipboard(value, '', '');
    }

    // 조회할 change
    onStateChange = async (e) => {
        const searchData = Object.assign({},this.state.searchData);
        searchData.joinStatus = e.target.value
        this.setState({
            searchData
        });
    }

    render() {
        // if(this.state.data.length <= 0)
        //     return null;

        const clickedProducer = this.state.clickedProducer;

        return (
            <Div p={16}>

                <Flex p={10} mb={10} bc={'secondary'}>
                    <Space>
                        {/*{0: 임시저장 1: 신청완료(검토중) 2:반려 3:승인완료 4:가입완료}*/}
                        <RSInput type='select' name='select' style={{width: 200}} id='joinStatus' onChange={this.onStateChange}>
                            <option name='radio1' value='1' selected>신청완료</option>
                            <option name='radio0' value='0'>임시저장</option>
                            <option name='radio2' value='2'>반려</option>
                            <option name='radio3' value='3'>승인완료</option>
                            <option name='radio4' value='4'>가입완료</option>
                            <option name='radioAll' value='ALL'>전체</option>
                        </RSInput>
                        <MenuButton onClick={this.search}>검색</MenuButton>
                    </Space>
                </Flex>

                {/* filter START */}
                <FilterContainer gridApi={this.gridApi} columnApi={this.columnApi} excelFileName={'입점센터 목록'}>
                    <FilterGroup>
                        <InputFilter
                            gridApi={this.gridApi}
                            columns={[
                                {field: 'farmName', name: '업체명'},
                                {field: 'charger', name: '담당자명'},
                                {field: 'shopBizType', name: '업종 '},
                            ]}
                            isRealTime={true}
                        />
                    </FilterGroup>
                </FilterContainer>

                <Flex mb={10}>
                    <Space>

                    </Space>
                    <Right>
                        총 {this.state.data.length} 건
                    </Right>
                </Flex>
                <div className="p-1">
                    <div
                        className="ag-theme-balham"
                        style={{
                            height: '700px',
                        }}
                    >
                        <AgGridReact
                            columnDefs={this.state.columnDefs}  //컬럼 세팅
                            defaultColDef={this.state.defaultColDef}
                            getRowHeight={50}
                            overlayLoadingTemplate={this.state.overlayLoadingTemplate}
                            overlayNoRowsTemplate={this.state.overlayNoRowsTemplate}
                            rowData={this.state.data||null}
                            components={this.state.components}  //custom renderer 지정, 물론 정해져있는 api도 있음
                            frameworkComponents={this.state.frameworkComponents}
                            onGridReady={this.onGridReady.bind(this)}   //그리드 init(최초한번실행)
                            onCellDoubleClicked={this.copy}
                        >
                        </AgGridReact>

                    </div>
                </div>

                <Modal size="xl" isOpen={this.state.isOpen}
                       toggle={this.toggle} >
                    <ModalHeader toggle={this.toggle}>
                        생산자 입점신청서 상세
                    </ModalHeader>
                    <ModalBody className={'p-0'}>
                        <RequestAdminContent coRegistrationNo={clickedProducer ? clickedProducer.coRegistrationNo : null}/>
                        <RequestContent coRegistrationNo={clickedProducer ? clickedProducer.coRegistrationNo : null} onClose={this.toggle} />
                    </ModalBody>
                    <ModalFooter>
                        {
                            clickedProducer && clickedProducer.joinStatus === 1 &&
                            <Flex>
                                <MenuButton bg={'green'} fg={'white'} mr={9} onClick={this.onConfirmClick.bind(this, clickedProducer)} px={20}>승인</MenuButton>
                                <MenuButton bg={'danger'} mr={2} onClick={this.onRejectClick.bind(this, clickedProducer)} px={20}>반려</MenuButton>
                            </Flex>
                        }
                        <MenuButton onClick={this.toggle} px={20}>닫기</MenuButton>
                    </ModalFooter>
                </Modal>
            </Div>
        )
    }

}

const RequestAdminContent = ({coRegistrationNo}) => {

    const [updateMode, setUpdateMod] = useState(false)
    const [data, setData] = useState(null)
    const adminMemo = useInput()

    useEffect(() => {
        search()
    }, [])

    const search = async () => {
        const {data} = await getProducerTemp(coRegistrationNo);
        console.log(data);
        setData(data)
    }

    const onModClick = () => {
        adminMemo.setValue(data.adminMemo)
        setUpdateMod(!updateMode)
    }
    const onSaveClick = async () => {
        const params = {
            coRegistrationNo: coRegistrationNo,
            adminMemo: adminMemo.value
        }
        console.log({saveParams: params})

        await updateProducerTempAdminMemo(params)

        toast.success("저장 되었습니다.",{
            position: toast.POSITION.TOP_CENTER
        })

        search()

        setUpdateMod(!updateMode)
    }

    if (!data) return null

    return(
        <Div p={16}>
            <Flex>
                <Space flexGrow={1} spaceGap={25}>
                    <div><b>관리자용 메모 (생산자에게 노출되지 않습니다.)</b></div>
                    {
                        updateMode ? (
                                <>
                                    <Div cursor={1} onClick={() => setUpdateMod(false)}><b><u>취소</u></b></Div>
                                    <Div cursor={1} onClick={onSaveClick} fg={'green'}><b><u>저장</u></b></Div>
                                </>
                            ) :
                            <Div cursor={1} onClick={onModClick}><b><u>수정하기</u></b></Div>
                    }
                </Space>
                <Right flexShrink={0}>
                    <Space>
                        <Div fg={'dark'}>생산자 신청일시 : <Span fg={'black'}>{ComUtil.utcToString(data.joinTimestamp,'YYYY-MM-DD HH:mm')}</Span></Div>
                        <Div fg={'dark'}>관리자 승인일시 : <Span fg={'black'}>{ComUtil.utcToString(data.adminConfirmTimestamp,'YYYY-MM-DD HH:mm')}</Span></Div>
                    </Space>
                </Right>
            </Flex>
            <Div>
                {
                    updateMode ?
                        <Textarea
                            style={{width: '100%', minHeight: 50, borderRadius: 1, border: '1px solid rgba(0,0,0,.125)'}}
                            rows={5}
                            {...adminMemo}
                        />
                        : <WhiteSpace>{data.adminMemo}</WhiteSpace>
                }
            </Div>

            {/*<Space alignItems={'flex-start'}>*/}
            {/*    <Div flexShrink={0}>관리자 메모</Div>*/}
            {/*    <div>*/}
            {/*        {*/}
            {/*            updateMode ?*/}
            {/*                <Textarea*/}
            {/*                    style={{width: '100%', minHeight: 50, borderRadius: 1, border: '1px solid rgba(0,0,0,.125)'}}*/}
            {/*                    rows={5}*/}
            {/*                    {...adminMemo}*/}
            {/*                />*/}
            {/*                : data.adminMemo*/}
            {/*        }*/}
            {/*    </div>*/}
            {/*    <Div flexShrink={0}>*/}
            {/*        {*/}
            {/*            updateMode ?*/}
            {/*                <MenuButton onClick={onSaveClick} bg={'green'}>저장</MenuButton> :*/}
            {/*                <MenuButton onClick={onModClick}>수정</MenuButton>*/}
            {/*        }*/}
            {/*    </Div>*/}
            {/*    <Div flexShrink={0}>*/}
            {/*        {*/}
            {/*            updateMode && <MenuButton onClick={() => setUpdateMod(false)}>취소</MenuButton>*/}
            {/*        }*/}
            {/*    </Div>*/}
            {/*</Space>*/}
            {/*<Right flexShrink={0}>*/}
            {/*    <Space>*/}
            {/*        <div>생산자 신청일시 : {ComUtil.utcToString(data.joinTimestamp,'YYYY-MM-DD HH:mm')}</div>*/}
            {/*        <div>관리자 승인일시 : {ComUtil.utcToString(data.adminConfirmTimestamp,'YYYY-MM-DD HH:mm')}</div>*/}
            {/*    </Space>*/}
            {/*</Right>*/}
            {/*<ToastContainer/>*/}
        </Div>
    )
}