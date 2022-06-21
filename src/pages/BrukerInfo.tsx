import React from "react";
import {hentInnloggetAnsattMiddleware} from "../brukerinfo";

const BrukerInfo = () => {
    return (
        <div className="App">
            <html>
            <head>
                <title>Page Title</title>
            </head>
            <body>
            {hentInnloggetAnsattMiddleware}
            </body>
            </html>
        </div>
    )
};
export default BrukerInfo;
