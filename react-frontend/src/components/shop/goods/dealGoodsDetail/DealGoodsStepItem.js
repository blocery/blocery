import React, {useState} from 'react'
import {Div, Span, Flex, Img, Right, Space, WhiteSpace, Link, Button} from '~/styledComponents/shared'
import ComUtil from '~/util/ComUtil'
import 'react-toastify/dist/ReactToastify.css'
import {Server} from "~/components/Properties";
import {withRouter} from 'react-router-dom'
import useImageViewer from "~/hooks/useImageViewer";
import loadable from "@loadable/component";
import {RiPlantFill} from 'react-icons/ri';
import {BiPackage} from 'react-icons/bi';
import {MdLocalShipping} from 'react-icons/md';
import {BadgeSharp} from "~/styledComponents/ShopBlyLayouts";
import {AiOutlineCodeSandbox} from 'react-icons/ai'
import {STEP_NAME} from "~/store";

const ArView = loadable(() => import('~/components/common/Ar'))

const DealGoodsStepItem = ({
                               goodsNo,
                               stepIndex, stepTitle, content, writeDate,
                               images, arGlbFile, arUsdzFile,
                               adminConfirm,
                               txHash,
                               history
                           }) => {

    const {openImageViewer} = useImageViewer()
    const [arOpen, setArOpen] = useState(false)

    const arOpenToggle = () => {
        setArOpen(!arOpen)
    }

    return (
        <Div py={30}>
            <Div px={16}>
                <Flex fontSize={13}>
                    <Div>
                        <Space>
                            <Space spaceGap={2}>
                                {
                                    stepIndex === 0 && <BadgeSharp bg={'green'}>{STEP_NAME[0]}</BadgeSharp>
                                }
                                {
                                    stepIndex === 100 && <BadgeSharp bg={'green'}>{STEP_NAME[100]}</BadgeSharp>
                                }
                                {
                                    stepIndex === 200 && <BadgeSharp bg={'green'}>{STEP_NAME[200]}</BadgeSharp>
                                }
                                {
                                    stepIndex === 300 && <BadgeSharp bg={'green'}>{STEP_NAME[300]}</BadgeSharp>
                                }
                                {
                                    (adminConfirm && txHash) && (
                                        <a href={`https://www.iostabc.com/tx/${txHash}`}>
                                            <BadgeSharp bg={'black'}>블록체인</BadgeSharp>
                                        </a>
                                    )
                                }
                            </Space>

                            <Div>
                                {stepTitle}
                            </Div>
                            <Span ml={8} fg={'dark'}>
                                {
                                    writeDate && ComUtil.timeFromNow(writeDate)
                                }
                            </Span>
                        </Space>
                    </Div>
                    <Right>
                        {
                            arGlbFile && arGlbFile.imageUrl && (
                                <Space spaceGap={3} onClick={arOpenToggle}>
                                    <AiOutlineCodeSandbox size={20}/>
                                    <div><u>
                                        {
                                            arOpen ? 'AR 닫기' : 'AR 보기'
                                        }
                                        </u></div>
                                </Space>
                            )
                        }
                    </Right>
                </Flex >
                <WhiteSpace mt={10}>
                    {content}
                </WhiteSpace>
                {
                    arOpen && (
                        <Div
                            bg={'background'}
                            mt={10}
                            rounded={4}
                        >
                            {
                                arGlbFile && arGlbFile.imageUrl &&
                                <div style={{width:'100%',maxWidth:'768px',height:'60vmin'}}>
                                    <ArView
                                        isTest={false}
                                        arSrc={arGlbFile.imageUrl}
                                        arIosSrc={arUsdzFile?arUsdzFile.imageUrl:null}
                                        arName={'A 3D model'} />
                                </div>
                            }
                        </Div>
                    )
                }
            </Div>
            <Flex overflow={'auto'}
                  mt={10}
                  alignItems={'flex-start'}
                  custom={`
                        & > img {
                            margin-right: 10px;                        
                        }
                        & > img:first-child {
                            margin-left: 16px;
                        }
                        & > img:last-child {
                            margin-right: 16px;
                        }
                `}
            >
                {
                    images && images.length > 0 && images.map((image, index) =>
                        <Img key={'imageGallery_'+index+'_'+image.imageUrl}
                             maxHeight={230}
                             cover
                             src={Server.getImageURL() + image.imageUrl}
                             onClick={openImageViewer.bind(this, images, index)}
                        />
                    )
                }
            </Flex>
        </Div>
    )
}
export default withRouter(DealGoodsStepItem)