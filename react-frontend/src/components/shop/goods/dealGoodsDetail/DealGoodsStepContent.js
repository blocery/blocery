import React from 'react'
import DealGoodsStepItem from './DealGoodsStepItem'
import {Div, Divider, Flex, Img, Space, Span} from "~/styledComponents/shared";
import {TargetStrokeLabel, EmptyBox} from '~/styledComponents/ShopBlyLayouts'
import TraceStart from '~/images/icons/renewal/trace_start.png'
import TraceProcessing from '~/images/icons/renewal/trace_processing.png'
import TracePacking from '~/images/icons/renewal/trace_packing.png'
import TraceShipping from '~/images/icons/renewal/trace_shipping.png'
import styled from 'styled-components'
import {STEP_NAME} from "~/store";
import {color} from "~/styledComponents/Properties";
import {IoIosArrowForward} from 'react-icons/io'

const Circle = styled(Div)`
    border: 4px solid ${color.green};
    
    ${props => 
        `
            border-color: ${color[props.color]};             
        `
    }
    
    border-radius: 50%;
    background: white;    
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    
    ${props => props.active ? `
        width: 70px;
        height: 70px;    
    ` : `
        width: 17px;
        height: 17px;    
    `}
    
    &:after {
        position: absolute;
        content: "${props => props.content}";
        top: 100%;
        margin-top: 8px;                        
        // width: max-content;
        display: inline-block;
        ${props => props.active ? `
            font-size: 15px;
            font-weight: bold;            
        ` : `
            font-size: 14px;
        `}
        
        ${props => `
            color: ${color[props.color]};             
        `}
                
    }
    
    
    
`


const DealGoodsStepContent = ({
                                  // goods,
                                  goodsSteps=[],
                                  // totalCount=0,
                                  // onMoreClick = () => null,
                                  // onGoodsStepSaved = ()=> null
                              }) => {

    const goodsFirstStepIdx = goodsSteps && goodsSteps.length > 0 && goodsSteps[0] && goodsSteps[0].stepIndex || 0;

    return(
        <Div>

            <Flex flexDirection={'column'} justifyContent={'center'} mt={25} mx={16} mb={25} minHeight={106} bg={'background'}>
                <Div fontSize={20} >
                    {
                        goodsFirstStepIdx === 0 && <>"현재 <Span fg={"green"} bold>{STEP_NAME[0]}단계</Span>에 있어요!"</>
                    }
                    {
                        goodsFirstStepIdx === 100 && <>"현재 <Span fg={"green"} bold><u>{STEP_NAME[100]}단계</u></Span>에 있어요!"</>
                    }
                    {
                        goodsFirstStepIdx === 200 && <>"현재 <Span fg={"green"} bold>{STEP_NAME[200]}단계</Span>에 있어요!"</>
                    }
                    {
                        goodsFirstStepIdx === 300 && <>"현재 <Span fg={"green"} bold>{STEP_NAME[300]}단계</Span>에 있어요!"</>
                    }
                </Div>
                <Div fontSize={17}>
                    {
                        goodsFirstStepIdx === 100 && <>열심히 재배 중이랍니다.</>
                    }
                    {
                        goodsFirstStepIdx === 200 && <>열심히 작업 중이랍니다.</>
                    }
                    {
                        goodsFirstStepIdx === 300 && <>곧 받아보실 수 있어요!</>
                    }
                </Div>
            </Flex>

            <Div px={55} pt={16} pb={38}>
                <Flex justifyContent={'space-between'}>
                    <Circle active={goodsFirstStepIdx === 0} content={STEP_NAME[0]} fg={'green'} color={'green'}>
                        {
                            goodsFirstStepIdx === 0 && <Img src={TraceStart} alt={''} width={'77%'} height={'77%'}/>
                        }
                    </Circle>
                    <span><IoIosArrowForward color={100 <= goodsFirstStepIdx ? color.green : color.secondary}/></span>
                    <Circle active={goodsFirstStepIdx === 100} content={STEP_NAME[100]} color={100 <= goodsFirstStepIdx ? 'green' : 'secondary'} >
                        {
                            goodsFirstStepIdx === 100 && <Img src={TraceProcessing} alt={''} width={'77%'} height={'77%'}/>
                        }
                    </Circle>
                    <span><IoIosArrowForward color={200 <= goodsFirstStepIdx ? color.green : color.secondary}/></span>
                    <Circle active={goodsFirstStepIdx === 200} content={STEP_NAME[200]} color={200 <= goodsFirstStepIdx ? 'green' : 'secondary'}>
                        {
                            goodsFirstStepIdx === 200 && <Img src={TracePacking} alt={''} width={'77%'} height={'77%'}/>
                        }
                    </Circle>
                    <span><IoIosArrowForward color={300 <= goodsFirstStepIdx ? color.green : color.secondary}/></span>
                    <Circle active={goodsFirstStepIdx === 300} content={STEP_NAME[300]} color={300 <= goodsFirstStepIdx ? 'green' : 'secondary'}>
                        {
                            goodsFirstStepIdx === 300 && <Img src={TraceShipping} alt={''} width={'77%'} height={'77%'}/>
                        }
                    </Circle>
                </Flex>
            </Div>

            <Div px={16}>
                <Divider height={1}/>
            </Div>

            <Div custom={`
                & > div {
                    border-bottom: 1px solid ${color.veryLight};
                }
                & > div:last-child {
                    border: 0;
                }
            `}>
            {
                goodsSteps && goodsSteps.length > 0 &&
                goodsSteps.map((dealGoodsStep, index) => (
                    <DealGoodsStepItem key={'dealGoodsStep'+index} {...dealGoodsStep} />
                ))
            }
            </Div>
            {
                goodsSteps.length <= 0 && <EmptyBox>생산이력 없습니다</EmptyBox>
            }
        </Div>
    )
}
export default DealGoodsStepContent