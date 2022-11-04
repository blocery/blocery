import React, {useState, useEffect} from 'react'
import {Div, FilterGroup, Flex, Hr, Right, Space, Span} from '~/styledComponents/shared'
import {AgGridReact} from "ag-grid-react";
import {Button, Modal, ModalBody, ModalHeader} from "reactstrap";
import FaqReg from "./FaqReg"
import {Cell, ModalConfirm} from "~/components/common";
import {delNoticeApi, getFaqList, delFaqApi} from '~/lib/adminApi'
import FilterContainer from "~/components/common/gridFilter/FilterContainer";
import InputFilter from "~/components/common/gridFilter/InputFilter";
import CheckboxFilter from "~/components/common/gridFilter/CheckboxFilter";
import ComUtil from "~/util/ComUtil";
import {MenuButton, SmButton} from "~/styledComponents/shared/AdminLayouts";
import FAQ_STORE from "~/components/shop/mypage/consumerCenter/FaqStore"

const storeCategory = Object.values(FAQ_STORE).filter(faq=>faq.hidden===false).map(faq => ({
    value: faq.faqType,
    name: faq.name
}))
const store = Object.values(FAQ_STORE).map(faq => ({
    value: faq.faqType,
    name: faq.name
}))
const FaqList = () => {
    const [faqList, setFaqList] = useState([]);
    const [isOpen, setIsOpen] = useState(false)
    const [faqData, setFaqData] = useState(null)
    const [gridApi, setGridApi] = useState(null)
    const [columnApi, setColumnApi] = useState()

    // const TYPE_STORE = { //=>FAQ_STORE로 변경
    //     myInfo : { faqType: 'myInfo', name: '나의정보'},
    //     order : { faqType: 'order', name: '주문/결제'},
    //     delivery : { faqType: 'delivery', name: '배송'},
    //     cancel : { faqType: 'cancel', name: '취소/반품/교환'},
    //     point : { faqType: 'point', name: '코인/포인트'},
    //     service : { faqType: 'service', name: '서비스/기타'},
    // };

    const [agGrid, setAgGrid] = useState({
        columnDefs: [
            {headerName: "번호", field: "faqNo", width: 70},
            {headerName: "타입", field: "faqType", cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}), cellRenderer: "typeRenderer", width: 150},
            {headerName: "제목", field: "title", cellRenderer: "titleRenderer", width: 300},
            {headerName: "등록날짜", field: "regDate", width: 150},
            {headerName: "수정날짜", field: "modDate", width: 150},
            {headerName: "삭제", cellRenderer: "delButtonRenderer", width: 100},
        ],
        defaultColDef: {
            width: 100,
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
        frameworkComponents: {
            typeRenderer: typeRenderer,
            titleRenderer: titleRenderer,
            delButtonRenderer: delButtonRenderer
        },
    })

    useEffect(() => {
        async function fetch(){
            await getData()
        }

        fetch();
    }, [])

    async function getData() {
        const {data} = await getFaqList('all');

        data.map( (item,index) => {
            let regDate = data[index].regDate ? ComUtil.utcToString(data[index].regDate,'YYYY-MM-DD HH:mm'):null;
            data[index].regDate = regDate;
            let modDate = data[index].modDate ? ComUtil.utcToString(data[index].modDate,'YYYY-MM-DD HH:mm'):null;
            data[index].modDate = modDate;
        });
        setFaqList(data);
    }

    function typeRenderer({value, data:rowData}) {
        return (
            <Cell>
                <div>{FAQ_STORE[rowData.faqType].name}</div>
            </Cell>
        )
    }

    function titleRenderer({value, data:rowData}) {
        return (
            <Cell textAlign="left">
                <div onClick={selectFaq.bind(this, rowData)} style={{color: 'blue'}}>
                    <u>{rowData.title}</u>
                </div>
            </Cell>
        );
    }

    function delButtonRenderer({value, data:rowData}) {
        return (
            <ModalConfirm title={'FAQ 삭제'} content={<div>선택한 FAQ를 삭제하시겠습니까?</div>} onClick={delFaq.bind(this, rowData.faqNo)}>
                <SmButton fg={'danger'}>삭제</SmButton>
            </ModalConfirm>
        )
        return (
            <Cell>
                <div style={{textAlign: 'center'}}>
                    <ModalConfirm title={'FAQ 삭제'} content={<div>선택한 FAQ를 삭제하시겠습니까?</div>} onClick={delFaq.bind(this, rowData.faqNo)}>
                        <Button block size='sm' color={'info'}>삭제</Button>
                    </ModalConfirm>
                </div>
            </Cell>
        );
    }

    //[이벤트] 그리드 로드 후 callback 이벤트
    const onGridReady = (params) => {
        //API init
        setGridApi(params.api)
        setColumnApi(params.columnApi)
    }

    const delFaq = async(faqNo, isConfirmed) => {
        if (isConfirmed) {
            console.log(faqNo)
            await delFaqApi(faqNo);
            await getData();
        }
    }

    function toggle(){
        setIsOpen(!isOpen)
    }

    const selectFaq = (faqData) => {
        setFaqData(faqData)
        toggle()
    }

    const regFaq = () => {
        setFaqData({});
        toggle()
    }

    const regFaqFinished = () => {
        toggle()
        getData();
    }


    return (
        <Div p={16}>

            {/* filter START */}
            <FilterContainer gridApi={gridApi} columnApi={columnApi} excelFileName={'FAQ 목록'}>
                <FilterGroup>
                    <InputFilter
                        gridApi={gridApi}
                        columns={[
                            {field: 'title', name: '제목'}
                        ]}
                        isRealTime={true}
                    />
                </FilterGroup>
                <Hr/>
                <FilterGroup>
                    <CheckboxFilter
                        gridApi={gridApi}
                        field={'faqType'}
                        name={'FAQ타입'}
                        data={storeCategory}
                    />
                </FilterGroup>
            </FilterContainer>
            {/* filter END */}

            <Flex mb={10}>
                <Space>
                    <MenuButton bg={'green'} onClick={regFaq}>FAQ 등록</MenuButton>
                </Space>
                <Right>

                </Right>
            </Flex>

            <div
                className="ag-theme-balham"
                style={{
                    height: '700px'
                }}
            >
                <AgGridReact
                    columnDefs={agGrid.columnDefs}
                    defaultColDef={agGrid.defaultColDef}
                    rowSelection={'single'}  //멀티체크 가능 여부
                    overlayLoadingTemplate={agGrid.overlayLoadingTemplate}
                    overlayNoRowsTempalte={agGrid.overlayNoRowsTemplate}
                    rowData={faqList}
                    // onRowClicked={selectNotice}
                    frameworkComponents={agGrid.frameworkComponents}
                    onGridReady={onGridReady.bind(this)}   //그리드 init(최초한번실행)
                />

                <Modal size="lg" isOpen={isOpen} toggle={toggle} className={''} centered>
                    <ModalHeader toggle={toggle}>FAQ</ModalHeader>
                    <ModalBody>
                        <FaqReg faqData={faqData} onClose={regFaqFinished}/>
                    </ModalBody>
                </Modal>
            </div>
        </Div>

    )
}

export default FaqList;