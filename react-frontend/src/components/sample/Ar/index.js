import React, { Suspense } from 'react'
const Ar = (props) => {
    return ( //for A-FRAME
        <model-viewer
            src="/3dtestContent/RECONLABS_sample.glb"
            //ios-src="/3dtestContent/RECONLABS_sample.usdz"
            ar ar-scale="fixed"
            ar-modes="webxr scene-viewer quick-look"
            camera-controls alt="A 3D model of an astronaut"
            environment-image="neutral"
            xr-environment
        >
        </model-viewer>
    )
};
export default Ar;