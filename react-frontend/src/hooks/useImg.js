import React, {useEffect, useState} from 'react';
import ComUtil from "~/util/ComUtil";
import {TYPE_OF_IMAGE} from "~/lib/bloceryConst";

const useImg = (images, imageType, nullImage) => {
    const [imageUrl, setImageUrl] = useState(ComUtil.getFirstImageSrc(images, imageType))

    useEffect(() => {
        setImageUrl(ComUtil.getFirstImageSrc(images, imageType))
    }, [images])

    const onError = () => {
        if (nullImage) {
            setImageUrl(nullImage)
        }else{
            setImageUrl(ComUtil.getFirstImageSrc(images, TYPE_OF_IMAGE.THUMB))
        }
    }
    return {
        imageUrl,
        onError
    }
};

export default useImg;
