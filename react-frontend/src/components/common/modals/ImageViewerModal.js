import React, {useState, useRef, useEffect} from 'react';
import NewModalFull from "./NewModalFull";
import {useRecoilState} from "recoil";
import {imageViewerModalState} from "~/recoilState";
import {Button, Div, Fixed, Flex, Img} from "~/styledComponents/shared";
import {Server} from "~/components/Properties";
import {getValue} from "~/styledComponents/Util";
import {AiOutlinePlus, AiOutlineFullscreen, AiOutlineFullscreenExit} from 'react-icons/ai'
import useImageViewer from "~/hooks/useImageViewer";
import ImageSwiper from "~/components/common/swipers/ImageSwiper";


const ImageViewerModal = (props) => {
    const {isOpen, images, slideIndex, closeImageViewer} = useImageViewer()
    return (
        <NewModalFull isOpen={isOpen} onClose={closeImageViewer}>
            {
                //ImageSwiper를 강제로 클리어 하여 didMount 시키기 위해 널 체크
                // slideIndex !== null && (
                    <ImageSwiper images={images}
                                 initialSlide={slideIndex}
                    />
                // )
            }
        </NewModalFull>
    );
};


const ImageViewerModal_bak = (props) => {

    const {isOpen, images, closeImageViewer} = useImageViewer()
    const [size, setSize] = useState(1)

    const sizeChange = e => {
        if (size < 2) {
            setSize(size + 0.5)
        }else{
            setSize(1)
        }
    }
    const onClose = () => {
        setSize(1)
        closeImageViewer()
    }

    return (
        <NewModalFull isOpen={isOpen} onClose={onClose}>
            <Div custom={`                
                  width: 100%;  
                  height: 100vh;
                  display: flex;
                  flex-direction: column;
                  justify-content: center;
                  align-items: center;
           `}>
                <Div custom={`
                        width: 100%;
                        overflow: auto;
                
               `}>
                    {/*{*/}
                    {/*    images.map(image =>*/}
                    {/*        <img*/}
                    {/*            key={image.imageUrl}*/}
                    {/*            width={`${size * 100}%`}*/}
                    {/*            src={Server.getImageURL()+image.imageUrl}*/}
                    {/*            alt={image.imageNm}*/}
                    {/*        />*/}
                    {/*    )*/}
                    {/*}*/}
                    {
                        images.map(image =>
                            <StyledImage
                                key={image.imageUrl}
                                width={`${size * 100}%`}
                                src={Server.getImageURL()+image.imageUrl}
                                alt={image.imageNm}
                            />
                        )
                    }
                </Div>
            </Div>

            <Fixed left={30} bottom={70}>
                <Flex cursor justifyContent={'center'} width={60} height={60} fontSize={30} fg={'white'} bg={'rgba(0, 0, 0, 15%)'} bc={'white'} rounded={'50%'} onClick={sizeChange}>
                    {(size < 2) ? <AiOutlineFullscreen /> : <AiOutlineFullscreenExit />}
                </Flex>
            </Fixed>
        </NewModalFull>
    );
};

export default ImageViewerModal;

const StyledImage = React.memo(({width, src, alt}) =>
    <img
        width={width}
        src={src}
        alt={alt}
    />
)