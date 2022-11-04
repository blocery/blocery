import React, {useEffect, useRef, useState} from "react";
import {Div, Flex, Input, Right, Space} from "~/styledComponents/shared";
import {AgGridColumn, AgGridReact} from "ag-grid-react";
import {color} from "~/styledComponents/Properties";
import {getAllProducerGoods} from "~/lib/adminApi";
import AdminLayouts from "~/styledComponents/shared/AdminLayouts";
import {getValue} from "~/styledComponents/Util";
import {getGoodsByGoodsNo, getGoodsListByGoodsNos} from "~/lib/goodsApi";

const ModalContent = ({keyword, onClose}) => {

    const [__keyword, __setKeyword] = useState(keyword)
    const keywordRef = useRef();

    const [deliveryPlaceGubun, setDeliveryPlaceGubun] = useState('');

    const [data, setData] = useState(null);  //그리드 내에서 최초 로딩중을 표시 하려면 값이 없어야 한다.
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);

    useEffect(() => {

        async function fetch() {
            await searchData();
        }
        fetch()


        keywordRef.current.focus()

    }, [])

    // DB 조회
    const searchData = async () => {
        const {status, data} = await getGoodsListByGoodsNos([__keyword])
        console.log({__keyword, data})

        if (status === 200) {
            setData(data);
        }

        return data
    };


    const onChange = e => {
        __setKeyword(e.target.value)
    }

    const onGridReady = (params) => {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);

        searchData()
    };

    const onKeyDown = e => {
        if (e.keyCode === 13)
            searchData()
    }

    const onCellClick = ({data}) => {
        //TODO 이 부분만 바꿔서 쓰세요
        const {goodsNo: ___keyword, producerNo: ___code} = data
        // onClose({...data, ___keyword, ___code})

        onClose({
            ___keyword: ___keyword,
            ___code: ___code,
            data: data
        })
    }

    return(
        <Div p={16} custom={`
            & input {
                height: ${getValue(35)};
            }
        `}>
            <Div>
                <Flex p={16} bc={'#babfc7'}>
                    <Space>
                        <span>상품번호</span>
                        <Input ref={keywordRef} value={__keyword} onKeyDown={onKeyDown} onChange={onChange} style={{width: 200}} />
                    </Space>
                    <Right>
                        <AdminLayouts.MenuButton onClick={searchData} >검색</AdminLayouts.MenuButton>
                    </Right>
                </Flex>
                <div>
                    <div className="ag-theme-alpine" style={{height: 400, width: '100%'}}>
                        <AgGridReact
                            onGridReady={onGridReady}
                            rowData={data}
                            //컬럼을 컴포넌트로 사용 하고자 할때
                            // components={{
                            //     "dayRenderer": dayRenderer,
                            // }}
                            //셀을 커스텀 html 컴포넌트로 사용 하고자 할때
                            // frameworkComponents={{
                            //     "contentRenderer": ContentRenderer
                            // }}
                            //디폴트 컬럼속성 지정 : 전체 컬럼에 반영
                            defaultColDef={{
                                // initialWidth: 300,  //가로사이즈
                                sortable: true,     //정렬여부
                                resizable: true     //컬럼 사이즈 조절
                            }}
                            overlayLoadingTemplate={'<span class="ag-overlay-loading-center">...로딩중입니다...</span>'}
                            overlayNoRowsTemplate={'<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>'}
                        >
                            <AgGridColumn
                                pinned={'left'} //행고정 틀고정.
                                headerName={'상품번호'} field="goodsNo"
                                width={100}
                                cellStyle={{textAlign: 'center'}}
                            />
                            <AgGridColumn
                                pinned={'left'} //행고정 틀고정.
                                headerName={'생산자번호'} field="producerNo"
                                width={100}
                                cellStyle={{textAlign: 'center'}}
                            />
                            <AgGridColumn
                                headerName={'상품명'} width={150} field="goodsNm" cellStyle={{color: color.primary, textDecoration: 'underline'}}  onCellClicked={onCellClick} />
                        </AgGridReact>
                    </div>
                </div>
            </Div>


        </Div>
    )
}

export default ModalContent