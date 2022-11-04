import React from 'react';
import BoardCard from "~/components/common/cards/BoardCard";
import {Server} from "~/components/Properties";
import ComUtil from "~/util/ComUtil";

const BoardList = ({data, onRowClick, isFeed}) => {
    return null !== data && data.map(({writingId, images, jjalImages, content, repliesCount, boardType, consumerName, writeDate, profileInfo, stepIndex, consumerNo }) => {
        // let src;
        // if(contentImagesUrl && contentImagesUrl.length > 0) {
        //     const contentImageUrl = contentImagesUrl[0]
        //     if (contentImageUrl.indexOf('imagesContents') === -1) {
        //         src = contentImageUrl
        //     }else{
        //         src = Server.getImgTagServerURL() + contentImageUrl
        //     }
        // }

        return(
            <BoardCard
                key={writingId}
                writingId={writingId}
                //src={src}
                //alt={'editor first image'}
                content={content}
                images={images}
                jjalImages={jjalImages}
                repliesCount={repliesCount}
                boardType={boardType}
                writer={profileInfo.nickname}
                writeDate={writeDate}
                onClick={onRowClick}
                isFeed={isFeed} //생산자 Feed(재배이력포함) 여부
                stepIndex={stepIndex}
                consumerNo={consumerNo}
            />
        )
    }


    )
};

export default BoardList;
