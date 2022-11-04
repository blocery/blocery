import React from 'react';
import BackNavigation from "~/components/common/navs/BackNavigation";
import {Img} from '~/styledComponents/shared'
import Img01 from '~/images/about/ssugssug/ssg_01.jpg'
import Img02 from '~/images/about/ssugssug/ssg_02.jpg'
import Img03 from '~/images/about/ssugssug/ssg_03.jpg'
import Img04 from '~/images/about/ssugssug/ssg_04.jpg'

const AboutSsugSsug = (props) => {
    return (
        <>
            <BackNavigation>쑥쑥이란?</BackNavigation>
            <Img src={Img01} />
            <Img src={Img02} />
            <Img src={Img03} />
            <Img src={Img04} />
        </>
    );
};

export default AboutSsugSsug;
