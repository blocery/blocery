import React, {useEffect, useState} from "react";
import {Div, Flex, Span} from "~/styledComponents/shared";
import {IoMdCloseCircle} from 'react-icons/io'
import {color} from "~/styledComponents/Properties";

// 연관단어 박스
const RelatedHashTag = ({tags, exceptedTags = [], maxHeight = 400, onClick}) => {

    const relatedTags = []
    const [display, setDisplay] = useState('block');

    tags.map(tag => {
        if(!exceptedTags.includes(tag)){
            relatedTags.push(tag)
        }
    })

    useEffect(() => {
        setDisplay('block')
    }, [tags])

    if(relatedTags.length <= 0)
        return null

    return(

        <Div relative display={display} bg={'white'}>
            <IoMdCloseCircle style={{position: 'absolute', zIndex: 2, top: 16, right: 16, cursor: 'pointer', color: color.secondary}} size={20} onClick={() => setDisplay('none')}/>
            <Div absolute top={0} left={0} right={0} width={'100%'} bc={'light'} bt={0}
                 maxHeight={maxHeight}
                 overflow={'auto'} zIndex={1} >
                <Flex flexDirection={'column'} alignItems={'flex-start'} bg={'white'} fg={'bly'} p={16} lineHeight={30}>
                    {
                        relatedTags.map(relatedTag => <Div cursor onClick={onClick.bind(this, relatedTag)}><Span mr={3}>#</Span>{relatedTag}</Div>)
                    }
                </Flex>
            </Div>
        </Div>
    )

    return(
        <Flex flexDirection={'column'} alignItems={'flex-start'} mt={10} bg={'white'} fg={'bly'} bc={'light'} p={16} rounded={10} lineHeight={30}>
            {
                relatedTags.map(relatedTag => <Div cursor onClick={onClick.bind(this, relatedTag)}><Span mr={3}>#</Span>{relatedTag}</Div>)
            }
        </Flex>
    )
}
export default RelatedHashTag