import React, {useEffect, useState, useRef} from 'react';
import {Button, Div, Flex, Input, Span} from "~/styledComponents/shared";
import {HiHashtag} from 'react-icons/hi'
import HashTagList from "~/components/common/hashTag/HashTagList";
import useTagSearch from "~/hooks/useTagSearch";
import {AiOutlinePlus} from 'react-icons/ai'
import loadable from "@loadable/component";
import ComUtil from "~/util/ComUtil";
const RelatedHashTag = loadable(() => import("./RelatedHashTag"))
const HashTagInput = (props) => {

    //recommended : 추천단어 구분. true면 파라미터로 받은 tag 에서 적당히 substring 하여 regex 함.
    const relatedTags = useTagSearch({initialLimit: props.limit || 5, recommended: false})

    const placeHolderText = props.placeHolder||'';

    const [tags, setTags] = useState(props.tags)

    const [display, setDisplay] = useState("block");

    const inputRef = useRef(null);
    const inputHiddenRef = useRef(null);

    const onKeyUp = e => {

        //# 제거
        if (e.target.value.indexOf('#') > -1) {
            e.target.value = ComUtil.replaceAll(e.target.value, '#', '')
            return
        }

        //space, enter, comma
        // if ([13, 32, 188].includes(keyCode)) {
        //keyCode는 deprecated되었음. 특히 모바일에서는 값으로 비교하는게 안전.
        if(e.target.value.indexOf(' ') > -1 || e.target.value.indexOf(',') > -1)
        {
            e.target.value = '';
            setInputInit();
            return
        }
        if(e.key === 'Enter'){
            addTag()
            e.target.value = '';
            setInputInit();
        }

        // setDisplay('block')
    }

    const onKeyPress = e => {

        //# 제거
        if (e.target.value.indexOf('#') > -1) {
            e.target.value = ComUtil.replaceAll(e.target.value, '#', '')
            return
        }

        //space, enter, comma
        // if ([13, 32, 188].includes(keyCode)) {
        //keyCode는 deprecated되었음. 특히 모바일에서는 값으로 비교하는게 안전.
        if(e.target.value.indexOf(' ') > -1 || e.target.value.indexOf(',') > -1){
            e.target.value = '';
            setInputInit();
            return
        }
        if(e.key === 'Enter'){
            addTag()
            setInputInit();
        }

        // setDisplay('block')
    }

    const onBlur = e => {
        // addTag()
        // e.target.value = '';
    }

    useEffect(() => {
        setTags(props.tags)
    }, [props.tags])

    const addTag = () => {
        const value = inputRef.current.value
        const tag = value.replace(' ', '').replace(',', '')

        if (tag && !tags.includes(tag.toLowerCase())) {
            const newTags = tags.concat(tag)
            setTags(newTags)
            props.onChange(newTags)

            //input 값이 이제 없기때문에 연관검색 강제 클리어
            relatedTags.setValue("");
            relatedTags.clear()
        }
    }

    const setInputInit = () => {
        inputHiddenRef.current.value="";
        inputRef.current.value="";
        inputHiddenRef.current.focus();
        inputRef.current.focus();
        relatedTags.setValue("");
    };

    const onAddClick = () => {
        addTag();
        //ios 13이상에서는 받침이 완료되지 않은 문자에 대해서 buffer에 저장되버립니다.
        // 받침까지 완료가 되어야만 제대로 출력이 되고, 아닌경우는 받침이 필요없지 않는한 이상한 현상을 겪게 됩니다.
        //숨겨진 input을 하나 두고 focus를 먼저 줘버리면 해당 buffer가 숨겨진 input으로 가버리고
        //다시 원래 input을 focus하면 쓸데없는 버퍼가 사라지게 됩니다.
        // 숨겨진 input focus 직후 원래 input focus
        setInputInit();
    }

    const onDeleteClick = ({index, tag}) => {
        const newTags = Object.assign([], tags)
        newTags.splice(index, 1)
        setTags(newTags)
        props.onChange(newTags)
    }

    const justAddTag = (tag) => {
        const newTags = tags.concat(tag)
        setTags(newTags)
        props.onChange(newTags)
        setInputInit();
        //input 값이 이제 없기때문에 연관검색 강제 클리어
        relatedTags.setValue("");
        relatedTags.clear()
    }

    return (
        <Div>
            <HashTagList tags={tags} onClick={onDeleteClick} />
            <Flex pt={10}>
                <Div relative flexGrow={1} custom={`                    
                    & > input {
                        border-top-right-radius: 0;
                        border-bottom-right-radius: 0;
                        border-right: 0;
                        padding-left: 40px;
                    }
                `}>
                    <Flex absolute top={0} left={0} width={45} height={45} justifyContent={'center'}><HiHashtag size={22}/></Flex>
                    {/*<Input ref={inputRef} autocomplete="off" block onKeyUp={onKeyUp} onChange={relatedTags.onChange} placeholder={placeHolderText?placeHolderText:'연관 단어는 무엇인가요?'}/>*/}
                    <Input ref={inputRef} autocomplete="off" block
                           onKeyUp={!ComUtil.isMobileAppIos() ? onKeyUp:null}
                           onKeyPress={ComUtil.isMobileAppIos() ? onKeyPress:null}
                           onChange={relatedTags.onChange} onBlur={onBlur} placeholder={placeHolderText?placeHolderText:'연관 단어는 무엇인가요?'}/>
                    <input type={'hidden'} ref={inputHiddenRef} />
                </Div>
                <Button p={0}
                        width={45}
                        height={45}
                        // height={50}
                        textAlign={'center'} bg={'white'} fg={'black'} bc={'light'} custom={`
                    // height: 45px;
                    border-top-left-radius: 0;
                    border-bottom-left-radius: 0;                    
                `} onClick={onAddClick}>
                    <AiOutlinePlus />
                </Button>
            </Flex>
            <Div relative>
                <RelatedHashTag
                    tags={relatedTags.tags}
                    exceptedTags={tags}
                    onClick={justAddTag}/>
            </Div>
            {/*<Div relative display={display}>*/}
            {/*    {*/}
            {/*        (relatedTags.tags && relatedTags.tags.length > 0) && (*/}
            {/*            <Div absolute top={0} left={0} right={0} width={'100%'} bc={'light'} bt={0} maxHeight={100} overflow={'auto'}>*/}
            {/*                <RelatedHashTag*/}
            {/*                    tags={relatedTags.tags}*/}
            {/*                                exceptedTags={tags}*/}
            {/*                                onClick={justAddTag}/>*/}
            {/*            </Div>*/}
            {/*        )*/}
            {/*    }*/}
            {/*</Div>*/}
        </Div>
    );
};

export default HashTagInput;


