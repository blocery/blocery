import React from 'react';
import {useRecoilState} from "recoil";
import {imageViewerModalState} from "~/recoilState";

const useImageViewer = (props) => {
    const [state, setState] = useRecoilState(imageViewerModalState)

    function openImageViewer(images, slideIndex = 0) {
        console.log({openImages: images, slideIndex})

        setState({
            isOpen: true,
            images: images,
            slideIndex: slideIndex
        })
    }
    function closeImageViewer() {
        setState({
            isOpen: false,
            images: [],
            slideIndex: null
        })
    }
    return {isOpen: state.isOpen, slideIndex: state.slideIndex, images: state.images, openImageViewer, closeImageViewer}
};

export default useImageViewer;
