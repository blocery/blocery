import React, {useCallback} from 'react';
import {Div, Flex, GridColumns, Img} from "~/styledComponents/shared";
import vsIcon from '~/images/icons/etc/vs@3x.png'
import {withRouter} from 'react-router-dom'
const size = 'calc(50vmin - 16px - 5px)'


const VoteImageBox = React.memo(({src, alt}) =>
    <Div width={'100%'} height={'100%'} maxWidth={200} maxHeight={200}>
        <Img rounded={4} cover shadow={'sm'} src={src} alt={alt} />
    </Div>
)

const VoteCard = ({
                      writingId, src1, src2, alt1, alt2, url, startDate, endDate, title, runningFlag,
                      showCount = false,  //참여수, 댓글수, 조회수 표시 여부
                      onClick = () => null,
                      history
                  }) => {

    const onCardClick = useCallback(() => {
        history.push(`/community/boardVote/${writingId}`)
        onClick()
    }, [writingId])

    return (
        <Div p={16} >
            <Div onClick={onCardClick} cursor={1}>
                <Div relative
                    // display={'inline-block'}
                >

                    <Div relative maxWidth={408}>
                        {
                            !runningFlag &&
                            <Flex justifyContent={'center'} zIndex={2} rounded={4} absolute top={0} right={0} bottom={0} left={0} fontSize={40} fg={'white'} bg={'rgba(0,0,0, 0.5)'}>
                                <strong>{`투표 마감`}</strong>
                            </Flex>
                        }
                        {
                            /* VS 이미지 */
                            runningFlag &&
                            <Flex absolute center justifyContent={'center'}
                                  bg={'#ff4545'} rounded={'50%'}
                                  width={'15vmin'} height={'15vmin'}
                                  custom={`border: 3px solid white;`} zIndex={1}
                                  shadow={'md'}
                                  maxWidth={67}
                                  maxHeight={67}
                            >
                                <Img src={vsIcon} width={'70%'} height={'unset'}/>
                            </Flex>
                        }

                        <GridColumns repeat={2} colGap={8}>
                            {/* 정사각형 만드는 방법 */}
                            <Div custom={`                        
                            width: 100%;
                            position: relative;                                                                                    
                            &:after {
                                content: "";
                                display: block;
                                padding-bottom: 100%;
                            }
                            
                            & > div {
                                position: absolute;
                                width: 100%;
                                height: 100%;                           
                            }
                    `}>
                                <VoteImageBox src={src1} alt={alt1} />
                            </Div>
                            <Div custom={`                        
                            width: 100%;
                            position: relative;                                                        
                            &:after {
                                content: "";
                                display: block;
                                padding-bottom: 100%;
                            }
                            
                            & > div {
                                position: absolute;
                                width: 100%;
                                height: 100%;                           
                            }
                    `}>
                                <VoteImageBox src={src2} alt={alt2} />
                            </Div>
                        </GridColumns>
                    </Div>




                    {/*<GridColumns repeat={2} colGap={10}>*/}
                    {/*    <VoteImageBox src={src1} alt={alt1} />*/}
                    {/*    <VoteImageBox src={src2} alt={alt2} />*/}
                    {/*</GridColumns>*/}
                </Div>
                <Flex mt={16} flexWrap={'wrap'}>
                    <Div fontSize={13} bg={runningFlag ? 'green' : 'dark'} fg={'white'} bold rounded={2} px={8} py={3} mr={10}>
                        {runningFlag ? '진행중!!' : '마감 되었습니다'}
                    </Div>
                    {/* 날짜 ~ 날짜 */}
                    <Div fontSize={14} fg={runningFlag ? 'green' : 'dark'}>{startDate} ~ {endDate}</Div>
                </Flex>
                <Div fontSize={16} mt={12}>{title}<br/>당신의 선택은?</Div>

                {
                    showCount && (
                        <Flex fontSize={14} mt={12} fg={'dark'}>
                            <Div mr={10}>참여수:1,329</Div>
                            <Div mr={10}>댓글수:32,212</Div>
                            <Div>조회수:1,780</Div>
                        </Flex>
                    )
                }
            </Div>
        </Div>
    );
};

export default React.memo(withRouter(VoteCard));