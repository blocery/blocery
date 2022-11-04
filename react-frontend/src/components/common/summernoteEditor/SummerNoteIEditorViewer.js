import React from 'react';
import styled from 'styled-components'
const WrapDiv = styled.div`
    margin:0px !important;
    word-break: break-word;
    & img {
        max-width: 100%;
    }
    & iframe {
        max-width: 100%;
    }
`;
const SummerNoteIEditorViewer = ({width='100%',height,initialValue})=>{
    return <WrapDiv width={width} height={height} dangerouslySetInnerHTML={ {__html: initialValue} }></WrapDiv>;

}
export default SummerNoteIEditorViewer