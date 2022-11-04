import React from 'react';
import styled from 'styled-components'
import {Server} from "~/components/Properties";
import useImageViewer from "~/hooks/useImageViewer";
import {getValue} from "~/styledComponents/Util";
import {color} from "~/styledComponents/Properties";

const Container = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: ${getValue(6)};
  
  & img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      cursor: pointer;
  }

  & > div{
    border-radius: ${getValue(8)};
    overflow: hidden;
    background: ${color.light};
  }
  
  & > div:nth-child(1) {
    grid-row: 1 / 3;
  }
  
  & > div:nth-child(2) {
    height: 100%;
  }
  
  & > div:nth-child(3) {
    height: 100%;
  }
`

const DividedGallery = ({images}) => {
    const {openImageViewer} = useImageViewer()
    const onClick = (index, e) => {
        e.stopPropagation()
        openImageViewer(images, index)
    }
    return (
        <Container>
            {
                images.map((image, index) =>
                    <div>
                        <img src={Server.getThumbnailURL('square') + image.imageUrl} alt={'매장푸드 전경'} onClick={onClick.bind(this, index)}/>
                    </div>
                )
            }
        </Container>
    );
};

export default DividedGallery;
