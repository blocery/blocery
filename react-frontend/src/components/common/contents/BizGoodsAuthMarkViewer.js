import React, {useState, useEffect} from 'react'
import {Button, Div, Divider, Fixed, Flex, GridColumns, Span} from "~/styledComponents/shared";
import {AuthMark} from '~/components/common'
import {getGoodsByGoodsNo} from "~/lib/goodsApi";
import {getProducerByProducerNo} from "~/lib/producerApi";
import adminApi, {updateGoodsAuthMark, updateGoodsTagsArFile} from "~/lib/adminApi";
import {Col, Container, Fade, FormGroup, Label, Row} from "reactstrap";
import {StandardButton} from "~/components/common/ImageUploader/SingleFileUploader";
import {Server} from "~/components/Properties";
import axios from "axios";

const BizGoodsAuthMarkViewer = ({goodsNo, onClose = () => null}) => {

    const [goods, setGoods] = useState(null)

    useEffect(() => {
        if (goodsNo)
            search()
    }, [])

    const search = async () => {
        const {data: goods, status} = await getGoodsByGoodsNo(goodsNo)
        if (status === 200) {
            setGoods(goods)
        }
    }

    // 인증마크 온체인지 이벤트
    const onAuthMarkChange = (data) => {
        if(data) {
            setGoods({...goods,authMarkInfo:data})
        }
    }

    const onFileDownloadClick = async (file) => {
        getDownLoad(file);
    }

    const getDownLoad = async (file) => {
        const fileUrl = Server.getFileServerURL()+file.filePath;
        axios.get(fileUrl,{
            responseType: 'blob'
        },{
            withCredentials: true, credentials: 'same-origin'
        }).then((response) => {
            // 다운로드(서버에서 전달 받은 데이터) 받은 바이너리 데이터를 blob으로 변환합니다.
            const blob = new Blob([response.data]);

            // 가상 링크 DOM 만들어서 다운로드 실행
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.style.display = "none";
            a.download = file.fileName
            document.body.appendChild(a)
            a.click()
            a.remove();
            window.URL.revokeObjectURL(url)
        });
    }

    const onSaveClick = async() => {
        const saveGoods = {...goods}
        await adminApi.updateGoodsAuthMark(saveGoods)
        onClose()
    }

    if(!goods) return null;
    return (
        <Div bg={'white'}>

            <Div p={16}>

                <Div mt={2} px={16} py={10}>
                    생산자:{goods && goods.producerFarmNm}, 상품번호:{goods && goods.goodsNo}, 상품명:{goods && goods.goodsNm}
                </Div>

                <Div mt={2} px={16} py={10} bg={'bly'} fg={'white'}>
                    인증마크 서류
                </Div>
                <Div bg={'white'} bc={'secondary'} p={16} lineHeight={30}>
                    {
                        goods && goods.authFiles && goods.authFiles.map((file, index) => {
                            if(file) {
                                return (
                                    <FormGroup inline>
                                        <Row>
                                            <Col sm={12}>
                                                {file.fileName}
                                                {
                                                    (file && file.filePath) &&
                                                    <StandardButton ml={5}
                                                                    onClick={onFileDownloadClick.bind(this, file)}>다운로드</StandardButton>
                                                }
                                            </Col>
                                        </Row>
                                    </FormGroup>
                                )
                            }
                        })
                    }
                    {
                        goods && goods.authFiles && goods.authFiles.filter(file=>file!=null).length == 0 && <Span>서류가 없습니다.</Span>
                    }
                </Div>

                <Div mt={10}>
                    <AuthMark
                        isPrint={false}
                        infoValues={goods && goods.authMarkInfo}
                        onChange={onAuthMarkChange}
                    />
                </Div>

                <Div textAlign={'center'} my={20}>
                    <Button px={10} bg={'green'} fg={'white'} onClick={onSaveClick}>저장</Button>
                </Div>
            </Div>

        </Div>
    );
};

export default BizGoodsAuthMarkViewer;
